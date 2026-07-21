import type { CrimeCoverageStatus, CrimeStatistic } from "./types";
import { percentageTrend, ratePer100k } from "./utils";

export const crimeComparisonRules = {
  aboveComparisonMinimumPercent: 25,
  belowComparisonMinimumPercent: -25,
  minimumIncidentCount: 20,
  minimumCoveragePercent: 80,
} as const;

export type CrimeComparisonLabel = "Above comparison rate" | "Near comparison rate" | "Below comparison rate" | "Insufficient recent data" | "Limited reporting coverage";
export type CrimeTrendLabel = "Increasing" | "Decreasing" | "Stable" | "Insufficient recent data";

export function coverageFromPercent(percent?: number): CrimeCoverageStatus {
  if (!Number.isFinite(percent) || percent === undefined || percent < 0 || percent > 100) return "unknown";
  if (percent < crimeComparisonRules.minimumCoveragePercent) return "partial";
  return percent === 100 ? "complete" : "mostly_complete";
}

export function comparisonLabel(stat: Pick<CrimeStatistic, "incidentCount" | "reportingCoveragePercent" | "coverageStatus" | "percentageDifferenceFromComparison">): CrimeComparisonLabel {
  if (stat.coverageStatus === "insufficient" || stat.coverageStatus === "partial" || (stat.reportingCoveragePercent !== undefined && stat.reportingCoveragePercent < crimeComparisonRules.minimumCoveragePercent)) return "Limited reporting coverage";
  if (stat.incidentCount < crimeComparisonRules.minimumIncidentCount || !Number.isFinite(stat.percentageDifferenceFromComparison)) return "Insufficient recent data";
  if ((stat.percentageDifferenceFromComparison ?? 0) >= crimeComparisonRules.aboveComparisonMinimumPercent) return "Above comparison rate";
  if ((stat.percentageDifferenceFromComparison ?? 0) <= crimeComparisonRules.belowComparisonMinimumPercent) return "Below comparison rate";
  return "Near comparison rate";
}

export function trendLabel(change?: number): CrimeTrendLabel {
  if (!Number.isFinite(change)) return "Insufficient recent data";
  if ((change ?? 0) >= 5) return "Increasing";
  if ((change ?? 0) <= -5) return "Decreasing";
  return "Stable";
}

export function normalizeCrimeStatistic(input: Omit<CrimeStatistic, "ratePer100k" | "percentageChangeFromPriorPeriod" | "coverageStatus"> & { previousIncidentCount?: number; coverageStatus?: CrimeCoverageStatus }): CrimeStatistic {
  const incidentCount = Number.isFinite(input.incidentCount) && input.incidentCount >= 0 ? input.incidentCount : 0;
  const coverageStatus = input.coverageStatus || coverageFromPercent(input.reportingCoveragePercent);
  return { ...input, incidentCount, coverageStatus, ratePer100k: ratePer100k(incidentCount, input.populationUsed), percentageChangeFromPriorPeriod: percentageTrend(incidentCount, input.previousIncidentCount) };
}
