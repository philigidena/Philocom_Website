/**
 * Employee Email Inbox Page
 * Displays only the employee's own emails
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  Star,
  RefreshCw,
  Search,
  ChevronLeft,
  Reply,
  Loader2,
  AlertCircle,
  Mail,
  PenSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import EmployeeLayout from '../components/EmployeeLayout';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

const tabs = [
  { id: 'inbound', name: 'Inbox', icon: Inbox },
  { id: 'outbound', name: 'Sent', icon: Send },
];

export default function EmailInbox() {
  const [activeTab, setActiveTab] = useState('inbound');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { getIdToken, employee } = useEmployeeAuth();
  const navigate = useNavigate();
  const { emailId } = useParams();

  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  useEffect(() => {
    if (emailId) {
      fetchEmail(emailId);
    } else {
      setSelectedEmail(null);
    }
  }, [emailId]);

  const fetchEmails = async () => {
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

      const response = await fetch(
        `${API_URL}/employee/emails?direction=${activeTab}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.data?.emails || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err.message);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmail = async (id) => {
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

      const response = await fetch(`${API_URL}/employee/emails/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email');
      }

      const data = await response.json();
      setSelectedEmail(data.data?.email || null);
    } catch (err) {
      console.error('Error fetching email:', err);
      setSelectedEmail(null);
    }
  };

  const handleEmailClick = (email) => {
    navigate(`/employee/email/${email.id}`);
  };

  const handleBack = () => {
    navigate('/employee/email');
  };

  const filteredEmails = emails.filter((email) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(query) ||
      email.from?.email?.toLowerCase().includes(query) ||
      email.from?.name?.toLowerCase().includes(query)
    );
  });

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

  return (
    <EmployeeLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Email</h1>
            <p className="text-gray-400 mt-1">
              {employee?.email || 'Your email inbox'}
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

        {/* Main content */}
        <div className="flex-1 flex bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Email list */}
          <div
            className={`w-full md:w-96 border-r border-gray-800 flex flex-col ${
              emailId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-green-400 border-b-2 border-green-400 -mb-px'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
              <button
                onClick={fetchEmails}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{error}</p>
                  <button
                    onClick={fetchEmails}
                    className="mt-2 text-sm text-green-400 hover:text-green-300"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Mail className="w-8 h-8 mb-2" />
                  <p className="text-sm">No emails found</p>
                  {activeTab === 'outbound' && (
                    <Link
                      to="/employee/email/compose"
                      className="text-sm text-green-400 hover:text-green-300 mt-2"
                    >
                      Send your first email
                    </Link>
                  )}
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      emailId === email.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          !email.isRead ? 'bg-green-500' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              !email.isRead
                                ? 'text-white font-semibold'
                                : 'text-gray-300'
                            }`}
                          >
                            {activeTab === 'inbound'
                              ? email.from?.name || email.from?.email
                              : email.to?.[0]?.name || email.to?.[0]?.email}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatEmailTime(email.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate mt-0.5 ${
                            !email.isRead ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {email.subject || '(No subject)'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {email.bodyText?.substring(0, 100) || ''}
                        </p>
                      </div>
                      {email.isStarred && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Email detail */}
          <div
            className={`flex-1 flex flex-col ${
              emailId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedEmail ? (
              <>
                {/* Detail header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBack}
                      className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-white truncate">
                      {selectedEmail.subject || '(No subject)'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.direction === 'inbound' && (
                      <button
                        onClick={() =>
                          navigate(`/employee/email/compose?replyTo=${selectedEmail.id}`)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Email content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Sender info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {(selectedEmail.from?.name || selectedEmail.from?.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {selectedEmail.from?.name || selectedEmail.from?.email}
                          </p>
                          <p className="text-sm text-gray-400">
                            {selectedEmail.from?.email}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {selectedEmail.createdAt &&
                            format(new Date(selectedEmail.createdAt), 'PPp')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        To: {selectedEmail.to?.map((t) => t.email).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Email body */}
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedEmail.body || selectedEmail.bodyText || '',
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
