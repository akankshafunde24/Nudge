import { Loading } from "./Loading";
export function PageState({ loading, error, children }: { loading: boolean; error: string|null; children: React.ReactNode }) {
  if (loading) return <Loading/>;
  if (error) return <div className="empty-card"><span>🌿</span><h3>Nudge could not load this view</h3><p>{error}</p></div>;
  return <>{children}</>;
}
