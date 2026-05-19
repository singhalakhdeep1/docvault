import { Injectable, Inject } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";

@Injectable()
export class ActivityService {
    constructor(@Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient) { }

    async log(data: { workspaceId?: string; documentId?: string; userId: string; type: string; meta?: Record<string, unknown> }) {
        return this.prisma.activity
            .create({ data: { ...data, meta: (data.meta ?? {}) as Prisma.InputJsonValue } })
            .catch(() => null);
    }

    async findForWorkspace(workspaceId: string, limit = 50) {
        return this.prisma.activity.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        });
    }

    async findForDocument(documentId: string, limit = 50) {
        return this.prisma.activity.findMany({
            where: { documentId },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        });
    }
}
