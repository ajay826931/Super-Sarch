import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Entity from '@/models/Entity';
import Property from '@/models/Property';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'location' or 'property'

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    await dbConnect();
    const regex = new RegExp(query, 'i');
    let results = [];

    if (type === 'location' || !type) {
      const entities = await Entity.find({ name: { $regex: regex } })
        .limit(5)
        .lean();
      
      results.push(...entities.map(e => ({
        _id: e._id,
        name: e.name,
        type: e.type,
        group: 'Location'
      })));
    }

    if (type === 'property' || !type) {
      const properties = await Property.find({ property_name: { $regex: regex } })
        .limit(5)
        .lean();
      
      results.push(...properties.map(p => ({
        _id: p._id,
        name: p.property_name,
        type: 'Property',
        group: 'Property'
      })));
    }

    // Static categories if matching
    const staticCategories = ['Hostel', 'PG', 'Mess'];
    if (type === 'category') {
      const matchedCats = staticCategories.filter(c => c.toLowerCase().includes(query.toLowerCase()));
      results.push(...matchedCats.map(c => ({
        _id: c,
        name: c,
        type: 'Category',
        group: 'Category'
      })));
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Autocomplete API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
