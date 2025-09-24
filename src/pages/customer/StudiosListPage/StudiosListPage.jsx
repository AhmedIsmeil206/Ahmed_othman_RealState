import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import StudioCard from '../../../components/customer/StudioCard/StudioCard';
import { apartmentPartsApi, rentApartmentsApi, handleApiError } from '../../../services/api';
import './StudiosListPage.css';

const StudiosListPage = () => {
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

  // Transform API studio data to frontend format
  const transformStudioData = (apiStudio, apartmentData) => ({
    id: apiStudio.id,
    title: `Studio ${apiStudio.studio_number}`,
    price: `${apiStudio.rent_value} EGP`,
    pricePerMonth: parseFloat(apiStudio.rent_value) || 0,
    location: apartmentData?.location || 'Unknown',
    area: `${apiStudio.area || apartmentData?.area || 'N/A'} sqm`,
    bedrooms: 1, // Studios typically have 1 bedroom
    bathrooms: apartmentData?.bathrooms === 'private' ? 1 : 0.5,
    furnished: 'Yes', // Default for studios
    type: 'Studio',
    ownership: 'Rent',
    completionStatus: 'Ready',
    description: apartmentData?.description || `Studio ${apiStudio.studio_number} available for rent`,
    highlights: {
      type: 'Studio',
      ownership: 'Rent',
      area: apiStudio.area || apartmentData?.area || 'N/A',
      bedrooms: '1',
      bathrooms: apartmentData?.bathrooms === 'private' ? '1' : 'Shared',
      furnished: 'Yes'
    },
    details: {
      paymentOption: 'Monthly',
      completionStatus: 'Ready',
      furnished: 'Yes',
      parking: 'Available',
      floor: apiStudio.floor || apartmentData?.floor || 'N/A'
    },
    images: apartmentData?.photos_url || [],
    coordinates: { lat: 30.0444, lng: 31.2357 }, // Default Cairo coordinates
    postedDate: new Date(apiStudio.created_at).toLocaleDateString() || 'Recently',
    contactNumber: apartmentData?.contact_number || '+201029336060',
    studioNumber: apiStudio.studio_number,
    apartmentId: apiStudio.apartment_id,
    isAvailable: apiStudio.status === 'available',
    floor: apiStudio.floor,
    createdAt: apiStudio.created_at,
    apartmentAddress: apartmentData?.address,
    apartmentName: apartmentData?.name
  });

  // Fetch all studios from API
  const fetchAllStudios = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all apartment parts (studios) 
      const studiosResponse = await apartmentPartsApi.getAll();
      console.log('Studios API Response:', studiosResponse);

      // Fetch all rent apartments to get apartment details
      const apartmentsResponse = await rentApartmentsApi.getAll();
      console.log('Apartments API Response:', apartmentsResponse);

      // Create a map of apartments by ID for quick lookup
      const apartmentsMap = {};
      apartmentsResponse.forEach(apt => {
        apartmentsMap[apt.id] = apt;
      });

      // Transform studios and combine with apartment data
      const transformedStudios = studiosResponse
        .filter(studio => studio.status === 'available') // Only show available studios for customers
        .map(studio => {
          const apartmentData = apartmentsMap[studio.apartment_id];
          return transformStudioData(studio, apartmentData);
        });

      console.log('Transformed Studios:', transformedStudios);
      setAllStudios(transformedStudios);
      
      return { success: true, studios: transformedStudios };
    } catch (error) {
      console.error('Failed to fetch studios:', error);
      const errorMessage = handleApiError(error, 'Failed to load studios');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllStudios();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  const loadMoreStudios = useCallback(() => {
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
  }, [currentPage, sortedStudios, isLoadingMore, hasMore]);

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
  }, [sortBy, priceRange, locationFilter, STUDIOS_PER_PAGE]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreStudiosRef.current();
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