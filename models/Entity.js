import mongoose from 'mongoose';

const EntitySchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String, enum: ['Coaching', 'Institute', 'Area', 'Landmark'] },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  status: { type: Boolean }
}, { timestamps: true });

EntitySchema.index({ location: '2dsphere' });

export default mongoose.models.Entity || mongoose.model('Entity', EntitySchema);
