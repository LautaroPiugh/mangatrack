// Avatar components using inline SVG
// Each avatar has a unique character design

export const GENERIC_AVATARS = {
  avatar_ninja: {
    label: 'Ninja',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#1a1a1a" />
        {/* Face cover (ninja mask style) */}
        <rect x="8" y="20" width="48" height="28" rx="8" fill="#2a2a2a" />
        <circle cx="20" cy="28" r="4" fill="#80bfff" opacity="0.9" />
        <circle cx="44" cy="28" r="4" fill="#80bfff" opacity="0.9" />
        {/* Headband (forehead band) */}
        <rect x="6" y="14" width="52" height="8" fill="#ff6b6b" rx="2" />
        <circle cx="32" cy="18" r="3" fill="#ffd93d" />
      </svg>
    ),
  },
  avatar_samurai: {
    label: 'Samurai',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#0f4c75" />
        {/* Head */}
        <circle cx="32" cy="24" r="12" fill="#e8b4a8" />
        {/* Hair/helmet */}
        <path d="M20 18 Q32 4 44 18" fill="#2c3e50" />
        {/* Topknot */}
        <circle cx="32" cy="10" r="4" fill="#2c3e50" />
        {/* Eyes */}
        <circle cx="28" cy="22" r="1.5" fill="#000" />
        <circle cx="36" cy="22" r="1.5" fill="#000" />
        {/* Mouth */}
        <path d="M28 28 Q32 30 36 28" stroke="#000" fill="none" strokeWidth="1" strokeLinecap="round" />
        {/* Armor shoulder */}
        <rect x="16" y="30" width="32" height="16" rx="4" fill="#8b4513" opacity="0.8" />
      </svg>
    ),
  },
  avatar_student: {
    label: 'Estudiante',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#f0a500" />
        {/* Head */}
        <circle cx="32" cy="22" r="10" fill="#f4c4a3" />
        {/* Hair */}
        <path d="M22 18 Q22 6 32 6 Q42 6 42 18" fill="#3d2817" />
        {/* Eyes (anime style) */}
        <ellipse cx="27" cy="21" rx="2.5" ry="3" fill="#000" />
        <ellipse cx="37" cy="21" rx="2.5" ry="3" fill="#000" />
        <circle cx="27.5" cy="20" r="1" fill="#fff" />
        <circle cx="37.5" cy="20" r="1" fill="#fff" />
        {/* Smile */}
        <path d="M26 26 Q32 29 38 26" stroke="#000" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        {/* School uniform */}
        <rect x="20" y="32" width="24" height="20" fill="#1e40af" rx="4" />
        <rect x="28" y="35" width="8" height="12" fill="#dc2626" rx="1" />
      </svg>
    ),
  },
  avatar_robot: {
    label: 'Robot',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#e5e7eb" />
        {/* Head */}
        <rect x="18" y="12" width="28" height="24" rx="4" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" />
        {/* Eyes */}
        <rect x="22" y="18" width="6" height="6" fill="#06b6d4" rx="1" />
        <rect x="36" y="18" width="6" height="6" fill="#06b6d4" rx="1" />
        {/* Antenna */}
        <line x1="32" y1="12" x2="32" y2="4" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="2" r="2" fill="#dc2626" />
        {/* Body */}
        <rect x="20" y="36" width="24" height="20" rx="3" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" />
        {/* Chest panel */}
        <rect x="24" y="40" width="16" height="10" fill="#6b7280" rx="2" />
        <circle cx="28" cy="45" r="1.5" fill="#06b6d4" />
        <circle cx="32" cy="45" r="1.5" fill="#06b6d4" />
        <circle cx="36" cy="45" r="1.5" fill="#06b6d4" />
      </svg>
    ),
  },
  avatar_cat: {
    label: 'Gato',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#fbbf24" />
        {/* Head */}
        <circle cx="32" cy="28" r="14" fill="#f97316" />
        {/* Ears */}
        <path d="M22 16 L18 6 L24 14 Z" fill="#f97316" />
        <path d="M42 16 L46 6 L40 14 Z" fill="#f97316" />
        <path d="M22 16 L20 10 L23 15 Z" fill="#fbbf24" />
        <path d="M42 16 L44 10 L41 15 Z" fill="#fbbf24" />
        {/* Eyes */}
        <ellipse cx="27" cy="26" rx="2" ry="3.5" fill="#000" />
        <ellipse cx="37" cy="26" rx="2" ry="3.5" fill="#000" />
        <circle cx="27" cy="25" r="0.8" fill="#fff" />
        <circle cx="37" cy="25" r="0.8" fill="#fff" />
        {/* Nose */}
        <path d="M32 30 L30 33 L34 33 Z" fill="#fbbf24" />
        {/* Mouth */}
        <path d="M32 33 Q28 36 24 34" stroke="#000" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 33 Q36 36 40 34" stroke="#000" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="18" y1="28" x2="10" y2="26" stroke="#000" strokeWidth="1" strokeLinecap="round" />
        <line x1="46" y1="28" x2="54" y2="26" stroke="#000" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  avatar_oni: {
    label: 'Demonio',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#991b1b" />
        {/* Head */}
        <circle cx="32" cy="28" r="12" fill="#dc2626" />
        {/* Horns */}
        <path d="M22 20 L18 8 L24 18 Z" fill="#3f3f3f" />
        <path d="M42 20 L46 8 L40 18 Z" fill="#3f3f3f" />
        {/* Angry eyes */}
        <ellipse cx="27" cy="26" rx="2.5" ry="3.5" fill="#fbbf24" transform="rotate(-15 27 26)" />
        <ellipse cx="37" cy="26" rx="2.5" ry="3.5" fill="#fbbf24" transform="rotate(15 37 26)" />
        <circle cx="27" cy="27" r="0.8" fill="#000" />
        <circle cx="37" cy="27" r="0.8" fill="#000" />
        {/* Nose - demon style */}
        <path d="M30 32 L32 35 L34 32 Z" fill="#fbbf24" />
        {/* Fangs/mouth */}
        <path d="M28 36 L26 40 L30 36" fill="#1f2937" />
        <path d="M36 36 L38 40 L34 36" fill="#1f2937" />
        <path d="M28 36 Q32 38 36 36" stroke="#1f2937" fill="none" strokeWidth="1.5" />
      </svg>
    ),
  },
  avatar_explorer: {
    label: 'Explorador',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#84cc16" />
        {/* Head */}
        <circle cx="32" cy="20" r="10" fill="#f4a460" />
        {/* Hat */}
        <path d="M22 14 L42 14 L40 8 L24 8 Z" fill="#8b4513" />
        <circle cx="32" cy="8" r="2" fill="#dc2626" />
        {/* Adventurer eyes - looking forward */}
        <circle cx="28" cy="18" r="1.5" fill="#000" />
        <circle cx="36" cy="18" r="1.5" fill="#000" />
        {/* Happy expression */}
        <path d="M26 22 Q32 24 38 22" stroke="#000" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        {/* Adventurer outfit */}
        <rect x="20" y="30" width="24" height="22" fill="#8b6914" rx="4" />
        {/* Backpack straps */}
        <line x1="24" y1="30" x2="24" y2="48" stroke="#654321" strokeWidth="2" />
        <line x1="40" y1="30" x2="40" y2="48" stroke="#654321" strokeWidth="2" />
        {/* Compass/medallion */}
        <circle cx="32" cy="41" r="3" fill="#fbbf24" />
        <circle cx="32" cy="41" r="2" fill="none" stroke="#dc2626" strokeWidth="0.5" />
      </svg>
    ),
  },
  avatar_mage: {
    label: 'Mago',
    render: (size = 64) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#7c3aed" />
        {/* Head */}
        <circle cx="32" cy="20" r="10" fill="#f4a460" />
        {/* Pointy hat */}
        <path d="M22 12 L32 4 L42 12 Q42 10 32 0 Q22 10 22 12 Z" fill="#6b21a8" />
        <path d="M22 12 L32 4 L42 12" fill="#7c3aed" />
        {/* Star on hat */}
        <circle cx="32" cy="8" r="1.5" fill="#fbbf24" />
        {/* Wise eyes */}
        <circle cx="28" cy="18" r="1.5" fill="#000" />
        <circle cx="36" cy="18" r="1.5" fill="#000" />
        <circle cx="28.5" cy="17.5" r="0.6" fill="#60a5fa" />
        <circle cx="36.5" cy="17.5" r="0.6" fill="#60a5fa" />
        {/* Beard */}
        <path d="M26 24 Q32 27 38 24" fill="#8b6914" />
        {/* Robes */}
        <rect x="18" y="30" width="28" height="26" fill="#6b21a8" rx="4" />
        {/* Magical aura/orb on chest */}
        <circle cx="32" cy="42" r="4" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.7" />
        <circle cx="32" cy="42" r="2" fill="#60a5fa" opacity="0.5" />
      </svg>
    ),
  },
}

export const GENERIC_AVATAR_KEYS = Object.keys(GENERIC_AVATARS)

/**
 * Get the avatar component for a given key
 */
export function getGenericAvatarComponent(avatarKey, size = 64) {
  const avatar = GENERIC_AVATARS[avatarKey]
  if (!avatar) {
    return null
  }
  return avatar.render(size)
}

/**
 * Check if a value is a valid generic avatar key
 */
export function isGenericAvatarKey(value) {
  return GENERIC_AVATAR_KEYS.includes(value)
}
