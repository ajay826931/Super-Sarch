import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  property_name: { type: String },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  location_version: { type: Number, default: 1 },
  business_logo: { type: String },
  cover_photo: { type: String },
  thumbnail_url: { type: String },
  gallery_urls: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 30']
  },
  status: { type: Boolean, default: false },
  is_setup_completed: { type: Boolean, default: false }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length <= 30;
}

PropertySchema.index({ location: '2dsphere' });

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
