import { MapPin, Loader2, AlertCircle, LogOut, User, ChevronDown, ShoppingBag, Search, X } from "lucide-react";
import MobileProfileIcon from "./MobileProfileIcon";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ProfileDropdown } from "./auth/ProfileDropdown";
import { useLocation } from "../contexts/LocationContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { useRouter } from "../components/Router";
import colors from "../styles/colors";
// LocationBottomSheet moved to App.tsx
import { SearchBottomSheet } from "./SearchBottomSheet";
import { LocationDropdown } from "./LocationDropdown";
import { SearchDropdown } from "./SearchDropdown";
import gutzoLogo from 'figma:asset/dd6aa5fc791890562276e586be507ca46d14f4ee.png';

export interface HeaderProps {
  onShowLogin?: () => void;
  onLogout?: () => void;
  onShowProfile?: (content: 'profile' | 'orders' | 'address') => void;
  onShowCart?: () => void;
  onShowAddressList?: () => void;
  onShowLocationSheet?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /**
   * When true, hide product interactive UI (location, search, login, cart).
   * Used on static pages (About, Terms, Privacy, Refund).
   */
  hideInteractive?: boolean;
  /**
   * Optional small page label to display next to the logo (e.g. "About Us").
   */
  pageLabel?: string;
  hideSearchLocation?: boolean;
  hideCart?: boolean;
}


export function Header({ onShowLogin, onLogout, onShowProfile, onShowCart, onShowAddressList, onShowLocationSheet, searchQuery = '', onSearchChange, hideInteractive = false, pageLabel, hideSearchLocation = false, hideCart = false }: HeaderProps) {
  const { navigate } = useRouter();
  const { locationDisplay, isLoading, error, refreshLocation, isInCoimbatore, locationLabel } = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  // showLocationSheet state moved to App.tsx
  // showLocationSheet state moved to App.tsx
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      setShowLogoutConfirm(true);
    } else {
      onShowProfile?.(option);
    }
    setShowDropdown(false);
  };

  const handleMobileLocationClick = () => {
    onShowLocationSheet?.();
  };

  const handleMobileSearchClick = () => {
    setShowSearchSheet(true);
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 md:gap-4 lg:gap-6 h-20">
          {/* Logo */}
          <div className="flex-shrink-0" style={{ minWidth: '140px' }}>
            <button
              type="button"
              aria-label="Go to homepage"
              onClick={() => navigate('/')}
              className="p-0 bg-transparent border-0 inline-flex items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
            >
              <img
                src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                alt="Gutzo"
                className="desktop-logo-height object-contain block"
                style={{ width: '140px', height: 'auto' }}
              />
            </button>
          </div>

          {/* Unified Location & Search Component - Minimal Design */}
          {pageLabel ? (
            // If a pageLabel is provided, show it next to the logo for static pages
            <div className="flex-1 flex items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{pageLabel}</span>
              </div>
            </div>
          ) : null}

          {!hideInteractive && !hideSearchLocation && (
            <div className="hidden md:flex flex-1 items-center max-w-2xl">
              <div className="flex flex-1 items-center border border-gray-200 rounded-08rem bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-h-[60px]">
                {/* Location Selector with Dropdown */}
                <div className="relative min-w-[130px] lg:min-w-[180px]">
                  <div 
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    title="Click to select location"
                  >
                    {isLoading ? (
                      <div className="flex flex-col gap-1 w-full max-w-[140px] py-1">
                        <div className="h-2.5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </div>
                    ) : (
                      <>
                        {error ? (
                          <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#E74C3C' }} />
                        ) : (
                          <MapPin className="h-5 w-5 text-gutzo-primary flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0 justify-center">
                          {error ? (
                            <span className="truncate font-medium text-gray-900 whitespace-nowrap">Location Error</span>
                          ) : locationLabel ? (
                            <>
                              <span className="text-[11px] font-bold text-gray-900 leading-tight uppercase tracking-wide">
                                {locationLabel}
                              </span>
                              <span className="truncate text-sm font-medium text-gray-600 leading-tight max-w-[200px]">
                                {locationDisplay}
                              </span>
                            </>
                          ) : (
                            <span className="truncate font-medium text-gray-900 whitespace-nowrap">
                              {locationDisplay}
                            </span>
                          )}
                        </div>
                      </>
                    )}
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
            </div>
          )}

          {/* Right Actions */}
          {!hideInteractive && (
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            {!hideCart && (
            <button

              type="button"
              onClick={onShowCart}
              className="relative flex items-center justify-center w-auto h-11 cursor-pointer transition-colors hidden md:flex px-3 bg-white focus:outline-none border-none shadow-none hover:bg-transparent"
              title="View cart"
              style={{ color: colors.textSecondary }}
              onMouseEnter={e => (e.currentTarget.style.color = colors.textPrimary)}
              onMouseLeave={e => (e.currentTarget.style.color = colors.textSecondary)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
              <span className="ml-2 font-normal hidden lg:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gutzo-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center cart-badge-desktop">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            )}
            
            {/* Auth Button */}
            {isAuthenticated ? (
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                {/* Mobile: Only show rounded initial */}
                <button
                  type="button"
                  aria-label="Profile"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="block md:hidden h-11 w-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full bg-gutzo-primary text-white flex items-center justify-center text-lg font-semibold border-none p-0 focus:outline-none"
                >
                  {getInitials(displayName)}
                </button>
                {/* Desktop: icon and name */}
                <button
                  type="button"
                  aria-label="Profile"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`hidden md:flex items-center bg-white border-none p-0 focus:outline-none transition-colors min-w-[44px] min-h-[44px] px-3 sm:px-4 py-2 text-sm sm:text-base hover:text-gutzo-primary hover:bg-transparent ${showDropdown ? 'text-gutzo-primary' : 'text-gray-900'}`}
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2 font-medium truncate inline-block align-middle username-truncate">{displayName}</span>
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
              <>
                {/* Mobile: Use the new SVG profile icon, visible only on mobile */}
                <button
                  onClick={onShowLogin}
                  className="block md:hidden h-11 w-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full flex items-center justify-center bg-transparent p-0 m-0 focus:outline-none"
                  aria-label="Login"
                >
                  <MobileProfileIcon className="w-11 h-11" />
                </button>
                {/* Desktop: Keep the existing button */}
                <Button
                  onClick={onShowLogin}
                  variant="secondary"
                  className="hidden md:flex items-center gap-1.5 font-medium min-w-[44px] min-h-[44px] px-3 sm:px-4 py-2 text-sm sm:text-base bg-white focus:outline-none border-none shadow-none hover:bg-transparent"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.color = colors.textPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = colors.textSecondary)}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-normal">Login</span>
                  <span className="sr-only sm:hidden">Login</span>
                </Button>
              </>
            )}
          </div>
          )}
        </div>

        {/* Mobile: Location & Search Row - Minimal Zomato Style */}
        {!hideInteractive && (
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
                <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#E74C3C' }} />
              ) : (
                <MapPin className="h-4 w-4 text-gutzo-primary flex-shrink-0" />
              )}
              <div className="flex flex-col min-w-0 text-left">
                {locationLabel && !isLoading && !error ? (
                  <>
                    <span className="text-[10px] font-bold text-gray-900 leading-tight uppercase tracking-wide">
                      {locationLabel}
                    </span>
                    <span className="truncate text-xs text-gray-600 font-medium leading-tight max-w-[150px]">
                      {locationDisplay}
                    </span>
                  </>
                ) : (
                  <span className="truncate text-sm text-gray-900 font-medium">
                    {isLoading ? <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"/> : error ? "Error" : locationDisplay}
                  </span>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
            </button>

            {/* Search Icon - Opens Bottom Sheet */}
              <button
                className="h-10 w-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 p-0 m-0 focus:outline-none"
                onClick={handleMobileSearchClick}
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
          </div>
        </div>
        )}
      </div>
    </header>

      {/* Bottom Sheets for Mobile */ }
      
      <SearchBottomSheet
        isOpen={showSearchSheet}
        onClose={() => setShowSearchSheet(false)}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange || (() => {})}
      />

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent 
          className="p-6 border-0 shadow-xl bg-white gap-0 overflow-hidden outline-none"
          style={{ 
            borderRadius: '24px',
            width: '90vw',
            maxWidth: '360px'
          }}
        >
          {/* Close Icon (Top Right) */}
          <button 
            onClick={() => setShowLogoutConfirm(false)}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none"
          >
             <X size={20} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col gap-2 mt-2">
            <AlertDialogHeader className="space-y-0">
              <AlertDialogTitle 
                className="text-left text-gray-900 leading-tight"
                style={{ fontSize: '20px', fontWeight: 600 }}
              >
                Log Out?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left text-[14px] text-gray-600 font-normal leading-relaxed mt-2 mb-6">
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                className="w-full h-12 flex items-center justify-center font-bold text-[16px] uppercase tracking-wide transition-transform active:scale-95 outline-none"
                style={{ 
                  backgroundColor: '#E8F6F1',
                  color: '#1BA672',
                  borderRadius: '10px'
                }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>
              
              <button
                className="w-full h-12 flex items-center justify-center text-white font-bold text-[16px] uppercase tracking-wide shadow-md transition-transform active:scale-95 outline-none"
                style={{ 
                   backgroundColor: '#1BA672',
                   borderRadius: '10px'
                }}
                onClick={() => {
                  onLogout?.();
                  setShowLogoutConfirm(false);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}