/**
 * Email Inbox Page
 * Displays list of emails with detail view
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Reply,
  Forward,
  Loader2,
  AlertCircle,
  Mail,
  PenSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

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

  const { getIdToken } = useAuth();
  const navigate = useNavigate();
  const { emailId } = useParams();

  // Fetch emails
  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  // Fetch single email when emailId changes
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
      const response = await fetch(
        `${API_URL}/admin/emails?direction=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.data?.emails || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err.message);
      // Use mock data for demo
      setEmails(getMockEmails(activeTab));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmail = async (id) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/emails/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email');
      }

      const data = await response.json();
      setSelectedEmail(data.data?.email || null);
    } catch (err) {
      console.error('Error fetching email:', err);
      // Use mock data
      const mockEmail = getMockEmails(activeTab).find((e) => e.id === id);
      setSelectedEmail(mockEmail || null);
    }
  };

  const handleEmailClick = (email) => {
    navigate(`/admin/email/${email.id}`);
  };

  const handleBack = () => {
    navigate('/admin/email');
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
    <AdminLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Email</h1>
            <p className="text-gray-400 mt-1">Manage your inbox and sent messages</p>
          </div>
          <Link
            to="/admin/email/compose"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
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
                      ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px'
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{error}</p>
                  <button
                    onClick={fetchEmails}
                    className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Mail className="w-8 h-8 mb-2" />
                  <p className="text-sm">No emails found</p>
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
                          !email.isRead ? 'bg-cyan-500' : 'bg-transparent'
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
                    <button
                      onClick={() =>
                        navigate(`/admin/email/compose?replyTo=${selectedEmail.id}`)
                      }
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                      <Star className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Sender info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
    </AdminLayout>
  );
}

// Mock data for demo/development
function getMockEmails(direction) {
  if (direction === 'inbound') {
    return [
      {
        id: '1',
        threadId: 'thread_1',
        direction: 'inbound',
        from: { email: 'john@acme.com', name: 'John Smith' },
        to: [{ email: 'support@philocom.co', name: 'Philocom Support' }],
        subject: 'Project Inquiry - Web Development',
        body: '<p>Hi Philocom team,</p><p>I am interested in discussing a potential web development project for our company. We need a modern, responsive website with the following features:</p><ul><li>Custom CMS integration</li><li>E-commerce functionality</li><li>User authentication</li><li>API integrations</li></ul><p>Could you please provide more information about your services and pricing?</p><p>Best regards,<br>John Smith<br>Acme Corp</p>',
        bodyText: 'Hi Philocom team, I am interested in discussing a potential web development project...',
        isRead: false,
        isStarred: true,
        createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
      },
      {
        id: '2',
        threadId: 'thread_2',
        direction: 'inbound',
        from: { email: 'sarah@techcorp.io', name: 'Sarah Johnson' },
        to: [{ email: 'support@philocom.co', name: 'Philocom Support' }],
        subject: 'Partnership Opportunity',
        body: '<p>Hello,</p><p>We would like to explore a potential partnership between our companies. TechCorp specializes in cloud infrastructure and we believe there could be synergies with your web development services.</p><p>Would you be available for a call next week?</p><p>Thanks,<br>Sarah</p>',
        bodyText: 'We would like to explore a potential partnership between our companies...',
        isRead: false,
        isStarred: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      },
      {
        id: '3',
        threadId: 'thread_3',
        direction: 'inbound',
        from: { email: 'mike@startup.co', name: 'Mike Chen' },
        to: [{ email: 'support@philocom.co', name: 'Philocom Support' }],
        subject: 'Quote Request for Mobile App',
        body: '<p>Hi there,</p><p>Could you please provide a quote for developing a mobile application? We need both iOS and Android versions.</p><p>Mike</p>',
        bodyText: 'Could you please provide a quote for developing a mobile application...',
        isRead: true,
        isStarred: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      },
    ];
  } else {
    return [
      {
        id: '4',
        threadId: 'thread_1',
        direction: 'outbound',
        from: { email: 'support@philocom.co', name: 'Philocom' },
        to: [{ email: 'john@acme.com', name: 'John Smith' }],
        subject: 'Re: Project Inquiry - Web Development',
        body: '<p>Hi John,</p><p>Thank you for reaching out! We would be happy to discuss your web development project.</p><p>I have attached our portfolio and pricing guide for your review.</p><p>Best regards,<br>Philocom Team</p>',
        bodyText: 'Thank you for reaching out! We would be happy to discuss...',
        isRead: true,
        isStarred: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      },
    ];
  }
}
