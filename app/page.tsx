import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PlantVisual, PlantLifecycle } from "@/components/PlantVisual";

export default function LandingPage() {
  return <main className="landing">
    <nav className="landing-nav"><Logo/><div><a href="#why">Why Nudge</a><a href="#how">How it works</a><Link className="ghost-button" href="/api/demo/start">Explore demo</Link><Link className="primary small" href="/api/auth/google/start">Continue with Google</Link></div></nav>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">Money · Growth · Mindset</span><h1>A gentler way to <em>grow your life.</em></h1><p>Nudge keeps your money organized in your own Google Sheet, helps you invest with intention, and turns small daily check-ins into a positive growth journey.</p><div className="hero-actions"><Link className="primary" href="/api/auth/google/start">Start your Nudge →</Link><Link className="secondary" href="/api/demo/start">See the demo</Link></div><div className="trust-row"><span>✓ ₹0 stack</span><span>✓ Your Google Sheet</span><span>✓ No shame-based streaks</span></div></div>
      <div className="hero-visual"><div className="sun-orb"/><div className="hero-card"><div className="mini-greeting"><span>Good morning</span><strong>Small steps still count. ☀️</strong></div><PlantVisual stage="seedling"/><div className="hero-progress"><span>Your growth</span><b>Seedling · steady momentum</b><PlantLifecycle current="seedling"/></div></div><span className="float-note n1">🌱 Progress over perfection</span><span className="float-note n2">💛 Future You noticed</span></div>
    </section>
    <section className="feature-strip" id="why"><article><span>🌊</span><h3>See money flow</h3><p>Splits, categories, savings and investments without spreadsheet work.</p></article><article><span>🌱</span><h3>Grow visually</h3><p>Seed → Sprout → Seedling → Plant. Your progress never dies after one missed day.</p></article><article><span>🪴</span><h3>Build wealth calmly</h3><p>A Wealth Garden for contributions, goals and your investor profile—not stock-picking hype.</p></article><article><span>✨</span><h3>Reflect, don’t judge</h3><p>Daily nudges, comeback rewards, monthly stories and Nudge Wrapped.</p></article></section>
    <section className="how-section" id="how"><div><span className="eyebrow">How it works</span><h2>Minutes to use. A year of context.</h2></div><div className="how-grid"><article><b>01</b><h3>Log quickly</h3><p>Expense, split, investment or one-line check-in.</p></article><article><b>02</b><h3>Nudge organizes</h3><p>Exact finance logic writes clean records to Google Sheets.</p></article><article><b>03</b><h3>See the story</h3><p>Positive visuals show patterns, goals and growth.</p></article><article><b>04</b><h3>Look back</h3><p>Weekly, monthly and year-end reflections turn history into perspective.</p></article></div></section>
    <footer className="landing-footer"><Logo/><p>Small steps. A brighter you.</p><div><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></div></footer>
  </main>;
}
