import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Schemas copied directly since we can't easily import Next.js route models in a plain Node script without transpiler setup
const VendorSchema = new mongoose.Schema({
  unique_vendor_id: { type: String, unique: true, required: true },
  name: { type: String },
  phone: { type: String },
  password_hash: { type: String },
  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const PropertySchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  property_name: { type: String },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  location_version: { type: Number, default: 1 },
  thumbnail_url: { type: String },
  gallery_urls: { type: [String] },
  status: { type: Boolean }
}, { timestamps: true });

const ServiceSchema = new mongoose.Schema({
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  category: { type: String, enum: ['Hostel', 'PG', 'Mess', 'Library', 'Laundry'] },
  pricing: {
    starting_price: { type: Number },
    price_unit: { type: String }
  },
  dynamic_attributes: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create Vendor
    const vendor = await Vendor.create({
      unique_vendor_id: 'V-AJAY-101',
      name: 'ajayraj kushwah',
      phone: '8269313480',
      is_verified: true,
      status: 'Approved'
    });
    console.log('Created Vendor:', vendor.unique_vendor_id);

    // 2. Create Property
    const property = await Property.create({
      vendor_id: vendor._id,
      property_name: 'Ajay Premium Stays',
      address: 'Jawahar Nagar, Kota, Rajasthan',
      location: {
        type: 'Point',
        // Approximate coordinates for Jawahar Nagar, Kota
        coordinates: [75.8361, 25.1633] 
      },
      thumbnail_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      gallery_urls: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'],
      status: true
    });
    console.log('Created Property:', property.property_name);

    // 3. Create Services (All types)
    const services = [
      {
        property_id: property._id,
        category: 'Hostel',
        pricing: { starting_price: 12000, price_unit: 'month' },
        dynamic_attributes: { amenities: ['AC', 'Wi-Fi', 'Laundry', 'Meals Included'] }
      },
      {
        property_id: property._id,
        category: 'PG',
        pricing: { starting_price: 8000, price_unit: 'month' },
        dynamic_attributes: { amenities: ['Non-AC', 'Wi-Fi', 'Attached Washroom'] }
      },
      {
        property_id: property._id,
        category: 'Mess',
        pricing: { starting_price: 3500, price_unit: 'month' },
        dynamic_attributes: { amenities: ['Pure Veg', '3 Meals/Day'] }
      }
    ];

    await Service.insertMany(services);
    console.log('Created Services: Hostel, PG, Mess');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
