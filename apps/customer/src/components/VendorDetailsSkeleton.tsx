import React from "react";
import { Skeleton } from "./ui/skeleton";

const VendorDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f7f7fa]">
      <div className="max-w-[800px] mx-auto px-4 lg:px-0 pt-5 pb-20">
        {/* Header Section */}
        <div className="mb-4 pt-5">
           <div className="flex items-center justify-between mb-4">
               <Skeleton className="h-6 w-6 rounded-full" />
           </div>
           <Skeleton className="h-10 w-3/4 rounded-lg bg-gray-300/50" />
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm mb-8 w-full">
           {/* Rating Row */}
           <div className="flex items-center mb-3">
             <Skeleton className="h-5 w-5 rounded-full mr-2" />
             <Skeleton className="h-5 w-24 rounded-md" />
           </div>
           
           {/* Cuisine Tagline */}
           <Skeleton className="h-5 w-48 mb-4 rounded-md" />
           
           {/* Outlet & Delivery Info */}
           <div className="flex items-start mb-4">
              <div className="flex flex-col items-center mr-3 pt-1">
                 <Skeleton className="h-2 w-2 rounded-full mb-1" />
                 <Skeleton className="h-8 w-1 rounded-full mb-1" />
                 <Skeleton className="h-2 w-2 rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                 <div className="flex items-center">
                    <Skeleton className="h-4 w-12 mr-2" />
                    <Skeleton className="h-4 w-32" />
                 </div>
                 <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-4 w-40" />
                 </div>
              </div>
           </div>

           {/* Footer Strip */}
           <div className="mt-4 pt-2">
             <Skeleton className="h-12 w-full rounded-b-[20px] rounded-t-sm" />
           </div>
        </div>

        {/* Meal Plans Section */}
        <div className="mb-8">
           <Skeleton className="h-7 w-48 mb-4 rounded-md" />
           <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[280px]">
                  <Skeleton className="h-40 w-full rounded-t-xl mb-0" />
                  <div className="p-3 bg-white rounded-b-xl border border-t-0 border-gray-100">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
           </div>
        </div>

         {/* Grid Section */}
        <div>
           <Skeleton className="h-7 w-40 mb-4 rounded-md" />
           <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-3 rounded-xl shadow-sm">
                   <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                         <Skeleton className="h-4 w-4 rounded-sm" />
                         <Skeleton className="h-5 w-full" />
                         <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default VendorDetailsSkeleton;
