'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { PenTool, CheckCircle, Clock, User, FileText, Download, Send } from 'lucide-react';

interface SignatureRequest {
  id: string;
  documentName: string;
  requester: string;
  signers: Signer[];
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

interface Signer {
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
}

export default function ESignature() {
  const [requests, setRequests] = useState<SignatureRequest[]>([
    {
      id: '1',
      documentName: 'Employment Contract - John Doe',
      requester: 'HR Department',
      signers: [
        { name: 'John Doe', email: 'john@example.com', status: 'signed', signedAt: new Date() },
        { name: 'HR Manager', email: 'hr@company.com', status: 'pending' }
      ],
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-02-15')
    },
    {
      id: '2',
      documentName: 'NDA - Project X',
      requester: 'Legal Team',
      signers: [
        { name: 'Alice Johnson', email: 'alice@example.com', status: 'signed', signedAt: new Date() },
        { name: 'Bob Smith', email: 'bob@example.com', status: 'signed', signedAt: new Date() }
      ],
      status: 'completed',
      createdAt: new Date('2024-01-10'),
      expiresAt: new Date('2024-02-10')
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'signed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      alert('Document signed successfully!');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PenTool />
          E-Signature
        </h1>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          New Signature Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-500">
            {requests.filter(r => r.status === 'completed').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Signers</p>
          <p className="text-2xl font-bold">
            {requests.reduce((sum, r) => sum + r.signers.length, 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Signature Rate</p>
          <p className="text-2xl font-bold text-blue-500">87%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Signature Requests List */}
        <div className="col-span-1 border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Signature Requests</h2>
          <div className="space-y-3">
            {requests.map(request => (
              <div
                key={request.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <p className="font-medium text-sm">{request.documentName}</p>
                <p className="text-xs text-muted-foreground">{request.requester}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Detail */}
        <div className="col-span-2 border rounded-lg bg-background p-4">
          {selectedRequest ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-xl">{selectedRequest.documentName}</h2>
                  <p className="text-sm text-muted-foreground">Requested by {selectedRequest.requester}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                </div>
              </div>

              {/* Signers */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium">Signers</h3>
                {selectedRequest.signers.map((signer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {signer.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{signer.name}</p>
                        <p className="text-sm text-muted-foreground">{signer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(signer.status)}`}>
                        {signer.status}
                      </span>
                      {signer.signedAt && (
                        <span className="text-xs text-muted-foreground">
                          {signer.signedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature Area */}
              {selectedRequest.status === 'pending' && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <PenTool className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Sign Document</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to add your electronic signature
                  </p>
                  <Button onClick={handleSign} disabled={isSigning}>
                    {isSigning ? 'Signing...' : 'Sign Now'}
                  </Button>
                </div>
              )}

              {/* Document Info */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">{selectedRequest.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Expires</p>
                  <p className="font-medium">{selectedRequest.expiresAt.toLocaleDateString()}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <PenTool className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a signature request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
