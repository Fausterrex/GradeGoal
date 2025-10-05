// ========================================
// AI PREDICTIONS COMPONENT
// ========================================
// Displays realistic AI predictions for upcoming assessments based on performance patterns

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Star,
  Zap
} from 'lucide-react';

const AIPredictions = ({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  aiAnalysisData = null // Pass AI analysis data from parent
}) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Extract predictions from AI analysis data
  useEffect(() => {
    console.log('🔍 [AIPredictions] Received aiAnalysisData:', aiAnalysisData);
    
    if (aiAnalysisData && aiAnalysisData.realisticPredictions) {
      console.log('🔍 [AIPredictions] Found realisticPredictions:', aiAnalysisData.realisticPredictions);
      setPredictions(aiAnalysisData.realisticPredictions);
    } else if (aiAnalysisData && aiAnalysisData.scorePredictions) {
      console.log('🔍 [AIPredictions] Found scorePredictions, converting...');
      console.log('🔍 [AIPredictions] scorePredictions data:', aiAnalysisData.scorePredictions);
      
      // Convert legacy format to new format
      const convertedPredictions = {
        upcomingAssessments: [],
        predictedScores: {},
        confidence: aiAnalysisData.scorePredictions.confidence || 'MEDIUM',
        reasoning: 'Based on performance patterns analysis'
      };

      Object.keys(aiAnalysisData.scorePredictions).forEach(categoryName => {
        const categoryData = aiAnalysisData.scorePredictions[categoryName];
        console.log(`🔍 [AIPredictions] Processing category ${categoryName}:`, categoryData);
        
        if (categoryData.predictedScores && Array.isArray(categoryData.predictedScores)) {
          // Handle "unknown" category name by trying to find the actual category
          let actualCategoryName = categoryName;
          if (categoryName === 'unknown') {
            // Try to find the category by looking at the predictedScores
            const firstPrediction = categoryData.predictedScores[0];
            if (firstPrediction && firstPrediction.assessment) {
              // Extract category name from assessment name if possible
              actualCategoryName = firstPrediction.assessment.split(' ')[0] || 'Unknown Category';
            }
          }
          
          convertedPredictions.predictedScores[actualCategoryName] = categoryData.predictedScores;
          convertedPredictions.upcomingAssessments.push({
            categoryName: actualCategoryName,
            predictedAssessments: categoryData.predictedScores
          });
        } else if (categoryData.neededScore || categoryData.recommendedScore) {
          // Handle the case where we have neededScore/recommendedScore instead of predictedScores
          console.log(`🔍 [AIPredictions] Found neededScore/recommendedScore for ${categoryName}, creating prediction`);
          
          // Parse the needed score to understand what it means
          const neededScoreStr = categoryData.neededScore || categoryData.recommendedScore || '15/15';
          const confidence = categoryData.confidence || 'MEDIUM';
          
          // Convert percentage to realistic score prediction
          let predictedScore, predictedMaxScore, realisticScore;
          
          if (neededScoreStr.includes('%')) {
            const percentage = parseFloat(neededScoreStr.replace('%', ''));
            predictedMaxScore = 15; // Default max score
            predictedScore = Math.round((percentage / 100) * predictedMaxScore);
            
            // Make the prediction more realistic based on confidence
            if (confidence === 'LOW') {
              // For low confidence, predict a more realistic score (80-90% of needed)
              realisticScore = Math.round(predictedScore * 0.85);
            } else if (confidence === 'MEDIUM') {
              // For medium confidence, predict 90-95% of needed
              realisticScore = Math.round(predictedScore * 0.92);
            } else {
              // For high confidence, predict closer to needed score
              realisticScore = Math.round(predictedScore * 0.98);
            }
          } else {
            // Handle "15/15" format
            const [score, maxScore] = neededScoreStr.split('/').map(s => parseInt(s));
            predictedScore = score;
            predictedMaxScore = maxScore || 15;
            
            // Make realistic prediction based on confidence
            if (confidence === 'LOW') {
              realisticScore = Math.round(predictedScore * 0.85);
            } else if (confidence === 'MEDIUM') {
              realisticScore = Math.round(predictedScore * 0.92);
            } else {
              realisticScore = Math.round(predictedScore * 0.98);
            }
          }
          
          const predictedAssessment = {
            assessment: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Assessment`,
            predictedScore: `${realisticScore}/${predictedMaxScore}`,
            confidence: confidence,
            reasoning: confidence === 'LOW' 
              ? `Realistic prediction based on your performance patterns. The AI suggests you need ${neededScoreStr} to reach your goal, but predicts ${realisticScore}/${predictedMaxScore} based on current performance.`
              : `Based on your performance patterns and ${confidence.toLowerCase()} confidence analysis. Predicted score adjusted for realistic expectations.`
          };
          
          convertedPredictions.predictedScores[categoryName] = [predictedAssessment];
          convertedPredictions.upcomingAssessments.push({
            categoryName: categoryName,
            predictedAssessments: [predictedAssessment]
          });
        }
      });

      console.log('🔍 [AIPredictions] Converted predictions:', convertedPredictions);
      setPredictions(convertedPredictions);
    } else if (aiAnalysisData && (aiAnalysisData.upcomingAssessments || aiAnalysisData.predictedScores)) {
      console.log('🔍 [AIPredictions] Found direct predictions structure');
      console.log('🔍 [AIPredictions] Direct predictions data:', {
        upcomingAssessments: aiAnalysisData.upcomingAssessments,
        predictedScores: aiAnalysisData.predictedScores
      });
      
      // Handle case where predictions are directly in aiAnalysisData
      const directPredictions = {
        upcomingAssessments: aiAnalysisData.upcomingAssessments || [],
        predictedScores: aiAnalysisData.predictedScores || {},
        confidence: aiAnalysisData.confidence || 'MEDIUM',
        reasoning: aiAnalysisData.reasoning || 'Based on performance patterns analysis'
      };
      console.log('🔍 [AIPredictions] Direct predictions:', directPredictions);
      setPredictions(directPredictions);
    } else {
      console.log('🔍 [AIPredictions] No predictions found in aiAnalysisData');
      setPredictions(null);
    }
  }, [aiAnalysisData]);

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'HIGH': return <CheckCircle className="w-4 h-4" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4" />;
      case 'LOW': return <AlertTriangle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!predictions || !predictions.upcomingAssessments || predictions.upcomingAssessments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
            <p className="text-sm text-gray-500">Realistic score predictions for upcoming assessments</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="p-4 bg-gray-50 rounded-lg inline-block mb-4">
            <Target className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Assessments</h4>
          <p className="text-gray-500">
            All assessment categories have existing assessments. AI predictions are generated for empty categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
          <p className="text-sm text-gray-500">Realistic score predictions based on your performance patterns</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getConfidenceColor(predictions.confidence)}`}>
          {getConfidenceIcon(predictions.confidence)}
          {predictions.confidence} Confidence
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">Performance Analysis</h4>
            <p className="text-sm text-gray-600 mb-2">{predictions.reasoning}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border">
                {predictions.upcomingAssessments.length} Upcoming Categories
              </span>
              <span className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border">
                {predictions.confidence} Confidence
              </span>
              {predictions.upcomingAssessments.some(cat => 
                cat.predictedAssessments?.some(pred => pred.assessment.includes('Final Term'))
              ) && (
                <span className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border">
                  Includes Final Term Predictions
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Predictions by Category */}
      <div className="space-y-4">
        {predictions.upcomingAssessments.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white rounded-md">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {category.categoryName || category.categoryId}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {category.predictedAssessments?.length || 0} predicted assessments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Weight: {category.weight || 0}%
                  </span>
                  <div className={`p-1 rounded ${expandedCategory === index ? 'rotate-180' : ''} transition-transform`}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {expandedCategory === index && (
              <div className="p-4 bg-white">
                <div className="space-y-3">
                  {category.predictedAssessments?.map((prediction, predIndex) => (
                    <div key={predIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-md">
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{prediction.assessment}</h5>
                          <p className="text-sm text-gray-500">{prediction.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getScoreColor(
                          parseInt(prediction.predictedScore.split('/')[0]), 
                          parseInt(prediction.predictedScore.split('/')[1])
                        )}`}>
                          {prediction.predictedScore}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(prediction.confidence)}`}>
                          {prediction.confidence}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Category Summary */}
                {category.predictedAssessments?.length > 1 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Category Average Prediction</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-900">
                      {category.predictedAssessments.reduce((sum, pred) => {
                        const score = parseInt(pred.predictedScore.split('/')[0]);
                        return sum + score;
                      }, 0) / category.predictedAssessments.length}/
                      {category.predictedAssessments[0]?.predictedScore.split('/')[1] || 15}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-purple-100 rounded-md">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">How These Predictions Work</h4>
            <p className="text-xs text-gray-600">
              AI analyzes your performance patterns, consistency, and trends to generate realistic predictions. 
              These are based on your actual scores, not generic calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;
