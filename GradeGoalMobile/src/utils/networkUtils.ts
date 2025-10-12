// ========================================
// NETWORK UTILITIES
// ========================================
// Helper functions for network configuration and debugging

import { Platform } from 'react-native';
import { currentConfig } from '../config/environment';

// Get the local IP address for development
export const getLocalIPAddress = (): string => {
  // This is a placeholder - in a real app, you might want to use
  // a library like react-native-network-info to get the actual IP
  return '192.168.1.100'; // Replace with your actual IP
};

// Get the appropriate API URL based on platform and environment
export const getApiURL = (): string => {
  const config = currentConfig.api;
  
  // If it's a development environment and using localhost
  if (config.baseURL.includes('localhost') || config.baseURL.includes('10.0.2.2')) {
    if (Platform.OS === 'android') {
      // Android emulator
      return 'http://10.0.2.2:8080/api';
    } else if (Platform.OS === 'ios') {
      // iOS simulator
      return 'http://localhost:8080/api';
    } else {
      // Physical device - use local IP
      return `http://${getLocalIPAddress()}:8080/api`;
    }
  }
  
  return config.baseURL;
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${getApiURL()}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API connection test failed:', error);
    return false;
  }
};

// Get network status information
export const getNetworkInfo = () => {
  return {
    platform: Platform.OS,
    apiURL: getApiURL(),
    environment: currentConfig.app.environment,
    debugMode: currentConfig.app.enableDebugLogs,
  };
};

// Log network configuration (for debugging)
export const logNetworkConfig = () => {
};
