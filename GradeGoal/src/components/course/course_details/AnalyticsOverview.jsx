// ========================================
// ANALYTICS OVERVIEW COMPONENT
// ========================================
// Displays key analytics and performance insights

import React from "react";

function AnalyticsOverview({ userAnalytics, course }) {
  if (!userAnalytics) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
        <div className="text-center py-8">
          <span className="text-4xl text-gray-300">📊</span>
          <p className="text-gray-500 mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const performance_metrics = userAnalytics?.performance_metrics || {};
  const predictions = performance_metrics?.predictions || {};
  const statistics = performance_metrics?.statistics || {};

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-green-600';
    if (trend === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Grade */}
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900">
              {userAnalytics.current_grade?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-sm text-gray-600">Current Grade</div>
          </div>

          {/* Grade Trend */}
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
              <span>{getTrendIcon(predictions.gpa_trend)}</span>
              <span className={getTrendColor(predictions.gpa_trend)}>
                {predictions.gpa_trend || 'stable'}
              </span>
            </div>
            <div className="text-sm text-gray-600">Trend</div>
          </div>

          {/* Study Efficiency */}
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900">
              {performance_metrics?.study_efficiency?.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-gray-600">Study Efficiency</div>
          </div>

          {/* Completion Rate */}
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900">
              {performance_metrics?.assignment_completion_rate?.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && Object.keys(statistics).length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average */}
            <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
              <div className="text-xl font-bold text-blue-900">
                {statistics.average?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-blue-600">Average Score</div>
            </div>

            {/* Best */}
            <div className="text-center p-4 bg-green-50 rounded border border-green-200">
              <div className="text-xl font-bold text-green-900">
                {statistics.best?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-green-600">Best Score</div>
            </div>

            {/* Total Assignments */}
            <div className="text-center p-4 bg-purple-50 rounded border border-purple-200">
              <div className="text-xl font-bold text-purple-900">
                {statistics.total_assignments || 0}
              </div>
              <div className="text-sm text-purple-600">Total Assignments</div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions && Object.keys(predictions).length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Predictions & Insights</h4>
          
          <div className="space-y-4">
            {/* Final Grade Prediction */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded border">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="font-medium text-gray-900">Predicted Final Grade</div>
                  <div className="text-sm text-gray-600">Based on current performance</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {predictions.final_grade_prediction?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-sm text-gray-600">
                  {convertPercentageToGPA(predictions.final_grade_prediction || 0, course?.gpaScale || "4.0").toFixed(2)} GPA
                </div>
              </div>
            </div>

            {/* At-Risk Categories */}
            {predictions.at_risk_categories && predictions.at_risk_categories.length > 0 && (
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">⚠️</span>
                  <div className="font-medium text-red-900">At-Risk Categories</div>
                </div>
                <div className="text-sm text-red-700">
                  Focus more on: {predictions.at_risk_categories.join(', ')}
                </div>
              </div>
            )}

            {/* Positive Trend */}
            {predictions.gpa_trend === 'improving' && (
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📈</span>
                  <div>
                    <div className="font-medium text-green-900">Great Progress!</div>
                    <div className="text-sm text-green-700">Your performance is improving</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Performance */}
      {performance_metrics?.category_performance && Object.keys(performance_metrics.category_performance).length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h4>
          
          <div className="space-y-3">
            {Object.entries(performance_metrics?.category_performance || {}).map(([categoryName, data]) => (
              <div key={categoryName} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div>
                  <div className="font-medium text-gray-900">{categoryName}</div>
                  <div className="text-sm text-gray-600">
                    {data.count} assignments • {data.weight}% weight
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {data.average?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-sm text-gray-600">Average</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert percentage to GPA
function convertPercentageToGPA(percentage, gpaScale = "4.0") {
  const scale = parseFloat(gpaScale);
  return (percentage / 100) * scale;
}

export default AnalyticsOverview;
