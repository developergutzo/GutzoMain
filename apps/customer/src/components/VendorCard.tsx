import { Star, Clock, Search, ChevronRight, ChevronDown } from "lucide-react";
import StarIcon from "./StarIcon";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { Vendor } from "../types";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface VendorCardProps {
  vendor: Vendor;
  onClick: (vendor: Vendor, productId?: string) => void;
  matchedItems?: any[] | null;
}

export function VendorCard({ vendor, onClick, matchedItems }: VendorCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card
      className="cursor-pointer group rounded-[16px] gutzo-card-hover transition-all duration-200 overflow-hidden p-0 flex flex-col shadow-none w-full gap-3"
      style={{
        width: '100%',
        minWidth: 0,
        height: 'auto',
        aspectRatio: '1.1/1',
        background: 'transparent',
        border: 'none',
        outline: 'none',
      }}
      onClick={() => {
        if (onClick) onClick(vendor);
      }}
    >
      <div className="w-full h-[180px] md:h-[180px] lg:h-[180px] xl:h-[180px] overflow-hidden rounded-[16px]" style={{marginBottom: '0'}}>
        <ImageWithFallback
          src={vendor.image || ""}
          alt={vendor.name}
          className="w-full h-full object-cover"
          style={{ 
            borderRadius: '16px',
            filter: vendor.isOpen === false ? 'grayscale(100%)' : 'none'
          }}
        />
      </div>
      <CardContent className="flex-1 flex flex-col pt-0 px-0 pb-0">
        {/* Vendor Name */}
        <h3 className="text-[20px] font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} title={vendor.name}>{vendor.name}</h3>
        {/* Rating and Delivery Time - single line, star left of rating, black rating */}
        <div className="flex items-center text-[15px] mb-1 leading-[1.2]" style={{ fontFamily: 'Poppins', gap: '8px' }}>
          <span className="flex items-center gap-1">
            <StarIcon size={16} color="#43A047" className="mr-0.5" />
            <span style={{ color: '#222', fontWeight: 600, fontSize: 16, marginLeft: 2 }}>{vendor.rating}</span>
          </span>
          <span className="mx-1 leading-none">•</span>
          {vendor.isServiceable === false ? (
             <span className="text-[14px]" style={{ color: '#E74C3C', fontWeight: 500 }}>Not Serviceable</span>
          ) : (
             <span style={{ color: '#222' }}>{vendor.deliveryTime}</span>
          )}
        </div>
        {/* Daily Food Tags */}
        <div className="text-[15px] text-gray-500 mb-1" style={{ fontFamily: 'Poppins', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {vendor.tags ? vendor.tags.join(', ') : ''}
        </div>
        {/* Location */}
        <div className="text-[15px] text-gray-500 mb-2" style={{ fontFamily: 'Poppins', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {vendor.location}
        </div>
        
        {matchedItems && matchedItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1.5">
              {(isExpanded ? matchedItems : matchedItems.slice(0, 2)).map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(vendor, item.id);
                  }}
                  className="group flex items-center justify-between rounded-[8px] px-3 py-2 bg-gray-50/80 hover:bg-[#E8F6F1] cursor-pointer transition-all border border-transparent hover:border-[#CDEBDD]"
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1BA672] flex-shrink-0 transition-colors" />
                    <span className="text-[13px] text-gray-700 font-medium truncate group-hover:text-[#1BA672] transition-colors" style={{ fontFamily: 'Poppins' }}>
                      {item.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1BA672] flex-shrink-0 transition-colors" />
                </div>
              ))}
              {matchedItems.length > 2 && (
                 <div 
                   onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                   className="text-[12px] text-gray-500 hover:text-[#1BA672] font-medium px-2 pt-0.5 flex items-center gap-1 cursor-pointer transition-colors w-fit" 
                   style={{ fontFamily: 'Poppins' }}
                 >
                   {isExpanded ? "Show less" : `+${matchedItems.length - 2} more product matches`}
                   <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                 </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}