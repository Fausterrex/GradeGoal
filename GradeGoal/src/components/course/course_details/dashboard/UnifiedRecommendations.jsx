// ========================================
// UNIFIED RECOMMENDATIONS COMPONENT
// ========================================
// Consolidated component that displays AI-generated recommendations

import React, { useState, useEffect, useMemo } from "react";
import { getAIRecommendations } from "../../../ai/services/geminiService";
import { loadAIAnalysisForCourse } from "../../../ai/services/aiAnalysisService";
import { useAuth } from "../../../../context/AuthContext";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Calendar,
  BarChart3
} from 'lucide-react';

function UnifiedRecommendations({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  userAnalytics,
  refreshTrigger = 0
}) {
  const { currentUser } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load AI analysis and recommendations when component mounts or course changes
  useEffect(() => {
    const loadAIData = async () => {
      if (!course?.id || !currentUser?.uid) return;

      setLoading(true);
      setError(null);

      try {
        // First, load AI analysis data (which will be saved to database)
        const { getUserProfile } = await import('../../../../backend/api');
        const userProfile = await getUserProfile(currentUser.email);
        
        if (userProfile?.userId && course?.id) {
          await loadAIAnalysisForCourse(userProfile.userId, course.id);
        }

        // Then load recommendations
        const recommendations = await getAIRecommendations(course.userId, course.id);
        setAiRecommendations(recommendations);
      } catch (err) {
        console.error('Error loading AI data:', err);
        setError('Failed to load AI recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadAIData();
  }, [course?.id, course?.userId, currentUser?.uid, refreshTrigger]);

  const handleDismissRecommendation = async (recommendationId) => {
    try {
      // For now, we'll just update the local state without calling the backend
      // This avoids the database connection issues
      console.log('Simulating recommendation dismissal for ID:', recommendationId);
      
      // Remove from local state
      setAiRecommendations(prev => 
        prev.filter(rec => rec.recommendationId !== recommendationId)
      );
    } catch (err) {
      console.error('Error dismissing recommendation:', err);
    }
  };

  const handleQuickAction = (actionType, recommendationTitle) => {
    console.log('Quick action triggered:', { actionType, recommendationTitle });
    
    // Handle different action types
    switch (actionType) {
      case 'ADD_STUDY_SESSION':
        // TODO: Implement study session creation
        alert('Study session feature coming soon!');
        break;
      case 'REVIEW_RUBRICS':
        // TODO: Navigate to rubrics or show rubric information
        alert('Rubric review feature coming soon!');
        break;
      case 'SET_REMINDER':
        // TODO: Implement reminder setting
        alert('Reminder feature coming soon!');
        break;
      case 'PRACTICE_PROBLEMS':
        // TODO: Navigate to practice problems
        alert('Practice problems feature coming soon!');
        break;
      case 'REVIEW_NOTES':
        // TODO: Navigate to notes or show notes
        alert('Notes review feature coming soon!');
        break;
      default:
        console.log('Unknown action type:', actionType);
    }
  };

  const handleMarkAsRead = async (recommendationId) => {
    try {
      // For now, we'll just update the local state without calling the backend
      // This avoids the database connection issues
      console.log('Simulating recommendation mark as read for ID:', recommendationId);
      
      // Update local state
      setAiRecommendations(prev => 
        prev.map(rec => 
          rec.recommendationId === recommendationId 
            ? { ...rec, isRead: true }
            : rec
        )
      );
    } catch (err) {
      console.error('Error marking recommendation as read:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="text-center py-6">
          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Academic Insights</h3>
          <p className="text-gray-600 text-sm">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
        <div className="text-center py-6">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Academic Insights</h3>
          <p className="text-gray-700 text-sm font-medium mb-1">Error loading recommendations</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (aiRecommendations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="text-center py-6">
          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Academic Insights</h3>
          <p className="text-gray-600 text-sm mb-3">No insights available yet</p>
          <p className="text-gray-500 text-xs">
            Use the AI Analysis button in your goals to generate personalized academic recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Recommendations List */}
      <div className="space-y-4">
        {aiRecommendations.map((recommendation, index) => {
          // Check if this is the new AI analysis format
          if (recommendation.recommendationType === 'AI_ANALYSIS' && recommendation.content) {
            try {
              // Handle malformed JSON content
              let content;
              if (typeof recommendation.content === 'string') {
                try {
                  content = JSON.parse(recommendation.content);
                } catch (parseError) {
                  console.warn('Failed to parse AI recommendation content:', parseError.message);
                  // Skip this recommendation if JSON is malformed
                  return null;
                }
              } else {
                content = recommendation.content;
              }
              // If it has the new format structure, render inline
              if (content.focusIndicators || content.scorePredictions || content.achievementProbability) {
                return (
                  <div key={recommendation.recommendationId || `ai-analysis-${index}`} className="space-y-4">
                    {/* Clean AI Analysis Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            AI Academic Insights
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                              AI Generated
                            </span>
                            <span className="text-xs text-gray-500">
                              Confidence: {Math.round((recommendation.aiConfidence || 0.85) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {recommendation.createdAt ? new Date(recommendation.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        Personalized recommendations based on your current academic performance
                      </p>
                    </div>

                    {/* Top Priority Recommendations */}
                    {content.topPriorityRecommendations && content.topPriorityRecommendations.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-4">
                          <Target className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">Top Priority Recommendations</h4>
                        </div>
                        <div className="space-y-4">
                          {content.topPriorityRecommendations.map((rec, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                                      rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                                      'bg-green-100 text-green-600'
                                    }`}>
                                      {rec.priority}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.category === 'COURSE_SPECIFIC' ? 'bg-blue-100 text-blue-600' :
                                      'bg-purple-100 text-purple-600'
                                    }`}>
                                      {rec.category === 'COURSE_SPECIFIC' ? 'Course-Specific' : 'General Academic'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                                  <p className="text-xs text-gray-500">Impact: {rec.impact}</p>
                                </div>
                              </div>
                              {rec.actionButton && rec.actionButton.enabled && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleQuickAction(rec.actionButton.action, rec.title)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    {rec.actionButton.text}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Study Strategy */}
                    {content.studyStrategy && (
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-4">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">Study Strategy</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Focus Area:</h5>
                            <p className="text-sm text-gray-700">{content.studyStrategy.focus}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Recommended Schedule:</h5>
                            <p className="text-sm text-gray-700">{content.studyStrategy.schedule}</p>
                          </div>
                          {content.studyStrategy.tips && content.studyStrategy.tips.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Study Tips:</h5>
                              <ul className="space-y-1">
                                {content.studyStrategy.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-sm text-gray-700 flex items-start">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Compact Footer */}
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <span className="text-xs text-gray-500">
                        Model: {recommendation.aiModel || 'gemini-2.0-flash-exp'}
                      </span>
                    </div>
                  </div>
                );
              }
            } catch (error) {
              console.error('Error parsing recommendation content:', error);
              // Skip malformed recommendations instead of showing error
              return null;
            }
          }
          
          // Handle other recommendation formats with a simple card
          return (
            <div key={recommendation.recommendationId || `recommendation-${index}`} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{recommendation.title || 'Recommendation'}</h4>
                  <p className="text-sm text-gray-700 mb-3">{recommendation.content || recommendation.description || 'No content available'}</p>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                      {recommendation.recommendationType || 'GENERAL'}
                    </span>
                    {recommendation.priority && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                        recommendation.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {recommendation.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {handleMarkAsRead && (
                    <button
                      onClick={() => handleMarkAsRead(recommendation.recommendationId)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {handleDismissRecommendation && (
                    <button
                      onClick={() => handleDismissRecommendation(recommendation.recommendationId)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Dismiss"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UnifiedRecommendations;