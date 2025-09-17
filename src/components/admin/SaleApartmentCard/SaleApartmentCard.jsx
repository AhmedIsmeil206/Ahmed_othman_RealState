import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../../../hooks/useRedux';
import './SaleApartmentCard.css';

const SaleApartmentCard = ({ 
  apartment, 
  isAdminView = false,
  showCreatedBy = false 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteSaleApartment } = useProperty();
  const navigate = useNavigate();

  const handleDeleteApartment = () => {
    deleteSaleApartment(apartment.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCloseDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCardClick = () => {
    // Navigate to apartment sale details page
    navigate(`/admin/apartment-sale/${apartment.id}`);
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M EGP`;
    }
    return price.toLocaleString('en-EG') + ' EGP';
  };

  // Get availability status
  const getAvailabilityStatus = () => {
    if (apartment.isAvailable === false) return 'Sold';
    return 'Available';
  };

  return (
    <div className="sale-apartment-card" onClick={handleCardClick}>
      <div className="sale-apartment-card__image-container">
        <img 
          src={apartment.images && apartment.images.length > 0 ? apartment.images[0] : apartment.image || '/api/placeholder/400/300'} 
          alt={apartment.name}
          className="sale-apartment-card__image"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        
        {/* Photo count indicator */}
        {apartment.images && apartment.images.length > 1 && (
          <div className="sale-apartment-card__photo-count">
            📷 {apartment.images.length} photos
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="sale-apartment-card__availability">
          {getAvailabilityStatus()}
        </div>
        
        {/* Sale Badge */}
        <div className="sale-apartment-card__sale-badge">
          FOR SALE
        </div>
        
        {/* Delete button for admin view */}
        <button 
          className="sale-apartment-card__delete-btn"
          onClick={handleDeleteClick}
          title="Delete Apartment"
        >
          🗑️
        </button>
      </div>
      
      <div className="sale-apartment-card__content">
        <h3 className="sale-apartment-card__title">{apartment.name}</h3>
        
        <div className="sale-apartment-card__location">
          <span className="location-icon">📍</span>
          <span>{apartment.location}</span>
        </div>
        
        <div className="sale-apartment-card__details">
          <span className="detail-item">🛏️ {apartment.bedrooms || 'N/A'}</span>
          <span className="detail-item">🚿 {apartment.bathrooms || 'N/A'}</span>
          <span className="detail-item">📏 {apartment.area ? `${apartment.area} sq ft` : 'N/A'}</span>
        </div>
        
        <div className="sale-apartment-card__price">
          {formatPrice(apartment.price)}
        </div>

        {showCreatedBy && (
          <div className="sale-apartment-card__created-by">
            <span>Created by: {apartment.createdBy}</span>
          </div>
        )}
        
        <div className="sale-apartment-card__listed">
          Listed: {new Date(apartment.listedAt || apartment.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCloseDelete}>
          <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Delete Sale Apartment?</h4>
            <p>Are you sure you want to delete "{apartment.name}"?</p>
            <div className="warning-details">
              <p className="warning-text">⚠️ This action will permanently delete:</p>
              <ul className="deletion-list">
                <li>• The apartment "{apartment.name}"</li>
                <li>• All listing information and details</li>
                <li>• All related data and inquiries</li>
              </ul>
              <p className="warning-text">This will remove the apartment from:</p>
              <ul className="portal-list">
                <li>✓ Admin Portal</li>
                <li>✓ Master Admin Portal</li>
                <li>✓ Customer Sales Page</li>
              </ul>
              <p className="final-warning">This action cannot be undone!</p>
            </div>
            <div className="delete-confirm-actions">
              <button 
                className="confirm-cancel-btn"
                onClick={handleCloseDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteApartment}
              >
                Delete Apartment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleApartmentCard;