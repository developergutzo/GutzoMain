import React, { useEffect, useRef, useState, useMemo } from "react";
import { Search, X, Clock, MapPin, ChevronRight, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useCategories } from "../hooks/useCategories";
import { useVendors } from "../hooks/useVendors";
import { useRouter } from "./Router";
import { Vendor } from "../types";

interface SearchTopSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchTopSheet({ isOpen, onClose, searchQuery, onSearchChange }: SearchTopSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useRouter();
  const { recentSearches, clearSearches, addSearch } = useRecentSearches();
  const { categories, loading: categoriesLoading } = useCategories();
  const { vendors, loading: vendorsLoading } = useVendors();

  useEffect(() => {
    if (isOpen) {
      // Clear the search query each time the sheet opens
      onSearchChange('');
      if (inputRef.current) {
        // Small delay to ensure the animation has started
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Top-Sheet Content */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[70vh] h-fit"
            style={{ borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }}
          >
            {/* Header / Search Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4 shrink-0 bg-white">
              <div className="mb-2">
                <span className="text-[14px] font-medium text-gray-400 px-1 font-primary lowercase">what's your gut feeling today?</span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-brand/30 focus-within:bg-white focus-within:shadow-sm transition-all group">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Find your next favorite meal..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 outline-none bg-transparent text-lg text-main placeholder:text-gray-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12 scrollbar-hide">
              
              {/* Live Search Results (When typing) */}
              {searchQuery && filteredVendors.length > 0 && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
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
                          <h4 className="text-[15px] font-bold text-main truncate group-hover:text-brand transition-colors">{vendor.name}</h4>
                          <p className="text-[13px] text-sub truncate">{vendor.cuisineType || 'Restaurant'}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-brand transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches (Only when no query) */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 px-1">
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
              {searchQuery && filteredVendors.length === 0 && filteredCategories.length === 0 && !vendorsLoading && !categoriesLoading && (
                <div className="text-center py-16 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Search className="h-10 w-10 text-gray-300 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-[14px] text-gray-500 max-w-[240px] leading-relaxed mx-auto">
                    We couldn't find any direct matches for <span className="text-gray-900 font-semibold italic">"{searchQuery}"</span>.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
