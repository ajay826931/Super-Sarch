import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Vendor from '@/models/Vendor';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch properties that are pending (status is false or null)
    // Populate the vendor to get their details
    const properties = await Property.find({ status: { $ne: true } })
      .populate('vendor_id', 'name phone is_verified unique_vendor_id')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('Admin Vendors API GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    // Approve the Property
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { status: true },
      { new: true }
    );

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Approve the Vendor
    if (property.vendor_id) {
      await Vendor.findByIdAndUpdate(
        property.vendor_id,
        { is_verified: true, status: 'Approved' }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Admin Vendors API PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
