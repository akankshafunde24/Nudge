const potPlants = ["🌿", "🪴", "🌱", "🌵", "🍀"];
export function WealthGarden({ allocation, total }: { allocation: Record<string, number>; total: number }) {
  const entries = Object.entries(allocation).sort((a,b)=>b[1]-a[1]);
  return <div className="wealth-garden">
    <div className="garden-ground"/>
    {entries.length ? entries.slice(0,5).map(([name,value],i) => <div className="garden-pot" key={name}>
      <div className="plant-emoji" style={{ fontSize: `${34 + Math.min(24, total ? (value/total)*30 : 0)}px` }}>{potPlants[i % potPlants.length]}</div>
      <div className="pot"><span>{name}</span><strong>₹{Math.round(value).toLocaleString("en-IN")}</strong></div>
    </div>) : <div className="empty-garden"><span>🌱</span><p>Your first investment plants the first seed.</p></div>}
  </div>;
}
