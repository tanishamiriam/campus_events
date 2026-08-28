import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ roles, allowedRoles, children }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Accept either prop name: 'roles' or 'allowedRoles'
  const acceptedRoles = roles || allowedRoles;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (acceptedRoles && user && !acceptedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Render children if passed directly, otherwise fall back to nested Outlet
  return children ? children : <Outlet />;
}