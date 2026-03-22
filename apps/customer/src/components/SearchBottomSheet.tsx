import { Search, X, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useEffect, useRef } from "react";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useCategories } from "../hooks/useCategories";
import { useRouter } from "./Router";

interface SearchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBottomSheet({ isOpen, onClose, searchQuery, onSearchChange }: SearchBottomSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useRouter();
  const { recentSearches, clearSearches, addSearch } = useRecentSearches();
  const { categories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    if (isOpen) {
      // Clear the search query each time the sheet opens
      onSearchChange('');
      if (inputRef.current) {
        // Small delay to ensure the sheet is fully opened
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  const handleSearchSelect = (query: string) => {
    addSearch(query);
    onSearchChange(query);
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addSearch(searchQuery.trim());
      onClose();
      // We also dispatch a custom event if App.tsx needs to do anything globally,
      // but the hook alone handles persistence.
      window.dispatchEvent(new CustomEvent('save-recent-search', { detail: searchQuery.trim() }));
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const todayMoodCategories = categories; // Display all categories

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out flex flex-col" 
        style={{ top: '104px', bottom: 0, position: 'fixed', zIndex: 1100 }}
      >
        <style>{`
          [data-slot="sheet-content"] > button[class*="absolute"] {
            display: none !important;
          }
          [data-slot="sheet-content"][data-state="closed"] {
            animation: slideDown 300ms ease-in-out;
          }
          [data-slot="sheet-content"][data-state="open"] {
            animation: slideUp 300ms ease-in-out;
          }
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }
          .mask-edges-horizontal {
            -webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
            mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
          }
        `}</style>
        {/* Always visible close button, top right, above all content */}
        <SheetHeader className="p-4 sm:p-6 border-b border-gray-100 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Search</SheetTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors -mr-2"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Find your next favorite meal..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
          
          {/* Default Content: Recent Searches & Categories */}
          {(!searchQuery || categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
            <div className="pb-8 animate-in fade-in duration-300">
              
              {/* Recent Searches Section (Only when no query or matching query) */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[13px] font-semibold tracking-wider text-gray-500 uppercase">Your Recent Searches</h3>
                     <button 
                       onClick={clearSearches}
                       className="text-sm font-medium text-gutzo-error hover:text-gutzo-error/80 transition-colors"
                     >
                       Clear
                     </button>
                  </div>
                  
                  <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 -mx-4 px-4 mask-edges-horizontal">
                    {recentSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchSelect(item)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors shrink-0"
                      >
                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-[14px] font-medium text-gray-700 whitespace-nowrap">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Categories Selection (Filtered when typing) */}
              {todayMoodCategories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                     <h3 className="text-[13px] font-semibold tracking-wider text-gray-500 uppercase">
                       {searchQuery ? `Matching Categories` : "What's on your mind?"}
                     </h3>
                  </div>
                  
                  {categoriesLoading ? (
                     <div className="flex flex-col min-w-max pb-2 -mx-4 px-4 mask-edges-horizontal">
                        <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-3">
                          {[...Array(5)].map((_, i) => (
                             <div key={`row1-${i}`} className="flex flex-col items-center shrink-0 w-[80px] animate-pulse">
                               <div className="w-[74px] h-[74px] rounded-full bg-gray-100 mb-2"></div>
                               <div className="w-12 h-3 rounded bg-gray-100"></div>
                             </div>
                          ))}
                        </div>
                     </div>
                  ) : (
                    <div className="flex flex-wrap gap-y-6 justify-start pt-2 pb-6 px-1">
                      {todayMoodCategories
                        .filter(cat => !searchQuery || cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSearchSelect(cat.name)}
                          className="flex flex-col items-center group focus:outline-none shrink-0"
                          style={{ width: '25%' }}
                        >
                          <span
                            className="block rounded-full flex items-center justify-center overflow-hidden mb-2 transition-transform group-hover:scale-105 bg-gray-50 border border-gray-100 shadow-sm shrink-0"
                            style={{ width: '70px', height: '70px' }}
                          >
                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-full h-full object-cover rounded-full"
                                style={{ aspectRatio: 1, display: 'block' }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">Img</div>
                            )}
                          </span>
                          <span className="text-[12px] font-medium text-gray-700 truncate w-full text-center group-hover:text-gutzo-brand transition-colors px-1">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No Results Found (Marketplace style) */}
          {searchQuery && !categoriesLoading && categories.every(cat => !cat.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="text-center py-16 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-gray-300 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-[15px] text-gray-500 max-w-[260px] leading-relaxed">
                We couldn't find any categories matching <span className="text-gray-900 font-semibold italic">"{searchQuery}"</span>. Try searching for something else!
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
