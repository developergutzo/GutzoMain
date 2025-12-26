import React, { useState } from "react";
import StarIcon from "./StarIcon";

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
}


const VendorHeader: React.FC<VendorHeaderProps> = ({ name, rating, reviews, location, deliveryTime, tags, cuisineType, userAddressLabel, isLoadingEta, onAddressClick, onBack }) => {
  // Construct dynamic tagline: "Cuisine · First Tag"
  const tagline = [
    cuisineType,
    tags && tags.length > 0 ? tags[0] : null
  ].filter(Boolean).join(' · ') || "Fresh Bowls · Wholesome Meals";

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
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', margin: '16px auto', padding: 16, fontFamily: 'Poppins, sans-serif', width: '100%' }}>
        {/* Ratings & Price Row (plain text, bold, no pill) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginRight: 8, display: 'flex', alignItems: 'center' }}>
            <StarIcon size={16} color="#43A047" className="mr-1 font-sans" />
            <span style={{ color: '#1A1A1A' }}>{rating}</span>
            <span style={{ color: '#6B6B6B', fontWeight: 500, marginLeft: 4 }}>({reviews} ratings)</span>
          </span>
        </div>
        {/* Cuisine Row */}
        <div style={{ color: '#1BA672', fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>
          {tagline}
        </div>
        {/* Outlet Row */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
          {/* Vertical line with dots, perfectly centered */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 56, marginRight: 8 }}>
            <svg width="16" height="56" style={{ display: 'block' }}>
              <circle cx="8" cy="12" r="4" fill="#D3D3D3" />
              <rect x="7" y="16" width="2" height="24" rx="1" fill="#D3D3D3" />
              <circle cx="8" cy="44" r="4" fill="#D3D3D3" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
              <span style={{ color: '#6B6B6B', fontWeight: 700, fontSize: '0.95rem', marginRight: 6 }}>Outlet</span>
              <span style={{ color: '#6B6B6B', fontWeight: 500, fontSize: '0.95rem', marginLeft: 2 }}>{location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
              {isLoadingEta ? (
                 <div className="h-5 w-24 bg-gray-100 animate-pulse rounded mr-2 blur-[1px] opacity-70" style={{ marginRight: 6 }}></div>
              ) : (
                <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.95rem', marginRight: 6 }}>{deliveryTime}</span>
              )}
              <span 
                onClick={onAddressClick}
                style={{ 
                  color: '#6B6B6B', 
                  fontWeight: 500, 
                  fontSize: '0.95rem',
                  cursor: onAddressClick ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: '220px', // Limit width to force truncation
                }}
              >
                <span className="shrink-0 mr-1">Delivery to</span>
                <span className="truncate block" style={{ maxWidth: '140px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userAddressLabel || "Location"}
                </span>
                {onAddressClick && <span style={{ fontSize: '0.8em', marginLeft: 4, flexShrink: 0 }}>▼</span>}
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
    </>
  );
};

export default VendorHeader;
