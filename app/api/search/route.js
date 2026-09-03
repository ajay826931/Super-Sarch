import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Service from '@/models/Service'; // Import to ensure model registration
import { getDistance } from '@/lib/distanceService';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { latitude, longitude, category, filters = {} } = body;
    let maxDistance = body.maxDistance || 500;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const origin = { lat, lng };

    // Search function with aggregation pipeline
    async function searchProperties(currentMaxDistance) {
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'calculated_distance',
            maxDistance: currentMaxDistance,
            spherical: true
          }
        },
        {
          $lookup: {
            from: 'services', // Mongoose pluralizes 'Service' to 'services'
            localField: '_id',
            foreignField: 'property_id',
            as: 'services'
          }
        }
      ];

      // Build match conditions for category or budget (applied against the joined 'services' array)
      const matchConditions = {};
      
      if (category) {
        matchConditions['services.category'] = category;
      }
      
      if (filters.budget) {
        // Assuming budget means starting price should be less than or equal to budget
        matchConditions['services.pricing.starting_price'] = { $lte: Number(filters.budget) };
      }

      // Add match stage only if there are conditions
      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // Explicitly sort by distance (though $geoNear sorts implicitly, matching might affect order)
      pipeline.push({ $sort: { calculated_distance: 1 } });

      return await Property.aggregate(pipeline);
    }

    // Step 1: Query at initial maxDistance (default 500m)
    let results = await searchProperties(maxDistance);

    // Step 2: Smart Fallback Expansion (if initial was 500m or less)
    if (results.length === 0 && maxDistance <= 500) {
      maxDistance = 1000;
      results = await searchProperties(maxDistance);
    }
    
    // Step 3: Smart Fallback Expansion (if previous was 1000m or less)
    if (results.length === 0 && maxDistance <= 1000) {
      maxDistance = 5000;
      results = await searchProperties(maxDistance);
    }

    // Sprint 4: Calculate walking distance for top 10 results
    const topResults = results.slice(0, 10);
    const remainingResults = results.slice(10);
    
    const distancePromises = topResults.map(async (property) => {
      // GeoJSON coordinates are [longitude, latitude]
      if (property.location && property.location.coordinates) {
        const dest = {
          lng: property.location.coordinates[0],
          lat: property.location.coordinates[1]
        };
        const distanceData = await getDistance(origin, dest);
        return {
          ...property,
          walking_distance: distanceData.distance_meters,
          walking_time: distanceData.duration_seconds,
          is_distance_fallback: distanceData.is_fallback || false
        };
      }
      return property;
    });

    const enrichedTopResults = await Promise.all(distancePromises);
    const finalResults = [...enrichedTopResults, ...remainingResults];

    return NextResponse.json({
      success: true,
      count: finalResults.length,
      radius_used: maxDistance,
      data: finalResults
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
