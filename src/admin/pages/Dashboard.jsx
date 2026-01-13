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
  Loader2,
  UserCog,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

// API URL with fallback to AWS API Gateway
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

const quickActions = [
  { name: 'Compose Email', href: '/admin/email/compose', icon: Send },
  { name: 'View Inbox', href: '/admin/email', icon: Inbox },
  { name: 'Manage Projects', href: '/admin/projects', icon: FolderOpen },
  { name: 'Manage Employees', href: '/admin/employees', icon: UserCog },
  { name: 'View Contacts', href: '/admin/contacts', icon: Users },
];

export default function Dashboard() {
  const { getIdToken } = useAuth();
  const [stats, setStats] = useState([
    { name: 'Total Emails', value: '-', change: '', changeType: 'neutral', icon: Mail, color: 'cyan' },
    { name: 'Unread', value: '-', change: '', changeType: 'neutral', icon: Inbox, color: 'purple' },
    { name: 'Sent', value: '-', change: '', changeType: 'neutral', icon: Send, color: 'blue' },
    { name: 'Contacts', value: '-', change: '', changeType: 'neutral', icon: Users, color: 'green' },
  ]);
  const [recentEmails, setRecentEmails] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [inboundRes, outboundRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/admin/emails?direction=inbound&limit=50`, { headers }).catch(() => null),
        fetch(`${API_URL}/admin/emails?direction=outbound&limit=50`, { headers }).catch(() => null),
        fetch(`${API_URL}/admin/contacts`, { headers }).catch(() => null),
      ]);

      // Process inbound emails
      let inboundEmails = [];
      let unreadCount = 0;
      if (inboundRes?.ok) {
        const inboundData = await inboundRes.json();
        inboundEmails = inboundData.data?.emails || [];
        unreadCount = inboundEmails.filter(e => !e.isRead).length;
      }

      // Process outbound emails
      let outboundEmails = [];
      if (outboundRes?.ok) {
        const outboundData = await outboundRes.json();
        outboundEmails = outboundData.data?.emails || [];
      }

      // Process contacts
      let contacts = [];
      if (contactsRes?.ok) {
        const contactsData = await contactsRes.json();
        contacts = contactsData.data?.contacts || [];
      }

      // Calculate stats
      const totalEmails = inboundEmails.length + outboundEmails.length;
      const sentCount = outboundEmails.length;
      const contactsCount = contacts.length;

      // Update stats
      setStats([
        {
          name: 'Total Emails',
          value: totalEmails.toString(),
          change: `${inboundEmails.length} received`,
          changeType: 'neutral',
          icon: Mail,
          color: 'cyan',
        },
        {
          name: 'Unread',
          value: unreadCount.toString(),
          change: unreadCount > 0 ? 'needs attention' : 'all caught up',
          changeType: unreadCount > 0 ? 'increase' : 'neutral',
          icon: Inbox,
          color: 'purple',
        },
        {
          name: 'Sent',
          value: sentCount.toString(),
          change: 'outbound emails',
          changeType: 'neutral',
          icon: Send,
          color: 'blue',
        },
        {
          name: 'Contacts',
          value: contactsCount.toString(),
          change: 'total contacts',
          changeType: 'neutral',
          icon: Users,
          color: 'green',
        },
      ]);

      // Get recent emails (sorted by date, limited to 5)
      const allEmails = [...inboundEmails].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);

      setRecentEmails(allEmails.map(email => ({
        id: email.id,
        from: email.from?.name || email.from?.email || 'Unknown',
        subject: email.subject || '(No subject)',
        preview: email.bodyText?.substring(0, 100) || '',
        time: formatEmailTime(email.createdAt),
        unread: !email.isRead,
      })));

      // Build recent activity from emails
      const activity = [];
      if (inboundEmails.length > 0) {
        const latestInbound = inboundEmails.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        activity.push({
          type: 'received',
          message: `Email from ${latestInbound.from?.name || latestInbound.from?.email}`,
          time: formatActivityTime(latestInbound.createdAt),
          icon: Mail,
          color: 'cyan',
        });
      }
      if (outboundEmails.length > 0) {
        const latestOutbound = outboundEmails.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        activity.push({
          type: 'sent',
          message: `Email sent to ${latestOutbound.to?.[0]?.email}`,
          time: formatActivityTime(latestOutbound.createdAt),
          icon: Send,
          color: 'green',
        });
      }
      setRecentActivity(activity);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Keep default stats on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatEmailTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'h:mm a');
    } else if (diffDays < 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : recentEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Mail className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No emails yet</p>
                </div>
              ) : (
                recentEmails.map((email) => (
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
                ))
              )}
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.color === 'cyan'
                            ? 'bg-cyan-500/10'
                            : activity.color === 'green'
                            ? 'bg-green-500/10'
                            : 'bg-gray-800'
                        }`}
                      >
                        <activity.icon
                          className={`w-4 h-4 ${
                            activity.color === 'cyan'
                              ? 'text-cyan-400'
                              : activity.color === 'green'
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">{activity.message}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
