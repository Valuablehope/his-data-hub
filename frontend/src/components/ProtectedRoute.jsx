import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, hasRole, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
