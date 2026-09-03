"use client";

import { Button } from "@/components/ui/button";

const categories = [
  "Boys Hostel",
  "Girls PG",
  "Pure Veg Mess",
  "Premium AC",
  "Near Allen",
  "Affordable"
];

export default function QuickCategories() {
  return (
    <div className="w-full mt-6">
      <h3 className="text-sm font-medium text-white mb-3 px-1 opacity-90">Quick Search</h3>
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
        {categories.map((cat, index) => (
          <Button
            key={index}
            variant="secondary"
            className="rounded-full whitespace-nowrap bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm snap-start"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
