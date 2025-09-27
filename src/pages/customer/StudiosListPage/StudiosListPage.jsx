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

  // Transform apartment parts data to studio format to match StudioCard component expectations
  const transformApartmentPartToStudio = (part) => {
    // Format price for display
    const monthlyPrice = part.monthly_price || part.price || part.rent_price || 0;
    const formattedPrice = `EGP ${parseFloat(monthlyPrice).toLocaleString()}/month`;
    
    // Format area for display
    const areaValue = part.area || part.size || '0';
    const formattedArea = `${areaValue} sqm`;
    
    // Format posted date
    const createdDate = part.created_at || part.createdAt || new Date();
    const postedDate = new Date(createdDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Ensure images array exists and has fallback
    const imageUrls = part.photos_url || part.images || [];
    const images = Array.isArray(imageUrls) && imageUrls.length > 0 
      ? imageUrls 
      : ['https://via.placeholder.com/300x200?text=No+Image'];
    
    // Handle location - might come from parent apartment data
    let location = 'Location not specified';
    if (part.location) {
      location = part.location.charAt(0).toUpperCase() + part.location.slice(1);
    } else if (part.apartment && part.apartment.location) {
      location = part.apartment.location.charAt(0).toUpperCase() + part.apartment.location.slice(1);
    }
    
    return {
      id: part.id || part._id,
      title: part.title || part.name || 'Studio',
      location: location,
      price: formattedPrice,
      pricePerMonth: parseFloat(monthlyPrice),
      area: formattedArea,
      bedrooms: part.bedrooms || 1,
      bathrooms: part.bathrooms || 'Private',
      amenities: part.facilities_amenities?.split(', ') || [],
      images: images,
      description: part.description || 'No description available',
      createdBy: part.created_by_admin_id || part.createdBy || null,
      createdAt: createdDate,
      postedDate: postedDate,
      status: part.status || 'available',
      furnished: part.furnished === 'yes',
      balcony: part.balcony || 'no',
      floor: part.floor || 1,
      apartment_id: part.apartment_id
    };
  };

  // Fetch studios data from apartment parts API
  const fetchAllStudios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🏢 Fetching studios from /apartments/parts endpoint...');
      
      // Use apartmentPartsApi to fetch all apartment parts (studios)
      const parts = await apartmentPartsApi.getAll();
      
      console.log('✅ Fetched apartment parts:', parts);
      
      if (parts && Array.isArray(parts)) {
        // Filter for available studios and transform the data
        const availableStudios = parts.filter(part => 
          part.status === 'available' || !part.status
        );
        
        // If we have apartment parts but no location info, we might need to fetch apartment details
        // For now, transform with available data
        const transformedStudios = availableStudios.map(transformApartmentPartToStudio);
        
        console.log('🏠 Transformed to studios:', transformedStudios);
        setAllStudios(transformedStudios);
        
        // Load first batch for display
        const firstBatch = transformedStudios.slice(0, STUDIOS_PER_PAGE);
        setDisplayedStudios(firstBatch);
        setCurrentPage(2);
        setHasMore(transformedStudios.length > STUDIOS_PER_PAGE);
      } else {
        console.warn('⚠️ No parts data received or invalid format');
        setAllStudios([]);
        setDisplayedStudios([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Failed to fetch studios:', error);
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
        <BackButton text="← Back" />
        <Link to="/admin" className="brand">Ahmed Othman Group</Link>
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