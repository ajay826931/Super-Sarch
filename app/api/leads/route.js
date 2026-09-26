import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Lead from '@/models/Lead';
import Property from '@/models/Property';

export async function POST(request) {
  try {
    await dbConnect();
    const { studentName, whatsappNumber, servicesWanted, studentLocation, propertyId } = await request.json();

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
      services_wanted: servicesWanted || [],
      student_location: studentLocation || '',
      status: 'New'
    });

    // Google Sheets Webhook
    try {
      const property = await Property.findById(propertyId).select('property_name title');
      const propertyName = property ? (property.property_name || property.title || 'Unknown Property') : 'Unknown Property';
      const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
      
      if (webhookUrl) {
        const services_wanted = Array.isArray(servicesWanted) ? servicesWanted : (servicesWanted ? [servicesWanted] : []);
        const student_location = studentLocation || '';

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
          body: JSON.stringify({
            Date: new Date().toISOString(),
            StudentName: studentName,
            WhatsAppNumber: whatsappNumber,
            ServicesWanted: services_wanted.join(", "),
            Location: student_location,
            PropertyName: propertyName,
            PropertyID: propertyId
          })
        });
      }
    } catch (sheetError) {
      console.error('Google Sheet Webhook Error:', sheetError);
      // Fails silently for the user so MongoDB lead creation still succeeds
    }

    return NextResponse.json({ success: true, leadId: lead._id });
  } catch (error) {
    console.error('Lead Submission Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
