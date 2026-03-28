import React, { useEffect, useState } from "react";
import { useVendors } from "../hooks/useVendors";
import { VendorCard } from "../components/VendorCard";
import { VendorSkeleton } from "../components/VendorSkeleton";
import { useRouter } from "../components/Router";
import { MapPin, ArrowLeft, X, Search } from "lucide-react";
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Update URL without full page reload to keep it in sync
    const newUrl = new URL(window.location.href);
    if (query) {
      newUrl.searchParams.set("q", query);
    } else {
      newUrl.searchParams.delete("q");
    }
    window.history.replaceState({}, '', newUrl);
  };

  const clearSearch = () => {
    setSearchQuery("");
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("q");
    window.history.replaceState({}, '', newUrl);
  };

  const handleVendorClick = (vendor: Vendor, productId?: string) => {
    const url = productId ? `/vendor/${vendor.id}?productId=${productId}` : `/vendor/${vendor.id}`;
    // @ts-ignore
    navigate(url as any, { state: { vendor, fromSearch: true, searchQuery } });
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
    <div className="min-h-screen bg-white w-full overflow-x-hidden flex flex-col">
      {/* Sticky Search Header (Mobile Only) */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 shrink-0"
            aria-label="Go back"
          >
             <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-brand/30 focus-within:bg-white focus-within:shadow-sm transition-all group min-w-0">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search kitchens or dishes..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-primary text-main font-medium placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="mb-8 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex flex-wrap items-center gap-2" style={{ fontFamily: 'Poppins' }}>
            {loading ? (
              <span className="animate-pulse bg-gray-100 text-transparent rounded w-1/3 block h-8">Searching...</span>
            ) : searchQuery ? (
              <span>
                Search results for <span className="text-brand">"{searchQuery}"</span>
              </span>
            ) : (
              <span>Search for something delicious</span>
            )}
          </h2>
          {!loading && searchQuery && (
             <p className="text-sm md:text-base text-gray-500 mt-2">
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
              return (
                <div key={vendor.id} className="flex justify-center items-stretch w-full h-full">
                  <VendorCard vendor={vendor} onClick={handleVendorClick} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
             <div className="bg-gray-100 p-8 rounded-full mb-6">
                <MapPin className="h-12 w-12 text-gray-400 opacity-60" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins' }}>No kitchens found</h3>
             <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed px-4">
                We couldn't find any results matching <span className="text-gray-900 font-semibold italic">"{searchQuery}"</span>. Try searching for something else like "bowl" or "salad".
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
