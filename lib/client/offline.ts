"use client";

const DB_NAME = "nudge-offline";
const STORE = "queue";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueOffline(url: string, body: unknown) {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id: crypto.randomUUID(), url, body, createdAt: new Date().toISOString() });
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}

export async function flushOfflineQueue() {
  if (typeof indexedDB === "undefined" || !navigator.onLine) return 0;
  const db = await openDb();
  const entries = await new Promise<any[]>((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error);
  });
  let synced = 0;
  for (const entry of entries) {
    try {
      const response = await fetch(entry.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(entry.body) });
      if (!response.ok) continue;
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(entry.id);
      synced++;
    } catch { /* leave queued */ }
  }
  return synced;
}
