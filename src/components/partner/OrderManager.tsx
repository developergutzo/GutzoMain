import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";

export function OrderManager({ vendorId }: { vendorId: string }) {
  // Placeholder implementation for MVP+
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Incoming Orders</h2>
                <p className="text-sm text-gray-500">View and manage customer orders</p>
            </div>
             <Button variant="outline" className="text-gray-500">Refresh</Button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed rounded-xl">
             <img src="https://cdn-icons-png.flaticon.com/512/10839/10839485.png" alt="Empty" className="w-24 h-24 opacity-20 mb-4" />
             <h3 className="text-lg font-medium text-gray-900">No Active Orders</h3>
             <p className="text-gray-500 text-sm max-w-sm text-center">New orders will appear here automatically. Make sure your kitchen status is "Online".</p>
        </div>
    </div>
  );
}
