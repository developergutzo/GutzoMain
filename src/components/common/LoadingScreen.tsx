import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface LoadingScreenProps {
  isOpen: boolean;
  messages?: string[];
  interval?: number; // Time in ms between message rotation
}

const DEFAULT_MESSAGES = [
  "Finding the best kitchens...",
  "Curating healthy options...",
  "Checking availability...",
  "Almost there..."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isOpen, 
  messages = DEFAULT_MESSAGES, 
  interval = 2000 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, messages, interval]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative">
          {/* Ripple/Pulse Effect */}
          <div className="absolute inset-0 bg-gutzo-brand/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 bg-gutzo-brand/20 rounded-full blur-xl animate-pulse scale-150"></div>
          
          <img
            src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
            alt="Gutzo"
            className="w-32 h-auto relative z-10 animate-bounce-slight"
            style={{ 
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
              animation: 'bounce 2s infinite ease-in-out'
            }}
          />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <p 
            className="text-lg font-medium text-gray-700 transition-all duration-500 transform"
            key={currentMessageIndex} // Key allows React to animate the change if strict mode or animation libs were used, here it ensures clean re-render
            style={{ fontFamily: 'Poppins' }}
          >
            {messages[currentMessageIndex]}
          </p>
          
          <div className="flex gap-1 mt-2">
            <span className="w-2 h-2 rounded-full bg-gutzo-brand animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-gutzo-brand animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-gutzo-brand animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
