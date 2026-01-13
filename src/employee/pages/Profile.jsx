/**
 * Employee Profile Page
 * View and edit basic profile information
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Building,
  Calendar,
  Loader2,
  AlertCircle,
  User,
  CheckCircle,
  Inbox,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import EmployeeLayout from '../components/EmployeeLayout';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getIdToken, employee } = useEmployeeAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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

      const response = await fetch(`${API_URL}/employee/profile`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data.data?.profile || null);
      setStats(data.data?.stats || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'suspended': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-1">View your account information</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Header with avatar */}
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {(profile?.name || employee?.name)?.[0]?.toUpperCase() || 'E'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {profile?.name || employee?.name || 'Employee'}
                    </h2>
                    <p className="text-green-400">
                      {profile?.email || employee?.email || 'employee@philocom.co'}
                    </p>
                    {profile?.status && (
                      <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(profile.status)}`}>
                        <CheckCircle className="w-3 h-3" />
                        {profile.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile details */}
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Company Email</p>
                    <div className="flex items-center gap-2 text-white">
                      <Mail className="w-4 h-4 text-green-400" />
                      <span>{profile?.email || employee?.email || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Login Email</p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{profile?.loginEmail || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Building className="w-4 h-4" />
                      <span>{profile?.department || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {profile?.createdAt
                          ? format(new Date(profile.createdAt), 'MMMM yyyy')
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Stats */}
            {stats && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Email Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Inbox className="w-5 h-5" />
                      <span className="text-sm">Inbox</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.inboundEmails || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Send className="w-5 h-5" />
                      <span className="text-sm">Sent</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.outboundEmails || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">Unread</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.unreadEmails || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalEmails || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">About Your Account</h3>
              <p className="text-gray-400 text-sm">
                Your employee account gives you access to your personal company email inbox.
                All emails you send will come from your assigned email address ({profile?.email || employee?.email}).
                Replies to your emails will appear in your inbox automatically.
              </p>
              <p className="text-gray-500 text-sm mt-3">
                If you need to update your account information or have any issues,
                please contact your administrator.
              </p>
            </div>
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
