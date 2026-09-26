import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    // If query length is less than 2, return an empty array
    if (!q || q.trim().length < 2) {
      return NextResponse.json([]);
    }

    await dbConnect();

    const pipeline = [
      {
        $search: {
          index: 'location_autocomplete',
          compound: {
            should: [
              {
                text: {
                  query: q.trim(),
                  path: 'name',
                  fuzzy: {
                    maxEdits: 1
                  }
                }
              },
              {
                text: {
                  query: q.trim(),
                  path: 'aliases',
                  fuzzy: {
                    maxEdits: 1
                  }
                }
              }
            ]
          }
        }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          city: 1
        }
      }
    ];

    const results = await Location.aggregate(pipeline);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Location Autocomplete API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
