import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phone_number: { type: String, unique: true, required: true },
  name: { type: String },
  default_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
