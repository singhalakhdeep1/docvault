import apiClient from "../api-client";

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

export async function register(data: { fullName: string; email: string; password: string }) {
    const res = await apiClient.post<{ user: AuthUser; token: string }>("/v1/auth/register", data);
    return res.data;
}

export async function login(data: { email: string; password: string }) {
    const res = await apiClient.post<{ user: AuthUser; token: string }>("/v1/auth/login", data);
    return res.data;
}

export async function getMe() {
    const res = await apiClient.get<AuthUser>("/v1/auth/me");
    return res.data;
}

export async function updateProfile(data: { fullName?: string; avatarUrl?: string }) {
    const res = await apiClient.patch<AuthUser>("/v1/auth/me", data);
    return res.data;
}
