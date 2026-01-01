import { Search, Clock, TrendingUp, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchDropdown({ isOpen, onClose, searchQuery, onSearchChange }: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    onSearchChange(query);
    onClose();
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100] max-h-[500px] overflow-y-auto"
      style={{
        left: '-17px', // Extend to align with separator line
        right: 0,
      }}
    >
      {/* Search input visible when typing */}
      {searchQuery && (
        <div className="p-4 border-b border-gray-100">
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

      {/* Popular Searches */}
      {!searchQuery && (
        <div className="p-4">
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
      )}

      {/* Recent Searches */}
      {!searchQuery && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Recent Searches</h3>
          </div>
          <div className="space-y-1">
            {["Fresh Bowls", "Salads", "Protein Meals", "Smoothies"].map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearchSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="p-8 text-center">
          <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Searching for "{searchQuery}"
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Results will appear below
          </p>
        </div>
      )}
    </div>
  );
}
