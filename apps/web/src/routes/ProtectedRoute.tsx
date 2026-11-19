import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <div className="text-center">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Verifying Session
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Validating authenticated credentials with server...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested route for seamless redirection after authentication
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
