/**
 * Employee Dashboard Page
 * Shows email stats and quick actions for the employee
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  Inbox,
  Star,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  PenSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmployeeLayout from '../components/EmployeeLayout';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { employee, getIdToken } = useEmployeeAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (employee?.email) {
        headers['X-Employee-Email'] = employee.email;
      }

      // Fetch profile with stats
      const profileResponse = await fetch(`${API_URL}/employee/profile`, {
        headers,
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setStats(profileData.data?.stats || null);
      }

      // Fetch recent emails
      const emailsResponse = await fetch(`${API_URL}/employee/emails?limit=5`, {
        headers,
      });

      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json();
        setRecentEmails(emailsData.data?.emails || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Inbox',
      value: stats?.inboundEmails || 0,
      icon: Inbox,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      href: '/employee/email?direction=inbound',
    },
    {
      name: 'Sent',
      value: stats?.outboundEmails || 0,
      icon: Send,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      href: '/employee/email?direction=outbound',
    },
    {
      name: 'Unread',
      value: stats?.unreadEmails || 0,
      icon: Mail,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      href: '/employee/email',
    },
    {
      name: 'Total',
      value: stats?.totalEmails || 0,
      icon: Star,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      href: '/employee/email',
    },
  ];

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {employee?.name?.split(' ')[0] || 'Employee'}
            </h1>
            <p className="text-gray-400 mt-1">
              Here's what's happening with your email
            </p>
          </div>
          <Link
            to="/employee/email/compose"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            <PenSquare className="w-4 h-4" />
            Compose
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mt-3">
                {isLoading ? '-' : stat.value}
              </p>
              <p className="text-sm text-gray-400">{stat.name}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Recent Emails */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/employee/email/compose"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <PenSquare className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Compose Email</p>
                  <p className="text-xs text-gray-500">Send a new email</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link
                to="/employee/email"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Inbox className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">View Inbox</p>
                  <p className="text-xs text-gray-500">Check your emails</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link
                to="/employee/contacts"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">View Contacts</p>
                  <p className="text-xs text-gray-500">Browse contact list</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>

          {/* Recent Emails */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Recent Emails</h2>
              <Link
                to="/employee/email"
                className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
              </div>
            ) : recentEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Mail className="w-10 h-10 mb-3 opacity-50" />
                <p>No emails yet</p>
                <Link
                  to="/employee/email/compose"
                  className="text-sm text-green-400 hover:text-green-300 mt-2"
                >
                  Compose your first email
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {recentEmails.map((email) => (
                  <Link
                    key={email.id}
                    to={`/employee/email/${email.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      email.isRead ? 'bg-gray-600' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${
                          email.isRead ? 'text-gray-400' : 'text-white font-medium'
                        }`}>
                          {email.direction === 'inbound'
                            ? email.from?.name || email.from?.email
                            : `To: ${email.to?.[0]?.name || email.to?.[0]?.email}`}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {email.createdAt && formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${
                        email.isRead ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {email.subject}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Mail className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Your Email Address</h3>
              <p className="text-green-400">{employee?.email || 'Loading...'}</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            All emails you send will come from this address. Replies to your emails will appear in your inbox.
          </p>
        </div>
      </div>
    </EmployeeLayout>
  );
}
