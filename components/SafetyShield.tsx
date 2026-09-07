import Link from "next/link";

export function SafetyShield({saved,essential}:{saved:number;essential:number}){
 const months=essential>0?saved/essential:0;const strength=Math.min(100,months/6*100);
 return <div className="safety-shield-wrap"><div className="safety-shield" style={{"--shield-fill":`${Math.max(8,strength)}%`} as React.CSSProperties}><div className="shield-core">🛡️</div></div><div className="shield-copy"><span className="eyebrow">Safety Shield</span><h3>₹{Math.round(saved).toLocaleString("en-IN")} protected</h3>{essential>0?<><strong>{months.toFixed(1)} months</strong><p>of your recorded essential monthly expenses covered.</p></>:<p>Add essential monthly expenses in Settings to see coverage in months.</p>}<div className="shield-meter"><span style={{width:`${strength}%`}}/></div><small>Nudge shows your own coverage ratio; it does not prescribe one universal emergency-fund target.</small>{saved<=0&&<Link href="/goals" className="text-action">Create a Safety goal →</Link>}</div></div>
}
