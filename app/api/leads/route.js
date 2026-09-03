import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Lead from '@/models/Lead';

export async function POST(request) {
  try {
    await dbConnect();
    const { studentName, whatsappNumber, targetExam, propertyId } = await request.json();

    if (!whatsappNumber || !studentName || !propertyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create User
    let user = await User.findOne({ phone_number: whatsappNumber });
    if (!user) {
      user = await User.create({
        phone_number: whatsappNumber,
        name: studentName,
      });
    }

    // Create Lead
    const lead = await Lead.create({
      user_id: user._id,
      property_id: propertyId,
      target_exam: targetExam || 'Other',
      status: 'New'
    });

    return NextResponse.json({ success: true, leadId: lead._id });
  } catch (error) {
    console.error('Lead Submission Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
