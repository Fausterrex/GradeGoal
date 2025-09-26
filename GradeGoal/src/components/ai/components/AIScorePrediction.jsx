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

  // Calculate GPA impact if perfect score is achieved
  const calculateGPAImpact = () => {
    if (!courseData || !assessment) return null;
    
    const { currentGPA, categories, grades, currentWeightedAverage: systemWeightedAverage } = courseData;
    const currentGPAValue = parseFloat(currentGPA) || 0;
    
    console.log('🔍 calculateGPAImpact - Input data:', {
      currentGPA,
      categoriesCount: categories?.length,
      gradesType: typeof grades,
      gradesKeys: grades ? Object.keys(grades) : 'no grades',
      assessment: assessment
    });
    
    // Find the category for this assessment
    const category = categories.find(cat => 
      cat.id === assessment.categoryId || 
      cat.categoryName === assessment.categoryName ||
      cat.name === assessment.categoryName
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
    
    console.log('🔍 calculateGPAImpact - Processing categories (including 0% scores):', categories);
    
    categories.forEach(cat => {
      const catGrades = grades[cat.id] || [];
      console.log(`🔍 calculateGPAImpact - Category ${cat.name} (${cat.id}):`, {
        weight: cat.weight,
        gradesCount: catGrades.length,
        grades: catGrades
      });
      
      if (catGrades.length > 0) {
        // Calculate percentage from score and maxScore (EXCLUDE 0% scores from average)
        const validGrades = catGrades.filter(grade => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return percentage > 0; // Only include grades with actual scores
        });
        
        if (validGrades.length === 0) {
          console.log(`🔍 calculateGPAImpact - Category ${cat.name}: No valid grades (all 0%), skipping category`);
          return; // Skip this category entirely
        }
        
        const catAverage = validGrades.reduce((sum, grade) => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          console.log(`🔍 calculateGPAImpact - Grade ${grade.name}:`, {
            score: grade.score,
            maxScore: grade.maxScore,
            percentage: percentage,
            included: 'YES'
          });
          return sum + percentage;
        }, 0) / validGrades.length;
        
        // Log excluded grades
        catGrades.forEach(grade => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          if (percentage === 0) {
            console.log(`🔍 calculateGPAImpact - Grade ${grade.name}:`, {
              score: grade.score,
              maxScore: grade.maxScore,
              percentage: percentage,
              included: 'NO (0% excluded)'
            });
          }
        });
        
        // Only include categories with actual scores (exclude 0% - matches main system)
        let weightedContribution = 0;
        if (catAverage > 0) {
          weightedContribution = (catAverage * cat.weight) / 100;
          currentWeightedAverage += weightedContribution;
          totalWeight += cat.weight;
        }
        
        console.log(`🔍 calculateGPAImpact - Category ${cat.name} calculation:`, {
          catAverage,
          weightedContribution,
          currentWeightedAverage,
          included: catAverage > 0 ? 'YES' : 'NO (0% excluded)'
        });
      }
    });
    
    // Normalize the weighted average for excluded categories
    if (totalWeight > 0 && totalWeight < 100) {
      currentWeightedAverage = (currentWeightedAverage / totalWeight) * 100;
    }
    
    console.log('🔍 calculateGPAImpact - Final weighted average calculation:', {
      totalWeightedScore: currentWeightedAverage,
      totalWeight,
      normalizedWeightedAverage: currentWeightedAverage,
      explanation: totalWeight < 100 ? 'Normalized to 100% scale (excluded 0% scores)' : 'No normalization needed'
    });
    
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
        
        // If this is the target category, handle perfect score calculation
        if (cat.id === category.id) {
          // Check if the target assessment already exists in grades
          const targetAssessmentExists = catGrades.some(grade => grade.id === assessment.id);
          
          if (targetAssessmentExists) {
            // Replace the existing assessment score with perfect score
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
            // Add a perfect score (100%) to the existing grades for this category
            const totalScores = catGrades.reduce((sum, grade) => {
              const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
              return sum + percentage;
            }, 0) + 100; // Add perfect score
            catAverage = totalScores / (catGrades.length + 1); // Include the new assessment
          }
        }
        
        // Only include categories with actual scores (same logic as current calculation)
        if (catAverage > 0) {
          const weightedContribution = (catAverage * cat.weight) / 100;
          newWeightedAverage += weightedContribution;
          newTotalWeight += cat.weight;
        }
      }
    });
    
    // Normalize the new weighted average for excluded categories
    if (newTotalWeight > 0 && newTotalWeight < 100) {
      newWeightedAverage = (newWeightedAverage / newTotalWeight) * 100;
    }
    
    console.log('🔍 calculateGPAImpact - New weighted average with perfect score:', {
      rawWeightedAverage: newWeightedAverage,
      newTotalWeight,
      normalizedWeightedAverage: newWeightedAverage,
      targetCategory: category.name,
      explanation: 'Excludes 0% scores, matches main system approach'
    });
    
    // Use the actual course GPA instead of recalculating from weighted average
    const actualCurrentGPA = courseData.currentGPA || 0;
    
    // Use the SAME GPA conversion as the database function CalculateGPA()
    // This ensures AI prediction matches actual system behavior
    const projectedGPAFromPercentage = calculateGPAFromPercentage(newWeightedAverage);
    
    // Debug the DATABASE-MATCHED GPA conversion
    console.log('🔍 calculateGPAImpact - DATABASE-MATCHED GPA Conversion:', {
      currentWeightedAverage: `${currentWeightedAverage.toFixed(2)}%`,
      newWeightedAverageWithPerfectScore: `${newWeightedAverage.toFixed(2)}%`,
      currentGPA: actualCurrentGPA,
      projectedGPAWithPerfectScore: projectedGPAFromPercentage,
      improvement: `${(projectedGPAFromPercentage - actualCurrentGPA).toFixed(2)} GPA`,
      categoryBeingImproved: category.name,
      perfectScoreLogic: `Adding 100% score to ${category.name} category`
    });
    
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
    
    console.log('🔍 calculateGPAImpact - Final result:', result);
    return result;
  };

  const gpaImpact = calculateGPAImpact();

  // Debug logging
  console.log('🎯 AIScorePrediction - Component data:', {
    assessment: assessment,
    prediction: prediction,
    courseData: courseData,
    gpaImpact: gpaImpact
  });
  
  // Additional debugging for prediction
  console.log('🎯 AIScorePrediction - Prediction details:', {
    hasPrediction: !!prediction,
    predictionType: typeof prediction,
    predictionKeys: prediction ? Object.keys(prediction) : 'no prediction',
    predictionContent: prediction
  });

  // Safety check for prediction
  if (!prediction) {
    console.log('🎯 AIScorePrediction - No prediction available, not rendering');
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
            Target Score: {prediction.neededScore}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence} Confidence
          </span>
        </div>
        
        {/* Always show GPA Impact Analysis */}
        {gpaImpact && (
          <div className="mt-3">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">GPA Impact Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current weighted average:</span>
                  <span className="font-semibold text-gray-800">{gpaImpact.currentWeightedAverage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current GPA:</span>
                  <span className="font-semibold text-gray-800">{gpaImpact.currentGPA.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">If you get perfect score:</span>
                  <span className="font-semibold text-green-700">{gpaImpact.projectedGPA.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">New weighted average:</span>
                  <span className="font-semibold text-green-700">{gpaImpact.newWeightedAverage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Potential improvement:</span>
                  <span className="font-semibold text-blue-700">+{gpaImpact.improvement.toFixed(2)} GPA</span>
                </div>
                {gpaImpact.currentCategoryAverage > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current category average:</span>
                    <span className="font-semibold text-orange-700">{gpaImpact.currentCategoryAverage.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600">
                    This assessment is worth {gpaImpact.categoryWeight}% of your final grade
                  </span>
                </div>
                {gpaImpact.improvement > 0.1 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-600 text-xs">💡</span>
                      <span className="text-xs text-yellow-800 font-medium">
                        Getting a perfect score on this assessment could significantly boost your GPA!
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
              <p className="font-medium">Why this score?</p>
              <p className="text-xs mt-1 opacity-75">
                {prediction.reasoning || `You need to get ${prediction.neededScore} on this assessment to achieve your target GPA. This will help you reach your academic goal.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScorePrediction;
