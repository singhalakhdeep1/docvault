'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link, Image, Code, Heading1, Heading2, Undo, Redo, Save } from 'lucide-react';

export default function RichTextEditor() {
  const [content, setContent] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const toolbarButtons = [
    { icon: Undo, label: 'Undo', action: () => {} },
    { icon: Redo, label: 'Redo', action: () => {} },
    { divider: true },
    { icon: Heading1, label: 'Heading 1', action: () => {} },
    { icon: Heading2, label: 'Heading 2', action: () => {} },
    { divider: true },
    { icon: Bold, label: 'Bold', action: () => setIsBold(!isBold), active: isBold },
    { icon: Italic, label: 'Italic', action: () => setIsItalic(!isItalic), active: isItalic },
    { icon: Underline, label: 'Underline', action: () => setIsUnderline(!isUnderline), active: isUnderline },
    { divider: true },
    { icon: AlignLeft, label: 'Align Left', action: () => {} },
    { icon: AlignCenter, label: 'Align Center', action: () => {} },
    { icon: AlignRight, label: 'Align Right', action: () => {} },
    { divider: true },
    { icon: List, label: 'List', action: () => {} },
    { icon: Link, label: 'Link', action: () => {} },
    { icon: Image, label: 'Image', action: () => {} },
    { icon: Code, label: 'Code', action: () => {} },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rich Text Editor</h1>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Document
        </Button>
      </div>

      {/* Editor Container */}
      <div className="border rounded-lg bg-background overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-muted p-2 flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((btn, index) => {
            if (btn.divider) {
              return <div key={index} className="w-px h-6 bg-border mx-1" />;
            }
            const Icon = btn.icon;
            return (
              <Button
                key={index}
                variant={btn.active ? 'default' : 'ghost'}
                size="sm"
                onClick={btn.action}
                title={btn.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="min-h-[500px] p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your document here..."
            className="w-full h-full min-h-[450px] resize-none outline-none text-base leading-relaxed"
            style={{
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none'
            }}
          />
        </div>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Word Count</p>
          <p className="text-2xl font-bold">{content.split(/\s+/).filter(w => w).length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Character Count</p>
          <p className="text-2xl font-bold">{content.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Paragraph Count</p>
          <p className="text-2xl font-bold">{content.split(/\n\n+/).filter(p => p).length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Reading Time</p>
          <p className="text-2xl font-bold">
            {Math.ceil(content.split(/\s+/).filter(w => w).length / 200)} min
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Image className="w-5 h-5" />
            <span className="text-sm">Insert Image</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Link className="w-5 h-5" />
            <span className="text-sm">Insert Link</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Code className="w-5 h-5" />
            <span className="text-sm">Code Block</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <List className="w-5 h-5" />
            <span className="text-sm">Table</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
