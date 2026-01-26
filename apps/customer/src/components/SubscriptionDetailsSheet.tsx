import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { X, Calendar, Utensils, SkipForward, Ban, ChevronRight } from "lucide-react";
import { format } from 'date-fns';
import { useMediaQuery } from "../hooks/use-media-query";
import { Button } from "./ui/button";

interface SubscriptionDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any; // We can refine type later
  onSkip?: () => void;
  onCancel?: () => void;
}

export function SubscriptionDetailsSheet({ 
    isOpen, 
    onClose, 
    subscription,
    onSkip,
    onCancel
}: SubscriptionDetailsSheetProps) {
    const isDesktop = useMediaQuery("(min-width: 850px)");

    if (!subscription) return null;

    // Helper to format days
    const formatDays = (days: string[]) => {
        if (!days || days.length === 0) return "Select days";
        // If "Mon" through "Sat" are all present
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const isRoutine = weekDays.every(d => days.includes(d));
        if (isRoutine) return "Mon-Sat";
        return days.join(", ");
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side={isDesktop ? "right" : "bottom"}
                className={`
                    p-0 bg-white transition-transform duration-300 ease-in-out
                    ${isDesktop 
                        ? "h-full w-[95%] max-w-[500px] border-l border-gray-200 shadow-2xl" 
                        : "rounded-t-3xl w-full max-w-full fixed bottom-0 left-0 right-0 z-[1100]"
                    }
                `}
                style={isDesktop ? {} : { 
                    height: 'auto',
                    maxHeight: '90vh',
                    zIndex: 1100 
                }}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                         <h2 className="text-xl font-bold text-gray-900">Subscription Details</h2>
                         <p className="text-sm text-gray-500 mt-1">Manage your active plan</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors -mr-2"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                    
                    {/* Active Plan Card */}
                    <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{subscription.planName || "Weekly Meal Plan"}</h3>
                                <p className="text-sm text-green-700 font-medium">Active • Auto-renews</p>
                            </div>
                            <div className="px-3 py-1 bg-white rounded-full text-xs font-bold text-green-700 border border-green-200 shadow-sm">
                                WEEKLY
                            </div>
                        </div>

                        <div className="space-y-3">
                             <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm mt-0.5">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Schedule</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDays(subscription.days)}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm mt-0.5">
                                    <Utensils className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Meals</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {subscription.meals?.join(", ") || "Lunch, Dinner"}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Upcoming Delivery (Mock) */}
                     <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-base">Next Delivery</h4>
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                    TOM
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Tomorrow, Lunch</p>
                                    <p className="text-xs text-gray-500">Scheduled for 12:30 PM</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1 border-gray-200"
                                onClick={onSkip}
                            >
                                <SkipForward className="w-3 h-3" /> Skip
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100">
                        <Button 
                            variant="ghost" 
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-12 gap-2"
                            onClick={onCancel}
                        >
                            <Ban className="w-4 h-4" />
                            Cancel Subscription
                        </Button>
                    </div>

                </div>

            </SheetContent>
        </Sheet>
    );
}
