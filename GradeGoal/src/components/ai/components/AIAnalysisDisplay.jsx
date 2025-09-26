// ========================================
// AI ANALYSIS DISPLAY COMPONENT
// ========================================
// Displays the new AI analysis format with focus indicators, score predictions, and achievement probability

import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  BookOpen,
  Calendar,
  BarChart3
} from 'lucide-react';
import AIFocusIndicator from './AIFocusIndicator';
import AIScorePrediction from './AIScorePrediction';
import AIAchievementProbability from './AIAchievementProbability';

const AIAnalysisDisplay = ({ analysisData, showFocusIndicators = true, showScorePredictions = true, showAchievementProbability = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!analysisData) return null;

  const parseAnalysisContent = (content) => {
    try {
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('Failed to parse analysis content:', error);
      return null;
    }
  };

  const content = parseAnalysisContent(analysisData.content);
  if (!content) return null;

  // Expose AI analysis data for use in other components
  const getFocusIndicators = () => content.focusIndicators || {};
  const getScorePredictions = () => content.scorePredictions || {};
  const getAchievementProbability = () => content.achievementProbability || {};
  const getRecommendations = () => content.recommendations || {};
  const getStudyStrategy = () => content.studyStrategy || {};

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {analysisData.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                  AI Generated
                </span>
                <span className="text-xs text-gray-500">
                  Confidence: {Math.round((analysisData.aiConfidence || 0.85) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Focus Indicators */}
          {content.focusIndicators && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Focus Indicators</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(content.focusIndicators).map(([category, data]) => (
                  <div key={category} className={`p-3 rounded-lg border-2 ${
                    data.needsAttention ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">{category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        data.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                        data.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {data.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{data.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Predictions */}
          {content.scorePredictions && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Score Predictions</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(content.scorePredictions).map(([category, data]) => (
                  <div key={category} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {data.neededScore}
                      </div>
                      <div className="text-sm text-gray-600 mb-2 capitalize">{category}</div>
                      <div className={`text-xs font-semibold ${getConfidenceColor(data.confidence)}`}>
                        {data.confidence} Confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement Probability */}
          {content.achievementProbability && (
            <div className={`p-4 rounded-lg ${
              parseFloat(content.achievementProbability.probability) >= 70 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                : parseFloat(content.achievementProbability.probability) >= 40
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50'
                : 'bg-gradient-to-r from-red-50 to-pink-50'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Achievement Probability</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    parseFloat(content.achievementProbability.probability) >= 70 ? 'text-green-600' :
                    parseFloat(content.achievementProbability.probability) >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {content.achievementProbability.probability}
                  </div>
                  <div className="text-sm text-gray-600">Success Probability</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getConfidenceColor(content.achievementProbability.confidence)}`}>
                    {content.achievementProbability.confidence} Confidence
                  </div>
                  <div className="text-sm text-gray-600">Prediction Reliability</div>
                </div>
              </div>
              {content.achievementProbability.factors && content.achievementProbability.factors.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Key Factors:</h5>
                  <ul className="space-y-1">
                    {content.achievementProbability.factors.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {content.recommendations && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">Category Recommendations</h4>
              </div>
              <div className="space-y-3">
                {Object.entries(content.recommendations).map(([category, recommendation]) => (
                  <div key={category} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="font-medium text-gray-900 capitalize mb-2">{category}</div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
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
                      {content.studyStrategy.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
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
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Generated: {analysisData.createdAt ? new Date(analysisData.createdAt).toLocaleDateString() : 'Just now'}
        </span>
        <span className="text-xs text-gray-500">
          Model: {analysisData.aiModel || 'gemini-2.0-flash-exp'}
        </span>
      </div>
    </div>
  );
};

export default AIAnalysisDisplay;
