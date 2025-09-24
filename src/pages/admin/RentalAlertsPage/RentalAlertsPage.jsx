import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { apartmentPartsApi, rentalContractsApi, rentApartmentsApi } from '../../../services/api';
import BackButton from '../../../components/common/BackButton';
import RentalAlerts from '../../../components/admin/RentalAlerts/RentalAlerts';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import './RentalAlertsPage.css';

const RentalAlertsPage = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalApartments: 0,
    totalStudios: 0,
    rentedStudios: 0,
    availableStudios: 0
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (currentAdmin?.id || currentAdmin?.email) {
        setIsLoading(true);
        try {
          // Fetch apartments created by this admin
          const apartmentsResponse = await rentApartmentsApi.getAll();
          const adminApartments = apartmentsResponse.success ? 
            apartmentsResponse.data.filter(apt => apt.created_by === currentAdmin.email) : [];

          // Fetch studios created by this admin
          const studiosResponse = await apartmentPartsApi.getAll();
          const adminStudios = studiosResponse.success ? 
            studiosResponse.data.filter(studio => studio.created_by === currentAdmin.email) : [];

          // Get rental contracts to determine rented/available status
          const contractsResponse = await rentalContractsApi.getAll();
          const activeContracts = contractsResponse.success ? 
            contractsResponse.data.filter(contract => contract.status === 'active') : [];

          // Calculate statistics
          const rentedStudios = adminStudios.filter(studio => 
            activeContracts.some(contract => contract.apartment_part_id === studio.id)
          ).length;
          
          const availableStudios = adminStudios.length - rentedStudios;

          setAdminStats({
            totalApartments: adminApartments.length,
            totalStudios: adminStudios.length,
            rentedStudios,
            availableStudios
          });
        } catch (error) {
          console.error('Error fetching admin stats:', error);
          // Set default stats on error
          setAdminStats({
            totalApartments: 0,
            totalStudios: 0,
            rentedStudios: 0,
            availableStudios: 0
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAdminStats();
  }, [currentAdmin]);

  if (!currentAdmin) {
    return (
      <div className="rental-alerts-page-loading">
        <LoadingSpinner />
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rental-alerts-page-loading">
        <LoadingSpinner />
        <p>Loading rental alerts...</p>
      </div>
    );
  }

  return (
    <div className="rental-alerts-page">
      {/* Hero Section with Background */}
      <div className="alerts-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="alerts-hero-overlay">
          <div className="alerts-hero-content">
            {/* Navigation */}
            <nav className="alerts-nav">
              <div className="alerts-nav-actions">
                <BackButton 
                  text="← Back to Admin Dashboard"
                  onClick={() => navigate('/admin/dashboard')}
                  variant="transparent"
                />
              </div>
              <div className="alerts-brand">
                <h1>Ahmed Othman Group</h1>
                <span className="alerts-portal-text">Rental Alerts Portal</span>
              </div>
            </nav>

            {/* Page Header */}
            <div className="alerts-page-header">
              <h2 className="alerts-title">
                Rental <span className="accent">Alerts</span>
              </h2>
              <p className="alerts-subtitle">
                Monitor and manage rental expirations for your properties
              </p>
              
              {/* Quick Stats */}
              <div className="alerts-stats">
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalApartments}</div>
                  <div className="stat-label">Apartments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalStudios}</div>
                  <div className="stat-label">Total Studios</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.rentedStudios}</div>
                  <div className="stat-label">Rented</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.availableStudios}</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Alerts Section */}
      <div className="alerts-main-section">
        <div className="alerts-container">
          <div className="alerts-section-header">
            <h3>🔔 Active Rental Alerts</h3>
            <p>Studios requiring attention for rental renewals or status updates</p>
          </div>
          
          {/* Rental Alerts Component */}
          <div className="alerts-content">
            <RentalAlerts adminEmail={currentAdmin?.email || currentAdmin?.accountOrMobile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAlertsPage;