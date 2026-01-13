/**
 * Employee Routes Component
 * Handles all employee panel routing
 */

import { Routes, Route } from 'react-router-dom';
import { EmployeeAuthProvider } from './context/EmployeeAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmailInbox from './pages/EmailInbox';
import EmailCompose from './pages/EmailCompose';
import Contacts from './pages/Contacts';
import Projects from './pages/Projects';
import Profile from './pages/Profile';

export default function EmployeeRoutes() {
  return (
    <EmployeeAuthProvider>
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
          path="contacts"
          element={
            <ProtectedRoute>
              <Contacts />
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
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </EmployeeAuthProvider>
  );
}
