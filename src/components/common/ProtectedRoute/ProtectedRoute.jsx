import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import LoadingSpinner from '../LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useMasterAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!currentUser) {
    // Add query parameter to indicate this redirect came from a protected route
    const redirectUrl = `/master-admin/login?from=protected&path=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
};

export default ProtectedRoute;