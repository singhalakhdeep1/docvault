import apiClient from "../api-client";

export interface SearchHit {
    id: string;
    title: string;
    textContent?: string;
    workspaceId: string;
}

export async function searchDocuments(q: string, workspaceId: string, limit = 20): Promise<SearchHit[]> {
    const res = await apiClient.get<SearchHit[]>("/v1/search", { params: { q, workspaceId, limit } });
    return res.data;
}
