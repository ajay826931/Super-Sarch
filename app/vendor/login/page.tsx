"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2 } from "lucide-react";

export default function VendorLogin() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, phone })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push("/vendor/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Login to manage your property and update rent/amenities
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vendor Unique ID
            </label>
            <Input
              required
              placeholder="e.g. KV-8842"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Registered Mobile Number
            </label>
            <Input
              required
              type="tel"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold mt-4">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Secure Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
