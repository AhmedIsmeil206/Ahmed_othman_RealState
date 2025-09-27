import React, { useState } from 'react';
import { useProperty } from '../../../hooks/useRedux';
import StudioMiniCard from '../StudioMiniCard';
import './ApartmentCard.css';

const ApartmentCard = ({ 
  apartment, 
  onAddStudio
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteApartment } = useProperty();

  const availableStudios = apartment.studios ? apartment.studios.filter(studio => studio.isAvailable).length : 0;
  const occupiedStudios = apartment.studios ? apartment.studios.length - availableStudios : 0;

  const handleDeleteApartment = () => {
    deleteApartment(apartment.id);
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

  return (
    <div className="apartment-card">
      <div className="apartment-card-header">
        <div 
          className="apartment-image"
          style={{ backgroundImage: `url(${apartment.image})` }}
        >
          <div className="apartment-image-overlay">
            <div className="apartment-stats">
              <span className="stat-badge available">{availableStudios} Available</span>
              <span className="stat-badge occupied">{occupiedStudios} Occupied</span>
            </div>
          </div>
        </div>
        
        <div className="apartment-info">
          <div className="apartment-header-row">
            <div className="apartment-title-section">
              <h3 className="apartment-name">{apartment.name}</h3>
              <p className="apartment-location">{apartment.location}</p>
            </div>
            <button 
              className="delete-apartment-btn"
              onClick={handleDeleteClick}
              title="Delete Apartment"
            >
              🗑️
            </button>
          </div>
          <p className="apartment-description">{apartment.description}</p>
          
          <div className="apartment-facilities">
            {apartment.facilities && apartment.facilities.length > 0 ? (
              <>
                {apartment.facilities.slice(0, 3).map((facility, index) => (
                  <span key={index} className="facility-tag">{facility}</span>
                ))}
                {apartment.facilities.length > 3 && (
                  <span className="facility-tag more">+{apartment.facilities.length - 3} more</span>
                )}
              </>
            ) : (
              <span className="facility-tag">No facilities listed</span>
            )}
          </div>
        </div>
      </div>

      <div className="apartment-card-actions">
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Studios' : `View ${apartment.totalStudios || (apartment.studios ? apartment.studios.length : 0)} Studios`}
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        
        <button 
          className="add-studio-btn"
          onClick={() => onAddStudio(apartment.id)}
        >
          + Add Studio
        </button>
      </div>

      <div className={`studios-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {isExpanded && apartment.studios && (
          <>
            <div className="studios-grid">
              {apartment.studios.map(studio => (
                <StudioMiniCard
                  key={studio.id}
                  studio={studio}
                  apartmentId={apartment.id}
                />
              ))}
            </div>
            
            {apartment.studios.length === 0 && (
              <div className="no-studios">
                <p>No studios in this apartment yet</p>
                <button 
                  className="add-first-studio-btn"
                  onClick={() => onAddStudio(apartment.id)}
                >
                  Add First Studio
                </button>
              </div>
            )}
          </>
        )}
        
        {isExpanded && !apartment.studios && (
          <div className="no-studios">
            <p>No studios in this apartment yet</p>
            <button 
              className="add-first-studio-btn"
              onClick={() => onAddStudio(apartment.id)}
            >
              Add First Studio
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCloseDelete}>
          <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Delete Apartment?</h4>
            <p>Are you sure you want to delete "{apartment.name}"?</p>
            <div className="warning-details">
              <p className="warning-text">⚠️ This action will permanently delete:</p>
              <ul className="deletion-list">
                <li>• The apartment "{apartment.name}"</li>
                <li>• All {apartment.studios ? apartment.studios.length : 0} studio{apartment.studios && apartment.studios.length !== 1 ? 's' : ''} in this apartment</li>
                <li>• All related data and bookings</li>
              </ul>
              <p className="warning-text">This will remove the apartment and its studios from:</p>
              <ul className="portal-list">
                <li>✓ Admin Portal</li>
                <li>✓ Master Admin Portal</li>
                <li>✓ Customer Rental Page</li>
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
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentCard;