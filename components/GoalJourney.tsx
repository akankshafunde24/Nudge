export function GoalJourney({ name, progress, current, target, months, type }: { name: string; progress: number; current: number; target: number; months: number|null; type?: string }) {
  const icon = type?.toLowerCase().includes("safety") ? "🛡️" : type?.toLowerCase().includes("experience") ? "✈️" : type?.toLowerCase().includes("learning") ? "📚" : "🎯";
  return <article className="goal-journey">
    <div className="goal-head"><div><span className="goal-icon">{icon}</span><strong>{name}</strong></div><b>{Math.round(progress)}%</b></div>
    <div className="journey-track"><div className="journey-fill" style={{ width: `${Math.max(3, progress)}%` }}/><div className="journey-marker" style={{ left: `calc(${Math.min(96, Math.max(4, progress))}% - 12px)` }}>{icon}</div></div>
    <div className="goal-foot"><span>₹{Math.round(current).toLocaleString("en-IN")} of ₹{Math.round(target).toLocaleString("en-IN")}</span><span>{months != null ? `${months} mo. approx.` : "Keep going gently"}</span></div>
  </article>;
}
