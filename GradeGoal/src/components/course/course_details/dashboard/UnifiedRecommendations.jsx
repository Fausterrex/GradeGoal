// ========================================
// UNIFIED RECOMMENDATIONS COMPONENT
// ========================================
// Consolidated component that combines basic recommendations and smart analytics-based recommendations

import React, { useState, useMemo } from "react";
// Removed AnalyticsService import

function UnifiedRecommendations({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  userAnalytics 
}) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());

  // Remove calculation functions - return basic recommendations
  const basicRecommendations = useMemo(() => {
    const recommendations = [];
    
    // Simple static recommendation
    recommendations.push({
      id: 'general-study',
      type: 'study_strategy',
      priority: 'medium',
      title: 'Keep Up the Good Work',
      message: 'Continue with your current study routine and stay focused on your goals.',
      action: 'study_focus'
    });

    return recommendations;
  }, []);

  // Get smart recommendations from analytics service
  const smartRecommendations = useMemo(() => {
    if (!userAnalytics || !course) return [];
    return []; // Removed analytics recommendations
  }, [userAnalytics, course, categories]);

  // Combine and deduplicate recommendations
  const allRecommendations = useMemo(() => {
    const combined = [...basicRecommendations, ...smartRecommendations];
    
    // Remove duplicates based on similar titles/messages
    const unique = [];
    const seen = new Set();
    
    combined.forEach(rec => {
      const key = `${rec.type}-${rec.title.toLowerCase().replace(/\s+/g, '-')}`;
      if (!seen.has(key) && !dismissedRecommendations.has(rec.id)) {
        seen.add(key);
        unique.push(rec);
      }
    });

    // Sort by priority
    return unique.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [basicRecommendations, smartRecommendations, dismissedRecommendations]);

  const dismissRecommendation = (id) => {
    setDismissedRecommendations(prev => new Set([...prev, id]));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study_strategy': return '📚';
      case 'time_management': return '⏰';
      case 'goal_achievement': return '🎯';
      case 'performance': return '📊';
      default: return '💡';
    }
  };

  const getActionButton = (action, title) => {
    switch (action) {
      case 'study_focus':
        return (
          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Focus Study
          </button>
        );
      case 'study_method_review':
        return (
          <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Review Methods
          </button>
        );
      case 'deadline_management':
        return (
          <button className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
            Manage Deadlines
          </button>
        );
      case 'goal_review':
        return (
          <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Review Goals
          </button>
        );
      default:
        return (
          <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Learn More
          </button>
        );
    }
  };

  if (allRecommendations.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <span className="text-4xl text-green-500">✅</span>
          <p className="text-gray-700 mt-2 font-medium">Great job!</p>
          <p className="text-gray-500">You're on track with your studies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
        </div>
        <p className="text-sm text-gray-600">
          Personalized study suggestions based on your performance data
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {allRecommendations.map((recommendation, index) => (
          <div 
            key={index}
            className={`rounded border p-4 ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                      recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation.message}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {getActionButton(recommendation.action, recommendation.title)}
                <button
                  onClick={() => dismissRecommendation(recommendation.id)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dismiss
                </button>
                {recommendation.categories && (
                  <div className="text-xs text-gray-500">
                    {recommendation.categories.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded border border-blue-200 p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          Study Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">📚 Spaced Repetition</div>
            <div>Review material at increasing intervals to improve retention</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">⏰ Pomodoro Technique</div>
            <div>Study in 25-minute focused sessions with 5-minute breaks</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">🎯 Active Recall</div>
            <div>Test yourself instead of just re-reading notes</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">📝 Practice Problems</div>
            <div>Solve problems similar to what you'll see on exams</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedRecommendations;
