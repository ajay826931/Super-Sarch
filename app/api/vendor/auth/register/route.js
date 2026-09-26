import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    await dbConnect();
    let { name, phone, email } = await request.json();

    // Validations
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, Mobile Number, and Email are all required.' },
        { status: 400 }
      );
    }

    phone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
    email = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Check if phone or email already registered
    const existingVendor = await Vendor.findOne({
      $or: [{ email: email }, { phone: phone }]
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: 'This email or mobile number is already registered. Please login.' },
        { status: 409 }
      );
    }

    // Generate unique vendor ID (e.g., KV-4819)
    let uniqueId = '';
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      uniqueId = `KV-${randomNum}`;
      const found = await Vendor.findOne({ unique_vendor_id: uniqueId });
      if (!found) isUnique = true;
    }

    // 6-digit OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Create Vendor only with basic details
    await Vendor.create({
      unique_vendor_id: uniqueId,
      name: name.trim(),
      phone: phone,
      email: email,
      otp: otp,
      otpExpires: otpExpires,
      is_verified: false,
      status: 'Approved'
    });

    // Send OTP verification email
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Verification OTP has been sent to your email.',
      vendorId: uniqueId,
      email: email
    });
  } catch (error) {
    console.error('Vendor Register Error:', error);
    return NextResponse.json(
      { error: 'Registration failed due to a server error. Please try again.' },
      { status: 500 }
    );
  }
}
