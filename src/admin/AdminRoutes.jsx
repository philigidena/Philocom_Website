/**
 * Admin Routes Component
 * Handles all admin panel routing
 */

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmailInbox from './pages/EmailInbox';
import EmailCompose from './pages/EmailCompose';
import Projects from './pages/Projects';
import Contacts from './pages/Contacts';
import Blog from './pages/Blog';
import Settings from './pages/Settings';

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="email"
          element={
            <ProtectedRoute>
              <EmailInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="email/:emailId"
          element={
            <ProtectedRoute>
              <EmailInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="email/compose"
          element={
            <ProtectedRoute>
              <EmailCompose />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="blog"
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
