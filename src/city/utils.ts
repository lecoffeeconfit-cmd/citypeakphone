import type { DataSourceStatus } from "./types";

export function ratePer100k(incidents?: number, population?: number) {
  if (!Number.isFinite(incidents) || !Number.isFinite(population) || incidents === undefined || incidents < 0 || !population || population <= 0) return undefined;
  return (Number(incidents) / Number(population)) * 100000;
}

export function percentageTrend(current?: number, previous?: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || current === undefined || previous === undefined || current < 0 || previous <= 0) return undefined;
  return ((Number(current) - Number(previous)) / Number(previous)) * 100;
}

export function compatibleReportingPeriods(startA?: string, endA?: string, startB?: string, endB?: string) {
  if (!startA || !endA || !startB || !endB || startA !== startB || endA !== endB) return false;
  const startsBeforeEnds = new Date(startA).valueOf() <= new Date(endA).valueOf();
  return Number.isFinite(new Date(startA).valueOf()) && Number.isFinite(new Date(endA).valueOf()) && startsBeforeEnds;
}

export function sourceStatus(cityId: string, dataType: string, providerId: string, sourceUrl: string, status: DataSourceStatus["status"], lastErrorCode?: string): DataSourceStatus {
  return { cityId, dataType, providerId, sourceUrl, status, failureCount: status === "failed" ? 1 : 0, lastCheckedAt: new Date().toISOString(), ...(lastErrorCode ? { lastErrorCode } : {}) };
}
