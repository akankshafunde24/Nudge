const palette = ["#f5a66d", "#6fa9e8", "#9c82e6", "#f5c95f", "#76bd8d", "#76c9bf"];
export function MoneyRiver({ categories, income }: { categories: Record<string, number>; income: number }) {
  const entries = Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const total = Math.max(1, entries.reduce((s,[,v])=>s+v,0));
  return <div className="river-wrap">
    <svg viewBox="0 0 620 245" className="money-river" role="img" aria-label="Money flow illustration">
      <defs><linearGradient id="source" x1="0" x2="1"><stop offset="0" stopColor="#276f5b"/><stop offset="1" stopColor="#77c79d"/></linearGradient></defs>
      <rect x="20" y="78" width="140" height="90" rx="28" fill="url(#source)"/>
      <text x="90" y="112" textAnchor="middle" fill="white" fontSize="13">Money in</text>
      <text x="90" y="141" textAnchor="middle" fill="white" fontSize="23" fontWeight="700">₹{Math.round(income).toLocaleString("en-IN")}</text>
      {entries.map(([label, value], i) => {
        const y = 24 + i * 36; const width = 8 + Math.max(6, (value / total) * 34);
        return <g key={label}>
          <path d={`M160 122 C250 122 265 ${y+8} 350 ${y+8} S450 ${y+8} 500 ${y+8}`} fill="none" stroke={palette[i]} strokeWidth={width} strokeLinecap="round" opacity=".85"/>
          <circle cx="520" cy={y+8} r="15" fill={palette[i]} opacity=".18"/><circle cx="520" cy={y+8} r="6" fill={palette[i]}/>
          <text x="546" y={y+5} fontSize="12" fill="#2b3850">{label}</text><text x="546" y={y+19} fontSize="11" fill="#738096">₹{Math.round(value).toLocaleString("en-IN")}</text>
        </g>;
      })}
      {!entries.length && <text x="390" y="125" textAnchor="middle" fill="#82908e" fontSize="14">Your money river appears as you log spending.</text>}
    </svg>
  </div>;
}
