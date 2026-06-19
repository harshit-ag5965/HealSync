import React from "react";

const Logo = ({ darkMode, sidebarOpen }) => {
  // Dynamic colors for the text based on the theme
  const textPrimary = darkMode ? "text-white" : "text-teal-900";
  const textSecondary = darkMode ? "text-teal-400" : "text-teal-600";

  return (
    <div className={`flex items-center gap-3 transition-all duration-300 ${!sidebarOpen && "justify-center w-full"}`}>
      
      {/* 🚀 SVG Logo Mark */}
      <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-11 h-11" : "w-10 h-10"}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          
          {/* Top & Right Arm of Cross (Darker Teal) */}
          <path 
            d="M40 15a10 10 0 0 1 20 0v20h20a10 10 0 0 1 0 20H60" 
            className={darkMode ? "stroke-teal-300" : "stroke-teal-700"}
            strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
          />
          
          {/* Bottom & Left Arm of Cross (Lighter Teal) */}
          <path 
            d="M60 85a10 10 0 0 1-20 0V65H20a10 10 0 0 1 0-20h20" 
            className={darkMode ? "stroke-teal-500" : "stroke-teal-400"}
            strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
          />
          
          {/* Stethoscope Tube Winding Through */}
          <path 
            d="M25 30 Q 30 50, 45 45 T 75 55 A 10 10 0 0 0 85 45" 
            className={darkMode ? "stroke-teal-100" : "stroke-teal-900"}
            strokeWidth="3.5" fill="none" strokeLinecap="round"
          />
          
          {/* Stethoscope Earpieces */}
          <circle cx="22" cy="27" r="3.5" className={darkMode ? "fill-teal-100" : "fill-teal-900"} />
          <circle cx="31" cy="24" r="3.5" className={darkMode ? "fill-teal-100" : "fill-teal-900"} />
          
          {/* Stethoscope Chestpiece */}
          <circle cx="85" cy="45" r="6.5" className={darkMode ? "fill-teal-100" : "fill-teal-900"} />
          {/* Inner Chestpiece Detail */}
          <circle cx="85" cy="45" r="2.5" className={darkMode ? "fill-gray-900" : "fill-white"} />
          
        </svg>
      </div>

      {/* 🚀 Typography & Tagline */}
      {sidebarOpen && (
        <div className="flex flex-col whitespace-nowrap overflow-hidden">
          <span className={`font-black text-2xl tracking-wide leading-none ${textPrimary}`}>
            HEAL<span className={textSecondary}>SYNC</span>
          </span>
          <span className={`text-[10.5px] mt-1 font-medium tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Synchronised Healthcare
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;