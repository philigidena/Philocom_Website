/**
 * Contacts Management Page
 * View and manage contact form submissions
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  MoreVertical,
  Loader2,
  AlertCircle,
  Users,
  Reply,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const statusFilters = [
  { id: 'all', name: 'All', color: 'gray' },
  { id: 'new', name: 'New', color: 'cyan' },
  { id: 'contacted', name: 'Contacted', color: 'yellow' },
  { id: 'resolved', name: 'Resolved', color: 'green' },
];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);

  const { getIdToken } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.data || getMockContacts());
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts(getMockContacts());
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const token = await getIdToken();
      await fetch(`${API_URL}/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state
      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, status: newStatus } : c
      ));
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating contact:', err);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || contact.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-cyan-500/10 text-cyan-400';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return Clock;
      case 'contacted': return Reply;
      case 'resolved': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Contacts</h1>
            <p className="text-gray-400 mt-1">Manage contact form submissions</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusFilters.map((filter) => {
            const count = filter.id === 'all'
              ? contacts.length
              : contacts.filter(c => c.status === filter.id).length;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedStatus(filter.id)}
                className={`p-4 rounded-xl border transition-colors ${
                  selectedStatus === filter.id
                    ? 'bg-gray-800 border-cyan-500/50'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-sm text-gray-400">{filter.name}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex gap-6">
          {/* Contacts list */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredContacts.map((contact) => {
                  const StatusIcon = getStatusIcon(contact.status);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-800/50 transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-gray-800/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {contact.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-white truncate">
                              {contact.name}
                            </p>
                            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {contact.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {contact.email}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {contact.message?.substring(0, 60)}...
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {contact.submittedAt && formatDistanceToNow(new Date(contact.submittedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact detail */}
          <div className="hidden lg:block w-96 bg-gray-900 border border-gray-800 rounded-xl">
            {selectedContact ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedContact.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {selectedContact.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                          {selectedContact.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="p-6 space-y-4 border-b border-gray-800">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedContact.email}`} className="text-sm hover:text-cyan-400">
                      {selectedContact.email}
                    </a>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedContact.phone}`} className="text-sm hover:text-cyan-400">
                        {selectedContact.phone}
                      </a>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">{selectedContact.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedContact.submittedAt && format(new Date(selectedContact.submittedAt), 'PPp')}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Message</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-800 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedContact.status}
                      onChange={(e) => updateContactStatus(selectedContact.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: Contact Form Submission`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                  >
                    <Reply className="w-4 h-4" />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a contact to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Mock data
function getMockContacts() {
  return [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corp',
      message: 'Hi, I am interested in discussing a potential web development project for our company. We need a modern, responsive website with e-commerce functionality. Please get back to me at your earliest convenience.',
      status: 'new',
      submittedAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@techcorp.io',
      phone: '+1 (555) 987-6543',
      company: 'TechCorp',
      message: 'We would like to explore a potential partnership between our companies. TechCorp specializes in cloud infrastructure and we believe there could be synergies.',
      status: 'contacted',
      submittedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@startup.co',
      phone: '',
      company: 'Startup Co',
      message: 'Could you please provide a quote for developing a mobile application? We need both iOS and Android versions with real-time chat functionality.',
      status: 'resolved',
      submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@design.studio',
      phone: '+1 (555) 456-7890',
      company: 'Design Studio',
      message: 'Looking for a development partner for our UI/UX projects. We have several clients who need web development work.',
      status: 'new',
      submittedAt: Date.now() - 1000 * 60 * 60 * 2,
    },
  ];
}
