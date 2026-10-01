"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  ArrowRight, 
  Loader2 
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
    </div>
  ),
});

interface SetupWizardProps {
  vendorInfo: {
    name?: string;
    unique_vendor_id?: string;
  };
  onComplete: () => void;
}

export default function VendorSetupWizard({ vendorInfo, onComplete }: SetupWizardProps) {
  const [propertyName, setPropertyName] = useState("");
  const [category, setCategory] = useState("Hostel");
  const [startingPrice, setStartingPrice] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number]>([75.8323, 25.1815]); // Kota default [lng, lat]
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim()) return setError("Please enter your property name.");
    if (!address.trim()) return setError("Please enter your property address in Kota.");
    if (!startingPrice) return setError("Please enter starting price.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: propertyName.trim(),
          address: address.trim(),
          coordinates: coordinates,
          is_setup_completed: true,
          services: [
            {
              category: category,
              pricing: {
                starting_price: Number(startingPrice),
                price_unit: category === "Mess" ? "meal" : "month"
              },
              dynamic_attributes: {
                amenities: ["AC", "Wi-Fi"]
              },
              service_images: []
            }
          ]
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onComplete();
      } else {
        setError(data.error || "Failed to save initial property setup.");
      }
    } catch {
      setError("An error occurred while setting up your property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 md:p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
      {/* Banner / Welcome Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold mb-3">
          <Sparkles className="h-4 w-4" />
          <span>Step 1 of 1: Initial Property Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to KHM, {vendorInfo?.name || "Partner"}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-lg mx-auto">
          Your Vendor ID is <strong className="font-mono text-teal-700 font-bold">{vendorInfo?.unique_vendor_id}</strong>. Set up your property name, location, and rent to get listed in Kota.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-6 text-center font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleFinishSetup} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Property Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Property Name *
            </label>
            <div className="relative">
              <Input
                required
                placeholder="e.g. Royal Boys Hostel & PG / Krishna Residency"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="h-12 pl-10 text-base"
              />
              <Building2 className="h-4 w-4 text-gray-400 absolute left-3.5 top-4" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Primary Business Category *
            </label>
            <select
              className="flex h-12 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Hostel">Hostel</option>
              <option value="PG">PG (Paying Guest)</option>
              <option value="Mess">Mess / Tiffin Center</option>
              <option value="Library">Study Library</option>
              <option value="Laundry">Laundry Service</option>
            </select>
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Starting Price (₹) *
            </label>
            <div className="relative">
              <Input
                required
                type="number"
                placeholder={category === "Mess" ? "3000" : "6500"}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="h-12 pl-10 text-base"
              />
              <IndianRupee className="h-4 w-4 text-gray-400 absolute left-3.5 top-4" />
            </div>
          </div>

          {/* Full Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Readable Address in Kota *
            </label>
            <div className="relative">
              <Input
                required
                placeholder="e.g. Plot No. 14, Landmark City, Kunhari, Kota"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 pl-10 text-base"
              />
              <MapPin className="h-4 w-4 text-gray-400 absolute left-3.5 top-4" />
            </div>
          </div>
        </div>

        {/* Map Location */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Pin Location on Kota Map
              </span>
              <p className="text-[11px] text-gray-500">
                Drag the marker to your exact building so students can view walking distances.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-700 bg-white px-2 py-1 rounded border">
              {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
            </span>
          </div>

          <LeafletMap
            lat={coordinates[1]}
            lng={coordinates[0]}
            onPositionChange={(lat, lng) => setCoordinates([lng, lat])}
          />
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-12 text-base font-bold rounded-xl bg-teal-600 hover:bg-teal-700 shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Completing Setup...
            </>
          ) : (
            <>
              Complete Setup & Open Full Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
