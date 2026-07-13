'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, FileText, X, CheckCircle, AlertCircle, Folder } from 'lucide-react';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export default function FileUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      status: 'uploading',
      progress: 0
    }));
    setFiles([...files, ...uploadFiles]);

    // Simulate upload progress
    uploadFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f
        ));
      }
    }, 500);
  };

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload />
          File Upload
        </h1>
        <Button>
          <Folder className="w-4 h-4 mr-2" />
          Browse Folders
        </Button>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Drag and drop files here</h3>
        <p className="text-muted-foreground mb-4">or click to browse</p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: PDF, DOCX, TXT, JPG, PNG, MP4, MP3
        </p>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="border rounded-lg bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upload Queue ({files.length})</h3>
            <Button variant="outline" size="sm" onClick={() => setFiles([])}>
              Clear All
            </Button>
          </div>
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-4 p-3 border rounded">
                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.status}</span>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{file.progress}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Files</p>
          <p className="text-2xl font-bold">{files.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-500">
            {files.filter(f => f.status === 'completed').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Uploading</p>
          <p className="text-2xl font-bold text-blue-500">
            {files.filter(f => f.status === 'uploading').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold">
            {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
      </div>

      {/* Upload Options */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Upload Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-ocr" className="w-4 h-4" />
            <label htmlFor="auto-ocr" className="text-sm">Auto-OCR on upload</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-tag" className="w-4 h-4" />
            <label htmlFor="auto-tag" className="text-sm">Auto-tag documents</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notify" className="w-4 h-4" />
            <label htmlFor="notify" className="text-sm">Notify on completion</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="version" className="w-4 h-4" />
            <label htmlFor="version" className="text-sm">Create new version if exists</label>
          </div>
        </div>
      </div>
    </div>
  );
}
