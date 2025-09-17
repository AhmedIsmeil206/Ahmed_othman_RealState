import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../../../hooks/useRedux';
import { 
  getStudiosNeedingRenewal, 
  formatAlertMessage, 
  calculateDaysRemaining 
} from '../../../utils/helpers/rentalAlerts';
import './RentalAlerts.css';

const RentalAlerts = ({ adminEmail }) => {
  const navigate = useNavigate();
  const { apartments, getApartmentsByCreator, updateStudio } = useProperty();
  const [alertStudios, setAlertStudios] = useState([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Get apartments for current admin
  const adminApartments = adminEmail ? 
    getApartmentsByCreator(adminEmail) : 
    apartments;

  useEffect(() => {
    const studiosWithAlerts = getStudiosNeedingRenewal(adminApartments);
    setAlertStudios(studiosWithAlerts);
  }, [adminApartments]);

  const handleContactTenant = (studio) => {
    if (studio.rental?.tenantContact) {
      // Open phone dialer or email client
      if (studio.rental.tenantContact.includes('@')) {
        window.location.href = `mailto:${studio.rental.tenantContact}?subject=Rental Renewal - ${studio.title}&body=Hi ${studio.rental.tenantName},%0A%0AYour rental for ${studio.title} is expiring soon. Please contact us to discuss renewal options.%0A%0AThank you!`;
      } else {
        window.location.href = `tel:${studio.rental.tenantContact}`;
      }
    }
  };

  const handleMarkAsRenewed = (studio) => {
    // Update studio to extend rental period
    const today = new Date();
    const newEndDate = new Date(today);
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Extend by 1 month

    const updatedStudio = {
      ...studio,
      rental: {
        ...studio.rental,
        endDate: newEndDate.toISOString().split('T')[0],
        needsRenewal: false
      },
      isAvailable: false // Mark as rented
    };

    updateStudio(studio.apartmentId, updatedStudio);
  };

  const handleMarkAsAvailable = (studio) => {
    // Mark studio as available again
    const updatedStudio = {
      ...studio,
      rental: {
        ...studio.rental,
        isRented: false,
        tenantName: '',
        tenantContact: '',
        startDate: '',
        endDate: '',
        needsRenewal: false
      },
      isAvailable: true
    };

    updateStudio(studio.apartmentId, updatedStudio);
  };

  const handleStudioClick = (studio) => {
    // Navigate to studio details page with admin rental alerts source
    navigate(`/studio/${studio.id}?source=admin-rental-alerts`);
  };

  if (alertStudios.length === 0) {
    return (
      <div className="rental-alerts no-alerts">
        <h3>🎉 No Rental Alerts</h3>
        <p>All your rentals are up to date!</p>
      </div>
    );
  }

  const displayedAlerts = showAllAlerts ? alertStudios : alertStudios.slice(0, 3);

  return (
    <div className="rental-alerts">
      <div className="alerts-header">
        <h3>
          🔔 Rental Alerts 
          <span className="alert-count">({alertStudios.length})</span>
        </h3>
        {alertStudios.length > 3 && (
          <button 
            className="toggle-alerts-btn"
            onClick={() => setShowAllAlerts(!showAllAlerts)}
          >
            {showAllAlerts ? 'Show Less' : `Show All (${alertStudios.length})`}
          </button>
        )}
      </div>

      <div className="alerts-list">
        {displayedAlerts.map((studio, index) => {
          const formattedAlert = formatAlertMessage(studio.alert);
          
          return (
            <div key={`${studio.apartmentId}-${studio.id}`} className={`alert-card ${formattedAlert.className}`}>
              <div className="alert-icon">{formattedAlert.icon}</div>
              
              <div className="alert-content" onClick={() => handleStudioClick(studio)}>
                <div className="alert-title">
                  <h4>{formattedAlert.title}</h4>
                  <span className="studio-info">
                    {studio.title} - {studio.apartmentName}
                  </span>
                </div>
                
                <div className="alert-message">
                  {formattedAlert.message}
                </div>
                
                {studio.rental?.tenantName && (
                  <div className="tenant-info">
                    <strong>Tenant:</strong> {studio.rental.tenantName}
                    {studio.rental.tenantContact && (
                      <span className="tenant-contact">
                        • {studio.rental.tenantContact}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="alert-actions">
                {studio.rental?.tenantContact && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleContactTenant(studio)}
                    title="Contact tenant"
                  >
                    📞 Contact
                  </button>
                )}
                
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleMarkAsRenewed(studio)}
                  title="Mark as renewed"
                >
                  ✅ Renewed
                </button>
                
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMarkAsAvailable(studio)}
                  title="Mark as available"
                >
                  🏠 Available
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {alertStudios.length > 0 && (
        <div className="alerts-summary">
          <p>
            <strong>Summary:</strong> {alertStudios.filter(s => s.alert.status === 'overdue').length} overdue, 
            {' '}{alertStudios.filter(s => s.alert.status === 'expiring-soon').length} expiring soon
          </p>
        </div>
      )}
    </div>
  );
};

export default RentalAlerts;