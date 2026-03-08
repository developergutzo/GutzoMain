import { Star, Clock } from "lucide-react";
import StarIcon from "./StarIcon";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { Vendor } from "../types";

interface VendorCardProps {
  vendor: Vendor;
  onClick: (vendor: Vendor, productId?: string) => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
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
      </CardContent>
    </Card>
  );
}