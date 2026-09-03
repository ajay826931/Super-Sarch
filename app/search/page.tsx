"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchStore } from "@/lib/store";
import PropertyCard from "@/components/PropertyCard";
import FilterMenu from "@/components/FilterMenu";
import { Loader2 } from "lucide-react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q1 = searchParams.get("q1") || "";
  const q2 = searchParams.get("q2") || "";
  
  const { budget, category, amenities } = useSearchStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      // For this sprint, we use default coordinates for Kota as a placeholder
      // until a proper Geocoding service for 'q1' is implemented.
      const payload = {
        latitude: 25.1793,
        longitude: 75.8459,
        category: category || (q2 ? q2 : undefined),
        filters: {
          budget: budget || undefined,
          amenities: amenities.length > 0 ? amenities : undefined
        }
      };

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to fetch results");
      
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 truncate">
          {q1 ? `Results near "${q1}"` : "All Properties"}
        </h1>
        <p className="text-sm text-gray-500">
          {results.length} properties found {q2 ? `for ${q2}` : ""}
        </p>
      </div>

      {/* Results List */}
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Searching for the best options...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <p className="font-semibold">Oops! Something went wrong.</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="font-semibold text-lg">No properties found.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search area.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Filter Button */}
      <FilterMenu onFilterChange={fetchResults} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
