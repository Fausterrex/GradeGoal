// ========================================
// AI ACHIEVEMENT PROBABILITY COMPONENT
// ========================================
// Shows AI-calculated achievement probability

import React from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const AIAchievementProbability = ({ probability, confidence, factors = [], bestPossibleGPA, isVisible = true, isCompact = false }) => {
  if (!isVisible || !probability) return null;

  const probabilityValue = typeof probability === 'string' ? parseFloat(probability.replace('%', '')) : probability;
  
  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (prob >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceColor = (conf) => {
    switch (conf) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProbabilityIcon = (prob) => {
    if (prob >= 70) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (prob >= 40) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className={`${isCompact ? 'p-4' : 'p-6'} rounded-xl border-2 ${getProbabilityColor(probabilityValue)} shadow-lg`}>
      <div className={`flex items-center space-x-4 ${isCompact ? 'mb-4' : 'mb-6'}`}>
        {getProbabilityIcon(probabilityValue)}
        <div>
          <h4 className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>AI GPA Goal Probability</h4>
          {!isCompact && (
            <p className="text-base text-gray-600 mt-1">Based on current performance and remaining assessments</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Main Probability Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Target className="w-6 h-6 text-gray-600" />
            <span className="text-lg font-semibold text-gray-700">Success Probability</span>
          </div>
          
          {/* Large Progress Bar */}
          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-500 ease-out shadow-sm ${
                  probabilityValue >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  probabilityValue >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${Math.min(probabilityValue, 100)}%` }}
              ></div>
            </div>
            {/* Progress percentage overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getProbabilityColor(probabilityValue).split(' ')[0]} drop-shadow-sm`}>
                {probabilityValue}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Best Possible GPA Display */}
        {bestPossibleGPA && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-blue-700 mb-1">Best Possible GPA</div>
            <div className="text-3xl font-bold text-blue-600">
              {bestPossibleGPA}
            </div>
            <div className="text-xs text-blue-600 mt-1">With perfect performance on remaining assessments</div>
          </div>
        )}
      </div>
      
      {factors && factors.length > 0 && !isCompact && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-base font-semibold text-gray-700 mb-3">Key Factors:</div>
          <ul className="text-sm text-gray-600 space-y-2">
            {factors.map((factor, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAchievementProbability;