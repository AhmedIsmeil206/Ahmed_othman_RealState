import React, { useState, useEffect } from 'react';
import { rentApartmentsApi, saleApartmentsApi, adminApi, authApi } from '../../services/api';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runApiTests = async () => {
    setIsLoading(true);
    const results = [];

    // Test 1: Check Master Admin Exists
    try {
      const response = await authApi.checkMasterAdminExists();
      results.push({
        test: 'Check Master Admin Exists',
        status: 'SUCCESS',
        response: response,
        url: '/auth/check-master-admin'
      });
    } catch (error) {
      results.push({
        test: 'Check Master Admin Exists', 
        status: 'FAILED',
        error: error.message,
        url: '/auth/check-master-admin'
      });
    }

    // Test 2: Get Rent Apartments  
    try {
      const response = await rentApartmentsApi.getAll();
      results.push({
        test: 'Get Rent Apartments',
        status: 'SUCCESS', 
        response: `Found ${response.length} apartments`,
        url: '/apartments/rent'
      });
    } catch (error) {
      results.push({
        test: 'Get Rent Apartments',
        status: 'FAILED',
        error: error.message,
        url: '/apartments/rent'
      });
    }

    // Test 3: Get Sale Apartments
    try {
      const response = await saleApartmentsApi.getAll();
      results.push({
        test: 'Get Sale Apartments',
        status: 'SUCCESS',
        response: `Found ${response.length} apartments`, 
        url: '/apartments/sale'
      });
    } catch (error) {
      results.push({
        test: 'Get Sale Apartments',
        status: 'FAILED',
        error: error.message,
        url: '/apartments/sale'
      });
    }

    // Test 4: Try to get admin info (will fail without auth, but shows endpoint is reachable)
    try {
      const response = await adminApi.getMe();
      results.push({
        test: 'Get Admin Info',
        status: 'SUCCESS',
        response: response,
        url: '/admins/me'
      });
    } catch (error) {
      results.push({
        test: 'Get Admin Info (Expected to fail without auth)',
        status: error.status === 401 ? 'EXPECTED_FAIL' : 'FAILED',
        error: error.message,
        url: '/admins/me'
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runApiTests();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h3>🔌 Backend API Connection Test</h3>
      <p>Testing connection to: <code>http://localhost:8000/api/v1</code></p>
      
      <button 
        onClick={runApiTests} 
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Testing...' : 'Run API Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{
              padding: '10px',
              margin: '10px 0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 
                result.status === 'SUCCESS' ? '#d4edda' : 
                result.status === 'EXPECTED_FAIL' ? '#fff3cd' : '#f8d7da'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {result.status === 'SUCCESS' ? '✅' : 
               result.status === 'EXPECTED_FAIL' ? '⚠️' : '❌'} 
              {result.test}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              URL: {result.url}
            </div>
            {result.response && (
              <div style={{ color: '#28a745', fontSize: '14px' }}>
                Response: {typeof result.response === 'string' ? result.response : JSON.stringify(result.response)}
              </div>
            )}
            {result.error && (
              <div style={{ color: '#dc3545', fontSize: '14px' }}>
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTestComponent;
