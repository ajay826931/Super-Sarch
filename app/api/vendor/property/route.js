import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import Property from '@/models/Property';
import Service from '@/models/Service';

// Authentication middleware helper
async function getAuthenticatedVendor() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vendorToken')?.value;
  if (!token) return null;
  
  await dbConnect();
  try {
    const vendor = await Vendor.findById(token);
    return vendor;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const vendor = await getAuthenticatedVendor();
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let property = await Property.findOne({ vendor_id: vendor._id });
    
    // Auto-create for testing if it doesn't exist
    if (!property) {
      property = await Property.create({
        vendor_id: vendor._id,
        property_name: "My New Property",
        address: "Kota",
        location: { type: 'Point', coordinates: [75.83, 25.18] }
      });
    }

    let service = await Service.findOne({ property_id: property._id });
    if (!service) {
      service = await Service.create({
        property_id: property._id,
        category: 'Hostel',
        pricing: { starting_price: 5000, price_unit: 'month' },
        dynamic_attributes: { amenities: ['AC', 'Wi-Fi'] }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        property,
        service
      }
    });
  } catch (error) {
    console.error('Vendor API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const vendor = await getAuthenticatedVendor();
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Validate we have a property
    const property = await Property.findOne({ vendor_id: vendor._id });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update Property details (e.g. name)
    if (updates.property_name) {
      property.property_name = updates.property_name;
      // Note: intentionally NOT allowing updates to 'status' or verification badges
      await property.save();
    }

    // Update Service details (e.g. rent, amenities)
    const service = await Service.findOne({ property_id: property._id });
    if (service) {
      if (updates.pricing) {
        service.pricing = { ...service.pricing, ...updates.pricing };
      }
      if (updates.amenities) {
        service.dynamic_attributes = { 
          ...service.dynamic_attributes, 
          amenities: updates.amenities 
        };
      }
      if (updates.category) {
        service.category = updates.category;
      }
      await service.save();
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Vendor API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
