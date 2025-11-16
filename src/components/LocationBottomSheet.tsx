import { MapPin, Loader2, AlertCircle, X, Navigation, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";

interface LocationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAddressList?: () => void;
}

export function LocationBottomSheet({ isOpen, onClose, onShowAddressList }: LocationBottomSheetProps) {
  const { locationDisplay, isLoading, error, refreshLocation, isInCoimbatore } = useLocation();
  const { isAuthenticated } = useAuth();

  const handleDetectLocation = () => {
    refreshLocation();
  };

  const handleManageAddresses = () => {
    onClose();
    onShowAddressList?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out" 
        style={{ top: '104px', bottom: 0, height: 'calc(100vh - 104px)' }}
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
        <SheetHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Select Location</SheetTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors -mr-2"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-4">
          {/* Current Location Display */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 flex-shrink-0 mt-0.5" />
            ) : error ? (
              <AlertCircle className="h-5 w-5 text-gutzo-primary flex-shrink-0 mt-0.5" />
            ) : (
              <MapPin className="h-5 w-5 text-gutzo-primary flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">
                {isLoading ? "Detecting location..." : error ? "Location Error" : "Current Location"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isLoading ? "Please wait..." : error ? error : locationDisplay}
              </div>
              {!isInCoimbatore && !isLoading && !error && (
                <div className="text-xs text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded-md inline-block">
                  Service currently available only in Coimbatore
                </div>
              )}
            </div>
          </div>

          {/* Detect Current Location Button */}
          <Button
            onClick={handleDetectLocation}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gutzo-primary border border-gray-200 rounded-xl py-6 flex items-center justify-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <Navigation className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
            <span className="font-medium">
              {isLoading ? 'Detecting...' : 'Detect Current Location'}
            </span>
          </Button>

          {/* Manage Addresses (for authenticated users) */}
          {isAuthenticated && (
            <Button
              onClick={handleManageAddresses}
              className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-xl py-6 flex items-center justify-center gap-3"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add/Manage Addresses</span>
            </Button>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 pt-2">
            We need your location to show restaurants delivering to you
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
