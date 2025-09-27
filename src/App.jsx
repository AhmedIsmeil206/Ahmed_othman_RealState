import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { detectSystemTheme } from './store/slices/themeSlice';
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

// App content component to access Redux hooks
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize theme detection only
    dispatch(detectSystemTheme());
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
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/rental-alerts" element={<RentalAlertsPage />} />
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


