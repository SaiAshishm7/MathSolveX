import React from 'react';

const MathSolveXLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagonal background */}
      <path
        d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z"
        fill="#10B981"
        className="drop-shadow-lg"
      />
      
      {/* Mathematical symbols group */}
      <g fill="white" transform="translate(8, 8)">
        {/* Sigma symbol */}
        <path d="M8 6L12 2H4V4L8 8L4 12V14H12L8 10" 
              strokeWidth="1.5" 
              stroke="white" 
              fill="none" />
        
        {/* Integral symbol */}
        <path d="M16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22C16.8954 22 16 21.1046 16 20V4Z"
              transform="scale(0.5) translate(20, 0)"
              fill="white" />
        
        {/* Division dots */}
        <circle cx="22" cy="6" r="1.5" fill="white" />
        <circle cx="22" cy="18" r="1.5" fill="white" />
        
        {/* Plus symbol */}
        <path d="M14 12H18M16 10V14" 
              strokeWidth="1.5" 
              stroke="white" 
              strokeLinecap="round" />
      </g>
      
      {/* Decorative circuit-like lines */}
      <path
        d="M5 20H8M32 20H35M20 35V38"
        stroke="#4ADE80"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default MathSolveXLogo; 