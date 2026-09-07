"use client";
import { useEffect } from "react";

const allowed=["/dashboard","/money","/grow","/goals","/track","/journal","/insights","/rewards","/wrapped","/settings"];
export default function ResumePage(){
 useEffect(()=>{let target="/dashboard";try{const saved=localStorage.getItem("nudge:lastPath")||"";if(allowed.some(p=>saved===p||saved.startsWith(`${p}/`)))target=saved}catch{}window.location.replace(target)},[]);
 return <main className="setup-page"><div className="setup-card"><div className="loading"><span className="loading-seed">🌱</span><p>Picking up where you left off…</p></div></div></main>;
}
