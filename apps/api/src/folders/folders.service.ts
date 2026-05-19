import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";
import { WorkspacesService } from "../workspaces/workspaces.service";

@Injectable()
export class FoldersService {
    constructor(
        @Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient,
        private readonly workspacesService: WorkspacesService,
    ) { }

    async create(userId: string, workspaceId: string, data: { name: string; parentFolderId?: string; emoji?: string }) {
        await this.workspacesService.assertRole(workspaceId, userId, ["OWNER", "EDITOR"]);
        const count = await this.prisma.folder.count({ where: { workspaceId, parentFolderId: data.parentFolderId ?? null } });
        return this.prisma.folder.create({
            data: {
                workspaceId,
                name: data.name,
                emoji: data.emoji,
                parentFolderId: data.parentFolderId,
                position: count,
            },
        });
    }

    async findAllInWorkspace(userId: string, workspaceId: string) {
        await this.workspacesService.assertMember(workspaceId, userId);
        return this.prisma.folder.findMany({
            where: { workspaceId },
            orderBy: { position: "asc" },
            include: {
                children: { orderBy: { position: "asc" } },
                documents: {
                    where: { status: "ACTIVE" },
                    select: { id: true, title: true, emoji: true, updatedAt: true },
                    orderBy: { position: "asc" },
                },
            },
        });
    }

    async update(userId: string, folderId: string, data: { name?: string; emoji?: string; position?: number }) {
        const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder) throw new NotFoundException("Folder not found");
        await this.workspacesService.assertRole(folder.workspaceId, userId, ["OWNER", "EDITOR"]);
        return this.prisma.folder.update({ where: { id: folderId }, data });
    }

    async delete(userId: string, folderId: string) {
        const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder) throw new NotFoundException("Folder not found");
        await this.workspacesService.assertRole(folder.workspaceId, userId, ["OWNER", "EDITOR"]);
        // Recursively trash documents inside
        await this.prisma.document.updateMany({ where: { folderId }, data: { status: "TRASHED" } });
        await this.prisma.folder.delete({ where: { id: folderId } });
        return { deleted: true };
    }
}
