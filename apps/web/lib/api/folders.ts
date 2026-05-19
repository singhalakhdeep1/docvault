import apiClient from "../api-client";

export interface Folder {
    id: string;
    workspaceId: string;
    parentFolderId?: string;
    name: string;
    emoji?: string;
    position: number;
    children?: Folder[];
    documents?: { id: string; title: string; emoji?: string }[];
}

export async function listFolders(workspaceId: string): Promise<Folder[]> {
    const res = await apiClient.get<Folder[]>("/v1/folders", { params: { workspaceId } });
    return res.data;
}

export async function createFolder(workspaceId: string, data: { name: string; emoji?: string; parentFolderId?: string }): Promise<Folder> {
    const res = await apiClient.post<Folder>("/v1/folders", data, { params: { workspaceId } });
    return res.data;
}

export async function updateFolder(id: string, data: Partial<Folder>): Promise<Folder> {
    const res = await apiClient.patch(`/v1/folders/${id}`, data);
    return res.data;
}

export async function deleteFolder(id: string) {
    const res = await apiClient.delete(`/v1/folders/${id}`);
    return res.data;
}
