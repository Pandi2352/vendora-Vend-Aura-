interface RetailPosLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export function RetailPosLogo({ className = '', size = 'md', theme = 'light' }: RetailPosLogoProps) {
  const fontSizes = {
    sm: {
      retail: 'text-lg',
      pos: 'text-lg',
      icon: 'w-4 h-4',
      sub: 'text-[9px]',
    },
    md: {
      retail: 'text-2xl',
      pos: 'text-2xl',
      icon: 'w-6 h-6',
      sub: 'text-[11px]',
    },
    lg: {
      retail: 'text-3xl',
      pos: 'text-3xl',
      icon: 'w-8 h-8',
      sub: 'text-xs',
    },
  }[size];

  const isDark = theme === 'dark';

  const retailColor = isDark ? 'text-white' : 'text-[#0b1a4a]';
  const posColor = isDark ? 'text-[#ef4444]' : 'text-[#dc2626]';
  const subColor = isDark ? 'text-blue-300' : 'text-[#0b1a4a]';
  const blueSwoosh = isDark ? '#38bdf8' : '#0b1a4a';
  const redSwoosh = isDark ? '#ef4444' : '#dc2626';
  const centerAccent = isDark ? '#ffffff' : '#0b1a4a';

  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      {/* Brand Name: Retail + P + [Dual Swirl O] + S */}
      <div className="flex items-center font-sans tracking-tight">
        <span className={`${fontSizes.retail} font-extrabold ${retailColor}`}>
          Retail
        </span>
        <span className={`${fontSizes.pos} font-extrabold ${posColor} ml-0.5`}>
          P
        </span>
        
        {/* Dynamic Dual-Swoosh Swirl "O" matching uploaded image */}
        <span className="inline-flex items-center justify-center mx-[1px]">
          <svg
            className={`${fontSizes.icon} shrink-0`}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Blue Crescent Swoosh */}
            <path
              d="M17.5 4.5C10.5 4.5 5 10 5 17C5 21.2 7 24.8 10.2 27.2C9.5 24 10.2 20.5 12.5 18C11.5 16.5 11 14.8 11 13C11 9.5 13.5 7 17 7C19.2 7 21 8.2 22 10C24 8.5 26.2 7.2 28.5 6.2C25.5 5.2 21.5 4.5 17.5 4.5Z"
              fill={blueSwoosh}
            />
            {/* Scarlet Red Crescent Swoosh */}
            <path
              d="M14.5 27.5C21.5 27.5 27 22 27 15C27 10.8 25 7.2 21.8 4.8C22.5 8 21.8 11.5 19.5 14C20.5 15.5 21 17.2 21 19C21 22.5 18.5 25 15 25C12.8 25 11 23.8 10 22C8 23.5 5.8 24.8 3.5 25.8C6.5 26.8 10.5 27.5 14.5 27.5Z"
              fill={redSwoosh}
            />
            {/* Inner Motion Center Accents */}
            <path
              d="M12.8 17.8L19.2 14.2"
              stroke={centerAccent}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <span className={`${fontSizes.pos} font-extrabold ${posColor}`}>
          S
        </span>
      </div>

      {/* Powered by Vendora Subtitle matching uploaded image */}
      <span className={`${fontSizes.sub} font-semibold ${subColor} mt-0.5 tracking-normal`}>
        Powered by Vendora
      </span>
    </div>
  );
}
