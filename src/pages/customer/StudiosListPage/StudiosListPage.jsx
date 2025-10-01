import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import StudioCard from '../../../components/customer/StudioCard/StudioCard';
import { apartmentPartsApi, rentApartmentsApi, handleApiError } from '../../../services/api';
import { convertFromApiEnum, getValidOptions } from '../../../utils/apiEnums';
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
    
    // Handle location using enum conversion - might come from parent apartment data
    let location = 'Location not specified';
    let locationEnum = null;
    
    if (part.location) {
      locationEnum = part.location;
      location = convertFromApiEnum.location(part.location);
    } else if (part.apartment && part.apartment.location) {
      locationEnum = part.apartment.location;
      location = convertFromApiEnum.location(part.apartment.location);
    }
    
    // Handle bathrooms enum conversion
    const bathroomsDisplay = part.bathrooms ? convertFromApiEnum.bathrooms(part.bathrooms) : 'Private';
    
    // Handle furnished enum conversion
    const furnishedDisplay = part.furnished ? convertFromApiEnum.furnished(part.furnished) : false;
    
    // Handle balcony enum conversion
    const balconyDisplay = part.balcony ? convertFromApiEnum.balcony(part.balcony) : 'No';
    
    // Handle status enum conversion
    const statusDisplay = part.status ? convertFromApiEnum.status(part.status) : 'Available';
    
    return {
      id: part.id || part._id,
      title: part.title || part.name || 'Studio',
      location: location,
      locationEnum: locationEnum, // Keep for filtering
      price: formattedPrice,
      pricePerMonth: parseFloat(monthlyPrice),
      area: formattedArea,
      bedrooms: part.bedrooms || 1,
      bathrooms: bathroomsDisplay,
      bathroomsEnum: part.bathrooms, // Keep for API calls
      furnished: furnishedDisplay,
      furnishedEnum: part.furnished, // Keep for API calls
      balcony: balconyDisplay,
      balconyEnum: part.balcony, // Keep for API calls
      amenities: part.facilities_amenities?.split(', ') || [],
      images: images,
      description: part.description || 'No description available',
      createdBy: part.created_by_admin_id || part.createdBy || null,
      createdAt: createdDate,
      postedDate: postedDate,
      status: statusDisplay,
      statusEnum: part.status, // Keep for API calls
      floor: part.floor || 1,
      apartment_id: part.apartment_id,
      // Admin contact info will be populated by fetchAllStudios
      adminPhone: null,
      whatsappUrl: null,
      contact_number: null // Will be set to admin phone or fallback
    };
  };

  // Fetch studios data from apartment parts API
  const fetchAllStudios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🏢 Fetching studios from /apartments/parts endpoint...');
      
      // Use apartmentPartsApi to fetch all apartment parts (studios)
      const response = await apartmentPartsApi.getAll();
      
      // Handle different response formats
      const parts = Array.isArray(response) ? response : (response?.data || response?.parts || []);
      
      console.log('✅ Fetched apartment parts:', parts, 'Response type:', typeof response);
      
      if (parts && Array.isArray(parts) && parts.length > 0) {
        // Filter for available studios first, then transform the data
        const availableStudios = parts.filter(part => 
          !part.status || part.status === 'available'
        );
        
        console.log(`🔍 Found ${availableStudios.length} available studios from ${parts.length} total parts`);
        
        // Transform studios and fetch admin contact info for each
        const transformedStudios = await Promise.all(
          availableStudios.map(async (part) => {
            const transformedStudio = transformApartmentPartToStudio(part);
            
            // If we have apartment_id, fetch the admin's WhatsApp contact info
            if (part.apartment_id) {
              try {
                const whatsappInfo = await rentApartmentsApi.getWhatsAppContact(part.apartment_id);
                transformedStudio.adminPhone = whatsappInfo.admin_phone;
                transformedStudio.contact_number = whatsappInfo.admin_phone; // Use admin's actual phone
                console.log(`📱 Fetched admin phone for studio ${part.id}:`, whatsappInfo.admin_phone);
              } catch (error) {
                console.warn(`⚠️ Could not fetch WhatsApp info for apartment ${part.apartment_id}:`, error);
                // Use fallback - try to get from original part data or use default
                transformedStudio.contact_number = part.contact_number || '+201000000000';
                transformedStudio.adminPhone = part.contact_number || '+201000000000';
              }
            } else {
              // No apartment_id, use fallback
              transformedStudio.contact_number = part.contact_number || '+201000000000';
              transformedStudio.adminPhone = part.contact_number || '+201000000000';
            }
            
            return transformedStudio;
          })
        );
        
        console.log('🏠 Transformed studios with admin contacts:', transformedStudios);
        setAllStudios(transformedStudios);
        
        // Load first batch for display
        const firstBatch = transformedStudios.slice(0, STUDIOS_PER_PAGE);
        setDisplayedStudios(firstBatch);
        setCurrentPage(2);
        setHasMore(transformedStudios.length > STUDIOS_PER_PAGE);
      } else {
        console.warn('⚠️ No parts data received or invalid format. Response:', typeof response, response);
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
      
      // Location filter - use enum values for comparison
      if (locationFilter !== 'all') {
        const studioLocationEnum = studio.locationEnum || studio.location?.toLowerCase();
        if (!studioLocationEnum || studioLocationEnum !== locationFilter) return false;
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
                {getValidOptions.locations().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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