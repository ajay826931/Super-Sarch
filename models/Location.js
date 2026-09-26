import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  normalized_name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Kota'
  },
  state: {
    type: String,
    default: 'Rajasthan'
  },
  aliases: {
    type: [String],
    default: []
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

LocationSchema.index({ location: '2dsphere' });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
