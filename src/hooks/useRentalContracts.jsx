import { useState } from 'react';
import { rentalContractsApi, handleApiError } from '../services/api';

export const useRentalContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform backend rental contract data to frontend format
  const transformContractFromApi = (apiContract) => ({
    id: apiContract.id,
    contractNumber: apiContract.contract_number,
    studioId: apiContract.studio_id,
    apartmentId: apiContract.apartment_id,
    studioNumber: apiContract.studio_number,
    
    // Customer information
    customer: {
      id: apiContract.customer?.id,
      fullName: apiContract.customer?.full_name,
      email: apiContract.customer?.email,
      phone: apiContract.customer?.phone,
      nationalId: apiContract.customer?.national_id,
      address: apiContract.customer?.address,
      emergencyContact: apiContract.customer?.emergency_contact
    },
    
    // Contract details
    startDate: apiContract.start_date,
    endDate: apiContract.end_date,
    monthlyRent: apiContract.monthly_rent,
    securityDeposit: apiContract.security_deposit,
    totalAmount: apiContract.total_amount,
    paymentFrequency: apiContract.payment_frequency,
    paymentMethod: apiContract.payment_method,
    
    // Contract status and lifecycle
    status: apiContract.status, // draft, active, expired, terminated, renewal_pending
    signedDate: apiContract.signed_date,
    createdBy: apiContract.created_by,
    createdAt: apiContract.created_at,
    updatedAt: apiContract.updated_at,
    
    // Additional terms and conditions
    terms: apiContract.terms || [],
    specialConditions: apiContract.special_conditions,
    notes: apiContract.notes,
    
    // Payment tracking
    totalPaid: apiContract.total_paid || 0,
    remainingBalance: apiContract.remaining_balance || 0,
    nextPaymentDue: apiContract.next_payment_due,
    
    // Documents
    documents: apiContract.documents || [],
    
    // Auto-renewal settings
    autoRenewal: apiContract.auto_renewal || false,
    renewalNoticeDate: apiContract.renewal_notice_date,
    
    // Legacy compatibility
    tenantName: apiContract.customer?.full_name,
    tenantEmail: apiContract.customer?.email,
    tenantPhone: apiContract.customer?.phone,
    rentAmount: apiContract.monthly_rent,
    depositAmount: apiContract.security_deposit
  });

  // Transform frontend contract data to backend format
  const transformContractToApi = (frontendContract) => ({
    studio_id: frontendContract.studioId,
    apartment_id: frontendContract.apartmentId,
    studio_number: frontendContract.studioNumber,
    
    // Customer information
    customer: {
      full_name: frontendContract.customer?.fullName || frontendContract.tenantName,
      email: frontendContract.customer?.email || frontendContract.tenantEmail,
      phone: frontendContract.customer?.phone || frontendContract.tenantPhone,
      national_id: frontendContract.customer?.nationalId,
      address: frontendContract.customer?.address,
      emergency_contact: frontendContract.customer?.emergencyContact
    },
    
    // Contract details
    start_date: frontendContract.startDate,
    end_date: frontendContract.endDate,
    monthly_rent: parseFloat(frontendContract.monthlyRent || frontendContract.rentAmount) || 0,
    security_deposit: parseFloat(frontendContract.securityDeposit || frontendContract.depositAmount) || 0,
    payment_frequency: frontendContract.paymentFrequency || 'monthly',
    payment_method: frontendContract.paymentMethod || 'bank_transfer',
    
    // Contract terms
    terms: frontendContract.terms || [],
    special_conditions: frontendContract.specialConditions,
    notes: frontendContract.notes,
    
    // Auto-renewal
    auto_renewal: frontendContract.autoRenewal || false,
    
    // Status
    status: frontendContract.status || 'draft'
  });

  // Get all rental contracts
  const fetchContracts = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getAll(params);
      const transformedContracts = response.map(transformContractFromApi);
      setContracts(transformedContracts);
      return { success: true, contracts: transformedContracts };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch contracts');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get contracts by studio
  const fetchContractsByStudio = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getByStudio(params);
      const transformedContracts = response.map(transformContractFromApi);
      setContracts(transformedContracts);
      return { success: true, contracts: transformedContracts };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch contracts by studio');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get specific contract
  const fetchContract = async (contractId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getById(contractId);
      const transformedContract = transformContractFromApi(response);
      return { success: true, contract: transformedContract };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Create new rental contract
  const createContract = async (contractData) => {
    try {
      setIsLoading(true);
      setError(null);
      const apiData = transformContractToApi(contractData);
      const response = await rentalContractsApi.create(apiData);
      const transformedContract = transformContractFromApi(response);
      
      setContracts(prev => [...prev, transformedContract]);
      return { 
        success: true, 
        message: 'Rental contract created successfully',
        contract: transformedContract
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update rental contract
  const updateContract = async (contractId, updateData) => {
    try {
      setIsLoading(true);
      setError(null);
      const apiData = transformContractToApi(updateData);
      const response = await rentalContractsApi.update(contractId, apiData);
      const transformedContract = transformContractFromApi(response);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId ? transformedContract : contract
        )
      );
      
      return { 
        success: true, 
        message: 'Contract updated successfully',
        contract: transformedContract
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete rental contract
  const deleteContract = async (contractId) => {
    try {
      setIsLoading(true);
      setError(null);
      await rentalContractsApi.delete(contractId);
      
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      return { 
        success: true, 
        message: 'Contract deleted successfully'
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Activate contract (change status to active)
  const activateContract = async (contractId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.update(contractId, { 
        status: 'active',
        signed_date: new Date().toISOString()
      });
      const transformedContract = transformContractFromApi(response);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId ? transformedContract : contract
        )
      );
      
      return { 
        success: true, 
        message: 'Contract activated successfully',
        contract: transformedContract
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to activate contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Terminate contract
  const terminateContract = async (contractId, terminationReason = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.update(contractId, { 
        status: 'terminated',
        termination_date: new Date().toISOString(),
        termination_reason: terminationReason
      });
      const transformedContract = transformContractFromApi(response);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId ? transformedContract : contract
        )
      );
      
      return { 
        success: true, 
        message: 'Contract terminated successfully',
        contract: transformedContract
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to terminate contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Renew contract
  const renewContract = async (contractId, renewalData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.renew(contractId, {
        new_end_date: renewalData.newEndDate,
        new_monthly_rent: renewalData.newMonthlyRent,
        renewal_terms: renewalData.renewalTerms || []
      });
      const transformedContract = transformContractFromApi(response);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId ? transformedContract : contract
        )
      );
      
      return { 
        success: true, 
        message: 'Contract renewed successfully',
        contract: transformedContract
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to renew contract');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Record payment
  const recordPayment = async (contractId, paymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.recordPayment(contractId, {
        amount: parseFloat(paymentData.amount),
        payment_date: paymentData.paymentDate || new Date().toISOString(),
        payment_method: paymentData.paymentMethod || 'cash',
        transaction_reference: paymentData.transactionReference,
        notes: paymentData.notes
      });
      
      // Update contract in local state
      const updatedContract = transformContractFromApi(response.contract);
      setContracts(prev => 
        prev.map(contract => 
          contract.id === contractId ? updatedContract : contract
        )
      );
      
      return { 
        success: true, 
        message: 'Payment recorded successfully',
        contract: updatedContract,
        payment: response.payment
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to record payment');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment history for contract
  const getPaymentHistory = async (contractId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getPayments(contractId);
      return { 
        success: true, 
        payments: response
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch payment history');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get contracts due for renewal
  const getContractsDueForRenewal = async (daysAhead = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getDueForRenewal({ days_ahead: daysAhead });
      const transformedContracts = response.map(transformContractFromApi);
      return { 
        success: true, 
        contracts: transformedContracts
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch contracts due for renewal');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get overdue payments
  const getOverduePayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rentalContractsApi.getOverduePayments();
      const transformedContracts = response.map(transformContractFromApi);
      return { 
        success: true, 
        contracts: transformedContracts
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch overdue payments');
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Helper functions for contract management
  const getActiveContracts = () => {
    return contracts.filter(contract => contract.status === 'active');
  };

  const getExpiredContracts = () => {
    return contracts.filter(contract => contract.status === 'expired');
  };

  const getContractsByStudioId = (studioId) => {
    return contracts.filter(contract => contract.studioId === studioId);
  };

  const getTotalMonthlyRevenue = () => {
    return getActiveContracts().reduce((total, contract) => {
      return total + (parseFloat(contract.monthlyRent) || 0);
    }, 0);
  };

  return {
    // State
    contracts,
    isLoading,
    error,
    
    // API Actions
    fetchContracts,
    fetchContractsByStudio,
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    activateContract,
    terminateContract,
    renewContract,
    recordPayment,
    getPaymentHistory,
    getContractsDueForRenewal,
    getOverduePayments,
    
    // Utilities
    clearError,
    
    // Helper functions
    getActiveContracts,
    getExpiredContracts,
    getContractsByStudioId,
    getTotalMonthlyRevenue
  };
};