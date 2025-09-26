import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

const AIAssessmentPrediction = ({ 
  assessment, 
  course, 
  userId, 
  targetGrade
}) => {
  const [prediction, setPrediction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);



  if (!prediction) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'HIGH': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'MEDIUM': return <AlertCircle className="w-3 h-3 text-yellow-600" />;
      case 'LOW': return <AlertCircle className="w-3 h-3 text-red-600" />;
      default: return <Info className="w-3 h-3 text-gray-600" />;
    }
  };

  return (
    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI Prediction</span>
          <div className={`flex items-center gap-1 text-xs ${getConfidenceColor(prediction.confidenceLevel)}`}>
            {getConfidenceIcon(prediction.confidenceLevel)}
            {prediction.confidenceLevel}
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Predicted Score:</span>
          <span className="font-medium text-blue-700">
            {prediction.predictedPercentage}%
          </span>
        </div>
        
        {prediction.recommendedScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Recommended:</span>
            <span className="font-medium text-green-700">
              {prediction.recommendedPercentage}%
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 pt-2 border-t border-blue-200">
          <div className="text-xs text-gray-600 mb-2">
            <strong>AI Analysis:</strong>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed">
            {prediction.analysisReasoning}
          </div>
          
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
            <Target className="w-3 h-3" />
            <span>Target GPA: {targetGrade}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssessmentPrediction;
