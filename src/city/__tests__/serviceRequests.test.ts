import { dedupeServiceRequests, normalizeServiceRequest, normalizeServiceStatus, summarizeServiceRequestAggregates } from "../serviceRequests";

const mapping = {
  providerId: "open311-test",
  cityId: "us-test-city",
  sourceType: "official_311" as const,
  idField: "service_request_id",
  categoryField: "service_name",
  statusField: "status",
  latitudeField: "lat",
  longitudeField: "lng",
  updatedAtField: "updated_at",
};

describe("service request normalization", () => {
  it("preserves source category/status while creating safe CityPeak values", () => {
    const result = normalizeServiceRequest({ service_request_id: "abc", service_name: "Pothole", status: "In Progress", lat: "33.77", lng: "-118.19" }, mapping);
    expect(result).toMatchObject({ id: "open311-test:abc", category: "road_damage", originalCategory: "Pothole", status: "in_progress", originalStatus: "In Progress", sourceType: "official_311" });
  });

  it("marks unknown source status and omits invalid coordinates", () => {
    const result = normalizeServiceRequest({ service_request_id: "def", service_name: "Something else", status: "Queued", lat: "400", lng: "-999" }, mapping);
    expect(result?.status).toBe("unknown");
    expect(result?.category).toBe("other");
    expect(result?.latitude).toBeUndefined();
    expect(result?.longitude).toBeUndefined();
    expect(normalizeServiceStatus("Closed Referred")).toBe("closed");
  });

  it("deduplicates repeated external identifiers by newest update", () => {
    const first = normalizeServiceRequest({ service_request_id: "same", service_name: "Graffiti", status: "New", updated_at: "2026-01-01T00:00:00Z" }, mapping)!;
    const latest = { ...first, status: "closed" as const, updatedAt: "2026-01-02T00:00:00.000Z" };
    expect(dedupeServiceRequests([first, latest])).toEqual([latest]);
  });

  it("summarizes only grouped records without retaining individual request data", () => {
    const summary = summarizeServiceRequestAggregates([
      { status: "Open", category: "Pothole in Street Complaint", count: 10 },
      { status: "In Progress", category: "Pothole in Street Complaint", count: 4 },
      { status: "Closed", category: "Graffiti", count: 9 },
      { status: "Unknown", category: "Ignored", count: -1 },
    ]);
    expect(summary).toEqual({ totalCount: 23, openCount: 10, inProgressCount: 4, closedCount: 9, topCategories: [
      { label: "Pothole in Street Complaint", count: 14 },
      { label: "Graffiti", count: 9 },
    ] });
  });
});
