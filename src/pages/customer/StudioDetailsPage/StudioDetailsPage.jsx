import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ImageGallery from '../../../components/customer/ImageGallery/ImageGallery';
import WhatsAppButton from '../../../components/customer/WhatsAppButton/WhatsAppButton';
import BookingModal from '../../../components/admin/BookingModal';
import EditStudioModal from '../../../components/admin/EditStudioModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { useProperty } from '../../../hooks/useRedux';
import './StudioDetailsPage.css';

const StudioDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getStudioById, updateStudio, getApartmentById } = useProperty();
  const [navigationSource, setNavigationSource] = useState('customer-studios');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studioBooking, setStudioBooking] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  
  const studio = getStudioById(id);
  const parentApartment = studio ? getApartmentById(studio.apartmentId) : null;

  useEffect(() => {
    // Get the navigation source from URL parameters
    const source = searchParams.get('source');
    
    if (['master-admin-dashboard', 'customer-studios', 'admin-dashboard', 'admin-tracking', 'admin-rental-alerts', 'master-admin-rental-alerts'].includes(source)) {
      setNavigationSource(source);
    } else {
      // Default to customer studios if no valid source in URL
      setNavigationSource('customer-studios');
    }

    // Check for existing booking for this studio
    const existingBooking = localStorage.getItem(`studio_booking_${id}`);
    if (existingBooking) {
      const bookingData = JSON.parse(existingBooking);
      setStudioBooking(bookingData);
    }
  }, [id, searchParams]);

  // Separate effect to sync existing booking data with studio rental info
  useEffect(() => {
    if (studio && studioBooking && (!studio.rental || !studio.rental.isRented)) {
      const updatedStudio = {
        ...studio,
        isAvailable: false, // Mark as rented
        rental: {
          isRented: true,
          tenantName: studioBooking.customerName,
          tenantContact: studioBooking.customerPhone,
          startDate: studioBooking.startDate,
          endDate: studioBooking.endDate,
          bookingDate: studioBooking.bookingDate,
          customerId: studioBooking.customerId,
          paidDeposit: studioBooking.paidDeposit,
          warranty: studioBooking.warranty,
          rentPeriod: studioBooking.rentPeriod,
          platformSource: studioBooking.platformSource,
          needsRenewal: false
        }
      };
      
      // Update the studio in the PropertyContext
      updateStudio(studio.apartmentId, updatedStudio);
    }
  }, [studio, studioBooking, updateStudio]);

  const handleBookingSubmit = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save booking to localStorage
      localStorage.setItem(`studio_booking_${id}`, JSON.stringify(bookingData));
      setStudioBooking(bookingData);
      
      // Update studio with rental information for alert system
      const updatedStudio = {
        ...studio,
        isAvailable: false, // Mark as rented
        rental: {
          isRented: true,
          tenantName: bookingData.customerName,
          tenantContact: bookingData.customerPhone,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          bookingDate: bookingData.bookingDate,
          customerId: bookingData.customerId,
          paidDeposit: bookingData.paidDeposit,
          warranty: bookingData.warranty,
          rentPeriod: bookingData.rentPeriod,
          platformSource: bookingData.platformSource,
          needsRenewal: false
        }
      };
      
      // Update the studio in the PropertyContext
      updateStudio(studio.apartmentId, updatedStudio);
      
      setIsBookingModalOpen(false);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleStudioUpdate = async (updatedStudioData) => {
    setIsEditLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the studio in the PropertyContext
      updateStudio(studio.apartmentId, updatedStudioData);
      setIsEditModalOpen(false);
      // The studio data will automatically update through context
    } catch (error) {
      console.error('Error updating studio:', error);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      setIsDeletingBooking(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remove booking from localStorage
        localStorage.removeItem(`studio_booking_${id}`);
        setStudioBooking(null);
      } catch (error) {
        console.error('Error deleting booking:', error);
      } finally {
        setIsDeletingBooking(false);
      }
    }
  };

  // Determine the back link based on specific source
  const getBackLink = () => {
    if (navigationSource === 'master-admin-dashboard') {
      return '/master-admin/dashboard';
    } else if (navigationSource === 'admin-dashboard') {
      return '/admin/dashboard';
    } else if (navigationSource === 'admin-tracking') {
      return '/admin/tracking';
    } else if (navigationSource === 'admin-rental-alerts') {
      return '/admin/rental-alerts';
    } else if (navigationSource === 'master-admin-rental-alerts') {
      return '/master-admin/rental-alerts';
    } else if (navigationSource === 'customer-studios') {
      return '/studios';
    }
    return '/studios'; // Default fallback
  };

  const getBackText = () => {
    if (navigationSource === 'master-admin-dashboard') {
      return '← Back to Master Admin Dashboard';
    } else if (navigationSource === 'admin-dashboard') {
      return '← Back to Admin Dashboard';
    } else if (navigationSource === 'admin-tracking') {
      return '← Back to Admin Tracking';
    } else if (navigationSource === 'admin-rental-alerts') {
      return '← Back to Admin Rental Alerts';
    } else if (navigationSource === 'master-admin-rental-alerts') {
      return '← Back to Master Admin Rental Alerts';
    } else if (navigationSource === 'customer-studios') {
      return '← Back to Studios';
    }
    return '← Back to Studios'; // Default fallback
  };

  const openGoogleMaps = () => {
    if (parentApartment?.coordinates && parentApartment.coordinates.lat && parentApartment.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${parentApartment.coordinates.lat},${parentApartment.coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (studio?.coordinates && studio.coordinates.lat && studio.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${studio.coordinates.lat},${studio.coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (parentApartment?.mapUrl || studio?.locationUrl) {
      window.open(parentApartment?.mapUrl || studio?.locationUrl, '_blank', 'noopener,noreferrer');
    } else if (parentApartment?.location || studio?.location) {
      const searchQuery = encodeURIComponent(parentApartment?.location || studio?.location);
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!studio) {
    return (
      <div className="studio-details-page">
        <div className="container">
          <h1>Studio not found</h1>
          <BackButton onClick={() => navigate(-1)} />
        </div>
      </div>
    );
  }

  // If studio is not available, redirect based on source
  if (!studio.isAvailable && navigationSource === 'customer') {
    return <Navigate to="/studios" replace />;
  }

  return (
    <div className="studio-details-page">
      <nav className="studio-nav">
        <BackButton 
          text={getBackText()} 
          onClick={() => navigate(getBackLink())}
        />
        <Link 
          to={navigationSource === 'master-admin' ? '/master-admin/dashboard' : '/'} 
          className="brand"
        >
          Ahmed Othman Group
        </Link>
      </nav>

      <div className="studio-container">
        <div className="studio-gallery-section">
          <ImageGallery images={studio.images} title={studio.title} />
        </div>

        <div className="studio-content">
          <div className="studio-main-info">
            <div className="studio-header">
              <h1 className="studio-title">{studio.title}</h1>
              <div className="studio-price">{studio.price}</div>
            </div>

            <div className="studio-posted">Posted {studio.postedDate}</div>

            {/* Google Maps Link */}
            {(parentApartment?.mapUrl || studio?.locationUrl || parentApartment?.coordinates || studio?.coordinates || parentApartment?.location || studio?.location) && (
              <div className="studio-location-section">
                <h3>📍 Location</h3>
                <button 
                  onClick={openGoogleMaps}
                  className="maps-button"
                  type="button"
                >
                  🗺️ View on Google Maps
                </button>
                {parentApartment && (
                  <small className="location-note">
                    Location shared from {parentApartment.name}
                  </small>
                )}
              </div>
            )}

            {/* Master Admin - Show Creator Info - ONLY for Master Admin */}
            {navigationSource === 'master-admin-dashboard' && studio.createdBy && (
              <div className="creator-info-section">
                <div className="creator-info">
                  <span className="creator-label">👤 Created by Admin:</span>
                  <span className="creator-value">{studio.createdBy}</span>
                </div>
                <div className="creator-date">
                  <span className="creator-label">📅 Created on:</span>
                  <span className="creator-value">
                    {studio.createdAt ? new Date(studio.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Admin and Master Admin booking and edit buttons - HIDDEN for customers */}
            {(navigationSource === 'admin-dashboard' || navigationSource === 'master-admin-dashboard' || navigationSource === 'admin-tracking' || navigationSource === 'admin-rental-alerts' || navigationSource === 'master-admin-rental-alerts') && (
              <div className="admin-booking-section">
                <div className="admin-buttons">
                  {!studioBooking ? (
                    <button 
                      className="book-studio-btn"
                      onClick={() => setIsBookingModalOpen(true)}
                      disabled={isBookingLoading}
                    >
                      {isBookingLoading ? (
                        <>
                          <LoadingSpinner size="small" color="white" inline />
                          Processing...
                        </>
                      ) : (
                        '📋 Book This Studio'
                      )}
                    </button>
                  ) : (
                    <button 
                      className="book-studio-btn booked"
                      disabled
                      style={{ background: '#059669', cursor: 'not-allowed' }}
                    >
                      ✅ Studio Already Booked
                    </button>
                  )}
                  
                  <button 
                    className="edit-studio-btn"
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={isEditLoading}
                  >
                    {isEditLoading ? (
                      <>
                        <LoadingSpinner size="small" color="white" inline />
                        Loading...
                      </>
                    ) : (
                      '✏️ Edit Studio'
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="highlights-section">
              <h2>Highlights</h2>
              <div className="highlights-grid">
                <div className="highlight-item">
                  <div className="highlight-icon">🏠</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Type</div>
                    <div className="highlight-value">{studio.highlights.type}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🔑</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Ownership</div>
                    <div className="highlight-value">{studio.highlights.ownership}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">📏</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Area (m²)</div>
                    <div className="highlight-value">{studio.highlights.area}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🛏️</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bedrooms</div>
                    <div className="highlight-value">{studio.highlights.bedrooms}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🚿</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bathrooms</div>
                    <div className="highlight-value">{studio.highlights.bathrooms}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🪑</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Furnished</div>
                    <div className="highlight-value">{studio.highlights.furnished}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h2>Details</h2>
              <div className="details-table">
                <div className="detail-row">
                  <span className="detail-label">Payment Option</span>
                  <span className="detail-value">{studio.details.paymentOption}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Completion Status</span>
                  <span className="detail-value">{studio.details.completionStatus}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Furnished</span>
                  <span className="detail-value">{studio.details.furnished}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Parking</span>
                  <span className="detail-value">{studio.details.parking}</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h2>Description</h2>
              <p className="description-text">{studio.description}</p>
            </div>

            {/* Booking Display Section - Only visible if booking exists and from admin or master admin - HIDDEN for customers */}
            {studioBooking && (navigationSource === 'admin-dashboard' || navigationSource === 'master-admin-dashboard' || navigationSource === 'admin-tracking' || navigationSource === 'admin-rental-alerts' || navigationSource === 'master-admin-rental-alerts') && (
              <div className="booking-display-section">
                <h2>📋 Booking Information</h2>
                <div className="booking-card">
                  <div className="booking-header">
                    <h3>Customer Details</h3>
                    <div className="booking-actions">
                      <div className="booking-status">✅ Booked</div>
                      <button 
                        className="delete-booking-btn"
                        onClick={handleDeleteBooking}
                        disabled={isDeletingBooking}
                        title="Delete booking"
                      >
                        {isDeletingBooking ? (
                          <>
                            <LoadingSpinner size="small" color="white" inline />
                            Deleting...
                          </>
                        ) : (
                          '🗑️ Cancel Booking'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Customer Name:</span>
                        <span className="detail-value">{studioBooking.customerName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{studioBooking.customerPhone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">{studioBooking.customerId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Platform Source:</span>
                        <span className="detail-value">{studioBooking.platformSource}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rent Period:</span>
                        <span className="detail-value">{studioBooking.rentPeriod}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{new Date(studioBooking.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{new Date(studioBooking.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Booking Date:</span>
                        <span className="detail-value">{new Date(studioBooking.bookingDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="financial-summary">
                      <h4>💰 Financial Summary</h4>
                      <div className="financial-grid">
                        <div className="financial-item">
                          <span className="financial-label">Studio Price:</span>
                          <span className="financial-value">{studioBooking.studioPrice}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Paid Deposit:</span>
                          <span className="financial-value">EGP {studioBooking.paidDeposit.toLocaleString()}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Warranty:</span>
                          <span className="financial-value">EGP {studioBooking.warranty.toLocaleString()}</span>
                        </div>
                        <div className="financial-item total">
                          <span className="financial-label">Total Paid:</span>
                          <span className="financial-value">EGP {studioBooking.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {studioBooking.contract && (
                      <div className="contract-info">
                        <h4>📄 Contract</h4>
                        <div className="contract-file">
                          <span>📎 {studioBooking.contract.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="studio-sidebar">
            <div className="contact-card">
              <h3>Listed by agency</h3>
              <div className="agency-info">
                <div className="agency-name">Ahmed Othman Group</div>
                <div className="agency-rating">⭐ 4 C</div>
                <div className="agency-member">Member since Sept 2024</div>
              </div>
              
              <div className="contact-actions">
                <WhatsAppButton 
                  phoneNumber={studio.contactNumber}
                  message={`Hello, I'm interested in ${studio.title} for ${studio.price}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal - Only for Admin/Master Admin access */}
      {(navigationSource === 'admin-dashboard' || navigationSource === 'master-admin-dashboard' || navigationSource === 'admin-tracking' || navigationSource === 'admin-rental-alerts' || navigationSource === 'master-admin-rental-alerts') && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          studio={studio}
          onBookingSubmit={handleBookingSubmit}
          isLoading={isBookingLoading}
        />
      )}

      {/* Edit Studio Modal - Only for Admin/Master Admin access */}
      {isEditModalOpen && (navigationSource === 'admin-dashboard' || navigationSource === 'master-admin-dashboard' || navigationSource === 'admin-tracking' || navigationSource === 'admin-rental-alerts' || navigationSource === 'master-admin-rental-alerts') && (
        <EditStudioModal
          onClose={() => setIsEditModalOpen(false)}
          studio={studio}
          apartmentId={studio?.apartmentId}
          onStudioUpdated={handleStudioUpdate}
          isLoading={isEditLoading}
        />
      )}
    </div>
  );
};

export default StudioDetailsPage;