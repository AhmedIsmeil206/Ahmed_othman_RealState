import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = ({ phoneNumber, message = "Hello, I'm interested in this property" }) => {
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button 
      className="whatsapp-button"
      onClick={handleWhatsAppClick}
      type="button"
    >
      <span className="whatsapp-icon">📱</span>
      WhatsApp
    </button>
  );
};

export default WhatsAppButton;