export function Loading({ message = "Growing your Nudge…" }: { message?: string }) {
  return <div className="loading"><span className="loading-seed">🌱</span><p>{message}</p></div>;
}
