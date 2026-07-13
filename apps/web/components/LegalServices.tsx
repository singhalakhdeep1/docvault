'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Scale, FileText, Clock, CheckCircle, AlertCircle, AlertTriangle, Search, Calendar, User, Download } from 'lucide-react';

interface LegalDocument {
  id: string;
  title: string;
  type: 'contract' | 'nda' | 'agreement' | 'policy';
  status: 'draft' | 'review' | 'approved' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  author: string;
}

export default function LegalServices() {
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: '1',
      title: 'Employment Agreement',
      type: 'contract',
      status: 'approved',
      createdAt: new Date('2024-01-10'),
      expiresAt: new Date('2025-01-10'),
      author: 'Legal Team'
    },
    {
      id: '2',
      title: 'NDA - Project X',
      type: 'nda',
      status: 'review',
      createdAt: new Date('2024-01-15'),
      author: 'Legal Team'
    },
    {
      id: '3',
      title: 'Privacy Policy',
      type: 'policy',
      status: 'approved',
      createdAt: new Date('2024-01-05'),
      author: 'Compliance'
    },
    {
      id: '4',
      title: 'Service Agreement',
      type: 'agreement',
      status: 'draft',
      createdAt: new Date('2024-01-18'),
      author: 'Legal Team'
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'review': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <Scale className="w-4 h-4" />;
      case 'nda': return <FileText className="w-4 h-4" />;
      case 'agreement': return <CheckCircle className="w-4 h-4" />;
      case 'policy': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scale />
          Legal Services
        </h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Legal Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Documents</p>
          <p className="text-2xl font-bold">{documents.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-500">
            {documents.filter(d => d.status === 'review').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-green-500">
            {documents.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Expiring Soon</p>
          <p className="text-2xl font-bold text-red-500">1</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="col-span-1 border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Legal Documents</h2>
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(doc.type)}
                  <p className="font-medium text-sm">{doc.title}</p>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Document Detail */}
        <div className="col-span-2 border rounded-lg bg-background p-4">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-xl">{selectedDoc.title}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{selectedDoc.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Document Info */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Author</p>
                    <p className="font-medium">{selectedDoc.author}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{selectedDoc.createdAt.toLocaleDateString()}</p>
                  </div>
                  {selectedDoc.expiresAt && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Expires</p>
                      <p className="font-medium">{selectedDoc.expiresAt.toLocaleDateString()}</p>
                    </div>
                  )}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium capitalize">{selectedDoc.status}</p>
                  </div>
                </div>
              </div>

              {/* Document Content Preview */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2">Document Preview</h3>
                <div className="bg-muted p-4 rounded max-h-64 overflow-auto">
                  <p className="text-sm text-muted-foreground">
                    This is a preview of the legal document content. The full document would be displayed here with proper formatting and legal terminology.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button>Request Review</Button>
                <Button variant="outline">Send for Signature</Button>
                <Button variant="outline">Version History</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Scale className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Quick Templates</h3>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Scale className="w-5 h-5" />
            <span className="text-sm">Contract</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm">NDA</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Agreement</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Policy</span>
          </Button>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Compliance Alerts
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">Employment Agreement expires in 30 days</span>
            </div>
            <Button variant="outline" size="sm">Renew</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="text-sm">2 documents pending legal review</span>
            </div>
            <Button variant="outline" size="sm">Review</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
