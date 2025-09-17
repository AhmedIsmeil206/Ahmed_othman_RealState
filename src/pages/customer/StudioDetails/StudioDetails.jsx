import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../../../hooks/useRedux';
import BackButton from '../../../components/common/BackButton/BackButton';
import './StudioDetails.css';

const StudioDetails = () => {
  const { studioId } = useParams();
  const navigate = useNavigate();
  const { getStudioById } = useProperty();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get studio data or use mock data
  const studio = getStudioById(studioId) || {
    id: studioId,
    title: "Modern Studio in Downtown - Unit 201",
    price: "EGP 15,000",
    pricePerMonth: 15000,
    location: "New Cairo, Cairo Governorate",
    area: "50 sqm",
    bedrooms: 1,
    bathrooms: 1,
    furnished: "Yes",
    type: "Studio",
    ownership: "Rent",
    completionStatus: "Ready",
    floor: "2nd Floor",
    unitNumber: "A-201",
    description: "Cozy studio apartment with modern amenities. Features include air conditioning, built-in wardrobe, kitchen with appliances, and private bathroom. Located in a quiet neighborhood with easy access to public transportation and shopping centers.",
    highlights: {
      type: "Studio",
      ownership: "Rent",
      area: "50 sqm",
      bedrooms: "1",
      bathrooms: "1",
      furnished: "Yes"
    },
    details: {
      paymentOption: "Monthly",
      completionStatus: "Ready",
      furnished: "Yes",
      parking: "Available",
      floor: "2nd Floor",
      balcony: "Yes"
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    ],
    coordinates: { lat: 30.0444, lng: 31.2357 },
    postedDate: "2 days ago",
    contactNumber: "+20 100 123 4567",
    isAvailable: true,
    amenities: [
      "Air Conditioning",
      "Built-in Wardrobe",
      "Kitchen Appliances",
      "Private Bathroom",
      "High-Speed Internet",
      "Parking Space",
      "24/7 Security",
      "Elevator Access"
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === studio.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? studio.images.length - 1 : prev - 1
    );
  };

  const handleContact = () => {
    alert(`Contact: ${studio.contactNumber}`);
  };

  const handleScheduleViewing = () => {
    alert('Viewing scheduled! You will receive a confirmation soon.');
  };

  const openGoogleMaps = () => {
    if (studio.coordinates && studio.coordinates.lat && studio.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${studio.coordinates.lat},${studio.coordinates.lng}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (studio.location) {
      const searchQuery = encodeURIComponent(studio.location);
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="studio-details">
      {/* Header */}
      <div className="studio-details-header">
        <BackButton variant="default" />
        <h1>Studio Details</h1>
      </div>

      {/* Image Gallery */}
      <div className="image-gallery">
        <div className="main-image">
          <img 
            src={studio.images[currentImageIndex]} 
            alt={studio.title}
            className="studio-main-image"
          />
          <button className="nav-btn prev-btn" onClick={prevImage}>‹</button>
          <button className="nav-btn next-btn" onClick={nextImage}>›</button>
          <div className="image-counter">
            {currentImageIndex + 1} / {studio.images.length}
          </div>
        </div>
        <div className="thumbnail-gallery">
          {studio.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Studio ${index + 1}`}
              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Studio Info */}
      <div className="studio-info">
        <div className="studio-main-info">
          <div className="studio-header-info">
            <h2 className="studio-title">{studio.title}</h2>
            <div className="studio-price">{studio.price}/month</div>
          </div>
          
          <div className="studio-location">
            📍 {studio.location}
            <button 
              onClick={openGoogleMaps}
              className="maps-button"
              type="button"
            >
              🗺️ View on Google Maps
            </button>
          </div>

          <div className="studio-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🏠</span>
              <span>{studio.highlights.type}</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">📐</span>
              <span>{studio.highlights.area}</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🛏️</span>
              <span>{studio.highlights.bedrooms} Bedroom</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🚿</span>
              <span>{studio.highlights.bathrooms} Bathroom</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🪑</span>
              <span>{studio.highlights.furnished}</span>
            </div>
          </div>

          <div className="studio-description">
            <h3>Description</h3>
            <p>{studio.description}</p>
          </div>

          <div className="studio-amenities">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {studio.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  ✓ {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="studio-details-section">
            <h3>Property Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Floor:</span>
                <span className="detail-value">{studio.details.floor}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unit Number:</span>
                <span className="detail-value">{studio.unitNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Parking:</span>
                <span className="detail-value">{studio.details.parking}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Balcony:</span>
                <span className="detail-value">{studio.details.balcony}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Payment:</span>
                <span className="detail-value">{studio.details.paymentOption}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{studio.details.completionStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Sidebar */}
        <div className="contact-sidebar">
          <div className="contact-card">
            <h3>Interested in this studio?</h3>
            <div className="contact-info">
              <p>Contact us for viewing or inquiries</p>
              <div className="contact-number">{studio.contactNumber}</div>
            </div>
            <div className="contact-actions">
              <button className="btn btn-primary" onClick={handleContact}>
                📞 Call Now
              </button>
              <button className="btn btn-secondary" onClick={handleScheduleViewing}>
                📅 Schedule Viewing
              </button>
            </div>
            <div className="posted-date">
              Posted {studio.postedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDetails;