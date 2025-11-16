import { MapPin, Loader2, AlertCircle, LogOut, User, ChevronDown, ShoppingCart, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ProfileDropdown } from "./auth/ProfileDropdown";
import { useLocation } from "../contexts/LocationContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { useRouter } from "../components/Router";
import { LocationBottomSheet } from "./LocationBottomSheet";
import { SearchBottomSheet } from "./SearchBottomSheet";
import { LocationDropdown } from "./LocationDropdown";
import { SearchDropdown } from "./SearchDropdown";
import gutzoLogo from 'figma:asset/dd6aa5fc791890562276e586be507ca46d14f4ee.png';

interface HeaderProps {
  onShowLogin?: () => void;
  onLogout?: () => void;
  onShowProfile?: (content: 'profile' | 'orders' | 'address') => void;
  onShowCart?: () => void;
  onShowAddressList?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onShowLogin, onLogout, onShowProfile, onShowCart, onShowAddressList, searchQuery = '', onSearchChange }: HeaderProps) {
  const { navigate } = useRouter();
  const { locationDisplay, isLoading, error, refreshLocation, isInCoimbatore } = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Get display name from AuthContext
  const displayName = user?.name || 'User';

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDropdownOptionClick = (option: 'profile' | 'orders' | 'address' | 'logout') => {
    if (option === 'logout') {
      onLogout?.();
    } else {
      onShowProfile?.(option);
    }
    setShowDropdown(false);
  };

  const handleMobileLocationClick = () => {
    setShowLocationSheet(true);
  };

  const handleMobileSearchClick = () => {
    setShowSearchSheet(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              type="button"
              aria-label="Go to homepage"
              onClick={() => navigate('/')}
              className="p-0 bg-transparent border-0 inline-flex items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
            >
              <ImageWithFallback
                src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                //src="http://192.168.1.39:54321/storage/v1/object/public/Gutzo/GUTZO.svg"
                //src="https://jrpiqxajjpyxiitweoqc.supabase.co/storage/v1/object/public/Gutzo%20Logo/GUTZO.svg"
                alt="Gutzo - Healthy Feels Good"
                className="h-32 w-auto sm:h-36 md:h-40"
              />
            </button>
          </div>

          {/* Unified Location & Search Component - Minimal Design */}
          <div className="hidden md:flex flex-1 items-center max-w-2xl">
            <div className="flex flex-1 items-center border border-gray-200 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {/* Location Selector with Dropdown */}
              <div className="relative min-w-[180px]">
                <div 
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  title="Click to select location"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 flex-shrink-0" />
                  ) : error ? (
                    <AlertCircle className="h-5 w-5 text-gutzo-primary flex-shrink-0" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gutzo-primary flex-shrink-0" />
                  )}
                  <span className="truncate font-medium text-gray-900 whitespace-nowrap">
                    {isLoading ? "Detecting..." : error ? "Location Error" : locationDisplay}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                {/* Location Dropdown */}
                <LocationDropdown
                  isOpen={showLocationDropdown}
                  onClose={() => setShowLocationDropdown(false)}
                  onShowAddressList={onShowAddressList}
                />
              </div>

              {/* Strong Vertical Divider */}
              <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB', margin: '0 8px' }}></div>

              {/* Search Input with Dropdown */}
              <div className="flex-1 relative">
                <div className="flex items-center pl-2 pr-4 py-2.5">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for restaurant, salads or meals"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onFocus={() => setShowSearchDropdown(true)}
                    className="flex-1 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent ml-3"
                  />
                </div>
                
                {/* Search Dropdown */}
                <SearchDropdown
                  isOpen={showSearchDropdown}
                  onClose={() => setShowSearchDropdown(false)}
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange || (() => {})}
                />
              </div>
            </div>
          </div>          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              type="button"
              onClick={onShowCart}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer hover:opacity-90 active:scale-95 hover:bg-gray-50 transition-colors transition-transform"
              title="View cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gutzo-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            
            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors min-w-[44px] min-h-[44px] group"
                  title="View profile options"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gutzo-primary text-white font-medium text-sm">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex items-center space-x-1">
                    <span className="font-medium text-gray-900 text-sm max-w-20 truncate">
                      {authLoading ? 'Loading...' : displayName}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 group-hover:text-gutzo-primary transition-all duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                <ProfileDropdown
                  isOpen={showDropdown}
                  onClose={() => setShowDropdown(false)}
                  onOptionClick={handleDropdownOptionClick}
                  userInfo={user ? {
                    name: user.name,
                    phone: user.phone,
                    email: user.email
                  } : null}
                />
              </div>
            ) : (
              <Button
                onClick={onShowLogin}
                className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-xl font-medium transition-colors min-w-[44px] min-h-[44px] px-3 sm:px-4 py-2 text-sm sm:text-base flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
                <span className="sr-only sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile: Location & Search Row - Minimal Zomato Style */}
        <div className="md:hidden pb-3 pt-1">
          <div className="flex items-center justify-between px-1">
            {/* Location Section - Opens Bottom Sheet */}
            <button 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 py-1"
              onClick={handleMobileLocationClick}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-gutzo-primary flex-shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 text-gutzo-primary flex-shrink-0" />
              )}
              <span className="truncate text-sm text-gray-900 font-medium">
                {isLoading ? "Detecting..." : error ? "Error" : locationDisplay}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
            </button>

            {/* Search Icon - Opens Bottom Sheet */}
            <button 
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              onClick={handleMobileSearchClick}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Bottom Sheets for Mobile */}
      <LocationBottomSheet
        isOpen={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        onShowAddressList={onShowAddressList}
      />
      
      <SearchBottomSheet
        isOpen={showSearchSheet}
        onClose={() => setShowSearchSheet(false)}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange || (() => {})}
      />
    </>
  );
}