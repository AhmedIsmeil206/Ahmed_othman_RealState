import './Landingpage.css';
import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';

function LandingPage() {
  return (
    <main className="landing">
      {/* Hero with background image and dark overlay */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-label="Ahmed Othman Group — Real Estate"
      >
        <div className="hero__overlay" />

        <nav className="landing__nav">
          <Link to="/admin" className="brand">Ahmed Othman Group</Link>
          <div className="nav-actions">
            <a className="nav-link" href="#options">Services</a>
            <a className="nav-link" href="#contact">Contact</a>
          </div>
        </nav>

        <div className="hero__inner">
          <p className="subtitle" style={{display:"flex" ,flexDirection:"column", justifyContent:"center", alignItems:"center", fontSize:"18px", fontWeight:"700"}}>
            <span>We help individuals and businesses find the right place to live and invest.</span>
            <span>Discover modern studios for rent and premium apartments for sale with transparent</span>
            <span>pricing, clear processes, and dedicated support.</span>
          </p>

          <div className="cta-group" style={{display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '5%'}}>
            <button 
              className="btn btn--primary" 
              onClick={() => document.getElementById('options')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore options
            </button>
            {/* Contact button scrolls to footer contact info */}
          </div>
        </div>
      </section>

      {/* Options section: user can choose rent or buy */}
      <section className="options" id="options" aria-label="Choose a service">
        <article className="option-card">
          <div className="option-card__media" style={{ backgroundImage: `url(${heroImg})` }} aria-hidden />
          {/* Replaced icon with photo thumbnail */}
          <img className="option-card__thumb" src={heroImg} alt="Studio preview" aria-hidden="true" />
          <p className="option-card__text">
            Explore furnished studios in prime locations with flexible terms and quick move-ins.
          </p>
          <Link className="btn btn--primary option-card__btn" to="/studios">Rent a studio</Link>
        </article>

        <article className="option-card">
          <div className="option-card__media" style={{ backgroundImage: `url(${heroImg})` }} aria-hidden />
          {/* Replaced icon with photo thumbnail */}
          <img className="option-card__thumb" src={heroImg} alt="Apartment preview" aria-hidden="true" />
          <p className="option-card__text">
            Browse our curated apartments for sale with verified listings and expert guidance.
          </p>
          <Link className="btn btn--primary option-card__btn" to="/buy-apartments">Buy an apartment</Link>
        </article>
      </section>

      <footer className="landing__footer" id="contact">
        <span>© {new Date().getFullYear()} Ahmed Othman Group</span>
        <span className="sep">•</span>
        <a className="footer-link" href="mailto:info@example.com">info@example.com</a>
        <span className="sep">•</span>
        <a className="footer-link" href="https://wa.me/201029336060" target="_blank" rel="noopener noreferrer">+20 102 933 6060</a>
      </footer>
    </main>
  );
}

export default LandingPage;
