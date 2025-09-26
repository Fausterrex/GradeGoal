// ========================================
// AI RECOMMENDATION CARD COMPONENT
// ========================================
// Displays individual AI-generated recommendations

import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

const AIRecommendationCard = ({ recommendation, onDismiss, onMarkRead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      await onDismiss(recommendation.id);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async () => {
    if (!recommendation.isRead) {
      setIsLoading(true);
      try {
        await onMarkRead(recommendation.id);
      } catch (error) {
        console.error('Error marking as read:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM': return <Clock className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const parseRecommendationContent = (content) => {
    try {
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      return { error: 'Failed to parse recommendation content' };
    }
  };

  const content = parseRecommendationContent(recommendation.content);

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
      recommendation.isRead ? 'opacity-75' : 'opacity-100'
    } ${getPriorityColor(recommendation.priority)}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {recommendation.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                  {getPriorityIcon(recommendation.priority)}
                  <span className="ml-1">{recommendation.priority}</span>
                </span>
                <span className="text-xs text-gray-500">
                  AI Generated
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            {!recommendation.isRead && (
              <button
                onClick={handleMarkRead}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : 'Mark Read'}
              </button>
            )}
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Predicted Final Grade */}
          {content.predictedFinalGrade && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Predicted Final Grade</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {content.predictedFinalGrade.percentage || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {content.predictedFinalGrade.gpa || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">GPA</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    content.predictedFinalGrade.confidence === 'HIGH' ? 'text-green-600' :
                    content.predictedFinalGrade.confidence === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {content.predictedFinalGrade.confidence || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
              {content.predictedFinalGrade.reasoning && (
                <p className="mt-3 text-sm text-gray-700">
                  {content.predictedFinalGrade.reasoning}
                </p>
              )}
            </div>
          )}

          {/* Assessment Recommendations */}
          {content.assessmentRecommendations && content.assessmentRecommendations.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Assessment Recommendations</h4>
              </div>
              <div className="space-y-3">
                {content.assessmentRecommendations.map((rec, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{rec.category}</span>
                      <span className="text-sm font-semibold text-green-600">
                        {rec.recommendedGrade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{rec.reasoning}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Goal Probability */}
          {content.targetGoalProbability && (
            <div className={`p-4 rounded-lg ${
              content.targetGoalProbability.achievable 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                : 'bg-gradient-to-r from-red-50 to-pink-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Target className={`w-5 h-5 ${
                  content.targetGoalProbability.achievable ? 'text-green-600' : 'text-red-600'
                }`} />
                <h4 className="font-semibold text-gray-900">Goal Achievement Probability</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className={`text-3xl font-bold ${
                    content.targetGoalProbability.achievable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {content.targetGoalProbability.probability || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Achievement Probability</div>
                </div>
                <div>
                  <div className={`text-lg font-semibold ${
                    content.targetGoalProbability.achievable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {content.targetGoalProbability.achievable ? 'Achievable' : 'Challenging'}
                  </div>
                  <div className="text-sm text-gray-600">Goal Status</div>
                </div>
              </div>
              {content.targetGoalProbability.requiredGrades && (
                <p className="mt-3 text-sm text-gray-700">
                  <strong>Required Grades:</strong> {content.targetGoalProbability.requiredGrades}
                </p>
              )}
              {content.targetGoalProbability.recommendations && (
                <p className="mt-2 text-sm text-gray-700">
                  <strong>Recommendations:</strong> {content.targetGoalProbability.recommendations}
                </p>
              )}
            </div>
          )}

          {/* Status Update */}
          {content.statusUpdate && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Status Update</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-900">Current Status: </span>
                  <span className="text-gray-700">{content.statusUpdate.currentStatus}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Trend: </span>
                  <span className={`font-semibold ${
                    content.statusUpdate.trend === 'improving' ? 'text-green-600' :
                    content.statusUpdate.trend === 'declining' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {content.statusUpdate.trend}
                  </span>
                </div>
                {content.statusUpdate.keyInsights && content.statusUpdate.keyInsights.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900">Key Insights:</span>
                    <ul className="mt-1 space-y-1">
                      {content.statusUpdate.keyInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Study Habits */}
          {content.studyHabits && content.studyHabits.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">Study Habit Recommendations</h4>
              </div>
              <div className="space-y-3">
                {content.studyHabits.map((habit, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{habit.habit}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        habit.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                        habit.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {habit.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{habit.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error handling */}
          {content.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-600 text-sm">{content.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Generated: {new Date(recommendation.createdAt).toLocaleDateString()}
        </span>
        {recommendation.expiresAt && (
          <span className="text-xs text-gray-500">
            Expires: {new Date(recommendation.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationCard;
