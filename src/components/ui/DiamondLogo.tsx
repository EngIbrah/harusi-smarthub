export function DiamondLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /> {/* amber-400 */}
          <stop offset="100%" stopColor="#b45309" /> {/* amber-700 */}
        </linearGradient>
      </defs>
      <path 
        d="M6 3L3 8L12 22L21 8L18 3H6Z" 
        fill="url(#diamond-grad)" 
        stroke="white" 
        strokeWidth="0.5"
        strokeLinejoin="round" 
      />
      <path 
        d="M3 8H21M12 22L8 8M12 22L16 8M6 3L8 8M18 3L16 8M8 8L12 3L16 8" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeOpacity="0.5" 
      />
    </svg>
  );
}