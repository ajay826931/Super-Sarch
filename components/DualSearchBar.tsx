"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Search } from "lucide-react";

export default function DualSearchBar() {
  const router = useRouter();
  const { setSearch } = useSearchStore();
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  
  const [suggestions1, setSuggestions1] = useState<any[]>([]);
  const [suggestions2, setSuggestions2] = useState<any[]>([]);
  
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  
  const wrapperRef1 = useRef<HTMLDivElement>(null);
  const wrapperRef2 = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef1.current && !wrapperRef1.current.contains(event.target as Node)) {
        setShowDropdown1(false);
      }
      if (wrapperRef2.current && !wrapperRef2.current.contains(event.target as Node)) {
        setShowDropdown2(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions for Location/Entity
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (q1.length < 2) {
        setSuggestions1([]);
        return;
      }
      try {
        const res = await fetch(`/api/autocomplete?q=${q1}&type=location`);
        const json = await res.json();
        if (json.success) setSuggestions1(json.data);
      } catch (err) {
        console.error("Autocomplete error", err);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [q1]);

  // Fetch suggestions for Category/Property
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (q2.length < 1) {
        setSuggestions2([]);
        return;
      }
      try {
        // Here we combine property names and category names
        const res = await fetch(`/api/autocomplete?q=${q2}`);
        const json = await res.json();
        
        // Also manually add static categories if they match, since the API handles 'category' separately or we can just filter it on frontend
        const staticCategories = ['Hostel', 'PG', 'Mess'];
        const matchedCats = staticCategories
          .filter(c => c.toLowerCase().includes(q2.toLowerCase()))
          .map(c => ({ _id: c, name: c, type: 'Category', group: 'Category' }));
          
        if (json.success) {
          const propertyResults = json.data.filter((d: any) => d.type === 'Property');
          setSuggestions2([...matchedCats, ...propertyResults]);
        }
      } catch (err) {
        console.error("Autocomplete error", err);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [q2]);

  const handleSearch = () => {
    setShowDropdown1(false);
    setShowDropdown2(false);
    setSearch(q1, q2);
    const params = new URLSearchParams();
    if (q1) params.set("q1", q1);
    if (q2) params.set("q2", q2);
    router.push(`/search?${params.toString()}`);
  };

  const handleSelectSuggestion1 = (name: string) => {
    setQ1(name);
    setShowDropdown1(false);
  };

  const handleSelectSuggestion2 = (name: string) => {
    setQ2(name);
    setShowDropdown2(false);
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-white p-4 shadow-lg rounded-2xl">
      
      {/* Input 1: Location/Landmark */}
      <div className="relative" ref={wrapperRef1}>
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search Coaching, Landmark or Area"
          className="pl-10 h-12 text-base border-gray-200 focus-visible:ring-primary"
          value={q1}
          onChange={(e) => {
            setQ1(e.target.value);
            setShowDropdown1(true);
          }}
          onFocus={() => { if (q1.length >= 2) setShowDropdown1(true); }}
        />
        
        {/* Dropdown 1 */}
        {showDropdown1 && suggestions1.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions1.map((item, idx) => (
              <div 
                key={idx}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b last:border-0"
                onClick={() => handleSelectSuggestion1(item.name)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input 2: Category/Property */}
      <div className="relative" ref={wrapperRef2}>
        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Looking for? (Hostel, PG, Mess)"
          className="pl-10 h-12 text-base border-gray-200 focus-visible:ring-primary"
          value={q2}
          onChange={(e) => {
            setQ2(e.target.value);
            setShowDropdown2(true);
          }}
          onFocus={() => { if (q2.length >= 1) setShowDropdown2(true); }}
        />
        
        {/* Dropdown 2 */}
        {showDropdown2 && suggestions2.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions2.map((item, idx) => (
              <div 
                key={idx}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b last:border-0"
                onClick={() => handleSelectSuggestion2(item.name)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="w-full mt-2 h-12 text-lg font-medium"
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
}
