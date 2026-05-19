import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding DocsVault…");

    // Create demo users
    const alice = await prisma.user.upsert({
        where: { email: "alice@example.com" },
        update: {},
        create: {
            email: "alice@example.com",
            fullName: "Alice Johnson",
            passwordHash: await bcrypt.hash("password123", 12),
        },
    });

    const bob = await prisma.user.upsert({
        where: { email: "bob@example.com" },
        update: {},
        create: {
            email: "bob@example.com",
            fullName: "Bob Smith",
            passwordHash: await bcrypt.hash("password123", 12),
        },
    });

    // Create a workspace
    const ws = await prisma.workspace.upsert({
        where: { slug: "product-team" },
        update: {},
        create: {
            name: "Product Team",
            slug: "product-team",
            description: "Central knowledge base for the product team",
            members: {
                create: [
                    { userId: alice.id, role: "OWNER" },
                    { userId: bob.id, role: "EDITOR" },
                ],
            },
        },
    });

    // Create folders
    const engineering = await prisma.folder.upsert({
        where: { id: "seed-folder-engineering" },
        update: {},
        create: {
            id: "seed-folder-engineering",
            workspaceId: ws.id,
            name: "Engineering",
            emoji: "⚙️",
            position: 0,
        },
    });

    const design = await prisma.folder.upsert({
        where: { id: "seed-folder-design" },
        update: {},
        create: {
            id: "seed-folder-design",
            workspaceId: ws.id,
            name: "Design",
            emoji: "🎨",
            position: 1,
        },
    });

    // Create documents
    await prisma.document.createMany({
        skipDuplicates: true,
        data: [
            {
                id: "seed-doc-architecture",
                workspaceId: ws.id,
                folderId: engineering.id,
                authorId: alice.id,
                title: "System Architecture",
                emoji: "🏗️",
                textContent: "This document describes the overall system architecture.",
                position: 0,
            },
            {
                id: "seed-doc-api",
                workspaceId: ws.id,
                folderId: engineering.id,
                authorId: alice.id,
                title: "API Reference",
                emoji: "📡",
                textContent: "Complete API documentation for the DocsVault backend.",
                position: 1,
            },
            {
                id: "seed-doc-brand",
                workspaceId: ws.id,
                folderId: design.id,
                authorId: bob.id,
                title: "Brand Guidelines",
                emoji: "✨",
                textContent: "Brand colors, typography, and visual identity guidelines.",
                position: 0,
            },
        ],
    });

    console.log("✅ Seed complete!");
    console.log("  alice@example.com / password123 (Owner)");
    console.log("  bob@example.com / password123 (Editor)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
