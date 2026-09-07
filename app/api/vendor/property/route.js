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

    let property = await Property.findOne({ vendor_id: vendor._id }).select('property_name address location business_logo cover_photo thumbnail_url gallery_urls status');
    
    // Auto-create for testing if it doesn't exist
    if (!property) {
      property = await Property.create({
        vendor_id: vendor._id,
        property_name: "My New Property",
        address: "Kota",
        location: { type: 'Point', coordinates: [75.83, 25.18] }
      });
    }

    // Fetch all services belonging to this property
    let services = await Service.find({ property_id: property._id }).select('category pricing dynamic_attributes service_images');
    
    // Auto-create at least one service if none exist
    if (services.length === 0) {
      const newService = await Service.create({
        property_id: property._id,
        category: 'Hostel',
        pricing: { starting_price: 5000, price_unit: 'month' },
        dynamic_attributes: { amenities: ['AC', 'Wi-Fi'] },
        service_images: []
      });
      services = [newService];
    }

    return NextResponse.json({
      success: true,
      data: {
        property,
        services
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
    console.log("PATCH /api/vendor/property Payload:", updates);
    
    // Validate we have a property for this vendor
    const property = await Property.findOne({ vendor_id: vendor._id });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (updates.property_name !== undefined) {
      property.property_name = updates.property_name;
    }
    if (updates.address !== undefined) {
      property.address = updates.address;
    }
    if (updates.coordinates !== undefined && Array.isArray(updates.coordinates) && updates.coordinates.length === 2) {
      property.location = {
        type: 'Point',
        coordinates: updates.coordinates // [lng, lat]
      };
    }
    if (updates.business_logo !== undefined) {
      property.business_logo = updates.business_logo;
    }
    if (updates.cover_photo !== undefined) {
      property.cover_photo = updates.cover_photo;
    }
    if (updates.thumbnail_url !== undefined) {
      property.thumbnail_url = updates.thumbnail_url;
    }
    if (updates.gallery_urls !== undefined) {
      property.gallery_urls = updates.gallery_urls;
    }
    // Note: intentionally NOT allowing updates to 'status' or verification badges
    await property.save();

    // Synchronize Services if an array is provided and valid
    if (updates.services && Array.isArray(updates.services)) {
      const existingServices = await Service.find({ property_id: property._id });
      const existingIds = existingServices.map(s => s._id.toString());
      
      const incomingServices = updates.services;
      const incomingIds = incomingServices.map(s => s._id).filter(id => id);

      // Validate no duplicate categories in incoming payload
      const categorySet = new Set();
      for (const s of incomingServices) {
        if (!s.category) continue;
        if (categorySet.has(s.category)) {
          return NextResponse.json({ error: `Duplicate service category not allowed: ${s.category}` }, { status: 400 });
        }
        categorySet.add(s.category);
      }

      // Delete removed services securely
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (idsToDelete.length > 0) {
        await Service.deleteMany({ _id: { $in: idsToDelete }, property_id: property._id });
      }

      // Update existing or Create new services
      for (const incomingService of incomingServices) {
        if (!incomingService.category) continue; // Category is required

        // Ensure proper typed nested structures for dynamic_attributes
        const servicePayload = {
          category: incomingService.category,
          pricing: incomingService.pricing || {},
          dynamic_attributes: incomingService.dynamic_attributes || {},
          service_images: incomingService.service_images || []
        };

        if (incomingService._id && existingIds.includes(incomingService._id)) {
          // Update existing service
          await Service.findOneAndUpdate(
            { _id: incomingService._id, property_id: property._id }, // Strict authorization check
            { $set: servicePayload },
            { new: true }
          );
        } else {
          // Create new service
          await Service.create({
            property_id: property._id,
            ...servicePayload
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Vendor API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
