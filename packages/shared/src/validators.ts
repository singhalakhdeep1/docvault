import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const createWorkspaceSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
});

export const createFolderSchema = z.object({
    name: z.string().min(1).max(100),
    parentFolderId: z.string().cuid().optional(),
});

export const createDocumentSchema = z.object({
    title: z.string().min(1).max(200),
    folderId: z.string().cuid().optional(),
    emoji: z.string().max(10).optional(),
});

export const inviteMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(["EDITOR", "VIEWER"]),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type CreateDocumentDto = z.infer<typeof createDocumentSchema>;
export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
