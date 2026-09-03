"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, CheckCircle2 } from "lucide-react";

interface LeadFormProps {
  propertyId: string;
}

export default function LeadForm({ propertyId }: LeadFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [exam, setExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          whatsappNumber: phone,
          targetExam: exam,
          propertyId
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setName("");
          setPhone("");
          setExam("");
        }, 3000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Error submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-center">
        <Button onClick={() => setOpen(true)} className="w-full max-w-md h-14 text-lg font-bold rounded-full">
          <Phone className="mr-2 h-5 w-5" />
          Talk to Expert for Best Deal
        </Button>
      </div>
      
      <SheetContent side="bottom" className="rounded-t-3xl p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-500">Thank You, our expert will call you in 10 mins.</p>
          </div>
        ) : (
          <>
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-2xl font-bold text-gray-900">Get Best Deal</SheetTitle>
              <p className="text-gray-500 text-sm">Fill details to get a callback from our expert</p>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <Input 
                  required 
                  placeholder="e.g. Rahul Kumar" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <Input 
                  required 
                  type="tel" 
                  placeholder="+91" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
                <Select required value={exam} onValueChange={setExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="JEE">JEE</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold mt-2">
                {loading ? "Submitting..." : "Request Callback"}
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
