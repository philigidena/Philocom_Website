/**
 * Protected Route Component for Employee Panel
 * Redirects unauthenticated users to login
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useEmployeeAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/employee/login" state={{ from: location }} replace />;
  }

  return children;
}
