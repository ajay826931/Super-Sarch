"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Building, ShieldCheck, UploadCloud, X, Image as ImageIcon, Plus, Edit2, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/imageUtils";
// Google Maps imports (Temporarily bypassed for MVP - kept for future use):
// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import dynamic from "next/dynamic";
import VendorSetupWizard from "@/components/VendorSetupWizard";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
    </div>
  ),
});

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
  
  // Google Maps loader (Temporarily bypassed for MVP):
  /*
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
  });
  */
  
  // separate uploading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingServiceIdx, setUploadingServiceIdx] = useState<number | null>(null);

  const [data, setData] = useState<any>(null);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingService, setEditingService] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/vendor/property");
      if (res.status === 401) {
        router.push("/vendor/login");
        return;
      }
      
      const json = await res.json();
      if (json.success) {
        setVendorInfo(json.data.vendor);

        // If no property exists yet or initial setup is not marked complete
        if (!json.data.property || json.data.property.is_setup_completed === false) {
          setNeedsSetup(true);
          setData(null);
        } else {
          setNeedsSetup(false);
          setData({
            propertyName: json.data.property.property_name || "",
            address: json.data.property.address || "",
            coordinates: json.data.property.location?.coordinates || [75.8323, 25.1815],
            businessLogo: json.data.property.business_logo || "",
            coverPhoto: json.data.property.cover_photo || "",
            status: json.data.property.status || false,
            services: json.data.services || [],
          });
        }
      } else {
        setError(json.error || "Failed to load data");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadSingleImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File exceeds 5MB limit");
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
      return uploadData.url;
    }
    throw new Error("Upload failed");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingLogo(true);
    setError("");
    try {
      const url = await uploadSingleImage(files[0]);
      setData({ ...data, businessLogo: url });
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadSingleImage(files[0]);
      setData({ ...data, coverPhoto: url });
    } catch (err: any) {
      setError(err.message || "Failed to upload cover photo");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceIndex: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const service = data.services[serviceIndex];
    const category = service.category;
    const limit = category === 'Hostel' ? 8 : 5;
    const currentImages = service.service_images || [];

    if (currentImages.length + files.length > limit) {
      setError(`Maximum ${limit} images allowed for ${category} service.`);
      return;
    }

    setUploadingServiceIdx(serviceIndex);
    setError("");
    
    const newImages = [...currentImages];
    const failedUploads: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const url = await uploadSingleImage(file);
          newImages.push(url);
        } catch {
          failedUploads.push(file.name);
        }
      }

      const updatedServices = [...data.services];
      updatedServices[serviceIndex] = { ...service, service_images: newImages };
      setData({ ...data, services: updatedServices });
      
      if (failedUploads.length > 0) setError(`Failed to upload: ${failedUploads.join(", ")}`);
    } catch (err) {
      console.error(err);
      setError("Error uploading service images.");
    } finally {
      setUploadingServiceIdx(null);
      if (e.target) e.target.value = '';
    }
  };

  const removeServiceImage = async (serviceIndex: number, urlToRemove: string) => {
    try {
      await fetch("/api/vendor/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: urlToRemove })
      });
    } catch (e) {
      console.error("Failed to delete from Cloudinary", e);
    }

    const service = data.services[serviceIndex];
    const updatedImages = (service.service_images || []).filter((url: string) => url !== urlToRemove);
    const updatedServices = [...data.services];
    updatedServices[serviceIndex] = { ...service, service_images: updatedImages };
    setData({ ...data, services: updatedServices });
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
          address: data.address,
          coordinates: data.coordinates,
          business_logo: data.businessLogo,
          cover_photo: data.coverPhoto,
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
      service_images: [],
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
      _id: editingService._id,
      category: editingService.category,
      pricing: editingService.pricing,
      dynamic_attributes: editingService.dynamic_attributes,
      service_images: editingService.service_images || []
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

  const handleLogout = async () => {
    try {
      await fetch("/api/vendor/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/vendor/login");
  };

  // If vendor hasn't set up their property yet, show the setup wizard
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto flex justify-end mb-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
        <VendorSetupWizard 
          vendorInfo={vendorInfo} 
          onComplete={() => fetchData()} 
        />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load your property data.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex items-center">
          <Building className="h-6 w-6 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Property</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {data.status ? (
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 mr-1" />
              KHM Live & Verified
            </div>
          ) : (
            <div className="flex items-center bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
              Under Verification (Unlisted)
            </div>
          )}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">{success}</div>}

      {/* --- PROPERTY LEVEL INFO --- */}
      <div className="space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Readable Address</label>
            <Input 
              required
              value={data.address}
              onChange={(e) => setData({...data, address: e.target.value})}
              placeholder="e.g. A-12, Jawahar Nagar, Kota"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Your Exact Location</label>
            <p className="text-sm text-gray-500 mb-4">Drag the marker to your exact location so students can find you easily.</p>
            {/* OpenStreetMap + Leaflet Map (100% Free Open-Source) */}
            <LeafletMap
              lat={data.coordinates[1]}
              lng={data.coordinates[0]}
              onPositionChange={(lat, lng) => {
                setData({ ...data, coordinates: [lng, lat] });
              }}
            />

            {/* Google Map (Temporarily bypassed for MVP - kept for future use):
            {isLoaded ? (
              <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: data.coordinates[1], lng: data.coordinates[0] }}
                  zoom={15}
                  onClick={(e) => {
                    if (e.latLng) {
                      setData({ ...data, coordinates: [e.latLng.lng(), e.latLng.lat()] });
                    }
                  }}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  <Marker
                    position={{ lat: data.coordinates[1], lng: data.coordinates[0] }}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        setData({ ...data, coordinates: [e.latLng.lng(), e.latLng.lat()] });
                      }
                    }}
                  />
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[300px] w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              </div>
            )}
            */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          {/* Business Logo Upload */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Business Logo</h3>
            <p className="text-sm text-gray-500 mb-4">Upload a square logo (Max 5MB).</p>
            
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden">
                {data.businessLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.businessLogo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
                <Button type="button" variant="outline" disabled={uploadingLogo}>
                  {uploadingLogo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2 text-primary" />}
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
              </div>
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cover Photo</h3>
            <p className="text-sm text-gray-500 mb-4">Upload main hero image for search tile (Max 5MB).</p>
            
            <div className="flex items-center gap-4">
              <div className="h-20 w-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden">
                {data.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                />
                <Button type="button" variant="outline" disabled={uploadingCover}>
                  {uploadingCover ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2 text-primary" />}
                  {uploadingCover ? "Uploading..." : "Upload Cover"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SERVICES MULTI-SECTION --- */}
      <div className="mt-12 border-t pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Services Offered</h2>
            <p className="text-sm text-gray-500">Add services and manage their respective photo galleries here.</p>
          </div>
          {!editingService && (
            <Button onClick={startAddService} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          )}
        </div>

        {/* Existing Services List */}
        {!editingService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {data.services.map((svc: any, idx: number) => {
              const categoryLimit = svc.category === 'Hostel' ? 8 : 5;
              const images = svc.service_images || [];
              const isUploadingThis = uploadingServiceIdx === idx;
              return (
              <div key={idx} className="bg-gray-50 border rounded-xl p-5 relative">
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
                
                {/* Embedded Service Image Gallery */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm text-gray-700">Gallery ({images.length}/{categoryLimit})</span>
                    <div className="relative">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        onChange={(e) => handleServiceImageUpload(e, idx)}
                        disabled={isUploadingThis || images.length >= categoryLimit}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={isUploadingThis || images.length >= categoryLimit}>
                        {isUploadingThis ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
                        Add Photos
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {images.map((url: string, imgIdx: number) => (
                      <div key={imgIdx} className="relative group rounded overflow-hidden border w-16 h-16">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`${svc.category} img`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => removeServiceImage(idx, url)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length === 0 && !isUploadingThis && (
                      <div className="w-full text-xs text-gray-400 italic py-2">No photos added to this service.</div>
                    )}
                  </div>
                </div>
              </div>
            )})}
            {data.services.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
                No services added yet. Click &quot;Add Service&quot; to start.
              </div>
            )}
          </div>
        )}

        {/* Inline Service Editor */}
        {editingService && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService.isNew ? "Add New Service" : "Edit Service Details"}
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
          Make sure to click &quot;Save Property Details&quot; to apply any changes made to services or images.
        </p>
        <Button onClick={handleSaveProperty} disabled={saving || editingService !== null} className="w-full md:w-auto h-12 px-8 text-base">
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {saving ? "Saving Changes..." : "Save Property Details"}
        </Button>
      </div>
    </div>
  );
}
