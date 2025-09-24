import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ImageGallery from '../../../components/customer/ImageGallery/ImageGallery';
import WhatsAppButton from '../../../components/customer/WhatsAppButton/WhatsAppButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { saleApartmentsApi } from '../../../services/api';
import './ApartmentSaleDetailsPage.css';

const ApartmentSaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Fetch apartment details from API
  useEffect(() => {
    const fetchApartmentDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await saleApartmentsApi.getById(id);
        
        if (response.success && response.data) {
          setApartment(response.data);
        } else {
          setError('Apartment not found');
        }
      } catch (err) {
        console.error('Error fetching apartment details:', err);
        setError('Failed to load apartment details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchApartmentDetails();
    }
  }, [id]);

  useEffect(() => {
    // Check if inquiry was already submitted for this apartment
    const checkExistingInquiry = async () => {
      try {
        if (id) {
          // Check via API if inquiries endpoint exists
          // For now, check localStorage as fallback
          const existingInquiry = localStorage.getItem(`apartment_inquiry_${id}`);
          if (existingInquiry) {
            setInquirySubmitted(true);
          }
        }
      } catch (error) {
        // Not critical - just use localStorage
        const existingInquiry = localStorage.getItem(`apartment_inquiry_${id}`);
        if (existingInquiry) {
          setInquirySubmitted(true);
        }
      }
    };
    
    checkExistingInquiry();
  }, [id]);

  const handleInquirySubmit = async () => {
    setIsSubmittingInquiry(true);
    try {
      // Save inquiry to localStorage as fallback
      const localInquiryData = {
        apartmentId: id,
        apartmentTitle: apartment.name || apartment.title,
        submittedAt: new Date().toISOString(),
        inquiryType: 'purchase'
      };
      localStorage.setItem(`apartment_inquiry_${id}`, JSON.stringify(localInquiryData));
      setInquirySubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="apartment-details-page">
        <div className="container">
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Loading apartment details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="apartment-details-page">
        <div className="container">
          <div className="error-container">
            <h1>Error Loading Apartment</h1>
            <p className="error-message">{error}</p>
            <BackButton onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="apartment-details-page">
        <div className="container">
          <h1>Apartment not found</h1>
          <BackButton onClick={() => navigate(-1)} />
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `EGP ${price.toLocaleString()}`;
  };

  const openGoogleMaps = () => {
    if (apartment.location_coordinates && apartment.location_coordinates.lat && apartment.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${apartment.location_coordinates.lat},${apartment.location_coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (apartment.location) {
      const searchQuery = encodeURIComponent(apartment.location);
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="apartment-details-page">
      <nav className="apartment-nav">
        <BackButton onClick={() => navigate(-1)} />
        <Link to="/" className="brand">Ahmed Othman Group</Link>
      </nav>

      <div className="apartment-container">
        <div className="apartment-gallery-section">
          <ImageGallery 
            images={apartment.images || []} 
            title={apartment.name || apartment.title}
            fallbackImage="/api/placeholder/800/600"
          />
        </div>

        <div className="apartment-content">
          <div className="apartment-main-info">
            <div className="apartment-header">
              <div className="apartment-title-section">
                <h1 className="apartment-title">{apartment.name || apartment.title}</h1>
                <div className="apartment-subtitle">
                  {apartment.apartment_number && (
                    <span className="apartment-number">{apartment.apartment_number}</span>
                  )}
                </div>
              </div>
              <div className="apartment-price-section">
                <div className="apartment-price">{formatPrice(apartment.price || apartment.sale_price)}</div>
                <div className="apartment-availability">
                  <span className={`status ${apartment.is_available ? 'available' : 'sold'}`}>
                    {apartment.is_available ? '✅ Available' : '❌ Sold'}
                  </span>
                </div>
              </div>
            </div>

            <div className="apartment-posted">
              Listed {apartment.created_at ? 
                new Date(apartment.created_at).toLocaleDateString() : 
                'Recently'
              }
            </div>

            {/* Google Maps Link */}
            {(apartment.location_coordinates || apartment.location) && (
              <div className="apartment-location-section">
                <h3>📍 Location</h3>
                <button 
                  onClick={openGoogleMaps}
                  className="maps-button"
                  type="button"
                >
                  🗺️ View on Google Maps
                </button>
              </div>
            )}

            <div className="apartment-features">
              <h2>Property Highlights</h2>
              <div className="highlights-grid">
                <div className="highlight-item">
                  <div className="highlight-icon">🏠</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Type</div>
                    <div className="highlight-value">Apartment</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🔑</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Ownership</div>
                    <div className="highlight-value">For Sale</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">📏</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Area</div>
                    <div className="highlight-value">{apartment.area ? `${apartment.area} m²` : 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🛏️</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bedrooms</div>
                    <div className="highlight-value">{apartment.bedrooms || apartment.number_of_bedrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🚿</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bathrooms</div>
                    <div className="highlight-value">{apartment.bathrooms || apartment.number_of_bathrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">💰</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Price</div>
                    <div className="highlight-value">{formatPrice(apartment.price || apartment.sale_price)}</div>
                  </div>
                </div>
              </div>
            </div>

            {apartment.description && (
              <div className="apartment-description">
                <h2>Description</h2>
                <p>{apartment.description}</p>
              </div>
            )}

            <div className="details-section">
              <h2>Property Details</h2>
              <div className="details-table">
                <div className="detail-row">
                  <span className="detail-label">Apartment Number</span>
                  <span className="detail-value">{apartment.apartment_number || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Listing Date</span>
                  <span className="detail-value">{apartment.created_at ? 
                    new Date(apartment.created_at).toLocaleDateString() : 
                    'Recently'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Listed By</span>
                  <span className="detail-value">{apartment.created_by || 'Ahmed Othman Group'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Property Type</span>
                  <span className="detail-value">Apartment for Sale</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{apartment.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{apartment.address || apartment.location}</span>
                </div>
              </div>
            </div>

            {((apartment.amenities && apartment.amenities.length > 0) || (apartment.facilities && apartment.facilities.length > 0)) && (
              <div className="amenities-section">
                <h2>Facilities & Amenities</h2>
                <div className="amenities-grid">
                  {(apartment.facilities || apartment.amenities || []).map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span className="amenity-name">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="apartment-actions">
              {!inquirySubmitted ? (
                <button 
                  className="inquire-btn"
                  onClick={handleInquirySubmit}
                  disabled={isSubmittingInquiry}
                >
                  {isSubmittingInquiry ? (
                    <>
                      <LoadingSpinner size="small" color="white" inline />
                      Submitting Inquiry...
                    </>
                  ) : (
                    '📧 Send Purchase Inquiry'
                  )}
                </button>
              ) : (
                <button className="inquire-btn submitted" disabled>
                  ✅ Inquiry Submitted
                </button>
              )}
              
              <WhatsAppButton 
                phone={apartment.contact_number || "+201234567890"}
                message={`Hi! I'm interested in the apartment "${apartment.name || apartment.title}" listed for ${formatPrice(apartment.price || apartment.sale_price)}. Could you provide more details?`}
                buttonText="💬 Contact via WhatsApp"
                className="whatsapp-btn"
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ApartmentSaleDetailsPage;