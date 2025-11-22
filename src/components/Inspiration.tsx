import React from "react";


// Gutzo core categories with content-based images (replace with your actual images)
const inspirationOptions = [
  { label: "Fresh", img: "/assets/inspiration/fresh.png" },
  { label: "Protein", img: "/assets/inspiration/protein.png" },
  { label: "Balanced", img: "/assets/inspiration/balanced.png" },
  { label: "Low-Cal", img: "/assets/inspiration/lowcal.png" },
  { label: "Glow", img: "/assets/inspiration/glow.png" },
  { label: "Specials", img: "/assets/inspiration/specials.png" },
];

interface InspirationProps {
  onOptionClick?: (label: string) => void;
}

export const Inspiration: React.FC<InspirationProps> = ({ onOptionClick }) => {
  return (
  <section className="w-full bg-[#fafafa] pt-8 pb-8 md:pt-12 md:pb-12 lg:pt-16 lg:pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h2 className="text-left font-semibold text-3xl md:text-4xl lg:text-5xl mb-10 tracking-tight w-full" style={{ fontFamily: 'Poppins', letterSpacing: '-0.01em', fontWeight: 500 }}>
          Start Your Gutzo Journey Here
        </h2>
        {/* Add extra padding below heading for more space above images */}
        <div className="mb-8 md:mb-12 lg:mb-16" />
        {/* Mobile: horizontal scrollable flex row */}
        <div className="flex w-full items-end gap-2 overflow-x-auto flex-nowrap sm:hidden scrollbar-hide">
          {inspirationOptions.map((option) => (
            <button
              key={option.label}
              className="flex flex-col items-center group focus:outline-none flex-shrink-0 min-w-[90px]"
              onClick={() => onOptionClick?.(option.label)}
              style={{ maxWidth: '100%' }}
            >
              <span
                className="block rounded-full flex items-center justify-center overflow-hidden mb-3 transition-transform group-hover:scale-110"
                style={{
                  width: 'clamp(80px, 16vw, 180px)',
                  height: 'clamp(80px, 16vw, 180px)',
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
              <span className="text-base font-medium text-gray-900 group-hover:text-gutzo-primary transition-colors mt-1 text-center truncate w-full" style={{ fontFamily: 'Poppins', fontWeight: 400 }}>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Tablet/Desktop: non-scrollable, equally split row */}
        <div className="hidden sm:flex w-full items-end justify-between gap-3 md:gap-4 lg:gap-6">
          {inspirationOptions.map((option) => (
            <button
              key={option.label}
              className="flex flex-col items-center group focus:outline-none flex-1 min-w-0"
              onClick={() => onOptionClick?.(option.label)}
              style={{ maxWidth: '100%' }}
            >
              <span
                className="block rounded-full flex items-center justify-center overflow-hidden mb-3 transition-transform group-hover:scale-110"
                style={{
                  width: 'clamp(80px, 12vw, 180px)',
                  height: 'clamp(80px, 12vw, 180px)',
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
              <span className="text-lg lg:text-xl font-medium text-gray-900 group-hover:text-gutzo-primary transition-colors mt-1 text-center truncate w-full" style={{ fontFamily: 'Poppins', fontWeight: 400 }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
