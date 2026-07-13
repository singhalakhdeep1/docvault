'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { GitBranch, Clock, User, FileText, Download, Restore, Eye, MoreHorizontal } from 'lucide-react';

interface DocumentVersion {
  id: string;
  version: string;
  fileName: string;
  author: string;
  createdAt: Date;
  changes: string;
  fileSize: number;
  isCurrent: boolean;
}

export default function DocumentVersioning() {
  const [versions, setVersions] = useState<DocumentVersion[]>([
    {
      id: '1',
      version: '1.0.0',
      fileName: 'contract.pdf',
      author: 'Alice Johnson',
      createdAt: new Date('2024-01-10'),
      changes: 'Initial version',
      fileSize: 245000,
      isCurrent: false
    },
    {
      id: '2',
      version: '1.1.0',
      fileName: 'contract.pdf',
      author: 'Bob Smith',
      createdAt: new Date('2024-01-15'),
      changes: 'Updated clause 3.2',
      fileSize: 248000,
      isCurrent: false
    },
    {
      id: '3',
      version: '1.2.0',
      fileName: 'contract.pdf',
      author: 'Carol Davis',
      createdAt: new Date('2024-01-20'),
      changes: 'Added appendix A',
      fileSize: 265000,
      isCurrent: true
    }
  ]);

  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(versions[2]);

  const handleRestore = (versionId: string) => {
    setVersions(versions.map(v => ({
      ...v,
      isCurrent: v.id === versionId
    })));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch />
          Document Versioning
        </h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          New Version
        </Button>
      </div>

      {/* Version Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Versions</p>
          <p className="text-2xl font-bold">{versions.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Current Version</p>
          <p className="text-2xl font-bold text-blue-500">{versions.find(v => v.isCurrent)?.version}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold">
            {formatFileSize(versions.reduce((sum, v) => sum + v.fileSize, 0))}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Contributors</p>
          <p className="text-2xl font-bold">
            {new Set(versions.map(v => v.author)).size}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Version Timeline */}
        <div className="col-span-1 border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Version History</h2>
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`relative p-3 rounded cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                {index < versions.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-muted" />
                )}
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${version.isCurrent ? 'bg-blue-500' : 'bg-muted'}`} />
                  <span className="font-medium text-sm">{version.version}</span>
                  {version.isCurrent && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Current</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{version.changes}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{version.author}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{version.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Detail */}
        <div className="col-span-2 border rounded-lg bg-background p-4">
          {selectedVersion ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-xl">{selectedVersion.fileName}</h2>
                  <p className="text-sm text-muted-foreground">Version {selectedVersion.version}</p>
                </div>
                <div className="flex gap-2">
                  {!selectedVersion.isCurrent && (
                    <Button onClick={() => handleRestore(selectedVersion.id)}>
                      <Restore className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  )}
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Author</p>
                    <p className="font-medium">{selectedVersion.author}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{selectedVersion.createdAt.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">File Size</p>
                    <p className="font-medium">{formatFileSize(selectedVersion.fileSize)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Changes Summary</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{selectedVersion.changes}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">File Comparison</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded">+ Added 3 lines</span>
                        <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded">- Removed 1 line</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Compared to previous version {selectedVersion.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <GitBranch className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a version to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
