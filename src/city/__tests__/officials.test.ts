import { detectOfficialChanges, reviewOfficialChange } from "../officials";

const official = {
  id: "mayor",
  cityId: "us-test-city",
  name: "Alex Example",
  normalizedRole: "mayor",
  displayedTitle: "Mayor",
  sourceUrl: "https://example.gov/officials",
  sourceProviderId: "official-directory",
  lastCheckedAt: "2026-01-01T00:00:00.000Z",
  verificationStatus: "verified" as const,
};

describe("official verification workflow", () => {
  it("records a possible change instead of automatically replacing an official", () => {
    const reviews = detectOfficialChanges(official, { ...official, name: "Taylor Example" }, "2026-07-20T00:00:00.000Z");
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ detectedChangeType: "name", status: "pending", previousValue: "Alex Example", proposedValue: "Taylor Example" });
  });

  it("requires an authorized reviewer and prevents a second decision", () => {
    const review = detectOfficialChanges(official, { ...official, displayedTitle: "Acting Mayor" })[0];
    expect(() => reviewOfficialChange(review, undefined, "approved")).toThrow("admin_authorization_required");
    const approved = reviewOfficialChange(review, "admin-user-id", "approved");
    expect(approved.status).toBe("approved");
    expect(() => reviewOfficialChange(approved, "admin-user-id", "rejected")).toThrow("review_already_decided");
  });
});
