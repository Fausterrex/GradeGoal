// ========================================
// AI PREDICTIONS COMPONENT
// ========================================
// Displays realistic AI predictions for upcoming assessments based on performance patterns

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
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
    if (!aiAnalysisData) {
      setPredictions(null);
      return;
    }
    
    if (aiAnalysisData && aiAnalysisData.realisticPredictions) {
      setPredictions(aiAnalysisData.realisticPredictions);
    } else if (aiAnalysisData && aiAnalysisData.scorePredictions) {
      // Converting scorePredictions to realisticPredictions format
      
      // Convert legacy format to new format
      const convertedPredictions = {
        upcomingAssessments: [],
        predictedScores: {},
        confidence: aiAnalysisData.scorePredictions.confidence || 'MEDIUM',
        reasoning: 'Based on performance patterns analysis'
      };

      // Get grades data from aiAnalysisData
      const grades = aiAnalysisData.grades;
      const categories = aiAnalysisData.categories;
      // Processing AI analysis data

      // Instead of relying on AI-generated category names, iterate through actual user categories
      categories.forEach(category => {
        const categoryName = category.categoryName || category.name;
        const categoryId = category.id;
        
        // Processing user category
        
        // Check if AI has predictions for this category (flexible matching)
        let categoryData = null;
        const aiCategoryKeys = Object.keys(aiAnalysisData.scorePredictions);
        
        // Try to find matching AI prediction data for this category
        for (const aiKey of aiCategoryKeys) {
          const aiKeyLower = aiKey.toLowerCase();
          const categoryNameLower = categoryName.toLowerCase();
          
          // Flexible matching - check if any significant words match
          const aiWords = aiKeyLower.split(/\s+/).filter(w => w.length > 2);
          const catWords = categoryNameLower.split(/\s+/).filter(w => w.length > 2);
          
          const hasMatch = aiWords.some(aiWord => 
            catWords.some(catWord => 
              aiWord === catWord || 
              (aiWord.length > 3 && catWord.length > 3 && 
               (aiWord.includes(catWord) || catWord.includes(aiWord)))
            )
          );
          
          if (hasMatch) {
            categoryData = aiAnalysisData.scorePredictions[aiKey];
            // Found matching AI data
            break;
          }
        }
        
        if (!categoryData) {
          return;
        }
        
        // Check if there are actually upcoming assessments for this category
        
        if (grades && grades[categoryId]) {
          const categoryGrades = grades[categoryId];
          // Assessment details for category
        }
        
        const hasUpcomingAssessments = grades && grades[categoryId] && 
          grades[categoryId].some(grade => {
            // Check multiple indicators for upcoming assessments
            const isScoreEmpty = grade.score === null || grade.score === undefined || grade.score === 0;
            const isPercentageEmpty = grade.percentage === null || grade.percentage === undefined || grade.percentage === 0;
            const isStatusPending = grade.status === 'PENDING' || grade.status === 'UPCOMING' || grade.status === null || grade.status === undefined;
            
            // Additional check: make sure the assessment is actually marked as upcoming in the UI
            const isActuallyUpcoming = grade.status === 'UPCOMING' || 
              (grade.score === null && grade.maxScore > 0) ||
              (grade.score === 0 && grade.maxScore > 0);
            
            return (isScoreEmpty || isPercentageEmpty || isStatusPending) && isActuallyUpcoming;
          });
        
        if (!hasUpcomingAssessments) {
          return; // Skip this category if no upcoming assessments
        }
        
        // Handle the actual data structure: {neededScore: '70%', confidence: 'MEDIUM'}
        if (categoryData.neededScore && categoryData.confidence) {
          // Converting category data
          
          // Convert percentage-based predictions to score format
          const neededScoreStr = categoryData.neededScore;
          const confidence = categoryData.confidence;
          
          let predictedScore = 0;
          let predictedMaxScore = 100; // Default max score
          
          if (neededScoreStr.includes('%')) {
            const percentage = parseFloat(neededScoreStr.replace('%', ''));
            // Converting percentage to score
            
            // Get actual maxScore from upcoming assessments in this category
            let actualMaxScore = null;
            
            // Look for maxScore in the upcoming assessments for this category
            if (grades && grades[categoryId]) {
              const categoryGrades = grades[categoryId];
              const upcomingGrades = categoryGrades.filter(grade => 
                grade.score === null || grade.score === undefined || grade.score === 0
              );
              
              if (upcomingGrades.length > 0) {
                // Use the maxScore from upcoming assessments, not completed ones
                const upcomingMaxScores = upcomingGrades.map(grade => grade.maxScore || grade.pointsPossible).filter(score => score > 0);
                if (upcomingMaxScores.length > 0) {
                  actualMaxScore = upcomingMaxScores[0]; // Use the first upcoming assessment's maxScore
                }
              }
            }
            
            // If no actual maxScore found, skip this category (no fallbacks/defaults)
            if (!actualMaxScore) {
              return; // Skip this category if no maxScore data available
            }
            
            // Check if user has perfect performance in this category
            let finalPercentage = percentage;
            if (grades && grades[categoryId]) {
              const categoryGrades = grades[categoryId];
              const completedGrades = categoryGrades.filter(grade => grade.score !== null && grade.score !== undefined && grade.score > 0);
              
              // Category analysis
              
              if (completedGrades.length > 0) {
                const averageScore = completedGrades.reduce((sum, grade) => sum + grade.score, 0) / completedGrades.length;
                const averageMaxScore = completedGrades.reduce((sum, grade) => sum + (grade.maxScore || grade.pointsPossible), 0) / completedGrades.length;
                const averagePercentage = (averageScore / averageMaxScore) * 100;
                
                // Category performance check
                
                // Check for perfect scores in the category
                const perfectScores = completedGrades.filter(grade => {
                  const maxScore = grade.maxScore || grade.pointsPossible;
                  return grade.score === maxScore && maxScore > 0;
                });
                
                // Perfect score analysis
                
                // If user has perfect performance (100%) in this category, override AI prediction
                if (averagePercentage >= 100) {
                  finalPercentage = 100;
                  // Overriding AI prediction to 100% due to perfect average performance
                } else if (perfectScores.length > 0 && perfectScores.length === completedGrades.length) {
                  // If ALL completed assessments are perfect, override AI prediction
                  finalPercentage = 100;
                  // Overriding AI prediction to 100% due to all completed assessments being perfect
                } else if (perfectScores.length > 0 && averagePercentage >= 90) {
                  // If user has some perfect scores and high average, consider overriding
                  finalPercentage = Math.max(percentage, 95); // At least 95% if they have perfect scores
                  // Boosting AI prediction due to perfect scores and high average
                }
              }
            }
            
            predictedScore = Math.round((finalPercentage / 100) * actualMaxScore);
            predictedMaxScore = actualMaxScore;
            
            // Converted percentage to score
            
            // Make the prediction more realistic based on confidence
            let realisticScore = predictedScore;
            
            // Don't apply "realistic" adjustments if we've already overridden for perfect performance
            if (finalPercentage === 100) {
              realisticScore = predictedScore; // Keep the perfect score
              // Keeping perfect score without realistic adjustment
            } else if (confidence === 'LOW') {
              // For low confidence, predict a more realistic score (80-90% of needed)
              realisticScore = Math.round(predictedScore * 0.85);
            } else if (confidence === 'MEDIUM') {
              // For medium confidence, predict 90-95% of needed
              realisticScore = Math.round(predictedScore * 0.92);
            } else {
              // For high confidence, predict closer to needed score
              realisticScore = Math.round(predictedScore * 0.98);
            }
            
            predictedScore = realisticScore; // Update the final score
          } else {
            // Handle "X/Y" format - use actual maxScore from assessment data
            const [score, maxScore] = neededScoreStr.split('/').map(s => parseInt(s));
            predictedScore = score;
            predictedMaxScore = maxScore; // Use actual maxScore from assessment data only
          }
          
          const predictedAssessment = {
            assessment: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Assessment`,
            predictedScore: `${predictedScore}/${predictedMaxScore}`,
            confidence: confidence,
            reasoning: confidence === 'LOW' 
              ? `Realistic prediction based on your performance patterns. The AI suggests you need ${neededScoreStr} to reach your goal, but predicts ${predictedScore}/${predictedMaxScore} based on current performance.`
              : `Based on your performance patterns and ${confidence.toLowerCase()} confidence analysis. Predicted score adjusted for realistic expectations.`
          };
          
          // Created prediction for category
          
          convertedPredictions.predictedScores[categoryName] = [predictedAssessment];
          convertedPredictions.upcomingAssessments.push({
            categoryName: categoryName,
            predictedAssessments: [predictedAssessment]
          });
        }
      });

      // Conversion complete
      setPredictions(convertedPredictions);
    } else if (aiAnalysisData && (aiAnalysisData.upcomingAssessments || aiAnalysisData.predictedScores)) {
      // Handle case where predictions are directly in aiAnalysisData
      const directPredictions = {
        upcomingAssessments: aiAnalysisData.upcomingAssessments || [],
        predictedScores: aiAnalysisData.predictedScores || {},
        confidence: aiAnalysisData.confidence || 'MEDIUM',
        reasoning: aiAnalysisData.reasoning || 'Based on performance patterns analysis'
      };
      setPredictions(directPredictions);
    } else {
      console.log('🔍 [AI PREDICTIONS DEBUG] No valid predictions data found, setting to null');
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

    // Rendering with predictions
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
                cat.predictedAssessments?.some(pred => pred.assessment && pred.assessment.includes('Final Term'))
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
                  {category.predictedAssessments?.map((prediction, predIndex) => {
                  // Rendering prediction
                    
                    return (
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
                          prediction.predictedScore && typeof prediction.predictedScore === 'string' ? parseInt(prediction.predictedScore.split('/')[0]) : 0, 
                          prediction.predictedScore && typeof prediction.predictedScore === 'string' ? parseInt(prediction.predictedScore.split('/')[1]) : 100
                        )}`}>
                          {prediction.predictedScore || 'N/A'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(prediction.confidence)}`}>
                          {prediction.confidence}
                        </div>
                      </div>
                    </div>
                    );
                  })}
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
                        const score = pred.predictedScore && typeof pred.predictedScore === 'string' ? parseInt(pred.predictedScore.split('/')[0]) : 0;
                        return sum + score;
                      }, 0) / category.predictedAssessments.length}/
                      {category.predictedAssessments[0]?.predictedScore && typeof category.predictedAssessments[0].predictedScore === 'string' ? category.predictedAssessments[0].predictedScore.split('/')[1] : '100'}
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
