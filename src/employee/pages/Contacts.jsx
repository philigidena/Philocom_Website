/**
 * Employee Contacts Page (Read-Only)
 * View contact form submissions without ability to edit
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  Loader2,
  AlertCircle,
  Users,
  Eye,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import EmployeeLayout from '../components/EmployeeLayout';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  const { getIdToken } = useEmployeeAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/employee/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.data?.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-cyan-500/10 text-cyan-400';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Contacts</h1>
            <p className="text-gray-400 mt-1">View contact form submissions</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            Read-only access
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left px-4 py-4 hover:bg-gray-800/50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {contact.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-white truncate">
                            {contact.name}
                          </p>
                          {contact.status && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                          )}
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
                ))}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedContact.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {selectedContact.name}
                        </h3>
                        {selectedContact.status && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                            {selectedContact.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="p-6 space-y-4 border-b border-gray-800">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{selectedContact.phone}</span>
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
    </EmployeeLayout>
  );
}
