import { useState, useEffect } from 'react';
import { 
  myContentApi, 
  rentApartmentsApi, 
  saleApartmentsApi, 
  apartmentPartsApi,
  rentalContractsApi,
  adminApi,
  handleApiError 
} from '../services/api';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState({
    rentApartments: [],
    saleApartments: [],
    totalStudios: 0,
    availableStudios: 0,
    occupiedStudios: 0,
    activeContracts: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
    contractsExpiringSoon: 0,
    recentActivity: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Transform dashboard data from API responses
  const transformDashboardData = (myContent, contracts = [], adminStats = {}) => {
    const rentApartments = myContent.rent_apartments || [];
    const saleApartments = myContent.sale_apartments || [];
    
    // Calculate studio statistics
    const totalStudios = myContent.total_studios || 0;
    const availableStudios = myContent.available_studios || 0;
    const occupiedStudios = totalStudios - availableStudios;
    
    // Contract statistics
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const monthlyRevenue = contracts
      .filter(c => c.status === 'active')
      .reduce((total, contract) => total + (parseFloat(contract.monthly_rent) || 0), 0);
    
    const overduePayments = contracts.filter(c => 
      c.status === 'active' && c.next_payment_due && 
      new Date(c.next_payment_due) < new Date()
    ).length;
    
    const contractsExpiringSoon = contracts.filter(c => 
      c.status === 'active' && c.end_date &&
      new Date(c.end_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    ).length;

    return {
      rentApartments,
      saleApartments,
      totalStudios,
      availableStudios,
      occupiedStudios,
      activeContracts,
      monthlyRevenue,
      overduePayments,
      contractsExpiringSoon,
      recentActivity: myContent.recent_activity || [],
      // Additional statistics
      totalProperties: rentApartments.length + saleApartments.length,
      occupancyRate: totalStudios > 0 ? ((occupiedStudios / totalStudios) * 100).toFixed(1) : 0,
      averageRent: activeContracts > 0 ? (monthlyRevenue / activeContracts).toFixed(0) : 0
    };
  };

  // Fetch comprehensive dashboard data
  const fetchDashboardData = async (includeContracts = true) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch admin's own content
      const myContentResponse = await myContentApi.getMyContent();
      
      let contracts = [];
      if (includeContracts) {
        try {
          // Fetch rental contracts (admin's own)
          const contractsResponse = await rentalContractsApi.getAll();
          contracts = contractsResponse || [];
        } catch (contractError) {
          console.warn('Failed to fetch contracts:', contractError);
          // Continue without contracts if there's an error
        }
      }

      const transformedData = transformDashboardData(myContentResponse, contracts);
      setDashboardData(transformedData);
      setLastUpdated(new Date().toISOString());
      
      return { success: true, data: transformedData };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch dashboard data');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics for master admin (all admins' data)
  const fetchMasterAdminStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all rent apartments
      const rentApartmentsResponse = await rentApartmentsApi.getAll();
      
      // Fetch all sale apartments  
      const saleApartmentsResponse = await saleApartmentsApi.getAll();
      
      // Fetch all apartment parts (studios)
      const studiosResponse = await apartmentPartsApi.getAll();
      
      // Fetch all rental contracts
      const contractsResponse = await rentalContractsApi.getAll();
      
      // Fetch all admins
      const adminsResponse = await adminApi.getAll();

      // Calculate comprehensive statistics
      const totalRentApartments = rentApartmentsResponse.length;
      const totalSaleApartments = saleApartmentsResponse.length;
      const totalStudios = studiosResponse.length;
      const availableStudios = studiosResponse.filter(studio => studio.is_available).length;
      const occupiedStudios = totalStudios - availableStudios;
      
      const activeContracts = contractsResponse.filter(c => c.status === 'active').length;
      const monthlyRevenue = contractsResponse
        .filter(c => c.status === 'active')
        .reduce((total, contract) => total + (parseFloat(contract.monthly_rent) || 0), 0);
      
      const overduePayments = contractsResponse.filter(c => 
        c.status === 'active' && c.next_payment_due && 
        new Date(c.next_payment_due) < new Date()
      ).length;
      
      const contractsExpiringSoon = contractsResponse.filter(c => 
        c.status === 'active' && c.end_date &&
        new Date(c.end_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length;

      // Admin performance statistics
      const adminStats = adminsResponse.map(admin => {
        const adminRentApartments = rentApartmentsResponse.filter(apt => apt.created_by === admin.id);
        const adminSaleApartments = saleApartmentsResponse.filter(apt => apt.created_by === admin.id);
        const adminStudios = studiosResponse.filter(studio => studio.created_by === admin.id);
        const adminContracts = contractsResponse.filter(contract => contract.created_by === admin.id);
        
        const adminAvailableStudios = adminStudios.filter(studio => studio.is_available).length;
        const adminOccupiedStudios = adminStudios.length - adminAvailableStudios;
        const adminMonthlyRevenue = adminContracts
          .filter(c => c.status === 'active')
          .reduce((total, contract) => total + (parseFloat(contract.monthly_rent) || 0), 0);

        return {
          admin,
          totalRentApartments: adminRentApartments.length,
          totalSaleApartments: adminSaleApartments.length,
          totalStudios: adminStudios.length,
          availableStudios: adminAvailableStudios,
          occupiedStudios: adminOccupiedStudios,
          activeContracts: adminContracts.filter(c => c.status === 'active').length,
          monthlyRevenue: adminMonthlyRevenue,
          occupancyRate: adminStudios.length > 0 ? ((adminOccupiedStudios / adminStudios.length) * 100).toFixed(1) : 0
        };
      });

      const masterData = {
        // Overall statistics
        totalAdmins: adminsResponse.length,
        totalRentApartments,
        totalSaleApartments,
        totalProperties: totalRentApartments + totalSaleApartments,
        totalStudios,
        availableStudios,
        occupiedStudios,
        activeContracts,
        monthlyRevenue,
        overduePayments,
        contractsExpiringSoon,
        
        // Performance metrics
        occupancyRate: totalStudios > 0 ? ((occupiedStudios / totalStudios) * 100).toFixed(1) : 0,
        averageRent: activeContracts > 0 ? (monthlyRevenue / activeContracts).toFixed(0) : 0,
        
        // Detailed data
        adminStats,
        rentApartments: rentApartmentsResponse,
        saleApartments: saleApartmentsResponse,
        studios: studiosResponse,
        contracts: contractsResponse,
        admins: adminsResponse
      };

      setDashboardData(masterData);
      setLastUpdated(new Date().toISOString());
      
      return { success: true, data: masterData };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch master admin statistics');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch quick statistics (lightweight)
  const fetchQuickStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use my-content endpoint for quick stats
      const myContentResponse = await myContentApi.getMyContent({ 
        include_stats_only: true 
      });
      
      const quickStats = {
        totalProperties: (myContentResponse.rent_apartments?.length || 0) + (myContentResponse.sale_apartments?.length || 0),
        totalStudios: myContentResponse.total_studios || 0,
        availableStudios: myContentResponse.available_studios || 0,
        occupiedStudios: (myContentResponse.total_studios || 0) - (myContentResponse.available_studios || 0),
        occupancyRate: myContentResponse.total_studios > 0 ? 
          (((myContentResponse.total_studios - myContentResponse.available_studios) / myContentResponse.total_studios) * 100).toFixed(1) : 0
      };

      setDashboardData(prev => ({ ...prev, ...quickStats }));
      
      return { success: true, data: quickStats };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch quick statistics');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async (limit = 10) => {
    try {
      const myContentResponse = await myContentApi.getMyContent({ 
        include_recent_activity: true,
        activity_limit: limit 
      });
      
      const recentActivity = myContentResponse.recent_activity || [];
      setDashboardData(prev => ({ ...prev, recentActivity }));
      
      return { success: true, activities: recentActivity };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch recent activity');
      return { success: false, message: errorMessage };
    }
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    const { totalStudios, occupiedStudios, monthlyRevenue, activeContracts } = dashboardData;
    
    const insights = [];
    
    // Occupancy insights
    const occupancyRate = totalStudios > 0 ? (occupiedStudios / totalStudios) * 100 : 0;
    if (occupancyRate >= 90) {
      insights.push({
        type: 'success',
        title: 'High Occupancy Rate',
        message: `Excellent! ${occupancyRate.toFixed(1)}% occupancy rate indicates strong demand.`,
        recommendation: 'Consider increasing rent prices or expanding your property portfolio.'
      });
    } else if (occupancyRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Occupancy Rate',
        message: `${occupancyRate.toFixed(1)}% occupancy rate suggests room for improvement.`,
        recommendation: 'Review pricing strategy, improve marketing, or enhance property amenities.'
      });
    }

    // Revenue insights
    const averageRent = activeContracts > 0 ? monthlyRevenue / activeContracts : 0;
    if (averageRent > 5000) {
      insights.push({
        type: 'success',
        title: 'Strong Revenue Performance',
        message: `Average rent of ${averageRent.toFixed(0)} EGP indicates premium positioning.`,
        recommendation: 'Maintain quality standards and consider expanding in similar market segments.'
      });
    }

    return insights;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-refresh data
  useEffect(() => {
    let refreshInterval;
    
    if (dashboardData.totalProperties > 0) {
      // Refresh every 5 minutes if there's data
      refreshInterval = setInterval(() => {
        fetchQuickStats();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dashboardData.totalProperties]);

  return {
    // State
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    fetchDashboardData,
    fetchMasterAdminStats,
    fetchQuickStats,
    fetchRecentActivity,
    
    // Utilities
    getPerformanceInsights,
    clearError,
    
    // Helper getters
    getOccupancyRate: () => dashboardData.occupancyRate,
    getMonthlyRevenue: () => dashboardData.monthlyRevenue,
    getTotalProperties: () => dashboardData.totalProperties || 0,
    getAvailableStudios: () => dashboardData.availableStudios,
    getActiveContracts: () => dashboardData.activeContracts
  };
};