import React, { useState, useEffect } from "react";
import { Brain, Activity, CheckCircle2, RefreshCw } from "lucide-react";

const AIPrediction = () => {
  const [predictionData, setPredictionData] = useState({
    accuracy: 0,
    totalPredictions: 0,
    modelConfidence: 0,
    trend: 0,
    performanceMetrics: {}
  });
  const [loading, setLoading] = useState(false);

  // Function to fetch AI prediction statistics from backend
  const fetchAIPredictionStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/courses/ai-prediction-stats');
      if (response.ok) {
        const data = await response.json();
        
        setPredictionData({
          accuracy: data.accuracy || 0,
          totalPredictions: data.totalPredictions || 0,
          modelConfidence: data.modelConfidence || 0,
          trend: data.trend || 0, // Now using real trend data from backend
          performanceMetrics: data.performanceMetrics || {}
        });
        
        console.log('📊 AI Prediction Stats loaded:', data);
      } else {
        console.error('Failed to fetch AI prediction stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching AI prediction statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIPredictionStats();
  }, []);

  return (
    <div className="p-8 min-w-11/12 min-h-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-[#3C2363]">
          AI & Predictions Overview
        </h1>
        <button
          onClick={fetchAIPredictionStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Brain size={28} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Prediction Accuracy</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {predictionData.accuracy}%
              </p>
              <p className="text-xs text-gray-400">Based on user ratings (1-10)</p>
            </div>
          </div>
          <p className={`font-semibold text-sm ${
            predictionData.trend > 0 ? 'text-green-500' : 
            predictionData.trend < 0 ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {predictionData.trend > 0 ? '+' : ''}{predictionData.trend}%
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity size={28} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Predictions</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {predictionData.totalPredictions.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">Rated by users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle2 size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Model Confidence</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {predictionData.modelConfidence}%
              </p>
              <p className="text-gray-400 text-sm">Avg confidence</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Model Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">MSE</p>
              <p className="text-lg font-semibold">
                {predictionData.performanceMetrics?.mse || '0.0000'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Last Retrain</p>
              <p className="text-lg font-semibold">
                {predictionData.performanceMetrics?.lastRetrain || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-lg font-semibold">
                {predictionData.performanceMetrics?.avgResponseTime || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-lg font-semibold">
                {predictionData.performanceMetrics?.successRate || '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrediction;
