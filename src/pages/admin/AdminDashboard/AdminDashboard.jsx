import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth, useProperty } from '../../../hooks/useRedux';
import ApartmentCard from '../../../components/admin/ApartmentCard';
import SaleApartmentCard from '../../../components/admin/SaleApartmentCard';
import AddStudioModal from '../../../components/admin/AddStudioModal';
import AddApartmentModal from '../../../components/admin/AddApartmentModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentAdmin, logoutAdmin } = useAdminAuth();
  const { getApartmentsByCreator, addApartment, addStudio, verifyDataConsistency, clearAllData, 
          getSaleApartmentsByCreator, addSaleApartment, saleApartments } = useProperty();
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [isAddApartmentModalOpen, setIsAddApartmentModalOpen] = useState(false);
  const [isAddSaleApartmentModalOpen, setIsAddSaleApartmentModalOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [isProcessingStudio, setIsProcessingStudio] = useState(false);
  const [isProcessingApartment, setIsProcessingApartment] = useState(false);
  
  // Get admin role from current admin data
  const adminRole = currentAdmin?.role || 'studio_rental';
  
  // Regular admins only see their own apartments
  const adminApartments = currentAdmin ? 
    getApartmentsByCreator(currentAdmin.email || currentAdmin.accountOrMobile) : 
    [];
    
  // Get sale apartments for apartment sales managers
  const adminSaleApartments = currentAdmin && adminRole === 'apartment_sales' ? 
    getSaleApartmentsByCreator(currentAdmin.email || currentAdmin.accountOrMobile) : 
    [];

  const handleLogout = async () => {
    try {
      // Simulate logout processing
      await new Promise(resolve => setTimeout(resolve, 500));
      logoutAdmin();
      navigate('/admin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAddStudio = (apartmentId = null) => {
    setSelectedApartmentId(apartmentId);
    setIsAddStudioModalOpen(true);
  };

  const handleAddApartment = () => {
    setIsAddApartmentModalOpen(true);
  };

  const handleStudioAdded = async (studioData) => {
    setIsProcessingStudio(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addStudio(studioData.apartmentId, {
        ...studioData,
        createdBy: currentAdmin?.email || currentAdmin?.accountOrMobile,
        createdAt: new Date().toISOString()
      });
      setIsAddStudioModalOpen(false);
      setSelectedApartmentId(null);
    } catch (error) {
      console.error('Error adding studio:', error);
    } finally {
      setIsProcessingStudio(false);
    }
  };

  const handleApartmentAdded = async (apartmentData) => {
    setIsProcessingApartment(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (adminRole === 'studio_rental') {
        // Add rental apartment with studios
        addApartment({
          ...apartmentData,
          createdBy: currentAdmin?.email || currentAdmin?.accountOrMobile,
          createdAt: new Date().toISOString()
        });
        setIsAddApartmentModalOpen(false);
      } else if (adminRole === 'apartment_sales') {
        // Add sale apartment
        addSaleApartment({
          ...apartmentData,
          createdBy: currentAdmin?.email || currentAdmin?.accountOrMobile,
          createdAt: new Date().toISOString(),
          type: 'sale'
        });
        setIsAddSaleApartmentModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding apartment:', error);
    } finally {
      setIsProcessingApartment(false);
    }
  };

  const handleAddSaleApartment = () => {
    setIsAddSaleApartmentModalOpen(true);
  };

  // Debug function to verify data consistency (can be removed in production)
  const handleVerifyData = () => {
    console.log('🔍 Verifying data consistency...');
    const result = verifyDataConsistency();
    alert(`Data Check Complete!\nApartments: ${result.totalApartments}\nTotal Studios: ${result.totalStudios}\nAvailable Studios: ${result.availableStudios}\n\nCheck console for detailed information.`);
  };

  // Clear all mock data (for testing)
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL apartments and studios? This will remove all mock data and start fresh.')) {
      clearAllData();
      alert('All data cleared! You can now add fresh apartments and studios.');
    }
  };

  if (!currentAdmin) {
    return (
      <div className="admin-dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Hero Section with Background */}
      <div className="admin-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="admin-hero-overlay">
          <div className="admin-hero-content">
            {/* Navigation */}
            <nav className="admin-nav">
              <div className="admin-brand">
                <h1>Ahmed Othman Group</h1>
                <span className="admin-portal-text">Admin Portal</span>
              </div>
              <div className="admin-nav-actions">
                <button 
                  onClick={() => navigate('/admin/rental-alerts')}
                  className="rental-alerts-btn"
                >
                  🔔 Rental Alerts
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            </nav>

            {/* Dashboard Header */}
            <div className="admin-dashboard-header">
              <h2 className="dashboard-title">
                My <span className="accent">Properties</span>
              </h2>
              <p className="dashboard-subtitle">
                {adminRole === 'studio_rental' 
                  ? 'Manage your rental apartments and studios' 
                  : 'Manage your apartments for sale'
                }
              </p>
              
              <div className="dashboard-controls">
                <div className="cta-group">
                  {adminRole === 'studio_rental' ? (
                    <>
                      <button 
                        onClick={handleAddApartment}
                        className="btn btn--primary"
                        disabled={isProcessingApartment || isProcessingStudio}
                      >
                        {isProcessingApartment ? (
                          <>
                            <LoadingSpinner size="small" color="white" inline />
                            Processing...
                          </>
                        ) : (
                          '+ Add New Rental Apartment'
                        )}
                      </button>
                      <button 
                        onClick={() => handleAddStudio()}
                        className="btn btn--secondary"
                        disabled={isProcessingApartment || isProcessingStudio}
                      >
                        {isProcessingStudio ? (
                          <>
                            <LoadingSpinner size="small" color="white" inline />
                            Processing...
                          </>
                        ) : (
                          '+ Add Studio to Apartment'
                        )}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleAddSaleApartment}
                      className="btn btn--primary"
                      disabled={isProcessingApartment}
                    >
                      {isProcessingApartment ? (
                        <>
                          <LoadingSpinner size="small" color="white" inline />
                          Processing...
                        </>
                      ) : (
                        '+ List Apartment for Sale'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="admin-properties-section">
        <div className="properties-container">
          {adminRole === 'studio_rental' ? (
            // Studio Rental Manager View
            adminApartments.length === 0 ? (
              <div className="no-properties">
                <div className="no-properties-content">
                  <h3>No Rental Properties Yet</h3>
                  <p>Start by adding your first apartment to manage studios and rentals.</p>
                </div>
              </div>
            ) : (
              <div className="apartments-grid">
                {adminApartments.map((apartment) => (
                  <ApartmentCard
                    key={apartment.id}
                    apartment={apartment}
                    onAddStudio={handleAddStudio}
                    isAdminView={true}
                  />
                ))}
              </div>
            )
          ) : (
            // Apartment Sales Manager View
            adminSaleApartments.length === 0 ? (
              <div className="no-properties">
                <div className="no-properties-content">
                  <h3>No Apartments Listed for Sale</h3>
                  <p>Start by listing your first apartment for sale.</p>
                </div>
              </div>
            ) : (
              <div className="apartments-grid">
                {adminSaleApartments.map((apartment) => (
                  <SaleApartmentCard
                    key={apartment.id}
                    apartment={apartment}
                    isAdminView={true}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      {adminRole === 'studio_rental' && (
        <AddStudioModal
          isOpen={isAddStudioModalOpen}
          onClose={() => setIsAddStudioModalOpen(false)}
          onStudioAdded={handleStudioAdded}
          apartmentId={selectedApartmentId}
          isLoading={isProcessingStudio}
        />
      )}

      {adminRole === 'studio_rental' && (
        <AddApartmentModal
          isOpen={isAddApartmentModalOpen}
          onClose={() => setIsAddApartmentModalOpen(false)}
          onApartmentAdded={handleApartmentAdded}
          isLoading={isProcessingApartment}
        />
      )}

      {adminRole === 'apartment_sales' && (
        <AddApartmentModal
          isOpen={isAddSaleApartmentModalOpen}
          onClose={() => setIsAddSaleApartmentModalOpen(false)}
          onApartmentAdded={handleApartmentAdded}
          isLoading={isProcessingApartment}
          isSaleApartment={true}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
