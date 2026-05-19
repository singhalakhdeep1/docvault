import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as Y from "yjs";
import { DocumentsService } from "../documents/documents.service";
import { AuthService } from "../auth/auth.service";

interface CollabClient {
    userId: string;
    email: string;
    fullName?: string;
    color: string;
    docId: string;
}

const CURSOR_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
];

function randomColor() {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

@WebSocketGateway({
    cors: { origin: "*", credentials: false },
    namespace: "/collab",
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    // In-memory Yjs docs per documentId
    private yjsDocs = new Map<string, Y.Doc>();
    // Connected clients metadata
    private clients = new Map<string, CollabClient>();
    // socket.id → docId mapping
    private socketDocMap = new Map<string, string>();

    constructor(
        private readonly documentsService: DocumentsService,
        private readonly authService: AuthService,
    ) { }

    async handleConnection(socket: Socket) {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) {
            socket.disconnect();
            return;
        }

        try {
            const payload = this.authService.verifyToken(token);
            const docId = socket.handshake.query?.docId as string;
            if (!docId) { socket.disconnect(); return; }

            const client: CollabClient = {
                userId: payload.sub,
                email: payload.email,
                color: randomColor(),
                docId,
            };

            this.clients.set(socket.id, client);
            this.socketDocMap.set(socket.id, docId);
            await socket.join(`doc:${docId}`);

            // Load or create Yjs doc
            let ydoc = this.yjsDocs.get(docId);
            if (!ydoc) {
                ydoc = new Y.Doc();
                // Load persisted state if available
                const persistedState = await this.documentsService.getYjsState(docId).catch(() => null);
                if (persistedState && persistedState.length > 0) {
                    Y.applyUpdate(ydoc, new Uint8Array(persistedState));
                }
                this.yjsDocs.set(docId, ydoc);
            }

            // Send initial doc state to new client
            const state = Y.encodeStateAsUpdate(ydoc);
            socket.emit("sync:full", { update: Buffer.from(state).toString("base64") });

            // Notify others of new presence
            socket.to(`doc:${docId}`).emit("presence:join", {
                socketId: socket.id,
                userId: client.userId,
                email: client.email,
                color: client.color,
            });

            // Send current presence list to new client
            const presentClients: CollabClient[] = [];
            for (const [sid, c] of this.clients) {
                if (c.docId === docId && sid !== socket.id) presentClients.push(c);
            }
            socket.emit("presence:list", presentClients);
        } catch {
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket) {
        const client = this.clients.get(socket.id);
        if (client) {
            socket.to(`doc:${client.docId}`).emit("presence:leave", { socketId: socket.id });
            this.clients.delete(socket.id);
        }
        this.socketDocMap.delete(socket.id);
    }

    @SubscribeMessage("sync:update")
    async handleUpdate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { update: string },
    ) {
        const client = this.clients.get(socket.id);
        if (!client) return;

        const ydoc = this.yjsDocs.get(client.docId);
        if (!ydoc) return;

        const updateBytes = Buffer.from(payload.update, "base64");
        Y.applyUpdate(ydoc, new Uint8Array(updateBytes));

        // Broadcast update to all other clients in doc room
        socket.to(`doc:${client.docId}`).emit("sync:update", { update: payload.update });

        // Persist to DB every 30 updates (debounce in production via Redis)
        const state = Y.encodeStateAsUpdate(ydoc);
        await this.documentsService.saveYjsState(client.docId, Buffer.from(state)).catch(() => null);
    }

    @SubscribeMessage("cursor:update")
    handleCursor(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { anchor: unknown; head: unknown },
    ) {
        const client = this.clients.get(socket.id);
        if (!client) return;

        socket.to(`doc:${client.docId}`).emit("cursor:update", {
            socketId: socket.id,
            userId: client.userId,
            color: client.color,
            email: client.email,
            anchor: payload.anchor,
            head: payload.head,
        });
    }

    @SubscribeMessage("awareness:update")
    handleAwareness(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: unknown,
    ) {
        const client = this.clients.get(socket.id);
        if (!client) return;
        socket.to(`doc:${client.docId}`).emit("awareness:update", {
            socketId: socket.id,
            ...((payload as Record<string, unknown>) ?? {}),
        });
    }
}
