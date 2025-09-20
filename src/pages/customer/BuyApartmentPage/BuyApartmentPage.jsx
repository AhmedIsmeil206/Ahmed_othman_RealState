import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ApartmentSaleCard from '../../../components/customer/ApartmentSaleCard/ApartmentSaleCard';
import { useProperty } from '../../../hooks/useRedux';
import './BuyApartmentPage.css';

const BuyApartmentPage = () => {
  const { getAllAvailableSaleApartments, fetchSaleApartments } = useProperty();
  const allSaleApartments = getAllAvailableSaleApartments(); // Only get available sale apartments for customers
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [bedroomFilter, setBedroomFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Fetch data from backend API on component mount
  useEffect(() => {
    const loadSaleApartments = async () => {
      try {
        if (fetchSaleApartments && typeof fetchSaleApartments === 'function') {
          await fetchSaleApartments();
        }
      } catch (error) {
        console.error('Failed to load sale apartments:', error);
      }
    };
    loadSaleApartments();
  }, [fetchSaleApartments]);

  const filteredApartments = allSaleApartments.filter(apartment => {
    // Price range filter
    if (priceRange === 'all') {
      // Continue to next filter
    } else if (priceRange === 'low' && apartment.price > 5000000) {
      return false;
    } else if (priceRange === 'medium' && (apartment.price <= 5000000 || apartment.price > 10000000)) {
      return false;
    } else if (priceRange === 'high' && apartment.price <= 10000000) {
      return false;
    }

    // Bedroom filter
    if (bedroomFilter === 'all') {
      // Continue to next filter
    } else if (bedroomFilter === '1' && apartment.bedrooms !== 1) {
      return false;
    } else if (bedroomFilter === '2' && apartment.bedrooms !== 2) {
      return false;
    } else if (bedroomFilter === '3+' && apartment.bedrooms < 3) {
      return false;
    }

    // Location filter
    if (locationFilter !== 'all') {
      if (!apartment.location || !apartment.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const sortedApartments = [...filteredApartments].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'area-low') return (a.area || 0) - (b.area || 0);
    if (sortBy === 'area-high') return (b.area || 0) - (a.area || 0);
    return new Date(b.listedAt || b.createdAt) - new Date(a.listedAt || a.createdAt); // Default newest
  });

  return (
    <div className="buy-apartment-page">
      <nav className="apartments-nav">
        <BackButton 
          text="← Back"
        />
        <Link to="/admin" className="brand">Ahmed Othman Group</Link>
      </nav>

      <div className="apartments-container">
        <header className="apartments-header">
          <h1>Apartments for Sale</h1>
          <p>{sortedApartments.length} properties found</p>
        </header>

        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="location">Location:</label>
            <select 
              id="location"
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Locations</option>
              <option value="maadi">Maadi</option>
              <option value="mokkattam">Mokkattam</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-low">Area: Small to Large</option>
              <option value="area-high">Area: Large to Small</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price">Price Range:</label>
            <select 
              id="price"
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="low">Under 5M EGP</option>
              <option value="medium">5M - 10M EGP</option>
              <option value="high">Above 10M EGP</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="bedrooms">Bedrooms:</label>
            <select 
              id="bedrooms"
              value={bedroomFilter} 
              onChange={(e) => setBedroomFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3+">3+ Bedrooms</option>
            </select>
          </div>
        </div>

        <div className="apartments-grid">
          {sortedApartments.map(apartment => (
            <ApartmentSaleCard key={apartment.id} apartment={apartment} />
          ))}
        </div>

        {sortedApartments.length === 0 && (
          <div className="no-results">
            <h3>No apartments found</h3>
            <p>Try adjusting your filters to see more options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyApartmentPage;