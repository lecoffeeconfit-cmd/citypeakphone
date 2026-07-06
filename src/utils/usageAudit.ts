const usageCounts = new Map<string, number>();

export function countUsage(key: string, details?: unknown) {
  if (!__DEV__) return;

  const nextCount = (usageCounts.get(key) ?? 0) + 1;
  usageCounts.set(key, nextCount);

  if (details === undefined) {
    console.log(`[usage] ${key}: ${nextCount}`);
  } else {
    console.log(`[usage] ${key}: ${nextCount}`, details);
  }
}
