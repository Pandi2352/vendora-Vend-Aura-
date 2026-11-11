interface VendoraMarkProps {
  /** Pixel height; width follows the 4:3 artwork. */
  size?: number;
  /** 'dark' = drawn for dark backgrounds (white bolt); 'light' = for light backgrounds (black bolt). */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Vendora mark (red V + lightning bolt) as transparent SVG, so it sits cleanly
 * on any background. Replaces the PNG, which has a baked-in white box.
 */
export function VendoraMark({ size = 32, tone = 'dark', className = '' }: VendoraMarkProps) {
  const bolt = tone === 'dark' ? '#ffffff' : '#09090b';

  return (
    <svg
      viewBox="0 0 64 48"
      height={size}
      width={(size * 64) / 48}
      role="img"
      aria-label="Vendora"
      className={`shrink-0 ${className}`}
    >
      {/* Red V with a sharp inner highlight */}
      <path d="M3 10h11.5l10.5 23.5L31 19h8.5L28 44h-7.5L3 10Z" fill="#dc2626" />
      <path d="M9 12.5h3.6l9.6 21.4-1.9 4.2L9 12.5Z" fill="#ef4444" />
      {/* Lightning bolt */}
      <path d="M50 2 38.5 25h8L40 46l19-27.5h-8.5L58 2h-8Z" fill={bolt} />
    </svg>
  );
}
