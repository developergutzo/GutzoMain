import React, { useEffect, useState } from "react";
import { useVendors } from "../hooks/useVendors";
import { VendorCard } from "../components/VendorCard";
import { VendorSkeleton } from "../components/VendorSkeleton";
import { useRouter } from "../components/Router";
import { MapPin, ArrowLeft } from "lucide-react";
import { Vendor } from "../types";

export function SearchPage() {
  const { vendors, loading } = useVendors();
  const { navigate, goBack } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Extract search query from URL
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, []);

  const handleVendorClick = (vendor: Vendor, productId?: string) => {
    const url = productId ? `/vendor/${vendor.id}?productId=${productId}` : `/vendor/${vendor.id}`;
    // @ts-ignore
    navigate(url as any, { state: { vendor, fromSearch: true } });
  };

  const filteredVendors = vendors.filter((vendor) => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    // Search in vendor name
    if (vendor.name.toLowerCase().includes(q)) return true;
    // Search in predefined tags array if available
    if (vendor.tags && vendor.tags.some((c: string) => c.toLowerCase().includes(q))) return true;
    if (vendor.cuisineType && vendor.cuisineType.toLowerCase().includes(q)) return true;
    
    // Search through individual products (menu items)
    if (vendor.products && vendor.products.some(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q))
    )) {
      return true;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={goBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Poppins' }}>
              {loading ? (
                <span className="animate-pulse bg-gray-200 text-transparent rounded w-1/3 block h-8">Searching...</span>
              ) : (
                <span>
                  Search results for <span className="text-gutzo-primary">"{searchQuery}"</span>
                </span>
              )}
            </h2>
          </div>
          {!loading && (
             <p className="text-sm text-gray-500 mt-2 ml-11">
               Found {filteredVendors.length} {filteredVendors.length === 1 ? 'kitchen' : 'kitchens'}
             </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-full">
                <VendorSkeleton />
              </div>
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {filteredVendors.map((vendor) => {
              let matchedItems = null;
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const isNameMatch = vendor.name.toLowerCase().includes(q);
                // If the vendor name doesn't match directly, check products to show what matched
                if (vendor.products && !isNameMatch) {
                   const matches = vendor.products.filter(p => 
                     p.name.toLowerCase().includes(q) || 
                     (p.description && p.description.toLowerCase().includes(q))
                   );
                   if (matches.length > 0) {
                     matchedItems = matches;
                   }
                }
              }

              return (
                <div key={vendor.id} className="flex justify-center items-stretch w-full h-full">
                  <VendorCard vendor={vendor} onClick={handleVendorClick} matchedItems={matchedItems} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
             <div className="bg-gray-50 p-6 rounded-full mb-4">
                <MapPin className="h-10 w-10 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins' }}>No kitchens found</h3>
             <p className="text-gray-500 max-w-sm">
                We couldn't find any results matching "{searchQuery}". Try searching for something else like "bowl" or "salad".
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
