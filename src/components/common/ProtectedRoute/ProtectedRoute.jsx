import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import LoadingSpinner from '../LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useMasterAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!currentUser) {
    return <Navigate to="/master-admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;