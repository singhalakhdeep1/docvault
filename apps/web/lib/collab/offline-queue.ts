/**
 * offline-queue.ts
 *
 * Persists pending Yjs `sync:update` payloads in IndexedDB (via idb-keyval)
 * so they survive page reloads and can be replayed when the Socket.IO
 * connection is restored.
 *
 * Queue key per document → collab:queue:<docId>
 * Each entry is a base-64 encoded Uint8Array Yjs update.
 */
import { get, set, del } from "idb-keyval";

const queueKey = (docId: string) => `collab:queue:${docId}`;

/** Append one base-64 encoded update to the persistent queue. */
export async function enqueueUpdate(docId: string, update: string): Promise<void> {
    const existing: string[] = (await get<string[]>(queueKey(docId))) ?? [];
    existing.push(update);
    await set(queueKey(docId), existing);
}

/** Return all queued updates for the document (oldest first). */
export async function getPendingUpdates(docId: string): Promise<string[]> {
    return (await get<string[]>(queueKey(docId))) ?? [];
}

/** Remove all queued updates once they have been successfully replayed. */
export async function clearPendingUpdates(docId: string): Promise<void> {
    await del(queueKey(docId));
}
