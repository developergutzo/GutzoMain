import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "./ui/sheet";
import { useEffect, useRef, useState } from "react";

interface SearchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBottomSheet({ isOpen, onClose, searchQuery, onSearchChange }: SearchBottomSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches] = useState<string[]>([
    "Healthy Bowls",
    "Salads",
    "Protein Meals",
    "Smoothies"
  ]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the sheet is fully opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSearchSelect = (query: string) => {
    onSearchChange(query);
    onClose();
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out" 
        style={{ top: '104px', bottom: 0, height: 'calc(100vh - 104px)', position: 'fixed' }}
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
        `}</style>
        {/* Always visible close button, top right, above all content */}
        <button
          onClick={onClose}
          className="absolute z-50 top-4 right-4 rounded-full p-2 bg-white/80 hover:bg-gray-100 shadow transition-colors"
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          aria-label="Close search"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
        <SheetHeader className="p-6 pt-12 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for restaurant, salads or meals"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Popular Searches */}
          {!searchQuery && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900">Popular Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Salads", "Protein Bowls", "Smoothies", "Vegan", "Keto", "Gluten-Free"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSearchSelect(item)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 border border-gray-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900">Recent Searches</h3>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-700">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Searching for "{searchQuery}"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Results will appear in the main screen
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
