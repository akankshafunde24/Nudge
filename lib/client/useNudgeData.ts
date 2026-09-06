"use client";
import { useCallback, useEffect, useState } from "react";
import type { NudgeSnapshot } from "@/lib/core/types";

interface SnapshotResponse { snapshot: NudgeSnapshot; spreadsheetUrl?: string; demo: boolean; wrapped?: Array<{ year: string; json: string; generated_at: string }> }

export function useNudgeData(month?: string) {
  const [data, setData] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const query = month ? `?month=${encodeURIComponent(month)}` : "";
      const response = await fetch(`/api/snapshot${query}`, { cache: "no-store" });
      if (response.status === 401) { window.location.href = "/"; return; }
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not load Nudge.");
      setData(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load Nudge."); }
    finally { setLoading(false); }
  }, [month]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, refresh: load };
}
