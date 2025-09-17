import React, { useState } from 'react';
import { useProperty, useMasterAuth } from '../../hooks/useRedux';

/**
 * Test component to verify localStorage persistence and master admin setup
 * Add this to any page temporarily to test the functionality
 */
const LocalStorageTestComponent = () => {
  const { 
    apartments, 
    saleApartments, 
    addApartment, 
    addSaleApartment, 
    addStudio 
  } = useProperty();
  
  const {
    isFirstTimeSetup,
    masterAdminExists,
    allUsers,
    initializeMasterAdmin
  } = useMasterAuth();
  
  const [testResults, setTestResults] = useState([]);

  const logTest = (message, success = true) => {
    const result = {
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev].slice(0, 8)); // Keep last 8 results
    console.log(success ? '✅' : '❌', message);
  };

  const resetFirstTimeSetup = () => {
    // Clear the first-time setup flag and master admin data
    localStorage.removeItem('master_admin_first_time_setup');
    localStorage.removeItem('master_admin_users');
    localStorage.removeItem('current_master_admin');
    
    logTest('🔄 Reset first-time setup - refresh page to see signup form');
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const checkMasterAdminSetup = () => {
    const firstTimeFlag = localStorage.getItem('master_admin_first_time_setup');
    const usersData = localStorage.getItem('master_admin_users');
    const currentUser = localStorage.getItem('current_master_admin');
    
    logTest(`First-time setup: ${isFirstTimeSetup ? 'YES (should show signup)' : 'NO (should show login)'}`);
    logTest(`Master admin exists: ${masterAdminExists ? 'YES' : 'NO'}`);
    logTest(`Total users: ${allUsers.length}`);
    logTest(`localStorage flags - Setup: ${firstTimeFlag}, Users: ${!!usersData}, Session: ${!!currentUser}`);
  };

  const testAddApartment = () => {
    const testApartment = {
      name: `Test Apartment ${Date.now()}`,
      location: 'Test Location',
      address: '123 Test Street',
      price: 1000,
      description: 'Test apartment for localStorage verification',
      createdBy: 'test-admin',
      createdAt: new Date().toISOString(),
      isAvailable: true
    };
    
    addApartment(testApartment);
    
    // Check if it was saved to localStorage
    setTimeout(() => {
      const savedApartments = JSON.parse(localStorage.getItem('apartments_data') || '[]');
      const found = savedApartments.find(apt => apt.name === testApartment.name);
      logTest(
        `Apartment "${testApartment.name}" ${found ? 'saved' : 'failed to save'}`,
        !!found
      );
    }, 100);
  };

  const refreshTest = () => {
    logTest('🔄 Refresh the page now and check if data persists...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '420px',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontSize: '14px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#007bff' }}>
        🔧 Master Admin & Data Test Panel
      </h4>
      
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Master Admin Status:</strong>
        <div>First-time setup: {isFirstTimeSetup ? '✅ YES' : '❌ NO'}</div>
        <div>Admin exists: {masterAdminExists ? '✅ YES' : '❌ NO'}</div>
        <div>Total users: {allUsers.length}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Property Data:</strong>
        <div>Apartments: {apartments.length}</div>
        <div>Sale Apartments: {saleApartments.length}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
        <button 
          onClick={resetFirstTimeSetup}
          style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Reset to First-Time Setup
        </button>
        
        <button 
          onClick={checkMasterAdminSetup}
          style={{ padding: '6px 12px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Check Master Admin Status
        </button>
        
        <button 
          onClick={testAddApartment}
          style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Add Apartment
        </button>
        
        <button 
          onClick={refreshTest}
          style={{ padding: '6px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Page Refresh
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <strong>Test Results:</strong>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  fontSize: '11px', 
                  color: result.success ? '#28a745' : '#dc3545',
                  marginTop: '4px',
                  lineHeight: '1.3'
                }}
              >
                [{result.timestamp}] {result.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.7 }}>
        💡 Remove this component after testing
      </div>
    </div>
  );
};

export default LocalStorageTestComponent;