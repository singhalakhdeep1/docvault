'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Share2, Link, Mail, Copy, Users, Clock, Shield, Download } from 'lucide-react';

interface SharedDocument {
  id: string;
  documentName: string;
  sharedBy: string;
  sharedWith: string[];
  permission: 'view' | 'edit' | 'comment';
  sharedAt: Date;
  expiresAt?: Date;
  accessCount: number;
}

export default function DocumentSharing() {
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([
    {
      id: '1',
      documentName: 'Q4 Financial Report',
      sharedBy: 'Alice Johnson',
      sharedWith: ['bob@example.com', 'carol@example.com'],
      permission: 'view',
      sharedAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-02-15'),
      accessCount: 25
    },
    {
      id: '2',
      documentName: 'Project Proposal',
      sharedBy: 'Bob Smith',
      sharedWith: ['alice@example.com'],
      permission: 'edit',
      sharedAt: new Date('2024-01-10'),
      accessCount: 12
    }
  ]);

  const [shareLink, setShareLink] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<SharedDocument | null>(null);

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'view': return 'bg-blue-500';
      case 'edit': return 'bg-green-500';
      case 'comment': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Share2 />
          Document Sharing
        </h1>
        <Button>
          <Share2 className="w-4 h-4 mr-2" />
          Share Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Shared Documents</p>
          <p className="text-2xl font-bold">{sharedDocs.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Accesses</p>
          <p className="text-2xl font-bold">
            {sharedDocs.reduce((sum, d) => sum + d.accessCount, 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Shares</p>
          <p className="text-2xl font-bold text-green-500">
            {sharedDocs.filter(d => !d.expiresAt || d.expiresAt > new Date()).length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">People Shared With</p>
          <p className="text-2xl font-bold">
            {sharedDocs.reduce((sum, d) => sum + d.sharedWith.length, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Shared Documents List */}
        <div className="col-span-1 border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Shared Documents</h2>
          <div className="space-y-3">
            {sharedDocs.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getPermissionColor(doc.permission)}`}>
                    {doc.permission}
                  </span>
                </div>
                <p className="font-medium text-sm">{doc.documentName}</p>
                <p className="text-xs text-muted-foreground">{doc.sharedWith.length} people</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sharing Detail */}
        <div className="col-span-2 border rounded-lg bg-background p-4">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-xl">{selectedDoc.documentName}</h2>
                  <p className="text-sm text-muted-foreground">Shared by {selectedDoc.sharedBy}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Permissions
                  </Button>
                </div>
              </div>

              {/* Share Link */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Share Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://docsvault.app/share/${selectedDoc.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded bg-muted"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Shared With */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Shared With</h3>
                <div className="space-y-2">
                  {selectedDoc.sharedWith.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {email[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{email}</span>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add People */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Add People</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <select className="px-3 py-2 border rounded">
                    <option value="view">Can View</option>
                    <option value="edit">Can Edit</option>
                    <option value="comment">Can Comment</option>
                  </select>
                  <Button>
                    <Mail className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              {/* Document Info */}
              <div className="pt-6 border-t grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Shared On</p>
                  <p className="font-medium">{selectedDoc.sharedAt.toLocaleDateString()}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Expires</p>
                  <p className="font-medium">
                    {selectedDoc.expiresAt ? selectedDoc.expiresAt.toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Access Count</p>
                  <p className="font-medium">{selectedDoc.accessCount}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Share2 className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a shared document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Share Options */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Quick Share Options</h3>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Link className="w-5 h-5" />
            <span className="text-sm">Copy Link</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Mail className="w-5 h-5" />
            <span className="text-sm">Email</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Team</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Set Expiry</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
