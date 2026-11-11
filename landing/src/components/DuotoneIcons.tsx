interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Duotone Rocket: Black outline body with scarlet red flame thrust
 */
export function DuotoneRocket({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 23C7.5 24 5 28 5 28C5 28 9 25.5 10 24"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21C8 23 6 25 6 25"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M26.5 5.5C26.5 5.5 19 6.5 14 11.5C9 16.5 8 24 8 24C8 24 15.5 23 20.5 18C25.5 13 26.5 5.5 26.5 5.5Z"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="14" r="2.5" fill="#dc2626" />
      <path
        d="M12.5 19.5L8 20L8.5 15.5"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 23.5L16 28L20.5 27.5"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 2. Duotone Browser: Black laptop/window outline with red check
 */
export function DuotoneBrowser({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="4"
        y="6"
        width="24"
        height="20"
        rx="3"
        stroke="#09090b"
        strokeWidth="2.2"
      />
      <line x1="4" y1="12" x2="28" y2="12" stroke="#09090b" strokeWidth="2.2" />
      <circle cx="8" cy="9" r="1.5" fill="#dc2626" />
      <circle cx="12" cy="9" r="1.5" fill="#71717a" />
      <path
        d="M13 19L15.5 21.5L20 17"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 3. Duotone Link: Interlocked Chain with one red loop and one black loop
 */
export function DuotoneLink({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 18L18 14"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M10 20C8.5 21.5 6 21.5 4.5 20C3 18.5 3 16 4.5 14.5L7.5 11.5C9 10 11.5 10 13 11.5"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M22 12C23.5 10.5 26 10.5 27.5 12C29 13.5 29 16 27.5 17.5L24.5 20.5C23 22 20.5 22 19 20.5"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 4. Duotone Shield: Black Shield Outline with Scarlet Red Checkmark
 */
export function DuotoneShield({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 4L6 8V15C6 21.5 10.5 27 16 28C21.5 27 26 21.5 26 15V8L16 4Z"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 16L14.5 19L20.5 13"
        stroke="#dc2626"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 5. Duotone Cloud / Updates: Black cloud with red circular sync arrows
 */
export function DuotoneCloud({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23 22H9C6.23858 22 4 19.7614 4 17C4 14.4173 5.95251 12.2898 8.48398 12.0298C9.23126 8.52838 12.3087 6 16 6C20.4183 6 24 9.58172 24 14C26.7614 14 29 16.2386 29 19C29 20.6569 28.1942 22 27 22"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13 15L16 12L19 15"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13V19"
        stroke="#dc2626"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 6. Duotone WifiSlash: Black Wifi arcs with red offline indicator
 */
export function DuotoneWifiSlash({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 11C11.5 5 20.5 5 27 11"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 15.5C13 11.5 19 11.5 23.5 15.5"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 20C14.5 18 17.5 18 20 20"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="24" r="2" fill="#dc2626" />
      <line x1="6" y1="26" x2="26" y2="6" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 7. Duotone Receipt / GST: Black receipt with red tax stamp / badge
 */
export function DuotoneReceipt({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 5H25V27L22 25L19 27L16 25L13 27L10 25L7 27V5Z"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="11" y1="10" x2="21" y2="10" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="14" x2="18" y2="14" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="19" r="3" stroke="#dc2626" strokeWidth="2" fill="#fef2f2" />
      <path d="M17 18L18 20L20 18" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 8. Duotone Printer: Black thermal printer with red receipt output
 */
export function DuotonePrinter({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 10V5H23V10"
        stroke="#09090b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="5"
        y="10"
        width="22"
        height="12"
        rx="2"
        stroke="#09090b"
        strokeWidth="2.2"
      />
      <path
        d="M9 18H23V27H9V18Z"
        stroke="#dc2626"
        strokeWidth="2.2"
        fill="#fef2f2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="14" r="1.5" fill="#dc2626" />
    </svg>
  );
}

/**
 * 9. Duotone Book / Accounts: Black ledger with red bookmark
 */
export function DuotoneBook({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 6C6 4.89543 6.89543 4 8 4H24C25.1046 4 26 4.89543 26 6V26C26 27.1046 25.1046 28 24 28H8C6.89543 28 6 27.1046 6 26V6Z"
        stroke="#09090b"
        strokeWidth="2.2"
      />
      <line x1="10" y1="4" x2="10" y2="28" stroke="#09090b" strokeWidth="2.2" />
      <path
        d="M17 4V13L20 11L23 13V4H17Z"
        fill="#dc2626"
        stroke="#dc2626"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * 10. Duotone Key / Login: Black key with red locking teeth
 */
export function DuotoneKey({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="11"
        cy="16"
        r="6"
        stroke="#09090b"
        strokeWidth="2.2"
      />
      <circle cx="11" cy="16" r="2.5" fill="#dc2626" />
      <line x1="17" y1="16" x2="27" y2="16" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="23" y1="16" x2="23" y2="20" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="26" y1="16" x2="26" y2="19" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 11. Duotone Gift: Black box with red bow and ribbon
 */
export function DuotoneGift({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="5"
        y="12"
        width="22"
        height="15"
        rx="2"
        stroke="#09090b"
        strokeWidth="2.2"
      />
      <line x1="16" y1="12" x2="16" y2="27" stroke="#dc2626" strokeWidth="2.2" />
      <line x1="5" y1="18" x2="27" y2="18" stroke="#dc2626" strokeWidth="2.2" />
      <path
        d="M16 12C14 8 9 8 9 10C9 12 16 12 16 12Z"
        stroke="#dc2626"
        strokeWidth="2"
      />
      <path
        d="M16 12C18 8 23 8 23 10C23 12 16 12 16 12Z"
        stroke="#dc2626"
        strokeWidth="2"
      />
    </svg>
  );
}
