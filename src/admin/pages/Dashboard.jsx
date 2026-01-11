/**
 * Admin Dashboard Page
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  FolderOpen,
  TrendingUp,
  Inbox,
  Send,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const stats = [
  {
    name: 'Total Emails',
    value: '124',
    change: '+12%',
    changeType: 'increase',
    icon: Mail,
    color: 'cyan',
  },
  {
    name: 'Unread',
    value: '8',
    change: '3 new today',
    changeType: 'neutral',
    icon: Inbox,
    color: 'purple',
  },
  {
    name: 'Sent',
    value: '48',
    change: '+5 this week',
    changeType: 'increase',
    icon: Send,
    color: 'blue',
  },
  {
    name: 'Contacts',
    value: '89',
    change: '+18%',
    changeType: 'increase',
    icon: Users,
    color: 'green',
  },
];

const recentEmails = [
  {
    id: '1',
    from: 'john@acme.com',
    subject: 'Project Inquiry - Web Development',
    preview: 'Hi, I am interested in discussing a potential web development project for our company...',
    time: '10:30 AM',
    unread: true,
  },
  {
    id: '2',
    from: 'sarah@techcorp.io',
    subject: 'Partnership Opportunity',
    preview: 'We would like to explore a potential partnership between our companies...',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: '3',
    from: 'mike@startup.co',
    subject: 'Quote Request for Mobile App',
    preview: 'Could you please provide a quote for developing a mobile application...',
    time: 'Jan 8',
    unread: false,
  },
];

const quickActions = [
  { name: 'Compose Email', href: '/admin/email/compose', icon: Send },
  { name: 'View Inbox', href: '/admin/email', icon: Inbox },
  { name: 'Manage Projects', href: '/admin/projects', icon: FolderOpen },
  { name: 'View Contacts', href: '/admin/contacts', icon: Users },
];

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}
                  style={{
                    backgroundColor: `rgb(var(--color-${stat.color}-500) / 0.1)`,
                  }}
                >
                  <stat.icon
                    className={`w-5 h-5`}
                    style={{
                      color:
                        stat.color === 'cyan'
                          ? '#22d3ee'
                          : stat.color === 'purple'
                          ? '#a855f7'
                          : stat.color === 'blue'
                          ? '#3b82f6'
                          : '#22c55e',
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'increase'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Emails */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Recent Emails</h2>
              <Link
                to="/admin/email"
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-800">
              {recentEmails.map((email) => (
                <Link
                  key={email.id}
                  to={`/admin/email/${email.id}`}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      email.unread ? 'bg-cyan-500' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p
                        className={`text-sm truncate ${
                          email.unread ? 'text-white font-semibold' : 'text-gray-300'
                        }`}
                      >
                        {email.from}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {email.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        email.unread ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {email.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {email.preview}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <action.icon className="w-5 h-5 text-gray-500" />
                  {action.name}
                </Link>
              ))}
            </div>

            {/* Activity */}
            <div className="px-6 py-4 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">New email received</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Send className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Email sent successfully</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      5 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
