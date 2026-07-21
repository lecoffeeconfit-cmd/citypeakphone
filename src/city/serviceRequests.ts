import type { CityServiceRequest, ServiceRequestCategoryCount } from "./types";

export type ServiceRequestProviderKind = "open311" | "arcgis" | "socrata" | "opendatasoft" | "manual_verified";

export type ServiceRequestMapping = {
  providerId: string;
  cityId: string;
  sourceType: Extract<CityServiceRequest["sourceType"], "official_311" | "official_open_data">;
  categoryField: string;
  statusField: string;
  idField: string;
  latitudeField?: string;
  longitudeField?: string;
  titleField?: string;
  descriptionField?: string;
  reportedAtField?: string;
  updatedAtField?: string;
  sourceUrl?: string;
};

/** A centralized, privacy-safe configuration for official aggregate 311 data. */
export type PublicServiceRequestSource = {
  cityId: string;
  providerId: string;
  name: string;
  host: string;
  sourceUrl: string;
  endpoint: string;
  kind: "socrata" | "opendatasoft";
  categoryField: string;
  statusField: string;
  createdAtField: string;
  expectedUpdateFrequency: string;
};

export type ServiceRequestAggregateRow = {
  category: string;
  status: string;
  count: number;
};

export type ServiceRequestAggregateSummary = {
  totalCount: number;
  openCount: number;
  inProgressCount: number;
  closedCount: number;
  topCategories: ServiceRequestCategoryCount[];
};

/**
 * These endpoints are official city open-data portals. Queries are grouped on
 * the server, so no individual 311 report or location is transferred to the app.
 */
export const publicServiceRequestSources: Record<string, PublicServiceRequestSource> = {
  "us-ca-long-beach": {
    cityId: "us-ca-long-beach", providerId: "long-beach-open-data", name: "City of Long Beach Go Long Beach 311", host: "data.longbeach.gov",
    sourceUrl: "https://data.longbeach.gov/explore/dataset/service-requests/", endpoint: "https://data.longbeach.gov/api/explore/v2.1/catalog/datasets/service-requests/records",
    kind: "opendatasoft", categoryField: "type", statusField: "status", createdAtField: "createddate", expectedUpdateFrequency: "City open-data portal",
  },
  "us-ny-new-york": {
    cityId: "us-ny-new-york", providerId: "nyc-open-data-311", name: "NYC Open Data 311", host: "data.cityofnewyork.us",
    sourceUrl: "https://data.cityofnewyork.us/d/erm2-nwe9", endpoint: "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
    kind: "socrata", categoryField: "complaint_type", statusField: "status", createdAtField: "created_date", expectedUpdateFrequency: "Daily",
  },
  "us-il-chicago": {
    cityId: "us-il-chicago", providerId: "chicago-open-data-311", name: "City of Chicago 311", host: "data.cityofchicago.org",
    sourceUrl: "https://data.cityofchicago.org/Service-Requests/311-Service-Requests/v6vf-nfxy", endpoint: "https://data.cityofchicago.org/resource/v6vf-nfxy.json",
    kind: "socrata", categoryField: "sr_type", statusField: "status", createdAtField: "created_date", expectedUpdateFrequency: "Daily",
  },
};

export function publicServiceRequestSourceForCity(cityId: string) {
  return publicServiceRequestSources[cityId];
}

function stringValue(value: unknown, maxLength = 240) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeDate(value: unknown) {
  const text = stringValue(value, 40);
  return text && Number.isFinite(new Date(text).valueOf()) ? new Date(text).toISOString() : undefined;
}

function coordinate(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

export function normalizeServiceStatus(value: unknown): CityServiceRequest["status"] {
  const status = stringValue(value).toLowerCase();
  if (/^(new|open|submitted|received)$/.test(status)) return "open";
  if (/(acknowledged|assigned|accepted)/.test(status)) return "acknowledged";
  if (/(in progress|in_progress|working|pending)/.test(status)) return "in_progress";
  if (/(closed|completed|resolved|cancelled|duplicate)/.test(status)) return "closed";
  return "unknown";
}

export function normalizeServiceCategory(value: unknown) {
  const category = stringValue(value).toLowerCase();
  if (/(pothole|street repair|road damage)/.test(category)) return "road_damage";
  if (/(streetlight|\blight\b)/.test(category)) return "broken_streetlight";
  if (/graffiti/.test(category)) return "graffiti";
  if (/(dump|trash|debris)/.test(category)) return "illegal_dumping";
  if (/(tree|vegetation)/.test(category)) return "fallen_tree";
  if (/sidewalk/.test(category)) return "sidewalk_damage";
  if (/(traffic signal|signal)/.test(category)) return "traffic_signal";
  return "other";
}

/** Maps Open311, ArcGIS, Socrata, and Opendatasoft records without treating input as trusted. */
export function normalizeServiceRequest(record: Record<string, unknown>, mapping: ServiceRequestMapping): CityServiceRequest | undefined {
  const externalId = stringValue(record[mapping.idField], 160);
  if (!externalId) return undefined;
  const originalCategory = stringValue(record[mapping.categoryField]);
  const originalStatus = stringValue(record[mapping.statusField]);
  const rawTitle = mapping.titleField ? stringValue(record[mapping.titleField]) : "";
  const title = rawTitle || originalCategory || "Service request";
  const now = new Date().toISOString();
  return {
    id: `${mapping.providerId}:${externalId}`, externalId, cityId: mapping.cityId, providerId: mapping.providerId,
    sourceType: mapping.sourceType, category: normalizeServiceCategory(originalCategory), originalCategory: originalCategory || undefined,
    title, description: mapping.descriptionField ? stringValue(record[mapping.descriptionField], 600) || undefined : undefined,
    status: normalizeServiceStatus(originalStatus), originalStatus: originalStatus || undefined,
    latitude: mapping.latitudeField ? coordinate(record[mapping.latitudeField], -90, 90) : undefined,
    longitude: mapping.longitudeField ? coordinate(record[mapping.longitudeField], -180, 180) : undefined,
    reportedAt: mapping.reportedAtField ? safeDate(record[mapping.reportedAtField]) : undefined,
    updatedAt: mapping.updatedAtField ? safeDate(record[mapping.updatedAtField]) : undefined,
    sourceUrl: mapping.sourceUrl, fetchedAt: now,
  };
}

export function dedupeServiceRequests(records: CityServiceRequest[]) {
  const newestById = new Map<string, CityServiceRequest>();
  for (const record of records) {
    const existing = newestById.get(record.id);
    if (!existing || new Date(record.updatedAt || record.fetchedAt).valueOf() > new Date(existing.updatedAt || existing.fetchedAt).valueOf()) newestById.set(record.id, record);
  }
  return [...newestById.values()];
}

function aggregateCount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 1_000_000_000 ? parsed : undefined;
}

/** Converts grouped provider rows into a display-safe summary with bounded labels. */
export function summarizeServiceRequestAggregates(rows: ServiceRequestAggregateRow[]): ServiceRequestAggregateSummary | undefined {
  const categories = new Map<string, number>();
  let totalCount = 0;
  let openCount = 0;
  let inProgressCount = 0;
  let closedCount = 0;
  for (const row of rows) {
    const count = aggregateCount(row.count);
    const category = stringValue(row.category, 120);
    if (count === undefined || !category) continue;
    totalCount += count;
    categories.set(category, (categories.get(category) || 0) + count);
    const status = normalizeServiceStatus(row.status);
    if (status === "open" || status === "acknowledged") openCount += count;
    else if (status === "in_progress") inProgressCount += count;
    else if (status === "closed") closedCount += count;
  }
  if (!totalCount) return undefined;
  const topCategories = [...categories.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
  return { totalCount, openCount, inProgressCount, closedCount, topCategories };
}
