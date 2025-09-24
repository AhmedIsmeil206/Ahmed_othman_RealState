import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ImageGallery from '../../../components/customer/ImageGallery/ImageGallery';
import WhatsAppButton from '../../../components/customer/WhatsAppButton/WhatsAppButton';
import MapViewer from '../../../components/common/MapViewer';
import { useProperty } from '../../../hooks/useRedux';
import './ApartmentSaleDetailsPage.css';

const ApartmentSaleDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSaleApartmentById } = useProperty();
  const [navigationSource, setNavigationSource] = useState('admin-dashboard');
  
  const apartment = getSaleApartmentById(id);

  useEffect(() => {
    // Get the navigation source from URL parameters
    const source = searchParams.get('source');
    
    if (['master-admin-dashboard', 'customer-apartments', 'admin-dashboard'].includes(source)) {
      setNavigationSource(source);
    } else {
      // Default to admin dashboard if no valid source in URL
      setNavigationSource('admin-dashboard');
    }
  }, [id, searchParams]);

  // Determine the back link based on specific source
  const getBackLink = () => {
    if (navigationSource === 'master-admin-dashboard') {
      return '/master-admin/dashboard';
    } else if (navigationSource === 'admin-dashboard') {
      return '/admin/dashboard';
    } else if (navigationSource === 'customer-apartments') {
      return '/apartments-sale';
    }
    return '/admin/dashboard'; // Default fallback
  };

  const getBackText = () => {
    if (navigationSource === 'master-admin-dashboard') {
      return '← Back to Master Admin Dashboard';
    } else if (navigationSource === 'admin-dashboard') {
      return '← Back to Admin Dashboard';
    } else if (navigationSource === 'customer-apartments') {
      return '← Back to Apartments for Sale';
    }
    return '← Back to Admin Dashboard'; // Default fallback
  };

  if (!apartment) {
    return (
      <div className="apartment-sale-details-page">
        <div className="container">
          <h1>Apartment not found</h1>
          <BackButton onClick={() => navigate(-1)} />
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M EGP`;
    }
    return price.toLocaleString('en-EG') + ' EGP';
  };

  const openGoogleMaps = () => {
    if (apartment.coordinates && apartment.coordinates.lat && apartment.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${apartment.coordinates.lat},${apartment.coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to location search if coordinates are not available
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(apartment.location)}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="apartment-sale-details-page">
      <nav className="apartment-nav">
        <BackButton 
          text={getBackText()} 
          onClick={() => navigate(getBackLink())}
        />
        <Link 
          to={navigationSource === 'master-admin-dashboard' ? '/master-admin/dashboard' : '/admin/dashboard'} 
          className="brand"
        >
          Ahmed Othman Group
        </Link>
      </nav>

      <div className="apartment-container">
        <div className="apartment-gallery-section">
          <ImageGallery 
            images={apartment.images && apartment.images.length > 0 ? apartment.images : [apartment.image]} 
            title={apartment.name} 
          />
        </div>

        <div className="apartment-content">
          <div className="apartment-main-info">
            <div className="apartment-header">
              <h1 className="apartment-title">{apartment.name}</h1>
              <div className="apartment-price">{formatPrice(apartment.price)}</div>
              <div className="apartment-status">
                <span className={`status-badge ${apartment.isAvailable ? 'available' : 'sold'}`}>
                  {apartment.isAvailable ? 'Available for Sale' : 'Sold'}
                </span>
              </div>
            </div>

            <div className="apartment-location" onClick={openGoogleMaps}>
              📍 {apartment.location}
              <span className="location-link">See location</span>
            </div>

            <div className="apartment-posted">
              Listed {new Date(apartment.listedAt || apartment.createdAt).toLocaleDateString()}
            </div>

            {/* Master Admin - Show Creator Info */}
            {navigationSource === 'master-admin-dashboard' && apartment.createdBy && (
              <div className="creator-info-section">
                <div className="creator-info">
                  <span className="creator-label">👤 Created by Admin:</span>
                  <span className="creator-value">{apartment.createdBy}</span>
                </div>
                <div className="creator-date">
                  <span className="creator-label">📅 Created on:</span>
                  <span className="creator-value">
                    {apartment.listedAt ? new Date(apartment.listedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            <div className="highlights-section">
              <h2>Property Highlights</h2>
              <div className="highlights-grid">
                <div className="highlight-item">
                  <div className="highlight-icon">🏢</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Type</div>
                    <div className="highlight-value">Apartment for Sale</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">#️⃣</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Apartment Number</div>
                    <div className="highlight-value">{apartment.apartmentNumber || 'N/A'}</div>
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
                  <div className="highlight-icon">🛏️</div>
                  <div className="highlight-content">
                    <div className="highlight-label">Bedrooms</div>
                    <div className="highlight-value">{apartment.bedrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🚿</div>
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

            <div className="details-section">
              <h2>Property Details</h2>
              <div className="details-table">
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{apartment.address || apartment.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bedrooms</span>
                  <span className="detail-value">{apartment.bedrooms || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Bathrooms</span>
                  <span className="detail-value">{apartment.bathrooms || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Area</span>
                  <span className="detail-value">{apartment.area ? `${apartment.area} sq ft` : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Apartment Number</span>
                  <span className="detail-value">{apartment.apartmentNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{apartment.isAvailable ? 'Available' : 'Sold'}</span>
                </div>
              </div>
            </div>

            {/* Facilities Section */}
            {apartment.facilities && apartment.facilities.length > 0 && (
              <div className="facilities-section">
                <h2>Facilities & Amenities</h2>
                <div className="facilities-grid">
                  {apartment.facilities.map((facility, index) => (
                    <div key={index} className="facility-item">
                      <span className="facility-icon">✓</span>
                      <span className="facility-name">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="description-section">
              <h2>Description</h2>
              <p className="description-text">
                {apartment.description || `Beautiful ${apartment.bedrooms}-bedroom apartment for sale in ${apartment.location}. This property offers ${apartment.area} sq ft of living space with ${apartment.bathrooms} bathrooms. Perfect for families or investors looking for quality real estate in a prime location.`}
              </p>
            </div>

            <div className="location-section">
              <h2>Location</h2>
              <div className="location-info">
                <div className="location-text">📍 {apartment.location}</div>
                <button className="location-button" onClick={openGoogleMaps}>
                  🗺️ See location
                </button>
              </div>
              
              <div className="interactive-map">
                {apartment.coordinates && apartment.coordinates.lat && apartment.coordinates.lng ? (
                  <MapViewer 
                    coordinates={apartment.coordinates}
                    address={apartment.location}
                    height="400px"
                    showControls={false}
                  />
                ) : (
                  <div className="map-placeholder">
                    <p>📍 {apartment.location}</p>
                    <button className="location-button" onClick={openGoogleMaps}>
                      🗺️ View on Google Maps
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="apartment-sidebar">
            <div className="contact-card">
              <h3>Listed by agency</h3>
              <div className="agency-info">
                <div className="agency-name">Ahmed Othman Group</div>
                <div className="agency-rating">⭐ 4 C</div>
                <div className="agency-member">Member since Sept 2024</div>
              </div>
              
              <div className="contact-actions">
                <WhatsAppButton 
                  phoneNumber={apartment.contactNumber || '+201234567890'}
                  message={`Hello, I'm interested in ${apartment.name} for ${formatPrice(apartment.price)}`}
                />
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="price-summary-card">
              <h3>Price Summary</h3>
              <div className="price-details">
                <div className="price-main">
                  <span className="price-label">Sale Price</span>
                  <span className="price-value">{formatPrice(apartment.price)}</span>
                </div>
                <div className="price-note">
                  Contact us for more details about payment plans and financing options.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentSaleDetailsPage;