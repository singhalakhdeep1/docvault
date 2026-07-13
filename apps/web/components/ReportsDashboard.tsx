'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { BarChart3, Download, Calendar, Filter, FileText, Users, Activity, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'usage' | 'security' | 'storage' | 'activity';
  createdAt: Date;
  author: string;
  status: 'ready' | 'generating';
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Usage Report',
      type: 'usage',
      createdAt: new Date('2024-01-15'),
      author: 'System',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Security Audit',
      type: 'security',
      createdAt: new Date('2024-01-10'),
      author: 'Security Team',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Storage Analysis',
      type: 'storage',
      createdAt: new Date('2024-01-08'),
      author: 'System',
      status: 'ready'
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'usage': return 'bg-blue-500';
      case 'security': return 'bg-red-500';
      case 'storage': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const generateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      name: 'Custom Report',
      type: 'usage',
      createdAt: new Date(),
      author: 'Current User',
      status: 'generating'
    };
    setReports([newReport, ...reports]);

    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id ? { ...r, status: 'ready' } : r
      ));
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 />
          Reports Dashboard
        </h1>
        <Button onClick={generateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Reports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Documents Indexed</p>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold">89</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Storage Used</p>
          <p className="text-2xl font-bold">45.2 GB</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
        <select
          value={selectedReportType}
          onChange={(e) => setSelectedReportType(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="usage">Usage</option>
          <option value="security">Security</option>
          <option value="storage">Storage</option>
          <option value="activity">Activity</option>
        </select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Reports List */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-4">Available Reports</h3>
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded hover:bg-accent/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded ${getTypeColor(report.type)} flex items-center justify-center`}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{report.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{report.type}</span>
                    <span>•</span>
                    <span>{report.author}</span>
                    <span>•</span>
                    <span>{report.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${
                  report.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {report.status}
                </span>
                <Button variant="outline" size="sm" disabled={report.status !== 'ready'}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Report Templates */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Quick Report Templates</h3>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Activity className="w-5 h-5" />
            <span className="text-sm">Usage Report</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">User Activity</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Growth Metrics</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Custom Date Range</span>
          </Button>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg bg-background p-4">
          <h3 className="font-semibold mb-3">Document Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Documents Created</span>
              <span className="font-bold">234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Documents Modified</span>
              <span className="font-bold">567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Documents Deleted</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Documents Shared</span>
              <span className="font-bold">89</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-background p-4">
          <h3 className="font-semibold mb-3">User Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Users</span>
              <span className="font-bold">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">New Signups</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Logins</span>
              <span className="font-bold">1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed Logins</span>
              <span className="font-bold text-red-500">5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
