import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { authApi } from '../../../services/api';
import LoadingSpinner from '../LoadingSpinner';

/**
 * AdminProtectedRoute Component
 * Protects regular admin routes and ensures authentication persistence across page refreshes
 * Verifies JWT token on mount and restores admin session from API
 */
const AdminProtectedRoute = ({ children }) => {
  const { currentAdmin, isLoading, initializeAdminAuth } = useAdminAuth();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Only initialize once
      if (initializationAttempted) {
        return;
      }

      setInitializationAttempted(true);
      console.log('🔐 AdminProtectedRoute: Initializing admin authentication...');

      try {
        // Check if we have a JWT token
        const hasToken = authApi.isAuthenticated();
        
        if (hasToken && !currentAdmin) {
          console.log('📋 AdminProtectedRoute: JWT token found, restoring admin session...');
          
          // Initialize admin auth from token
          const result = await initializeAdminAuth();
          
          if (result.success) {
            console.log('✅ AdminProtectedRoute: Admin session restored successfully');
          } else {
            console.log('⚠️ AdminProtectedRoute: Failed to restore admin session:', result.message);
          }
        } else if (!hasToken) {
          console.log('ℹ️ AdminProtectedRoute: No JWT token found');
        } else {
          console.log('ℹ️ AdminProtectedRoute: Admin already authenticated');
        }
      } catch (error) {
        console.error('❌ AdminProtectedRoute: Initialization error:', error);
      } finally {
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          setIsInitializing(false);
          console.log('✅ AdminProtectedRoute: Initialization complete');
        }, 100);
      }
    };

    initAuth();
  }, [initializeAdminAuth, currentAdmin, initializationAttempted]);

  // Show loading spinner while initializing
  if (isInitializing || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  // After initialization, check if admin is authenticated
  if (!currentAdmin) {
    console.log('🔒 AdminProtectedRoute: Not authenticated, redirecting to login');
    // Redirect to admin login page
    const redirectUrl = `/admin/login?from=protected&path=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Admin is authenticated, render protected content
  console.log('✅ AdminProtectedRoute: Admin authenticated, rendering protected content');
  return children;
};

export default AdminProtectedRoute;
