import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyManagement } from '../../../hooks/usePropertyManagement';
import './SaleApartmentCard.css';

const SaleApartmentCard = ({ 
  apartment, 
  isAdminView = false,
  showCreatedBy = false 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSaleApartment } = usePropertyManagement();
  const navigate = useNavigate();

  const handleDeleteApartment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting sale apartment:', apartment.id);
      const result = await deleteSaleApartment(apartment.id);
      
      if (result.success) {
        console.log('✅ Sale apartment deleted successfully');
        // Component will be removed from DOM by parent re-render
      } else {
        console.error('❌ Failed to delete sale apartment:', result.message);
        alert('Failed to delete apartment: ' + result.message);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('❌ Error deleting sale apartment:', error);
      alert('Error deleting apartment');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className={`sale-apartment-card ${showDeleteConfirm ? 'delete-mode' : ''}`} onClick={!showDeleteConfirm ? handleCardClick : undefined}>
      {!showDeleteConfirm ? (
        <>
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
              disabled={isDeleting}
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
        </>
      ) : (
        <div className="delete-confirmation-inline-sale">
          <div className="delete-confirm-header">
            <h4>🗑️ Delete Sale Apartment?</h4>
            <p>Are you sure you want to delete "{apartment.name}"?</p>
          </div>
          
          <div className="warning-box">
            <p className="warning-title">⚠️ This action will permanently delete:</p>
            <ul className="deletion-items">
              <li>• The apartment "{apartment.name}"</li>
              <li>• All listing information and details</li>
              <li>• All related data and inquiries</li>
            </ul>
            <p className="warning-footer">This will remove the apartment from Admin Portal, Master Admin Portal, and Customer Sales Page.</p>
            <p className="final-warning">⚠️ This action cannot be undone!</p>
          </div>
          
          <div className="delete-actions-inline">
            <button 
              className="cancel-delete-btn"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              className="confirm-delete-btn-inline"
              onClick={handleDeleteApartment}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Apartment'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SaleApartmentCard;