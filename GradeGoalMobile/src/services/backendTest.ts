import { apiClient } from './apiClient';

// Simple backend connection test
export class BackendTest {
  
  // Test basic connectivity to the backend
  static async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Testing backend connection...');
      
      // Try to reach the backend with a simple request to an existing endpoint
      // Using /api/users since that's what exists in your Spring Boot app
      const response = await apiClient.get('/users', { timeout: 5000 });
      
      return {
        success: true,
        message: 'Backend connection successful',
        details: response.data
      };
    } catch (error: any) {
      console.error('Backend connection test failed:', error);
      
      let message = 'Backend connection failed';
      let details = {};
      
      if (error.code === 'ECONNREFUSED') {
        message = 'Backend server is not running or not accessible';
        details = { error: 'Connection refused - check if Spring Boot server is running on port 8080' };
      } else if (error.code === 'NETWORK_ERROR') {
        message = 'Network error - check your internet connection';
        details = { error: 'Network request failed' };
      } else if (error.response) {
        message = `Backend responded with status ${error.response.status}`;
        details = { 
          status: error.response.status,
          data: error.response.data 
        };
      } else if (error.request) {
        message = 'No response from backend server';
        details = { error: 'Request was made but no response received' };
      } else {
        message = `Request setup error: ${error.message}`;
        details = { error: error.message };
      }
      
      return {
        success: false,
        message,
        details
      };
    }
  }

  // Test specific API endpoints
  static async testEndpoints(): Promise<{ [key: string]: { success: boolean; message: string } }> {
    const results: { [key: string]: { success: boolean; message: string } } = {};
    
    const endpoints = [
      { name: 'Users API', url: '/users' },
      { name: 'User by Email', url: '/users/email/test@example.com' },
      { name: 'Courses API', url: '/courses' },
      { name: 'Goals API', url: '/academic-goals' },
    ];

    for (const endpoint of endpoints) {
      try {
        await apiClient.get(endpoint.url, { timeout: 3000 });
        results[endpoint.name] = {
          success: true,
          message: 'Endpoint accessible'
        };
      } catch (error: any) {
        results[endpoint.name] = {
          success: false,
          message: error.response?.status ? `Status ${error.response.status}` : error.message
        };
      }
    }

    return results;
  }

  // Get backend configuration info
  static getBackendInfo() {
    return {
      baseURL: 'http://10.0.2.2:8080/api',
      description: 'Android emulator localhost mapping',
      note: 'Make sure your Spring Boot server is running on localhost:8080'
    };
  }
}

export default BackendTest;
