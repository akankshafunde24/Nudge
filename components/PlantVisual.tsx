import type { PlantStage } from "@/lib/core/types";

const stageIndex: Record<PlantStage, number> = { seed: 0, sprout: 1, seedling: 2, plant: 3 };

export function PlantVisual({ stage, size = "large", resting = false }: { stage: PlantStage; size?: "small"|"large"; resting?: boolean }) {
  const idx = stageIndex[stage];
  const w = size === "large" ? 180 : 84;
  const h = size === "large" ? 150 : 74;
  return <svg className={`plant-visual ${resting ? "resting" : ""}`} width={w} height={h} viewBox="0 0 180 150" role="img" aria-label={`${stage} growth stage`}>
    <ellipse cx="90" cy="132" rx="55" ry="9" fill="#e9d8bf" opacity=".55"/>
    <path d="M45 105h90l-10 30H55Z" fill="#e9a779"/>
    <path d="M52 105h76" stroke="#cf825b" strokeWidth="4" strokeLinecap="round"/>
    {idx === 0 && <>
      <ellipse cx="90" cy="100" rx="25" ry="8" fill="#b98356" opacity=".3"/>
      <ellipse cx="90" cy="93" rx="12" ry="8" fill="#7b5639" transform="rotate(-15 90 93)"/>
    </>}
    {idx >= 1 && <path d="M90 106C89 88 90 69 93 50" stroke="#2f7a56" strokeWidth={idx >= 2 ? 5 : 4} strokeLinecap="round"/>}
    {idx >= 1 && <path d="M92 72c-18-2-25-10-27-23 17 2 27 9 27 23Z" fill="#7fca8c"/>}
    {idx >= 2 && <path d="M93 61c16-3 25-12 27-26-17 2-26 10-27 26Z" fill="#58af76"/>}
    {idx >= 2 && <path d="M90 88c-14-1-22-8-24-19 14 1 22 7 24 19Z" fill="#a1d9a4"/>}
    {idx >= 3 && <>
      <path d="M95 45c-13-8-17-19-12-31 13 8 17 18 12 31Z" fill="#3d9767"/>
      <path d="M96 47c15-7 26-5 34 5-15 7-26 5-34-5Z" fill="#6dbf82"/>
      <circle cx="97" cy="35" r="7" fill="#f7b66b"/><circle cx="97" cy="35" r="3" fill="#fff4cc"/>
    </>}
    {resting && <path d="M135 32c10 5 14 14 10 23-10-5-14-14-10-23Z" fill="#c7b8df" opacity=".8"/>}
  </svg>;
}

export function PlantLifecycle({ current }: { current: PlantStage }) {
  const stages: Array<{ key: PlantStage; label: string; emoji: string }> = [
    { key: "seed", label: "Seed", emoji: "•" }, { key: "sprout", label: "Sprout", emoji: "🌱" }, { key: "seedling", label: "Seedling", emoji: "🌿" }, { key: "plant", label: "Plant", emoji: "🪴" }
  ];
  const currentIndex = stageIndex[current];
  return <div className="lifecycle">
    {stages.map((s, i) => <div key={s.key} className={`life-stage ${i <= currentIndex ? "reached" : ""} ${i === currentIndex ? "current" : ""}`}>
      <div className="life-node">{s.emoji}</div><span>{s.label}</span>{i < stages.length - 1 && <div className="life-line"/>}
    </div>)}
  </div>;
}
