/**
 * Employee Panel Layout Component
 * Provides sidebar navigation and main content area with restricted options
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  FolderOpen,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const navigation = [
  { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
  { name: 'My Email', href: '/employee/email', icon: Mail },
  { name: 'Contacts', href: '/employee/contacts', icon: Users },
  { name: 'Projects', href: '/employee/projects', icon: FolderOpen },
  { name: 'Profile', href: '/employee/profile', icon: User },
];

export default function EmployeeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, employee, logout } = useEmployeeAuth();

  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  const isActive = (href) => {
    if (href === '/employee') {
      return location.pathname === '/employee';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <Link to="/employee" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <span className="text-white font-semibold">Philocom</span>
              <span className="text-xs text-green-400 block -mt-1">Employee</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {active && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.[0] || employee?.name?.[0] || 'E'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || employee?.name || 'Employee'}
              </p>
              <p className="text-xs text-green-400 truncate">
                {employee?.email || 'employee@philocom.co'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 mt-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              {/* Employee email indicator */}
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">
                  Sending as: <span className="text-green-400 font-medium">{employee?.email || 'employee@philocom.co'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="hidden lg:block h-8 w-px bg-gray-800" />
              <Link
                to="/"
                target="_blank"
                className="hidden lg:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
