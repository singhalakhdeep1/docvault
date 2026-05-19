import apiClient from "../api-client";

export interface Document {
    id: string;
    workspaceId: string;
    folderId?: string;
    title: string;
    emoji?: string;
    status: "ACTIVE" | "ARCHIVED" | "TRASHED";
    createdAt: string;
    updatedAt: string;
    author?: { id: string; fullName: string; avatarUrl?: string };
}

export async function listDocuments(workspaceId: string, folderId?: string): Promise<Document[]> {
    const res = await apiClient.get<Document[]>("/v1/documents", {
        params: { workspaceId, folderId },
    });
    return res.data;
}

export async function createDocument(workspaceId: string, data: { title: string; folderId?: string; emoji?: string }): Promise<Document> {
    const res = await apiClient.post<Document>("/v1/documents", data, { params: { workspaceId } });
    return res.data;
}

export async function getDocument(id: string): Promise<Document & { attachments: any[]; comments: any[] }> {
    const res = await apiClient.get(`/v1/documents/${id}`);
    return res.data;
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const res = await apiClient.patch(`/v1/documents/${id}`, data);
    return res.data;
}

export async function trashDocument(id: string) {
    const res = await apiClient.delete(`/v1/documents/${id}`);
    return res.data;
}

export async function restoreDocument(id: string) {
    const res = await apiClient.post(`/v1/documents/${id}/restore`);
    return res.data;
}

export async function listVersions(id: string) {
    const res = await apiClient.get(`/v1/documents/${id}/versions`);
    return res.data;
}
