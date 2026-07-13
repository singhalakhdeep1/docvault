'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Shield, Lock, Key, AlertTriangle, Users, Activity, Settings, CheckCircle, X } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'access' | 'permission' | 'threat';
  user: string;
  action: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      user: 'alice@example.com',
      action: 'Successful login from new device',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'medium'
    },
    {
      id: '2',
      type: 'access',
      user: 'bob@example.com',
      action: 'Accessed confidential document',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'low'
    },
    {
      id: '3',
      type: 'threat',
      user: 'system',
      action: 'Suspicious activity detected',
      timestamp: new Date(Date.now() - 10800000),
      severity: 'high'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="w-4 h-4" />;
      case 'access': return <Users className="w-4 h-4" />;
      case 'permission': return <Key className="w-4 h-4" />;
      case 'threat': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield />
          Security Dashboard
        </h1>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Security Settings
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Security Score</p>
          <p className="text-2xl font-bold text-green-500">92%</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Threats</p>
          <p className="text-2xl font-bold text-red-500">2</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active Sessions</p>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
          <p className="text-2xl font-bold text-yellow-500">5</p>
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg bg-background p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Security Features
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Two-Factor Authentication</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Encryption at Rest</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">AES-256</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Encryption in Transit</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">TLS 1.3</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Session Timeout</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">30 min</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-background p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-48 overflow-auto">
            {events.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 border rounded">
                <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.action}</p>
                  <p className="text-xs text-muted-foreground">{event.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Access Control</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground mb-1">Admin Users</p>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground mb-1">Regular Users</p>
            <p className="text-2xl font-bold">42</p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground mb-1">Guest Users</p>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border rounded-lg bg-background p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">Change Password</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Key className="w-5 h-5" />
            <span className="text-sm">API Keys</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Manage Users</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">View Threats</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
