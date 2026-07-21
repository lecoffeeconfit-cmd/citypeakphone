import { comparisonLabel, coverageFromPercent, normalizeCrimeStatistic, trendLabel } from "../crime";

const base = {
  id: "test-violent-crime",
  cityId: "test-city",
  providerId: "test-provider",
  sourceAgencyName: "Test Police Department",
  geographicScope: "city" as const,
  category: "violent_crime" as const,
  categoryLabel: "Violent crime",
  incidentCount: 100,
  populationUsed: 100_000,
  periodStart: "2025-01-01",
  periodEnd: "2025-12-31",
  comparisonRatePer100k: 80,
  percentageDifferenceFromComparison: 25,
  reportingCoveragePercent: 100,
  sourceUrl: "https://example.gov/crime",
  fetchedAt: "2026-01-01T00:00:00.000Z",
};

describe("crime display rules", () => {
  it("treats comparison thresholds as CityPeak display rules", () => {
    expect(comparisonLabel({ incidentCount: 100, coverageStatus: "complete", percentageDifferenceFromComparison: 25 })).toBe("Above comparison rate");
    expect(comparisonLabel({ incidentCount: 100, coverageStatus: "complete", percentageDifferenceFromComparison: -25 })).toBe("Below comparison rate");
    expect(comparisonLabel({ incidentCount: 19, coverageStatus: "complete", percentageDifferenceFromComparison: 90 })).toBe("Insufficient recent data");
  });

  it("suppresses comparisons for incomplete coverage", () => {
    expect(coverageFromPercent(79)).toBe("partial");
    expect(comparisonLabel({ incidentCount: 100, coverageStatus: "partial", percentageDifferenceFromComparison: 90 })).toBe("Limited reporting coverage");
  });

  it("normalizes valid rates and refuses a zero-prior trend", () => {
    const normalized = normalizeCrimeStatistic({ ...base, previousIncidentCount: 0 });
    expect(normalized.ratePer100k).toBe(100);
    expect(normalized.percentageChangeFromPriorPeriod).toBeUndefined();
    expect(trendLabel(-5)).toBe("Decreasing");
    expect(trendLabel(undefined)).toBe("Insufficient recent data");
  });
});
