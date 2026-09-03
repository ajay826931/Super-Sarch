import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User'; // Ensure registered
import Property from '@/models/Property'; // Ensure registered
import Vendor from '@/models/Vendor'; // Ensure registered

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all leads, populate user and property details, and deep populate vendor for the property
    const leads = await Lead.find()
      .populate('user_id', 'name phone')
      .populate({
        path: 'property_id',
        select: 'property_name vendor_id',
        populate: {
          path: 'vendor_id',
          model: 'Vendor',
          select: 'phone name' // The Vault B data!
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Admin Leads API GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Missing leadId or status' }, { status: 400 });
    }

    const validStatuses = ['New', 'Called', 'Visiting', 'Deal Closed', 'Lost'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error('Admin Leads API PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
