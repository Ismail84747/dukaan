import React from 'react';

interface IndianFlagProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const IndianFlag: React.FC<IndianFlagProps> = ({
  className = '',
  size = 'sm',
  showLabel = false,
  label = 'आत्मनिर्भर भारत',
}) => {
  const sizeMap = {
    xs: 'w-5 h-3.5',
    sm: 'w-7 h-4.5',
    md: 'w-9 h-6',
    lg: 'w-12 h-8',
  };

  const chakraSize = {
    xs: 8,
    sm: 11,
    md: 14,
    lg: 18,
  };

  const cs = chakraSize[size];

  return (
    <div className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-xs overflow-hidden shadow-xs border border-slate-300 flex flex-col shrink-0 select-none relative`}
        title="National Flag of India (तिरंगा)"
      >
        {/* Kesariya (Saffron) */}
        <div className="h-1/3 w-full bg-[#FF9933]" />
        {/* Safed (White with Ashoka Chakra) */}
        <div className="h-1/3 w-full bg-white relative flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            width={cs}
            height={cs}
            className="text-[#000080] animate-[spin_60s_linear_infinite]"
          >
            <circle cx="12" cy="12" r="9" stroke="#000080" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="2" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="12"
                y1="12"
                x2={12 + 8.5 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={12 + 8.5 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="#000080"
                strokeWidth="0.8"
              />
            ))}
          </svg>
        </div>
        {/* Hara (India Green) */}
        <div className="h-1/3 w-full bg-[#138808]" />
      </div>

      {showLabel && (
        <span className="text-xs font-black tracking-wide text-inherit whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};
