"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/auth-provider";
import { listWorkspaces } from "@/lib/api/workspaces";
import Link from "next/link";
import { FileText, Users, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: workspaces = [], isLoading } = useQuery({
        queryKey: ["workspaces"],
        queryFn: listWorkspaces,
    });

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Good morning, {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mb-8">Here&apos;s an overview of your workspaces</p>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : workspaces.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No workspaces yet</p>
                    <p className="text-sm mt-1">Create a workspace from the sidebar to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((ws: any) => (
                        <Link
                            key={ws.id}
                            href={`/workspace/${ws.id}`}
                            className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg font-bold text-blue-600">
                                    {ws.name[0]}
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors mt-1" />
                            </div>
                            <h2 className="font-semibold text-gray-900 truncate">{ws.name}</h2>
                            {ws.description && <p className="text-sm text-gray-500 mt-1 truncate">{ws.description}</p>}
                            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {ws._count?.documents ?? 0} docs</span>
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ws._count?.members ?? 0} members</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
