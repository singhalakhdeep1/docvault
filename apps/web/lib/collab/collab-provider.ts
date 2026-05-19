import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import { enqueueUpdate, getPendingUpdates, clearPendingUpdates } from "./offline-queue";

export interface CollabUser {
    name: string;
    color: string;
}

export interface CollabProvider {
    doc: Y.Doc;
    destroy: () => void;
    awareness: {
        setLocalStateField: (key: string, value: unknown) => void;
        getStates: () => Map<number, Record<string, unknown>>;
        on: (event: string, cb: () => void) => void;
        off: (event: string, cb: () => void) => void;
    };
}

export function createCollabProvider(docId: string, token: string, user: CollabUser): CollabProvider {
    const ydoc = new Y.Doc();

    const awareness = createSimpleAwareness(ydoc);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

    const socket: Socket = io(apiBase, {
        path: "/socket.io",
        transports: ["websocket"],
        query: { docId },
        auth: { token },
    });

    let initialized = false;

    socket.on("sync:full", (data: { state: string }) => {
        if (data.state) {
            const uint8 = Uint8Array.from(atob(data.state), (c) => c.charCodeAt(0));
            Y.applyUpdate(ydoc, uint8);
        }
        initialized = true;

        awareness.setLocalStateField("user", { name: user.name, color: user.color });
    });

    socket.on("sync:update", (data: { update: string }) => {
        if (data.update) {
            const uint8 = Uint8Array.from(atob(data.update), (c) => c.charCodeAt(0));
            Y.applyUpdate(ydoc, uint8);
        }
    });

    socket.on("cursor:update", (data: unknown) => {
        awareness._setCursorState(data);
    });

    socket.on("presence:join", (data: { userId: string; name?: string; color?: string }) => {
        awareness._onPresenceJoin(data);
    });

    socket.on("presence:leave", (data: { socketId: string }) => {
        awareness._onPresenceLeave(data);
    });

    ydoc.on("update", (update: Uint8Array, origin: unknown) => {
        if (origin === "remote") return;
        if (!initialized) return;
        const b64 = btoa(String.fromCharCode(...update));

        if (!socket.connected) {
            // Socket offline — buffer the update in IndexedDB and send later
            void enqueueUpdate(docId, b64);
            return;
        }

        socket.emit("sync:update", { docId, update: b64 });
    });

    // On reconnect, replay any updates that were buffered while offline
    socket.on("connect", () => {
        void (async () => {
            const pending = await getPendingUpdates(docId);
            if (pending.length === 0) return;
            for (const b64 of pending) {
                socket.emit("sync:update", { docId, update: b64 });
            }
            await clearPendingUpdates(docId);
        })();
    });

    return {
        doc: ydoc,
        awareness,
        destroy: () => {
            socket.disconnect();
            ydoc.destroy();
        },
    };
}

// Simplified awareness implementation compatible with Tiptap CollaborationCursor
function createSimpleAwareness(ydoc: Y.Doc) {
    const states = new Map<number, Record<string, unknown>>();
    const clientId = ydoc.clientID;
    states.set(clientId, {});

    const handlers = new Map<string, Set<() => void>>();

    function emit(event: string) {
        handlers.get(event)?.forEach((cb) => cb());
    }

    return {
        getStates: () => states,
        setLocalStateField: (key: string, value: unknown) => {
            const current = states.get(clientId) ?? {};
            states.set(clientId, { ...current, [key]: value });
            emit("change");
        },
        on: (event: string, cb: () => void) => {
            if (!handlers.has(event)) handlers.set(event, new Set());
            handlers.get(event)!.add(cb);
        },
        off: (event: string, cb: () => void) => {
            handlers.get(event)?.delete(cb);
        },
        _setCursorState: (data: unknown) => {
            if (data && typeof data === "object" && "socketId" in data) {
                const d = data as { socketId: string; userId: string; color?: string; name?: string };
                const key = d.userId;
                const existing = Array.from(states.entries()).find(([, v]) => v.userId === key);
                const id = existing ? existing[0] : Math.random();
                states.set(id as number, { ...d });
                emit("change");
            }
        },
        _onPresenceJoin: (data: { userId: string; name?: string; color?: string }) => {
            emit("change");
        },
        _onPresenceLeave: (data: { socketId: string }) => {
            emit("change");
        },
    };
}
