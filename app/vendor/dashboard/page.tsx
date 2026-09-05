"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Building, ShieldCheck, UploadCloud, X, Image as ImageIcon, Plus, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/imageUtils";

const amenitySchemas: Record<string, string[]> = {
  Hostel: ["AC", "Non-AC", "Attached Washroom", "Wi-Fi", "Study Table", "Almirah", "Security", "Laundry", "Food Availability"],
  PG: ["AC", "Non-AC", "Attached Washroom", "Wi-Fi", "Food Availability", "Security", "Housekeeping", "Laundry"],
  Mess: ["Veg", "Non-Veg", "Breakfast", "Lunch", "Dinner", "Tiffin Availability", "Delivery/Pickup"],
  Library: ["AC", "Wi-Fi", "Study Desk", "Charging Points", "Power Backup", "24x7 Availability"],
  Laundry: ["Washing", "Ironing", "Dry Cleaning", "Pickup & Delivery"]
};

export default function VendorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingService, setEditingService] = useState<any>(null);

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
          galleryUrls: json.data.property.gallery_urls || [],
          services: json.data.services || [],
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (data.galleryUrls.length + files.length > 30) {
      setError("Maximum 30 images allowed per property.");
      return;
    }

    setUploading(true);
    setError("");
    
    let newGallery = [...data.galleryUrls];
    let newThumbnail = data.thumbnailUrl;
    let failedUploads: string[] = [];
    let sizeErrors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          sizeErrors.push(file.name);
          continue;
        }

        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressedFile);

        const res = await fetch("/api/vendor/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await res.json();
        if (uploadData.success) {
          newGallery.push(uploadData.url);
          if (!newThumbnail) {
            newThumbnail = uploadData.url;
          }
        } else {
          failedUploads.push(file.name);
        }
      }

      setData({ ...data, galleryUrls: newGallery, thumbnailUrl: newThumbnail });
      
      let errorMessage = "";
      if (sizeErrors.length > 0) errorMessage += `Files larger than 5MB skipped: ${sizeErrors.join(", ")}. `;
      if (failedUploads.length > 0) errorMessage += `Failed to upload: ${failedUploads.join(", ")}.`;
      if (errorMessage) setError(errorMessage.trim());
    } catch (err) {
      console.error(err);
      setError("Error uploading images. Please try again.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = async (urlToRemove: string) => {
    try {
      await fetch("/api/vendor/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: urlToRemove })
      });
    } catch (e) {
      console.error("Failed to delete from Cloudinary", e);
    }

    const updatedGallery = data.galleryUrls.filter((url: string) => url !== urlToRemove);
    let updatedThumbnail = data.thumbnailUrl;
    if (updatedThumbnail === urlToRemove) {
      updatedThumbnail = updatedGallery.length > 0 ? updatedGallery[0] : "";
    }
    setData({ ...data, galleryUrls: updatedGallery, thumbnailUrl: updatedThumbnail });
  };

  const setAsThumbnail = (url: string) => {
    setData({ ...data, thumbnailUrl: url });
  };

  const handleSaveProperty = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/vendor/property", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: data.propertyName,
          thumbnail_url: data.thumbnailUrl,
          gallery_urls: data.galleryUrls,
          services: data.services
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccess("Business details and services updated successfully!");
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

  // --- SERVICE MANAGEMENT ---
  const startAddService = () => {
    setEditingService({
      category: "Hostel",
      pricing: { starting_price: "", price_unit: "month" },
      dynamic_attributes: { amenities: [] },
      isNew: true,
      index: data.services.length
    });
  };

  const startEditService = (service: any, index: number) => {
    setEditingService({
      ...JSON.parse(JSON.stringify(service)),
      isNew: false,
      index
    });
  };

  const removeService = (index: number) => {
    const updated = [...data.services];
    updated.splice(index, 1);
    setData({ ...data, services: updated });
  };

  const saveEditingService = () => {
    if (!editingService.category) return setError("Category is required.");
    if (!editingService.pricing.starting_price) return setError("Pricing is required.");

    // Prevent duplicates
    const duplicate = data.services.find((s: any, i: number) => s.category === editingService.category && i !== editingService.index);
    if (duplicate) return setError(`A ${editingService.category} service already exists for this property.`);

    const updatedServices = [...data.services];
    const servicePayload = {
      _id: editingService._id, // Will be undefined if new, which is fine
      category: editingService.category,
      pricing: editingService.pricing,
      dynamic_attributes: editingService.dynamic_attributes
    };

    if (editingService.isNew) {
      updatedServices.push(servicePayload);
    } else {
      updatedServices[editingService.index] = servicePayload;
    }

    setData({ ...data, services: updatedServices });
    setEditingService(null);
    setError("");
  };

  const toggleEditingAmenity = (amenity: string) => {
    setEditingService((prev: any) => {
      const current = prev.dynamic_attributes?.amenities || [];
      const updated = current.includes(amenity) 
        ? current.filter((a: string) => a !== amenity)
        : [...current, amenity];
      return { ...prev, dynamic_attributes: { ...prev.dynamic_attributes, amenities: updated } };
    });
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!data) return <div>Failed to load your property data.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-20">
      <div className="flex items-center mb-6 border-b pb-4">
        <Building className="h-6 w-6 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Manage Property</h1>
        
        <div className="ml-auto flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 mr-1" />
          KHM Verified
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">{success}</div>}

      {/* --- PROPERTY LEVEL INFO --- */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Property Name</label>
          <Input 
            required
            value={data.propertyName}
            onChange={(e) => setData({...data, propertyName: e.target.value})}
            placeholder="e.g. Allen Boys Hostel"
            className="max-w-md"
          />
        </div>

        {/* Image Upload Zone */}
        <div className="mt-8 border-t pt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Property Images</h3>
              <p className="text-sm text-gray-500">Upload up to 30 images (Max 5MB each). Images are compressed automatically.</p>
            </div>
            <div className="relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <Button type="button" variant="outline" disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4 mr-2 text-primary" />
                )}
                {uploading ? "Uploading..." : "Select Images"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.galleryUrls.map((url: string, index: number) => (
              <div key={index} className={`relative group rounded-lg overflow-hidden border-2 ${data.thumbnailUrl === url ? 'border-primary' : 'border-transparent'}`}>
                <img src={url} alt="Property" className="w-full h-24 object-cover" />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button 
                    type="button"
                    onClick={() => removeImage(url)}
                    className="self-end bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {data.thumbnailUrl !== url && (
                    <button 
                      type="button"
                      onClick={() => setAsThumbnail(url)}
                      className="text-xs bg-white text-gray-900 px-2 py-1 rounded-md font-semibold hover:bg-gray-100"
                    >
                      Set Thumbnail
                    </button>
                  )}
                </div>
                
                {data.thumbnailUrl === url && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Cover
                  </div>
                )}
              </div>
            ))}
            {data.galleryUrls.length === 0 && !uploading && (
              <div className="col-span-full py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="h-12 w-12 mb-3 text-gray-300" />
                <p>No images uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SERVICES MULTI-SECTION --- */}
      <div className="mt-12 border-t pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Services Offered</h2>
          {!editingService && (
            <Button onClick={startAddService} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          )}
        </div>

        {/* Existing Services List */}
        {!editingService && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.services.map((svc: any, idx: number) => (
              <div key={idx} className="bg-gray-50 border rounded-xl p-5 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-primary">{svc.category}</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => startEditService(svc, idx)} className="p-1.5 text-gray-500 hover:text-blue-600 bg-white rounded-md border shadow-sm transition">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeService(idx)} className="p-1.5 text-gray-500 hover:text-red-600 bg-white rounded-md border shadow-sm transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-gray-900 mb-4">
                  ₹{svc.pricing?.starting_price} <span className="text-sm text-gray-500 font-medium">/ {svc.pricing?.price_unit || "month"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(svc.dynamic_attributes?.amenities || []).slice(0, 4).map((amenity: string, aIdx: number) => (
                    <span key={aIdx} className="text-xs bg-white border px-2 py-1 rounded-full text-gray-600">
                      {amenity}
                    </span>
                  ))}
                  {(svc.dynamic_attributes?.amenities?.length || 0) > 4 && (
                    <span className="text-xs bg-gray-200 border px-2 py-1 rounded-full text-gray-600">
                      +{(svc.dynamic_attributes.amenities.length - 4)} more
                    </span>
                  )}
                </div>
              </div>
            ))}
            {data.services.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
                No services added yet. Click "Add Service" to start.
              </div>
            )}
          </div>
        )}

        {/* Inline Service Editor */}
        {editingService && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService.isNew ? "Add New Service" : "Edit Service"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={editingService.category}
                  onChange={(e) => {
                    setEditingService({
                      ...editingService, 
                      category: e.target.value,
                      dynamic_attributes: { amenities: [] } // Reset amenities on category change
                    });
                  }}
                  disabled={!editingService.isNew} // Prevent changing category of existing service to avoid ID conflicts
                >
                  <option value="Hostel">Hostel</option>
                  <option value="PG">PG</option>
                  <option value="Mess">Mess</option>
                  <option value="Library">Library</option>
                  <option value="Laundry">Laundry</option>
                </select>
                {!editingService.isNew && <p className="text-xs text-gray-500 mt-1">Category cannot be changed after creation.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <div className="flex space-x-2">
                  <Input 
                    required
                    type="number"
                    value={editingService.pricing.starting_price}
                    onChange={(e) => setEditingService({
                      ...editingService, 
                      pricing: { ...editingService.pricing, starting_price: Number(e.target.value) }
                    })}
                    placeholder="e.g. 5000"
                    className="flex-1 bg-white"
                  />
                  <select 
                    className="flex h-10 w-32 rounded-md border border-input bg-white px-3 py-2 text-sm"
                    value={editingService.pricing.price_unit}
                    onChange={(e) => setEditingService({
                      ...editingService, 
                      pricing: { ...editingService.pricing, price_unit: e.target.value }
                    })}
                  >
                    <option value="month">/ month</option>
                    <option value="meal">/ meal</option>
                    <option value="kg">/ kg</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Attributes based on Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Attributes & Amenities for {editingService.category}</label>
              <div className="flex flex-wrap gap-3">
                {(amenitySchemas[editingService.category] || []).map((amenity) => {
                  const isSelected = (editingService.dynamic_attributes?.amenities || []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleEditingAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-white text-gray-600 border hover:bg-gray-50"
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="button" onClick={saveEditingService}>
                {editingService.isNew ? "Add to Property" : "Update Service"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- UNIFIED SAVE BUTTON --- */}
      <div className="pt-6 border-t mt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-500 mb-4 md:mb-0">
          Make sure to click "Save Property Details" to apply any changes made to services or images.
        </p>
        <Button onClick={handleSaveProperty} disabled={saving || editingService !== null} className="w-full md:w-auto h-12 px-8 text-base">
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {saving ? "Saving Changes..." : "Save Property Details"}
        </Button>
      </div>
    </div>
  );
}
