import { compatibleReportingPeriods, percentageTrend, ratePer100k } from "../utils";

describe("crime calculation safeguards", () => {
  it("calculates rates per 100,000 only for valid counts and populations", () => {
    expect(ratePer100k(50, 100_000)).toBe(50);
    expect(ratePer100k(-1, 100_000)).toBeUndefined();
    expect(ratePer100k(50, 0)).toBeUndefined();
    expect(ratePer100k(50, undefined)).toBeUndefined();
  });

  it("does not calculate an infinite or misleading trend from a zero prior period", () => {
    expect(percentageTrend(120, 100)).toBe(20);
    expect(percentageTrend(10, 0)).toBeUndefined();
    expect(percentageTrend(-1, 10)).toBeUndefined();
  });

  it("requires identical valid reporting periods before a direct comparison", () => {
    expect(compatibleReportingPeriods("2026-01-01", "2026-01-31", "2026-01-01", "2026-01-31")).toBe(true);
    expect(compatibleReportingPeriods("2026-01-01", "2026-01-31", "2026-01-01", "2026-12-31")).toBe(false);
    expect(compatibleReportingPeriods("2026-02-01", "2026-01-31", "2026-02-01", "2026-01-31")).toBe(false);
  });
});
