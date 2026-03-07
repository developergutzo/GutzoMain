import { Search, Clock, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useCategories } from "../hooks/useCategories";
import { useRouter } from "./Router";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchDropdown({ isOpen, onClose, searchQuery, onSearchChange }: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { recentSearches, clearSearches, addSearch } = useRecentSearches();
  const { categories, loading: categoriesLoading } = useCategories();

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

  if (!isOpen) return null;

  const handleSearchSelect = (query: string) => {
    addSearch(query);
    onSearchChange(query);
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const todayMoodCategories = categories; // Display all categories

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100] max-h-[85vh] overflow-y-auto w-[500px]"
      style={{
        left: '-17px', // Extend to align with separator line
        width: '560px', // Wider to fit the horizontal scrolls nicely
      }}
    >
      {/* Search input visible when typing */}
      {searchQuery && (
        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-gray-900">{searchQuery}</span>
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Recent Searches & Today's Mood */}
      {!searchQuery && (
        <div className="p-4">
          
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold tracking-wider text-gray-500 uppercase">Your Recent Searches</h3>
                <button 
                  onClick={clearSearches}
                  className="text-sm font-medium text-gutzo-error hover:text-gutzo-error/80 transition-colors"
                >
                  Clear
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors text-left"
                  >
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-[14px] font-medium text-gray-700 whitespace-nowrap">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Today's Mood Section */}
          {todayMoodCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[13px] font-semibold tracking-wider text-gray-500 uppercase">What's on your mind?</h3>
              </div>
              
              {categoriesLoading ? (
                 <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2">
                   {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                        <div className="w-[70px] h-[70px] rounded-full bg-gray-100 mb-2"></div>
                        <div className="w-12 h-3 rounded bg-gray-100"></div>
                      </div>
                   ))}
                 </div>
              ) : (
                <div className="flex flex-wrap gap-y-6 justify-start pt-2 pb-4">
                  {todayMoodCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSearchSelect(cat.name)}
                      className="flex flex-col items-center group focus:outline-none shrink-0"
                      style={{ width: '20%' }}
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
                      <span className="text-[12px] font-medium text-gray-700 truncate w-full text-center group-hover:text-gutzo-primary transition-colors px-1">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {recentSearches.length === 0 && todayMoodCategories.length === 0 && !categoriesLoading && (
            <div className="text-center py-6 text-gray-500 text-sm">
              Type above to start searching
            </div>
          )}
        </div>
      )}

      {/* Search Results Preview Info (when typing but before enter) */}
      {searchQuery && (
        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[200px]">
          <Search className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Press Enter or click the Search icon
          </p>
          <p className="text-xs text-gray-400 mt-1">
            to see results for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Mask Edges CSS injection for smooth scroll fading */}
      <style>{`
        .mask-edges-horizontal {
          -webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
          mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
        }
      `}</style>
    </div>
  );
}
