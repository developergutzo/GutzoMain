import React from "react";
import colors from "../styles/colors";

// SVG for a rounded user/profile icon (gray gradient)
export default function MobileProfileIcon({ className = "w-11 h-11" }) {
  return (
    <svg
      className={className}
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer thin grey outline (from palette) */}
      <circle cx="22" cy="22" r="20" stroke={colors.border} strokeWidth="2" fill="none" />
      {/* User silhouette: head */}
      <circle cx="22" cy="17" r="6" fill={colors.brandGreen} />
      {/* User silhouette: shoulders */}
      <ellipse cx="22" cy="30" rx="9" ry="6" fill={colors.brandGreen} />
    </svg>
  );
}
