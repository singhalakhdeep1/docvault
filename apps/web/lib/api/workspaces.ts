import apiClient from "../api-client";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    role?: string;
    createdAt: string;
    updatedAt: string;
    _count?: { documents: number; members: number; folders: number };
}

export interface WorkspaceMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    user: { id: string; fullName: string; email: string; avatarUrl?: string };
}

export async function listWorkspaces(): Promise<Workspace[]> {
    const res = await apiClient.get<Workspace[]>("/v1/workspaces");
    return res.data;
}

export async function createWorkspace(data: { name: string; description?: string }): Promise<Workspace> {
    const res = await apiClient.post<Workspace>("/v1/workspaces", data);
    return res.data;
}

export async function getWorkspace(id: string) {
    const res = await apiClient.get(`/v1/workspaces/${id}`);
    return res.data;
}

export async function updateWorkspace(id: string, data: Partial<Workspace>) {
    const res = await apiClient.patch(`/v1/workspaces/${id}`, data);
    return res.data;
}

export async function deleteWorkspace(id: string) {
    const res = await apiClient.delete(`/v1/workspaces/${id}`);
    return res.data;
}

export async function inviteMember(id: string, email: string, role: "EDITOR" | "VIEWER") {
    const res = await apiClient.post(`/v1/workspaces/${id}/members`, { email, role });
    return res.data;
}

export async function removeMember(id: string, userId: string) {
    const res = await apiClient.delete(`/v1/workspaces/${id}/members/${userId}`);
    return res.data;
}
