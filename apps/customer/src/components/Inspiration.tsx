import React from "react";
import { useCategories } from "../hooks/useCategories";

interface InspirationOption {
  label: string;
  img: string | null;
}

interface InspirationProps {
  onOptionClick?: (label: string) => void;
  selectedGoal?: string;
  onGoalChange?: (goal: string) => void;
  loading?: boolean;
}

const goalBasedOptions = [
  "All",
  "High Protein",
  "Low Calorie",
  "High Fibre",
  "Gut Friendly",
  "Detox",
  "Post Workout"
];

const requestedInspirationLabels = [
  "Breakfast", "Salads", "Bowls", "Soups", "Wraps & Rolls", 
  "Smoothies", "Juices", "Mains", "Snacks", "Desserts"
];

export const Inspiration: React.FC<InspirationProps> = ({ 
  onOptionClick, 
  selectedGoal = "All",
  onGoalChange,
  loading: parentLoading = false 
}) => {
  const { categories, loading: categoriesLoading } = useCategories();

  // Filter and sort categories based on the requested list
  const inspirationOptions: InspirationOption[] = requestedInspirationLabels.map(label => {
    const found = categories.find(c => c.name.toLowerCase() === label.toLowerCase());
    return {
      label,
      img: found?.image_url || null
    };
  });

  const isLoading = parentLoading || categoriesLoading;

  return (
    <section className="w-full bg-[#fafafa] pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Today's Mood Section */}
        <h2
          className="text-left font-medium tracking-tight w-full mb-4 text-[20px] lg:text-[24px]"
          style={{ fontFamily: 'Poppins', letterSpacing: '-0.01em', fontWeight: 600, color: '#111' }}
        >
          Today's Mood
        </h2>
        
        <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-6 sm:gap-10 lg:gap-14 pb-4 min-w-max items-end">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl mb-2"></div>
                  <div className="w-14 h-4 rounded bg-gray-100"></div>
                </div>
              ))
            ) : (
              inspirationOptions.map((option) => (
                <button
                  key={option.label}
                  className="flex flex-col items-center group focus:outline-none flex-shrink-0 transition-all duration-300 active:scale-90"
                  onClick={() => onOptionClick?.(option.label)}
                >
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 mb-3 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center"
                  >
                    {option.img ? (
                      <img
                        src={option.img}
                        alt={option.label}
                        className="w-full h-full object-contain drop-shadow-sm"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-[10px] text-gray-400 font-medium">
                        {option.label}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[14px] sm:text-[15px] font-medium text-gray-600 font-primary transition-colors group-hover:text-gutzo-brand"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    {option.label}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Goal Based Section */}
        <div className="mt-6 md:mt-8">
          <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1 pb-4 min-w-max px-1">
              {goalBasedOptions.map((goal) => {
                const isSelected = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => onGoalChange?.(goal)}
                    className={`
                      px-6 py-2.5 rounded-full text-[14px] sm:text-[15px] transition-all duration-200 border flex-shrink-0
                      ${isSelected 
                        ? 'shadow-sm shadow-[#1BA672]/10 font-semibold' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1BA672] hover:text-[#1BA672] font-medium'
                      }
                    `}
                    style={{ 
                      fontFamily: 'Poppins',
                      ...(isSelected ? { 
                        backgroundColor: '#E8F6F1', 
                        color: '#1BA672', 
                        borderColor: '#1BA672' 
                      } : {})
                    }}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

