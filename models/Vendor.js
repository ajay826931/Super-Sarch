import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  unique_vendor_id: { type: String, unique: true, required: true },
  name: { type: String },
  phone: { type: String },
  password_hash: { type: String },
  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
