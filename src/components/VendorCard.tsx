import { Star, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { Vendor } from "../types";

interface VendorCardProps {
  vendor: Vendor;
  onClick: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  const availableCount = vendor.products?.filter(p => p.available).length || 0;
  const totalCount = vendor.products?.length || 0;
  // Example: show offer if vendor.tags includes 'offer', show promoted if 'promoted'
  const isPromoted = vendor.tags?.includes('promoted');
  const offerTag = vendor.tags?.find(tag => tag.toLowerCase().includes('off'));
  return (
    <Card
      className="cursor-pointer group bg-white rounded-08rem transition-all duration-200 overflow-hidden p-0 flex flex-col border border-transparent shadow-none hover:shadow-lg hover:border-[#F1F1F1]"
      style={{
        width: '100%',
        maxWidth: 370,
        minWidth: 0,
        height: 'auto',
        aspectRatio: '1.15/1',
      }}
      onClick={() => onClick(vendor)}
    >
  <div className="relative w-full h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] overflow-hidden rounded-t-[0.8rem]">
        <ImageWithFallback
          src={vendor.image || ""}
          alt={`${vendor.name} logo`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {/* Promoted badge */}
        {isPromoted && (
          <div className="absolute top-2 left-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded shadow z-10" style={{letterSpacing: 0.2}}>
            Promoted
          </div>
        )}
        {/* Offer badge */}
        {offerTag && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow z-10">
            {offerTag.toUpperCase()}
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center bg-white px-2 py-0.5 rounded shadow z-10">
          <span className="text-green-700 font-bold text-xs mr-1">{vendor.rating?.toFixed(1)}</span>
          <Star className="h-3 w-3 text-green-600 fill-current" />
        </div>
      </div>
      <CardContent className="flex-1 flex flex-col px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base truncate text-gray-900" style={{ fontFamily: 'Poppins' }}>{vendor.name}</h3>
          <span className="text-gray-500 text-xs font-medium">₹{vendor.minimumOrder} for one</span>
        </div>
        <div className="text-gray-600 text-xs truncate mb-1" style={{ fontFamily: 'Poppins' }}>{vendor.cuisineType}</div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{vendor.deliveryTime || '30 min'}</span>
          <span>{vendor.location}</span>
        </div>
      </CardContent>
    </Card>
  );
}