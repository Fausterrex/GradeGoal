// ========================================
// AI FOCUS INDICATOR COMPONENT
// ========================================
// Shows AI focus indicators for assessment categories

import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Lightbulb, ChevronDown, ChevronUp, Target, TrendingUp, AlertCircle } from 'lucide-react';

const AIFocusIndicator = ({ categoryName, focusData, isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isVisible || !focusData) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        badge: 'bg-red-500 text-white',
        shadow: 'shadow-red-100'
      };
      case 'MEDIUM': return {
        bg: 'bg-gradient-to-r from-yellow-50 to-orange-100',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-500 text-white',
        shadow: 'shadow-yellow-100'
      };
      case 'LOW': return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-100',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
        badge: 'bg-green-500 text-white',
        shadow: 'shadow-green-100'
      };
      default: return {
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: 'text-gray-600',
        badge: 'bg-gray-500 text-white',
        shadow: 'shadow-gray-100'
      };
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
      case 'MEDIUM': return <Clock className="w-5 h-5" />;
      case 'LOW': return <CheckCircle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityMessage = (priority) => {
    switch (priority) {
      case 'HIGH': return 'Needs Immediate Attention';
      case 'MEDIUM': return 'Room for Improvement';
      case 'LOW': return 'Performing Well';
      default: return 'AI Analysis';
    }
  };

  const colors = getPriorityColor(focusData.priority);

  return (
    <div className={`mt-3 p-4 rounded-xl border-2 ${colors.bg} ${colors.border} ${colors.shadow} transition-all duration-300 hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
            {getPriorityIcon(focusData.priority)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                {focusData.priority} PRIORITY
              </span>
              <span className={`text-sm font-semibold ${colors.text}`}>
                {getPriorityMessage(focusData.priority)}
              </span>
            </div>
            <div className={`text-sm ${colors.text} mt-1`}>
              {categoryName} Category
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border hover:shadow-md transition-all duration-200`}
        >
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${colors.icon}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${colors.icon}`} />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/50">
          <div className="space-y-3">
            {/* AI Recommendation */}
            <div className="flex items-start space-x-3">
              <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                <Target className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${colors.text} mb-1`}>
                  AI Recommendation
                </div>
                <div className={`text-sm ${colors.text} opacity-90 leading-relaxed`}>
                  {focusData.reason}
                </div>
              </div>
            </div>

            {/* Action Items */}
            {focusData.actionItems && focusData.actionItems.length > 0 && (
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <TrendingUp className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${colors.text} mb-2`}>
                    Action Items
                  </div>
                  <ul className="space-y-1">
                    {focusData.actionItems.map((item, index) => (
                      <li key={index} className={`text-sm ${colors.text} opacity-90 flex items-start space-x-2`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Performance Insights */}
            {focusData.performanceInsights && (
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <AlertCircle className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${colors.text} mb-1`}>
                    Performance Insights
                  </div>
                  <div className={`text-sm ${colors.text} opacity-90 leading-relaxed`}>
                    {focusData.performanceInsights}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFocusIndicator;