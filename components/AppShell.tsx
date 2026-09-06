"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { QuickAddModal } from "./QuickAddModal";

const nav = [
  ["/dashboard", "⌂", "Home"], ["/money", "◒", "Money"], ["/grow", "♧", "Grow"], ["/goals", "⚑", "Goals"],
  ["/track", "◉", "Track"], ["/journal", "✎", "Journal"], ["/insights", "⌁", "Insights"], ["/rewards", "✦", "Rewards"], ["/wrapped", "☄", "Wrapped"]
] as const;
const mobilePrimary = ["/dashboard", "/money", "/grow", "/track", "/rewards"];

export function AppShell({ children, name = "there", spreadsheetUrl, demo = false, onRefresh }: { children: React.ReactNode; name?: string; spreadsheetUrl?: string; demo?: boolean; onRefresh?: () => void }) {
  const path = usePathname();
  const [quick, setQuick] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3200); };
  return <div className="app-frame">
    <aside className="sidebar">
      <Logo/>
      <nav>{nav.map(([href, icon, label]) => <Link key={href} href={href} className={path.startsWith(href) ? "active" : ""}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="side-bottom">
        <Link href="/settings">⚙ Settings</Link>
        {spreadsheetUrl && spreadsheetUrl !== "#" && <a href={spreadsheetUrl} target="_blank" rel="noreferrer">▦ Open Google Sheet</a>}
        <form action="/api/auth/logout" method="post"><button type="submit" className="link-button">↪ Sign out</button></form>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="mobile-logo"><Logo compact/><strong>Nudge</strong></div>
        <div className="top-search">✨ <span>Ask Nudge about your month from the Money page</span></div>
        <div className="top-actions">
          {demo && <span className="demo-pill">Demo</span>}
          <button className="quick-button" onClick={() => setQuick(true)}>＋ Quick add</button>
          <button className="mobile-menu-button" onClick={()=>setMobileMenu(true)} aria-label="Open menu">☰</button>
          <div className="avatar" title={name}>{name.slice(0,1).toUpperCase()}</div>
        </div>
      </header>
      <div className="content">{children}</div>
    </main>
    <nav className="bottom-nav">
      {nav.filter(([href])=>mobilePrimary.includes(href)).map(([href, icon, label]) => <Link key={href} href={href} className={path.startsWith(href) ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>)}
    </nav>
    <button className="mobile-fab" onClick={()=>setQuick(true)} aria-label="Quick add">＋</button>
    {mobileMenu && <div className="mobile-menu-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)setMobileMenu(false)}}><section className="mobile-menu-panel"><div className="modal-head"><div><span className="eyebrow">Nudge</span><h2>Where to?</h2></div><button onClick={()=>setMobileMenu(false)} aria-label="Close menu">×</button></div><div className="mobile-menu-grid">{nav.map(([href,icon,label])=><Link key={href} href={href} onClick={()=>setMobileMenu(false)}><span>{icon}</span><b>{label}</b></Link>)}<Link href="/settings" onClick={()=>setMobileMenu(false)}><span>⚙</span><b>Settings</b></Link>{spreadsheetUrl&&spreadsheetUrl!=="#"&&<a href={spreadsheetUrl} target="_blank" rel="noreferrer"><span>▦</span><b>Google Sheet</b></a>}</div><form action="/api/auth/logout" method="post"><button type="submit" className="secondary wide">Sign out</button></form></section></div>}
    {quick && <QuickAddModal onClose={() => setQuick(false)} onSaved={(message) => { notify(message); onRefresh?.(); }}/>} 
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
