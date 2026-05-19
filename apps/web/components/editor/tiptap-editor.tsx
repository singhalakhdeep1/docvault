"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { createCollabProvider } from "@/lib/collab/collab-provider";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, CheckSquare, Link2, Code, Undo, Redo } from "lucide-react";
import clsx from "clsx";

interface TiptapEditorProps {
    docId: string;
    token: string;
    userName: string;
    userColor: string;
    onUpdate?: (content: string) => void;
    editable?: boolean;
}

function ToolbarButton({
    onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={clsx(
                "p-1.5 rounded transition-colors",
                active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            )}
        >
            {children}
        </button>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    if (!editor) return null;

    const setLink = () => {
        const prev = editor.getAttributes("link").href;
        const url = window.prompt("URL:", prev ?? "https://");
        if (url === null) return;
        if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10 flex-wrap">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code"><Code className="w-4 h-4" /></ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><ListOrdered className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task list"><CheckSquare className="w-4 h-4" /></ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link"><Link2 className="w-4 h-4" /></ToolbarButton>
        </div>
    );
}

export function TiptapEditor({ docId, token, userName, userColor, onUpdate, editable = true }: TiptapEditorProps) {
    const providerRef = useRef<ReturnType<typeof createCollabProvider> | null>(null);
    const [ydoc] = useState(() => new Y.Doc());

    useEffect(() => {
        if (!docId || !token) return;

        const provider = createCollabProvider(docId, token, { name: userName, color: userColor });
        providerRef.current = provider;

        // Sync ydoc from provider
        provider.doc.on("update", (update: Uint8Array) => {
            Y.applyUpdate(ydoc, update);
        });

        return () => {
            provider.destroy();
            providerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docId, token]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            Placeholder.configure({ placeholder: "Start writing..." }),
            Underline,
            TaskList,
            TaskItem.configure({ nested: true }),
            Link.configure({ openOnClick: false }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider: providerRef.current?.awareness as any,
                user: { name: userName, color: userColor },
            }),
        ],
        editable,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getText());
        },
    });

    return (
        <div className="flex flex-col h-full">
            {editable && editor && <Toolbar editor={editor} />}
            <div className="flex-1 overflow-y-auto px-12 py-8">
                <EditorContent
                    editor={editor}
                    className="max-w-3xl mx-auto text-gray-900 text-[15px] leading-7"
                />
            </div>
        </div>
    );
}
