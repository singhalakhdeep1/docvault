import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";
import { WorkspacesService } from "../workspaces/workspaces.service";
import { SearchService } from "../search/search.service";

@Injectable()
export class DocumentsService {
    constructor(
        @Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient,
        private readonly workspacesService: WorkspacesService,
        private readonly searchService: SearchService,
    ) { }

    async create(userId: string, workspaceId: string, data: { title: string; folderId?: string; emoji?: string }) {
        await this.workspacesService.assertRole(workspaceId, userId, ["OWNER", "EDITOR"]);
        const count = await this.prisma.document.count({ where: { workspaceId, folderId: data.folderId ?? null } });
        const doc = await this.prisma.document.create({
            data: {
                workspaceId,
                folderId: data.folderId,
                authorId: userId,
                title: data.title,
                emoji: data.emoji,
                position: count,
            },
        });
        await this.searchService.indexDocument(doc.id, { title: doc.title, textContent: "", workspaceId }).catch(() => null);
        return doc;
    }

    async findAllInWorkspace(userId: string, workspaceId: string, folderId?: string) {
        await this.workspacesService.assertMember(workspaceId, userId);
        return this.prisma.document.findMany({
            where: {
                workspaceId,
                status: "ACTIVE",
                ...(folderId ? { folderId } : {}),
            },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                emoji: true,
                folderId: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                author: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    async findOne(userId: string, docId: string) {
        const doc = await this.prisma.document.findUnique({
            where: { id: docId },
            include: {
                author: { select: { id: true, fullName: true, avatarUrl: true } },
                attachments: true,
                comments: {
                    include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { comments: true } },
            },
        });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertMember(doc.workspaceId, userId);
        return doc;
    }

    async update(userId: string, docId: string, data: { title?: string; emoji?: string; folderId?: string | null; status?: string }) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertRole(doc.workspaceId, userId, ["OWNER", "EDITOR"]);
        const updated = await this.prisma.document.update({ where: { id: docId }, data: data as any });
        if (data.title !== undefined) {
            await this.searchService.indexDocument(docId, { title: updated.title, textContent: updated.textContent ?? "", workspaceId: doc.workspaceId }).catch(() => null);
        }
        return updated;
    }

    async saveYjsState(docId: string, state: Buffer) {
        return this.prisma.document.update({
            where: { id: docId },
            data: { yjsState: state, updatedAt: new Date() },
        });
    }

    async getYjsState(docId: string): Promise<Buffer | null> {
        const doc = await this.prisma.document.findUnique({
            where: { id: docId },
            select: { yjsState: true },
        });
        return (doc?.yjsState as Buffer | null) ?? null;
    }

    async delete(userId: string, docId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertRole(doc.workspaceId, userId, ["OWNER", "EDITOR"]);
        await this.prisma.document.update({ where: { id: docId }, data: { status: "TRASHED" } });
        await this.searchService.removeDocument(docId).catch(() => null);
        return { trashed: true };
    }

    async restore(userId: string, docId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertRole(doc.workspaceId, userId, ["OWNER", "EDITOR"]);
        return this.prisma.document.update({ where: { id: docId }, data: { status: "ACTIVE" } });
    }

    async listVersions(userId: string, docId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId }, select: { workspaceId: true } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertMember(doc.workspaceId, userId);
        return this.prisma.documentVersion.findMany({
            where: { documentId: docId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }

    async saveVersion(docId: string, yjsState: Buffer, savedBy: string, label?: string) {
        return this.prisma.documentVersion.create({
            data: { documentId: docId, yjsState, savedBy, label },
        });
    }
}
