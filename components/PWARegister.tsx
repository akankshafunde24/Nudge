"use client";
import { useEffect } from "react";
import { flushOfflineQueue } from "@/lib/client/offline";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const sync = () => { void flushOfflineQueue(); };
    window.addEventListener("online", sync);
    sync();
    return () => window.removeEventListener("online", sync);
  }, []);
  return null;
}
