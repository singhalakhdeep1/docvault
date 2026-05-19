"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchDocuments } from "@/lib/api/search";
import { listWorkspaces } from "@/lib/api/workspaces";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import Link from "next/link";
import { Search, FileText, Loader2 } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [workspaceId, setWorkspaceId] = useState("");

    const { data: workspaces = [] } = useQuery({
        queryKey: ["workspaces"],
        queryFn: listWorkspaces,
    });

    const { data: results = [], isLoading, isFetching } = useQuery({
        queryKey: ["search", query, workspaceId],
        queryFn: () => searchDocuments(query, workspaceId),
        enabled: query.length >= 2 && !!workspaceId,
    });

    return (
        <div className="flex h-screen bg-white">
            <WorkspaceSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Documents</h1>

                    <div className="flex gap-3 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search documents..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={workspaceId}
                            onChange={(e) => setWorkspaceId(e.target.value)}
                            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                        >
                            <option value="">Select workspace</option>
                            {workspaces.map((ws: any) => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    </div>

                    {isFetching && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    )}

                    {!isFetching && query.length >= 2 && workspaceId && results.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No documents found for &ldquo;{query}&rdquo;</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {results.map((hit: any) => (
                            <Link
                                key={hit.id}
                                href={`/workspace/${hit.workspaceId}/doc/${hit.id}`}
                                className="flex items-start gap-3 px-4 py-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                            >
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0 group-hover:text-blue-500 transition-colors" />
                                <div>
                                    <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{hit.title}</p>
                                    {hit.textContent && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{hit.textContent}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {!workspaceId && (
                        <p className="text-center text-sm text-gray-400 mt-12">Select a workspace to search its documents</p>
                    )}
                </div>
            </main>
        </div>
    );
}
