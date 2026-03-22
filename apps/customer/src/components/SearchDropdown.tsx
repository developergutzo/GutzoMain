import React, { useEffect, useRef, useMemo } from "react";
import { Search, X, Clock, MapPin, ChevronRight, Utensils } from "lucide-react";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useCategories } from "../hooks/useCategories";
import { useVendors } from "../hooks/useVendors";
import { useRouter } from "./Router";
import { Vendor } from "../types";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchDropdown({ isOpen, onClose, searchQuery, onSearchChange }: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { recentSearches, addSearch } = useRecentSearches();
  const { categories, loading: categoriesLoading } = useCategories();
  const { vendors, loading: vendorsLoading } = useVendors();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearchSelect = (query: string) => {
    addSearch(query);
    onSearchChange(query);
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addSearch(searchQuery.trim());
      onClose();
      window.dispatchEvent(new CustomEvent('save-recent-search', { detail: searchQuery.trim() }));
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Live filtering logic
  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return vendors.filter(v => 
      v.name.toLowerCase().includes(q) || 
      (v.cuisineType && v.cuisineType.toLowerCase().includes(q)) ||
      (v.products && v.products.some(p => p.name.toLowerCase().includes(q)))
    ).slice(0, 5); // Limit to top 5 for the overlay
  }, [vendors, searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-3 w-full min-w-[480px] bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 sm:p-6 pb-8">
        {/* Live Search Results (When typing) */}
        {searchQuery && filteredVendors.length > 0 && (
          <div className="mb-2">
            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4 px-1">Best Matches</h3>
            <div className="space-y-1">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => handleSearchSelect(vendor.name)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                    {vendor.image ? (
                      <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Utensils className="h-5 w-5 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-brand transition-colors">{vendor.name}</h4>
                    <p className="text-[13px] text-gray-500 truncate">{vendor.cuisineType || 'Restaurant'}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-brand transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches (Only when no query) */}
        {!searchQuery && recentSearches.length > 0 && (
          <div>
            <div className="mb-4 px-1 text-left">
               <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Your Recent Searches</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full transition-all active:scale-95 group"
                >
                  <Clock className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand transition-colors" />
                  <span className="text-[14px] font-semibold text-gray-700">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State / No Results */}
        {searchQuery && filteredVendors.length === 0 && !vendorsLoading && (
          <div className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Search className="h-8 w-8 text-gray-300 opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
            <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed mx-auto">
              We couldn't find matches for <span className="text-gray-900 font-semibold italic">"{searchQuery}"</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
