import { createSlice } from '@reduxjs/toolkit';

// Helper function to generate unique IDs
const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// localStorage utilities
const APARTMENTS_STORAGE_KEY = 'apartments_data';
const SALE_APARTMENTS_STORAGE_KEY = 'sale_apartments_data';

const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initial state - load from localStorage
const initialState = {
  apartments: loadFromLocalStorage(APARTMENTS_STORAGE_KEY),
  saleApartments: loadFromLocalStorage(SALE_APARTMENTS_STORAGE_KEY),
  loading: false,
  error: null
};

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Apartments
    setApartments: (state, action) => {
      state.apartments = action.payload;
      saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
    },
    addApartment: (state, action) => {
      const newApartment = {
        ...action.payload,
        id: action.payload.id || generateId('apt'),
        studios: action.payload.studios || [],
        totalStudios: action.payload.totalStudios || 0
      };
      state.apartments.push(newApartment);
      saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
    },
    updateApartment: (state, action) => {
      const index = state.apartments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.apartments[index] = action.payload;
        saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
      }
    },
    deleteApartment: (state, action) => {
      state.apartments = state.apartments.filter(apt => apt.id !== action.payload);
      saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
    },

    // Studios
    addStudio: (state, action) => {
      const { apartmentId, studio } = action.payload;
      const apartmentIndex = state.apartments.findIndex(apt => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const newStudio = {
          ...studio,
          id: studio.id || generateId('studio'),
          apartmentId: apartmentId
        };
        state.apartments[apartmentIndex].studios.push(newStudio);
        state.apartments[apartmentIndex].totalStudios = state.apartments[apartmentIndex].studios.length;
        saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
      }
    },
    updateStudio: (state, action) => {
      const { apartmentId, studio } = action.payload;
      const apartmentIndex = state.apartments.findIndex(apt => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const studioIndex = state.apartments[apartmentIndex].studios.findIndex(s => s.id === studio.id);
        if (studioIndex !== -1) {
          state.apartments[apartmentIndex].studios[studioIndex] = studio;
          saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
        }
      }
    },
    deleteStudio: (state, action) => {
      const { apartmentId, studioId } = action.payload;
      const apartmentIndex = state.apartments.findIndex(apt => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        state.apartments[apartmentIndex].studios = state.apartments[apartmentIndex].studios.filter(
          studio => studio.id !== studioId
        );
        state.apartments[apartmentIndex].totalStudios = state.apartments[apartmentIndex].studios.length;
        saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
      }
    },
    toggleStudioAvailability: (state, action) => {
      const { apartmentId, studioId } = action.payload;
      const apartmentIndex = state.apartments.findIndex(apt => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const studioIndex = state.apartments[apartmentIndex].studios.findIndex(s => s.id === studioId);
        if (studioIndex !== -1) {
          state.apartments[apartmentIndex].studios[studioIndex].isAvailable = 
            !state.apartments[apartmentIndex].studios[studioIndex].isAvailable;
          saveToLocalStorage(APARTMENTS_STORAGE_KEY, state.apartments);
        }
      }
    },

    // Sale Apartments
    setSaleApartments: (state, action) => {
      state.saleApartments = action.payload;
      saveToLocalStorage(SALE_APARTMENTS_STORAGE_KEY, state.saleApartments);
    },
    addSaleApartment: (state, action) => {
      const newSaleApartment = {
        ...action.payload,
        id: action.payload.id || generateId('sale_apt'),
        type: 'sale',
        listedAt: new Date().toISOString()
      };
      state.saleApartments.push(newSaleApartment);
      saveToLocalStorage(SALE_APARTMENTS_STORAGE_KEY, state.saleApartments);
    },
    updateSaleApartment: (state, action) => {
      const index = state.saleApartments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.saleApartments[index] = action.payload;
        saveToLocalStorage(SALE_APARTMENTS_STORAGE_KEY, state.saleApartments);
      }
    },
    deleteSaleApartment: (state, action) => {
      state.saleApartments = state.saleApartments.filter(apt => apt.id !== action.payload);
      saveToLocalStorage(SALE_APARTMENTS_STORAGE_KEY, state.saleApartments);
    },

    // Clear all data
    clearAllData: (state) => {
      state.apartments = [];
      state.saleApartments = [];
      state.error = null;
      saveToLocalStorage(APARTMENTS_STORAGE_KEY, []);
      saveToLocalStorage(SALE_APARTMENTS_STORAGE_KEY, []);
    }
  }
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setApartments,
  addApartment,
  updateApartment,
  deleteApartment,
  addStudio,
  updateStudio,
  deleteStudio,
  toggleStudioAvailability,
  setSaleApartments,
  addSaleApartment,
  updateSaleApartment,
  deleteSaleApartment,
  clearAllData
} = propertySlice.actions;

// Selectors
export const selectProperty = (state) => state.property;
export const selectApartments = (state) => state.property.apartments;
export const selectSaleApartments = (state) => state.property.saleApartments;
export const selectPropertyLoading = (state) => state.property.loading;
export const selectPropertyError = (state) => state.property.error;

// Complex selectors
export const selectApartmentsByCreator = (createdBy) => (state) => 
  state.property.apartments.filter(apartment => apartment.createdBy === createdBy);

export const selectAllAvailableStudios = (state) => {
  return state.property.apartments.reduce((allStudios, apartment) => {
    const availableStudios = apartment.studios.filter(studio => studio.isAvailable);
    return [...allStudios, ...availableStudios];
  }, []);
};

export const selectAllStudios = (state) => {
  return state.property.apartments.reduce((allStudios, apartment) => {
    return [...allStudios, ...apartment.studios];
  }, []);
};

export const selectStudiosByCreator = (createdBy) => (state) => {
  return state.property.apartments.reduce((allStudios, apartment) => {
    const adminStudios = apartment.studios.filter(studio => 
      studio.createdBy === createdBy || apartment.createdBy === createdBy
    );
    return [...allStudios, ...adminStudios];
  }, []);
};

export const selectStudioById = (studioId) => (state) => {
  for (const apartment of state.property.apartments) {
    const studio = apartment.studios.find(studio => studio.id === studioId);
    if (studio) return studio;
  }
  return null;
};

export const selectApartmentById = (apartmentId) => (state) => 
  state.property.apartments.find(apt => apt.id === apartmentId);

export const selectSaleApartmentsByCreator = (createdBy) => (state) => 
  state.property.saleApartments.filter(apartment => apartment.createdBy === createdBy);

export const selectAllAvailableSaleApartments = (state) => 
  state.property.saleApartments.filter(apartment => apartment.isAvailable !== false);

export const selectSaleApartmentById = (apartmentId) => (state) => 
  state.property.saleApartments.find(apartment => apartment.id === apartmentId);

export const selectAllAdminCreators = (state) => {
  const creators = new Set();
  
  // Get creators from apartments
  state.property.apartments.forEach(apartment => {
    if (apartment.createdBy) {
      creators.add(apartment.createdBy);
    }
    
    // Get creators from studios within apartments
    apartment.studios.forEach(studio => {
      if (studio.createdBy) {
        creators.add(studio.createdBy);
      }
    });
  });
  
  return Array.from(creators);
};

export default propertySlice.reducer;