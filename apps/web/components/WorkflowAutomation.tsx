'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Workflow, Plus, Play, Pause, Trash2, Settings, GitBranch, Clock, Zap, CheckCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'notification';
  config: any;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'draft';
  lastRun?: Date;
  runs: number;
}

export default function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([
    {
      id: '1',
      name: 'Document Approval Flow',
      description: 'Automatically route documents for approval based on type',
      status: 'active',
      lastRun: new Date(Date.now() - 3600000),
      runs: 45,
      steps: [
        { id: 's1', name: 'Document Uploaded', type: 'trigger', config: { event: 'document.created' } },
        { id: 's2', name: 'Check Document Type', type: 'condition', config: { field: 'type' } },
        { id: 's3', name: 'Assign Reviewer', type: 'action', config: { role: 'reviewer' } },
        { id: 's4', name: 'Send Notification', type: 'notification', config: { channel: '#approvals' } }
      ]
    },
    {
      id: '2',
      name: 'Retention Policy',
      description: 'Archive documents older than 7 years',
      status: 'active',
      lastRun: new Date(Date.now() - 86400000),
      runs: 30,
      steps: [
        { id: 's5', name: 'Schedule', type: 'trigger', config: { cron: '0 2 * * *' } },
        { id: 's6', name: 'Find Old Documents', type: 'action', config: { age: '7 years' } },
        { id: 's7', name: 'Move to Archive', type: 'action', config: { destination: 'archive' } }
      ]
    },
    {
      id: '3',
      name: 'Signature Reminder',
      description: 'Send reminders for pending signatures',
      status: 'paused',
      lastRun: new Date(Date.now() - 172800000),
      runs: 12,
      steps: [
        { id: 's8', name: 'Check Pending Signatures', type: 'trigger', config: { interval: 'daily' } },
        { id: 's9', name: 'Send Email Reminder', type: 'notification', config: { template: 'signature_reminder' } }
      ]
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'action': return <Play className="w-4 h-4 text-blue-500" />;
      case 'condition': return <GitBranch className="w-4 h-4 text-purple-500" />;
      case 'notification': return <Clock className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(workflows.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'active' ? 'paused' as const : 'active' as const };
      }
      return w;
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Workflow />
          Workflow Automation
        </h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Workflows</p>
          <p className="text-2xl font-bold">{workflows.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-500">
            {workflows.filter(w => w.status === 'active').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Runs</p>
          <p className="text-2xl font-bold">
            {workflows.reduce((sum, w) => sum + w.runs, 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold text-blue-500">98.5%</p>
        </div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-2 gap-4">
        {workflows.map(workflow => (
          <div
            key={workflow.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedWorkflow?.id === workflow.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-accent/50'
            }`}
            onClick={() => setSelectedWorkflow(workflow)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>{workflow.runs} runs</span>
              </div>
              {workflow.lastRun && (
                <span>Last run: {workflow.lastRun.toLocaleDateString()}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {workflow.steps.slice(0, 4).map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                    {getStepIcon(step.type)}
                    <span>{step.name}</span>
                  </div>
                  {index < Math.min(workflow.steps.length - 1, 3) && (
                    <div className="w-4 h-px bg-muted" />
                  )}
                </React.Fragment>
              ))}
              {workflow.steps.length > 4 && (
                <span className="text-xs text-muted-foreground">+{workflow.steps.length - 4} more</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Detail */}
      {selectedWorkflow && (
        <div className="border rounded-lg bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedWorkflow.name}</h2>
              <p className="text-muted-foreground">{selectedWorkflow.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toggleWorkflowStatus(selectedWorkflow.id)}
              >
                {selectedWorkflow.status === 'active' ? (
                  <><Pause className="w-4 h-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Resume</>
                )}
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Workflow Steps</h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {selectedWorkflow.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex-shrink-0 w-48 border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStepIcon(step.type)}
                      <span className="font-medium text-sm">{step.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                  </div>
                  {index < selectedWorkflow.steps.length - 1 && (
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-px h-8 bg-muted" />
                      <Play className="w-4 h-4 text-muted-foreground rotate-90" />
                      <div className="w-px h-8 bg-muted" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Workflow Stats */}
          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Runs</p>
              <p className="text-xl font-bold">{selectedWorkflow.runs}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-xl font-bold text-green-500">99.2%</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-xl font-bold">2m 34s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
