"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function LeadsCRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Optimistic update
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l)));
      
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchLeads(); // revert on failure
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New": return <Badge variant="default" className="bg-blue-500">{status}</Badge>;
      case "Called": return <Badge variant="outline" className="text-orange-600 border-orange-600">{status}</Badge>;
      case "Visiting": return <Badge variant="outline" className="text-purple-600 border-purple-600">{status}</Badge>;
      case "Deal Closed": return <Badge variant="default" className="bg-green-600">{status}</Badge>;
      case "Lost": return <Badge variant="destructive">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads CRM</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all student enquiries and track conversions.</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Target Exam</TableHead>
              <TableHead>Property (Location)</TableHead>
              <TableHead className="bg-blue-50/50">Vendor Contact 🔒</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No leads found.</TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="text-sm">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{lead.user_id?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{lead.user_id?.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{lead.target_exam || '-'}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{lead.property_id?.property_name || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="bg-blue-50/20">
                    <div className="font-semibold text-blue-700">{lead.property_id?.vendor_id?.phone || 'No Vendor'}</div>
                    <div className="text-xs text-blue-500/80">{lead.property_id?.vendor_id?.name}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(val) => handleStatusChange(lead._id, val)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Update..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Called">Called</SelectItem>
                        <SelectItem value="Visiting">Visiting</SelectItem>
                        <SelectItem value="Deal Closed">Deal Closed</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
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
