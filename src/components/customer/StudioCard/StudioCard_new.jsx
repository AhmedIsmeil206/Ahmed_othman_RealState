import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudioCard.css';

const StudioCard = ({ studio }) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback((e) => {

    // Stop any event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    const path = `/studio/${studio.id}?source=customer-studios`;

    // Force immediate navigation with window.location.assign (more reliable than href)
    window.location.assign(path);
  }, [studio.id]);

  return (
    <div 
      className="studio-card" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="studio-card__image">
        <img src={studio.images[0]} alt={studio.title} />
        <div className="studio-card__image-count">
          📷 See {studio.images.length} photos
        </div>
      </div>
      
      <div className="studio-card__content">
        <div className="studio-card__price">{studio.price}</div>
        <h3 className="studio-card__title">{studio.title}</h3>
        
        <div className="studio-card__details">
          <span className="detail-item">🛏️ {studio.bedrooms}</span>
          <span className="detail-item">🚿 {studio.bathrooms}</span>
          <span className="detail-item">📏 {studio.area}</span>
        </div>
        
        <div className="studio-card__location">
          📍 {studio.location}
        </div>
        
        <div className="studio-card__posted">
          {studio.postedDate}
        </div>
      </div>
    </div>
  );
};

export default StudioCard;