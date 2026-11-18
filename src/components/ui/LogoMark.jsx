/** Club logo: the AWS Student Builder Group chip. It follows the site's accent colour. */
export default function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 114 114" className={className} aria-hidden="true">
      <path fill="var(--color-aws)" d="M25 0h12v12.6h-12zM25 101.4h12v12.6h-12zM0 25h12.6v12h-12.6zM101.4 25h12.6v12h-12.6zM51 0h12v12.6h-12zM51 101.4h12v12.6h-12zM0 51h12.6v12h-12.6zM101.4 51h12.6v12h-12.6zM77 0h12v12.6h-12zM77 101.4h12v12.6h-12zM0 77h12.6v12h-12.6zM101.4 77h12.6v12h-12.6zM25 12h64v12h-64zM25 90h64v12h-64zM12 25h12v64h-12zM90 25h12v64h-12z" />
    </svg>
  )
}

/** Compact lockup: chip + the three-line name, as in the club's printed logo. */
export function LogoLockup({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-11 w-11" />
      <span className="font-display text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.16em] text-white">
        AWS Student
        <br />
        Builder Group
        <br />
        at Sipna
      </span>
    </span>
  )
}
