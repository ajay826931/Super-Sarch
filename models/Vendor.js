import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  unique_vendor_id: { type: String, unique: true, required: true },
  name: { type: String },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  password_hash: { type: String },
  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
