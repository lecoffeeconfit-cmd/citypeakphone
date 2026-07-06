import type { Coordinates } from "../types";

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function getDistanceMiles(from?: Coordinates | null, to?: Coordinates | null) {
  if (!from || !to) return null;

  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine));
}

export function formatDistanceAway(
  userCoordinates?: Coordinates | null,
  postCoordinates?: Coordinates | null
) {
  const miles = getDistanceMiles(userCoordinates, postCoordinates);

  if (miles === null) return null;
  if (miles < 0.1) return "Less than 0.1 mi away";
  if (miles < 10) return `${miles.toFixed(1)} mi away`;
  return `${Math.round(miles)} mi away`;
}
