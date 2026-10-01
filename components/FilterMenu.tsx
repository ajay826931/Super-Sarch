"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/lib/store";
import { Settings2 } from "lucide-react";

export default function FilterMenu({ onFilterChange }: { onFilterChange: () => void }) {
  const { budget, amenities, category, setFilters } = useSearchStore();
  
  const [localBudget, setLocalBudget] = useState<string>(budget ? budget.toString() : "");
  const [localCategory, setLocalCategory] = useState<string>(category || "");
  const [localAmenities, setLocalAmenities] = useState<string[]>(amenities || []);
  
  const [open, setOpen] = useState(false);

  const availableAmenities = ["AC", "Non-AC", "Veg", "Non-Veg", "Attached Washroom", "Washing Machine"];

  const toggleAmenity = (amenity: string) => {
    setLocalAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleApply = () => {
    setFilters(
      localBudget ? parseInt(localBudget) : null,
      localAmenities,
      localCategory
    );
    setOpen(false);
    onFilterChange();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full shadow-xl px-6 h-12 text-base font-semibold z-50"
      >
        <Settings2 className="mr-2 h-5 w-5" />
        Filter & Sort
      </Button>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl px-6 py-6 overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
            <div className="flex gap-2">
              {["Hostel", "PG", "Mess"].map(cat => (
                <Button 
                  key={cat} 
                  variant={localCategory === cat ? "default" : "outline"}
                  onClick={() => setLocalCategory(localCategory === cat ? "" : cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Max Budget (₹/mo)</h4>
            <Input 
              type="number" 
              placeholder="e.g. 8000" 
              value={localBudget}
              onChange={(e) => setLocalBudget(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Amenities Filter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map(amenity => (
                <Button 
                  key={amenity}
                  variant={localAmenities.includes(amenity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAmenity(amenity)}
                  className="rounded-full"
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>
          
          <Button size="lg" className="w-full mt-4 h-12 text-lg" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
