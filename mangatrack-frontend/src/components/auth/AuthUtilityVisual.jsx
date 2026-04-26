const COPY_BY_VARIANT = {
  password: {
    title: 'Recupera tu acceso',
    description: 'Te enviamos un enlace temporal para que puedas volver a entrar sin perder tu progreso.',
  }
}

function AuthUtilityIcon({ variant }) {
  const isVerification = variant === 'verification'

  return (
    <svg className="auth-utility-icon-svg" viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`auth-utility-bg-${variant}`} x1="38" y1="36" x2="206" y2="206" gradientUnits="userSpaceOnUse">
          <stop stopColor={isVerification ? '#fb923c' : '#60a5fa'} />
          <stop offset="1" stopColor={isVerification ? '#f97316' : '#2563eb'} />
        </linearGradient>
        <linearGradient id={`auth-utility-card-${variant}`} x1="72" y1="70" x2="172" y2="174" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.94)" />
          <stop offset="1" stopColor="rgba(219,234,254,0.88)" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="94" fill={`url(#auth-utility-bg-${variant})`} opacity="0.16" />
      <circle cx="120" cy="120" r="74" fill={`url(#auth-utility-bg-${variant})`} opacity="0.24" />

      <rect x="56" y="68" width="128" height="106" rx="28" fill={`url(#auth-utility-card-${variant})`} />
      <rect x="56" y="68" width="128" height="106" rx="28" stroke="rgba(255,255,255,0.72)" strokeWidth="2" />

      <path
        d="M84 96h72c9.941 0 18 8.059 18 18v3.5l-44.221 25.83a19 19 0 0 1-19.17.167L66 118.5V114c0-9.941 8.059-18 18-18Z"
        fill={isVerification ? '#fff7ed' : '#eff6ff'}
      />
      <path
        d="M67 117.5 108.5 142a19 19 0 0 0 19.146 0L173 117.5v26.5c0 9.941-8.059 18-18 18H85c-9.941 0-18-8.059-18-18v-26.5Z"
        fill={isVerification ? '#ffedd5' : '#dbeafe'}
      />
      <path
        d="m72 104 41.241 27.25a12 12 0 0 0 13.197.071L168 104"
        stroke={isVerification ? '#ea580c' : '#2563eb'}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {isVerification ? (
        <>
          <circle cx="174" cy="74" r="28" fill="#fff7ed" />
          <circle cx="174" cy="74" r="28" stroke="rgba(249,115,22,0.25)" strokeWidth="3" />
          <path d="m161 74 9 9 18-19" stroke="#f97316" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="174" cy="74" r="28" fill="#eff6ff" />
          <circle cx="174" cy="74" r="28" stroke="rgba(37,99,235,0.22)" strokeWidth="3" />
          <path
            d="M165 74v-6c0-5.523 4.477-10 10-10s10 4.477 10 10v6"
            stroke="#2563eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="160" y="72" width="28" height="22" rx="8" fill="#2563eb" />
          <circle cx="174" cy="82.5" r="3.5" fill="#eff6ff" />
        </>
      )}

      <circle cx="56" cy="178" r="12" fill={isVerification ? '#fb923c' : '#60a5fa'} opacity="0.9" />
      <circle cx="188" cy="170" r="10" fill={isVerification ? '#fdba74' : '#93c5fd'} opacity="0.86" />
      <circle cx="194" cy="102" r="7" fill={isVerification ? '#ffedd5' : '#dbeafe'} />
    </svg>
  )
}

function AuthUtilityVisual({ variant = 'password' }) {
  const wrapperClassName =
    variant === 'verification'
      ? 'auth-visual-side auth-visual-utility auth-visual-utility-verification'
      : 'auth-visual-side auth-visual-utility auth-visual-utility-password'

  return (
    <div className={wrapperClassName}>
      <div className="auth-utility-stack">
        <div className="auth-utility-icon-shell">
          <div className="auth-utility-glow" />
          <AuthUtilityIcon variant={variant} />
        </div>
      </div>
    </div>
  )
}

export default AuthUtilityVisual
