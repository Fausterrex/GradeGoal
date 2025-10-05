// ========================================
// AI SCORE PREDICTION COMPONENT
// ========================================
// Shows AI score predictions for individual assessments

import React, { useState } from 'react';
import { Target, TrendingUp, Info, X, Calculator, Award } from 'lucide-react';

// GPA conversion function that matches the database CalculateGPA() function
const calculateGPAFromPercentage = (percentage) => {
  if (percentage >= 97) return 4.00;
  if (percentage >= 93) return 3.70;
  if (percentage >= 90) return 3.30;  // 91.67% will get 3.30
  if (percentage >= 87) return 3.00;
  if (percentage >= 83) return 2.70;
  if (percentage >= 80) return 2.30;
  if (percentage >= 77) return 2.00;
  if (percentage >= 73) return 1.70;
  if (percentage >= 70) return 1.30;
  if (percentage >= 67) return 1.00;
  if (percentage >= 65) return 0.70;
  return 0.00;
};

const AIScorePrediction = ({ assessment, prediction, isVisible = true, courseData = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || !prediction) return null;

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Extract realistic prediction data
  const getRealisticPrediction = () => {
    if (!prediction) return null;

    // Handle different prediction data structures
    if (prediction.predictedScore) {
      // Direct prediction object
      return {
        predictedScore: prediction.predictedScore,
        confidence: prediction.confidence || 'MEDIUM',
        reasoning: prediction.reasoning || 'Based on your performance patterns'
      };
    } else if (prediction.neededScore || prediction.recommendedScore) {
      // Convert needed/recommended score to realistic prediction
      const neededScoreStr = prediction.neededScore || prediction.recommendedScore || '15/15';
      const confidence = prediction.confidence || 'MEDIUM';
      
      let predictedScore, predictedMaxScore, realisticScore;
      
      if (neededScoreStr.includes('%')) {
        const percentage = parseFloat(neededScoreStr.replace('%', ''));
        predictedMaxScore = assessment.maxScore || 15;
        predictedScore = Math.round((percentage / 100) * predictedMaxScore);
        
        // Make realistic prediction based on confidence
        if (confidence === 'LOW') {
          realisticScore = Math.round(predictedScore * 0.85);
        } else if (confidence === 'MEDIUM') {
          realisticScore = Math.round(predictedScore * 0.92);
        } else {
          realisticScore = Math.round(predictedScore * 0.98);
        }
      } else {
        const [score, maxScore] = neededScoreStr.split('/').map(s => parseInt(s));
        predictedScore = score;
        predictedMaxScore = maxScore || assessment.maxScore || 15;
        
        if (confidence === 'LOW') {
          realisticScore = Math.round(predictedScore * 0.85);
        } else if (confidence === 'MEDIUM') {
          realisticScore = Math.round(predictedScore * 0.92);
        } else {
          realisticScore = Math.round(predictedScore * 0.98);
        }
      }
      
      return {
        predictedScore: `${realisticScore}/${predictedMaxScore}`,
        confidence: confidence,
        reasoning: `Realistic prediction based on your performance patterns. You need ${neededScoreStr} to reach your goal, but AI predicts ${realisticScore}/${predictedMaxScore} based on current performance.`
      };
    }
    
    return null;
  };

  const realisticPrediction = getRealisticPrediction();

  // Calculate GPA impact with both realistic prediction and perfect score
  const calculateGPAImpact = () => {
    if (!courseData || !assessment || !realisticPrediction) return null;
    
    const { currentGPA, categories, grades, currentWeightedAverage: systemWeightedAverage } = courseData;
    const currentGPAValue = parseFloat(currentGPA) || 0;
    
    
    // Find the category for this assessment
    const category = categories.find(cat => 
      cat.id === assessment.categoryId
    );
    
    
    if (!category) return null;
    
    const categoryWeight = category.weight || 0;
    const categoryWeightDecimal = categoryWeight / 100;
    
    // Calculate current performance in this category
    const categoryGrades = grades[category.id] || [];
    const hasGrades = categoryGrades.length > 0;
    const currentCategoryAverage = hasGrades 
      ? categoryGrades.reduce((sum, grade) => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return sum + percentage;
        }, 0) / categoryGrades.length 
      : 0;
    
    // Calculate current weighted course average (including ALL categories, even with 0% scores)
    let currentWeightedAverage = 0;
    let totalWeight = 0;
    
    
    categories.forEach(cat => {
      const catGrades = grades[cat.id] || [];
      
      if (catGrades.length > 0) {
        // Calculate percentage from score and maxScore (EXCLUDE 0% scores from average)
        const validGrades = catGrades.filter(grade => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return percentage > 0; // Only include grades with actual scores
        });
        
        if (validGrades.length === 0) {
          return; // Skip this category entirely
        }
        
        const catAverage = validGrades.reduce((sum, grade) => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return sum + percentage;
        }, 0) / validGrades.length;
        
        
        // Only include categories with actual scores (exclude 0% - matches main system)
        let weightedContribution = 0;
        if (catAverage > 0) {
          weightedContribution = (catAverage * cat.weight) / 100;
          currentWeightedAverage += weightedContribution;
          totalWeight += cat.weight;
        }
        
      }
    });
    
    // Normalize the weighted average for excluded categories
    if (totalWeight > 0 && totalWeight < 100) {
      currentWeightedAverage = (currentWeightedAverage / totalWeight) * 100;
    }
    
    
    // Calculate what the new weighted average would be with perfect score in this category
    let newWeightedAverage = 0;
    let newTotalWeight = 0;
    
    categories.forEach(cat => {
      const catGrades = grades[cat.id] || [];
      if (catGrades.length > 0) {
        // Filter out 0% scores for this calculation too
        const validGrades = catGrades.filter(grade => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return percentage > 0; // Only include grades with actual scores
        });
        
        if (validGrades.length === 0 && cat.id !== category.id) {
          return; // Skip this category entirely unless it's the target category
        }
        
        let catAverage = 0;
        if (validGrades.length > 0) {
          catAverage = validGrades.reduce((sum, grade) => {
            const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
            return sum + percentage;
          }, 0) / validGrades.length;
        }
        
        // If this is the target category, handle realistic prediction calculation
        if (cat.id === category.id) {
          // Extract predicted score from realistic prediction
          const predictedScoreStr = realisticPrediction.predictedScore;
          const [predictedScore, predictedMaxScore] = predictedScoreStr.split('/').map(s => parseInt(s));
          const predictedPercentage = (predictedScore / predictedMaxScore) * 100;
          
          // Check if the target assessment already exists in grades
          const targetAssessmentExists = catGrades.some(grade => grade.id === assessment.id);
          
          if (targetAssessmentExists) {
            // Replace the existing assessment score with realistic prediction
            const totalScores = catGrades.reduce((sum, grade) => {
              if (grade.id === assessment.id) {
                return sum + predictedPercentage; // Realistic prediction for this assessment
              } else {
                const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
                return sum + percentage;
              }
            }, 0);
            catAverage = totalScores / catGrades.length;
          } else {
            // Add realistic prediction to the existing grades for this category
            const totalScores = catGrades.reduce((sum, grade) => {
              const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
              return sum + percentage;
            }, 0) + predictedPercentage; // Add realistic prediction
            catAverage = totalScores / (catGrades.length + 1); // Include the new assessment
          }
          
          // For target category with realistic prediction, always include it (even if it was 0% before)
          const weightedContribution = (catAverage * cat.weight) / 100;
          newWeightedAverage += weightedContribution;
          newTotalWeight += cat.weight;
        } else {
          // For non-target categories, only include if they have actual scores
          if (catAverage > 0) {
            const weightedContribution = (catAverage * cat.weight) / 100;
            newWeightedAverage += weightedContribution;
            newTotalWeight += cat.weight;
          }
        }
      }
    });
    
    // Normalize the new weighted average for excluded categories
    if (newTotalWeight > 0 && newTotalWeight < 100) {
      newWeightedAverage = (newWeightedAverage / newTotalWeight) * 100;
    }
    
    
    // Use the actual course GPA instead of recalculating from weighted average
    const actualCurrentGPA = courseData.currentGPA || 0;
    
    // Use the SAME GPA conversion as the database function CalculateGPA()
    // This ensures AI prediction matches actual system behavior
    const projectedGPAFromPercentage = calculateGPAFromPercentage(newWeightedAverage);
    
    // Debug the DATABASE-MATCHED GPA conversion
    
    const improvement = projectedGPAFromPercentage - actualCurrentGPA;
    
    const result = {
      currentGPA: actualCurrentGPA,
      projectedGPA: projectedGPAFromPercentage,
      improvement: improvement,
      categoryWeight: categoryWeight,
      currentCategoryAverage: currentCategoryAverage,
      currentWeightedAverage: currentWeightedAverage,
      newWeightedAverage: newWeightedAverage,
      categoryImprovement: 100 - currentCategoryAverage
    };
    
    return result;
  };

  // Calculate perfect score GPA impact
  const calculatePerfectScoreImpact = () => {
    if (!courseData || !assessment) return null;
    
    const { currentGPA, categories, grades } = courseData;
    const currentGPAValue = parseFloat(currentGPA) || 0;
    
    // Find the category for this assessment
    const category = categories.find(cat => 
      cat.id === assessment.categoryId
    );
    
    if (!category) return null;
    
    const categoryWeight = category.weight || 0;
    
    // Calculate current weighted course average
    let currentWeightedAverage = 0;
    let totalWeight = 0;
    
    categories.forEach(cat => {
      const catGrades = grades[cat.id] || [];
      
      if (catGrades.length > 0) {
        const validGrades = catGrades.filter(grade => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return percentage > 0;
        });
        
        if (validGrades.length === 0) {
          return;
        }
        
        const catAverage = validGrades.reduce((sum, grade) => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return sum + percentage;
        }, 0) / validGrades.length;
        
        if (catAverage > 0) {
          const weightedContribution = (catAverage * cat.weight) / 100;
          currentWeightedAverage += weightedContribution;
          totalWeight += cat.weight;
        }
      }
    });
    
    if (totalWeight > 0 && totalWeight < 100) {
      currentWeightedAverage = (currentWeightedAverage / totalWeight) * 100;
    }
    
    // Calculate perfect score scenario
    let perfectWeightedAverage = 0;
    let perfectTotalWeight = 0;
    
    categories.forEach(cat => {
      const catGrades = grades[cat.id] || [];
      
      if (cat.id === category.id) {
        // For the target category, always include it with perfect score
        let catAverage = 0;
        
        if (catGrades.length > 0) {
          // Check if the target assessment already exists
          const targetAssessmentExists = catGrades.some(grade => grade.id === assessment.id);
          
          if (targetAssessmentExists) {
            // Replace existing assessment with perfect score
            const totalScores = catGrades.reduce((sum, grade) => {
              if (grade.id === assessment.id) {
                return sum + 100; // Perfect score for this assessment
              } else {
                const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
                return sum + percentage;
              }
            }, 0);
            catAverage = totalScores / catGrades.length;
          } else {
            // Add perfect score to existing grades
            const totalScores = catGrades.reduce((sum, grade) => {
              const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
              return sum + percentage;
            }, 0) + 100; // Add perfect score
            catAverage = totalScores / (catGrades.length + 1);
          }
        } else {
          // No existing grades, perfect score becomes 100%
          catAverage = 100;
        }
        
        const weightedContribution = (catAverage * cat.weight) / 100;
        perfectWeightedAverage += weightedContribution;
        perfectTotalWeight += cat.weight;
      } else {
        // For other categories, use existing logic
        if (catGrades.length > 0) {
          const validGrades = catGrades.filter(grade => {
            const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
            return percentage > 0;
          });
          
          if (validGrades.length > 0) {
            const catAverage = validGrades.reduce((sum, grade) => {
              const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
              return sum + percentage;
            }, 0) / validGrades.length;
            
            const weightedContribution = (catAverage * cat.weight) / 100;
            perfectWeightedAverage += weightedContribution;
            perfectTotalWeight += cat.weight;
          }
        }
      }
    });
    
    if (perfectTotalWeight > 0 && perfectTotalWeight < 100) {
      perfectWeightedAverage = (perfectWeightedAverage / perfectTotalWeight) * 100;
    }
    
    const perfectGPA = calculateGPAFromPercentage(perfectWeightedAverage);
    const perfectImprovement = perfectGPA - currentGPAValue;
    
    console.log('🔍 [PerfectScoreImpact] Debug:', {
      categoryName: category.name || category.categoryName,
      categoryWeight: categoryWeight,
      currentWeightedAverage: currentWeightedAverage,
      perfectWeightedAverage: perfectWeightedAverage,
      currentGPA: currentGPAValue,
      perfectGPA: perfectGPA,
      perfectImprovement: perfectImprovement,
      totalWeight: perfectTotalWeight
    });
    
    return {
      currentGPA: currentGPAValue,
      perfectGPA: perfectGPA,
      perfectImprovement: perfectImprovement,
      perfectWeightedAverage: perfectWeightedAverage
    };
  };

  const gpaImpact = calculateGPAImpact();
  const perfectScoreImpact = calculatePerfectScoreImpact();

  // Safety check for prediction
  if (!prediction) {
    return null;
  }

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI Prediction</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="mt-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">
            Predicted Score: {realisticPrediction.predictedScore}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(realisticPrediction.confidence)}`}>
            {realisticPrediction.confidence} Confidence
          </span>
        </div>
        
        {/* Always show GPA Impact Analysis */}
        {(gpaImpact || perfectScoreImpact) && (
          <div className="mt-3">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">GPA Impact Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current weighted average:</span>
                  <span className="font-semibold text-gray-800">{(gpaImpact?.currentWeightedAverage || perfectScoreImpact?.currentWeightedAverage || 0).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current GPA:</span>
                  <span className="font-semibold text-gray-800">{(gpaImpact?.currentGPA || perfectScoreImpact?.currentGPA || 0).toFixed(2)}</span>
                </div>
                {gpaImpact && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">If you get predicted score:</span>
                    <span className="font-semibold text-green-700">{gpaImpact.projectedGPA.toFixed(2)}</span>
                  </div>
                )}
                {perfectScoreImpact && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">If you get perfect score:</span>
                    <span className="font-semibold text-blue-700">{perfectScoreImpact.perfectGPA.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600">
                    This assessment is worth {(gpaImpact?.categoryWeight || 0)}% of your final grade
                  </span>
                </div>
                {(gpaImpact?.improvement > 0.1 || perfectScoreImpact?.perfectImprovement > 0.1) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-600 text-xs">💡</span>
                      <span className="text-xs text-yellow-800 font-medium">
                        {gpaImpact?.improvement > 0.1 && `Getting the predicted score (${realisticPrediction.predictedScore}) could boost your GPA!`}
                        {perfectScoreImpact?.perfectImprovement > 0.1 && `Getting a perfect score could significantly boost your GPA!`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium">Why this prediction?</p>
              <p className="text-xs mt-1 opacity-75">
                {realisticPrediction.reasoning || `Based on your performance patterns and ${realisticPrediction.confidence.toLowerCase()} confidence analysis.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScorePrediction;
