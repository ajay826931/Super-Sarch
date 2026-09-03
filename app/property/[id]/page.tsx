"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, Star, MapPin, Check } from "lucide-react";
import LeadForm from "@/components/LeadForm";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, you would fetch the property details using the `id`.
  // For this sprint, we'll simulate a fetch with dummy data to build the UI layout.
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setProperty({
        _id: id,
        title: "Premium Boys Hostel near Allen",
        images: [
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
        ],
        rating: 4.8,
        reviews: 124,
        address: "Rajeev Gandhi Nagar, Kota",
        pricing: {
          single: 12000,
          double: 8000
        },
        amenities: ["AC", "Veg Meals", "Laundry", "24x7 Security", "Wi-Fi", "Attached Washroom", "Study Table"]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading details...</div>;
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">Property not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Media Gallery (Swipeable Placeholder) */}
      <div className="w-full h-[60vh] bg-gray-200 relative overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
        {property.images.map((img: string, index: number) => (
          <div key={index} className="min-w-full h-full snap-center relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {index + 1} / {property.images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Details */}
      <div className="p-5 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight pr-4">
            {property.title}
          </h1>
          <BadgeCheck className="h-7 w-7 text-green-500 flex-shrink-0" />
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
          <span className="font-bold text-gray-900 mr-1">{property.rating}</span>
          <span>({property.reviews} Reviews)</span>
          <span className="mx-2">•</span>
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{property.address}</span>
        </div>

        <div className="border-t border-b py-4 my-4">
          <h3 className="font-bold text-lg mb-3">Room Pricing (Per Month)</h3>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2">
            <span className="font-medium text-gray-700">Single Occupancy</span>
            <span className="font-bold text-lg text-primary">₹{property.pricing.single}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-700">Double Occupancy</span>
            <span className="font-bold text-lg text-primary">₹{property.pricing.double}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">Amenities</h3>
          <div className="grid grid-cols-2 gap-y-3">
            {property.amenities.map((amenity: string, idx: number) => (
              <div key={idx} className="flex items-center text-gray-700">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zero PII Notice: No vendor contact info is displayed here to ensure leads go through the platform. */}

      {/* Sticky CTA */}
      <LeadForm propertyId={id as string} />
    </div>
  );
}
