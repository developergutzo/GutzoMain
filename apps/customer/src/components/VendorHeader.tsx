import React, { useState } from "react";
import StarIcon from "./StarIcon";
import { MapPin } from "lucide-react";

interface VendorHeaderProps {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  deliveryTime: string;
  tags: string[];
  cuisineType?: string;
  userAddressLabel?: string;
  isLoadingEta?: boolean;
  onAddressClick?: () => void;
  onBack?: () => void;
  isOpen?: boolean;
  nextOpenTime?: string;
}


const VendorHeader: React.FC<VendorHeaderProps> = ({ name, rating, reviews, location, deliveryTime, tags, cuisineType, userAddressLabel, isLoadingEta, onAddressClick, onBack, isOpen = true, nextOpenTime }) => {
  // Construct dynamic tagline: "Cuisine · First Tag"
  const tagline = [
    cuisineType,
    tags && tags.length > 0 ? tags[0] : null
  ].filter(Boolean).join(' · ') || "Fresh Bowls · Wholesome Meals";

  // Helper to shorten address to "Area, City" or "Street, Area"
  const formatVendorLocation = (address: string) => {
    if (!address) return "Location";
    const parts = address.split(',').map(p => p.trim());
    // If we have enough details (>=2 parts), usually [Area, City] or [Street, Area, City]
    // We want the Area and City/Locality
    if (parts.length >= 2) {
      // Return the 2nd to last and 3rd to last parts if possible, or just the middle ones
      // Actually, user wants "Sulur", "Chinniampalayam" etc.
      // Usually these are the 2nd to last item (before City) or the last item (if just Area)
      // User wants just "Location" (Area) like "Sulur", "Chinniyampalayam"
      // Assuming format is [..., Area, City]
      // We take the second to last item.
      return parts[parts.length - 2]; 
    }
    return address;
  };

  const displayLocation = formatVendorLocation(location);

  return (
    <>
      {/* Header Section (outside card) */}
      {/* Header Section: back arrow and share icon horizontally aligned, vendor name below */}
      <div style={{ padding: '20px 0px 0 0px', background: 'transparent' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            onClick={typeof onBack === 'function' ? onBack : () => window.history.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', fontSize: 24, lineHeight: 1 }}>
            &larr;
          </button>
          <div style={{ flex: 1 }} />
          {/*
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}
            aria-label="Share"
          >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="8" cy="16" r="3" stroke="#1A1A1A" strokeWidth="2" fill="none" />
              <circle cx="24" cy="8" r="3" stroke="#1A1A1A" strokeWidth="2" fill="none" />
              <circle cx="24" cy="24" r="3" stroke="#1A1A1A" strokeWidth="2" fill="none" />
              <line x1="10.7" y1="14.7" x2="21.3" y2="9.3" stroke="#1A1A1A" strokeWidth="2" />
              <line x1="10.7" y1="17.3" x2="21.3" y2="22.7" stroke="#1A1A1A" strokeWidth="2" />
            </svg>
          </button>
          */}
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '8px 0 0 0', lineHeight: 1.2, textAlign: 'left', background: 'transparent' }}>{name}</h1>
      </div>

      {/* Card Section (below header) */}
      <div className="relative" style={{ width: '100%', margin: '16px auto' }}>
        {/* Closed/Opening Soon Banner - Positioned absolutely at top center overlapping the card edge */}
        {!isOpen && (
            <div 
              style={{ 
                position: 'absolute', 
                top: -24, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                zIndex: 10,
                background: 'linear-gradient(to bottom, #4A4A4A, #2C2C2C)',
                borderRadius: '12px',
                padding: '6px 24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '2px solid white'
              }}
            >
               <span style={{ color: 'white', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', lineHeight: 1 }}>Currently</span>
               <span style={{ color: 'white', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>CLOSED</span>
            </div>
        )}

      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 16, paddingTop: !isOpen ? 40 : 16, fontFamily: 'Poppins, sans-serif', width: '100%' }}>
        {/* Header Row: Cuisine (Left) & Rating (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
           {/* Left: Cuisine */}
           <div style={{ color: '#1BA672', fontWeight: 600, fontSize: '0.95rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 8 }}>
              {tagline}
           </div>

           {/* Right: Rating Badge */}
           <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#1BA672', 
              color: 'white',
              padding: '2px 8px', // Slightly more padding for pill shape
              borderRadius: '20px', // Fully rounded
              marginLeft: 8,
              flexShrink: 0
           }}>
              <StarIcon size={14} color="white" className="mr-1 font-sans" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rating}</span>
           </div>
        </div>
        
        {/* Delivery Time Row */}
        <div style={{ marginBottom: 6 }}>
           <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.9rem' }}>
              {isLoadingEta ? (
                 <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />
              ) : (
                <span>{deliveryTime}</span>
              )}
           </span>
        </div>
        {/* Outlet & Delivery Row */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>


          {/* Right Content Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, paddingBottom: 2, minWidth: 0 }}>
            
            {/* Row 1: Outlet */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 20 }}>
               <MapPin size={14} color="#6B6B6B" style={{ marginRight: 6 }} />
               <span style={{ color: '#6B6B6B', fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                  {displayLocation}
               </span>
            </div>

          </div>
        </div>
        {/* Free Delivery Strip */}
        <div style={{ background: '#FFF0E8', color: '#E85A1C', fontWeight: 700, fontSize: '0.95rem', borderRadius: '0 0 20px 20px', padding: '10px 16px', margin: '12px -16px -16px -16px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 6 }}>🛵</span>
          Free delivery on orders above ₹99
        </div>
      </div>
      </div>
    </>
  );
};

export default VendorHeader;
