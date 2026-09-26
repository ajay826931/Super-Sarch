import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import { signVendorToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();
    let { vendorId, email, otp } = await request.json();

    if (!vendorId || !email || !otp) {
      return NextResponse.json(
        { error: 'Vendor ID, Email, and OTP are all required.' },
        { status: 400 }
      );
    }

    vendorId = vendorId.trim();
    email = email.trim().toLowerCase();
    otp = otp.trim();

    const vendor = await Vendor.findOne({ unique_vendor_id: vendorId, email: email });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor account not found.' },
        { status: 404 }
      );
    }

    // Verify OTP
    if (!vendor.otp || vendor.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP entered. Please check and try again.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > new Date(vendor.otpExpires)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Clear OTP after successful verification & set verified
    vendor.otp = undefined;
    vendor.otpExpires = undefined;
    vendor.is_verified = true;
    await vendor.save();

    // Generate JWT token containing vendor payload
    const token = signVendorToken({
      vendorId: vendor._id.toString(),
      unique_vendor_id: vendor.unique_vendor_id,
      email: vendor.email,
      phone: vendor.phone,
    });

    // Set secure HTTP-only cookie with JWT
    const cookieStore = await cookies();
    cookieStore.set('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      vendor: {
        id: vendor._id,
        unique_vendor_id: vendor.unique_vendor_id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification. Please try again.' },
      { status: 500 }
    );
  }
}
