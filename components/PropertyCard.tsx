import { Heart, BadgeCheck } from "lucide-react";
import Link from "next/link";

interface PropertyProps {
  property: {
    _id: string;
    title?: string;
    property_name?: string;
    images?: string[];
    thumbnail_url?: string;
    gallery_urls?: string[];
    services?: any[];
    walking_distance?: number;
    walking_time?: number;
  };
}

export default function PropertyCard({ property }: PropertyProps) {
  // Extract info from property object
  const image = property.thumbnail_url || (property.gallery_urls && property.gallery_urls.length > 0 ? property.gallery_urls[0] : null) || (property.images && property.images.length > 0 ? property.images[0] : "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg");
  const service = property.services && property.services.length > 0 ? property.services[0] : null;
  const price = service?.pricing?.starting_price ? `₹${service.pricing.starting_price}/mo` : "Price on request";
  const amenities = service?.dynamic_attributes?.amenities || ["AC", "Veg"];
  const category = service?.category || "Property";
  const title = property.property_name || property.title || "Unknown Property";
  
  // Format distance tag
  const distanceStr = property.walking_distance 
    ? `🚶‍♂️ ${Math.ceil((property.walking_time || 0) / 60)} Mins Walk (${property.walking_distance}m)`
    : "Distance unknown";

  return (
    <Link href={`/property/${property._id}`} className="block">
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 relative hover:shadow-md transition">
        {/* Top half: Image with overlay */}
        <div className="relative h-48 w-full bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition">
            <Heart className="h-5 w-5 text-white" />
          </button>
          {property.walking_distance && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-sm font-semibold px-3 py-1 rounded-full text-gray-800 shadow flex items-center">
              {distanceStr}
            </div>
          )}
        </div>

        {/* Bottom half: Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {title}
            </h3>
            <BadgeCheck className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">{category}</span>
            <span className="text-primary font-bold text-lg">{price}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity: string, idx: number) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
