import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

export async function POST(request) {
  try {
    await dbConnect();
    let { vendorId, phone } = await request.json();
    
    if (phone) {
      phone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
    }

    if (!vendorId || !phone) {
      return NextResponse.json(
        { error: 'Vendor ID and Phone are required' },
        { status: 400 }
      );
    }

    // Step 1: Check if vendor exists
    // We'll also allow creation of a mock vendor for testing purposes if it doesn't exist,
    // since we don't have an admin panel yet to create vendors.
    let vendor = await Vendor.findOne({ unique_vendor_id: vendorId });
    
    if (!vendor) {
      // Mock creation for Sprint 8 testing purposes
      vendor = await Vendor.create({
        unique_vendor_id: vendorId,
        phone: phone,
        status: 'Approved'
      });
    }

    // Step 2: Validate phone
    if (vendor.phone !== phone) {
      return NextResponse.json(
        { error: 'Invalid phone number for this Vendor ID' },
        { status: 401 }
      );
    }

    // Success: Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('vendorToken', vendor._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor Auth Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
