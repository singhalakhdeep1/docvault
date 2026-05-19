"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspace } from "@/lib/api/workspaces";
import { listDocuments, createDocument } from "@/lib/api/documents";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import Link from "next/link";
import { FileText, Users, Plus, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function WorkspacePage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: workspace, isLoading: wsLoading } = useQuery({
        queryKey: ["workspace", id],
        queryFn: () => getWorkspace(id),
    });

    const { data: documents = [], isLoading: docsLoading } = useQuery({
        queryKey: ["documents", id],
        queryFn: () => listDocuments(id),
    });

    const createDocMutation = useMutation({
        mutationFn: () => createDocument(id, { title: "Untitled Document" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", id] }),
    });

    if (wsLoading) {
        return (
            <div className="flex h-screen bg-white">
                <WorkspaceSidebar activeWorkspaceId={id} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    const recentDocs = [...documents].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);

    return (
        <div className="flex h-screen bg-white">
            <WorkspaceSidebar activeWorkspaceId={id} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{workspace?.name}</h1>
                            {workspace?.description && <p className="text-gray-500 mt-1">{workspace.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/workspace/${id}/settings`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                {workspace?.members?.length ?? 0} members
                            </Link>
                            <button
                                onClick={() => createDocMutation.mutate()}
                                disabled={createDocMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {createDocMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                New doc
                            </button>
                        </div>
                    </div>

                    {/* Recent docs */}
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Documents</h2>

                    {docsLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
                        </div>
                    ) : recentDocs.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No documents yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {recentDocs.map((doc: any) => (
                                <Link
                                    key={doc.id}
                                    href={`/workspace/${id}/doc/${doc.id}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <span className="text-lg">{doc.emoji ?? "📄"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {doc.title || "Untitled"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {doc.author?.fullName} · {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
