import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import StudioCard from '../../../components/customer/StudioCard/StudioCard';
import { apartmentPartsApi, handleApiError } from '../../../services/api';
import './StudiosListPage.css';

const StudiosListPage = () => {
  // State management
  const [allStudios, setAllStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Pagination state
  const [displayedStudios, setDisplayedStudios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const STUDIOS_PER_PAGE = 10;

  // Transform apartment parts data to studio format
  const transformApartmentPartToStudio = (part) => ({
    id: part._id || part.id,
    title: part.title || part.name || 'Studio',
    location: part.location || 'Location not specified',
    pricePerMonth: part.price || part.rent_price || 0,
    area: part.area || part.size || 'N/A',
    bedrooms: part.bedrooms || part.rooms || 0,
    bathrooms: part.bathrooms || 1,
    amenities: part.amenities || [],
    images: part.images || [part.image] || [],
    description: part.description || 'No description available',
    createdBy: part.createdBy || part.created_by || null,
    createdAt: part.createdAt || part.created_at || new Date(),
    status: part.status || 'available',
    furnished: part.furnished || false,
    floor: part.floor || 1,
    apartment_id: part.apartment_id
  });

  // Fetch studios data from apartment parts API
  const fetchAllStudios = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use apartmentPartsApi to fetch all apartment parts (studios)
      const parts = await apartmentPartsApi.getAll({ 
        status: 'available', // Only get available studios
        type: 'studio' // Filter for studio type if available
      });

      if (parts && Array.isArray(parts)) {
        // Transform the data to studio format
        const transformedStudios = parts
          .filter(part => part.status === 'available' || !part.status) // Only show available
          .map(transformApartmentPartToStudio);

        setAllStudios(transformedStudios);
        
        // Load first batch for display
        const firstBatch = transformedStudios.slice(0, STUDIOS_PER_PAGE);
        setDisplayedStudios(firstBatch);
        setCurrentPage(2);
        setHasMore(transformedStudios.length > STUDIOS_PER_PAGE);
      } else {
setAllStudios([]);
        setDisplayedStudios([]);
        setHasMore(false);
      }
    } catch (error) {
const errorMessage = handleApiError(error, 'Failed to load studios');
      setError(errorMessage);
      setAllStudios([]);
      setDisplayedStudios([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllStudios();
  }, []);

  // Filter and sort studios - memoized to prevent infinite loops
  const filteredStudios = React.useMemo(() => {
    if (!allStudios.length) return [];
    
    return allStudios.filter(studio => {
      // Price filter
      if (priceRange !== 'all') {
        const price = studio.pricePerMonth;
        if (priceRange === 'low' && price > 15000) return false;
        if (priceRange === 'medium' && (price <= 15000 || price > 20000)) return false;
        if (priceRange === 'high' && price <= 20000) return false;
      }
      
      // Location filter
      if (locationFilter !== 'all') {
        if (!studio.location || !studio.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      }
      
      return true;
    });
  }, [allStudios, priceRange, locationFilter]);

  const sortedStudios = React.useMemo(() => {
    if (!filteredStudios.length) return [];
    
    return [...filteredStudios].sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerMonth - b.pricePerMonth;
      if (sortBy === 'price-high') return b.pricePerMonth - a.pricePerMonth;
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [filteredStudios, sortBy]);

  // Load more studios function
  const loadMoreStudios = () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
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
      
      setIsLoadingMore(false);
    }, 500);
  };

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
  }, [sortBy, priceRange, locationFilter, sortedStudios]);

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreStudios();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Retry function for error state
  const handleRetry = () => {
    fetchAllStudios();
  };

  return (
    <div className="studios-list-page">
      <nav className="studios-nav">
        <BackButton text="? Back" />
        <div className="brand">AYG</div>
      </nav>

      <div className="studios-container">
        <header className="studios-header">
          <h1>Studios for Rent</h1>
          {!isLoading && !error && (
            <p>{sortedStudios.length} properties found, showing {displayedStudios.length}</p>
          )}
        </header>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <div className="error-content">
              <h3>Failed to Load Studios</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Filters Section - Only show when not loading and no error */}
        {!isLoading && !error && (
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
        )}

        {/* Studios Grid - Only show when not loading and no error */}
        {!isLoading && !error && (
          <div className="studios-grid">
            {displayedStudios.map(studio => (
              <StudioCard key={studio.id} studio={studio} />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {!isLoading && !error && isLoadingMore && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Load more button for manual loading (fallback) */}
        {!isLoading && !error && !isLoadingMore && hasMore && displayedStudios.length > 0 && (
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
        {!isLoading && !error && !hasMore && displayedStudios.length > 0 && (
          <div className="end-indicator">
            <p>You've reached the end! No more studios to show.</p>
          </div>
        )}

        {/* No results state */}
        {!isLoading && !error && displayedStudios.length === 0 && allStudios.length === 0 && (
          <div className="no-results">
            <h3>No studios available</h3>
            <p>There are currently no studios available for rent. Please check back later.</p>
          </div>
        )}

        {/* Filtered results state */}
        {!isLoading && !error && displayedStudios.length === 0 && allStudios.length > 0 && (
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