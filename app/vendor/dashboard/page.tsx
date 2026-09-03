"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Building, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VendorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableAmenities = ["AC", "Non-AC", "Veg Meals", "Non-Veg Meals", "Wi-Fi", "Laundry", "Attached Washroom", "24x7 Security"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/vendor/property");
      if (res.status === 401) {
        router.push("/vendor/login");
        return;
      }
      
      const json = await res.json();
      if (json.success) {
        setData({
          propertyName: json.data.property.property_name || "",
          thumbnailUrl: json.data.property.thumbnail_url || "",
          rentSingle: json.data.service.pricing?.starting_price || "",
          category: json.data.service.category || "Hostel",
          amenities: json.data.service.dynamic_attributes?.amenities || [],
        });
      } else {
        setError(json.error || "Failed to load data");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/vendor/property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: data.propertyName,
          // Sending only starting price to match our current schema easily, though in a real app we'd map single/double
          pricing: { starting_price: Number(data.rentSingle) },
          category: data.category,
          amenities: data.amenities
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccess("Business details updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Failed to update");
      }
    } catch (err) {
      setError("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setData((prev: any) => {
      const current = prev.amenities;
      const updated = current.includes(amenity) 
        ? current.filter((a: string) => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!data) return <div>Failed to load your property data.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center mb-6 border-b pb-4">
        <Building className="h-6 w-6 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Property</h1>
        
        {/* Zero PII/Security Requirement: Verification is display-only, no toggle */}
        <div className="ml-auto flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 mr-1" />
          KHM Verified
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Name</label>
            <Input 
              required
              value={data.propertyName}
              onChange={(e) => setData({...data, propertyName: e.target.value})}
              placeholder="e.g. Allen Boys Hostel"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Category</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={data.category}
              onChange={(e) => setData({...data, category: e.target.value})}
            >
              <option value="Hostel">Hostel</option>
              <option value="PG">PG</option>
              <option value="Mess">Mess</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Rent (₹/mo)</label>
            <Input 
              required
              type="number"
              value={data.rentSingle}
              onChange={(e) => setData({...data, rentSingle: e.target.value})}
              placeholder="e.g. 8000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image URL</label>
            <Input 
              value={data.thumbnailUrl}
              onChange={(e) => setData({...data, thumbnailUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Available Amenities</label>
          <div className="flex flex-wrap gap-3">
            {availableAmenities.map(amenity => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  data.amenities.includes(amenity) 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t mt-8">
          <Button type="submit" disabled={saving} className="w-full md:w-auto h-12 px-8 text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {saving ? "Saving Changes..." : "Save Property Details"}
          </Button>
        </div>
      </form>
    </div>
  );
}
