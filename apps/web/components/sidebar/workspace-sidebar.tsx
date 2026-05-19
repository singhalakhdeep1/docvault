"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listWorkspaces, createWorkspace } from "@/lib/api/workspaces";
import { listFolders, createFolder } from "@/lib/api/folders";
import { createDocument } from "@/lib/api/documents";
import { useAuth } from "@/lib/providers/auth-provider";
import {
    FileText, FolderOpen, Folder, Plus, LogOut, Settings, Search,
    ChevronDown, ChevronRight, Home, Loader2, User
} from "lucide-react";
import clsx from "clsx";

interface FolderItemProps {
    folder: any;
    workspaceId: string;
    depth?: number;
}

function FolderItem({ folder, workspaceId, depth = 0 }: FolderItemProps) {
    const [open, setOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className={clsx(
                    "w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                    { "pl-4": depth > 0 }
                )}
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
            >
                {open ? <ChevronDown className="w-3 h-3 shrink-0 text-gray-400" /> : <ChevronRight className="w-3 h-3 shrink-0 text-gray-400" />}
                <span className="mr-1">{folder.emoji ?? "📁"}</span>
                <span className="truncate font-medium">{folder.name}</span>
            </button>

            {open && (
                <div>
                    {folder.documents?.map((doc: any) => (
                        <Link
                            key={doc.id}
                            href={`/workspace/${workspaceId}/doc/${doc.id}`}
                            className={clsx(
                                "flex items-center gap-2 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors",
                                pathname === `/workspace/${workspaceId}/doc/${doc.id}` && "bg-blue-50 text-blue-700 font-medium"
                            )}
                            style={{ paddingLeft: `${(depth + 2) * 12}px` }}
                        >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{doc.emoji} {doc.title}</span>
                        </Link>
                    ))}
                    {folder.children?.map((child: any) => (
                        <FolderItem key={child.id} folder={child} workspaceId={workspaceId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function WorkspaceSidebar({ activeWorkspaceId }: { activeWorkspaceId?: string }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { data: workspaces = [], isLoading: wsLoading } = useQuery({
        queryKey: ["workspaces"],
        queryFn: listWorkspaces,
    });

    const { data: folders = [] } = useQuery({
        queryKey: ["folders", activeWorkspaceId],
        queryFn: () => listFolders(activeWorkspaceId!),
        enabled: !!activeWorkspaceId,
    });

    const createWsMutation = useMutation({
        mutationFn: createWorkspace,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
    });

    const createFolderMutation = useMutation({
        mutationFn: ({ name }: { name: string }) => createFolder(activeWorkspaceId!, { name }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders", activeWorkspaceId] }),
    });

    const createDocMutation = useMutation({
        mutationFn: () => createDocument(activeWorkspaceId!, { title: "Untitled" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", activeWorkspaceId] }),
    });

    const handleCreateWorkspace = () => {
        const name = prompt("Workspace name:");
        if (name?.trim()) createWsMutation.mutate({ name });
    };

    const handleCreateFolder = () => {
        const name = prompt("Folder name:");
        if (name?.trim()) createFolderMutation.mutate({ name });
    };

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">DocsVault</span>
                </div>
                <Link href="/search" className={clsx("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-200 transition-colors", pathname === "/search" && "bg-gray-200")}>
                    <Search className="w-4 h-4" />
                    Search
                </Link>
                <Link href="/dashboard" className={clsx("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-200 transition-colors", pathname === "/dashboard" && "bg-gray-200")}>
                    <Home className="w-4 h-4" />
                    Dashboard
                </Link>
            </div>

            {/* Workspaces */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Workspaces</span>
                    <button onClick={handleCreateWorkspace} className="p-0.5 rounded hover:bg-gray-200 transition-colors" title="New workspace">
                        <Plus className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                </div>

                {wsLoading && <div className="px-2 py-1"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}

                {workspaces.map((ws: any) => (
                    <div key={ws.id} className="mb-2">
                        <Link
                            href={`/workspace/${ws.id}`}
                            className={clsx(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                                activeWorkspaceId === ws.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-xs">{ws.name[0]}</div>
                            <span className="truncate">{ws.name}</span>
                        </Link>

                        {activeWorkspaceId === ws.id && (
                            <div className="mt-1 ml-1">
                                {/* Folder tree */}
                                {folders.filter((f: any) => !f.parentFolderId).map((folder: any) => (
                                    <FolderItem key={folder.id} folder={folder} workspaceId={ws.id} />
                                ))}

                                {/* Actions */}
                                <div className="flex gap-1 mt-1 px-2">
                                    <button
                                        onClick={handleCreateFolder}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <Folder className="w-3 h-3" /> Folder
                                    </button>
                                    <button
                                        onClick={() => createDocMutation.mutate()}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <FileText className="w-3 h-3" /> Doc
                                    </button>
                                    <Link
                                        href={`/workspace/${ws.id}/settings`}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <Settings className="w-3 h-3" /> Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Sign out">
                        <LogOut className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
