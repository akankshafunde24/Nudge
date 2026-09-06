export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo" aria-label="Nudge">
    <svg width={compact ? 30 : 36} height={compact ? 30 : 36} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="12" fill="var(--green)"/>
      <path d="M20 29c0-8 2-13 8-18-1 8-3 13-8 18Z" fill="#9ce2ad"/>
      <path d="M19 27c-5-2-8-6-9-12 6 1 10 4 9 12Z" fill="#f7c477"/>
      <path d="M19.5 30V18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
    {!compact && <span>Nudge</span>}
  </div>;
}
