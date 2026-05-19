import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";
import { WorkspacesService } from "../workspaces/workspaces.service";

@Injectable()
export class CommentsService {
    constructor(
        @Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient,
        private readonly workspacesService: WorkspacesService,
    ) { }

    async create(userId: string, docId: string, content: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId }, select: { workspaceId: true } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertMember(doc.workspaceId, userId);
        return this.prisma.comment.create({
            data: { documentId: docId, authorId: userId, content },
            include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
        });
    }

    async findForDocument(userId: string, docId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId }, select: { workspaceId: true } });
        if (!doc) throw new NotFoundException("Document not found");
        await this.workspacesService.assertMember(doc.workspaceId, userId);
        return this.prisma.comment.findMany({
            where: { documentId: docId },
            include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
            orderBy: { createdAt: "asc" },
        });
    }

    async resolve(userId: string, commentId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
            include: { document: { select: { workspaceId: true } } },
        });
        if (!comment) throw new NotFoundException("Comment not found");
        await this.workspacesService.assertRole(comment.document.workspaceId, userId, ["OWNER", "EDITOR"]);
        return this.prisma.comment.update({ where: { id: commentId }, data: { resolvedAt: new Date() } });
    }

    async delete(userId: string, commentId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
            include: { document: { select: { workspaceId: true } } },
        });
        if (!comment) throw new NotFoundException("Comment not found");
        // Only author or workspace owner can delete
        if (comment.authorId !== userId) {
            await this.workspacesService.assertRole(comment.document.workspaceId, userId, ["OWNER"]);
        }
        await this.prisma.comment.delete({ where: { id: commentId } });
        return { deleted: true };
    }
}
