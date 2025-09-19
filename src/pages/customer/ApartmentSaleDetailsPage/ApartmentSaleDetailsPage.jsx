import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ImageGallery from '../../../components/customer/ImageGallery/ImageGallery';
import WhatsAppButton from '../../../components/customer/WhatsAppButton/WhatsAppButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { useProperty } from '../../../hooks/useRedux';
import './ApartmentSaleDetailsPage.css';

const ApartmentSaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saleApartments } = useProperty();
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  
  const apartment = saleApartments.find(apt => apt.id === id);

  useEffect(() => {
    // Check if inquiry was already submitted for this apartment
    const existingInquiry = localStorage.getItem(`apartment_inquiry_${id}`);
    if (existingInquiry) {
      setInquirySubmitted(true);
    }
  }, [id]);

  const handleInquirySubmit = async () => {
    setIsSubmittingInquiry(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save inquiry to localStorage
      const inquiryData = {
        apartmentId: id,
        apartmentTitle: apartment.name,
        submittedAt: new Date().toISOString(),
        inquiryType: 'purchase'
      };
      localStorage.setItem(`apartment_inquiry_${id}`, JSON.stringify(inquiryData));
      setInquirySubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

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
    return price.toLocaleString('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const openGoogleMaps = () => {
    if (apartment.coordinates && apartment.coordinates.lat && apartment.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${apartment.coordinates.lat},${apartment.coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (apartment.mapUrl) {
      window.open(apartment.mapUrl, '_blank', 'noopener,noreferrer');
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
            title={apartment.name}
            fallbackImage="/api/placeholder/800/600"
          />
        </div>

        <div className="apartment-content">
          <div className="apartment-main-info">
            <div className="apartment-header">
              <div className="apartment-title-section">
                <h1 className="apartment-title">{apartment.name}</h1>
                <div className="apartment-subtitle">
                  {apartment.apartmentNumber && (
                    <span className="apartment-number">{apartment.apartmentNumber}</span>
                  )}
                </div>
              </div>
              <div className="apartment-price-section">
                <div className="apartment-price">{formatPrice(apartment.price)}</div>
                <div className="apartment-availability">
                  <span className={`status ${apartment.isAvailable ? 'available' : 'sold'}`}>
                    {apartment.isAvailable ? '✅ Available' : '❌ Sold'}
                  </span>
                </div>
              </div>
            </div>

            <div className="apartment-posted">
              Listed {apartment.listedAt ? 
                new Date(apartment.listedAt).toLocaleDateString() : 
                new Date(apartment.createdAt).toLocaleDateString()
              }
            </div>

            {/* Google Maps Link */}
            {(apartment.mapUrl || apartment.coordinates || apartment.location) && (
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
                    <div className="highlight-value">{apartment.area ? `${apartment.area} sq ft` : 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">�️</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bedrooms</div>
                    <div className="highlight-value">{apartment.bedrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">�</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bathrooms</div>
                    <div className="highlight-value">{apartment.bathrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">💰</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Price</div>
                    <div className="highlight-value">{formatPrice(apartment.price)}</div>
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
                  <span className="detail-value">{apartment.apartmentNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Listing Date</span>
                  <span className="detail-value">{apartment.listedAt ? 
                    new Date(apartment.listedAt).toLocaleDateString() : 
                    new Date(apartment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Listed By</span>
                  <span className="detail-value">{apartment.createdBy || 'Ahmed Othman Group'}</span>
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
                phone="+201234567890"
                message={`Hi! I'm interested in the apartment "${apartment.name}" listed for ${formatPrice(apartment.price)}. Could you provide more details?`}
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