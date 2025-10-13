// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================
// Centralized configuration for different environments and devices

import { Platform } from 'react-native';
import {
  API_BASE_URL,
  API_TIMEOUT,
  ENABLE_DEBUG_LOGS,
  ENABLE_NETWORK_LOGGING,
  APP_VERSION,
  APP_ENVIRONMENT,
  ENABLE_PUSH_NOTIFICATIONS,
  ENABLE_ANALYTICS,
  ENABLE_CRASH_REPORTING,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
  ANDROID_API_URL,
  IOS_API_URL,
  WEB_API_URL,
} from '@env';

// Environment variables (with fallbacks)
const ENV = {
  API_BASE_URL: API_BASE_URL || 'http://10.0.2.2:8080/api',
  API_TIMEOUT: parseInt(API_TIMEOUT || '10000'),
  ENABLE_DEBUG_LOGS: ENABLE_DEBUG_LOGS === 'true' || __DEV__,
  ENABLE_NETWORK_LOGGING: ENABLE_NETWORK_LOGGING === 'true' || __DEV__,
  APP_VERSION: APP_VERSION || '1.0.0',
  APP_ENVIRONMENT: APP_ENVIRONMENT || 'development',
  ENABLE_PUSH_NOTIFICATIONS: ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: ENABLE_CRASH_REPORTING === 'true',
  MAX_RETRY_ATTEMPTS: parseInt(MAX_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(RETRY_DELAY || '1000'),
  ANDROID_API_URL: ANDROID_API_URL || 'http://10.0.2.2:8080/api',
  IOS_API_URL: IOS_API_URL || 'http://localhost:8080/api',
  WEB_API_URL: WEB_API_URL || 'http://localhost:8080/api',
};

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  return ENV.APP_ENVIRONMENT as Environment;
};

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

// Get API configuration based on environment and platform
export const getApiConfig = (): ApiConfig => {
  const environment = getCurrentEnvironment();
  
  // Use environment variables or fallback to defaults
  const configs: Record<Environment, ApiConfig> = {
    development: {
      baseURL: getDevelopmentBaseURL(),
      timeout: ENV.API_TIMEOUT,
      retryAttempts: ENV.MAX_RETRY_ATTEMPTS,
    },
    staging: {
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      retryAttempts: ENV.MAX_RETRY_ATTEMPTS,
    },
    production: {
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      retryAttempts: ENV.MAX_RETRY_ATTEMPTS,
    },
  };

  return configs[environment];
};

// Get development base URL based on platform and device
const getDevelopmentBaseURL = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator - use environment variable or fallback
    return ENV.ANDROID_API_URL;
  } else if (Platform.OS === 'ios') {
    // iOS simulator - use environment variable or fallback
    return ENV.IOS_API_URL;
  } else {
    // Web or other platforms - use environment variable or fallback
    return ENV.WEB_API_URL;
  }
};

// Network configuration
export const getNetworkConfig = () => ({
  // Enable network debugging in development
  enableNetworkLogging: ENV.ENABLE_NETWORK_LOGGING,
  
  // Request timeout
  requestTimeout: ENV.API_TIMEOUT,
  
  // Retry configuration
  maxRetries: ENV.MAX_RETRY_ATTEMPTS,
  retryDelay: ENV.RETRY_DELAY,
  
  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// App configuration
export const getAppConfig = () => ({
  // App version
  version: ENV.APP_VERSION,
  
  // Environment
  environment: getCurrentEnvironment(),
  
  // Debug settings
  enableDebugLogs: ENV.ENABLE_DEBUG_LOGS,
  enablePerformanceMonitoring: !__DEV__,
  
  // Feature flags
  features: {
    enablePushNotifications: ENV.ENABLE_PUSH_NOTIFICATIONS,
    enableAnalytics: ENV.ENABLE_ANALYTICS,
    enableCrashReporting: ENV.ENABLE_CRASH_REPORTING,
  },
});

// Export current configuration
export const currentConfig = {
  api: getApiConfig(),
  network: getNetworkConfig(),
  app: getAppConfig(),
};
