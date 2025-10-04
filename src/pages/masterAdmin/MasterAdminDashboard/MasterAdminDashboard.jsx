import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth, useAdminAuth } from '../../../hooks/useRedux';
import { usePropertyManagement } from '../../../hooks/usePropertyManagement';
import { apartmentPartsApi } from '../../../services/api';
import ApartmentCard from '../../../components/admin/ApartmentCard';
import SaleApartmentCard from '../../../components/admin/SaleApartmentCard';
import AddStudioModal from '../../../components/admin/AddStudioModal';
import AddApartmentModal from '../../../components/admin/AddApartmentModal';
import AddSaleApartmentModal from '../../../components/admin/AddSaleApartmentModal/AddSaleApartmentModal';
import { formatPhoneForAPI, validateEgyptianPhone, normalizePhoneInput } from '../../../utils/phoneUtils';
import './MasterAdminDashboard.css';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';

const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile } = useMasterAuth();
  const { createAdminAccount, getAllAdminAccounts, deleteAdminAccount } = useAdminAuth();
  const { apartments, addApartment, addStudio, 
          saleApartments, addSaleApartment, getSaleApartmentsByCreator, fetchRentApartments, fetchSaleApartments } = usePropertyManagement();
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [isAddApartmentModalOpen, setIsAddApartmentModalOpen] = useState(false);
  const [isAddSaleApartmentModalOpen, setIsAddSaleApartmentModalOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  
  // Admin management states
  const [allAdmins, setAllAdmins] = useState([]);
  const [allStudios, setAllStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasInitialFetch = useRef(false);
  const isFetching = useRef(false);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('rental'); // 'rental' or 'sale'
  const [existingAdmins, setExistingAdmins] = useState([]);
  const [selectedAdminToDelete, setSelectedAdminToDelete] = useState('');
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [deleteAdminMessage, setDeleteAdminMessage] = useState({ type: '', text: '' });
  
  // Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isManageAdminsModalOpen, setIsManageAdminsModalOpen] = useState(false);
  
  // Edit Profile form state
  const [profileForm, setProfileForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [editType, setEditType] = useState('email'); // 'email' or 'password'
  
  // Password visibility states for Edit Profile
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Manage Admins form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'studio_rental' // Default role
  });
  const [adminErrors, setAdminErrors] = useState({});
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  
  // Password visibility states for Manage Admins
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Memoized fetch function to prevent infinite re-renders
  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    console.log('🔄 Fetching master admin dashboard data...');
    
    try {
      // Set up timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ API calls taking too long, setting loading to false');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      // Fetch rental and sale apartments using correct API endpoints
      console.log('🏠 Fetching rental apartments...');
      let rentResult;
      try {
        rentResult = await Promise.race([
          fetchRentApartments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Rent apartments timeout')), 5000))
        ]);
        console.log('Rental apartments result:', rentResult);
      } catch (rentError) {
        console.error('❌ Failed to fetch rental apartments:', rentError);
      }
      
      console.log('🏢 Fetching sale apartments...');
      let saleResult;
      try {
        saleResult = await Promise.race([
          fetchSaleApartments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Sale apartments timeout')), 5000))
        ]);
        console.log('Sale apartments result:', saleResult);
      } catch (saleError) {
        console.error('❌ Failed to fetch sale apartments:', saleError);
      }
      
      // Clear the timeout if we reach here
      clearTimeout(timeoutId);
      
      // Fetch studios data from apartmentPartsApi
      console.log('🏠 Fetching all apartment parts (studios)...');
      try {
        const studiosResponse = await Promise.race([
          apartmentPartsApi.getAll(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Studios timeout')), 5000))
        ]);
        console.log('Studios/Parts API response:', studiosResponse);
        setAllStudios(studiosResponse || []);
      } catch (studioError) {
        console.error('❌ Failed to fetch studios:', studioError);
        setAllStudios([]);
      }

      // Fetch all admins using API
      console.log('👥 Fetching all admins...');
      try {
        const adminsResult = await Promise.race([
          getAllAdminAccounts(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Admins timeout')), 5000))
        ]);
        console.log('Admins API result:', adminsResult);
        
        if (Array.isArray(adminsResult)) {
          setAllAdmins(adminsResult);
          setExistingAdmins(adminsResult);
          console.log('✅ Admins loaded successfully:', adminsResult.length, 'admins');
        } else if (adminsResult?.success && Array.isArray(adminsResult.data)) {
          setAllAdmins(adminsResult.data);
          setExistingAdmins(adminsResult.data);
          console.log('✅ Admins loaded successfully:', adminsResult.data.length, 'admins');
        } else {
          console.warn('⚠️ Admins API returned unexpected format:', adminsResult);
          setAllAdmins([]);
          setExistingAdmins([]);
        }
      } catch (adminError) {
        console.error('❌ Failed to fetch admins:', adminError);
        setAllAdmins([]);
        setExistingAdmins([]);
      }
      
      console.log('✅ Master admin dashboard data fetching completed');
    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      setAllAdmins([]);
      setExistingAdmins([]);
      setAllStudios([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [currentUser, fetchRentApartments, fetchSaleApartments, getAllAdminAccounts]);

  // Fetch all data from API - only run once when component mounts
  useEffect(() => {
    // Prevent multiple simultaneous fetches and re-fetching
    if (!currentUser || hasInitialFetch.current || isFetching.current) {
      if (!currentUser) {
        setLoading(false);
      }
      return;
    }
    
    // Mark as fetching
    isFetching.current = true;
    hasInitialFetch.current = true;
    
    fetchAllData();
    
    // Emergency timeout - force loading to false after 15 seconds
    const emergencyTimeout = setTimeout(() => {
      console.warn('🚨 Emergency timeout - forcing loading to false');
      setLoading(false);
      isFetching.current = false;
    }, 15000);
    
    return () => {
      clearTimeout(emergencyTimeout);
      isFetching.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - do not add dependencies
  
  // Memoize filtered properties to prevent recalculation on every render
  const filteredProperties = useMemo(() => {
    let properties = propertyTypeFilter === 'rental' ? apartments : saleApartments;
    
    if (selectedAdminFilter !== 'all') {
      properties = properties.filter(property => 
        property.listed_by_admin_id === parseInt(selectedAdminFilter) || 
        property.createdBy === parseInt(selectedAdminFilter)
      );
    }
    
    return properties;
  }, [apartments, saleApartments, propertyTypeFilter, selectedAdminFilter]);

  // Note: Removed localStorage persistence to prevent unnecessary re-renders
  // Forms will reset when modals are closed, improving performance

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Edit Profile Modal Functions
  const openEditProfileModal = () => {
    console.log('Opening Edit Profile Modal');
    setEditType('email'); // Default to email editing
    setProfileForm({
      email: currentUser?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileErrors({});
    setProfileMessage({ type: '', text: '' });
    setIsEditProfileModalOpen(true);
    console.log('Edit Profile Modal state set to true');
  };

  const closeEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
    setEditType('email'); // Reset to default
    setProfileForm({
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileErrors({});
    setProfileMessage({ type: '', text: '' });
    // Reset password visibility
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    
    // Current password is always required for verification
    if (!profileForm.currentPassword) {
      errors.currentPassword = 'Current password is required for verification';
    }
    
    if (editType === 'email') {
      // Email validation
      if (!profileForm.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
        errors.email = 'Email is invalid';
      }
    } else if (editType === 'password') {
      // Password validation
      if (!profileForm.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (profileForm.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsProfileSubmitting(true);
    setProfileMessage({ type: '', text: '' });

    try {
      // Check if user is authenticated
      if (!currentUser) {
        setProfileMessage({ type: 'error', text: 'You are not authenticated. Please login again.' });
        setIsProfileSubmitting(false);
        return;
      }

      // Prepare update parameters based on edit type
      let emailToUpdate = currentUser.email; // Keep current email by default
      let passwordToUpdate = null; // Don't change password by default
      
      if (editType === 'email') {
        emailToUpdate = profileForm.email;
        passwordToUpdate = null; // Don't change password when updating email
      } else if (editType === 'password') {
        emailToUpdate = currentUser.email; // Keep current email
        passwordToUpdate = profileForm.newPassword;
      }

      // Call the updateProfile method from context with proper data format
      const updateData = {
        email: emailToUpdate,
        currentPassword: profileForm.currentPassword,
        newPassword: passwordToUpdate
      };
      
      console.log('🔄 Updating master admin profile with data:', { 
        ...updateData, 
        currentPassword: '[HIDDEN]', 
        newPassword: updateData.newPassword ? '[HIDDEN]' : undefined 
      });
      
      const result = await updateProfile(updateData);

      if (result.success) {
        const successMessage = editType === 'email' 
          ? 'Email updated successfully! Redirecting to login...'
          : 'Password updated successfully! Redirecting to login...';
          
        setProfileMessage({ 
          type: 'success', 
          text: successMessage
        });
        
        // Wait 2 seconds then logout and redirect to login
        setTimeout(() => {
          logout(); // This will clear the session
          navigate('/auth/master-admin-login'); // Redirect to login page
        }, 2000);

      } else {
        setProfileMessage({ 
          type: 'error', 
          text: result.message || 'Failed to update profile. Please try again.' 
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Manage Admins Modal Functions
  const openManageAdminsModal = async () => {
    console.log('Opening Manage Admins Modal');
    setAdminForm({
      name: '',
      email: '',
      password: '',
      mobile: '',
      role: 'studio_rental' // Set default role when opening modal
    });
    setAdminErrors({});
    setAdminMessage({ type: '', text: '' });
    setIsManageAdminsModalOpen(true);
    console.log('Manage Admins Modal state set to true');
    
    // Fetch latest admin list when opening modal
    try {
      console.log('🔄 Fetching admin list for modal...');
      const adminsResponse = await getAllAdminAccounts();
      if (adminsResponse && Array.isArray(adminsResponse)) {
        console.log('✅ Fetched', adminsResponse.length, 'admins');
        setAllAdmins(adminsResponse);
        setExistingAdmins(adminsResponse);
      }
    } catch (error) {
      console.error('❌ Failed to fetch admins:', error);
    }
  };

  const closeManageAdminsModal = () => {
    setIsManageAdminsModalOpen(false);
    setAdminForm({
      name: '',
      email: '',
      password: '',
      mobile: '',
      role: 'studio_rental' // Reset to default role when closing modal
    });
    setAdminErrors({});
    setAdminMessage({ type: '', text: '' });
    // Reset password visibility
    setShowAdminPassword(false);
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Handle phone number input - allow only digits and preserve leading zero
    if (name === 'mobile') {
      // Remove any non-digit characters
      processedValue = value.replace(/\D/g, '');
      // Limit to 11 digits
      if (processedValue.length > 11) {
        processedValue = processedValue.slice(0, 11);
      }
    }
    
    setAdminForm(prev => ({ ...prev, [name]: processedValue }));
    if (adminErrors[name]) {
      setAdminErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAdminForm = () => {
    const errors = {};
    console.log('Validating admin form:', adminForm);
    
    if (!adminForm.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!adminForm.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminForm.email)) {
      errors.email = 'Email is invalid';
    }
    if (!adminForm.password?.trim()) {
      errors.password = 'Password is required';
    } else if (adminForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!adminForm.mobile?.trim()) {
      errors.mobile = 'Mobile number is required';
    } else {
      // Remove spaces and check length
      const cleanedMobile = adminForm.mobile.replace(/\s/g, '');
      
      // Must be 11 digits starting with 010, 011, 012, or 015
      if (!/^(010|011|012|015)\d{8}$/.test(cleanedMobile)) {
        errors.mobile = 'Must be 11 digits starting with 010, 011, 012, or 015 (e.g., 01012345678)';
      }
    }
    
    // Simplified role validation for debugging
    console.log('Role validation check:', {
      role: adminForm.role,
      roleType: typeof adminForm.role,
      hasRole: !!adminForm.role
    });
    
    if (!adminForm.role) {
      console.log('Role validation failed - no role');
      errors.role = 'Please select a valid admin role';
    }
    
    console.log('Validation errors:', errors);
    setAdminErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, starting validation...');
    
    if (!validateAdminForm()) {
      console.log('Validation failed, stopping submission');
      return;
    }

    console.log('Validation passed, checking for duplicates...');
    
    // Fetch fresh admin list to ensure we have latest data
    console.log('🔄 Fetching fresh admin list for duplicate checking...');
    let freshAdmins = [];
    try {
      freshAdmins = await getAllAdminAccounts() || [];
      console.log('📊 Fresh admin list:', freshAdmins.length, 'admins');
      console.log('📧 Existing emails:', freshAdmins.map(a => a.email));
      console.log('📱 Existing phones:', freshAdmins.map(a => a.phone || a.mobile));
    } catch (error) {
      console.warn('⚠️ Could not fetch fresh admin list:', error);
      freshAdmins = existingAdmins; // Fallback to cached list
    }
    
    // Check for duplicate email
    const emailToCheck = adminForm.email.toLowerCase().trim();
    const existingAdminWithEmail = freshAdmins.find(admin => 
      admin.email?.toLowerCase() === emailToCheck
    );
    
    if (existingAdminWithEmail) {
      const errorMsg = `❌ Email "${adminForm.email}" is already registered to ${existingAdminWithEmail.name || existingAdminWithEmail.full_name}. Please use a different email address.`;
      console.error('❌ Duplicate email found:', {
        inputEmail: emailToCheck,
        existingAdmin: existingAdminWithEmail.name || existingAdminWithEmail.full_name,
        adminId: existingAdminWithEmail.id
      });
      setAdminMessage({ type: 'error', text: errorMsg });
      showToast(errorMsg, 'error');
      return;
    }
    
    // Check for duplicate phone
    const phoneToCheck = formatPhoneForAPI(adminForm.mobile.trim());
    const existingAdminWithPhone = freshAdmins.find(admin => {
      const adminPhone = admin.phone || admin.mobile || '';
      return adminPhone === phoneToCheck;
    });
    
    if (existingAdminWithPhone) {
      const errorMsg = `❌ Phone number "${adminForm.mobile}" is already registered to ${existingAdminWithPhone.name || existingAdminWithPhone.full_name}. Please use a different phone number.`;
      console.error('❌ Duplicate phone found:', {
        inputPhone: phoneToCheck,
        existingAdmin: existingAdminWithPhone.name || existingAdminWithPhone.full_name,
        adminId: existingAdminWithPhone.id
      });
      setAdminMessage({ type: 'error', text: errorMsg });
      showToast(errorMsg, 'error');
      return;
    }
    
    console.log('✅ No duplicates found in frontend check, proceeding to API...');
    console.log('� Current existing admins:', existingAdmins.length);
    
    console.log('✅ No duplicates found in frontend check, proceeding to API...');
    setIsAdminSubmitting(true);
    setAdminMessage({ type: '', text: '' });

    try {
      console.log('🚀 Creating admin account with API data...');
      console.log('📋 Form data before transformation:', {
        name: adminForm.name,
        email: adminForm.email,
        mobile: adminForm.mobile,
        role: adminForm.role
      });
      
      // Transform form data to match API requirements  
      const apiData = {
        full_name: adminForm.name.trim(),
        email: adminForm.email.toLowerCase().trim(),
        phone: formatPhoneForAPI(adminForm.mobile.trim()),
        password: adminForm.password.trim(),
        role: adminForm.role
      };
      
      console.log('� Phone formatting:', {
        input: adminForm.mobile.trim(),
        formatted: apiData.phone,
        length: apiData.phone.length
      });
      
      console.log('📤 API Data for admin creation:', {
        ...apiData,
        password: '[HIDDEN]'
      });
      
      // Create admin account via API
      console.log('🌐 Sending request to backend with:', {
        full_name: apiData.full_name,
        email: apiData.email,
        phone: apiData.phone,
        role: apiData.role
      });
      
      const response = await createAdminAccount(apiData);
      console.log('📨 Full API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Show success toast
        showToast('Admin created successfully!', 'success');
        
        // Clear the form
        setAdminForm({
          name: '',
          email: '',
          password: '',
          mobile: '',
          role: 'studio_rental'
        });
        setAdminErrors({});
        setAdminMessage({ type: '', text: '' });
        
        // Refresh admins list immediately after creation
        console.log('🔄 Refreshing admin list after creation...');
        const adminsResponse = await getAllAdminAccounts();
        if (adminsResponse && Array.isArray(adminsResponse)) {
          console.log('✅ Refreshed admin list:', adminsResponse.length, 'admins');
          setAllAdmins(adminsResponse);
          setExistingAdmins(adminsResponse);
        } else {
          console.warn('⚠️ Failed to refresh admin list');
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          closeManageAdminsModal();
        }, 2000);
      } else {
        console.error('❌ Admin creation failed from backend:', response);
        console.error('🔍 Debugging info:', {
          sentEmail: apiData.email,
          sentPhone: apiData.phone,
          errorMessage: response.error || response.message,
          fullResponse: response
        });
        
        let errorMsg = response.error || response.message || 'Failed to create admin account. Please try again.';
        
        // Make error message more user-friendly
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists') || errorMsg.toLowerCase().includes('duplicate')) {
          console.log('🔄 Backend rejected with duplicate error, fetching admin list to identify the issue...');
          
          // Fetch fresh admin list to identify exactly what's duplicate
          try {
            const freshAdmins = await getAllAdminAccounts();
            console.log('📊 Fresh admins for duplicate analysis:', freshAdmins?.length || 0);
            
            if (freshAdmins && Array.isArray(freshAdmins)) {
              // Check email match
              const matchingEmail = freshAdmins.find(a => 
                a.email?.toLowerCase() === apiData.email.toLowerCase()
              );
              
              // Check phone match
              const matchingPhone = freshAdmins.find(a => 
                (a.phone || a.mobile) === apiData.phone
              );
              
              console.log('🔍 Duplicate analysis results:', {
                emailMatch: matchingEmail ? `${matchingEmail.email} (${matchingEmail.name || matchingEmail.full_name})` : 'No match',
                phoneMatch: matchingPhone ? `${matchingPhone.phone || matchingPhone.mobile} (${matchingPhone.name || matchingPhone.full_name})` : 'No match',
                searchedEmail: apiData.email,
                searchedPhone: apiData.phone
              });
              
              if (matchingEmail && matchingPhone && matchingEmail.id === matchingPhone.id) {
                // Same admin has both email and phone
                errorMsg = `❌ Both email and phone are already registered to "${matchingEmail.name || matchingEmail.full_name}"\n\n` +
                          `• Email: ${apiData.email}\n` +
                          `• Phone: ${apiData.phone}\n\n` +
                          `Please use different email AND phone number.`;
              } else if (matchingEmail) {
                // Email is duplicate
                errorMsg = `❌ Email "${apiData.email}" is already registered to "${matchingEmail.name || matchingEmail.full_name}".\n\nPlease use a different email address.`;
              } else if (matchingPhone) {
                // Phone is duplicate
                errorMsg = `❌ Phone number "${apiData.phone}" is already registered to "${matchingPhone.name || matchingPhone.full_name}".\n\nPlease use a different phone number.`;
              } else {
                // Backend says duplicate but we can't find it - might be a sync issue
                errorMsg = `❌ Backend detected a duplicate but it's not showing in our admin list.\n\n` +
                          `This might be a database sync issue.\n\n` +
                          `Tried to create:\n` +
                          `• Email: ${apiData.email}\n` +
                          `• Phone: ${apiData.phone}\n\n` +
                          `Try refreshing the page or use completely different values.`;
              }
            } else {
              errorMsg = `❌ Backend says duplicate exists but could not fetch admin list to identify the issue.\n\nPlease try different email and phone number.`;
            }
          } catch (fetchError) {
            console.error('❌ Failed to fetch admin list for duplicate analysis:', fetchError);
            errorMsg = `❌ Backend detected duplicate values but could not verify details.\n\nPlease try different email and phone number.`;
          }
        }
        
        setAdminMessage({ 
          type: 'error', 
          text: errorMsg
        });
        showToast(errorMsg, 'error');
      }

    } catch (error) {
      console.error('💥 Exception creating admin account:', error);
      const errorMsg = error.message || 'Failed to create admin account. Please try again.';
      setAdminMessage({ type: 'error', text: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdminToDelete) {
      setDeleteAdminMessage({ type: 'error', text: 'Please select an admin to delete.' });
      return;
    }

    setIsDeletingAdmin(true);
    setDeleteAdminMessage({ type: '', text: '' });

    try {
      // Find the admin by email to get the ID
      const adminToDelete = existingAdmins.find(admin => admin.email === selectedAdminToDelete);
      if (!adminToDelete) {
        setDeleteAdminMessage({ type: 'error', text: 'Admin not found.' });
        setIsDeletingAdmin(false);
        return;
      }

      const response = await deleteAdminAccount(adminToDelete.id);
      
      if (response && response.success) {
        setDeleteAdminMessage({ 
          type: 'success', 
          text: 'Admin account deleted successfully!' 
        });
        
        // Refresh the admin list
        const adminsResponse = await getAllAdminAccounts();
        if (adminsResponse) {
          setAllAdmins(adminsResponse);
          setExistingAdmins(adminsResponse);
        }
        
        // Reset selection
        setSelectedAdminToDelete('');
        
        // If the deleted admin was selected in filter, reset to 'all'
        // Compare with string conversion since filter uses admin ID
        if (selectedAdminFilter === String(adminToDelete.id)) {
          setSelectedAdminFilter('all');
        }
        
        setTimeout(() => {
          setDeleteAdminMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setDeleteAdminMessage({ 
          type: 'error', 
          text: (response && response.error) || 'Failed to delete admin account.' 
        });
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      setDeleteAdminMessage({ type: 'error', text: 'Failed to delete admin account. Please try again.' });
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const handleAddStudio = (apartmentId) => {
    setSelectedApartmentId(apartmentId);
    setIsAddStudioModalOpen(true);
  };

  const handleStudioAdded = async (newStudio) => {
    try {
      await addStudio(newStudio);
      // Data will be automatically updated through Redux
      setIsAddStudioModalOpen(false);
      setSelectedApartmentId(null);
    } catch (error) {
      console.error('Error adding studio:', error);
    }
  };

  const handleApartmentAdded = async (newApartment) => {
    try {
      if (propertyTypeFilter === 'rental') {
        await addApartment(newApartment);
        setIsAddApartmentModalOpen(false);
      } else {
        await addSaleApartment(newApartment);
        setIsAddSaleApartmentModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding apartment:', error);
    }
  };

  const handleSaleApartmentAdded = async (newSaleApartment) => {
    try {
      await addSaleApartment(newSaleApartment);
      setIsAddSaleApartmentModalOpen(false);
    } catch (error) {
      console.error('Error adding sale apartment:', error);
    }
  };

  // Memoize statistics calculations to prevent recalculation on every render
  const statistics = useMemo(() => {
    const totalStudios = allStudios?.length || 0;
    const availableStudios = allStudios?.filter(studio => 
      studio.status === 'available' || studio.isAvailable
    )?.length || 0;
    
    return {
      totalApartments: apartments.length,
      totalSaleApartments: saleApartments.length,
      totalStudios,
      availableStudios,
      totalAdmins: allAdmins.length
    };
  }, [allStudios, apartments, saleApartments, allAdmins]);

  // Safety check for user authentication
  if (!currentUser) {
    console.log('❌ No current user, redirecting...');
    return null; // Let the auth system handle the redirect
  }

  if (loading) {
    console.log('⏳ Dashboard loading...');
    return (
      <div className="master-admin-dashboard loading">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  console.log('Render - Modal States:', {
    isEditProfileModalOpen,
    isManageAdminsModalOpen,
    currentUser
  });

  return (
    <div className="master-admin-dashboard">
      {/* Hero Section */}
      <section 
        className="dashboard-hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="dashboard-hero__overlay" />
        
        <nav className="dashboard-nav">
          <div className="nav-left">
            <h1 className="dashboard-brand">Ahmed Othman Group</h1>
          </div>
          
          <div className="nav-right">
            <button 
              className="nav-btn tracking-reports-btn"
              onClick={() => navigate('/master-admin/reports')}
            >
              📊 Admin Tracking & Reports
            </button>
            <button 
              className="nav-btn edit-profile-btn"
              onClick={openEditProfileModal}
            >
              📝 Edit Profile
            </button>
            <button 
              className="nav-btn manage-admins-btn"
              onClick={openManageAdminsModal}
            >
              👥 Manage Admins
            </button>
            <button 
              className="nav-btn rental-alerts-btn"
              onClick={() => navigate('/master-admin/rental-alerts')}
            >
              🔔 Rental Alerts
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </nav>

        <div className="dashboard-hero-content">
          <h1>Master Admin Dashboard</h1>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{statistics.totalApartments}</div>
              <div className="stat-label">Total Apartments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statistics.totalStudios}</div>
              <div className="stat-label">Total Studios</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statistics.availableStudios}</div>
              <div className="stat-label">Available Studios</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h2>Property Management</h2>
            <div className="dashboard-header-buttons">
              <div className="admin-filter-section">
                <label htmlFor="property-type-filter">Property Type:</label>
                <select 
                  id="property-type-filter"
                  value={propertyTypeFilter} 
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="rental">Rental Apartments</option>
                  <option value="sale">Sale Apartments</option>
                </select>
              </div>
              <div className="admin-filter-section">
                <label htmlFor="admin-filter">Filter by Admin:</label>
                <select 
                  id="admin-filter"
                  value={selectedAdminFilter} 
                  onChange={(e) => setSelectedAdminFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="all">All Admins</option>
                  {existingAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.full_name || admin.name} ({admin.email}) - {admin.role === 'studio_rental' ? 'Studio Rental' : admin.role === 'apartment_sale' ? 'Apartment Sales' : admin.role}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="add-apartment-btn"
                onClick={() => {
                  if (propertyTypeFilter === 'rental') {
                    setIsAddApartmentModalOpen(true);
                  } else {
                    setIsAddSaleApartmentModalOpen(true);
                  }
                }}
              >
                + Add New {propertyTypeFilter === 'rental' ? 'Rental' : 'Sale'} Apartment
              </button>
            </div>
          </div>

          <div className="apartments-grid">
            {propertyTypeFilter === 'rental' ? (
              filteredProperties.map(apartment => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  onAddStudio={handleAddStudio}
                />
              ))
            ) : (
              filteredProperties.map(apartment => (
                <SaleApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  isAdminView={false}
                  showCreatedBy={true}
                />
              ))
            )}
          </div>

          {filteredProperties.length === 0 && (
            <div className="empty-state">
              {selectedAdminFilter === 'all' ? (
                <>
                  <h3>No {propertyTypeFilter === 'rental' ? 'rental' : 'sale'} apartments found</h3>
                  <p>Start by adding your first {propertyTypeFilter === 'rental' ? 'rental apartment complex' : 'apartment for sale'}</p>
                </>
              ) : (
                <>
                  <h3>No {propertyTypeFilter === 'rental' ? 'rental' : 'sale'} properties found for selected admin</h3>
                  <p>This admin has not created any {propertyTypeFilter === 'rental' ? 'rental apartments' : 'apartments for sale'} yet</p>
                </>
              )}
              <button 
                className="add-apartment-btn"
                onClick={() => {
                  if (propertyTypeFilter === 'rental') {
                    setIsAddApartmentModalOpen(true);
                  } else {
                    setIsAddSaleApartmentModalOpen(true);
                  }
                }}
              >
                + Add First {propertyTypeFilter === 'rental' ? 'Rental' : 'Sale'} Apartment
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isAddStudioModalOpen && (
        <AddStudioModal
          isOpen={isAddStudioModalOpen}
          apartmentId={selectedApartmentId}
          onStudioAdded={handleStudioAdded}
          onClose={() => {
            setIsAddStudioModalOpen(false);
            setSelectedApartmentId(null);
          }}
        />
      )}

      {isAddApartmentModalOpen && (
        <AddApartmentModal
          isOpen={isAddApartmentModalOpen}
          onApartmentAdded={handleApartmentAdded}
          onClose={() => setIsAddApartmentModalOpen(false)}
        />
      )}

      {isAddSaleApartmentModalOpen && (
        <AddSaleApartmentModal
          isOpen={isAddSaleApartmentModalOpen}
          onApartmentAdded={handleSaleApartmentAdded}
          onClose={() => setIsAddSaleApartmentModalOpen(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="modal-overlay" onClick={closeEditProfileModal}>
          <div className="modal-content admin-management-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close-btn" onClick={closeEditProfileModal}>×</button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="modal-form">
              {profileMessage.text && (
                <div className={`modal-message ${profileMessage.type}`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="form-section">
                <h3>What would you like to update?</h3>
                
                {/* Choice Selection */}
                <div className="form-group" >
                  <div className="choice-buttons">
                    <button
                      type="button"
                      className={`choice-btn ${editType === 'email' ? 'active' : ''}`}
                      onClick={() => setEditType('email')}
                    >
                      📧 Update Email
                    </button>
                    <button
                      type="button"
                      className={`choice-btn ${editType === 'password' ? 'active' : ''}`}
                      onClick={() => setEditType('password')}
                    >
                      🔒 Update Password
                    </button>
                  </div>
                </div>

                {/* Email Update Section */}
                {editType === 'email' && (
                  <div className="form-group" >
                    <label htmlFor="email">New Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange}
                      className={profileErrors.email ? 'error' : ''}
                      placeholder="Enter your new email address"
                    />
                    {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
                  </div>
                )}

                {/* Password Update Section */}
                {editType === 'password' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={profileForm.newPassword}
                          onChange={handleProfileInputChange}
                          className={profileErrors.newPassword ? 'error' : ''}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label="Toggle password visibility"
                        >
                          👁️
                        </button>
                      </div>
                      {profileErrors.newPassword && <span className="error-text">{profileErrors.newPassword}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={profileForm.confirmPassword}
                          onChange={handleProfileInputChange}
                          className={profileErrors.confirmPassword ? 'error' : ''}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label="Toggle password visibility"
                        >
                          👁️
                        </button>
                      </div>
                      {profileErrors.confirmPassword && <span className="error-text">{profileErrors.confirmPassword}</span>}
                    </div>
                  </>
                )}
              </div>

              <div className="verification-section">
                <h3>Verification Required</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Enter Current Password to Confirm Changes *</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={profileForm.currentPassword}
                      onChange={handleProfileInputChange}
                      className={profileErrors.currentPassword ? 'error' : ''}
                      placeholder="Enter your current password to verify changes"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label="Toggle password visibility"
                    >
                      👁️
                    </button>
                  </div>
                  {profileErrors.currentPassword && <span className="error-text">{profileErrors.currentPassword}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEditProfileModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isProfileSubmitting}>
                  {isProfileSubmitting 
                    ? 'Updating...' 
                    : editType === 'email' 
                      ? 'Update Email' 
                      : 'Update Password'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Admins Modal */}
      {isManageAdminsModalOpen && (
        <div className="modal-overlay" onClick={closeManageAdminsModal}>
          <div className="modal-content admin-management-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Admin Accounts</h2>
              <button className="modal-close-btn" onClick={closeManageAdminsModal}>×</button>
            </div>
            
            <div className="admin-management-content">
              <div className="tab-section">
                <h3>Create New Admin</h3>
                <form onSubmit={handleAdminSubmit} className="modal-form">
                  {adminMessage.text && (
                    <div className={`modal-message ${adminMessage.type}`}>
                      {adminMessage.text}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="name" style={{paddingTop:"250px"}}>Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={adminForm.name}
                      onChange={handleAdminInputChange}
                      className={adminErrors.name ? 'error' : ''}
                      placeholder="Enter admin's full name"
                    />
                    {adminErrors.name && <span className="error-text">{adminErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminInputChange}
                      className={adminErrors.email ? 'error' : ''}
                      placeholder="Enter admin's email"
                    />
                    {adminErrors.email && <span className="error-text">{adminErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminInputChange}
                        className={adminErrors.password ? 'error' : ''}
                        placeholder="Enter admin's password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        aria-label="Toggle password visibility"
                      >
                        👁️
                      </button>
                    </div>
                    {adminErrors.password && <span className="error-text">{adminErrors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Phone (11 digits)</label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={adminForm.mobile}
                      onChange={handleAdminInputChange}
                      className={adminErrors.mobile ? 'error' : ''}
                      placeholder="01012345678"
                      maxLength="11"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {adminErrors.mobile && <span className="error-text">{adminErrors.mobile}</span>}
                    {!adminErrors.mobile && (
                      <small className="field-hint" style={{color: '#6b7280', fontSize: '0.85rem', display: 'block', marginTop: '4px'}}>
                        Enter 11 digits starting with 010, 011, 012, or 015
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Admin Role</label>
                    <select
                      id="role"
                      name="role"
                      value={adminForm.role}
                      onChange={handleAdminInputChange}
                      className={adminErrors.role ? 'error' : ''}
                    >
                      <option value="studio_rental">Studio Rental Manager</option>
                      <option value="apartment_sale">Apartment Sales Manager</option>
                    </select>
                    {adminErrors.role && <span className="error-text">{adminErrors.role}</span>}
                    <small className="field-description">
                      Studio Rental Managers can manage studio rentals, while Apartment Sales Managers can list apartments for sale.
                    </small>
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={async () => {
                        console.log('🔄 Refreshing admin list manually...');
                        try {
                          const freshAdmins = await getAllAdminAccounts();
                          setAllAdmins(freshAdmins);
                          setExistingAdmins(freshAdmins);
                          showToast('Admin list refreshed!', 'success');
                        } catch (error) {
                          console.error('Failed to refresh:', error);
                          showToast('Failed to refresh admin list', 'error');
                        }
                      }}
                    >
                      🔄 Refresh Admin List
                    </button>
                    <button type="submit" className="btn-primary" disabled={isAdminSubmitting}>
                      {isAdminSubmitting ? 'Creating...' : 'Create Admin'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="tab-section delete-admin-section">
                <h3>Delete Admin Account</h3>
                {deleteAdminMessage.text && (
                  <div className={`modal-message ${deleteAdminMessage.type}`}>
                    {deleteAdminMessage.text}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="admin-to-delete">Select Admin to Delete</label>
                  <select 
                    id="admin-to-delete"
                    value={selectedAdminToDelete} 
                    onChange={(e) => setSelectedAdminToDelete(e.target.value)}
                    className="admin-select"
                  >
                    <option value="">-- Select Admin --</option>
                    {existingAdmins.map(admin => (
                      <option key={admin.id} value={admin.email}>
                        {admin.full_name || admin.name} ({admin.email}) - {admin.role === 'studio_rental' ? 'Studio Rental' : admin.role === 'apartment_sale' ? 'Apartment Sales' : admin.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-danger" 
                    onClick={handleDeleteAdmin}
                    disabled={isDeletingAdmin || !selectedAdminToDelete}
                  >
                    {isDeletingAdmin ? 'Deleting...' : 'Delete Admin'}
                  </button>
                </div>
              </div>

              <div className="modal-actions main-actions">
                <button type="button" className="btn-secondary" onClick={closeManageAdminsModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdminDashboard;
