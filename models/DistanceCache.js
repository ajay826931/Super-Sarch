import mongoose from 'mongoose';

const DistanceCacheSchema = new mongoose.Schema({
  cache_key: { type: String, unique: true, required: true },
  distance_meters: { type: Number },
  duration_seconds: { type: Number },
  expires_at: { type: Date }
}, { timestamps: true });

DistanceCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.DistanceCache || mongoose.model('DistanceCache', DistanceCacheSchema);
