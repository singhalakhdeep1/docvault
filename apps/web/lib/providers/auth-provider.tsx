"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, getMe, login as apiLogin, register as apiRegister } from "../api/auth";
import apiClient from "../api-client";

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("docsvault_token");
        if (savedToken) {
            setToken(savedToken);
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
            getMe()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem("docsvault_token");
                    localStorage.removeItem("docsvault_user");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiLogin({ email, password });
        localStorage.setItem("docsvault_token", data.token);
        localStorage.setItem("docsvault_user", JSON.stringify(data.user));
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (fullName: string, email: string, password: string) => {
        const data = await apiRegister({ fullName, email, password });
        localStorage.setItem("docsvault_token", data.token);
        localStorage.setItem("docsvault_user", JSON.stringify(data.user));
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("docsvault_token");
        localStorage.removeItem("docsvault_user");
        delete apiClient.defaults.headers.common["Authorization"];
        setToken(null);
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
