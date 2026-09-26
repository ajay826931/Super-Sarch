import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');

    // Return a 400 error if coordinates are missing
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude (lat) and longitude (lng) coordinates are required.' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = radiusParam ? parseFloat(radiusParam) : 5000;

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinate values.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON standard: [lng, lat]
          },
          distanceField: 'distance_meters',
          spherical: true,
          maxDistance: isNaN(radius) ? 5000 : radius
        }
      },
      {
        $limit: 20
      }
    ];

    const properties = await Property.aggregate(pipeline);

    return NextResponse.json(properties);
  } catch (error) {
    console.error('GeoNear Search API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
