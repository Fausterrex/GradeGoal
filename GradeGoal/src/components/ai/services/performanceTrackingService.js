// ========================================
// AI PERFORMANCE TRACKING SERVICE
// ========================================
// Service for tracking and calculating real AI model performance metrics
// Tracks MSE, response times, success rates, and model retraining

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Performance tracking data structure
 */
class PerformanceTracker {
  constructor() {
    this.responseTimes = [];
    this.predictions = [];
    this.errors = [];
    this.lastRetrain = null;
    this.modelVersions = [];
  }

  /**
   * Track AI response time
   */
  trackResponseTime(startTime, endTime, modelName) {
    const responseTime = endTime - startTime;
    this.responseTimes.push({
      timestamp: new Date().toISOString(),
      duration: responseTime,
      modelName: modelName
    });
    
    // Keep only last 100 response times for memory efficiency
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
    
    return responseTime;
  }

  /**
   * Track AI prediction with actual outcome
   */
  trackPrediction(prediction, actualOutcome, modelName, confidence) {
    const predictionRecord = {
      timestamp: new Date().toISOString(),
      prediction: prediction,
      actualOutcome: actualOutcome,
      modelName: modelName,
      confidence: confidence,
      accuracy: this.calculatePredictionAccuracy(prediction, actualOutcome)
    };
    
    this.predictions.push(predictionRecord);
    
    // Keep only last 1000 predictions for memory efficiency
    if (this.predictions.length > 1000) {
      this.predictions = this.predictions.slice(-1000);
    }
    
    return predictionRecord;
  }

  /**
   * Track AI errors
   */
  trackError(error, modelName, context) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message || error,
      modelName: modelName,
      context: context,
      stack: error.stack
    });
    
    // Keep only last 100 errors for memory efficiency
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  /**
   * Calculate prediction accuracy
   */
  calculatePredictionAccuracy(prediction, actualOutcome) {
    if (typeof prediction === 'number' && typeof actualOutcome === 'number') {
      // For numeric predictions (GPA, percentages)
      const error = Math.abs(prediction - actualOutcome);
      const maxError = Math.max(prediction, actualOutcome, 1);
      return Math.max(0, 1 - (error / maxError));
    } else if (typeof prediction === 'string' && typeof actualOutcome === 'string') {
      // For categorical predictions
      return prediction.toLowerCase() === actualOutcome.toLowerCase() ? 1 : 0;
    }
    return 0;
  }

  /**
   * Calculate Mean Squared Error (MSE)
   */
  calculateMSE() {
    if (this.predictions.length === 0) return 0;
    
    const numericPredictions = this.predictions.filter(p => 
      typeof p.prediction === 'number' && typeof p.actualOutcome === 'number'
    );
    
    if (numericPredictions.length === 0) return 0;
    
    const squaredErrors = numericPredictions.map(p => 
      Math.pow(p.prediction - p.actualOutcome, 2)
    );
    
    return squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length;
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    if (this.responseTimes.length === 0) return 0;
    
    const totalTime = this.responseTimes.reduce((sum, rt) => sum + rt.duration, 0);
    return totalTime / this.responseTimes.length;
  }

  /**
   * Calculate success rate of AI generation (not prediction accuracy)
   */
  calculateSuccessRate() {
    if (this.predictions.length === 0) return 0;
    
    // Success = AI analysis was generated successfully
    const successfulGenerations = this.predictions.filter(p => 
      p.prediction !== 'PENDING_ACTUAL_OUTCOME' && 
      p.prediction !== null && 
      p.prediction !== undefined &&
      p.confidence > 0
    );
    
    return (successfulGenerations.length / this.predictions.length) * 100;
  }

  /**
   * Get last retrain date
   */
  getLastRetrain() {
    return this.lastRetrain;
  }

  /**
   * Set last retrain date
   */
  setLastRetrain(date) {
    this.lastRetrain = date;
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics() {
    const mse = this.calculateMSE();
    const avgResponseTime = this.calculateAverageResponseTime();
    const successRate = this.calculateSuccessRate();
    const lastRetrain = this.getLastRetrain();
    
    return {
      mse: mse.toFixed(4),
      avgResponseTime: `${Math.round(avgResponseTime)}ms`,
      successRate: `${successRate.toFixed(1)}%`,
      lastRetrain: lastRetrain ? this.formatTimeAgo(lastRetrain) : 'Never',
      totalPredictions: this.predictions.length,
      totalErrors: this.errors.length,
      recentAccuracy: this.calculateRecentAccuracy()
    };
  }

  /**
   * Calculate recent accuracy (last 30 predictions)
   */
  calculateRecentAccuracy() {
    const recentPredictions = this.predictions.slice(-30);
    if (recentPredictions.length === 0) return 0;
    
    const avgAccuracy = recentPredictions.reduce((sum, p) => sum + p.accuracy, 0) / recentPredictions.length;
    return (avgAccuracy * 100).toFixed(1);
  }

  /**
   * Format time ago string
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  }

  /**
   * Save performance data to backend
   */
  async savePerformanceData() {
    try {
      const performanceData = {
        responseTimes: this.responseTimes.slice(-50), // Last 50 response times
        predictions: this.predictions.slice(-100), // Last 100 predictions
        errors: this.errors.slice(-50), // Last 50 errors
        lastRetrain: this.lastRetrain,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/save-performance-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData)
      });

      if (response.ok) {
        console.log('✅ [PERFORMANCE DEBUG] Performance data saved successfully');
        return true;
      } else {
        console.error('❌ [PERFORMANCE DEBUG] Failed to save performance data:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ [PERFORMANCE DEBUG] Error saving performance data:', error);
      return false;
    }
  }

  /**
   * Load performance data from backend
   */
  async loadPerformanceData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/performance-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.performanceData) {
          this.responseTimes = data.performanceData.responseTimes || [];
          this.predictions = data.performanceData.predictions || [];
          this.errors = data.performanceData.errors || [];
          this.lastRetrain = data.performanceData.lastRetrain;
          console.log('✅ [PERFORMANCE DEBUG] Performance data loaded successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ [PERFORMANCE DEBUG] Error loading performance data:', error);
      return false;
    }
  }
}

// Create global instance
const performanceTracker = new PerformanceTracker();

// Export functions for use in other modules
export const trackAIResponse = (startTime, endTime, modelName) => {
  return performanceTracker.trackResponseTime(startTime, endTime, modelName);
};

export const trackAIPrediction = (prediction, actualOutcome, modelName, confidence) => {
  return performanceTracker.trackPrediction(prediction, actualOutcome, modelName, confidence);
};

export const trackAIError = (error, modelName, context) => {
  performanceTracker.trackError(error, modelName, context);
};

export const getPerformanceMetrics = () => {
  return performanceTracker.getPerformanceMetrics();
};

export const savePerformanceData = () => {
  return performanceTracker.savePerformanceData();
};

export const loadPerformanceData = () => {
  return performanceTracker.loadPerformanceData();
};

export const setLastRetrain = (date) => {
  performanceTracker.setLastRetrain(date);
};

export default performanceTracker;
