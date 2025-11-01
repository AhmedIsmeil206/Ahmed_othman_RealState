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
}
          }
        } else {
          setError('Studio not found');
        }
      } catch (err) {
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
            const existingContract = contractsResponse.find(contract => {
              const matches = (contract.apartment_part_id === parseInt(id) || contract.studioId === parseInt(id));
              const isActive = contract.is_active === true || contract.isActive === true;

              return matches && isActive;
            });
            
            if (existingContract) {

              setStudioBooking(existingContract);
            } else {

              setStudioBooking(null);
            }
          }
        }
      } catch (error) {
        // Not critical - just log the error
}
    };
    
    fetchExistingBooking();
  }, [id, searchParams]);

  // Remove the sync effect as we're now managing data through API
  const handleBookingSubmit = async (bookingData) => {
    setIsBookingLoading(true);
    try {

      // PRE-FLIGHT CHECK 1: Check if studio already has a booking in state
      if (studioBooking) {
        alert('❌ This studio already has an active booking!\n\nPlease delete the existing booking before creating a new one.');
        setIsBookingLoading(false);
        setIsBookingModalOpen(false);
        return;
      }
      
      // PRE-FLIGHT CHECK 2: Fetch latest booking status from API

      try {
        const allContracts = await rentalContractsApi.getAll();
        const existingContract = allContracts?.find(contract => 
          contract.apartment_part_id === parseInt(id) || 
          contract.studioId === parseInt(id)
        );
        
        if (existingContract) {
alert(`❌ Booking Already Exists!\n\nThis studio already has a rental contract:\n• Customer: ${existingContract.customer_name || existingContract.customerName}\n• Contract ID: ${existingContract.id}\n\nPlease delete the existing booking before creating a new one.`);
          setStudioBooking(existingContract);
          setIsBookingLoading(false);
          setIsBookingModalOpen(false);
          return;
        }

      } catch (checkError) {
// Continue anyway - the backend will catch duplicates
      }
      
      // PRE-FLIGHT CHECK 3: Verify studio is available
      if (studio.status !== 'available' && studio.statusEnum !== 'available') {
        alert('❌ This studio is not available for booking.\n\nStatus: ' + (studio.status || studio.statusEnum || 'Unknown'));
        setIsBookingLoading(false);
        setIsBookingModalOpen(false);
        return;
      }
      
      // Extract numeric value from rentPeriod string (e.g., "12 months" -> 12)
      const rentPeriodValue = typeof bookingData.rentPeriod === 'string' 
        ? parseInt(bookingData.rentPeriod.match(/\d+/)?.[0] || '12')
        : parseInt(bookingData.rentPeriod) || 12;
      
      // Prepare data in format that transformer expects
      const contractData = {
        apartment_part_id: parseInt(id),
        customer_name: bookingData.customerName.trim(),
        customer_phone: bookingData.customerPhone, // Already formatted by BookingModal
        customer_id_number: bookingData.customerId.trim(),
        how_did_customer_find_us: bookingData.how_did_customer_find_us || 'other',
        paid_deposit: parseFloat(bookingData.paidDeposit) || 0,
        warrant_amount: parseFloat(bookingData.warranty) || 0,
        rent_start_date: bookingData.startDate,
        rent_end_date: bookingData.endDate,
        rent_period: rentPeriodValue, // Must be integer
        contract_url: (typeof bookingData.contract === 'string' ? bookingData.contract : '') || '',
        customer_id_url: '',
        commission: parseFloat(bookingData.commission) || 0,
        rent_price: parseFloat(studio.monthly_price) || parseFloat(studio.price) || 0
      };


      const response = await rentalContractsApi.create(contractData);

      if (response) {
        alert('✅ Booking created successfully!');
        setStudioBooking(response);
        setIsBookingModalOpen(false);
        
        // Refresh studio data to reflect booking status
        const updatedStudioResponse = await apartmentPartsApi.getById(id);
        if (updatedStudioResponse) {
          setStudio(updatedStudioResponse);
        }
        
        // Auto-refresh page to show updated data
        window.location.reload();
      } else {
alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
// Show user-friendly error messages
      if (error.message?.includes('unique constraint') || error.message?.includes('UNIQUE constraint failed') || error.message?.includes('duplicate key')) {
        alert('❌ Booking Already Exists!\n\nThis studio already has an active booking. Please delete the existing booking first before creating a new one.');
      } else if (error.message?.includes('422') || error.message?.includes('Validation')) {
        alert('❌ Validation Error\n\nPlease check all fields are filled correctly:\n- Phone must be 11 digits starting with 0\n- All amounts must be valid numbers\n- Dates must be valid (end date after start date)\n- Platform source must be selected\n- Rent period must be a number');
      } else if (error.message?.includes('401')) {
        alert('❌ Session Expired\n\nPlease log in again.');
        localStorage.removeItem('api_access_token');
        navigate('/admin/login');
      } else if (error.message?.includes('403')) {
        alert('❌ Permission Denied\n\nYou do not have permission to create bookings for this studio.\n\nOnly the admin who created this apartment can create bookings for it.');
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        alert('❌ Server Error\n\nThe backend encountered an error. Possible causes:\n\n1. This studio might already have a booking (database constraint)\n2. Backend server connection issue\n3. Database error\n\nPlease:\n• Refresh the page to see current booking status\n• Contact administrator if problem persists');
      } else if (error.message?.includes('Network error') || error.message?.includes('ERR_FAILED')) {
        alert('❌ Cannot Connect to Backend\n\nPlease ensure:\n1. Backend server is running on http://localhost:8000\n2. CORS is properly configured on backend\n3. No firewall blocking the connection\n\nTechnical details:\n' + (error.message || 'Network request failed'));
      } else {
        alert(`❌ Failed to create booking\n\n${error.message || 'Unknown error'}\n\nPlease check the console for more details.`);
      }
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
}
    } catch (error) {
} finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete this booking?\n\nThis action cannot be undone and requires Super Admin (Master Admin) privileges.')) {
      setIsDeletingBooking(true);
      try {
        if (studioBooking && studioBooking.id) {

          const response = await rentalContractsApi.delete(studioBooking.id);
          
          if (response !== false) {
            alert('✅ Booking deleted successfully!');
            setStudioBooking(null);
            
            // Refresh studio data to reflect booking status change
            const updatedStudioResponse = await apartmentPartsApi.getById(id);
            if (updatedStudioResponse) {
              setStudio(updatedStudioResponse);
            }
            
            // Auto-refresh page to show updated data
            window.location.reload();
          } else {
alert('❌ Failed to delete booking. Please try again.');
          }
        }
      } catch (error) {
// Handle specific error types
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('forbidden') || error.message?.includes('Access forbidden')) {
          // 403 Forbidden - Not a super admin
          alert(
            '🔒 PERMISSION DENIED - SUPER ADMIN REQUIRED\n\n' +
            '❌ Only Super Admins (Master Admins) can delete rental bookings.\n\n' +
            '� Your Current Role: Regular Admin\n' +
            '🔑 Required Role: Super Admin (Master Admin)\n\n' +
            '💡 Why this restriction exists:\n' +
            '• Rental contracts involve legal and financial commitments\n' +
            '• Only Master Admins have authority to cancel contracts\n' +
            '• This protects the business from unauthorized cancellations\n\n' +
            '🎯 Solutions:\n' +
            '1. Contact your Super Admin to delete this booking\n' +
            '2. Request Super Admin access from the system administrator\n' +
            '3. If you are the system owner, log in with your Master Admin account\n\n' +
            '📞 For urgent booking cancellations, contact your Super Admin immediately.'
          );
        } else if (error.status === 404 || error.message?.includes('404')) {
          alert('❌ Booking Not Found\n\nThis booking may have already been deleted or does not exist.\n\nThe page will refresh to show the current status.');
          window.location.reload();
        } else if (error.status === 401 || error.message?.includes('401')) {
          alert('❌ Session Expired\n\nYour login session has expired. Please log in again.');
          localStorage.removeItem('api_access_token');
          navigate('/admin/login');
        } else {
          alert(
            `❌ Failed to Delete Booking\n\n` +
            `Error: ${error.message || 'Unknown error'}\n\n` +
            `Status Code: ${error.status || 'N/A'}\n\n` +
            `Please try again or contact support if the problem persists.`
          );
        }
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
                        <span className="detail-value">{studioBooking.customer_name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{studioBooking.customer_phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">N/A</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">{studioBooking.customer_id_number}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Platform Source:</span>
                        <span className="detail-value">{studioBooking.how_did_customer_find_us}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rent Period:</span>
                        <span className="detail-value">{studioBooking.rent_period}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{studioBooking.rent_start_date ? new Date(studioBooking.rent_start_date).toLocaleDateString() : 'Invalid Date'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{studioBooking.rent_end_date ? new Date(studioBooking.rent_end_date).toLocaleDateString() : 'Invalid Date'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contract Date:</span>
                        <span className="detail-value">{studioBooking.created_at ? new Date(studioBooking.created_at).toLocaleDateString() : '10/9/2025'}</span>
                      </div>
                    </div>

                    <div className="financial-summary">
                      <h4>💰 Financial Summary</h4>
                      <div className="financial-grid">
                        <div className="financial-item">
                          <span className="financial-label">Monthly Rent:</span>
                          <span className="financial-value">EGP {parseFloat(studioBooking.rent_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Deposit:</span>
                          <span className="financial-value">EGP {parseFloat(studioBooking.paid_deposit || 0).toLocaleString()}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Warranty:</span>
                          <span className="financial-value">EGP {parseFloat(studioBooking.warrant_amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="financial-item total">
                          <span className="financial-label">Total Initial:</span>
                          <span className="financial-value">EGP {(parseFloat(studioBooking.paid_deposit || 0) + parseFloat(studioBooking.warrant_amount || 0)).toLocaleString()}</span>
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
                {/* WhatsApp Button Logic:
                    - If admin/master admin viewing + has booking → Customer's phone
                    - Otherwise → Agency/Admin phone for inquiries
                */}
                {(navigationSource === 'admin-dashboard' || 
                  navigationSource === 'master-admin-dashboard' || 
                  navigationSource === 'admin-tracking' || 
                  navigationSource === 'admin-rental-alerts' || 
                  navigationSource === 'master-admin-rental-alerts') && studioBooking ? (
                  // Admin viewing rented studio - Show customer contact
                  <>
                    <div className="contact-info-header">
                      <h4>Customer Contact</h4>
                      <p className="contact-name">{studioBooking.customer_name || studioBooking.customerName}</p>
                      <p className="contact-phone">{studioBooking.customer_phone || studioBooking.customerPhone}</p>
                    </div>
                    <WhatsAppButton 
                      phoneNumber={studioBooking.customer_phone || studioBooking.customerPhone || '+201000000000'}
                      message={`Hello ${studioBooking.customer_name || studioBooking.customerName}, this is regarding your rental at ${studio.title || studio.name}.`}
                      contactType="customer"
                      label="Contact Tenant"
                    />
                  </>
                ) : (
                  // Customer viewing or no booking - Show agency contact
                  <WhatsAppButton 
                    phoneNumber={studio.adminPhone || studio.contact_number || '+201000000000'}
                    message={`Hello, I'm interested in ${studio.title || studio.name} for ${studio.price || `EGP ${studio.monthly_rent?.toLocaleString()}/month`}`}
                    contactType="agency"
                  />
                )}
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