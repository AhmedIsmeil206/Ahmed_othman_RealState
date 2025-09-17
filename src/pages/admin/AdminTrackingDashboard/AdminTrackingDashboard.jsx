import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../../hooks/useRedux';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './AdminTrackingDashboard.css';

const AdminTrackingDashboard = () => {
  const navigate = useNavigate();
  const { 
    dashboardData, 
    isLoading, 
    error, 
    fetchMasterAdminStats
  } = useDashboardData();
  
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    fetchMasterAdminStats();
  }, []);

  const handleViewDetails = (adminEmail) => {
    setSelectedAdmin(selectedAdmin === adminEmail ? null : adminEmail);
  };

  const handleRefreshData = () => {
    fetchMasterAdminStats();
  };

  const adminStats = dashboardData?.adminStats || [];
  
  const totals = {
    totalAdmins: dashboardData?.totalAdmins || 0,
    totalApartments: dashboardData?.totalProperties || 0,
    totalStudios: dashboardData?.totalStudios || 0,
    totalAvailable: dashboardData?.availableStudios || 0,
    totalBooked: dashboardData?.occupiedStudios || 0
  };

  if (isLoading) {
    return (
      <div className="admin-tracking-dashboard loading-container">
        <LoadingSpinner size="large" />
        <p>Loading admin performance data...</p>
      </div>
    );
  }

  if (error && !adminStats.length) {
    return (
      <div className="admin-tracking-dashboard error-container">
        <div className="error-content">
          <h2>Failed to Load Performance Data</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="btn btn--primary"
              onClick={handleRefreshData}
            >
              Retry
            </button>
            <button 
              className="btn btn--secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tracking-dashboard">
      <div className="tracking-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
             Back
          </button>
          <h1 className="tracking-title">
            Admin Performance <span className="accent">Tracking</span>
          </h1>
          <p className="tracking-subtitle">
            Monitor and track property creation across all administrators
          </p>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-number">{totals.totalAdmins}</div>
            <div className="stat-label">Total Admins</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-number">{totals.totalApartments}</div>
            <div className="stat-label">Total Apartments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-number">{totals.totalStudios}</div>
            <div className="stat-label">Total Studios</div>
          </div>
        </div>
        <div className="stat-card available">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-number">{totals.totalAvailable}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card booked">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-number">{totals.totalBooked}</div>
            <div className="stat-label">Occupied</div>
          </div>
        </div>
      </div>

      <div className="admin-cards-section">
        <div className="section-header">
          <h2 className="section-title">Administrator Performance</h2>
          <button 
            className="btn btn--secondary"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : ' Refresh Data'}
          </button>
        </div>
        
        {adminStats.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon"></div>
            <h3>No Admin Data Available</h3>
            <p>No administrators have created properties yet.</p>
          </div>
        ) : (
          <div className="admin-cards-grid">
            {adminStats.map((admin, index) => {
              const adminEmail = admin.admin?.email || admin.admin?.account_or_mobile || `admin-${index}`;
              const adminName = admin.admin?.full_name || admin.admin?.username || adminEmail;
              
              return (
                <div key={adminEmail} className="admin-performance-card">
                  <div className="admin-card-header">
                    <div className="admin-info">
                      <div className="admin-avatar">
                        {adminName.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-details">
                        <h3 className="admin-name">{adminName}</h3>
                        <div className="admin-email">{adminEmail}</div>
                        <div className="admin-badge">
                          {admin.admin?.role === 'studio_rental' ? 'Studio Rental' : 'Apartment Sales'}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(adminEmail)}
                    >
                      {selectedAdmin === adminEmail ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  <div className="admin-card-stats">
                    <div className="mini-stat">
                      <span className="mini-stat-number">{admin.totalRentApartments || 0}</span>
                      <span className="mini-stat-label">Rent Apartments</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-number">{admin.totalSaleApartments || 0}</span>
                      <span className="mini-stat-label">Sale Apartments</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-number">{admin.totalStudios || 0}</span>
                      <span className="mini-stat-label">Studios</span>
                    </div>
                    <div className="mini-stat available">
                      <span className="mini-stat-number">{admin.availableStudios || 0}</span>
                      <span className="mini-stat-label">Available</span>
                    </div>
                    <div className="mini-stat booked">
                      <span className="mini-stat-number">{admin.occupiedStudios || 0}</span>
                      <span className="mini-stat-label">Occupied</span>
                    </div>
                  </div>

                  <div className="performance-indicator">
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ 
                          width: `${admin.occupancyRate || 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="performance-text">
                      {admin.occupancyRate || 0}% Occupancy Rate
                    </span>
                  </div>

                  <div className="admin-revenue">
                    <div className="revenue-stat">
                      <span className="revenue-label">Monthly Revenue:</span>
                      <span className="revenue-value">{admin.monthlyRevenue || 0} EGP</span>
                    </div>
                    <div className="revenue-stat">
                      <span className="revenue-label">Active Contracts:</span>
                      <span className="revenue-value">{admin.activeContracts || 0}</span>
                    </div>
                  </div>

                  {selectedAdmin === adminEmail && (
                    <div className="admin-details-section">
                      <div className="details-tabs">
                        <h4> Performance Summary</h4>
                      </div>
                      
                      <div className="performance-details">
                        <div className="detail-row">
                          <span className="detail-label">Total Properties:</span>
                          <span className="detail-value">
                            {(admin.totalRentApartments || 0) + (admin.totalSaleApartments || 0)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Studio Occupancy:</span>
                          <span className="detail-value">
                            {admin.occupiedStudios || 0} / {admin.totalStudios || 0} 
                            ({admin.occupancyRate || 0}%)
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Monthly Revenue:</span>
                          <span className="detail-value">{admin.monthlyRevenue || 0} EGP</span>
                        </div>
                        {admin.totalStudios > 0 && (
                          <div className="detail-row">
                            <span className="detail-label">Average Rent:</span>
                            <span className="detail-value">
                              {admin.activeContracts > 0 
                                ? Math.round(admin.monthlyRevenue / admin.activeContracts)
                                : 0
                              } EGP/studio
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrackingDashboard;
