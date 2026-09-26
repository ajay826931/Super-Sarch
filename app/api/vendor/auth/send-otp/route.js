import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    await dbConnect();
    let { vendorId, phone, email } = await request.json();

    if (!vendorId || !phone || !email) {
      return NextResponse.json(
        { error: 'Vendor ID, Mobile Number, and Email are all required.' },
        { status: 400 }
      );
    }

    // Clean inputs
    vendorId = vendorId.trim();
    phone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
    email = email.trim().toLowerCase();

    // Check email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Find vendor or initialize
    let vendor = await Vendor.findOne({ unique_vendor_id: vendorId });

    if (!vendor) {
      // Create new vendor record with phone and email
      vendor = await Vendor.create({
        unique_vendor_id: vendorId,
        phone: phone,
        email: email,
        status: 'Approved'
      });
    } else {
      // If phone already registered, verify it matches
      if (vendor.phone && vendor.phone !== phone) {
        return NextResponse.json(
          { error: 'Registered mobile number does not match.' },
          { status: 401 }
        );
      }

      // If email already registered, verify it matches (or set it if not present)
      if (vendor.email && vendor.email !== email) {
        return NextResponse.json(
          { error: 'Registered email does not match.' },
          { status: 401 }
        );
      }

      if (!vendor.phone) vendor.phone = phone;
      if (!vendor.email) vendor.email = email;
    }

    // Generate 6-digit cryptographically random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    vendor.otp = otp;
    vendor.otpExpires = otpExpires;
    await vendor.save();

    // Send OTP to vendor email
    const mailResult = await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: 'OTP has been sent to your registered email address.',
      simulated: mailResult.simulated || false,
      devOtp: process.env.NODE_ENV !== 'production' && mailResult.simulated ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
