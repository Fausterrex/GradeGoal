// ========================================
// PERFORMANCE METRICS TEST COMPONENT
// ========================================
// Admin component for testing and validating performance metrics
// Add this to your admin panel to test the metrics system

import React, { useState, useEffect } from 'react';
import { runPerformanceTests, runQuickTest } from '../../ai/utils/performanceMetricsTester.js';
import { getPerformanceMetrics } from '../../ai/services/performanceTrackingService.js';

const PerformanceMetricsTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [testLog, setTestLog] = useState([]);

  // Load current metrics on component mount
  useEffect(() => {
    loadCurrentMetrics();
  }, []);

  const loadCurrentMetrics = () => {
    const metrics = getPerformanceMetrics();
    setCurrentMetrics(metrics);
    console.log('📊 [ADMIN] Current Metrics:', metrics);
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setTestLog(prev => [...prev, '⚡ Starting Quick Test...']);
    
    try {
      const { runQuickTest: quickTest } = await import('../../ai/utils/performanceMetricsTester.js');
      const results = await quickTest();
      setCurrentMetrics(results);
      setTestLog(prev => [...prev, '✅ Quick Test Completed']);
    } catch (error) {
      setTestLog(prev => [...prev, `❌ Quick Test Failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestLog(prev => [...prev, '🧪 Starting Full Test Suite...']);
    
    try {
      const results = await runPerformanceTests();
      setTestResults(results);
      setTestLog(prev => [...prev, `✅ Full Test Completed - Success Rate: ${results.successRate}%`]);
    } catch (error) {
      setTestLog(prev => [...prev, `❌ Full Test Failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLog = () => {
    setTestLog([]);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🧪 Performance Metrics Testing
      </h2>

      {/* Current Metrics Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Metrics</h3>
        {currentMetrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">MSE</p>
              <p className="text-lg font-semibold text-blue-600">{currentMetrics.mse}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-lg font-semibold text-green-600">{currentMetrics.avgResponseTime}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-lg font-semibold text-purple-600">{currentMetrics.successRate}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Last Retrain</p>
              <p className="text-lg font-semibold text-orange-600">{currentMetrics.lastRetrain}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No metrics available. Run a test to generate data.</p>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Controls</h3>
        <div className="flex gap-4">
          <button
            onClick={runQuickTest}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : '⚡ Quick Test'}
          </button>
          <button
            onClick={runFullTest}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : '🧪 Full Test Suite'}
          </button>
          <button
            onClick={loadCurrentMetrics}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🔄 Refresh Metrics
          </button>
          <button
            onClick={clearLog}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🗑️ Clear Log
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Results</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{testResults.totalTests}</p>
                <p className="text-sm text-gray-600">Total Tests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{testResults.passedTests}</p>
                <p className="text-sm text-gray-600">Passed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{testResults.failedTests}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{testResults.successRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Log */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Log</h3>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {testLog.length === 0 ? (
            <p className="text-gray-500">No test logs yet. Run a test to see results.</p>
          ) : (
            testLog.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">🧪 How to Test Performance Metrics</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. <strong>Quick Test:</strong> Tests basic functionality and shows current metrics</li>
          <li>2. <strong>Full Test Suite:</strong> Runs comprehensive tests on all metrics</li>
          <li>3. <strong>Check Console:</strong> Open browser dev tools to see detailed test logs</li>
          <li>4. <strong>Verify Metrics:</strong> Ensure MSE, response times, and success rates are realistic</li>
          <li>5. <strong>Test AI Analysis:</strong> Go to a course and run AI analysis to generate real data</li>
        </ol>
      </div>
    </div>
  );
};

export default PerformanceMetricsTest;

