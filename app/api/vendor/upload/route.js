import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import cloudinary from '@/lib/cloudinary';

import { verifyVendorToken } from '@/lib/jwt';

// Verify authentication for upload API
async function authenticateVendor() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vendorToken')?.value;
  if (!token) return null;
  
  await dbConnect();
  try {
    const decoded = verifyVendorToken(token);
    if (decoded && decoded.vendorId) {
      const vendor = await Vendor.findById(decoded.vendorId);
      return vendor;
    }
    const vendor = await Vendor.findById(token);
    return vendor;
  } catch (err) {
    return null;
  }
}

export async function POST(request) {
  try {
    const vendor = await authenticateVendor();
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Server-side safety limit: 2MB max
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be smaller than 2MB' }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary upload stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: `khm_properties/${vendor.unique_vendor_id}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // End the stream with the buffer
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      url: uploadResponse.secure_url 
    });
    
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error during upload' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const vendor = await authenticateVendor();
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) {
       return NextResponse.json({ error: 'Invalid Cloudinary URL' }, { status: 400 });
    }
    
    let pathPart = parts[1];
    // Remove version like v123456/
    pathPart = pathPart.replace(/^v\d+\//, '');
    
    // Remove extension
    const publicId = pathPart.substring(0, pathPart.lastIndexOf('.')) || pathPart;

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error during deletion' }, { status: 500 });
  }
}
