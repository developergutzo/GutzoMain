import { MapPin, Navigation, Clock, Plus } from "lucide-react";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef } from "react";

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAddressList?: () => void;
}

export function LocationDropdown({ isOpen, onClose, onShowAddressList }: LocationDropdownProps) {
  const { refreshLocation, isLoading } = useLocation();
  const { isAuthenticated } = useAuth();
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

  const handleDetectLocation = () => {
    refreshLocation();
    onClose();
  };

  const handleManageAddresses = () => {
    onClose();
    onShowAddressList?.();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100]"
    >
      {/* Detect Current Location */}
      <button
        onClick={handleDetectLocation}
        disabled={isLoading}
        className="w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
      >
        <div className="p-2 bg-gutzo-primary/10 rounded-lg flex-shrink-0">
          <Navigation className={`h-5 w-5 text-gutzo-primary ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">
            {isLoading ? 'Detecting...' : 'Detect current location'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Using GPS
          </div>
        </div>
      </button>

      {/* Manage Saved Addresses (for authenticated users) */}
      {isAuthenticated && (
        <button
          onClick={handleManageAddresses}
          className="w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
        >
          <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
            <Plus className="h-5 w-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">Add/Manage Addresses</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Save addresses for faster checkout
            </div>
          </div>
        </button>
      )}

      {/* Recent Locations Section */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>RECENT LOCATIONS</span>
        </div>
        <div className="space-y-1">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
          >
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">Coimbatore, Tamil Nadu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
