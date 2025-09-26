// ========================================
// AI ACHIEVEMENT PROBABILITY COMPONENT
// ========================================
// Shows AI-calculated achievement probability

import React from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const AIAchievementProbability = ({ probability, confidence, factors = [], isVisible = true, isCompact = false }) => {
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
    <div className={`${isCompact ? 'p-3' : 'p-4'} rounded-lg border ${getProbabilityColor(probabilityValue)}`}>
      <div className={`flex items-center space-x-3 ${isCompact ? 'mb-2' : 'mb-3'}`}>
        {getProbabilityIcon(probabilityValue)}
        <div>
          <h4 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>AI Achievement Probability</h4>
          {!isCompact && (
            <p className="text-sm text-gray-600">Based on current performance and remaining assessments</p>
          )}
        </div>
      </div>
      
      <div className={`flex items-center ${isCompact ? 'space-x-3' : 'space-x-4'}`}>
        <div className="flex-1">
          <div className={`flex items-center space-x-2 ${isCompact ? 'mb-1' : 'mb-2'}`}>
            <Target className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} />
            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>Success Probability</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex-1 bg-gray-200 rounded-full ${isCompact ? 'h-1.5' : 'h-2'}`}>
              <div
                className={`${isCompact ? 'h-1.5' : 'h-2'} rounded-full transition-all duration-300 ${
                  probabilityValue >= 70 ? 'bg-green-500' :
                  probabilityValue >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(probabilityValue, 100)}%` }}
              ></div>
            </div>
            <span className={`${isCompact ? 'text-sm' : 'text-lg'} font-bold ${getProbabilityColor(probabilityValue).split(' ')[0]}`}>
              {probabilityValue}%
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-600`}>Confidence</div>
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold ${getConfidenceColor(confidence)}`}>
            {confidence || 'MEDIUM'}
          </div>
        </div>
      </div>
      
      {factors && factors.length > 0 && !isCompact && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Key Factors:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            {factors.map((factor, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
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