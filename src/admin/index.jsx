/**
 * Admin Panel Entry Point
 * Exports all admin components and routes
 */

// Context
export { AuthProvider, useAuth } from './context/AuthContext';

// Components
export { default as AdminLayout } from './components/AdminLayout';
export { default as ProtectedRoute } from './components/ProtectedRoute';

// Pages
export { default as Login } from './pages/Login';
export { default as Dashboard } from './pages/Dashboard';
export { default as EmailInbox } from './pages/EmailInbox';
export { default as EmailCompose } from './pages/EmailCompose';
export { default as Projects } from './pages/Projects';
export { default as Contacts } from './pages/Contacts';
export { default as Blog } from './pages/Blog';
export { default as Settings } from './pages/Settings';
