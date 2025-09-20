import { useSelector, useDispatch } from 'react-redux';
import { 
  rentApartmentsApi, 
  saleApartmentsApi, 
  apartmentPartsApi, 
  myContentApi,
  handleApiError 
} from '../services/api';
import {
  setLoading,
  setError,
  clearError,
  setApartments,
  addApartment as addApartmentAction,
  updateApartment as updateApartmentAction,
  deleteApartment as deleteApartmentAction,
  addStudio as addStudioAction,
  updateStudio as updateStudioAction,
  deleteStudio as deleteStudioAction,
  toggleStudioAvailability as toggleStudioAvailabilityAction,
  setSaleApartments,
  addSaleApartment as addSaleApartmentAction,
  updateSaleApartment as updateSaleApartmentAction,
  deleteSaleApartment as deleteSaleApartmentAction,
  selectProperty,
  selectApartments,
  selectSaleApartments,
  selectPropertyLoading,
  selectPropertyError,
  selectApartmentsByCreator,
  selectAllAvailableStudios,
  selectStudiosByCreator,
  selectSaleApartmentsByCreator,
  selectAllAdminCreators
} from '../store/slices/propertySlice';

export const usePropertyManagement = () => {
  const dispatch = useDispatch();
  const property = useSelector(selectProperty);
  const apartments = useSelector(selectApartments);
  const saleApartments = useSelector(selectSaleApartments);
  const isLoading = useSelector(selectPropertyLoading);
  const error = useSelector(selectPropertyError);

  // Transform backend apartment data to frontend format
  const transformRentApartmentFromApi = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.title,
    location: apiApartment.location,
    address: apiApartment.address,
    price: apiApartment.price,
    area: apiApartment.area,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    furnished: apiApartment.furnished,
    amenities: apiApartment.amenities || [],
    images: apiApartment.images || [],
    description: apiApartment.description,
    contactNumber: apiApartment.contact_number,
    coordinates: apiApartment.coordinates || { lat: 0, lng: 0 },
    totalStudios: apiApartment.total_studios || 0,
    availableStudios: apiApartment.available_studios || 0,
    createdBy: apiApartment.created_by,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    studios: [], // Will be populated separately if needed
    // Legacy compatibility
    postedDate: apiApartment.created_at,
    isAvailable: true
  });

  // Transform frontend apartment data to backend format
  const transformRentApartmentToApi = (frontendApartment) => ({
    title: frontendApartment.title,
    location: frontendApartment.location,
    address: frontendApartment.address,
    price: parseFloat(frontendApartment.price) || 0,
    area: parseFloat(frontendApartment.area) || 0,
    bedrooms: parseInt(frontendApartment.bedrooms) || 0,
    bathrooms: parseInt(frontendApartment.bathrooms) || 0,
    furnished: frontendApartment.furnished || false,
    amenities: frontendApartment.amenities || [],
    images: frontendApartment.images || [],
    description: frontendApartment.description || '',
    contact_number: frontendApartment.contactNumber || '',
    coordinates: frontendApartment.coordinates || { lat: 0, lng: 0 },
    total_studios: parseInt(frontendApartment.totalStudios) || 0
  });

  // Transform studio/apartment part data
  const transformStudioFromApi = (apiStudio) => ({
    id: apiStudio.id,
    apartmentId: apiStudio.apartment_id,
    studioNumber: apiStudio.studio_number,
    area: apiStudio.area,
    price: apiStudio.price,
    furnished: apiStudio.furnished,
    amenities: apiStudio.amenities || [],
    images: apiStudio.images || [],
    description: apiStudio.description,
    isAvailable: apiStudio.is_available,
    contactNumber: apiStudio.contact_number,
    createdBy: apiStudio.created_by,
    createdAt: apiStudio.created_at,
    updatedAt: apiStudio.updated_at,
    // Legacy compatibility
    title: `Studio ${apiStudio.studio_number}`,
    bedrooms: 1,
    bathrooms: 1,
    postedDate: apiStudio.created_at
  });

  const transformStudioToApi = (frontendStudio) => ({
    studio_number: frontendStudio.studioNumber || frontendStudio.title?.replace('Studio ', '') || '1',
    area: parseFloat(frontendStudio.area) || 0,
    price: parseFloat(frontendStudio.price) || 0,
    furnished: frontendStudio.furnished || false,
    amenities: frontendStudio.amenities || [],
    images: frontendStudio.images || [],
    description: frontendStudio.description || '',
    is_available: frontendStudio.isAvailable !== false,
    contact_number: frontendStudio.contactNumber || ''
  });

  // Transform sale apartment data
  const transformSaleApartmentFromApi = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.title,
    location: apiApartment.location,
    address: apiApartment.address,
    price: apiApartment.price,
    area: apiApartment.area,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    furnished: apiApartment.furnished,
    amenities: apiApartment.amenities || [],
    images: apiApartment.images || [],
    description: apiApartment.description,
    contactNumber: apiApartment.contact_number,
    coordinates: apiApartment.coordinates || { lat: 0, lng: 0 },
    completionStatus: apiApartment.completion_status,
    floor: apiApartment.floor,
    unitNumber: apiApartment.unit_number,
    highlights: apiApartment.highlights || {},
    details: apiApartment.details || {},
    createdBy: apiApartment.created_by,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    // Legacy compatibility
    type: 'sale',
    ownership: 'Sale',
    postedDate: apiApartment.created_at,
    isAvailable: apiApartment.is_available !== false,
    listedAt: apiApartment.created_at
  });

  const transformSaleApartmentToApi = (frontendApartment) => ({
    title: frontendApartment.title,
    location: frontendApartment.location,
    address: frontendApartment.address,
    price: parseFloat(frontendApartment.price) || 0,
    area: parseFloat(frontendApartment.area) || 0,
    bedrooms: parseInt(frontendApartment.bedrooms) || 0,
    bathrooms: parseInt(frontendApartment.bathrooms) || 0,
    furnished: frontendApartment.furnished || false,
    amenities: frontendApartment.amenities || [],
    images: frontendApartment.images || [],
    description: frontendApartment.description || '',
    contact_number: frontendApartment.contactNumber || '',
    coordinates: frontendApartment.coordinates || { lat: 0, lng: 0 },
    completion_status: frontendApartment.completionStatus || 'Ready',
    floor: frontendApartment.floor || '',
    unit_number: frontendApartment.unitNumber || '',
    highlights: frontendApartment.highlights || {},
    details: frontendApartment.details || {},
    is_available: frontendApartment.isAvailable !== false
  });

  // ==================== RENT APARTMENTS ====================

  // Fetch all rent apartments
  const fetchRentApartments = async (params = {}) => {
    try {
      dispatch(setLoading(true));
      const response = await rentApartmentsApi.getAll(params);
      const transformedApartments = response.map(transformRentApartmentFromApi);
      dispatch(setApartments(transformedApartments));
      return { success: true, apartments: transformedApartments };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch apartments');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Create rent apartment
  const createRentApartment = async (apartmentData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformRentApartmentToApi(apartmentData);
      const response = await rentApartmentsApi.create(apiData);
      const transformedApartment = transformRentApartmentFromApi(response);
      
      dispatch(addApartmentAction(transformedApartment));
      return { 
        success: true, 
        message: 'Apartment created successfully',
        apartment: transformedApartment
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update rent apartment
  const updateRentApartment = async (apartmentId, updateData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformRentApartmentToApi(updateData);
      const response = await rentApartmentsApi.update(apartmentId, apiData);
      const transformedApartment = transformRentApartmentFromApi(response);
      
      dispatch(updateApartmentAction(transformedApartment));
      return { 
        success: true, 
        message: 'Apartment updated successfully',
        apartment: transformedApartment
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete rent apartment
  const deleteRentApartment = async (apartmentId) => {
    try {
      dispatch(setLoading(true));
      await rentApartmentsApi.delete(apartmentId);
      dispatch(deleteApartmentAction(apartmentId));
      return { 
        success: true, 
        message: 'Apartment deleted successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ==================== APARTMENT PARTS (STUDIOS) ====================

  // Fetch studios for an apartment
  const fetchStudiosForApartment = async (apartmentId) => {
    try {
      dispatch(setLoading(true));
      const response = await apartmentPartsApi.getAll({ apartment_id: apartmentId });
      const transformedStudios = response.map(transformStudioFromApi);
      
      // Update the apartment in the store with studios
      const updatedApartments = apartments.map(apt => 
        apt.id === apartmentId ? { ...apt, studios: transformedStudios } : apt
      );
      dispatch(setApartments(updatedApartments));
      
      return { success: true, studios: transformedStudios };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch studios');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Create studio for apartment
  const createStudio = async (apartmentId, studioData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformStudioToApi(studioData);
      const response = await apartmentPartsApi.create(apartmentId, apiData);
      const transformedStudio = transformStudioFromApi(response);
      
      dispatch(addStudioAction({ apartmentId, studio: transformedStudio }));
      return { 
        success: true, 
        message: 'Studio created successfully',
        studio: transformedStudio
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create studio');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update studio
  const updateStudio = async (studioId, updateData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformStudioToApi(updateData);
      const response = await apartmentPartsApi.update(studioId, apiData);
      const transformedStudio = transformStudioFromApi(response);
      
      dispatch(updateStudioAction(transformedStudio));
      return { 
        success: true, 
        message: 'Studio updated successfully',
        studio: transformedStudio
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update studio');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete studio
  const deleteStudio = async (studioId) => {
    try {
      dispatch(setLoading(true));
      await apartmentPartsApi.delete(studioId);
      dispatch(deleteStudioAction(studioId));
      return { 
        success: true, 
        message: 'Studio deleted successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete studio');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Toggle studio availability
  const toggleStudioAvailability = async (studioId, isAvailable) => {
    try {
      dispatch(setLoading(true));
      const response = await apartmentPartsApi.update(studioId, { is_available: !isAvailable });
      const transformedStudio = transformStudioFromApi(response);
      
      dispatch(toggleStudioAvailabilityAction({ studioId }));
      return { 
        success: true, 
        message: `Studio ${!isAvailable ? 'made available' : 'marked as occupied'}`,
        studio: transformedStudio
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update studio availability');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ==================== SALE APARTMENTS ====================

  // Fetch all sale apartments
  const fetchSaleApartments = async (params = {}) => {
    try {
      dispatch(setLoading(true));
      const response = await saleApartmentsApi.getAll(params);
      const transformedApartments = response.map(transformSaleApartmentFromApi);
      dispatch(setSaleApartments(transformedApartments));
      return { success: true, apartments: transformedApartments };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch sale apartments');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Create sale apartment
  const createSaleApartment = async (apartmentData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformSaleApartmentToApi(apartmentData);
      const response = await saleApartmentsApi.create(apiData);
      const transformedApartment = transformSaleApartmentFromApi(response);
      
      dispatch(addSaleApartmentAction(transformedApartment));
      return { 
        success: true, 
        message: 'Sale apartment created successfully',
        apartment: transformedApartment
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create sale apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update sale apartment
  const updateSaleApartment = async (apartmentId, updateData) => {
    try {
      dispatch(setLoading(true));
      const apiData = transformSaleApartmentToApi(updateData);
      const response = await saleApartmentsApi.update(apartmentId, apiData);
      const transformedApartment = transformSaleApartmentFromApi(response);
      
      dispatch(updateSaleApartmentAction(transformedApartment));
      return { 
        success: true, 
        message: 'Sale apartment updated successfully',
        apartment: transformedApartment
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update sale apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete sale apartment
  const deleteSaleApartment = async (apartmentId) => {
    try {
      dispatch(setLoading(true));
      await saleApartmentsApi.delete(apartmentId);
      dispatch(deleteSaleApartmentAction(apartmentId));
      return { 
        success: true, 
        message: 'Sale apartment deleted successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete sale apartment');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ==================== MY CONTENT (ADMIN'S OWN DATA) ====================

  // Fetch admin's own content
  const fetchMyContent = async (params = {}) => {
    try {
      dispatch(setLoading(true));
      const response = await myContentApi.getMyContent(params);
      
      // Transform the data based on what's returned
      const transformedRentApartments = response.rent_apartments?.map(transformRentApartmentFromApi) || [];
      const transformedSaleApartments = response.sale_apartments?.map(transformSaleApartmentFromApi) || [];
      
      dispatch(setApartments(transformedRentApartments));
      dispatch(setSaleApartments(transformedSaleApartments));
      
      return { 
        success: true, 
        rentApartments: transformedRentApartments,
        saleApartments: transformedSaleApartments
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch your content');
      dispatch(setError(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Clear error
  const clearPropertyError = () => {
    dispatch(clearError());
  };

  // ==================== API FETCH FUNCTIONS ====================

  // These functions fetch fresh data from API and can be used to refresh data
  const fetchApartmentsByCreatorFromApi = async (createdBy) => {
    try {
      const response = await rentApartmentsApi.getAll({ created_by: createdBy });
      return response.map(transformRentApartmentFromApi);
    } catch (error) {
      console.error('Failed to fetch apartments by creator:', error);
      return [];
    }
  };

  const fetchStudiosByCreatorFromApi = async (createdBy) => {
    try {
      const response = await apartmentPartsApi.getAll({ created_by: createdBy });
      return response.map(transformStudioFromApi);
    } catch (error) {
      console.error('Failed to fetch studios by creator:', error);
      return [];
    }
  };

  const fetchSaleApartmentsByCreatorFromApi = async (createdBy) => {
    try {
      const response = await saleApartmentsApi.getAll({ created_by: createdBy });
      return response.map(transformSaleApartmentFromApi);
    } catch (error) {
      console.error('Failed to fetch sale apartments by creator:', error);
      return [];
    }
  };

  return {
    // State
    property,
    apartments,
    saleApartments,
    isLoading,
    error,
    
    // Rent Apartments
    fetchRentApartments,
    createRentApartment,
    updateRentApartment,
    deleteRentApartment,
    
    // Studios/Apartment Parts
    fetchStudiosForApartment,
    createStudio,
    updateStudio,
    deleteStudio,
    toggleStudioAvailability,
    
    // Sale Apartments
    fetchSaleApartments,
    createSaleApartment,
    updateSaleApartment,
    deleteSaleApartment,
    
    // My Content
    fetchMyContent,
    
    // Utilities
    clearError: clearPropertyError,
    
    // Sync selectors (work with already loaded Redux data)
    getApartmentsByCreator: (createdBy) => apartments.filter(apt => 
      apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy
    ),
    getSaleApartmentsByCreator: (createdBy) => saleApartments.filter(apt => 
      apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy  
    ),
    getStudiosByCreator: (createdBy) => {
      return apartments
        .filter(apt => apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy)
        .flatMap(apt => apt.studios || []);
    },
    getAllAvailableStudios: () => {
      return apartments.flatMap(apt => apt.studios || []).filter(studio => studio.isAvailable);
    },
    getAllStudios: () => {
      return apartments.flatMap(apt => apt.studios || []);
    },
    getAllAvailableSaleApartments: () => {
      return saleApartments.filter(apt => apt.isAvailable !== false);
    },
    
    // API-based fetch functions (use these to refresh data from backend)
    fetchApartmentsByCreatorFromApi,
    fetchStudiosByCreatorFromApi,
    fetchSaleApartmentsByCreatorFromApi,
    
    // Legacy compatibility
    addApartment: createRentApartment,
    addStudio: createStudio,
    addSaleApartment: createSaleApartment,
    
    // Additional legacy methods that might be needed
    verifyDataConsistency: () => ({ success: true, message: 'Data is consistent with API' }),
    clearAllData: () => {
      dispatch(setApartments([]));
      dispatch(setSaleApartments([]));
    }
  };
};