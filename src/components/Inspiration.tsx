import React from "react";


// Gutzo core categories with content-based images (replace with your actual images)
const inspirationOptions = [
  { label: "Salads", img: "/assets/inspiration/salads.png" },
  { label: "Smoothies", img: "/assets/inspiration/smoothies.png" },
  { label: "Bowls", img: "/assets/inspiration/bowls.png" },
  { label: "Protein", img: "/assets/inspiration/protein.png" },
  { label: "Wraps", img: "/assets/inspiration/wraps.png" },
  { label: "Juices", img: "/assets/inspiration/juices.png" },
  { label: "Oats", img: "/assets/inspiration/oats.png" },
  { label: "Breakfast", img: "/assets/inspiration/breakfast.png" },
  { label: "Low-Cal", img: "/assets/inspiration/lowcal.png" },
  { label: "Soups", img: "/assets/inspiration/soups.png" },
  { label: "Snacks", img: "/assets/inspiration/snacks.png" },
  { label: "Fruits", img: "/assets/inspiration/fruits.png" },
  { label: "Detox", img: "/assets/inspiration/detox.png" },
  { label: "Fit Meals", img: "/assets/inspiration/fitmeals.png" },
  { label: "Keto", img: "/assets/inspiration/keto.png" },
  { label: "Vegan", img: "/assets/inspiration/vegan.png" },
  { label: "Specials", img: "/assets/inspiration/specials.png" },
  { label: "Combos", img: "/assets/inspiration/combos.png" },
];

interface InspirationProps {
  onOptionClick?: (label: string) => void;
}

export const Inspiration: React.FC<InspirationProps> = ({ onOptionClick }) => {
  return (
  <section className="w-full bg-[#fafafa] pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h2
          className="text-left font-medium tracking-tight w-full mb-4 text-[20px] lg:text-[30px]"
          style={{ fontFamily: 'Poppins', letterSpacing: '-0.01em', fontWeight: 500, color: '#111' }}
        >
          Start Your Gutzo Journey Here
        </h2>
        <div className="mt-2" />
        {/* Mobile: double-lined horizontal scroll (both rows scroll together) */}
        <div className="sm:hidden w-full overflow-x-auto scrollbar-hide pb-2">
          <div className="flex flex-col min-w-max">
            <div className="flex gap-4 mb-2">
              {inspirationOptions.slice(0, Math.ceil(inspirationOptions.length / 2)).map((option) => (
                <button
                  key={option.label}
                  className="flex flex-col items-center group focus:outline-none flex-shrink-0 min-w-[90px]"
                  onClick={() => onOptionClick?.(option.label)}
                  style={{ maxWidth: '100%' }}
                >
                  <span
                    className="block rounded-full flex items-center justify-center overflow-hidden mb-0.5 transition-transform group-hover:scale-110"
                    style={{ width: '80px', height: '80px' }}
                  >
                    {option.img ? (
                      <img
                        src={option.img}
                        alt={option.label}
                        className="w-full h-full object-cover rounded-full"
                        style={{ aspectRatio: 1, display: 'block' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-500">Img</div>
                    )}
                  </span>
                  <span
                      className="text-xs text-gray-500 transition-colors mt-1 text-center truncate w-full"
                    style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '0.95rem' }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              {inspirationOptions.slice(Math.ceil(inspirationOptions.length / 2)).map((option) => (
                <button
                  key={option.label}
                  className="flex flex-col items-center group focus:outline-none flex-shrink-0 min-w-[90px]"
                  onClick={() => onOptionClick?.(option.label)}
                  style={{ maxWidth: '100%' }}
                >
                  <span
                    className="block rounded-full flex items-center justify-center overflow-hidden mb-1 transition-transform group-hover:scale-110"
                    style={{ width: '80px', height: '80px' }}
                  >
                    {option.img ? (
                      <img
                        src={option.img}
                        alt={option.label}
                        className="w-full h-full object-cover rounded-full"
                        style={{ aspectRatio: 1, display: 'block' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-500">Img</div>
                    )}
                  </span>
                  <span
                    className="text-xs text-gray-500 group-hover:text-gutzo-primary transition-colors mt-1 text-center truncate w-full"
                    style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '1rem' }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet/Desktop: horizontal scrollable row */}
        <div className="hidden sm:flex w-full overflow-x-auto scrollbar-hide items-end gap-3 md:gap-4 lg:gap-6 pb-2">
          {inspirationOptions.map((option) => (
            <button
              key={option.label}
              className="flex flex-col items-center group focus:outline-none flex-shrink-0 min-w-[90px]"
              onClick={() => onOptionClick?.(option.label)}
              style={{ maxWidth: '100%' }}
            >
              <span
                className="block rounded-full flex items-center justify-center overflow-hidden mb-0.5 transition-transform group-hover:scale-110"
                style={{
                  width: 'clamp(70px, 10vw, 140px)',
                  height: 'clamp(70px, 10vw, 140px)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  boxShadow: 'none'
                }}
              >
                <img
                  src={option.img}
                  alt={option.label}
                  className="w-full h-full object-cover rounded-full"
                  style={{ aspectRatio: 1, display: 'block' }}
                  loading="lazy"
                />
              </span>
              <span className="text-lg lg:text-xl font-medium text-gray-500 transition-colors mt-1 text-center truncate w-full" style={{ fontFamily: 'Poppins', fontWeight: 400 }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
