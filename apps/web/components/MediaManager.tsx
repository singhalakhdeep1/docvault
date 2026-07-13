'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Image, Video, Music, FileText, Upload, Download, Share2, Trash2, Search, Filter } from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  uploadedAt: Date;
  url: string;
  thumbnail?: string;
}

export default function MediaManager() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'product_image.jpg',
      type: 'image',
      size: 2450000,
      uploadedAt: new Date('2024-01-15'),
      url: '/media/product_image.jpg',
      thumbnail: '/thumbnails/product_image.jpg'
    },
    {
      id: '2',
      name: 'demo_video.mp4',
      type: 'video',
      size: 45600000,
      uploadedAt: new Date('2024-01-10'),
      url: '/media/demo_video.mp4'
    },
    {
      id: '3',
      name: 'background_audio.mp3',
      type: 'audio',
      size: 5600000,
      uploadedAt: new Date('2024-01-08'),
      url: '/media/background_audio.mp3'
    },
    {
      id: '4',
      name: 'presentation.pdf',
      type: 'document',
      size: 1250000,
      uploadedAt: new Date('2024-01-05'),
      url: '/media/presentation.pdf'
    }
  ]);

  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-green-500" />;
      case 'document': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Image />
          Media Manager
        </h1>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Files</p>
          <p className="text-2xl font-bold">{mediaFiles.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold">
            {formatFileSize(mediaFiles.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Images</p>
          <p className="text-2xl font-bold text-blue-500">
            {mediaFiles.filter(f => f.type === 'image').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Videos</p>
          <p className="text-2xl font-bold text-purple-500">
            {mediaFiles.filter(f => f.type === 'video').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
        </select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredFiles.map(file => (
          <div key={file.id} className="border rounded-lg bg-background p-4 hover:shadow-md transition-shadow">
            <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
              {file.type === 'image' ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="w-12 h-12 text-blue-500" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {getTypeIcon(file.type)}
                  <span className="text-xs text-muted-foreground mt-2 capitalize">{file.type}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{file.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Info */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Storage Usage</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Images</span>
              <span>2.4 GB / 10 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '24%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Videos</span>
              <span>45.6 GB / 100 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: '45%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Audio</span>
              <span>5.6 GB / 50 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '11%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
