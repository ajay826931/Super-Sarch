import redis from './redis';

// Fallback function: Straight-line distance (Haversine formula) in meters
export function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Function to fetch routing distance from an API (e.g., Google Maps)
export async function fetchRoutingDistance(origin, destination) {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'DUMMY_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
    const element = data.rows[0].elements[0];
    return {
      distance_meters: element.distance.value,
      duration_seconds: element.duration.value
    };
  } else {
    throw new Error('Routing API failed to return valid data');
  }
}

// Master function
export async function getDistance(origin, destination) {
  // Step A: Generate a unique cache key
  const cacheKey = `route:walking:${origin.lat},${origin.lng}:${destination.lat},${destination.lng}`;

  try {
    // Step B: Check Redis
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    }

    // Step C: Fetch Routing Distance
    const routeData = await fetchRoutingDistance(origin, destination);

    // Step D: Save to Redis with 30 days TTL (2592000 seconds)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(routeData), { ex: 2592000 });
    }

    return { ...routeData, is_cached: false, is_fallback: false };
  } catch (error) {
    console.error('Distance Engine Error:', error);
    
    // Step E: Fallback to Haversine
    const distance_meters = Math.round(calculateHaversine(origin.lat, origin.lng, destination.lat, destination.lng));
    // Estimate walking duration (assuming ~1.4 meters per second average walking speed)
    const duration_seconds = Math.round(distance_meters / 1.4);
    
    return {
      distance_meters,
      duration_seconds,
      is_fallback: true
    };
  }
}
