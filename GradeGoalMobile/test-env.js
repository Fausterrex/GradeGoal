// Test script to show environment configuration
const { currentConfig } = require('./src/config/environment.ts');

console.log('🔧 Current Environment Configuration:');
console.log('=====================================');
console.log('API Base URL:', currentConfig.api.baseURL);
console.log('API Timeout:', currentConfig.api.timeout);
console.log('Environment:', currentConfig.app.environment);
console.log('Debug Logs:', currentConfig.app.enableDebugLogs);
console.log('Network Logging:', currentConfig.network.enableNetworkLogging);
console.log('=====================================');
