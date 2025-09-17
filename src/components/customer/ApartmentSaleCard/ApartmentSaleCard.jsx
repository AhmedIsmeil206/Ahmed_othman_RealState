import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ApartmentSaleCard.css';

const ApartmentSaleCard = ({ apartment }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/apartment-sale/${apartment.id}`);
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M EGP`;
    }
    return price.toLocaleString('en-EG') + ' EGP';
  };

  // Get availability status - for sale apartments we'll show if it's available
  const getAvailabilityStatus = () => {
    if (apartment.isAvailable === false) return 'Sold';
    return 'Available';
  };

  const getAvailabilityCount = () => {
    // For apartments, we can show how many units are available
    if (apartment.availableUnits && apartment.totalUnits) {
      return `${apartment.availableUnits} Available`;
    }
    return getAvailabilityStatus();
  };

  return (
    <div className="apartment-sale-card" onClick={handleCardClick}>
      <div className="apartment-sale-card__image-container">
        <img 
          src={apartment.images && apartment.images.length > 0 ? apartment.images[0] : '/api/placeholder/400/300'} 
          alt={apartment.name}
          className="apartment-sale-card__image"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        
        {/* Availability Badge */}
        <div className="apartment-sale-card__availability">
          {getAvailabilityCount()}
        </div>
        
        {/* Sale Badge */}
        <div className="apartment-sale-card__sale-badge">
          For Sale
        </div>
        
        {/* Delete button for admin view - only show if this is admin context */}
        {apartment.showDelete && (
          <button 
            className="apartment-sale-card__delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              apartment.onDelete && apartment.onDelete(apartment.id);
            }}
            title="Remove listing"
          >
            🗑️
          </button>
        )}
      </div>
      
      <div className="apartment-sale-card__content">
        <h3 className="apartment-sale-card__title">{apartment.name}</h3>
        
        <div className="apartment-sale-card__location">
          <span className="location-icon">📍</span>
          <span>{apartment.location}</span>
        </div>
        
        <div className="apartment-sale-card__details">
          <span className="detail-item">🛏️ {apartment.bedrooms || 'N/A'}</span>
          <span className="detail-item">🚿 {apartment.bathrooms || 'N/A'}</span>
          <span className="detail-item">📏 {apartment.area ? `${apartment.area} sq ft` : 'N/A'}</span>
        </div>
        
        <div className="apartment-sale-card__price">
          {formatPrice(apartment.price)}
        </div>
      </div>
    </div>
  );
};

export default ApartmentSaleCard;