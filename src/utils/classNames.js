// utils/classNames.js
//
// Tailwind-friendly helper to merge conditional class strings
// -----------------------------------------------------------
// Usage:
//   <button className={cn(
//       'px-4 py-2 rounded',
//       isActive && 'bg-brand text-white',
//       disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand/80'
//   )}>
//     Click me
//   </button>

export function cn(...args) {
  return args
    .flat(Infinity)          // allow arrays inside
    .filter(Boolean)         // drop falsey values
    .join(' ')
    .trim();
}
