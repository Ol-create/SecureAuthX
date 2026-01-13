import fetch from "node-fetch";

export async function getGeoFromIP(ip) {
  // Example using freegeoip.app
  const res = await fetch(`https://freegeoip.app/json/${ip}`);
  const data = await res.json();
  return { lat: data.latitude, lng: data.longitude };
}

// Haversine formula to calculate distance in km
export function calculateDistanceKm(loc1, loc2) {
  const R = 6371; // km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
