/**
 * Employees Management Page
 * Create and manage employee accounts with email access
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Building,
  Calendar,
  Loader2,
  AlertCircle,
  Users,
  UserPlus,
  UserCog,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

// API URL with fallback to AWS API Gateway
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

const statusFilters = [
  { id: 'all', name: 'All', color: 'gray' },
  { id: 'active', name: 'Active', color: 'green' },
  { id: 'inactive', name: 'Inactive', color: 'red' },
  { id: 'suspended', name: 'Suspended', color: 'yellow' },
];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { getIdToken } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch employees');

      const data = await response.json();
      setEmployees(data.data?.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const data = await response.json();
      setEmployees([data.data.employee, ...employees]);
      setIsCreateModalOpen(false);
      return { success: true };
    } catch (err) {
      console.error('Error creating employee:', err);
      return { success: false, error: err.message };
    }
  };

  const updateEmployee = async (employeeId, updates) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      const data = await response.json();
      setEmployees(employees.map(e =>
        e.id === employeeId ? data.data.employee : e
      ));
      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(data.data.employee);
      }
      setIsEditModalOpen(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating employee:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteEmployee = async (employeeId, hard = false) => {
    setIsDeleting(true);
    try {
      const token = await getIdToken();
      const url = hard
        ? `${API_URL}/admin/employees/${employeeId}?hard=true`
        : `${API_URL}/admin/employees/${employeeId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete employee');

      if (hard) {
        setEmployees(employees.filter(e => e.id !== employeeId));
        setSelectedEmployee(null);
      } else {
        // Soft delete - just update status
        setEmployees(employees.map(e =>
          e.id === employeeId ? { ...e, status: 'inactive' } : e
        ));
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee({ ...selectedEmployee, status: 'inactive' });
        }
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || employee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400';
      case 'inactive': return 'bg-red-500/10 text-red-400';
      case 'suspended': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'suspended': return Clock;
      default: return Clock;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Employees</h1>
            <p className="text-gray-400 mt-1">Manage employee accounts and email access</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusFilters.map((filter) => {
            const count = filter.id === 'all'
              ? employees.length
              : employees.filter(e => e.status === filter.id).length;
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
            placeholder="Search by name, email, or department..."
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
          {/* Employees list */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p>No employees found</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  Add your first employee
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredEmployees.map((employee) => {
                  const StatusIcon = getStatusIcon(employee.status);
                  return (
                    <button
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-800/50 transition-colors ${
                        selectedEmployee?.id === employee.id ? 'bg-gray-800/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {employee.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-white truncate">
                              {employee.name}
                            </p>
                            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {employee.status}
                            </span>
                          </div>
                          <p className="text-sm text-cyan-400 truncate">
                            {employee.email}
                          </p>
                          {employee.department && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                              {employee.department}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            {employee.createdAt && formatDistanceToNow(new Date(employee.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Employee detail */}
          <div className="hidden lg:block w-96 bg-gray-900 border border-gray-800 rounded-xl">
            {selectedEmployee ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedEmployee.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {selectedEmployee.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                          {selectedEmployee.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Employee info */}
                <div className="p-6 space-y-4 border-b border-gray-800">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Company Email</p>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{selectedEmployee.email}</span>
                    </div>
                  </div>
                  {selectedEmployee.loginEmail && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Login Email</p>
                      <div className="flex items-center gap-3 text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{selectedEmployee.loginEmail}</span>
                      </div>
                    </div>
                  )}
                  {selectedEmployee.department && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                      <div className="flex items-center gap-3 text-gray-400">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{selectedEmployee.department}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                    <div className="flex items-center gap-3 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedEmployee.createdAt && format(new Date(selectedEmployee.createdAt), 'PPp')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-800 mt-auto space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedEmployee.status}
                      onChange={(e) => updateEmployee(selectedEmployee.id, { status: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button
                      onClick={() => deleteEmployee(selectedEmployee.id, false)}
                      disabled={isDeleting}
                      className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <a
                    href={`/employee`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Employee Panel
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an employee to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Employee Modal */}
      {isCreateModalOpen && (
        <CreateEmployeeModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={createEmployee}
        />
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(updates) => updateEmployee(selectedEmployee.id, updates)}
        />
      )}
    </AdminLayout>
  );
}

function CreateEmployeeModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    assignedEmail: '',
    department: '',
    temporaryPassword: '',
    suppressEmail: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(formData);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add New Employee</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Email * <span className="text-cyan-400">(Login Email)</span>
            </label>
            <input
              type="email"
              required
              value={formData.assignedEmail}
              onChange={(e) => setFormData({ ...formData, assignedEmail: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="john@philocom.co"
            />
            <p className="text-xs text-gray-500 mt-1">
              The @philocom.co email used to log in and send/receive emails
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Personal Email <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="john@gmail.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Personal email for contact purposes (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Temporary Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Leave empty to auto-generate"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Employee will be asked to change this on first login
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="suppressEmail"
              checked={formData.suppressEmail}
              onChange={(e) => setFormData({ ...formData, suppressEmail: e.target.checked })}
              className="w-4 h-4 bg-gray-800 border border-gray-700 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="suppressEmail" className="text-sm text-gray-300">
              Don't send welcome email
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({ employee, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: employee.name || '',
    assignedEmail: employee.email || '',
    department: employee.department || '',
    status: employee.status || 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(formData);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Edit Employee</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Email
            </label>
            <input
              type="email"
              value={formData.assignedEmail}
              onChange={(e) => setFormData({ ...formData, assignedEmail: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
