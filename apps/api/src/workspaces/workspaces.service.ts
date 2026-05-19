import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from "@nestjs/common";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

function uniqueSlug(name: string) {
    return `${slugify(name)}-${Date.now().toString(36)}`;
}

@Injectable()
export class WorkspacesService {
    constructor(@Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient) { }

    async create(userId: string, data: { name: string; description?: string }) {
        const slug = uniqueSlug(data.name);
        return this.prisma.workspace.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                members: {
                    create: { userId, role: "OWNER" },
                },
            },
            include: { members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } } } },
        });
    }

    async findAllForUser(userId: string) {
        const members = await this.prisma.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        _count: { select: { documents: true, members: true, folders: true } },
                    },
                },
            },
            orderBy: { joinedAt: "asc" },
        });
        return members.map((m) => ({ ...m.workspace, role: m.role }));
    }

    async findOne(workspaceId: string, userId: string) {
        await this.assertMember(workspaceId, userId);
        const ws = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
                    },
                },
                folders: { orderBy: { position: "asc" }, include: { children: true, documents: { select: { id: true, title: true, emoji: true, status: true, updatedAt: true }, where: { status: "ACTIVE" } } } },
                _count: { select: { documents: true } },
            },
        });
        if (!ws) throw new NotFoundException("Workspace not found");
        return ws;
    }

    async update(workspaceId: string, userId: string, data: { name?: string; description?: string; logoUrl?: string }) {
        await this.assertRole(workspaceId, userId, ["OWNER"]);
        return this.prisma.workspace.update({ where: { id: workspaceId }, data });
    }

    async delete(workspaceId: string, userId: string) {
        await this.assertRole(workspaceId, userId, ["OWNER"]);
        await this.prisma.workspace.delete({ where: { id: workspaceId } });
        return { deleted: true };
    }

    async inviteMember(workspaceId: string, inviterId: string, email: string, role: "EDITOR" | "VIEWER") {
        await this.assertRole(workspaceId, inviterId, ["OWNER", "EDITOR"]);
        const target = await this.prisma.user.findUnique({ where: { email } });
        if (!target) throw new NotFoundException("User with this email not found");

        const existing = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId: target.id } },
        });
        if (existing) throw new ConflictException("User is already a member");

        return this.prisma.workspaceMember.create({
            data: { workspaceId, userId: target.id, role, invitedBy: inviterId },
            include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
        });
    }

    async removeMember(workspaceId: string, actorId: string, targetUserId: string) {
        await this.assertRole(workspaceId, actorId, ["OWNER"]);
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
        });
        if (!member) throw new NotFoundException("Member not found");
        if (member.role === "OWNER") throw new ForbiddenException("Cannot remove the workspace owner");

        await this.prisma.workspaceMember.delete({
            where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
        });
        return { removed: true };
    }

    async updateMemberRole(workspaceId: string, actorId: string, targetUserId: string, role: "EDITOR" | "VIEWER") {
        await this.assertRole(workspaceId, actorId, ["OWNER"]);
        return this.prisma.workspaceMember.update({
            where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
            data: { role },
        });
    }

    async assertMember(workspaceId: string, userId: string) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } },
        });
        if (!member) throw new ForbiddenException("Not a member of this workspace");
        return member;
    }

    async assertRole(workspaceId: string, userId: string, roles: string[]) {
        const member = await this.assertMember(workspaceId, userId);
        if (!roles.includes(member.role)) {
            throw new ForbiddenException(`Required role: ${roles.join(" or ")}`);
        }
        return member;
    }
}
