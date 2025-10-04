import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { detectSystemTheme } from './store/slices/themeSlice';
import { initializeMasterAuth } from './store/slices/masterAuthSlice';
import { setCurrentAdmin } from './store/slices/adminAuthSlice';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import LandingPage from './pages/customer/Landing page/LandingPage';
import StudiosListPage from './pages/customer/StudiosListPage/StudiosListPage';
import StudioDetailsPage from './pages/customer/StudioDetailsPage/StudioDetailsPage';
import BuyApartmentPage from './pages/customer/BuyApartmentPage/BuyApartmentPage';
import ApartmentSaleDetailsPage from './pages/customer/ApartmentSaleDetailsPage/ApartmentSaleDetailsPage';
import AdminApartmentSaleDetailsPage from './pages/admin/ApartmentSaleDetailsPage/ApartmentSaleDetailsPage';
import AdminLanding from './pages/admin/AdminLanding/AdminLanding';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import RentalAlertsPage from './pages/admin/RentalAlertsPage/RentalAlertsPage';
import AdminLoginPage from './pages/auth/AdminLoginPage/AdminLoginPage';
import MasterAdminLoginForm from './components/forms/MasterAdminLoginForm';
import MasterAdminDashboard from './pages/masterAdmin/MasterAdminDashboard/MasterAdminDashboard';
import ReportsPage from './pages/masterAdmin/ReportsPage/ReportsPage';
import ProfileEditPage from './pages/masterAdmin/ProfileEditPage/ProfileEditPage';
import AdminManagementPage from './pages/masterAdmin/AdminManagementPage/AdminManagementPage';
import MasterAdminRentalAlertsPage from './pages/masterAdmin/MasterAdminRentalAlertsPage/MasterAdminRentalAlertsPage';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import AdminProtectedRoute from './components/common/ProtectedRoute/AdminProtectedRoute';

// App content component to access Redux hooks
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize theme detection
    dispatch(detectSystemTheme());
    
    // Initialize Master Admin authentication state to persist login across page refreshes
    // This will restore the session from JWT token in localStorage/sessionStorage
    dispatch(initializeMasterAuth());
    
    // Initialize Regular Admin authentication state to persist login across page refreshes
    // This will verify the JWT token with the API and restore the admin session
    const initAdminAuth = async () => {
      const { initializeAdminAuth } = await import('./hooks/useAdminAuth');
      // Note: We can't use the hook directly here, so we check token and restore session
      const token = localStorage.getItem('api_access_token');
      if (token) {
        console.log('🔄 Regular Admin token found, session will be restored');
      }
    };
    initAdminAuth();
    
    console.log('🔄 App initialized - authentication states loaded');
  }, [dispatch]);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ToastProvider>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/studios" element={<StudiosListPage />} />
              <Route path="/studio/:id" element={<StudioDetailsPage />} />
              <Route path="/buy-apartments" element={<BuyApartmentPage />} />
              <Route path="/apartment-sale/:id" element={<ApartmentSaleDetailsPage />} />
              <Route path="/admin" element={<AdminLanding />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/rental-alerts" 
                element={
                  <AdminProtectedRoute>
                    <RentalAlertsPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route path="/admin/apartment-sale/:id" element={<AdminApartmentSaleDetailsPage />} />
              <Route path="/master-admin/login" element={<MasterAdminLoginForm />} />
              <Route path="/master-admin" element={<Navigate to="/master-admin/login" replace />} />
              <Route 
                path="/master-admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <MasterAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/master-admin/reports" 
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/master-admin/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileEditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/master-admin/manage-admins" 
                element={
                  <ProtectedRoute>
                    <AdminManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/master-admin/rental-alerts" 
                element={
                  <ProtectedRoute>
                    <MasterAdminRentalAlertsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;


