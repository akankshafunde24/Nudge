import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PlantVisual, PlantLifecycle } from "@/components/PlantVisual";
import { getSession } from "@/lib/server/auth";

export default async function LandingPage() {
  const session=await getSession();
  if(session)redirect("/resume");
  return <main className="landing">
    <nav className="landing-nav"><Logo/><div><a href="#why">Why Nudge</a><a href="#how">How it works</a><Link className="ghost-button" href="/api/demo/start">Explore demo</Link><Link className="primary small" href="/api/auth/google/start">Continue with Google</Link></div></nav>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">Money · Growth · Mindset</span><h1>A gentler way to <em>grow your life.</em></h1><p>Nudge keeps your money organized in your own Google Sheet, helps you invest with intention, and turns small daily check-ins into a positive growth journey.</p><div className="hero-actions"><Link className="primary" href="/api/auth/google/start">Start your Nudge →</Link><Link className="secondary" href="/api/demo/start">See the demo</Link></div><div className="trust-row"><span>✓ ₹0 stack</span><span>✓ Your Google Sheet</span><span>✓ No shame-based streaks</span></div></div>
      <div className="hero-visual"><div className="sun-orb"/><div className="hero-card"><div className="mini-greeting"><span>Good morning</span><strong>Small steps still count. ☀️</strong></div><PlantVisual stage="seedling"/><div className="hero-progress"><span>Your growth</span><b>Seedling · steady momentum</b><PlantLifecycle current="seedling"/></div></div><span className="float-note n1">🌱 Progress over perfection</span><span className="float-note n2">💛 Future You noticed</span></div>
    </section>
    <section className="feature-strip" id="why"><article><span>🌊</span><h3>See money flow</h3><p>Splits, categories, savings and investments without spreadsheet work.</p></article><article><span>✨</span><h3>Just tell Nudge</h3><p>“Dinner with Neha and Anjali, I paid ₹1,500.” Nudge drafts the bookkeeping and asks you to confirm.</p></article><article><span>🪴</span><h3>Build wealth calmly</h3><p>A Wealth Garden for contributions, goals and your investor profile—not stock-picking hype.</p></article><article><span>🌱</span><h3>Reflect, don’t judge</h3><p>Daily nudges, comeback rewards, monthly stories and Nudge Wrapped.</p></article></section>
    <section className="how-section" id="how"><div><span className="eyebrow">How it works</span><h2>Minutes to use. A year of context.</h2></div><div className="how-grid"><article><b>01</b><h3>Say it naturally</h3><p>Expense, split, investment, repayment, question or one-line check-in.</p></article><article><b>02</b><h3>Nudge previews</h3><p>Deterministic finance logic calculates the exact result before anything is saved.</p></article><article><b>03</b><h3>See the story</h3><p>Positive visuals show patterns, goals and growth.</p></article><article><b>04</b><h3>Come back anytime</h3><p>Your session, Sheet and plant continue where you left them.</p></article></div></section>
    <footer className="landing-footer"><Logo/><p>Small steps. A brighter you.</p><div><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></div></footer>
  </main>;
}
