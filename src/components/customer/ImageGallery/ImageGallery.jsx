import React, { useState, useEffect } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play slider
  useEffect(() => {
    if (images.length <= 1 || isHovered || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [images.length, isHovered, isModalOpen]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isModalOpen) return;
      
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, images.length]);

  return (
    <div className="image-gallery">
      <div 
        className="gallery-slider"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="slider-container">
          <img 
            src={images[currentIndex]} 
            alt={`${title} ${currentIndex + 1}`}
            className="slider-image"
            onClick={() => openModal(currentIndex)}
          />
          
          {images.length > 1 && (
            <>
              <button className="slider-nav prev" onClick={prevImage}>‹</button>
              <button className="slider-nav next" onClick={nextImage}>›</button>
            </>
          )}
          
          <div className="image-counter">
            📷 {currentIndex + 1} / {images.length}
          </div>
        </div>
        
        {images.length > 1 && (
          <div className="slider-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="gallery-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <button className="nav-button prev" onClick={prevImage}>‹</button>
            <img 
              src={images[currentIndex]} 
              alt={`${title} ${currentIndex + 1}`}
              className="modal-image"
            />
            <button className="nav-button next" onClick={nextImage}>›</button>
            <div className="modal-image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;