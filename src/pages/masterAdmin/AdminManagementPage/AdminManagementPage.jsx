import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../hooks/useRedux';
import BackButton from '../../../components/common/BackButton';
import './AdminManagementPage.css';

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const { 
    createAdminAccount, 
    getAllAdminAccounts, 
    updateAdminStatus, 
    deleteAdminAccount
  } = useAdminAuth();
  
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: '',
    account: '',
    password: '',
    mobileNumber: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load admin accounts on component mount
  const loadAdminAccounts = useCallback(() => {
    const accounts = getAllAdminAccounts();
    setAdminAccounts(accounts);
  }, [getAllAdminAccounts]);

  useEffect(() => {
    loadAdminAccounts();
  }, [loadAdminAccounts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.account.trim()) {
      newErrors.account = 'Account is required';
    } else if (formData.account.length < 3) {
      newErrors.account = 'Account must be at least 3 characters';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid mobile number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await createAdminAccount(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData({
          username: '',
          account: '',
          password: '',
          mobileNumber: ''
        });
        setShowCreateForm(false);
        loadAdminAccounts(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create admin account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const success = updateAdminStatus(adminId, !currentStatus);
    if (success) {
      loadAdminAccounts();
      setMessage({ 
        type: 'success', 
        text: `Admin account ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
    } else {
      setMessage({ type: 'error', text: 'Failed to update admin status' });
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      const success = deleteAdminAccount(adminId);
      if (success) {
        loadAdminAccounts();
        setMessage({ type: 'success', text: 'Admin account deleted successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete admin account' });
      }
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-container">
        <BackButton text="← Back" />
        
        <header className="page-header">
          <h1>Admin Management</h1>
          <p>Create and manage admin accounts</p>
          <button 
            className="create-admin-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Admin
          </button>
        </header>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Create Admin Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create New Admin Account</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? 'error' : ''}
                    placeholder="Enter username"
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="account">Account</label>
                  <input
                    type="text"
                    id="account"
                    name="account"
                    value={formData.account}
                    onChange={handleInputChange}
                    className={errors.account ? 'error' : ''}
                    placeholder="Enter account name"
                  />
                  {errors.account && <span className="error-text">{errors.account}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Enter password"
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={errors.mobileNumber ? 'error' : ''}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Accounts Table */}
        <div className="admin-table-section">
          <h2>Admin Accounts ({adminAccounts.length})</h2>
          
          {adminAccounts.length === 0 ? (
            <div className="no-admins">
              <p>No admin accounts found.</p>
              <button 
                className="create-first-btn"
                onClick={() => setShowCreateForm(true)}
              >
                Create First Admin Account
              </button>
            </div>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Account</th>
                    <th>Mobile Number</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAccounts.map(admin => (
                    <tr key={admin.id}>
                      <td>{admin.username}</td>
                      <td>{admin.account}</td>
                      <td>{admin.mobileNumber}</td>
                      <td>
                        <span className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`toggle-btn ${admin.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {admin.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            title="Delete Admin"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagementPage;