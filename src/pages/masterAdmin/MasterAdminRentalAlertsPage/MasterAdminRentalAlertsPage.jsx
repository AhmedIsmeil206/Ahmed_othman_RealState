import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth, useProperty } from '../../../hooks/useRedux';
import BackButton from '../../../components/common/BackButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { 
  getStudiosNeedingRenewal, 
  formatAlertMessage, 
  calculateDaysRemaining 
} from '../../../utils/helpers/rentalAlerts';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import './MasterAdminRentalAlertsPage.css';

const MasterAdminRentalAlertsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useMasterAuth();
  const { apartments } = useProperty();
  const [isLoading, setIsLoading] = useState(true);
  const [alertStudios, setAlertStudios] = useState([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [filterDays, setFilterDays] = useState(5); // Default to 5 days
  const [stats, setStats] = useState({
    totalAlerts: 0,
    urgentAlerts: 0,
    overdue: 0
  });

  useEffect(() => {
    if (apartments.length >= 0) {
      // Get all studios with rental alerts (from all admins)
      const studiosWithAlerts = getStudiosNeedingRenewal(apartments);
      
      // Filter by days remaining (5 days or less by default)
      const filteredStudios = studiosWithAlerts.filter(studio => {
        const daysRemaining = calculateDaysRemaining(studio.rental?.endDate);
        return daysRemaining <= filterDays;
      });
      
      setAlertStudios(filteredStudios);
      
      // Calculate statistics
      const urgentAlerts = filteredStudios.filter(studio => {
        const daysRemaining = calculateDaysRemaining(studio.rental?.endDate);
        return daysRemaining <= 2 && daysRemaining >= 0;
      }).length;
      
      const overdue = filteredStudios.filter(studio => {
        const daysRemaining = calculateDaysRemaining(studio.rental?.endDate);
        return daysRemaining < 0;
      }).length;
      
      setStats({
        totalAlerts: filteredStudios.length,
        urgentAlerts,
        overdue
      });
      
      setIsLoading(false);
    }
  }, [apartments, filterDays]);

  const handleStudioClick = (studio) => {
    // Navigate to studio details page with master admin rental alerts source
    navigate(`/studio/${studio.id}?source=master-admin-rental-alerts`);
  };

  const handleContactTenant = (studio) => {
    if (studio.rental?.tenantContact) {
      if (studio.rental.tenantContact.includes('@')) {
        window.location.href = `mailto:${studio.rental.tenantContact}?subject=Rental Renewal - ${studio.title}&body=Hi ${studio.rental.tenantName},%0A%0AYour rental for ${studio.title} is expiring soon. Please contact us to discuss renewal options.%0A%0AThank you!`;
      } else {
        window.location.href = `tel:${studio.rental.tenantContact}`;
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="master-admin-alerts-loading">
        <LoadingSpinner />
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="master-admin-alerts-loading">
        <LoadingSpinner />
        <p>Loading rental alerts...</p>
      </div>
    );
  }

  const displayedAlerts = showAllAlerts ? alertStudios : alertStudios.slice(0, 6);

  return (
    <div className="master-admin-rental-alerts-page">
      {/* Hero Section with Background */}
      <div className="master-alerts-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="master-alerts-hero-overlay">
          <div className="master-alerts-hero-content">
            {/* Navigation */}
            <nav className="master-alerts-nav">
              <div className="master-alerts-nav-actions">
                <BackButton 
                  text="← Back to Master Admin Dashboard"
                  onClick={() => navigate('/master-admin/dashboard')}
                  variant="transparent"
                />
              </div>
              <div className="master-alerts-brand">
                <h1>Ahmed Othman Group</h1>
                <span className="master-alerts-portal-text">Master Admin Rental Alerts</span>
              </div>
            </nav>

            {/* Page Header */}
            <div className="master-alerts-page-header">
              <h2 className="master-alerts-title">
                Rental <span className="accent">Alerts</span>
              </h2>
              <p className="master-alerts-subtitle">
                Monitor all rental expirations across the entire system
              </p>
              
              {/* Quick Stats */}
              <div className="master-alerts-stats">
                <div className="stat-card urgent">
                  <div className="stat-number">{stats.overdue}</div>
                  <div className="stat-label">Overdue</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-number">{stats.urgentAlerts}</div>
                  <div className="stat-label">Urgent (≤2 days)</div>
                </div>
                <div className="stat-card info">
                  <div className="stat-number">{stats.totalAlerts}</div>
                  <div className="stat-label">Total Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Alerts Section */}
      <div className="master-alerts-main-section">
        <div className="master-alerts-container">
          <div className="master-alerts-controls">
            <div className="alerts-filter">
              <label htmlFor="days-filter">Show rentals expiring within:</label>
              <select 
                id="days-filter" 
                value={filterDays} 
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className="days-filter-select"
              >
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            
            {alertStudios.length > 6 && (
              <button 
                className="toggle-alerts-btn"
                onClick={() => setShowAllAlerts(!showAllAlerts)}
              >
                {showAllAlerts ? 'Show Less' : `Show All (${alertStudios.length})`}
              </button>
            )}
          </div>

          {alertStudios.length === 0 ? (
            <div className="no-alerts">
              <div className="no-alerts-icon">🎉</div>
              <h3>No Rental Alerts</h3>
              <p>All rentals are up to date within the selected timeframe!</p>
            </div>
          ) : (
            <div className="master-alerts-content">
              <div className="alerts-list">
                {displayedAlerts.map((studio, index) => {
                  const formattedAlert = formatAlertMessage(studio.alert);
                  const daysRemaining = calculateDaysRemaining(studio.rental?.endDate);
                  
                  return (
                    <div key={`${studio.apartmentId}-${studio.id}`} className={`master-alert-card ${formattedAlert.className}`}>
                      <div className="alert-header">
                        <div className="alert-icon">{formattedAlert.icon}</div>
                        <div className="alert-priority">
                          {daysRemaining < 0 ? 'OVERDUE' : 
                           daysRemaining <= 2 ? 'URGENT' : 
                           daysRemaining <= 5 ? 'WARNING' : 'INFO'}
                        </div>
                      </div>
                      
                      <div className="master-alert-content" onClick={() => handleStudioClick(studio)}>
                        <div className="alert-title">
                          <h4>{studio.title}</h4>
                          <span className="studio-info">
                            {studio.apartmentName} • Created by: {studio.createdBy || 'Unknown Admin'}
                          </span>
                        </div>
                        
                        <div className="alert-message">
                          {formattedAlert.message}
                        </div>
                        
                        <div className="rental-details">
                          <div className="detail-item">
                            <strong>Days Remaining:</strong> 
                            <span className={daysRemaining < 0 ? 'overdue' : daysRemaining <= 2 ? 'urgent' : 'normal'}>
                              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>End Date:</strong> {studio.rental?.endDate || 'Not set'}
                          </div>
                          {studio.rental?.tenantName && (
                            <div className="detail-item">
                              <strong>Tenant:</strong> {studio.rental.tenantName}
                              {studio.rental.tenantContact && (
                                <span className="tenant-contact"> • {studio.rental.tenantContact}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="master-alert-actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStudioClick(studio)}
                          title="View studio details"
                        >
                          👁️ View Details
                        </button>
                        
                        {studio.rental?.tenantContact && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleContactTenant(studio)}
                            title="Contact tenant"
                          >
                            📞 Contact
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {alertStudios.length > 0 && (
            <div className="master-alerts-summary">
              <div className="summary-card">
                <h4>📊 Summary Report</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Total Properties at Risk:</span>
                    <span className="summary-value">{stats.totalAlerts}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Require Immediate Action:</span>
                    <span className="summary-value urgent">{stats.overdue + stats.urgentAlerts}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Filter Period:</span>
                    <span className="summary-value">{filterDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterAdminRentalAlertsPage;