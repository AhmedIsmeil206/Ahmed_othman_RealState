import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import StudioCard from '../../../components/customer/StudioCard/StudioCard';
import { useProperty } from '../../../hooks/useRedux';
import './StudiosListPage.css';

const StudiosListPage = () => {
  const { getAllAvailableStudios, fetchRentApartments } = useProperty();
  const allStudios = getAllAvailableStudios(); // Only get available studios for customers
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Pagination state
  const [displayedStudios, setDisplayedStudios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const STUDIOS_PER_PAGE = 10;

  // Fetch data from backend API on component mount
  useEffect(() => {
    const loadStudios = async () => {
      try {
        if (fetchRentApartments && typeof fetchRentApartments === 'function') {
          await fetchRentApartments(); // This will populate studios in apartments
        }
      } catch (error) {
        console.error('Failed to load studios:', error);
      }
    };
    loadStudios();
  }, [fetchRentApartments]);

  // Filter and sort studios - memoized to prevent infinite loops
  const filteredStudios = React.useMemo(() => {
    return allStudios.filter(studio => {
      // Price filter
      if (priceRange !== 'all') {
        if (priceRange === 'low' && studio.pricePerMonth > 15000) return false;
        if (priceRange === 'medium' && (studio.pricePerMonth <= 15000 || studio.pricePerMonth > 20000)) return false;
        if (priceRange === 'high' && studio.pricePerMonth <= 20000) return false;
      }
      
      // Location filter
      if (locationFilter !== 'all') {
        if (!studio.location || !studio.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      }
      
      return true;
    });
  }, [allStudios, priceRange, locationFilter]);

  const sortedStudios = React.useMemo(() => {
    return [...filteredStudios].sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerMonth - b.pricePerMonth;
      if (sortBy === 'price-high') return b.pricePerMonth - a.pricePerMonth;
      return 0; // Default newest
    });
  }, [filteredStudios, sortBy]);

  // Load more studios function
  const loadMoreStudios = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      const startIndex = (currentPage - 1) * STUDIOS_PER_PAGE;
      const endIndex = startIndex + STUDIOS_PER_PAGE;
      const newStudios = sortedStudios.slice(startIndex, endIndex);
      
      if (newStudios.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedStudios(prev => {
          // Avoid duplicates when filters change
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNewStudios = newStudios.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNewStudios];
        });
        setCurrentPage(prev => prev + 1);
      }
      
      setIsLoading(false);
    }, 500);
  }, [currentPage, sortedStudios, isLoading, hasMore]);

  // Use ref to store the latest loadMoreStudios function
  const loadMoreStudiosRef = useRef(loadMoreStudios);
  useEffect(() => {
    loadMoreStudiosRef.current = loadMoreStudios;
  }, [loadMoreStudios]);

  // Reset pagination when filters change
  useEffect(() => {
    if (sortedStudios.length === 0) {
      setDisplayedStudios([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }
    
    // Load first batch
    const firstBatch = sortedStudios.slice(0, STUDIOS_PER_PAGE);
    setDisplayedStudios(firstBatch);
    setCurrentPage(2);
    setHasMore(sortedStudios.length > STUDIOS_PER_PAGE);
  }, [sortBy, priceRange, locationFilter]); // Remove sortedStudios from dependencies

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreStudiosRef.current(); // Use ref to get latest function
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // No dependencies needed - ref always has latest function

  return (
    <div className="studios-list-page">
      <nav className="studios-nav">
        <BackButton 
          text="← Back"
        />
        <Link to="/admin" className="brand">Ahmed Othman Group</Link>
      </nav>

      <div className="studios-container">
        <header className="studios-header">
          <h1>Studios for Rent</h1>
          <p>{sortedStudios.length} properties found, showing {displayedStudios.length}</p>
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
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
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
              <option value="low">Under 15,000 EGP</option>
              <option value="medium">15,000 - 20,000 EGP</option>
              <option value="high">Above 20,000 EGP</option>
            </select>
          </div>
        </div>

        <div className="studios-grid">
          {displayedStudios.map(studio => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading more studios...</p>
          </div>
        )}

        {/* Load more button for manual loading (fallback) */}
        {!isLoading && hasMore && displayedStudios.length > 0 && (
          <div className="load-more-section">
            <button 
              className="load-more-btn" 
              onClick={loadMoreStudios}
            >
              Load More Studios
            </button>
          </div>
        )}

        {/* No more studios indicator */}
        {!hasMore && displayedStudios.length > 0 && (
          <div className="end-indicator">
            <p>You've reached the end! No more studios to show.</p>
          </div>
        )}

        {displayedStudios.length === 0 && !isLoading && (
          <div className="no-results">
            <h3>No studios found</h3>
            <p>Try adjusting your filters to see more options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudiosListPage;