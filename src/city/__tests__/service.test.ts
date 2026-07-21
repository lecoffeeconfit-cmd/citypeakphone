import AsyncStorage from "@react-native-async-storage/async-storage";
import { airQualityCategory, loadCityOverview, resetCityOverviewCacheForTesting } from "../service";

jest.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => { store.set(key, value); }),
    getAllKeys: jest.fn(async () => [...store.keys()]),
    multiRemove: jest.fn(async (keys: string[]) => { keys.forEach((key) => store.delete(key)); }),
  };
});

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

function jsonResponse(value: unknown, status = 200, contentLength?: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => name === "content-length" ? contentLength ?? null : null },
    text: async () => JSON.stringify(value),
  } as Response;
}

function installHealthyProviderMocks() {
  fetchMock.mockImplementation(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/points/")) return jsonResponse({ properties: { forecastHourly: "https://api.weather.gov/gridpoints/test/1,1/forecast/hourly" } });
    if (url.includes("forecast/hourly")) return jsonResponse({ properties: { periods: [{ name: "Now", temperature: 71, temperatureUnit: "F", shortForecast: "Clear" }] } });
    if (url.includes("air-quality-api.open-meteo.com")) return jsonResponse({ current: { time: "2026-07-20T20:00", us_aqi: 65, pm2_5: 13.6, pm10: 16.8, ozone: 73, nitrogen_dioxide: 20.8 }, timezone_abbreviation: "GMT-7" });
    if (url.includes("api.census.gov")) return jsonResponse([["NAME", "B01003_001E", "B19013_001E", "B01002_001E", "B25077_001E"], ["Long Beach city", "450000", "80000", "35", "750000"]]);
    if (url.includes("lbpd-criminal-incident-data") && url.includes("latest_date")) return jsonResponse({ results: [{ latest_date: "2026-07-19T00:00:00+00:00" }] });
    if (url.includes("lbpd-criminal-incident-data")) return jsonResponse({ results: [
      { date_reported: "2026-06-15", count: 10 },
      { date_reported: "2026-07-18", count: 12 },
    ] });
    if (url.includes("data.longbeach.gov/api/explore")) return jsonResponse({ results: [
      { status: "New", type: "Dumped Items", count: 12 },
      { status: "In Progress", type: "Street Repair", count: 8 },
      { status: "Closed", type: "Graffiti", count: 20 },
    ] });
    if (url.includes("/alerts/active")) return jsonResponse({ features: [
      { id: "active-alert", properties: { event: "Heat Advisory", severity: "Moderate", urgency: "Expected", certainty: "Likely", areaDesc: "Long Beach", expires: "2099-01-01T00:00:00+00:00", web: "https://api.weather.gov/alerts/active-alert" } },
      { id: "expired-alert", properties: { event: "Expired", expires: "2000-01-01T00:00:00+00:00" } },
      { id: "active-alert", properties: { event: "Duplicate", expires: "2099-01-01T00:00:00+00:00" } },
    ] });
    throw new Error(`unexpected_url:${url}`);
  });
}

describe("city overview provider boundary", () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    await resetCityOverviewCacheForTesting();
    jest.clearAllMocks();
  });

  it("validates and normalizes a partial set of public-provider responses", async () => {
    installHealthyProviderMocks();
    const data = await loadCityOverview("us-ca-long-beach");
    expect(data.weather?.temperature).toBe(71);
    expect(data.airQuality).toMatchObject({ usAqi: 65, category: "Moderate", geographicScope: "air_quality_model_grid" });
    expect(data.demographics?.population).toBe(450000);
    expect(data.crimeTrend).toMatchObject({ currentCount: 12, priorCount: 10, geographicScope: "police_jurisdiction" });
    expect(data.serviceRequests).toMatchObject({ totalCount: 40, openCount: 12, inProgressCount: 8, closedCount: 20 });
    expect(data.alerts).toHaveLength(1);
    expect(data.alerts[0]).toMatchObject({ id: "active-alert", affectedAreas: "Long Beach", urgency: "Expected" });
    expect(data.availability.weather).toBe("available");
  });

  it("does not let an invalid provider response block unrelated cards", async () => {
    installHealthyProviderMocks();
    fetchMock.mockImplementation(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("forecast/hourly")) return jsonResponse({ properties: { periods: [] } });
      if (url.includes("/points/")) return jsonResponse({ properties: { forecastHourly: "https://api.weather.gov/gridpoints/test/1,1/forecast/hourly" } });
      if (url.includes("air-quality-api.open-meteo.com")) return jsonResponse({ current: { time: "2026-07-20T20:00", us_aqi: 65 } });
      if (url.includes("api.census.gov")) return jsonResponse([["NAME"], ["Long Beach city", "450000", "80000", "35", "750000"]]);
      if (url.includes("lbpd-criminal-incident-data") && url.includes("latest_date")) return jsonResponse({ results: [{ latest_date: "2026-07-19T00:00:00+00:00" }] });
      if (url.includes("lbpd-criminal-incident-data")) return jsonResponse({ results: [{ date_reported: "2026-07-18", count: 1 }] });
      if (url.includes("data.longbeach.gov/api/explore")) return jsonResponse({ results: [{ status: "New", type: "Dumped Items", count: 1 }] });
      if (url.includes("/alerts/active")) return jsonResponse({ features: [] });
      throw new Error("unexpected_url");
    });
    const data = await loadCityOverview("us-ca-long-beach");
    expect(data.weather).toBeUndefined();
    expect(data.demographics?.population).toBe(450000);
    expect(data.availability.weather).toBe("limited");
  });

  it("returns availability states when public providers time out", async () => {
    fetchMock.mockRejectedValue(new Error("network_timeout"));
    const data = await loadCityOverview("us-ca-long-beach");
    expect(data.weather).toBeUndefined();
    expect(data.demographics).toBeUndefined();
    expect(data.alerts).toEqual([]);
    expect(data.statuses.every((status) => status.status === "failed")).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("uses a prior successful result as explicitly stale data after a forced refresh fails", async () => {
    installHealthyProviderMocks();
    await loadCityOverview("us-ca-long-beach");
    fetchMock.mockRejectedValue(new Error("network_timeout"));
    const data = await loadCityOverview("us-ca-long-beach", true);
    expect(data.cache?.isStale).toBe(true);
    expect(data.weather?.source.status.status).toBe("stale");
    expect(data.airQuality?.source.status.status).toBe("stale");
    expect(data.demographics?.source.status.status).toBe("stale");
    expect(data.crimeTrend?.source.status.status).toBe("stale");
    expect(data.serviceRequests?.source.status.status).toBe("stale");
  });

  it("uses EPA-style category boundaries for the modeled U.S. AQI", () => {
    expect(airQualityCategory(50)).toBe("Good");
    expect(airQualityCategory(51)).toBe("Moderate");
    expect(airQualityCategory(151)).toBe("Unhealthy");
    expect(airQualityCategory(301)).toBe("Hazardous");
  });
});
