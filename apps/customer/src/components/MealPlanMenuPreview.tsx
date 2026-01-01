import React from 'react';
import { ImageWithFallback } from './common/ImageWithFallback';

const SAMPLE_MENU = [
  { day: 'Mon', meal: 'Chicken Chettinad Bowl', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=300&q=80', description: 'Available' },
  { day: 'Tue', meal: 'Aloo Gobi & Roti', image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=300&q=80', description: 'Available' },
  { day: 'Wed', meal: 'Spinach Dal Curry', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80', description: 'Available' },
  { day: 'Thu', meal: 'Paneer Butter Masala', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80', description: 'Available' },
  { day: 'Fri', meal: 'Vegetable Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', description: 'Available' },
  { day: 'Sat', meal: 'Ghee Roast & Sambar', image: 'https://images.unsplash.com/photo-1589301760576-a4129b811d02?auto=format&fit=crop&w=300&q=80', description: 'Available' },
];

interface MealPlanMenuPreviewProps {
  removePadding?: boolean;
}

export const MealPlanMenuPreview = ({ removePadding = false }: MealPlanMenuPreviewProps) => {
  return (
    <div className={removePadding ? "mb-2" : "mb-6"}>
      
      {/* Horizontal Carousel */}
      <div 
        className={`flex overflow-x-auto pb-2 scrollbar-hide ${removePadding ? '-mr-5 pr-5 gap-2' : '-mx-4 px-4 gap-3'}`}
        style={removePadding ? { width: 'calc(100% + 20px)' } : undefined}
      >
        {SAMPLE_MENU.map((item) => (
          <div key={item.day} className="flex-shrink-0 w-32 flex flex-col">
            <div className="h-24 w-32 rounded-gutzo-card overflow-hidden mb-2 relative">
               <ImageWithFallback 
                 src={item.image} 
                 alt={item.meal} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute bottom-0 left-0 w-full bg-black-50 text-white text-[10px] font-bold text-center py-0.5">
                 {item.day}
               </div>
            </div>
            <div className="text-xs font-medium text-main text-center leading-tight line-clamp-2">
              {item.meal}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
