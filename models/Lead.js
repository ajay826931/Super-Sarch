import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  services_wanted: { type: [String] },
  student_location: { type: String },
  budget: { type: Number },
  user_notes: { type: String },
  status: { type: String, enum: ['New', 'Called', 'Visiting', 'Deal Closed', 'Lost'], default: 'New' }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
