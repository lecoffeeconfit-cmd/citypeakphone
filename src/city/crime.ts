import type { CrimeCoverageStatus, CrimeStatistic } from "./types";
import { percentageTrend, ratePer100k } from "./utils";

export const crimeComparisonRules = {
  aboveComparisonMinimumPercent: 25,
  belowComparisonMinimumPercent: -25,
  minimumIncidentCount: 20,
  minimumCoveragePercent: 80,
} as const;

/** Official police/open-data sources that can return citywide aggregate totals. */
export type PublicCrimeSource = {
  cityId: string;
  providerId: string;
  name: string;
  host: string;
  sourceUrl: string;
  endpoint: string;
  kind: "socrata" | "opendatasoft";
  dateField: string;
  expectedUpdateFrequency: string;
};

export const publicCrimeSources: Record<string, PublicCrimeSource> = {
  "us-ca-long-beach": {
    cityId: "us-ca-long-beach", providerId: "long-beach-police-open-data", name: "Long Beach Police reported incidents", host: "data.longbeach.gov",
    sourceUrl: "https://data.longbeach.gov/explore/dataset/lbpd-criminal-incident-data/", endpoint: "https://data.longbeach.gov/api/explore/v2.1/catalog/datasets/lbpd-criminal-incident-data/records",
    kind: "opendatasoft", dateField: "date_reported", expectedUpdateFrequency: "City open-data portal",
  },
  "us-il-chicago": {
    cityId: "us-il-chicago", providerId: "chicago-police-open-data", name: "Chicago Police reported crimes", host: "data.cityofchicago.org",
    sourceUrl: "https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2", endpoint: "https://data.cityofchicago.org/resource/ijzp-q8t2.json",
    kind: "socrata", dateField: "date", expectedUpdateFrequency: "City open-data portal",
  },
  "us-ca-san-francisco": {
    cityId: "us-ca-san-francisco", providerId: "san-francisco-police-open-data", name: "San Francisco Police incident reports", host: "data.sfgov.org",
    sourceUrl: "https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783", endpoint: "https://data.sfgov.org/resource/wg3w-h783.json",
    kind: "socrata", dateField: "incident_date", expectedUpdateFrequency: "City open-data portal",
  },
};

export function publicCrimeSourceForCity(cityId: string) {
  return publicCrimeSources[cityId];
}

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
