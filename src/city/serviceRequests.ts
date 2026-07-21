import type { CityServiceRequest } from "./types";

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
