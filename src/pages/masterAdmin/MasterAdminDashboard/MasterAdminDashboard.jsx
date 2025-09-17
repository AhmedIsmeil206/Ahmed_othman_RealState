import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth, useAdminAuth, useProperty } from '../../../hooks/useRedux';
import BackButton from '../../../components/common/BackButton';
import ApartmentCard from '../../../components/admin/ApartmentCard';
import SaleApartmentCard from '../../../components/admin/SaleApartmentCard';
import AddStudioModal from '../../../components/admin/AddStudioModal';
import AddApartmentModal from '../../../components/admin/AddApartmentModal';
import AddSaleApartmentModal from '../../../components/admin/AddSaleApartmentModal/AddSaleApartmentModal';
import './MasterAdminDashboard.css';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';

const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile } = useMasterAuth();
  const { createAdminAccount, getAllAdminAccounts, deleteAdminAccount } = useAdminAuth();
  const { apartments, addApartment, addStudio, verifyDataConsistency, clearAllData, getApartmentsByCreator,
          saleApartments, addSaleApartment, getSaleApartmentsByCreator } = useProperty();
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [isAddApartmentModalOpen, setIsAddApartmentModalOpen] = useState(false);
  const [isAddSaleApartmentModalOpen, setIsAddSaleApartmentModalOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  
  // Admin management states
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

  // Fetch existing admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const admins = getAllAdminAccounts();
        setExistingAdmins(admins || []);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    fetchAdmins();
  }, [getAllAdminAccounts]);

  // Get filtered properties based on selected admin and property type
  const getFilteredProperties = () => {
    let properties;
    
    if (propertyTypeFilter === 'rental') {
      properties = selectedAdminFilter === 'all' ? apartments : getApartmentsByCreator(selectedAdminFilter);
    } else {
      properties = selectedAdminFilter === 'all' ? saleApartments : getSaleApartmentsByCreator(selectedAdminFilter);
    }
    
    return properties;
  };

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedProfileForm = localStorage.getItem('masterAdminProfileForm');
    const savedAdminForm = localStorage.getItem('masterAdminAdminForm');
    
    if (savedProfileForm) {
      const parsed = JSON.parse(savedProfileForm);
      setEditType(parsed.editType || 'email');
      setProfileForm(prev => ({
        ...prev,
        email: parsed.email || currentUser?.email || '',
        // Don't restore passwords for security
      }));
    }
    
    if (savedAdminForm) {
      const parsed = JSON.parse(savedAdminForm);
      setAdminForm(prev => ({
        ...prev,
        name: parsed.name || '',
        email: parsed.email || '',
        mobile: parsed.mobile || '',
        // Don't restore password for security
      }));
    }
  }, [currentUser]);

  // Save form data to localStorage whenever forms change
  useEffect(() => {
    const formToSave = {
      email: profileForm.email,
      editType: editType,
      // Don't save passwords
    };
    localStorage.setItem('masterAdminProfileForm', JSON.stringify(formToSave));
  }, [profileForm.email, editType]);

  useEffect(() => {
    const formToSave = {
      name: adminForm.name,
      email: adminForm.email,
      mobile: adminForm.mobile,
      // Don't save password
    };
    localStorage.setItem('masterAdminAdminForm', JSON.stringify(formToSave));
  }, [adminForm.name, adminForm.email, adminForm.mobile]);

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
    // Clear saved form data
    localStorage.removeItem('masterAdminProfileForm');
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

      // Call the updateProfile method from context
      const result = await updateProfile(
        emailToUpdate,
        profileForm.currentPassword,
        passwordToUpdate
      );

      if (result.success) {
        const successMessage = editType === 'email' 
          ? 'Email updated successfully! Redirecting to login...'
          : 'Password updated successfully! Redirecting to login...';
          
        setProfileMessage({ 
          type: 'success', 
          text: successMessage
        });
        
        // Clear saved form data
        localStorage.removeItem('masterAdminProfileForm');
        
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
  const openManageAdminsModal = () => {
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
    // Clear saved form data
    localStorage.removeItem('masterAdminAdminForm');
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
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
    } else if (!/^[+]?[\d\s-()]+$/.test(adminForm.mobile)) {
      errors.mobile = 'Invalid mobile number format';
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

    console.log('Validation passed, creating admin...');
    setIsAdminSubmitting(true);
    setAdminMessage({ type: '', text: '' });

    try {
      // Use the AdminAuth context to create admin account
      const result = await createAdminAccount({
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        mobile: adminForm.mobile,
        role: adminForm.role
      });

      if (result.success) {
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
        
        // Clear saved form data
        localStorage.removeItem('masterAdminAdminForm');
        
        // Close modal after a short delay
        setTimeout(() => {
          closeManageAdminsModal();
        }, 2000);
      } else {
        setAdminMessage({ 
          type: 'error', 
          text: result.message || 'Failed to create admin account. Please try again.' 
        });
      }

    } catch (error) {
      console.error('Error creating admin account:', error);
      setAdminMessage({ type: 'error', text: 'Failed to create admin account. Please try again.' });
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
      const adminToDelete = existingAdmins.find(admin => admin.account === selectedAdminToDelete);
      if (!adminToDelete) {
        setDeleteAdminMessage({ type: 'error', text: 'Admin not found.' });
        setIsDeletingAdmin(false);
        return;
      }

      const result = deleteAdminAccount(adminToDelete.id);
      
      if (result) {
        setDeleteAdminMessage({ 
          type: 'success', 
          text: 'Admin account deleted successfully!' 
        });
        
        // Refresh the admin list
        const updatedAdmins = getAllAdminAccounts();
        setExistingAdmins(updatedAdmins || []);
        
        // Reset selection
        setSelectedAdminToDelete('');
        
        // If the deleted admin was selected in filter, reset to 'all'
        if (selectedAdminFilter === selectedAdminToDelete) {
          setSelectedAdminFilter('all');
        }
        
        setTimeout(() => {
          setDeleteAdminMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setDeleteAdminMessage({ 
          type: 'error', 
          text: 'Failed to delete admin account.' 
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

  const handleStudioAdded = (newStudio) => {
    addStudio(selectedApartmentId, newStudio);
    setIsAddStudioModalOpen(false);
    setSelectedApartmentId(null);
  };

  const handleApartmentAdded = (newApartment) => {
    if (propertyTypeFilter === 'rental') {
      addApartment(newApartment);
      setIsAddApartmentModalOpen(false);
    } else {
      addSaleApartment(newApartment);
      setIsAddSaleApartmentModalOpen(false);
    }
  };

  const handleSaleApartmentAdded = (newSaleApartment) => {
    addSaleApartment(newSaleApartment);
    setIsAddSaleApartmentModalOpen(false);
  };

  const totalStudios = apartments.reduce((total, apartment) => total + apartment.totalStudios, 0);
  const availableStudios = apartments.reduce((total, apartment) => 
    total + apartment.studios.filter(studio => studio.isAvailable).length, 0
  );

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
              <div className="stat-number">{apartments.length}</div>
              <div className="stat-label">Total Apartments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{totalStudios}</div>
              <div className="stat-label">Total Studios</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{availableStudios}</div>
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
                    <option key={admin.id} value={admin.account}>
                      {admin.username} ({admin.account}) - {admin.role === 'studio_rental' ? 'Studio Rental' : 'Apartment Sales'}
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
              getFilteredProperties().map(apartment => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  onAddStudio={handleAddStudio}
                />
              ))
            ) : (
              getFilteredProperties().map(apartment => (
                <SaleApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  isAdminView={false}
                  showCreatedBy={true}
                />
              ))
            )}
          </div>

          {getFilteredProperties().length === 0 && (
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
                    <label htmlFor="name">Full Name</label>
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
                    <label htmlFor="mobile">Mobile Phone</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={adminForm.mobile}
                      onChange={handleAdminInputChange}
                      className={adminErrors.mobile ? 'error' : ''}
                      placeholder="Enter admin's mobile number"
                    />
                    {adminErrors.mobile && <span className="error-text">{adminErrors.mobile}</span>}
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
                      <option value="apartment_sales">Apartment Sales Manager</option>
                    </select>
                    {adminErrors.role && <span className="error-text">{adminErrors.role}</span>}
                    <small className="field-description">
                      Studio Rental Managers can manage studio rentals, while Apartment Sales Managers can list apartments for sale.
                    </small>
                  </div>

                  <div className="modal-actions">
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
                      <option key={admin.id} value={admin.account}>
                        {admin.username} ({admin.account}) - {admin.role === 'studio_rental' ? 'Studio Rental' : 'Apartment Sales'}
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
