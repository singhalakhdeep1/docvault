'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FileText, Upload, Scan, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface OCRResult {
  id: string;
  fileName: string;
  extractedText: string;
  confidence: number;
  pages: number;
  processedAt: Date;
  status: 'processing' | 'completed' | 'failed';
}

export default function DocumentOCR() {
  const [documents, setDocuments] = useState<OCRResult[]>([
    {
      id: '1',
      fileName: 'contract.pdf',
      extractedText: 'This agreement is made between Party A and Party B...',
      confidence: 98.5,
      pages: 5,
      processedAt: new Date(Date.now() - 3600000),
      status: 'completed'
    },
    {
      id: '2',
      fileName: 'invoice_scan.jpg',
      extractedText: 'Invoice #12345 - Total Amount: $2,500.00...',
      confidence: 95.2,
      pages: 1,
      processedAt: new Date(Date.now() - 7200000),
      status: 'completed'
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newDoc: OCRResult = {
      id: Date.now().toString(),
      fileName: files[0].name,
      extractedText: 'OCR processing complete. Extracted text will appear here...',
      confidence: 97.8,
      pages: Math.floor(Math.random() * 10) + 1,
      processedAt: new Date(),
      status: 'completed'
    };

    setDocuments([newDoc, ...documents]);
    setIsProcessing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Scan className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scan />
          Document OCR
        </h1>
        <div className="flex gap-2">
          <input
            type="file"
            id="ocr-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <label htmlFor="ocr-upload">
            <Button disabled={isProcessing}>
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Upload for OCR'}
            </Button>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Documents</p>
          <p className="text-2xl font-bold">{documents.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Avg Confidence</p>
          <p className="text-2xl font-bold text-green-500">
            {(documents.reduce((sum, d) => sum + d.confidence, 0) / documents.length).toFixed(1)}%
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pages</p>
          <p className="text-2xl font-bold">
            {documents.reduce((sum, d) => sum + d.pages, 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Processing Status</p>
          <p className="text-2xl font-bold text-blue-500">
            {documents.filter(d => d.status === 'completed').length} / {documents.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="col-span-1 border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Processed Documents</h2>
          <div className="space-y-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(doc.status)}
                  <span className="font-medium text-sm">{doc.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{doc.pages} pages</span>
                  <span>{doc.confidence.toFixed(1)}% confidence</span>
                </div>
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
                  <h2 className="font-semibold">{selectedDoc.fileName}</h2>
                  <p className="text-sm text-muted-foreground">
                    Processed: {selectedDoc.processedAt.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Extracted Text</h3>
                  <div className="bg-muted p-4 rounded-lg max-h-64 overflow-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedDoc.extractedText}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                    <p className="text-2xl font-bold text-green-500">{selectedDoc.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Pages Processed</p>
                    <p className="text-2xl font-bold">{selectedDoc.pages}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="border rounded-lg bg-background p-4">
        <h2 className="font-semibold mb-3">Supported Formats</h2>
        <div className="flex gap-2 flex-wrap">
          {['PDF', 'JPG', 'JPEG', 'PNG', 'TIFF', 'BMP', 'GIF'].map(format => (
            <span key={format} className="px-3 py-1 bg-muted rounded-full text-sm">
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
