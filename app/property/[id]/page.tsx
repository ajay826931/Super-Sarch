import { BadgeCheck, Star, MapPin, Check, Building } from "lucide-react";
import LeadForm from "@/components/LeadForm";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Service from "@/models/Service";
import { notFound } from "next/navigation";

export default async function PropertyDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const { id } = await params;
  
  await dbConnect();

  // Fetch full property and all associated services
  const propertyDoc = await Property.findById(id).lean();
  if (!propertyDoc) {
    return notFound();
  }

  const services = await Service.find({ property_id: id }).lean();
  const availableServices = services.map(s => s.category);

  // If tab is specified in search query, use it; otherwise default to first service category
  const queryTab = await searchParams;
  let activeTab = typeof queryTab?.tab === 'string' ? queryTab.tab : undefined;
  if (!activeTab && services.length > 0) {
    activeTab = services[0].category;
  }

  const activeService = services.find(s => s.category === activeTab) || services[0];
  
  const title = propertyDoc.property_name || propertyDoc.title || "Unknown Property";
  const address = propertyDoc.address || "Address not provided";
  const logo = propertyDoc.business_logo;
  
  const coverPhoto = propertyDoc.cover_photo;

  // Gallery for the currently active tab
  const activeImages = [];
  if (coverPhoto) activeImages.push(coverPhoto);
  
  if (activeService?.service_images?.length) {
    activeImages.push(...activeService.service_images);
  }
  
  if (activeImages.length === 0) {
    activeImages.push("https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg");
  }
  
  const category = activeService?.category || "Property";
  const pricing = activeService?.pricing || {};
  const dynamicAttributes = activeService?.dynamic_attributes || {};
  const amenities = dynamicAttributes.amenities || [];
  
  const singlePrice = dynamicAttributes.single_occupancy_price || pricing.single || pricing.starting_price;
  const doublePrice = dynamicAttributes.double_occupancy_price || pricing.double;

  const rating = 4.8;
  const reviews = 124;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Media Gallery (Swipeable Carousel for Active Tab) */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-gray-200 relative overflow-x-auto snap-x snap-mandatory flex scrollbar-hide">
        {activeImages.map((img: string, index: number) => (
          <div key={index} className="min-w-full h-full snap-center relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`${category} Gallery ${index}`} className="w-full h-full object-cover" />
            <div className="absolute bottom-12 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {index + 1} / {activeImages.length}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Details */}
      <div className="p-5 bg-white rounded-t-3xl -mt-8 relative z-10 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center bg-gray-50">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Building className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight flex items-center">
                {title} <BadgeCheck className="h-6 w-6 text-green-500 ml-2" />
              </h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                <span className="font-bold text-gray-900 mr-1">{rating}</span>
                <span>({reviews} Reviews)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          <span className="truncate">{address}</span>
        </div>

        {/* Tabbed Navigation for Services */}
        {services.length > 1 && (
          <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
            {services.map((svc) => {
              const isActive = svc.category === activeTab;
              return (
                <a
                  key={svc.category}
                  href={`?tab=${svc.category}`}
                  className={`whitespace-nowrap py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {svc.category}
                </a>
              );
            })}
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{category} Pricing</h2>
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Starting Price</span>
              <span className="font-bold text-lg text-primary">
                {singlePrice ? `₹${singlePrice}` : 'Price on request'} <span className="text-sm text-gray-500 font-normal">/ {pricing.price_unit || 'month'}</span>
              </span>
            </div>
            {doublePrice && (
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-gray-700">Double Occupancy</span>
                <span className="font-bold text-lg text-primary">₹{doublePrice}</span>
              </div>
            )}
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-3">{category} Amenities</h3>
            <div className="grid grid-cols-2 gap-y-3">
              {amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zero PII Notice: No vendor contact info is displayed here to ensure leads go through the platform. */}

      {/* Sticky CTA */}
      <LeadForm propertyId={id as string} availableServices={availableServices} />
    </div>
  );
}
