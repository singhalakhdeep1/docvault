"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspace, updateWorkspace, inviteMember, removeMember } from "@/lib/api/workspaces";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import { Loader2, UserPlus, UserX, Save } from "lucide-react";

const ROLE_LABELS: Record<string, string> = { OWNER: "Owner", EDITOR: "Editor", VIEWER: "Viewer" };
const ROLE_COLORS: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    EDITOR: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-100 text-gray-700",
};

export default function WorkspaceSettingsPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: workspace, isLoading } = useQuery({
        queryKey: ["workspace", id],
        queryFn: () => getWorkspace(id),
    });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("VIEWER");
    const [inviteError, setInviteError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: (data: { name?: string; description?: string }) => updateWorkspace(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace", id] }),
    });

    const inviteMutation = useMutation({
        mutationFn: () => inviteMember(id, inviteEmail, inviteRole),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace", id] });
            setInviteEmail("");
            setInviteError(null);
        },
        onError: (err: any) => setInviteError(err.response?.data?.message ?? "Failed to invite"),
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeMember(id, userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace", id] }),
    });

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ name: name || workspace?.name, description: description || workspace?.description });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-white">
                <WorkspaceSidebar activeWorkspaceId={id} />
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white">
            <WorkspaceSidebar activeWorkspaceId={id} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Workspace Settings</h1>

                    {/* General */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">General</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    defaultValue={workspace?.name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    defaultValue={workspace?.description ?? ""}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save changes
                            </button>
                        </form>
                    </section>

                    {/* Members */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Members</h2>

                        {/* Invite form */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Email address"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as "EDITOR" | "VIEWER")}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                            <button
                                onClick={() => inviteEmail && inviteMutation.mutate()}
                                disabled={inviteMutation.isPending || !inviteEmail}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Invite
                            </button>
                        </div>

                        {inviteError && (
                            <p className="text-sm text-red-600 mb-3">{inviteError}</p>
                        )}

                        {/* Member list */}
                        <div className="space-y-2">
                            {workspace?.members?.map((m: any) => (
                                <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                                            {m.user?.fullName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{m.user?.fullName}</p>
                                            <p className="text-xs text-gray-500">{m.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[m.role]}`}>
                                            {ROLE_LABELS[m.role]}
                                        </span>
                                        {m.role !== "OWNER" && (
                                            <button
                                                onClick={() => removeMutation.mutate(m.userId)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                                                title="Remove member"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
