import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import AYGLogo from '../../../assets/images/logo/AYG.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="landing__footer" id="contact">
      <div className="footer-content">
        <div className="footer-owner">
          <h3 className="footer-heading">Owner and founder of AYG</h3>
          <div className="owner-photo">
            <img src="/founder1.jpeg" alt="Owner and Founder" className="founder-img" />
          </div>
          <h3>Dr. Ahmed Yasser</h3>
        </div>
        
        <div className="footer-contact">
          <h3 className="footer-heading">Contact Us</h3>
          <div className="contact-links">
            <a href="https://www.facebook.com/share/17UqaGsPuW/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="contact-item">
              <FontAwesomeIcon icon={faFacebook} className="contact-icon" />
              <span className="contact-text">Facebook</span>
            </a>
            <a href="https://wa.me/201044465888" target="_blank" rel="noopener noreferrer" className="contact-item">
              <FontAwesomeIcon icon={faWhatsapp} className="contact-icon" />
              <span className="contact-text">01044465888</span>
            </a>
            <a href="https://maps.app.goo.gl/9LYfAyt5MxHnmEyv5?g_st=ipc" target="_blank" rel="noopener noreferrer" className="contact-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
              <span className="contact-text">Location on Google Maps</span>
            </a>
          </div>
        </div>

        <div className="footer-info">
          <h3 className="footer-heading">How to find us</h3>
          <div className="info-item">
            <p className="info-text">مواعيد العمل من ١١ صباح ل ٩ مساءا</p>
          </div>
          <div className="info-item">
            <p className="info-text">العنوان : الهضبة الوسطي - المقطم - شارع الجامعة الحديثة</p>
            <p className="info-text">مبني رقم 6458 امام شركة الحمد</p>
            <p className="info-text">الدور الاول</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} <img src={AYGLogo} alt="AYG" className="footer-logo-inline" /> All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
