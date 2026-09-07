import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  category: { type: String, enum: ['Hostel', 'PG', 'Mess', 'Library', 'Laundry'] },
  pricing: {
    starting_price: { type: Number },
    price_unit: { type: String }
  },
  dynamic_attributes: { type: mongoose.Schema.Types.Mixed },
  service_images: { type: [String] }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
