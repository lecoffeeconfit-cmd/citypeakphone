export type CityIndexItem = {
  /** Stable identifier used by city-data providers; never rely on a name alone. */
  id: string;
  city: string;
  state: string;
  stateFips?: string;
  placeFips?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export const cityIndex: CityIndexItem[] = [
  { id: "us-ca-long-beach", city: "Long Beach", state: "CA", stateFips: "06", placeFips: "43000", latitude: 33.7701, longitude: -118.1937, timezone: "America/Los_Angeles" },
  { id: "us-ca-los-angeles", city: "Los Angeles", state: "CA", stateFips: "06", placeFips: "44000", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { id: "us-ca-alhambra", city: "Alhambra", state: "CA", stateFips: "06", placeFips: "00884", latitude: 34.0953, longitude: -118.1270, timezone: "America/Los_Angeles" },
  { id: "us-ca-irvine", city: "Irvine", state: "CA", stateFips: "06", placeFips: "36770", latitude: 33.6846, longitude: -117.8265, timezone: "America/Los_Angeles" },
  { id: "us-ca-santa-monica", city: "Santa Monica", state: "CA", stateFips: "06", placeFips: "70000", latitude: 34.0195, longitude: -118.4912, timezone: "America/Los_Angeles" },
  { id: "us-ca-san-diego", city: "San Diego", state: "CA", stateFips: "06", placeFips: "66000", latitude: 32.7157, longitude: -117.1611, timezone: "America/Los_Angeles" },
  { id: "us-ca-hollywood", city: "Hollywood", state: "CA", latitude: 34.0928, longitude: -118.3287, timezone: "America/Los_Angeles" },
  { id: "us-ca-pasadena", city: "Pasadena", state: "CA", stateFips: "06", placeFips: "56000", latitude: 34.1478, longitude: -118.1445, timezone: "America/Los_Angeles" },
  { id: "us-ca-anaheim", city: "Anaheim", state: "CA", stateFips: "06", placeFips: "02000", latitude: 33.8366, longitude: -117.9143, timezone: "America/Los_Angeles" },
  { id: "us-ca-san-francisco", city: "San Francisco", state: "CA", stateFips: "06", placeFips: "67000", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  { id: "us-ny-new-york", city: "New York", state: "NY", stateFips: "36", placeFips: "51000", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { id: "us-il-chicago", city: "Chicago", state: "IL", stateFips: "17", placeFips: "14000", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { id: "us-fl-miami", city: "Miami", state: "FL", stateFips: "12", placeFips: "45000", latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York" },
];

export function findCityIndexItem(index: CityIndexItem[], name: string, state?: string): CityIndexItem | undefined {
  const normalizedName = name.trim().toLowerCase();
  const normalizedState = state?.trim().toLowerCase();
  return index.find((city) => city.city.toLowerCase() === normalizedName && (!normalizedState || city.state.toLowerCase() === normalizedState));
}

export function cityForArea(area: string): CityIndexItem | undefined {
  const normalized = area.trim();
  const match = normalized.match(/^(.*?),\s*([A-Za-z]{2})$/);
  if (match) return findCityIndexItem(cityIndex, match[1], match[2]);
  return findCityIndexItem(cityIndex, normalized);
}

export function cityForId(id: string): CityIndexItem | undefined {
  return cityIndex.find((city) => city.id === id);
}
