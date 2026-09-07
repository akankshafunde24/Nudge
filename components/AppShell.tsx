"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { QuickAddModal } from "./QuickAddModal";
import { NudgeAssistant } from "./NudgeAssistant";

const nav = [
  ["/dashboard", "⌂", "Home"], ["/money", "◒", "Money"], ["/grow", "♧", "Grow"], ["/goals", "⚑", "Goals"],
  ["/track", "◉", "Track"], ["/journal", "✎", "Journal"], ["/insights", "⌁", "Insights"], ["/rewards", "✦", "Rewards"], ["/wrapped", "☄", "Wrapped"]
] as const;
const mobilePrimary = ["/dashboard", "/money", "/grow", "/track", "/rewards"];
type SessionInfo={signedIn:boolean;demo:boolean;profile?:{name:string;email:string;picture?:string|null}};

export function AppShell({ children, name = "there", spreadsheetUrl, demo = false, onRefresh }: { children: React.ReactNode; name?: string; spreadsheetUrl?: string; demo?: boolean; onRefresh?: () => void }) {
  const path = usePathname();
  const [quick, setQuick] = useState(false);
  const [assistant,setAssistant]=useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [session,setSession]=useState<SessionInfo|null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3200); };
  useEffect(()=>{try{localStorage.setItem("nudge:lastPath",path)}catch{}},[path]);
  useEffect(()=>{fetch("/api/session",{cache:"no-store"}).then(r=>r.json()).then(setSession).catch(()=>undefined)},[]);
  const profile=session?.profile; const isDemo=session?.demo??demo;
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
        <button className="top-search" onClick={()=>setAssistant(true)} aria-label="Tell Nudge anything">✨ <span>Tell Nudge anything…</span><kbd>⌘ K</kbd></button>
        <div className="top-actions">
          {isDemo && <button className="demo-pill" onClick={()=>setProfileOpen(v=>!v)}>Demo · options</button>}
          <button className="quick-button" onClick={() => setQuick(true)}>＋ Quick add</button>
          <button className="mobile-menu-button" onClick={()=>setMobileMenu(true)} aria-label="Open menu">☰</button>
          <button className="avatar avatar-button" onClick={()=>setProfileOpen(v=>!v)} aria-label="Open profile" title={profile?.name||name}>{profile?.picture?<img src={profile.picture} alt="" referrerPolicy="no-referrer"/>:(profile?.name||name).slice(0,1).toUpperCase()}</button>
          {profileOpen&&<div className="profile-menu"><div className="profile-summary">{profile?.picture?<img src={profile.picture} alt="" referrerPolicy="no-referrer"/>:<span>{(profile?.name||name).slice(0,1).toUpperCase()}</span>}<div><b>{profile?.name||name}</b><small>{profile?.email||(isDemo?"Sample data mode":"Signed in")}</small></div></div>{isDemo&&<div className="demo-callout"><b>Exploring sample data</b><span>Sign in when you are ready to make Nudge yours.</span></div>}<Link href="/settings" onClick={()=>setProfileOpen(false)}>⚙ Profile & settings</Link>{spreadsheetUrl&&spreadsheetUrl!=="#"&&<a href={spreadsheetUrl} target="_blank" rel="noreferrer">▦ Open Nudge Sheet</a>}{isDemo&&<Link href="/api/auth/google/start">G Sign in with Google</Link>}<form action="/api/auth/logout" method="post"><button type="submit" className="profile-signout">↪ {isDemo?"Exit demo":"Sign out"}</button></form></div>}
        </div>
      </header>
      <div className="content">{children}</div>
    </main>
    <nav className="bottom-nav">
      {nav.filter(([href])=>mobilePrimary.includes(href)).map(([href, icon, label]) => <Link key={href} href={href} className={path.startsWith(href) ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>)}
    </nav>
    <button className="mobile-assistant-fab" onClick={()=>setAssistant(true)} aria-label="Tell Nudge anything">✨</button>
    <button className="mobile-fab" onClick={()=>setQuick(true)} aria-label="Quick add">＋</button>
    {mobileMenu && <div className="mobile-menu-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)setMobileMenu(false)}}><section className="mobile-menu-panel"><div className="modal-head"><div><span className="eyebrow">Nudge</span><h2>Where to?</h2></div><button onClick={()=>setMobileMenu(false)} aria-label="Close menu">×</button></div><button className="assistant-mobile-entry" onClick={()=>{setMobileMenu(false);setAssistant(true)}}>✨ Tell Nudge anything…</button><div className="mobile-menu-grid">{nav.map(([href,icon,label])=><Link key={href} href={href} onClick={()=>setMobileMenu(false)}><span>{icon}</span><b>{label}</b></Link>)}<Link href="/settings" onClick={()=>setMobileMenu(false)}><span>⚙</span><b>Settings</b></Link>{spreadsheetUrl&&spreadsheetUrl!=="#"&&<a href={spreadsheetUrl} target="_blank" rel="noreferrer"><span>▦</span><b>Google Sheet</b></a>}</div><form action="/api/auth/logout" method="post"><button type="submit" className="secondary wide">Sign out</button></form></section></div>}
    {assistant&&<NudgeAssistant onClose={()=>setAssistant(false)} onSaved={(message)=>{notify(message);onRefresh?.()}} onManual={()=>{setAssistant(false);setQuick(true)}}/>}
    {quick && <QuickAddModal onClose={() => setQuick(false)} onSaved={(message) => { notify(message); onRefresh?.(); }}/>} 
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
