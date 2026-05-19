import apiClient from "../api-client";

export async function listComments(docId: string) {
    const res = await apiClient.get(`/v1/documents/${docId}/comments`);
    return res.data;
}

export async function addComment(docId: string, content: string) {
    const res = await apiClient.post(`/v1/documents/${docId}/comments`, { content });
    return res.data;
}

export async function resolveComment(docId: string, commentId: string) {
    const res = await apiClient.patch(`/v1/documents/${docId}/comments/${commentId}/resolve`);
    return res.data;
}

export async function deleteComment(docId: string, commentId: string) {
    const res = await apiClient.delete(`/v1/documents/${docId}/comments/${commentId}`);
    return res.data;
}
