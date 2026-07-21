import AsyncStorage from "@react-native-async-storage/async-storage";
import { cityForArea, cityForId } from "../data/cityIndex";
import { publicCrimeSourceForCity, type PublicCrimeSource } from "./crime";
import { sourceConfigurationForCity } from "./registry";
import { publicServiceRequestSourceForCity, summarizeServiceRequestAggregates, type PublicServiceRequestSource, type ServiceRequestAggregateRow } from "./serviceRequests";
import type { AirQualityCategory, AirQualitySummary, City, CityDataConnector, CityOverviewData, CrimeTrendSummary, DataSourceStatus, Demographics, EmergencyAlert, ServiceRequestSummary, SourceMeta, WeatherSummary } from "./types";
import { sourceStatus } from "./utils";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 1_000_000;
const CACHE_FRESH_MS = 15 * 60 * 1000;
const CACHE_MAX_STALE_MS = 6 * 60 * 60 * 1000;
const CACHE_PREFIX = "citypeak:city-overview:v1:";

type JsonRecord = Record<string, unknown>;
type CacheEntry = { savedAt: string; value: CityOverviewData };
const memoryCache = new Map<string, { expiresAt: number; entry: CacheEntry }>();
const pendingRequests = new Map<string, Promise<CityOverviewData>>();

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function limitedText(value: unknown, maximum = 300) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maximum) : undefined;
}

function validNumber(value: unknown, min: number, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : undefined;
}

function validDate(value: unknown) {
  const text = limitedText(value, 40);
  return text && Number.isFinite(new Date(text).valueOf()) ? new Date(text).toISOString() : undefined;
}

function safeHttpsUrl(value: unknown, allowedHosts?: readonly string[]) {
  const text = limitedText(value, 2_000);
  if (!text) return undefined;
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "https:" || (allowedHosts && !allowedHosts.includes(parsed.hostname))) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function source(cityId: string, dataType: string, providerId: string, url: string, status: DataSourceStatus["status"], error?: string) {
  return sourceStatus(cityId, dataType, providerId, url, status, error);
}

async function fetchJson(url: string, allowedHosts: readonly string[]) {
  const safeUrl = safeHttpsUrl(url, allowedHosts);
  if (!safeUrl) throw new Error("invalid_provider_url");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(safeUrl, { headers: { Accept: "application/geo+json, application/json" }, signal: controller.signal });
    if (!response.ok) throw new Error(`http_${response.status}`);
    const headerLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(headerLength) && headerLength > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    const body = await response.text();
    if (body.length > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    try {
      return JSON.parse(body) as unknown;
    } catch {
      throw new Error("invalid_json");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function toCity(reference: string): City {
  const item = cityForId(reference) || cityForArea(reference);
  if (!item) return { id: `us-unknown-${reference.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: reference.trim() || "Selected city", stateCode: "US" };
  return { id: item.id, name: item.city, stateCode: item.state, stateFips: item.stateFips, placeFips: item.placeFips, latitude: item.latitude, longitude: item.longitude, timezone: item.timezone };
}

function hasValidCoordinates(city: City) {
  return validNumber(city.latitude, -90, 90) !== undefined && validNumber(city.longitude, -180, 180) !== undefined;
}

const weatherConnector: CityDataConnector<WeatherSummary> = {
  providerId: "nws",
  async supports(city) { return hasValidCoordinates(city); },
  async fetch(city) {
    const pointUrl = `https://api.weather.gov/points/${city.latitude},${city.longitude}`;
    const point = await fetchJson(pointUrl, ["api.weather.gov"]);
    const properties = isRecord(point) && isRecord(point.properties) ? point.properties : undefined;
    const forecastUrl = safeHttpsUrl(properties?.forecastHourly, ["api.weather.gov"]);
    if (!forecastUrl) throw new Error("invalid_nws_response");
    const forecast = await fetchJson(forecastUrl, ["api.weather.gov"]);
    const forecastProperties = isRecord(forecast) && isRecord(forecast.properties) ? forecast.properties : undefined;
    const rawPeriods = Array.isArray(forecastProperties?.periods) ? forecastProperties.periods.filter(isRecord) : [];
    if (!rawPeriods.length) throw new Error("invalid_nws_forecast");
    const periods = rawPeriods.slice(0, 4).map((period, index) => ({
      label: limitedText(period.name, 80) || `Forecast ${index + 1}`,
      temperature: validNumber(period.temperature, -150, 150),
      unit: limitedText(period.temperatureUnit, 3),
      summary: limitedText(period.shortForecast, 140),
    }));
    const first = periods[0];
    const checked = new Date().toISOString();
    return {
      temperature: first.temperature,
      unit: first.unit,
      shortForecast: first.summary,
      forecast: periods,
      source: { name: "National Weather Service", url: forecastUrl, status: { ...source(city.id, "weather", "nws", forecastUrl, "healthy"), lastSuccessfulFetchAt: checked, expectedUpdateFrequency: "15–30 minutes" } },
    };
  },
};

const demographicsConnector: CityDataConnector<Demographics> = {
  providerId: "census-acs",
  async supports(city) { return Boolean(city.stateFips && city.placeFips); },
  async fetch(city) {
    const url = `https://api.census.gov/data/2024/acs/acs5?get=NAME,B01003_001E,B19013_001E,B01002_001E,B25077_001E&for=place:${city.placeFips}&in=state:${city.stateFips}`;
    const rows = await fetchJson(url, ["api.census.gov"]);
    if (!Array.isArray(rows) || !Array.isArray(rows[0]) || !Array.isArray(rows[1])) throw new Error("invalid_census_response");
    const [, population, income, age, homeValue] = rows[1];
    const demographics = {
      population: validNumber(population, 0, 1_000_000_000),
      medianHouseholdIncome: validNumber(income, 0, 100_000_000),
      medianAge: validNumber(age, 0, 125),
      medianHomeValue: validNumber(homeValue, 0, 100_000_000),
    };
    if (!Object.values(demographics).some((value) => value !== undefined)) throw new Error("invalid_census_values");
    const checked = new Date().toISOString();
    return { ...demographics, source: { name: "U.S. Census Bureau ACS 2024 5-year", url, status: { ...source(city.id, "demographics", "census-acs", url, "healthy"), lastSuccessfulFetchAt: checked, dataPeriodStart: "2020", dataPeriodEnd: "2024", expectedUpdateFrequency: "Annual" } } };
  },
};

export function airQualityCategory(aqi: number): AirQualityCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

const airQualityConnector: CityDataConnector<AirQualitySummary> = {
  providerId: "open-meteo-cams-air-quality",
  async supports(city) { return hasValidCoordinates(city); },
  async fetch(city) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.latitude}&longitude=${city.longitude}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=auto`;
    const data = await fetchJson(url, ["air-quality-api.open-meteo.com"]);
    const current = isRecord(data) && isRecord(data.current) ? data.current : undefined;
    const usAqi = validNumber(current?.us_aqi, 0, 500);
    if (usAqi === undefined) throw new Error("invalid_air_quality_response");
    const observedAt = limitedText(current?.time, 40);
    const timezone = limitedText(isRecord(data) ? data.timezone_abbreviation : undefined, 24);
    const checked = new Date().toISOString();
    return {
      usAqi: Math.round(usAqi),
      category: airQualityCategory(usAqi),
      pm25: validNumber(current?.pm2_5, 0, 2_000),
      pm10: validNumber(current?.pm10, 0, 2_000),
      ozone: validNumber(current?.ozone, 0, 2_000),
      nitrogenDioxide: validNumber(current?.nitrogen_dioxide, 0, 2_000),
      observedAt: observedAt ? `${observedAt.replace("T", " ")}${timezone ? ` ${timezone}` : ""}` : undefined,
      geographicScope: "air_quality_model_grid",
      source: {
        name: "Open-Meteo / CAMS air-quality model",
        url: "https://open-meteo.com/en/docs/air-quality-api",
        status: { ...source(city.id, "air_quality", "open-meteo-cams-air-quality", url, "healthy"), lastSuccessfulFetchAt: checked, expectedUpdateFrequency: "Model updates every 12 hours" },
      },
    };
  },
};

function sevenDayWindow() {
  const end = new Date();
  const start = new Date(end.valueOf() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

function aggregateServiceRequestUrl(configuration: PublicServiceRequestSource, start: Date) {
  const url = new URL(configuration.endpoint);
  const select = `${configuration.statusField},${configuration.categoryField},count(*) as count`;
  const groupBy = `${configuration.statusField},${configuration.categoryField}`;
  if (configuration.kind === "socrata") {
    const timestamp = start.toISOString().replace(/\.\d{3}Z$/, "");
    url.searchParams.set("$select", select);
    url.searchParams.set("$where", `${configuration.createdAtField} >= '${timestamp}'`);
    url.searchParams.set("$group", groupBy);
    url.searchParams.set("$order", "count DESC");
    url.searchParams.set("$limit", "100");
  } else {
    const date = start.toISOString().slice(0, 10);
    url.searchParams.set("select", select);
    url.searchParams.set("where", `${configuration.createdAtField} >= date'${date}'`);
    url.searchParams.set("group_by", groupBy);
    url.searchParams.set("order_by", "count desc");
    url.searchParams.set("limit", "100");
  }
  return url.toString();
}

function aggregateRows(data: unknown, configuration: PublicServiceRequestSource): ServiceRequestAggregateRow[] {
  const entries = configuration.kind === "opendatasoft" && isRecord(data) && Array.isArray(data.results)
    ? data.results.filter(isRecord)
    : Array.isArray(data) ? data.filter(isRecord) : [];
  return entries.flatMap((entry) => {
    const category = limitedText(entry[configuration.categoryField], 120);
    const status = limitedText(entry[configuration.statusField], 120);
    const count = validNumber(entry.count, 0, 1_000_000_000);
    return category && status && count !== undefined && Number.isSafeInteger(count) ? [{ category, status, count }] : [];
  });
}

const serviceRequestConnector: CityDataConnector<ServiceRequestSummary> = {
  providerId: "official-city-open-data",
  async supports(city) { return Boolean(publicServiceRequestSourceForCity(city.id)); },
  async fetch(city) {
    const configuration = publicServiceRequestSourceForCity(city.id);
    if (!configuration) throw new Error("unsupported_city");
    const { start, end } = sevenDayWindow();
    const url = aggregateServiceRequestUrl(configuration, start);
    const raw = await fetchJson(url, [configuration.host]);
    const summary = summarizeServiceRequestAggregates(aggregateRows(raw, configuration));
    if (!summary) throw new Error("invalid_service_request_summary");
    const checked = new Date().toISOString();
    return {
      ...summary,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      geographicScope: "city",
      source: {
        name: configuration.name,
        url: configuration.sourceUrl,
        status: { ...source(city.id, "service_requests", configuration.providerId, configuration.sourceUrl, "healthy"), lastSuccessfulFetchAt: checked, dataPeriodStart: start.toISOString(), dataPeriodEnd: end.toISOString(), expectedUpdateFrequency: configuration.expectedUpdateFrequency },
      },
    };
  },
};

function crimeLatestDateUrl(configuration: PublicCrimeSource) {
  const url = new URL(configuration.endpoint);
  if (configuration.kind === "socrata") url.searchParams.set("$select", `max(${configuration.dateField}) as latest_date`);
  else {
    url.searchParams.set("select", `max(${configuration.dateField}) as latest_date`);
    url.searchParams.set("limit", "1");
  }
  return url.toString();
}

function crimeDailyAggregateUrl(configuration: PublicCrimeSource, start: Date, endExclusive: Date) {
  const url = new URL(configuration.endpoint);
  const select = `${configuration.dateField},count(*) as count`;
  if (configuration.kind === "socrata") {
    const iso = (value: Date) => value.toISOString().replace(/\.\d{3}Z$/, "");
    url.searchParams.set("$select", select);
    url.searchParams.set("$where", `${configuration.dateField} >= '${iso(start)}' AND ${configuration.dateField} < '${iso(endExclusive)}'`);
    url.searchParams.set("$group", configuration.dateField);
    url.searchParams.set("$order", `${configuration.dateField} ASC`);
    url.searchParams.set("$limit", "100");
  } else {
    const date = (value: Date) => value.toISOString().slice(0, 10);
    url.searchParams.set("select", select);
    url.searchParams.set("where", `${configuration.dateField} >= date'${date(start)}' and ${configuration.dateField} < date'${date(endExclusive)}'`);
    url.searchParams.set("group_by", configuration.dateField);
    url.searchParams.set("order_by", `${configuration.dateField} asc`);
    url.searchParams.set("limit", "100");
  }
  return url.toString();
}

function recordsFromAggregate(data: unknown, kind: PublicCrimeSource["kind"]) {
  if (kind === "opendatasoft" && isRecord(data) && Array.isArray(data.results)) return data.results.filter(isRecord);
  return Array.isArray(data) ? data.filter(isRecord) : [];
}

function dateFromCrimeAggregate(data: unknown, configuration: PublicCrimeSource) {
  const value = recordsFromAggregate(data, configuration.kind)[0]?.latest_date;
  const valid = validDate(value);
  if (!valid) throw new Error("invalid_crime_latest_date");
  return new Date(valid);
}

function countCrimeAggregate(data: unknown, configuration: PublicCrimeSource, currentStart: Date) {
  return recordsFromAggregate(data, configuration.kind).reduce((total, row) => {
    const date = validDate(row[configuration.dateField]);
    const count = validNumber(row.count, 0, 1_000_000_000);
    if (!date || count === undefined || !Number.isSafeInteger(count)) return total;
    return new Date(date).valueOf() >= currentStart.valueOf() ? total + count : total;
  }, 0);
}

const CRIME_PERIOD_DAYS = 28;
const crimeTrendConnector: CityDataConnector<CrimeTrendSummary> = {
  providerId: "official-police-open-data",
  async supports(city) { return Boolean(publicCrimeSourceForCity(city.id)); },
  async fetch(city) {
    const configuration = publicCrimeSourceForCity(city.id);
    if (!configuration) throw new Error("unsupported_city");
    const latestRaw = await fetchJson(crimeLatestDateUrl(configuration), [configuration.host]);
    const reportingThrough = dateFromCrimeAggregate(latestRaw, configuration);
    const endExclusive = new Date(reportingThrough.valueOf() + 24 * 60 * 60 * 1000);
    const currentStart = new Date(endExclusive.valueOf() - CRIME_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const priorStart = new Date(currentStart.valueOf() - CRIME_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const aggregate = await fetchJson(crimeDailyAggregateUrl(configuration, priorStart, endExclusive), [configuration.host]);
    const currentCount = countCrimeAggregate(aggregate, configuration, currentStart);
    const priorCount = countCrimeAggregate(aggregate, configuration, priorStart) - currentCount;
    if (currentCount < 0 || priorCount < 0) throw new Error("invalid_crime_summary");
    const checked = new Date().toISOString();
    const lagDays = Math.floor((Date.now() - reportingThrough.valueOf()) / (24 * 60 * 60 * 1000));
    const health: DataSourceStatus["status"] = lagDays > 35 ? "limited" : "healthy";
    return {
      currentCount,
      priorCount,
      percentageChange: priorCount > 0 ? ((currentCount - priorCount) / priorCount) * 100 : undefined,
      periodStart: currentStart.toISOString(),
      periodEnd: endExclusive.toISOString(),
      priorPeriodStart: priorStart.toISOString(),
      priorPeriodEnd: currentStart.toISOString(),
      reportingThrough: reportingThrough.toISOString(),
      geographicScope: "police_jurisdiction",
      source: { name: configuration.name, url: configuration.sourceUrl, status: { ...source(city.id, "crime", configuration.providerId, configuration.sourceUrl, health, health === "limited" ? "source_reporting_delay" : undefined), lastSuccessfulFetchAt: checked, sourceLastModifiedAt: reportingThrough.toISOString(), dataPeriodStart: currentStart.toISOString(), dataPeriodEnd: endExclusive.toISOString(), expectedUpdateFrequency: configuration.expectedUpdateFrequency } },
    };
  },
};

async function fetchAlerts(city: City): Promise<{ alerts: EmergencyAlert[]; status: DataSourceStatus }> {
  if (!hasValidCoordinates(city)) return { alerts: [], status: source(city.id, "alerts", "nws", "https://api.weather.gov/alerts", "limited", "missing_coordinates") };
  const url = `https://api.weather.gov/alerts/active?point=${city.latitude},${city.longitude}`;
  const data = await fetchJson(url, ["api.weather.gov"]);
  const features = isRecord(data) && Array.isArray(data.features) ? data.features.filter(isRecord) : [];
  const now = Date.now();
  const seen = new Set<string>();
  const alerts = features.flatMap((feature, index) => {
    const properties = isRecord(feature.properties) ? feature.properties : {};
    const id = limitedText(feature.id, 180) || `${city.id}:alert:${index}`;
    const expires = validDate(properties.expires);
    if (seen.has(id) || (expires && new Date(expires).valueOf() <= now)) return [];
    seen.add(id);
    return [{
      id,
      event: limitedText(properties.event, 160) || "Weather alert",
      severity: limitedText(properties.severity, 80),
      urgency: limitedText(properties.urgency, 80),
      certainty: limitedText(properties.certainty, 80),
      affectedAreas: limitedText(properties.areaDesc, 320),
      headline: limitedText(properties.headline, 500),
      effective: validDate(properties.effective),
      expires,
      url: safeHttpsUrl(properties.web, ["api.weather.gov", "www.weather.gov", "alerts.weather.gov"]),
    }];
  });
  return { alerts, status: { ...source(city.id, "alerts", "nws", url, "healthy"), lastSuccessfulFetchAt: new Date().toISOString(), expectedUpdateFrequency: "Every few minutes" } };
}

async function optional<T extends { source: SourceMeta }>(connector: CityDataConnector<T>, city: City, type: string) {
  if (!(await connector.supports(city))) return { value: undefined, status: source(city.id, type, connector.providerId, "", "limited", "unsupported_city") };
  try {
    const value = await connector.fetch(city);
    return { value, status: value.source.status };
  } catch (error) {
    return { value: undefined, status: source(city.id, type, connector.providerId, "", "failed", error instanceof Error ? error.message : "request_failed") };
  }
}

async function load(reference: string): Promise<CityOverviewData> {
  const city = toCity(reference);
  const sourceConfiguration = sourceConfigurationForCity(city.id);
  const [weather, airQuality, demographics, crimeTrend, serviceRequests, alertResult] = await Promise.all([
    optional(weatherConnector, city, "weather"),
    optional(airQualityConnector, city, "air_quality"),
    optional(demographicsConnector, city, "demographics"),
    optional(crimeTrendConnector, city, "crime"),
    optional(serviceRequestConnector, city, "service_requests"),
    fetchAlerts(city).catch((error) => ({ alerts: [], status: source(city.id, "alerts", "nws", "https://api.weather.gov/alerts", "failed", error instanceof Error ? error.message : "request_failed") })),
  ]);
  return {
    city,
    weather: weather.value,
    airQuality: airQuality.value,
    demographics: demographics.value,
    crimeTrend: crimeTrend.value,
    serviceRequests: serviceRequests.value,
    alerts: alertResult.alerts,
    statuses: [weather.status, airQuality.status, demographics.status, crimeTrend.status, serviceRequests.status, alertResult.status],
    enhanced: sourceConfiguration.enhancedData,
    cache: { isStale: false },
    availability: {
      weather: weather.value ? "available" : "limited",
      demographics: demographics.value ? "available" : "limited",
      alerts: alertResult.status.status === "healthy" ? "available" : "limited",
      airQuality: airQuality.value ? "available" : "limited",
      crime: crimeTrend.value ? crimeTrend.value.source.status.status === "healthy" ? "available" : "limited" : sourceConfiguration.enhancedData?.crimeSource ? "external_link" : "unavailable",
      issues: serviceRequests.value ? "available" : sourceConfiguration.enhancedData?.serviceRequestSource ? "external_link" : "community_only",
      government: sourceConfiguration.enhancedData?.officials.length ? "available" : sourceConfiguration.enhancedData?.officialLinks.some((link) => link.classification === "official_directory") ? "external_link" : "unavailable",
      news: sourceConfiguration.enhancedData?.officialLinks.length ? "external_link" : "community_only",
    },
  };
}

function staleCopy(entry: CacheEntry): CityOverviewData {
  const statuses = entry.value.statuses.map((status) => status.status === "healthy" ? { ...status, status: "stale" as const, lastErrorCode: "using_stale_cache" } : status);
  const staleSource = (source: SourceMeta): SourceMeta => source.status.status === "healthy"
    ? { ...source, status: { ...source.status, status: "stale", lastErrorCode: "using_stale_cache" } }
    : source;
  const weather = entry.value.weather ? { ...entry.value.weather, source: staleSource(entry.value.weather.source) } : undefined;
  const airQuality = entry.value.airQuality ? { ...entry.value.airQuality, source: staleSource(entry.value.airQuality.source) } : undefined;
  const demographics = entry.value.demographics ? { ...entry.value.demographics, source: staleSource(entry.value.demographics.source) } : undefined;
  const crimeTrend = entry.value.crimeTrend ? { ...entry.value.crimeTrend, source: staleSource(entry.value.crimeTrend.source) } : undefined;
  const serviceRequests = entry.value.serviceRequests ? { ...entry.value.serviceRequests, source: staleSource(entry.value.serviceRequests.source) } : undefined;
  return { ...entry.value, weather, airQuality, demographics, crimeTrend, serviceRequests, statuses, cache: { isStale: true, savedAt: entry.savedAt } };
}

function cacheKey(reference: string) {
  return `${CACHE_PREFIX}${encodeURIComponent(reference.trim().toLowerCase())}`;
}

async function readPersistentCache(key: string): Promise<CacheEntry | undefined> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(key));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || typeof parsed.savedAt !== "string" || !isRecord(parsed.value)) return undefined;
    if (!Number.isFinite(new Date(parsed.savedAt).valueOf())) return undefined;
    return parsed as CacheEntry;
  } catch {
    return undefined;
  }
}

async function writePersistentCache(key: string, entry: CacheEntry) {
  try {
    await AsyncStorage.setItem(cacheKey(key), JSON.stringify(entry));
  } catch {
    // A cache failure must never prevent city information from rendering.
  }
}

function isHealthy(data: CityOverviewData) {
  return data.statuses.some((status) => status.status === "healthy");
}

/** Client fallback only. Production use requires a consolidated trusted backend. */
export async function loadCityOverview(reference: string, force = false): Promise<CityOverviewData> {
  const key = reference.trim().toLowerCase();
  const now = Date.now();
  const memory = memoryCache.get(key);
  if (!force && memory && memory.expiresAt > now) return memory.entry.value;

  const persistent = memory?.entry || await readPersistentCache(key);
  const savedAt = persistent ? new Date(persistent.savedAt).valueOf() : undefined;
  if (!force && persistent && savedAt !== undefined && now - savedAt <= CACHE_FRESH_MS) {
    memoryCache.set(key, { entry: persistent, expiresAt: savedAt + CACHE_FRESH_MS });
    return persistent.value;
  }

  const pending = pendingRequests.get(key);
  if (pending) return pending;
  const request = load(reference).then(async (value) => {
    if (!isHealthy(value)) {
      if (persistent && savedAt !== undefined && now - savedAt <= CACHE_MAX_STALE_MS) return staleCopy(persistent);
      return value;
    }
    const entry = { savedAt: new Date().toISOString(), value };
    memoryCache.set(key, { entry, expiresAt: Date.now() + CACHE_FRESH_MS });
    await writePersistentCache(key, entry);
    return value;
  }).finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, request);
  return request;
}

/** Test-only cache reset; no runtime UI path calls this helper. */
export async function resetCityOverviewCacheForTesting() {
  memoryCache.clear();
  pendingRequests.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cityKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (cityKeys.length) await AsyncStorage.multiRemove(cityKeys);
  } catch {
    // Test isolation should not change production behavior when storage is unavailable.
  }
}
