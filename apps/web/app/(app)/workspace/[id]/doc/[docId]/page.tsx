"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocument, updateDocument, trashDocument } from "@/lib/api/documents";
import { listComments, addComment, resolveComment } from "@/lib/api/comments";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { useAuth } from "@/lib/providers/auth-provider";
import { format } from "date-fns";
import { Trash2, MessageSquare, X, CheckCircle, Send, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const COLORS = ["#e03131", "#2f9e44", "#1971c2", "#e8590c", "#6741d9", "#099268"];

export default function DocumentPage() {
    const { id: workspaceId, docId } = useParams<{ id: string; docId: string }>();
    const { user, token } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState("");

    const { data: doc, isLoading } = useQuery({
        queryKey: ["document", docId],
        queryFn: () => getDocument(docId),
    });

    const { data: comments = [] } = useQuery({
        queryKey: ["comments", docId],
        queryFn: () => listComments(docId),
        enabled: showComments,
    });

    const titleMutation = useMutation({
        mutationFn: (title: string) => updateDocument(docId, { title }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document", docId] }),
    });

    const trashMutation = useMutation({
        mutationFn: () => trashDocument(docId),
        onSuccess: () => router.push(`/workspace/${workspaceId}`),
    });

    const addCommentMutation = useMutation({
        mutationFn: (content: string) => addComment(docId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", docId] });
            setComment("");
        },
    });

    const resolveCommentMutation = useMutation({
        mutationFn: (commentId: string) => resolveComment(docId, commentId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", docId] }),
    });

    const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    if (isLoading) {
        return (
            <div className="flex h-screen bg-white">
                <WorkspaceSidebar activeWorkspaceId={workspaceId} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            <WorkspaceSidebar activeWorkspaceId={workspaceId} />

            <div className="flex flex-col flex-1 min-w-0">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Link href={`/workspace/${workspaceId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <input
                            type="text"
                            defaultValue={doc?.title ?? "Untitled"}
                            onBlur={(e) => {
                                if (e.target.value !== doc?.title) titleMutation.mutate(e.target.value);
                            }}
                            className="text-lg font-semibold text-gray-900 bg-transparent outline-none border-none focus:ring-0 min-w-0"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Comments
                        </button>
                        <button
                            onClick={() => { if (confirm("Move to trash?")) trashMutation.mutate(); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Trash document"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Editor area */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1">
                        {token && user && (
                            <TiptapEditor
                                docId={docId}
                                token={token}
                                userName={user.fullName}
                                userColor={userColor}
                            />
                        )}
                    </div>

                    {/* Comments panel */}
                    {showComments && (
                        <div className="w-80 border-l border-gray-100 flex flex-col bg-gray-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                                <span className="font-medium text-gray-900">Comments</span>
                                <button onClick={() => setShowComments(false)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {comments.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-8">No comments yet</p>
                                )}
                                {comments.map((c: any) => (
                                    <div key={c.id} className={`bg-white rounded-lg p-3 shadow-sm border ${c.resolvedAt ? "opacity-50" : ""}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-700">{c.author?.fullName}</span>
                                            <span className="text-xs text-gray-400">{format(new Date(c.createdAt), "MMM d")}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{c.content}</p>
                                        {!c.resolvedAt && (
                                            <button
                                                onClick={() => resolveCommentMutation.mutate(c.id)}
                                                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2 transition-colors"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 bg-white border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && comment.trim()) addCommentMutation.mutate(comment);
                                        }}
                                    />
                                    <button
                                        onClick={() => comment.trim() && addCommentMutation.mutate(comment)}
                                        disabled={!comment.trim() || addCommentMutation.isPending}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
