import React, { useState } from 'react';
import { Sheet, SheetContent } from './ui/sheet'; // Adjust path if needed
import { X, Check, CheckCircle2, ChevronRight, ChevronDown, Star, Calendar, Info, Clock, MapPin, Sun, Utensils, Moon, Coffee, ArrowRight, Lightbulb, Repeat } from 'lucide-react';
import { MealPlan } from './WeeklyMealPlansSection';

import { nodeApiService } from '../utils/nodeApi';
import { format, addDays, isTomorrow, getDay, isSameDay } from 'date-fns';

import { useMediaQuery } from '../hooks/use-media-query';
import { useCart } from '../contexts/CartContext';

interface MealPlanBottomSheetProps {
  plan: MealPlan | null;
  onClose: () => void;
}

const MealPlanBottomSheet: React.FC<MealPlanBottomSheetProps> = ({ plan, onClose }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { addItem, hasItemsFromDifferentVendor, clearCart } = useCart();
  
  // State for Healthy Daily Logic (HMR Trigger 1)
  const [duration, setDuration] = useState<'Trial' | '1 Week' | 'Monthly'>('1 Week'); // Default to "Most Chosen"
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['Breakfast', 'Lunch', 'Dinner']);
  const [isVeg, setIsVeg] = useState(true);
  // State for Day Selection
  const [monthlyDays, setMonthlyDays] = useState<4 | 5 | 6>(5);
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); // 1=Mon... 6=Sat
  
  // State for Full Menu View
   const [showFullMenu, setShowFullMenu] = useState(false);
   
   // Accordion States for Progressive Disclosure
   const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
   const [isMealsExpanded, setIsMealsExpanded] = useState(false);
   const [isRoutineDetailsExpanded, setIsRoutineDetailsExpanded] = useState(false);
  
  // State for Main Sheet Visibility (for Replace Pattern) - REMOVED
  // const [isMainVisible, setIsMainVisible] = useState(true); 
  
  // Generate next 7 calendar days (to handle "Closed" states visually)
  const generateDates = () => {
    const dates: Date[] = [];
    for (let i = 1; i <= 7; i++) {
        dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  const availableDates = generateDates();

  // Find first valid date for default state
  const getFirstValidDate = () => {
    return availableDates.find(d => getDay(d) !== 0) || addDays(new Date(), 1);
  };

  // State for Start Date Picker
  const [isDatePickerExpanded, setIsDatePickerExpanded] = useState(false);
  const [startDate, setStartDate] = useState<Date>(getFirstValidDate());

  // Force default selection logic only on mount
   React.useEffect(() => {
      setDuration('1 Week');
      setStartDate(getFirstValidDate());
   }, []);



  // Constants
  const weeklyPrice = plan ? parseInt(plan.price.replace(/[^\d]/g, '')) || 89 : 89;
  const isRoutine = duration !== 'Trial'; // Binary state logic for UI
  const isTrial = duration === 'Trial';
  
  // Toggle helpers
  const toggleMeal = (meal: string) => {
    if (selectedMeals.includes(meal)) {
      setSelectedMeals(selectedMeals.filter(m => m !== meal));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };

  const toggleWeekDay = (day: number) => {
    if (day === 0) return; // Sunday disabled
    if (weekDays.includes(day)) {
      if (weekDays.length > 3) {
        setWeekDays(weekDays.filter(d => d !== day));
      }
    } else {
      setWeekDays([...weekDays, day].sort());
    }
  };


  if (!plan) return null;

  if (!plan) return null;

  return (
    <Sheet open={!!plan} onOpenChange={(open) => {
      if (!open) {
         onClose();
         setTimeout(() => setShowFullMenu(false), 300); // Reset on close
      }
    }}>
      <SheetContent 
        side={isDesktop ? "right" : "bottom"}
        className={`
          flex flex-col gap-0 p-0 transition-transform duration-300 ease-in-out
          ${isDesktop 
            ? 'h-full border-l shadow-2xl' 
            : 'w-full max-w-full rounded-t-3xl left-0 right-0 overflow-hidden'}
        `}
        style={isDesktop 
           ? { width: '600px', maxWidth: '600px', zIndex: 1002 } 
           : { top: '104px', bottom: 0, height: 'calc(100vh - 104px)', zIndex: 1002 }
        }
      >
        <style>{`
           [data-slot="sheet-content"] > button[class*="absolute"] {
             display: none !important;
           }
           /* Force override for the persisted class in user's browser */
           .bg-green-100 {
             background-color: #FFF3E6 !important;
           }
        `}</style>
        
        {/* Content Wrapper */}
        <div className="flex flex-col h-full relative bg-white">
           {/* ----------------------------------------------------------------------
               PERSISTENT HEADER (Plan Info + Close)
               ---------------------------------------------------------------------- */}
           {!showFullMenu && (
             <div className="flex items-start justify-between px-6 pt-4 pb-0 flex-shrink-0">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{plan.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">by {plan.vendor}</p>
               </div>
               <div className="flex items-center gap-3">
                  {/* Veg Toggle */}
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
               </div>
             </div>
           )}

        {showFullMenu ? (
           // ----------------------------------------------------------------------
           // FULL MENU VIEW (Nested Content)
           // ----------------------------------------------------------------------
           <div className="flex flex-col flex-1 overflow-hidden mt-2">
              {/* Secondary Header (Back + Title) */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
                 <button 
                  onClick={() => setShowFullMenu(false)}
                  className="p-1.5 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                 >
                    <ArrowRight className="h-5 w-5 text-gray-700 rotate-180" /> {/* Back Icon */}
                 </button>
                 <h2 className="text-sm font-bold text-gray-900">Weekly Menu</h2>
              </div>

              {/* Scrollable Menu List */}
               <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                  <div className="space-y-4">
                   {/* Dynamic Menu Loop */}
                   {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                      const dayData = plan.dayMenu?.find(d => d.day_of_week === dayNum);
                      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
                      
                      const today = new Date();
                      const todayNum = today.getDay();
                      const tomorrowNum = (todayNum + 1) % 7;
                      const dayAfterTomorrowNum = (todayNum + 2) % 7;
                      
                      const isTomorrow = dayNum === tomorrowNum;
                      const isDayAfterTomorrow = dayNum === dayAfterTomorrowNum;

                      // Check if Tomorrow is a Rest Day (to decide if we show "Day After Tomorrow" tag)
                      const tomorrowData = plan.dayMenu?.find(d => d.day_of_week === tomorrowNum);
                      const tomorrowIsRestDay = !(tomorrowData && (tomorrowData.breakfast_item || tomorrowData.lunch_item || tomorrowData.dinner_item || tomorrowData.snack_item));

                      // Enhanced Logic: Any day with no menu items is a "Rest Day"
                      const hasMenuData = dayData && (dayData.breakfast_item || dayData.lunch_item || dayData.dinner_item || dayData.snack_item);

                      if (!hasMenuData) {
                         return (
                            <div key={dayNum} className="p-4 rounded-xl bg-gray-100 border border-gray-200 text-center relative overflow-hidden">
                               {isTomorrow && (
                                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                     TOMORROW
                                  </div>
                               )}
                               <p className="text-sm font-medium text-gray-500">{dayName} is a rest day 😴</p>
                               <p className="text-xs text-gray-400 mt-1">Kitchen closed</p>
                            </div>
                         );
                      }

                      if (!dayData) return null;

                      return (
                         <div key={dayNum} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                               <h3 className="font-bold text-gray-900">{dayName}</h3>
                              {isTomorrow && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#E8F6F1', color: '#1BA672' }}>TOMORROW</span>}
                              {(isDayAfterTomorrow && tomorrowIsRestDay) && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#E8F6F1', color: '#1BA672' }}>DAY AFTER TOMORROW</span>}
                            </div>
                            <div className="space-y-3">
                               {dayData.breakfast_item && (
                                  <div className="flex gap-3">
                                     <div className="mt-1 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                        <Sun size={14} className="text-orange-500" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Breakfast</p>
                                        <p className="text-sm font-medium text-gray-800">{dayData.breakfast_item}</p>
                                     </div>
                                  </div>
                               )}
                               {dayData.lunch_item && (
                                  <div className="flex gap-3">
                                     <div className="mt-1 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                        <Utensils size={14} className="text-green-500" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Lunch</p>
                                        <p className="text-sm font-medium text-gray-800">{dayData.lunch_item}</p>
                                     </div>
                                  </div>
                               )}
                               {dayData.dinner_item && (
                                  <div className="flex gap-3">
                                     <div className="mt-1 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Moon size={14} className="text-indigo-500" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Dinner</p>
                                        <p className="text-sm font-medium text-gray-800">{dayData.dinner_item}</p>
                                     </div>
                                  </div>
                               )}
                               {dayData.snack_item && (
                                  <div className="flex gap-3">
                                     <div className="mt-1 w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                                        <Coffee size={14} className="text-pink-500" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Snack</p>
                                        <p className="text-sm font-medium text-gray-800">{dayData.snack_item}</p>
                                     </div>
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                  </div>
               </div>
           </div>
        ) : (
           // ----------------------------------------------------------------------
           // MAIN MEAL PLAN VIEW
           // ----------------------------------------------------------------------
        <div className="flex flex-col flex-1 overflow-hidden">
           {/* Scrollable Content */}
           <div className="overflow-y-auto flex-1 bg-[#F5F6F8] px-4 py-4 scrollbar-hide">
            
            <div className="space-y-2">

              {/* 1️⃣ Trust Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                 <span className="text-green-600 font-semibold text-xs">↗ 96% choose to continue</span>
              </div>

              {/* 2️⃣ Menu Card */}
              <div 
                 onClick={() => setShowFullMenu(true)}
                 className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-3 cursor-pointer group hover:border-[#CDEBDD] hover:shadow-[0_4px_16px_rgba(27,166,114,0.1)] transition-all duration-200"
              >
                  {(() => {
                     const today = new Date().getDay(); // 0-6
                     let targetDay = (today + 1) % 7;
                     let dayData = plan.dayMenu?.find(d => d.day_of_week === targetDay);
                     
                     // Logic: If tomorrow has no menu (e.g. Sunday/Rest), try the day after
                     let isDayAfterTomorrow = false;
                     if (!dayData || (!dayData.breakfast_item && !dayData.lunch_item && !dayData.dinner_item)) {
                        targetDay = (today + 2) % 7;
                        dayData = plan.dayMenu?.find(d => d.day_of_week === targetDay);
                        isDayAfterTomorrow = true;
                     }

                     const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                     const targetDayName = dayNames[targetDay];

                     return (
                        <>
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gutzo-primary transition-colors">
                                 {targetDayName} <span className="text-orange-500 font-medium">({isDayAfterTomorrow ? 'Day After Tomorrow' : 'Tomorrow'})</span>
                              </h3>
                           </div>
                           
                           <div className="flex gap-3 items-center">
                              {/* Left: Menu List */}
                              <div className="flex-1 space-y-2">
                                 {(dayData && (dayData.breakfast_item || dayData.lunch_item || dayData.dinner_item || dayData.snack_item)) ? (
                                    <>
                                       {dayData.breakfast_item && (
                                          <div className="flex gap-2.5">
                                             <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                             <div>
                                                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide" style={{ fontSize: '12px' }}>BREAKFAST</p>
                                                <p className="text-[12px] font-semibold text-gray-800 leading-tight" style={{ fontSize: '12px' }}>{dayData.breakfast_item}</p>
                                             </div>
                                          </div>
                                       )}
                                       {dayData.lunch_item && (
                                          <div className="flex gap-2.5">
                                             <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                             <div>
                                                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide" style={{ fontSize: '12px' }}>LUNCH</p>
                                                <p className="text-[12px] font-semibold text-gray-800 leading-tight" style={{ fontSize: '12px' }}>{dayData.lunch_item}</p>
                                             </div>
                                          </div>
                                       )}
                                       {dayData.dinner_item && (
                                          <div className="flex gap-2.5">
                                             <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                             <div>
                                                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide" style={{ fontSize: '12px' }}>DINNER</p>
                                                <p className="text-[12px] font-semibold text-gray-800 leading-tight" style={{ fontSize: '12px' }}>{dayData.dinner_item}</p>
                                             </div>
                                          </div>
                                       )}
                                       {dayData.snack_item && (
                                          <div className="flex gap-2.5">
                                             <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                                             <div>
                                                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide" style={{ fontSize: '12px' }}>SNACK</p>
                                                <p className="text-[12px] font-semibold text-gray-800 leading-tight" style={{ fontSize: '12px' }}>{dayData.snack_item}</p>
                                             </div>
                                          </div>
                                       )}
                                    </>
                                 ) : (
                                    <div className="py-2">
                                    <div className="py-2">
                                       <p className="text-sm font-medium text-gray-500 italic">Menu not available for next 2 days</p>
                                    </div>
                                    </div>
                                 )}
                              </div>
                              
                              {/* Right: Image */}
                              <div className="w-[100px] h-[100px] min-w-[100px] min-h-[100px] rounded-xl overflow-hidden bg-gray-100 shrink-0 group-hover:opacity-90 transition-opacity" style={{ width: '100px', height: '100px', minWidth: '100px', minHeight: '100px' }}>
                                 <img 
                                    src={plan.image || '/assets/mealplans/proteinpower.png'} 
                                    alt="Meal"
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           </div>
                           </>
                        );
                     })()}


                  <div className="mt-0 pt-3 border-t border-gray-100 flex justify-center">
                     <button 
                        className="w-full flex items-center justify-center gap-1 text-gray-500 text-[12px] font-medium group-hover:text-gutzo-primary group-hover:gap-2 transition-all py-0.5"
                     >
                        View full menu <ArrowRight size={14} />
                     </button>
                  </div>
               </div>
            </div>

              {/* 3️⃣ Plan Configuration */}
              <div className="mt-4">
                  {/* Duration - Always visible */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                     <h3 className="!text-[14px] md:!text-base !font-normal text-gray-900 mb-2" style={{ fontSize: '14px', fontWeight: 400 }}>How do you want to start?</h3>
                       {/* Card 1: Trial */}
                       <button
                          onClick={() => setDuration('Trial')}
                           style={{
                              borderWidth: isTrial ? '2px' : '1px',
                              borderColor: isTrial ? '#1BA672' : '#F3F4F6', // #F3F4F6 is gray-100
                              backgroundColor: isTrial ? '#F2FBF6' : 'white'
                           }}
                           className={`
                              relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all min-h-[80px] cursor-pointer w-full
                              ${isTrial 
                                 ? 'shadow-[0_4px_12px_rgba(27,166,114,0.15)] ring-1 ring-green-100' 
                                 : 'hover:border-green-300 hover:shadow-sm'}
                           `}
                        >
                           <div 
                              style={{ 
                                 backgroundColor: isTrial ? '#E8F6F1' : '#F3F4F6', 
                                 color: isTrial ? '#1BA672' : '#6B7280' 
                              }}
                              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                           >
                              <Calendar size={24} strokeWidth={2} />
                           </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between pr-6">
                                <h4 className="text-base font-bold text-gray-900">Try for 3 days</h4>
                             </div>
                             <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Just try it. No pressure.</p>
                          </div>
                          {isTrial ? (
                             <div 
                                style={{
                                   position: 'absolute',
                                   top: '50%',
                                   transform: 'translateY(-50%)',
                                   right: '16px',
                                   width: '20px',
                                   height: '20px',
                                   backgroundColor: 'white',
                                   borderRadius: '50%',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   zIndex: 50
                                }}
                             >
                                <Check size={12} strokeWidth={3} color="#1BA672" />
                             </div>
                          ) : (
                             <div 
                                style={{
                                   position: 'absolute',
                                   top: '50%',
                                   transform: 'translateY(-50%)',
                                   right: '16px',
                                   width: '20px',
                                   height: '20px',
                                   border: '2px solid #E5E7EB',
                                   borderRadius: '50%',
                                   zIndex: 50
                                }}
                             />
                          )}
                       </button>

                       {/* Card 2: Routine (Mapped to '1 Week') */}
                       <button
                          onClick={() => setDuration('1 Week')}
                           style={{
                              borderWidth: isRoutine ? '2px' : '1px',
                              borderColor: isRoutine ? '#1BA672' : '#F3F4F6',
                              backgroundColor: isRoutine ? '#F2FBF6' : 'white'
                           }}
                           className={`
                              relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all min-h-[80px] cursor-pointer w-full
                              ${isRoutine 
                                 ? 'shadow-[0_4px_12px_rgba(27,166,114,0.15)] ring-1 ring-green-100' 
                                 : 'hover:border-green-300 hover:shadow-sm'}
                           `}
                        >
                           <div 
                              style={{ 
                                 backgroundColor: isRoutine ? '#E8F6F1' : '#F3F4F6', 
                                 color: isRoutine ? '#1BA672' : '#6B7280' 
                              }}
                              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                           >
                              <Utensils size={24} strokeWidth={2} />
                           </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between pr-6">
                                <h4 className="text-base font-bold text-gray-900">Set a routine</h4>
                             </div>
                             <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Eat on days you choose.</p>
                          </div>
                          {isRoutine ? (
                             <div 
                                style={{
                                   position: 'absolute',
                                   top: '50%',
                                   transform: 'translateY(-50%)',
                                   right: '16px',
                                   width: '20px',
                                   height: '20px',
                                   backgroundColor: 'white',
                                   borderRadius: '50%',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   zIndex: 50
                                }}
                             >
                                <Check size={12} strokeWidth={3} color="#1BA672" />
                             </div>
                          ) : (
                             <div 
                                style={{
                                   position: 'absolute',
                                   top: '50%',
                                   transform: 'translateY(-50%)',
                                   right: '16px',
                                   width: '20px',
                                   height: '20px',
                                   border: '2px solid #E5E7EB',
                                   borderRadius: '50%',
                                   zIndex: 50
                                }}
                             />
                          )}
                       </button>

                        {/* Banner */}
                        {/* Insight Strip */}
                        <div 
                            style={{ marginTop: '-10px' }}
                            className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/50"
                        >
                           <Lightbulb size={16} className="text-gray-400 shrink-0" />
                           <p 
                               style={{ fontSize: '12px' }}
                               className="text-gray-500 font-medium leading-relaxed"
                            >
                               Most people choose this
                            </p>
                        </div>
                  </div>



                  {/* Section Title */}
                  <div className="mt-6 mb-3">
                     <h2 className="text-base font-bold text-gray-900 leading-tight">Your routine</h2>
                     <p className="text-xs text-gray-500 font-medium mt-0.5">You can change this anytime</p>
                  </div>

                  {/* Routine Details (Summary or Full) */}
                  {!isRoutineDetailsExpanded ? (
                     <>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsRoutineDetailsExpanded(!isRoutineDetailsExpanded)}>
                           <div className="flex-1">
                              {(() => {
                                 const startStr = isTomorrow(startDate) ? 'Starts tomorrow' : `Starts ${format(startDate, 'EEE, d MMM')}`;
                                 const days = isTrial ? "3 days" : "Mon-Sat"; 

                                 
                                 return (
                                    <div className="flex flex-col items-start gap-0.5">
                                       <p className="text-sm font-semibold text-gray-900 leading-tight">
                                          {startStr}
                                       </p>
                                       <p className="text-xs text-gray-500 font-medium leading-normal">
                                          {days} • <span className="text-gray-700">{(() => {
                                             const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
                                             const sortedMeals = [...selectedMeals].sort((a, b) => MEAL_ORDER.indexOf(a) - MEAL_ORDER.indexOf(b));
                                             if (sortedMeals.length === 4) return "All meals";
                                             if (sortedMeals.length === 0) return "Select meals";
                                             return sortedMeals.join(', ');
                                          })()}</span>
                                       </p>
                                    </div>
                                 );
                              })()}
                           </div>
                           <span className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline pl-3">
                              Change
                           </span>
                        </div>
                     </>
                  ) : (
                     <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                        {/* Start Date - Primary Priority */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300">
                        <div 
                           onClick={() => { setIsDatePickerExpanded(!isDatePickerExpanded); setIsDeliveryExpanded(false); setIsMealsExpanded(false); }}
                           className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                       <div className="flex items-center gap-3">
                          <Calendar className="text-gray-400" size={24} />
                          <div>
                             <p className="text-xs text-gray-500 font-medium">Starts from</p>
                             <p className="text-sm font-bold text-gray-900">
                                {isTomorrow(startDate) ? `Tomorrow (${format(startDate, 'EEEE')})` : format(startDate, 'EEE, d MMM')}
                             </p>
                          </div>
                       </div>
                       <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${isDatePickerExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Inline Date Picker */}
                    {isDatePickerExpanded && (
                       <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-xs text-gray-400 mb-3">We'll start delivering from this day.</p>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                             {availableDates.map((date) => {
                                const isSelected = isSameDay(date, startDate);
                                const isClosed = getDay(date) === 0; // Sunday
                                const dayName = format(date, 'EEE');
                                const dateNum = format(date, 'd');
                                const label = dayName; // Always show Day Name (Fri, Sat, etc) - No "Tomorrow" inside chip

                                // STYLING LOGIC - Calendar Page Design
                                let containerStyle = {};
                                let headerStyle = { backgroundColor: '#F9FAFB', color: '#6B7280', lineHeight: '1.4' }; // gray-50 gray-500
                                let bodyTextStyle = { color: '#111827' }; // gray-900
                                let containerClassName = "bg-white border-gray-200 hover:border-gray-300";

                                if (isSelected) {
                                   containerClassName = "bg-white border-[#1BA672] shadow-sm overflow-hidden";
                                   headerStyle = { backgroundColor: '#1BA672', color: 'white', lineHeight: '1.4' };
                                   bodyTextStyle = { color: '#1BA672' };
                                } else if (isClosed) {
                                   containerClassName = "bg-gray-50 border-gray-200 opacity-60 cursor-default";
                                   headerStyle = { backgroundColor: '#F3F4F6', color: '#9CA3AF', lineHeight: '1.4' }; // gray-100 gray-400
                                   bodyTextStyle = { color: '#9CA3AF' };
                                } else {
                                   containerClassName = "bg-white border-gray-200 hover:border-gray-300 overflow-hidden";
                                }

                                return (
                                   <button
                                      key={date.toISOString()}
                                      disabled={isClosed}
                                      onClick={() => !isClosed && setStartDate(date)}
                                      style={{ width: '60px', height: '62px', minWidth: '60px' }} 
                                      className={`
                                         flex flex-col items-stretch justify-start rounded-xl border transition-all shrink-0 p-0 overflow-hidden
                                         ${containerClassName}
                                      `}
                                   >
                                      {/* Header: Day Name */}
                                      <div 
                                         style={headerStyle}
                                         className="h-[28px] flex items-center justify-center text-[11px] font-medium uppercase tracking-wide w-full border-b leading-[1.4]"
                                      >
                                         {label}
                                      </div>
                                      
                                      {/* Body: Date Number */}
                                      <div className={`flex-1 flex items-center justify-center w-full bg-white ${isClosed ? '!bg-transparent' : ''}`}>
                                          <span className="text-lg font-medium" style={bodyTextStyle}>{dateNum}</span>
                                      </div>
                                   </button>
                                );
                             })}
                          </div>
                       </div>
                    )}
                  </div>
     {/* Dynamic Delivery Details */}

                     
                     <div className="mt-4 space-y-1">
                        {(() => {
                           // Define configuration based on Plan Duration
                           let activeDays: number[] = [];
                           let interactionHandler: ((d: number) => void) | undefined = undefined;

                           // Logic per plan
                           if (isTrial) {
                              // Calculate next 3 valid days (excluding Sunday)
                              const days: number[] = [];
                              let count = 0;
                              let d = startDate;
                              while(count < 3) {
                                  if (getDay(d) !== 0) {
                                      days.push(getDay(d));
                                      count++;
                                  }
                                  d = addDays(d, 1);
                              }
                              activeDays = days;
                           } else { // Routine
                              activeDays = weekDays;
                              interactionHandler = (d) => toggleWeekDay(d);
                           }
                           
                           // Summary Text Generator
                           const getDaySummary = () => {
                              const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              let text = "";
                              if (activeDays.length === 6 && !activeDays.includes(0)) text = "Mon - Sat";
                              else if (activeDays.length === 0) text = "Select days";
                              else text = activeDays.map(d => DAY_NAMES[d]).join(', ');
                              
                              
                              return {
                                 days: text,
                                 frequency: !isTrial ? "Repeats weekly" : ""
                              };
                           };

                           return (
                              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                 <div 
                                    onClick={() => { setIsDeliveryExpanded(!isDeliveryExpanded); setIsDatePickerExpanded(false); setIsMealsExpanded(false); }}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                 >
                                    <div className="flex items-center gap-3">
                                       <Repeat className="text-gray-400" size={20} strokeWidth={2} />
                                       <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                           <p className="text-xs text-gray-500 font-medium">Delivery schedule</p>
                                        </div>
                                        <div className="flex flex-col">
                                           <p className="text-[14px] font-semibold text-gray-900 leading-tight">
                                              {getDaySummary().days}
                                           </p>
                                        </div>
                                       </div>
                                    </div>
                                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDeliveryExpanded ? 'rotate-180' : ''}`} />
                                 </div>

                                 {/* Expandable Content */}
                                 {isDeliveryExpanded && (
                                     <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                        {!isTrial && (
                                           <p className="text-xs text-gray-400 mb-3">Repeats every week. Change anytime.</p>
                                        )}
                                        <div className="grid grid-cols-7 gap-1 w-full place-items-center mt-2">
                                          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((dayLabel, idx) => {
                                             const dayNum = idx === 6 ? 0 : idx + 1;
                                             const isSunday = dayNum === 0; 
                                             const isActive = activeDays.includes(dayNum);
                                             const isLocked = isTrial; // Lock in trial mode

                                             let className = "w-9 h-9 md:w-11 md:h-11 rounded-full text-[12px] md:text-sm font-medium border transition-all flex items-center justify-center shrink-0 p-0 leading-none";
                                             let forcedStyle: React.CSSProperties = {};
                                             
                                             if (isActive) {
                                                forcedStyle = { backgroundColor: '#F2FBF6', color: '#1BA672', borderColor: '#CDEBDD' };
                                             } else if (isSunday) {
                                                className += " bg-gray-50 text-gray-300 border-gray-100 line-through decoration-gray-300 decoration-1"; 
                                             } else {
                                                if (isLocked) className += " bg-white border-gray-200 text-gray-300";
                                                else {
                                                   className += " bg-white border-gray-200 hover:border-gray-300";
                                                   forcedStyle = { color: '#000000' };
                                                }
                                             }
                                             
                                             return (
                                                <button
                                                   key={dayLabel}
                                                   disabled={isSunday || isLocked}
                                                   onClick={(e) => { e.stopPropagation(); interactionHandler && interactionHandler(dayNum); }}
                                                   className={className}
                                                   style={forcedStyle}
                                                >
                                                   {dayLabel}
                                                </button>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           );
                        })()}
                         
                        {/* Meals Accordion */}
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-4">
                           <div 
                              onClick={() => { setIsMealsExpanded(!isMealsExpanded); setIsDatePickerExpanded(false); setIsDeliveryExpanded(false); }}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                           >
                              <div className="flex items-center gap-3">
                                 <Utensils className="text-gray-400" size={20} strokeWidth={2} />
                                 <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                     <p className="text-xs text-gray-500 font-medium">Meals</p>
                                  </div>
                                  <p className="text-[14px] font-semibold text-gray-900">
                                     {selectedMeals.join(' · ')}
                                  </p>
                                 </div>
                              </div>
                              <ChevronDown size={20} className={`text-gray-400 transition-transform ${isMealsExpanded ? 'rotate-180' : ''}`} />
                           </div>

                           {isMealsExpanded && (
                              <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                 <div className="grid grid-cols-2 gap-3 mt-1">
                                    {[
                                       { id: 'Breakfast', icon: <Sun size={18} /> },
                                       { id: 'Lunch', icon: <Utensils size={18} /> },
                                       { id: 'Snacks', icon: <Coffee size={18} /> },
                                       { id: 'Dinner', icon: <Moon size={18} /> }
                                    ].map((meal) => (
                                       <button
                                          key={meal.id}
                                          onClick={(e) => { e.stopPropagation(); toggleMeal(meal.id); }}
                                          className={`
                                             flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer
                                             ${selectedMeals.includes(meal.id)
                                                ? 'bg-green-50 border-green-200 text-gray-900'
                                                : 'bg-white border-gray-100 text-gray-500 hover:border-green-200 hover:bg-green-50/30'}
                                          `}
                                       >
                                          <div className={`${selectedMeals.includes(meal.id) ? 'text-gray-800' : 'text-gray-400'}`}>
                                             {meal.icon}
                                          </div>
                                          <span className="text-sm font-semibold flex-1">{meal.id}</span>
                                          {selectedMeals.includes(meal.id) && (
                                             <div className="w-2 h-2 rounded-full bg-gutzo-primary" />
                                          )}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}
                     </div>
                  </div>
               </div>
            )}





              </div>
            </div>


           {/* Sticky Bottom CTA */}
           <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[1003]">
              <button 
                onClick={() => {
                  if (!plan) return;
                  const vendorId = plan.vendorId || 'v1'; // Fallback
                  
                  // Construct Product object from Plan
                  const productToAdd = {
                      id: plan.id,
                      name: plan.title,
                      price: weeklyPrice, // Note: This is base price, logic might need refinement for duration
                      image: plan.image,
                      description: `${duration} Plan - ${selectedMeals.join(', ')}`,
                      category: 'Meal Plan',
                      vendor_id: vendorId,
                      rating: plan.rating,
                      review_count: 0,
                      is_available: true,
                      is_veg: isVeg, // Use the state variable
                      created_at: new Date().toISOString()
                  };

                  const vendorObj = {
                      id: vendorId,
                      name: plan.vendor || 'Vendor',
                      image: plan.vendorLogo || '',
                      rating: plan.rating || 0,
                      // Minimal vendor details as plan might not have all
                      description: '',
                      location: '',
                      deliveryTime: '',
                      minimumOrder: 0, 
                      deliveryFee: 0,
                      cuisineType: '',
                      phone: '',
                      isActive: true,
                      isFeatured: false,
                      created_at: new Date().toISOString(),
                      tags: []
                  };

                  addItem(productToAdd, vendorObj, 1);
                  onClose(); // Close sheet after adding
                }}
                className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors" style={{ height: '42px' }}> Continue <ArrowRight className="h-4 w-4" /> </button>
               <div className={`flex justify-center pt-1.5 transition-opacity duration-200 ${isRoutine ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-gray-400 flex items-center gap-1" style={{ fontSize: '11px' }}>
                     Cancel anytime.
                  </p>
               </div>
           </div>
        </div>
        )}
       </div>
       </SheetContent>
    </Sheet>
  );
};

export default MealPlanBottomSheet;
