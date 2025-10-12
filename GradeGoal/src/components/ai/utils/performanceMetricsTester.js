// ========================================
// AI PERFORMANCE METRICS TESTER
// ========================================
// Utility for testing and validating real-time performance metrics
// Use this to verify that the metrics system is working correctly

import { 
  trackAIResponse, 
  trackAIPrediction, 
  trackAIError, 
  getPerformanceMetrics,
  loadPerformanceData,
  savePerformanceData 
} from '../services/performanceTrackingService.js';

/**
 * Test suite for performance metrics
 */
export class PerformanceMetricsTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Run all performance metrics tests
   */
  async runAllTests() {
    console.log('🧪 [TESTER] Starting Performance Metrics Tests...');
    
    try {
      // Test 1: Response Time Tracking
      await this.testResponseTimeTracking();
      
      // Test 2: Prediction Tracking
      await this.testPredictionTracking();
      
      // Test 3: Error Tracking
      await this.testErrorTracking();
      
      // Test 4: Metrics Calculation
      await this.testMetricsCalculation();
      
      // Test 5: Data Persistence
      await this.testDataPersistence();
      
      // Generate test report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ [TESTER] Test suite failed:', error);
    }
  }

  /**
   * Test response time tracking
   */
  async testResponseTimeTracking() {
    console.log('🧪 [TESTER] Testing Response Time Tracking...');
    
    const testCases = [
      { model: 'llama-3.1-8b-instant', expectedRange: [100, 500] },
      { model: 'mixtral-8x7b-32768', expectedRange: [200, 800] },
      { model: 'gemma-7b-it', expectedRange: [150, 600] }
    ];
    
    for (const testCase of testCases) {
      // Simulate API call timing
      const startTime = performance.now();
      await this.simulateAPICall(testCase.model);
      const endTime = performance.now();
      
      const responseTime = trackAIResponse(startTime, endTime, testCase.model);
      
      const isValid = responseTime >= testCase.expectedRange[0] && 
                     responseTime <= testCase.expectedRange[1];
      
      this.testResults.push({
        test: 'Response Time Tracking',
        model: testCase.model,
        responseTime: Math.round(responseTime),
        expectedRange: testCase.expectedRange,
        passed: isValid,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [TESTER] ${testCase.model}: ${Math.round(responseTime)}ms ${isValid ? 'PASS' : 'FAIL'}`);
    }
  }

  /**
   * Test prediction tracking
   */
  async testPredictionTracking() {
    console.log('🧪 [TESTER] Testing Prediction Tracking...');
    
    const testPredictions = [
      { prediction: 85, actual: 87, model: 'llama-3.1-8b-instant', confidence: 0.8 },
      { prediction: 92, actual: 89, model: 'mixtral-8x7b-32768', confidence: 0.9 },
      { prediction: 78, actual: 82, model: 'gemma-7b-it', confidence: 0.7 },
      { prediction: 95, actual: 95, model: 'llama-3.1-8b-instant', confidence: 0.95 }
    ];
    
    for (const testCase of testPredictions) {
      const result = trackAIPrediction(
        testCase.prediction,
        testCase.actual,
        testCase.model,
        testCase.confidence
      );
      
      const accuracy = result.accuracy;
      const expectedAccuracy = 1 - Math.abs(testCase.prediction - testCase.actual) / 100;
      const isValid = Math.abs(accuracy - expectedAccuracy) < 0.1;
      
      this.testResults.push({
        test: 'Prediction Tracking',
        model: testCase.model,
        prediction: testCase.prediction,
        actual: testCase.actual,
        accuracy: accuracy.toFixed(3),
        expectedAccuracy: expectedAccuracy.toFixed(3),
        passed: isValid,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [TESTER] ${testCase.model}: Accuracy ${accuracy.toFixed(3)} ${isValid ? 'PASS' : 'FAIL'}`);
    }
  }

  /**
   * Test error tracking
   */
  async testErrorTracking() {
    console.log('🧪 [TESTER] Testing Error Tracking...');
    
    const testErrors = [
      { error: new Error('API timeout'), model: 'llama-3.1-8b-instant', context: 'API_CALL' },
      { error: new Error('Invalid response'), model: 'mixtral-8x7b-32768', context: 'PARSING' },
      { error: new Error('Rate limit exceeded'), model: 'gemma-7b-it', context: 'RATE_LIMIT' }
    ];
    
    for (const testCase of testErrors) {
      trackAIError(testCase.error, testCase.model, testCase.context);
      
      this.testResults.push({
        test: 'Error Tracking',
        model: testCase.model,
        error: testCase.error.message,
        context: testCase.context,
        passed: true, // Error tracking always passes if no exception
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [TESTER] ${testCase.model}: Error tracked ${testCase.error.message}`);
    }
  }

  /**
   * Test metrics calculation
   */
  async testMetricsCalculation() {
    console.log('🧪 [TESTER] Testing Metrics Calculation...');
    
    const metrics = getPerformanceMetrics();
    
    const tests = [
      { metric: 'mse', type: 'number', min: 0, max: 1 },
      { metric: 'avgResponseTime', type: 'string', contains: 'ms' },
      { metric: 'successRate', type: 'string', contains: '%' },
      { metric: 'lastRetrain', type: 'string' },
      { metric: 'totalPredictions', type: 'number', min: 0 },
      { metric: 'totalErrors', type: 'number', min: 0 }
    ];
    
    for (const test of tests) {
      const value = metrics[test.metric];
      let isValid = false;
      
      if (test.type === 'number') {
        isValid = typeof value === 'number' && value >= test.min && value <= test.max;
      } else if (test.type === 'string') {
        isValid = typeof value === 'string';
        if (test.contains) {
          isValid = isValid && value.includes(test.contains);
        }
      }
      
      this.testResults.push({
        test: 'Metrics Calculation',
        metric: test.metric,
        value: value,
        expectedType: test.type,
        passed: isValid,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [TESTER] ${test.metric}: ${value} ${isValid ? 'PASS' : 'FAIL'}`);
    }
  }

  /**
   * Test data persistence
   */
  async testDataPersistence() {
    console.log('🧪 [TESTER] Testing Data Persistence...');
    
    try {
      // Test saving data
      const saveResult = await savePerformanceData();
      
      // Test loading data
      const loadResult = await loadPerformanceData();
      
      this.testResults.push({
        test: 'Data Persistence',
        saveResult: saveResult,
        loadResult: loadResult,
        passed: saveResult && loadResult,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [TESTER] Data Persistence: Save ${saveResult ? 'PASS' : 'FAIL'}, Load ${loadResult ? 'PASS' : 'FAIL'}`);
      
    } catch (error) {
      this.testResults.push({
        test: 'Data Persistence',
        error: error.message,
        passed: false,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ [TESTER] Data Persistence: FAIL - ${error.message}`);
    }
  }

  /**
   * Simulate API call for testing
   */
  async simulateAPICall(model) {
    // Simulate different response times for different models
    const baseTime = model.includes('llama') ? 150 : model.includes('mixtral') ? 300 : 200;
    const randomDelay = Math.random() * 200;
    const delay = baseTime + randomDelay;
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('\n📊 [TESTER] ===== PERFORMANCE METRICS TEST REPORT =====');
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`⏱️ Total Time: ${Date.now() - this.startTime}ms`);
    
    console.log('\n📋 [TESTER] Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test} - ${status}`);
      if (result.model) console.log(`   Model: ${result.model}`);
      if (result.metric) console.log(`   Metric: ${result.metric} = ${result.value}`);
      if (result.error) console.log(`   Error: ${result.error}`);
    });
    
    console.log('\n🎯 [TESTER] ===== END TEST REPORT =====');
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      results: this.testResults
    };
  }

  /**
   * Quick test for immediate feedback
   */
  async quickTest() {
    console.log('⚡ [TESTER] Running Quick Test...');
    
    // Test response time
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const end = performance.now();
    trackAIResponse(start, end, 'test-model');
    
    // Test prediction
    trackAIPrediction(85, 87, 'test-model', 0.8);
    
    // Get metrics
    const metrics = getPerformanceMetrics();
    
    console.log('⚡ [TESTER] Quick Test Results:');
    console.log(`📊 MSE: ${metrics.mse}`);
    console.log(`⏱️ Avg Response: ${metrics.avgResponseTime}`);
    console.log(`📈 Success Rate: ${metrics.successRate}`);
    console.log(`🔄 Last Retrain: ${metrics.lastRetrain}`);
    
    return metrics;
  }
}

// Export for easy testing
export const runPerformanceTests = async () => {
  const tester = new PerformanceMetricsTester();
  return await tester.runAllTests();
};

export const runQuickTest = async () => {
  const tester = new PerformanceMetricsTester();
  return await tester.quickTest();
};

export default PerformanceMetricsTester;

