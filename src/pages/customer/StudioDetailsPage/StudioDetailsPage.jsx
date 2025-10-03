import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ImageGallery from '../../../components/customer/ImageGallery/ImageGallery';
import WhatsAppButton from '../../../components/customer/WhatsAppButton/WhatsAppButton';
import BookingModal from '../../../components/admin/BookingModal';
import EditStudioModal from '../../../components/admin/EditStudioModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { apartmentPartsApi, rentApartmentsApi, rentalContractsApi } from '../../../services/api';
import './StudioDetailsPage.css';

const StudioDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [navigationSource, setNavigationSource] = useState('customer-studios');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studioBooking, setStudioBooking] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studio, setStudio] = useState(null);
  const [parentApartment, setParentApartment] = useState(null);

  // Fetch studio details from API
  useEffect(() => {
    const fetchStudioDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get studio part details
        const studioResponse = await apartmentPartsApi.getById(id);
        
        if (studioResponse) {
          const studioData = studioResponse;
          setStudio(studioData);
          
          // Also try to get parent apartment info if apartmentId exists
          if (studioData.apartment_id) {
            try {
              const apartmentResponse = await rentApartmentsApi.getById(studioData.apartment_id);
              if (apartmentResponse) {
                setParentApartment(apartmentResponse);
              }
            } catch (apartmentError) {
              // Parent apartment fetch failed - not critical
              console.warn('Failed to fetch parent apartment:', apartmentError);
            }
          }
        } else {
          setError('Studio not found');
        }
      } catch (err) {
        console.error('Error fetching studio details:', err);
        setError('Failed to load studio details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchStudioDetails();
    }
  }, [id]);

  useEffect(() => {
    // Get the navigation source from URL parameters
    const source = searchParams.get('source');
    
    if (['master-admin-dashboard', 'customer-studios', 'admin-dashboard', 'admin-tracking', 'admin-rental-alerts', 'master-admin-rental-alerts'].includes(source)) {
      setNavigationSource(source);
    } else {
      // Default to customer studios if no valid source in URL
      setNavigationSource('customer-studios');
    }

    // Check for existing booking for this studio using rental contracts API
    const fetchExistingBooking = async () => {
      try {
        if (id) {
          const contractsResponse = await rentalContractsApi.getAll();
          if (contractsResponse && Array.isArray(contractsResponse)) {
            const existingContract = contractsResponse.find(contract => 
              contract.apartment_part_id === parseInt(id) && contract.status === 'active'
            );
            
            if (existingContract) {
              setStudioBooking(existingContract);
            }
          }
        }
      } catch (error) {
        // Not critical - just log the error
        console.warn('Failed to fetch existing booking:', error);
      }
    };
    
    fetchExistingBooking();
  }, [id, searchParams]);

  // Remove the sync effect as we're now managing data through API
  const handleBookingSubmit = async (bookingData) => {
    setIsBookingLoading(true);
    try {
      // Create rental contract via API
      const contractData = {
        apartment_part_id: parseInt(id),
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone,
        customer_id_number: bookingData.customerId,
        how_did_customer_find_us: bookingData.how_did_customer_find_us || 'direct',
        paid_deposit: String(parseFloat(bookingData.paidDeposit) || 0),
        warrant_amount: String(parseFloat(bookingData.warranty) || 0),
        rent_start_date: bookingData.startDate,
        rent_end_date: bookingData.endDate,
        rent_period: parseInt(bookingData.rentPeriod) || 12,
        contract_url: bookingData.contract || '',
        customer_id_url: '',
        commission: '0.00',
        rent_price: String(parseFloat(studio.monthly_price) || 0)
      };
      
      const response = await rentalContractsApi.create(contractData);
      
      if (response) {
        setStudioBooking(response);
        setIsBookingModalOpen(false);
        
        // Refresh studio data to reflect booking status
        const updatedStudioResponse = await apartmentPartsApi.getById(id);
        if (updatedStudioResponse) {
          setStudio(updatedStudioResponse);
        }
      } else {
        console.error('Failed to create rental contract:', response.error);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleStudioUpdate = async (updatedStudioData) => {
    setIsEditLoading(true);
    try {
      const response = await apartmentPartsApi.update(id, updatedStudioData);
      
      if (response) {
        setStudio(response);
        setIsEditModalOpen(false);
      } else {
        console.error('Failed to update studio:', response.error);
      }
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
        if (studioBooking && studioBooking.id) {
          const response = await rentalContractsApi.delete(studioBooking.id);
          
          if (response !== false) {  // API delete typically returns empty or success indication
            setStudioBooking(null);
            
            // Refresh studio data to reflect booking status change
            const updatedStudioResponse = await apartmentPartsApi.getById(id);
            if (updatedStudioResponse) {
              setStudio(updatedStudioResponse);
            }
          } else {
            console.error('Failed to delete booking:', response.error);
          }
        }
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
    if (parentApartment?.location_coordinates && parentApartment.location_coordinates.lat && parentApartment.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${parentApartment.location_coordinates.lat},${parentApartment.location_coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (studio?.location_coordinates && studio.location_coordinates.lat && studio.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${studio.location_coordinates.lat},${studio.location_coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (parentApartment?.location || studio?.location) {
      const searchQuery = encodeURIComponent(parentApartment?.location || studio?.location);
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="studio-details-page">
        <div className="container">
          <div className="loading-container">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="studio-details-page">
        <div className="container">
          <div className="error-container">
            <h1>Error Loading Studio</h1>
            <p className="error-message">{error}</p>
            <BackButton onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    );
  }

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
  if (!studio.is_available && navigationSource === 'customer') {
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
          <ImageGallery images={studio.images || []} title={studio.title || studio.name} />
        </div>

        <div className="studio-content">
          <div className="studio-main-info">
            <div className="studio-header">
              <h1 className="studio-title">{studio.title || studio.name}</h1>
              <div className="studio-price">{studio.price || `EGP ${studio.monthly_rent?.toLocaleString()}/month`}</div>
            </div>

            <div className="studio-posted">Posted {studio.created_at ? new Date(studio.created_at).toLocaleDateString() : 'Recently'}</div>

            {/* Google Maps Link */}
            {(parentApartment?.location || studio?.location || parentApartment?.location_coordinates || studio?.location_coordinates) && (
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
                    Location shared from {parentApartment.name || parentApartment.title}
                  </small>
                )}
              </div>
            )}

            {/* Master Admin - Show Creator Info - ONLY for Master Admin */}
            {navigationSource === 'master-admin-dashboard' && studio.created_by && (
              <div className="creator-info-section">
                <div className="creator-info">
                  <span className="creator-label">👤 Created by Admin:</span>
                  <span className="creator-value">{studio.created_by}</span>
                </div>
                <div className="creator-date">
                  <span className="creator-label">📅 Created on:</span>
                  <span className="creator-value">
                    {studio.created_at ? new Date(studio.created_at).toLocaleDateString() : 'N/A'}
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
                    <div className="highlight-value">{studio.type || 'Studio'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🔑</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Ownership</div>
                    <div className="highlight-value">{studio.ownership_type || 'Rental'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">📏</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Area (m²)</div>
                    <div className="highlight-value">{studio.area || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🛏️</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bedrooms</div>
                    <div className="highlight-value">{studio.bedrooms || studio.number_of_bedrooms || '1'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🚿</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bathrooms</div>
                    <div className="highlight-value">{studio.bathrooms || studio.number_of_bathrooms || '1'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🪑</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Furnished</div>
                    <div className="highlight-value">{studio.is_furnished ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h2>Details</h2>
              <div className="details-table">
                <div className="detail-row">
                  <span className="detail-label">Payment Option</span>
                  <span className="detail-value">{studio.payment_options || 'Monthly'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Completion Status</span>
                  <span className="detail-value">{studio.completion_status || 'Ready'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Furnished</span>
                  <span className="detail-value">{studio.is_furnished ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Parking</span>
                  <span className="detail-value">{studio.parking_available ? 'Available' : 'Not Available'}</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h2>Description</h2>
              <p className="description-text">{studio.description || 'No description available'}</p>
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
                        <span className="detail-value">{studioBooking.tenant_name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{studioBooking.tenant_phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{studioBooking.tenant_email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">{studioBooking.tenant_national_id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Platform Source:</span>
                        <span className="detail-value">{studioBooking.platform_source}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rent Period:</span>
                        <span className="detail-value">{studioBooking.rent_period}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{new Date(studioBooking.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{new Date(studioBooking.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contract Date:</span>
                        <span className="detail-value">{new Date(studioBooking.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="financial-summary">
                      <h4>💰 Financial Summary</h4>
                      <div className="financial-grid">
                        <div className="financial-item">
                          <span className="financial-label">Monthly Rent:</span>
                          <span className="financial-value">EGP {studioBooking.monthly_rent?.toLocaleString()}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Deposit:</span>
                          <span className="financial-value">EGP {studioBooking.deposit?.toLocaleString()}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Warranty:</span>
                          <span className="financial-value">EGP {studioBooking.warranty?.toLocaleString()}</span>
                        </div>
                        <div className="financial-item total">
                          <span className="financial-label">Total Initial:</span>
                          <span className="financial-value">EGP {((studioBooking.deposit || 0) + (studioBooking.warranty || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {studioBooking.notes && (
                      <div className="contract-info">
                        <h4>� Notes</h4>
                        <p>{studioBooking.notes}</p>
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
                  phoneNumber={studio.adminPhone || studio.contact_number || '+201000000000'}
                  message={`Hello, I'm interested in ${studio.title || studio.name} for ${studio.price || `EGP ${studio.monthly_rent?.toLocaleString()}/month`}`}
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
          apartmentId={studio?.apartment_id}
          onStudioUpdated={handleStudioUpdate}
          isLoading={isEditLoading}
        />
      )}
    </div>
  );
};

export default StudioDetailsPage;