"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function VendorApprovalsPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleApprove = async (propertyId: string) => {
    // Optimistic remove from pending list
    setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    
    try {
      await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
    } catch (error) {
      console.error("Failed to approve vendor/property", error);
      fetchProperties(); // revert on failure
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Approvals</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve new properties to set them live.</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date Added</TableHead>
              <TableHead>Property Details</TableHead>
              <TableHead>Location Address</TableHead>
              <TableHead>Vendor Information</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    All caught up! No pending properties.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              properties.map((prop) => (
                <TableRow key={prop._id}>
                  <TableCell className="text-sm">
                    {new Date(prop.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{prop.property_name || 'Unnamed Property'}</div>
                    <div className="text-xs text-orange-600 font-medium">Status: Pending</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="max-w-[200px] truncate">{prop.address || 'No Address Provided'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{prop.vendor_id?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{prop.vendor_id?.phone} ({prop.vendor_id?.unique_vendor_id})</div>
                    {!prop.vendor_id?.is_verified && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded mt-1 inline-block">Unverified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(prop._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve & Verify ✔️
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
