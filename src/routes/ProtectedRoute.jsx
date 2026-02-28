import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { ShieldAlert } from 'lucide-react';

/**
 * Protects a route behind authentication + optional RBAC.
 * @param {string} [requiredPermission] - e.g. 'view:credits'
 * @param {string} [requiredRole]       - e.g. 'admin'
 */
const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { can, hasRole, isActive } = usePermissions();

  const token = localStorage.getItem('authToken');
  const hasValidToken = token && token.split('.').length === 3;

  if (!isAuthenticated && !hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  // Wait for auth to initialize before checking permissions
  // (userAccess is fetched async after restore)
  if (!isInitialized) return null;

  // Permission check
  const permissionDenied =
    (requiredPermission && !can(requiredPermission)) ||
    (requiredRole && !hasRole(requiredRole));

  if (permissionDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            You don't have permission to view this page.
          </p>
          <a href="/dashboard" className="text-primary-600 hover:underline text-sm font-medium">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
