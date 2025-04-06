import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

/**
 * Generates a geohash from latitude & longitude.
 */
export function getGeohash(latitude, longitude) {
  return geohashForLocation([latitude, longitude]);
}

/**
 * Returns geohash range bounds for a center & radius in meters.
 */
export function getGeohashBounds(center, radiusInMeters) {
  return geohashQueryBounds(center, radiusInMeters);
}

/**
 * Returns distance in meters between two points: [lat, lng].
 */
export function getDistanceInMeters(center, point) {
  // distanceBetween returns distance in km, so multiply by 1000
  return distanceBetween(center, point) * 1000;
}
