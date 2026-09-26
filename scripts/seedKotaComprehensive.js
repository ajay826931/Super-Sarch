import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'node:dns';

// Fix DNS SRV lookup on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define Schemas for Seeding
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  normalized_name: { type: String, required: true, lowercase: true },
  city: { type: String, default: 'Kota' },
  state: { type: String, default: 'Rajasthan' },
  aliases: { type: [String], default: [] },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });
LocationSchema.index({ location: '2dsphere' });

const EntitySchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String, enum: ['Coaching', 'Institute', 'Area', 'Landmark'] },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  status: { type: Boolean }
}, { timestamps: true });
EntitySchema.index({ location: '2dsphere' });

const VendorSchema = new mongoose.Schema({
  unique_vendor_id: { type: String, unique: true, required: true },
  name: { type: String },
  phone: { type: String },
  is_verified: { type: Boolean, default: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' }
}, { timestamps: true });

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
  gallery_urls: { type: [String] },
  status: { type: Boolean, default: true }
}, { timestamps: true });
PropertySchema.index({ location: '2dsphere' });

const ServiceSchema = new mongoose.Schema({
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  category: { type: String, enum: ['Hostel', 'PG', 'Mess', 'Library', 'Laundry'] },
  pricing: {
    starting_price: { type: Number },
    price_unit: { type: String, default: 'month' }
  },
  dynamic_attributes: { type: mongoose.Schema.Types.Mixed },
  service_images: { type: [String] }
}, { timestamps: true });

const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);
const Entity = mongoose.models.Entity || mongoose.model('Entity', EntitySchema);
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

// Curated stock images for high visual appeal
const roomImages = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=800&q=80"
];

const messImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80"
];

const libraryImages = [
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
];

// Major Real Kota Locations and Coaching Hubs
const KOTA_LOCATIONS = [
  {
    name: "Allen Sankalp (IPIA)",
    normalized_name: "allen sankalp ipia",
    city: "Kota",
    state: "Rajasthan",
    type: "Coaching",
    aliases: ["Sankalp", "Allen IPIA", "Road No 1", "Allen Career Institute Sankalp"],
    coordinates: [75.8504, 25.1396] // [lng, lat]
  },
  {
    name: "Jawahar Nagar",
    normalized_name: "jawahar nagar",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Jawahar Nagar Kota", "JN", "Sector A Jawahar Nagar", "City Mall Area"],
    coordinates: [75.8525, 25.1435]
  },
  {
    name: "Landmark City (Kunhari)",
    normalized_name: "landmark city kunhari",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Landmark City", "Kunhadi", "Kunhari", "Landmark Kunhari"],
    coordinates: [75.8365, 25.2185]
  },
  {
    name: "Allen Samyak (Landmark City)",
    normalized_name: "allen samyak landmark city",
    city: "Kota",
    state: "Rajasthan",
    type: "Coaching",
    aliases: ["Samyak", "Allen Kunhari", "Allen Samyak"],
    coordinates: [75.8358, 25.2192]
  },
  {
    name: "Rajeev Gandhi Nagar",
    normalized_name: "rajeev gandhi nagar",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["RGN", "Rajeev Gandhi Nagar Kota", "Electronic Complex"],
    coordinates: [75.8592, 25.1378]
  },
  {
    name: "Vigyan Nagar",
    normalized_name: "vigyan nagar",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Vigyan Nagar Kota", "Resonance Area", "Aerodrome Circle"],
    coordinates: [75.8455, 25.1325]
  },
  {
    name: "Motion Education (Vigyan Nagar)",
    normalized_name: "motion education vigyan nagar",
    city: "Kota",
    state: "Rajasthan",
    type: "Coaching",
    aliases: ["Motion", "Motion Kota", "NV Sir Motion", "Motion Dron Campus"],
    coordinates: [75.8462, 25.1331]
  },
  {
    name: "Resonance (CG Tower)",
    normalized_name: "resonance cg tower",
    city: "Kota",
    state: "Rajasthan",
    type: "Coaching",
    aliases: ["Reso", "Resonance Kota", "CG Tower Resonance", "RK Sir Reso"],
    coordinates: [75.8545, 25.1458]
  },
  {
    name: "Talwandi",
    normalized_name: "talwandi",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Talwandi Kota", "Commerce College", "Sector 4 Talwandi"],
    coordinates: [75.8425, 25.1518]
  },
  {
    name: "Mahaveer Nagar",
    normalized_name: "mahaveer nagar",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Mahaveer Nagar 1", "Mahaveer Nagar 2", "MN2", "Mahaveer Nagar Ext"],
    coordinates: [75.8485, 25.1585]
  },
  {
    name: "Dadabari",
    normalized_name: "dadabari",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Dadabari Kota", "Chawani", "Gumanpura", "Dadabari Circle"],
    coordinates: [75.8355, 25.1685]
  },
  {
    name: "Coral Park",
    normalized_name: "coral park",
    city: "Kota",
    state: "Rajasthan",
    type: "Area",
    aliases: ["Coral Park Kota", "Baran Road"],
    coordinates: [75.8920, 25.1480]
  }
];

// 25+ Comprehensive Properties across Kota
const PROPERTIES_DATA = [
  // --- JAWAHAR NAGAR ---
  {
    name: "Shree Krishna Deluxe Boys Hostel",
    address: "Plot 12-A, Road No. 1, Near Allen Sankalp, Jawahar Nagar, Kota",
    coordinates: [75.8512, 25.1402],
    vendorName: "Manoj Sharma",
    vendorPhone: "9829011221",
    services: [
      {
        category: "Hostel",
        starting_price: 11500,
        dynamic_attributes: {
          single_occupancy_price: 13500,
          double_occupancy_price: 10500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Study Table", "Security", "Laundry"]
        }
      },
      {
        category: "Mess",
        starting_price: 3600,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Tiffin Availability"]
        }
      }
    ]
  },
  {
    name: "Radha Rani Premium Girls Hostel",
    address: "A-45, Sector A, Near City Mall, Jawahar Nagar, Kota",
    coordinates: [75.8530, 25.1440],
    vendorName: "Sunita Agarwal",
    vendorPhone: "9829011222",
    services: [
      {
        category: "Hostel",
        starting_price: 12500,
        dynamic_attributes: {
          single_occupancy_price: 14500,
          double_occupancy_price: 11000,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Housekeeping", "Biometric Entry"]
        }
      }
    ]
  },
  {
    name: "Elite Scholar AC PG for Boys",
    address: "Plot 88, Road No. 2, Jawahar Nagar, Kota",
    coordinates: [75.8520, 25.1415],
    vendorName: "Vikram Rathore",
    vendorPhone: "9829011223",
    services: [
      {
        category: "PG",
        starting_price: 8500,
        dynamic_attributes: {
          single_occupancy_price: 10000,
          double_occupancy_price: 7500,
          amenities: ["AC", "Wi-Fi", "Study Table", "Almirah", "Housekeeping", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Annapurna Pure Veg Tiffin & Mess",
    address: "Shop 14, Commercial Center, Jawahar Nagar, Kota",
    coordinates: [75.8528, 25.1428],
    vendorName: "Rakesh Jain",
    vendorPhone: "9829011224",
    services: [
      {
        category: "Mess",
        starting_price: 3500,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Delivery/Pickup", "Tiffin Availability"]
        }
      }
    ]
  },
  {
    name: "Focus Zone 24x7 Digital Library",
    address: "2nd Floor, Jawahar Plaza, Near Allen Samarth, Jawahar Nagar, Kota",
    coordinates: [75.8518, 25.1422],
    vendorName: "Deepak Meena",
    vendorPhone: "9829011225",
    services: [
      {
        category: "Library",
        starting_price: 1200,
        dynamic_attributes: {
          amenities: ["AC", "Wi-Fi", "Study Desk", "Charging Points", "Power Backup", "24x7 Availability"]
        }
      }
    ]
  },

  // --- LANDMARK CITY (KUNHARI) ---
  {
    name: "Landmark Pride Boys Residency",
    address: "Block B-10, Near Allen Samyak Campus, Landmark City, Kunhari, Kota",
    coordinates: [75.8362, 25.2188],
    vendorName: "Surendra Choudhary",
    vendorPhone: "9829022331",
    services: [
      {
        category: "Hostel",
        starting_price: 11000,
        dynamic_attributes: {
          single_occupancy_price: 13000,
          double_occupancy_price: 9500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Study Table", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Gargi Royal Girls Hostel",
    address: "Sector 2, Near Sangyan Campus, Landmark City, Kunhari, Kota",
    coordinates: [75.8345, 25.2215],
    vendorName: "Meenakshi Gupta",
    vendorPhone: "9829022332",
    services: [
      {
        category: "Hostel",
        starting_price: 12000,
        dynamic_attributes: {
          single_occupancy_price: 14000,
          double_occupancy_price: 10500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Housekeeping", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Kunhari Comfort Boys PG",
    address: "Street 4, Landmark Commercial Belt, Kunhari, Kota",
    coordinates: [75.8375, 25.2160],
    vendorName: "Rajesh Soni",
    vendorPhone: "9829022333",
    services: [
      {
        category: "PG",
        starting_price: 7500,
        dynamic_attributes: {
          single_occupancy_price: 9000,
          double_occupancy_price: 6500,
          amenities: ["AC", "Non-AC", "Wi-Fi", "Housekeeping", "Attached Washroom"]
        }
      }
    ]
  },
  {
    name: "Mother's Touch Healthy Kitchen (Mess)",
    address: "Main Market, Landmark City, Kunhari, Kota",
    coordinates: [75.8368, 25.2175],
    vendorName: "Sanjay Verma",
    vendorPhone: "9829022334",
    services: [
      {
        category: "Mess",
        starting_price: 3400,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Delivery/Pickup"]
        }
      }
    ]
  },
  {
    name: "Rankers Point AC Self-Study Library",
    address: "Landmark Complex, Near Samyak, Kunhari, Kota",
    coordinates: [75.8359, 25.2198],
    vendorName: "Pradeep Joshi",
    vendorPhone: "9829022335",
    services: [
      {
        category: "Library",
        starting_price: 1100,
        dynamic_attributes: {
          amenities: ["AC", "Wi-Fi", "Study Desk", "Charging Points", "Power Backup", "24x7 Availability"]
        }
      }
    ]
  },

  // --- RAJEEV GANDHI NAGAR ---
  {
    name: "Apex Luxury Residency for Boys",
    address: "Plot 30, Electronic Complex, Rajeev Gandhi Nagar, Kota",
    coordinates: [75.8598, 25.1382],
    vendorName: "Dinesh Khandelwal",
    vendorPhone: "9829033441",
    services: [
      {
        category: "Hostel",
        starting_price: 12000,
        dynamic_attributes: {
          single_occupancy_price: 14000,
          double_occupancy_price: 10500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Laundry"]
        }
      },
      {
        category: "PG",
        starting_price: 8500,
        dynamic_attributes: {
          amenities: ["AC", "Wi-Fi", "Housekeeping", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Shivay Girls Haven Hostel",
    address: "Near Road No. 1, Rajeev Gandhi Nagar, Kota",
    coordinates: [75.8585, 25.1370],
    vendorName: "Pooja Trivedi",
    vendorPhone: "9829033442",
    services: [
      {
        category: "Hostel",
        starting_price: 13000,
        dynamic_attributes: {
          single_occupancy_price: 15000,
          double_occupancy_price: 11500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Housekeeping", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Kota Food Hub & Pure Veg Tiffin",
    address: "Electronic Complex Circle, Rajeev Gandhi Nagar, Kota",
    coordinates: [75.8590, 25.1375],
    vendorName: "Gopal Mittal",
    vendorPhone: "9829033443",
    services: [
      {
        category: "Mess",
        starting_price: 3600,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Tiffin Availability"]
        }
      }
    ]
  },

  // --- VIGYAN NAGAR ---
  {
    name: "Reso-Heights Boys Hostel",
    address: "Behind CG Tower, Near Motion, Vigyan Nagar, Kota",
    coordinates: [75.8458, 25.1329],
    vendorName: "Anil Singhal",
    vendorPhone: "9829044551",
    services: [
      {
        category: "Hostel",
        starting_price: 10500,
        dynamic_attributes: {
          single_occupancy_price: 12500,
          double_occupancy_price: 9000,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Study Table", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Surya Sunshine PG for Girls",
    address: "Sector 2, Near Resonance, Vigyan Nagar, Kota",
    coordinates: [75.8465, 25.1338],
    vendorName: "Kavita Yadav",
    vendorPhone: "9829044552",
    services: [
      {
        category: "PG",
        starting_price: 8000,
        dynamic_attributes: {
          single_occupancy_price: 9500,
          double_occupancy_price: 7000,
          amenities: ["AC", "Wi-Fi", "Housekeeping", "Attached Washroom", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Jain Rasoi & Satvik Bhojanalaya",
    address: "Main Road, Vigyan Nagar, Kota",
    coordinates: [75.8450, 25.1320],
    vendorName: "Vimal Jain",
    vendorPhone: "9829044553",
    services: [
      {
        category: "Mess",
        starting_price: 3800,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Delivery/Pickup"]
        }
      }
    ]
  },
  {
    name: "Scholar Den 24-Hour AC Library",
    address: "Aerodrome Circle, Vigyan Nagar, Kota",
    coordinates: [75.8470, 25.1345],
    vendorName: "Hemant Tiwari",
    vendorPhone: "9829044554",
    services: [
      {
        category: "Library",
        starting_price: 1000,
        dynamic_attributes: {
          amenities: ["AC", "Wi-Fi", "Study Desk", "Charging Points", "Power Backup", "24x7 Availability"]
        }
      }
    ]
  },

  // --- TALWANDI & MAHAVEER NAGAR ---
  {
    name: "Talwandi Scholar Nest Boys Hostel",
    address: "Sector 4, Near Commerce College Circle, Talwandi, Kota",
    coordinates: [75.8430, 25.1522],
    vendorName: "Ashok Parihar",
    vendorPhone: "9829055661",
    services: [
      {
        category: "Hostel",
        starting_price: 11000,
        dynamic_attributes: {
          single_occupancy_price: 13000,
          double_occupancy_price: 9500,
          amenities: ["AC", "Wi-Fi", "Attached Washroom", "Food Availability", "Security", "Study Table", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Chhabra Stays Executive Girls PG",
    address: "Street 7, Talwandi, Kota",
    coordinates: [75.8418, 25.1510],
    vendorName: "Suman Chhabra",
    vendorPhone: "9829055662",
    services: [
      {
        category: "PG",
        starting_price: 8500,
        dynamic_attributes: {
          single_occupancy_price: 10000,
          double_occupancy_price: 7500,
          amenities: ["AC", "Wi-Fi", "Housekeeping", "Attached Washroom", "Security"]
        }
      }
    ]
  },
  {
    name: "Mahaveer Heights Boys & Girls PG",
    address: "Mahaveer Nagar Extension, Near Rangbari Road, Kota",
    coordinates: [75.8490, 25.1590],
    vendorName: "Narendra Bhati",
    vendorPhone: "9829055663",
    services: [
      {
        category: "PG",
        starting_price: 7800,
        dynamic_attributes: {
          single_occupancy_price: 9200,
          double_occupancy_price: 6800,
          amenities: ["AC", "Non-AC", "Wi-Fi", "Housekeeping", "Laundry"]
        }
      }
    ]
  },
  {
    name: "Mahalaxmi Swadist Bhojanalaya",
    address: "Talwandi Main Circle, Kota",
    coordinates: [75.8422, 25.1515],
    vendorName: "Kailash Chand",
    vendorPhone: "9829055664",
    services: [
      {
        category: "Mess",
        starting_price: 3300,
        dynamic_attributes: {
          amenities: ["Veg", "Breakfast", "Lunch", "Dinner", "Tiffin Availability"]
        }
      }
    ]
  },
  {
    name: "Dadabari Peaceful Stays PG",
    address: "Near Dadabari Chawani, Dadabari, Kota",
    coordinates: [75.8358, 25.1688],
    vendorName: "Mohan Lal",
    vendorPhone: "9829055665",
    services: [
      {
        category: "PG",
        starting_price: 7000,
        dynamic_attributes: {
          single_occupancy_price: 8500,
          double_occupancy_price: 6000,
          amenities: ["Non-AC", "Wi-Fi", "Attached Washroom", "Housekeeping"]
        }
      }
    ]
  }
];

async function seedKota() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // 1. Seed Locations (models/Location.js)
    console.log('\n--- 1. Seeding Location Entities (models/Location.js) ---');
    for (const loc of KOTA_LOCATIONS) {
      await Location.findOneAndUpdate(
        { normalized_name: loc.normalized_name },
        {
          name: loc.name,
          normalized_name: loc.normalized_name,
          city: loc.city,
          state: loc.state,
          aliases: loc.aliases,
          location: {
            type: 'Point',
            coordinates: loc.coordinates
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Inserted/Updated ${KOTA_LOCATIONS.length} Location documents.`);

    // 2. Seed Legacy Entity (models/Entity.js for autocomplete compatibility)
    console.log('\n--- 2. Seeding Autocomplete Entities (models/Entity.js) ---');
    for (const loc of KOTA_LOCATIONS) {
      await Entity.findOneAndUpdate(
        { name: loc.name },
        {
          name: loc.name,
          type: loc.type,
          location: {
            type: 'Point',
            coordinates: loc.coordinates
          },
          status: true
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Inserted/Updated ${KOTA_LOCATIONS.length} Entity documents.`);

    // 3. Seed Vendors, Properties, and Services
    console.log('\n--- 3. Seeding Properties, Vendors & Services ---');
    let propertyCount = 0;
    let serviceCount = 0;

    for (let i = 0; i < PROPERTIES_DATA.length; i++) {
      const pData = PROPERTIES_DATA[i];
      const vendorId = `V-KOTA-${100 + i}`;

      // Upsert Vendor
      const vendor = await Vendor.findOneAndUpdate(
        { unique_vendor_id: vendorId },
        {
          name: pData.vendorName,
          phone: pData.vendorPhone,
          is_verified: true,
          status: 'Approved'
        },
        { upsert: true, new: true }
      );

      // Select clean stock room image based on index
      const coverPhoto = roomImages[i % roomImages.length];
      const gallery = [
        coverPhoto,
        roomImages[(i + 1) % roomImages.length],
        roomImages[(i + 2) % roomImages.length]
      ];

      // Upsert Property
      const property = await Property.findOneAndUpdate(
        { property_name: pData.name },
        {
          vendor_id: vendor._id,
          property_name: pData.name,
          address: pData.address,
          location: {
            type: 'Point',
            coordinates: pData.coordinates
          },
          business_logo: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=200&q=80",
          cover_photo: coverPhoto,
          thumbnail_url: coverPhoto,
          gallery_urls: gallery,
          status: true
        },
        { upsert: true, new: true }
      );
      propertyCount++;

      // Create Services for this property
      for (const sData of pData.services) {
        let serviceImages = [coverPhoto];
        if (sData.category === 'Mess') serviceImages = messImages;
        if (sData.category === 'Library') serviceImages = libraryImages;

        await Service.findOneAndUpdate(
          { property_id: property._id, category: sData.category },
          {
            property_id: property._id,
            category: sData.category,
            pricing: {
              starting_price: sData.starting_price,
              price_unit: 'month'
            },
            dynamic_attributes: sData.dynamic_attributes,
            service_images: serviceImages
          },
          { upsert: true, new: true }
        );
        serviceCount++;
      }
    }

    console.log(`Successfully seeded ${propertyCount} Properties and ${serviceCount} Services!`);
    console.log('\n======================================================');
    console.log(' KOTA DATA SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedKota();
