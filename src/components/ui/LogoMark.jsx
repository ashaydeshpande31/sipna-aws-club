/** Club logo: a violet cloud with an orange "smile" underneath. */
export default function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B58CFF" />
          <stop offset="1" stopColor="#6A2BE0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#logo-g)"
        d="M20 44a9 9 0 0 1-1.4-17.9A12 12 0 0 1 41.8 23 10.5 10.5 0 0 1 44 44z"
      />
      <path
        d="M22 50c7 3.5 17 3.5 24 0"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
