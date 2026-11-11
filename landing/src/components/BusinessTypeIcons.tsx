interface IconProps {
  className?: string;
}

// 1. Textile & Garments: T-shirt shape
export function IconTextile({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 3.5C14.8 4.4 13.5 4.8 12 4.8C10.5 4.8 9.2 4.4 8 3.5L3 7L5.5 10.5L8 9V20H16V9L18.5 10.5L21 7L16 3.5Z" />
    </svg>
  );
}

// 2. Fruits & Vegetables: Pear / Apple with leaf
export function IconFruits({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.5 3C13 3 12 4.5 12 4.5C12 4.5 11 3 9.5 3C8 3 7.5 4 8 5.5C8.5 7 12 7.5 12 7.5C12 7.5 15.5 7 16 5.5C16.5 4 16 3 14.5 3Z" />
      <path d="M12 8C8.5 8 6 10.8 6 14.5C6 18.5 8.7 21 12 21C15.3 21 18 18.5 18 14.5C18 10.8 15.5 8 12 8Z" />
    </svg>
  );
}

// 3. Grocery / Kirana: Shopping cart
export function IconGrocery({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
    </svg>
  );
}

// 4. Supermarket: Storefront awning
export function IconSupermarket({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4H20V7H4V4ZM3 8L4.2 13C4.3 13.6 4.8 14 5.4 14H18.6C19.2 14 19.7 13.6 19.8 13L21 8H3ZM5 15H8V20H5V15ZM10 15H14V20H10V15ZM16 15H19V20H16V15Z" />
    </svg>
  );
}

// 5. Bakery & Sweets: Croissant / cupcake
export function IconBakery({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4C8.5 4 6 6.5 6 9.5C6 10.8 6.5 12 7.3 13H16.7C17.5 12 18 10.8 18 9.5C18 6.5 15.5 4 12 4ZM7 14.5L8.5 20H15.5L17 14.5H7Z" />
    </svg>
  );
}

// 6. Restaurant / Café: Fork and knife
export function IconRestaurant({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 9H9V3H7V9H5V3H3V9C3 11.2 4.8 13 7 13V21H9V13C11.2 13 13 11.2 13 9V3H11V9ZM19 3H18C15.8 3 14 4.8 14 7V13H16V21H18V3H19C19.6 3 20 2.6 20 2C20 1.4 19.6 1 19 1V3Z" />
    </svg>
  );
}

// 7. Pharmacy / Medical: First aid cross in rounded box
export function IconPharmacy({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM16 13H13V16H11V13H8V11H11V8H13V11H16V13Z" />
    </svg>
  );
}

// 8. Footwear: Sneaker
export function IconFootwear({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V15H17L14 9H8L5 13H2V17ZM7 14L9 10H13L15.5 15H4V14H7Z" />
    </svg>
  );
}

// 9. Electronics & Mobiles: Smartphone
export function IconElectronics({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" />
    </svg>
  );
}

// 10. Stationery & Books: Open book
export function IconStationery({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 5C19.9 4.4 18.5 4 17 4C14.8 4 12.8 4.9 12 6C11.2 4.9 9.2 4 7 4C5.5 4 4.1 4.4 3 5V19C4.1 18.4 5.5 18 7 18C9.2 18 11.2 18.9 12 20C12.8 18.9 14.8 18 17 18C18.5 18 19.9 18.4 21 19V5ZM19 16.5C18.4 16.2 17.7 16 17 16C15 16 13.3 16.8 13 18V7.5C13.6 6.8 15.2 6 17 6C17.7 6 18.4 6.2 19 6.5V16.5Z" />
    </svg>
  );
}

// 11. Hardware & Paints: Paint roller
export function IconHardware({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 4V3C18 2.45 17.55 2 17 2H5C4.45 2 4 2.45 4 3V7C4 7.55 4.45 8 5 8H17C17.55 8 18 7.55 18 7V6H19V11C19 11.55 18.55 12 18 12H13V15.18C13.6 15.54 14 16.22 14 17V21C14 21.55 13.55 22 13 22H11C10.45 22 10 21.55 10 21V17C10 16.22 10.4 15.54 11 15.18V12H6C4.9 12 4 11.1 4 10V9H3V5H4V4H18Z" />
    </svg>
  );
}

// 12. Cosmetics & Beauty: 3 leaves / blossom
export function IconCosmetics({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2ZM5.5 11C5.5 11 3.5 14 4.5 17C5.5 19 8 19 9 17.5C8 15.5 6.5 13 5.5 11ZM18.5 11C17.5 13 16 15.5 15 17.5C16 19 18.5 19 19.5 17C20.5 14 18.5 11 18.5 11ZM11 16H13V22H11V16Z" />
    </svg>
  );
}

// 13. Jewellery: Diamond gem
export function IconJewellery({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3L2 9L12 22L22 9L18 3H6ZM7.4 5H16.6L19.3 9H15.1L12 5.5L8.9 9H4.7L7.4 5ZM12 7.8L14.4 10.5H9.6L12 7.8ZM11 12H13L12 18.5L11 12ZM8.4 12L7.3 16.8L4.3 12H8.4ZM15.6 12H19.7L16.7 16.8L15.6 12Z" />
    </svg>
  );
}

// 14. Crackers / Fireworks: Party Popper
export function IconCrackers({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21L12.5 18L6 11.5L3 21ZM14.2 16.3L19.5 18.5L17.3 13.2L14.2 16.3ZM18.5 11.5L21 11L18.5 8.5L18 6L15.5 8.5L13 9L15.5 11.5L16 14L18.5 11.5ZM7 7L9 5L7 3L5 5L7 7Z" />
    </svg>
  );
}

// 15. Others: Shapes
export function IconOthers({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L6.5 11H17.5L12 2ZM5.5 13C4.1 13 3 14.1 3 15.5C3 16.9 4.1 18 5.5 18C6.9 18 8 16.9 8 15.5C8 14.1 6.9 13 5.5 13ZM14 13H21V20H14V13Z" />
    </svg>
  );
}

