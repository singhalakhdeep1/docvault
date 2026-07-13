'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Search, Filter, FileText, Calendar, User, Tag, Download, Share2 } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  author: string;
  createdAt: Date;
  modifiedAt: Date;
  size: number;
  tags: string[];
  excerpt: string;
  relevance: number;
}

export default function DocumentSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([
    {
      id: '1',
      title: 'Q4 Financial Report',
      type: 'PDF',
      author: 'Alice Johnson',
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-15'),
      size: 2450000,
      tags: ['finance', 'quarterly', 'report'],
      excerpt: 'This document contains the financial results for Q4 2024, including revenue growth of 15%...',
      relevance: 95
    },
    {
      id: '2',
      title: 'Employee Handbook 2024',
      type: 'DOCX',
      author: 'Bob Smith',
      createdAt: new Date('2024-01-05'),
      modifiedAt: new Date('2024-01-12'),
      size: 1250000,
      tags: ['hr', 'policy', 'handbook'],
      excerpt: 'The employee handbook outlines company policies, benefits, and procedures for all staff members...',
      relevance: 88
    },
    {
      id: '3',
      title: 'Project Proposal - Website Redesign',
      type: 'PDF',
      author: 'Carol Davis',
      createdAt: new Date('2024-01-08'),
      modifiedAt: new Date('2024-01-18'),
      size: 890000,
      tags: ['project', 'design', 'proposal'],
      excerpt: 'This proposal outlines the scope, timeline, and budget for the website redesign project...',
      relevance: 82
    }
  ]);

  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    dateRange: 'all',
    author: 'all'
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In real implementation, this would call an API
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search />
          Document Search
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedFilters.type}
          onChange={(e) => setSelectedFilters({ ...selectedFilters, type: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
        </select>
        <select
          value={selectedFilters.dateRange}
          onChange={(e) => setSelectedFilters({ ...selectedFilters, dateRange: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select
          value={selectedFilters.author}
          onChange={(e) => setSelectedFilters({ ...selectedFilters, author: e.target.value })}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Authors</option>
          <option value="alice">Alice Johnson</option>
          <option value="bob">Bob Smith</option>
          <option value="carol">Carol Davis</option>
        </select>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.length} results found for "{searchQuery || 'all documents'}"
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Sort by Relevance</Button>
            <Button variant="outline" size="sm">Sort by Date</Button>
          </div>
        </div>

        {results.map(result => (
          <div key={result.id} className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="bg-muted px-2 py-0.5 rounded">{result.type}</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{result.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{result.modifiedAt.toLocaleDateString()}</span>
                      </div>
                      <span>{formatFileSize(result.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{result.excerpt}</p>

                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  {result.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {result.relevance}% match
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Search */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Advanced Search</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Exact Phrase</label>
            <input type="text" placeholder="Search exact phrase..." className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Exclude Words</label>
            <input type="text" placeholder="Words to exclude..." className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">File Size</label>
            <select className="w-full px-3 py-2 border rounded">
              <option>Any Size</option>
              <option>Less than 1 MB</option>
              <option>1-10 MB</option>
              <option>Greater than 10 MB</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
