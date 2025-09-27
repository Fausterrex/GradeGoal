// ========================================
// ACHIEVEMENT PROBABILITY UTILITIES
// ========================================
// Utility functions for calculating achievement probability and related metrics

import DatabaseGradeService from '../../../services/databaseGradeService.js';

/**
 * Calculate maximum possible grade with perfect future scores
 */
export const calculateMaxPossibleGrade = (grades, categories) => {
  if (!grades || categories.length === 0) {
    return 0;
  }
  
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length === 0) {
    return 0;
  }
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    // Filter grades by categoryId
    const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
    
    if (categoryGrades.length > 0) {
      // Filter out ungraded/placeholder assessments (0% scores)
      const gradedAssessments = categoryGrades.filter(g => {
        let percentage = g.percentage;
        if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
          percentage = (g.score / g.maxScore) * 100;
        }
        return percentage > 0;
      });
      
      if (gradedAssessments.length > 0) {
        // Calculate current average for this category
        const categoryAverage = gradedAssessments.reduce((sum, g) => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return sum + (percentage || 0);
        }, 0) / gradedAssessments.length;
        
        // For max possible, assume perfect scores on remaining assessments
        // This means the category average becomes 100% if there are any ungraded assessments
        const hasUngradedAssessments = categoryGrades.some(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage === 0;
        });
        
        const maxCategoryAverage = hasUngradedAssessments ? 100 : categoryAverage;
        
        if (maxCategoryAverage > 0) {
          const weightedScore = (maxCategoryAverage * category.weight / 100);
          totalWeightedScore += weightedScore;
          totalWeight += category.weight;
        }
      } else {
        // No graded assessments, assume perfect scores
        const weightedScore = (100 * category.weight / 100);
        totalWeightedScore += weightedScore;
        totalWeight += category.weight;
      }
    } else {
      // No assessments in this category, assume perfect scores
      const weightedScore = (100 * category.weight / 100);
      totalWeightedScore += weightedScore;
      totalWeight += category.weight;
    }
  });
  
  // Calculate the final grade as a percentage
  if (totalWeight > 0) {
    return (totalWeightedScore / totalWeight) * 100;
  }
  
  return 0;
};

/**
 * Calculate GPA from percentage (fallback function matching database logic)
 */
export const calculateGPAFromPercentage = (percentage) => {
  if (percentage >= 97) return 4.00;
  if (percentage >= 93) return 3.70;
  if (percentage >= 90) return 3.30;
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

/**
 * Calculate current grade based on completed assessments
 */
export const calculateCurrentGrade = (grades, categories) => {
  if (!grades || categories.length === 0) {
    return 0;
  }
  
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    // Convert object format to array
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length === 0) {
    return 0;
  }
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    // Filter grades by categoryId (more reliable than categoryName)
    const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
    
    if (categoryGrades.length > 0) {
      // Filter out ungraded/placeholder assessments (0% scores)
      const gradedAssessments = categoryGrades.filter(g => {
        let percentage = g.percentage;
        if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
          percentage = (g.score / g.maxScore) * 100;
        }
        // Exclude assessments with 0% score (ungraded/placeholder)
        return percentage > 0;
      });
      
      if (gradedAssessments.length > 0) {
        // Calculate percentage from score and maxScore if percentage is not available
        const categoryAverage = gradedAssessments.reduce((sum, g) => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return sum + (percentage || 0);
        }, 0) / gradedAssessments.length;
        
        // Only include categories with valid grades
        if (categoryAverage > 0) {
          const weightedScore = (categoryAverage * category.weight / 100);
          totalWeightedScore += weightedScore;
          totalWeight += category.weight;
        }
      }
    }
  });
  
  // Calculate the final grade as a percentage
  // Convert weighted score to percentage based on completed work
  if (totalWeight > 0) {
    return (totalWeightedScore / totalWeight) * 100;
  }
  
  return 0;
};

/**
 * Calculate remaining weight for incomplete categories
 */
export const calculateRemainingWeight = (categories) => {
  return categories.reduce((total, cat) => {
    const completedWeight = (cat.completedCount / cat.totalCount) * cat.weight;
    return total + (cat.weight - completedWeight);
  }, 0);
};

/**
 * Calculate realistic achievement probability based on assessment scenarios
 */
export const calculateRealisticAchievementProbability = (currentGPA, targetGPA, categories, grades) => {
  console.log('🎯 [RealisticProbability] Starting calculation:', {
    currentGPA,
    targetGPA,
    categoriesCount: categories?.length,
    gradesCount: grades?.length
  });

  if (!categories || !grades || categories.length === 0) {
    console.log('🎯 [RealisticProbability] Missing data, returning 0%');
    return 0;
  }

  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }

  // Calculate current weighted average
  const currentGrade = calculateCurrentGrade(gradesArray, categories);
  console.log('🎯 [RealisticProbability] Current grade:', currentGrade);

  // Find remaining assessments (ungraded or 0% scores) and empty categories
  const remainingAssessments = [];
  categories.forEach(category => {
    const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
    
    // If category has no assessments at all, add it as a remaining opportunity
    if (categoryGrades.length === 0) {
      remainingAssessments.push({
        categoryId: category.id,
        categoryWeight: category.weight,
        categoryName: category.categoryName || category.name,
        isEmptyCategory: true,
        potentialPoints: category.weight // Full weight available
      });
    } else {
      // Check for ungraded or 0% scores in existing assessments
      categoryGrades.forEach(grade => {
        let percentage = grade.percentage;
        if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
          percentage = (grade.score / grade.maxScore) * 100;
        }
        if (percentage === 0 || percentage === null || percentage === undefined) {
          remainingAssessments.push({
            ...grade,
            categoryWeight: category.weight,
            categoryName: category.categoryName || category.name
          });
        }
      });
    }
  });

  console.log('🎯 [RealisticProbability] Remaining assessments:', remainingAssessments.length);

  // If no remaining assessments, check if target is already achieved
  if (remainingAssessments.length === 0) {
    const probability = currentGPA >= targetGPA ? 100 : 0;
    console.log('🎯 [RealisticProbability] No remaining assessments, probability:', probability);
    return {
      probability,
      bestPossibleGPA: currentGPA,
      confidence: probability === 100 ? "HIGH" : "LOW"
    };
  }

  // Calculate different scenarios
  const scenarios = [
    { name: 'Perfect', multiplier: 1.0 },
    { name: 'Excellent', multiplier: 0.95 },
    { name: 'Very Good', multiplier: 0.90 },
    { name: 'Good', multiplier: 0.85 },
    { name: 'Average', multiplier: 0.75 }
  ];

  let achievableScenarios = 0;
  const totalScenarios = scenarios.length;

  scenarios.forEach(scenario => {
    // Calculate what the final grade would be with this scenario
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
      
      console.log(`🎯 [RealisticProbability] Processing category: ${category.categoryName || category.name} (weight: ${category.weight}%)`);
      
      if (categoryGrades.length > 0) {
        // Calculate current average for graded assessments
        const gradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage > 0;
        });

        const ungradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage === 0;
        });

        if (gradedAssessments.length > 0) {
          const currentAverage = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0) / gradedAssessments.length;

          let finalCategoryAverage;
          if (ungradedAssessments.length > 0) {
            // Calculate weighted average: current performance + scenario performance for remaining
            const gradedWeight = gradedAssessments.length / categoryGrades.length;
            const remainingWeight = ungradedAssessments.length / categoryGrades.length;
            const scenarioPerformance = 100 * scenario.multiplier;
            finalCategoryAverage = (currentAverage * gradedWeight) + (scenarioPerformance * remainingWeight);
            
            console.log(`🎯 [RealisticProbability] ${scenario.name} - ${category.categoryName || category.name}:`, {
              currentAverage: currentAverage.toFixed(1),
              gradedWeight: gradedWeight.toFixed(2),
              remainingWeight: remainingWeight.toFixed(2),
              scenarioPerformance: scenarioPerformance.toFixed(1),
              finalCategoryAverage: finalCategoryAverage.toFixed(1),
              gradedCount: gradedAssessments.length,
              ungradedCount: ungradedAssessments.length
            });
          } else {
            finalCategoryAverage = currentAverage;
            console.log(`🎯 [RealisticProbability] ${scenario.name} - ${category.categoryName || category.name}:`, {
              currentAverage: currentAverage.toFixed(1),
              finalCategoryAverage: finalCategoryAverage.toFixed(1),
              gradedCount: gradedAssessments.length,
              ungradedCount: 0
            });
          }

          totalWeightedScore += (finalCategoryAverage * category.weight / 100);
          totalWeight += category.weight;
        } else {
          // No graded assessments (empty category), use scenario performance
          const scenarioPerformance = 100 * scenario.multiplier;
          totalWeightedScore += (scenarioPerformance * category.weight / 100);
          totalWeight += category.weight;
          
          console.log(`🎯 [RealisticProbability] ${scenario.name} - ${category.categoryName || category.name} (EMPTY):`, {
            scenarioPerformance: scenarioPerformance.toFixed(1),
            categoryWeight: category.weight,
            contribution: (scenarioPerformance * category.weight / 100).toFixed(1),
            gradedCount: 0,
            ungradedCount: categoryGrades.length
          });
        }
      } else {
        // No assessments in this category, use scenario performance
        totalWeightedScore += (100 * scenario.multiplier * category.weight / 100);
        totalWeight += category.weight;
      }
    });

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    const finalGPA = calculateGPAFromPercentage(finalGrade);

    console.log(`🎯 [RealisticProbability] ${scenario.name} scenario:`, {
      finalGrade: finalGrade.toFixed(1),
      finalGPA: finalGPA.toFixed(2),
      meetsTarget: finalGPA >= targetGPA,
      totalWeightedScore: totalWeightedScore.toFixed(1),
      totalWeight: totalWeight
    });

    if (finalGPA >= targetGPA) {
      achievableScenarios++;
    }
  });

  // Find the best achievable scenario
  const bestScenario = scenarios.find(scenario => {
    // Calculate what the final grade would be with this scenario
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
      
      if (categoryGrades.length > 0) {
        const gradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage > 0;
        });

        const ungradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage === 0;
        });

        if (gradedAssessments.length > 0) {
          const currentAverage = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0) / gradedAssessments.length;

          let finalCategoryAverage;
          if (ungradedAssessments.length > 0) {
            const gradedWeight = gradedAssessments.length / categoryGrades.length;
            const remainingWeight = ungradedAssessments.length / categoryGrades.length;
            const scenarioPerformance = 100 * scenario.multiplier;
            finalCategoryAverage = (currentAverage * gradedWeight) + (scenarioPerformance * remainingWeight);
          } else {
            finalCategoryAverage = currentAverage;
          }

          totalWeightedScore += (finalCategoryAverage * category.weight / 100);
          totalWeight += category.weight;
        } else {
          const scenarioPerformance = 100 * scenario.multiplier;
          totalWeightedScore += (scenarioPerformance * category.weight / 100);
          totalWeight += category.weight;
        }
      } else {
        totalWeightedScore += (100 * scenario.multiplier * category.weight / 100);
        totalWeight += category.weight;
      }
    });

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    const finalGPA = calculateGPAFromPercentage(finalGrade);
    
    return finalGPA >= targetGPA;
  });

  // If the best scenario can achieve the target, return high probability
  if (bestScenario) {
    // Calculate the final GPA for the best scenario
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
      
      if (categoryGrades.length > 0) {
        const gradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage > 0;
        });

        const ungradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage === 0;
        });

        if (gradedAssessments.length > 0) {
          const currentAverage = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0) / gradedAssessments.length;

          let finalCategoryAverage;
          if (ungradedAssessments.length > 0) {
            // Mix current average with scenario performance for ungraded portion
            const gradedWeight = gradedAssessments.length / categoryGrades.length;
            const ungradedWeight = ungradedAssessments.length / categoryGrades.length;
            finalCategoryAverage = (currentAverage * gradedWeight) + (bestScenario.multiplier * 100 * ungradedWeight);
          } else {
            finalCategoryAverage = currentAverage;
          }

          totalWeightedScore += finalCategoryAverage * category.weight;
          totalWeight += category.weight;
        }
      }
    });

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    const bestPossibleGPA = calculateGPAFromPercentage(finalGrade);

    console.log('🎯 [RealisticProbability] Best achievable scenario found:', {
      scenarioName: bestScenario.name,
      multiplier: bestScenario.multiplier,
      probability: 100,
      bestPossibleGPA: bestPossibleGPA.toFixed(2)
    });
    return { probability: 100, bestPossibleGPA };
  }

  // If no scenario can achieve the target, calculate based on how close the best scenario gets
  let bestFinalGPA = 0;
  let bestScenarioName = 'None';

  scenarios.forEach(scenario => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryGrades = gradesArray.filter(g => g.categoryId === category.id);
      
      if (categoryGrades.length > 0) {
        const gradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage > 0;
        });

        const ungradedAssessments = categoryGrades.filter(g => {
          let percentage = g.percentage;
          if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
            percentage = (g.score / g.maxScore) * 100;
          }
          return percentage === 0;
        });

        if (gradedAssessments.length > 0) {
          const currentAverage = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0) / gradedAssessments.length;

          let finalCategoryAverage;
          if (ungradedAssessments.length > 0) {
            const gradedWeight = gradedAssessments.length / categoryGrades.length;
            const remainingWeight = ungradedAssessments.length / categoryGrades.length;
            const scenarioPerformance = 100 * scenario.multiplier;
            finalCategoryAverage = (currentAverage * gradedWeight) + (scenarioPerformance * remainingWeight);
          } else {
            finalCategoryAverage = currentAverage;
          }

          totalWeightedScore += (finalCategoryAverage * category.weight / 100);
          totalWeight += category.weight;
        } else {
          const scenarioPerformance = 100 * scenario.multiplier;
          totalWeightedScore += (scenarioPerformance * category.weight / 100);
          totalWeight += category.weight;
        }
      } else {
        totalWeightedScore += (100 * scenario.multiplier * category.weight / 100);
        totalWeight += category.weight;
      }
    });

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    const finalGPA = calculateGPAFromPercentage(finalGrade);
    
    if (finalGPA > bestFinalGPA) {
      bestFinalGPA = finalGPA;
      bestScenarioName = scenario.name;
    }
  });

  // Calculate probability based on how close the best scenario gets to the target
  const gap = targetGPA - bestFinalGPA;
  let probability = 0;
  
  // More optimistic probability calculation that accounts for potential future assessments
  if (gap <= 0.1) {
    probability = 90; // Very close
  } else if (gap <= 0.2) {
    probability = 80; // Close
  } else if (gap <= 0.3) {
    probability = 65; // Moderate gap
  } else if (gap <= 0.5) {
    probability = 45; // Large gap
  } else if (gap <= 0.7) {
    probability = 30; // Very large gap
  } else if (gap <= 1.0) {
    probability = 20; // Huge gap
  } else {
    probability = 10; // Extremely large gap
  }

  // Add bonus probability for potential future assessments
  // If there are empty categories or room for more assessments, increase probability
  const totalCategoryWeight = categories.reduce((sum, cat) => sum + (cat.weight || 0), 0);
  const usedWeight = categories.reduce((sum, cat) => {
    const categoryGrades = gradesArray.filter(g => g.categoryId === cat.id);
    const gradedCount = categoryGrades.filter(g => {
      let percentage = g.percentage;
      if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
        percentage = (g.score / g.maxScore) * 100;
      }
      return percentage > 0;
    }).length;
    return sum + (gradedCount > 0 ? cat.weight : 0);
  }, 0);

  // If there's significant unused weight (potential for more assessments), boost probability
  const unusedWeightRatio = (totalCategoryWeight - usedWeight) / totalCategoryWeight;
  if (unusedWeightRatio > 0.2) { // More than 20% unused weight
    const bonusProbability = Math.min(15, unusedWeightRatio * 30); // Up to 15% bonus
    probability = Math.min(100, probability + bonusProbability);
  }

  console.log('🎯 [RealisticProbability] Best scenario analysis:', {
    bestScenarioName,
    bestFinalGPA: bestFinalGPA.toFixed(2),
    targetGPA,
    gap: gap.toFixed(2),
    baseProbability: probability,
    totalCategoryWeight,
    usedWeight,
    unusedWeightRatio: unusedWeightRatio.toFixed(2),
    finalProbability: Math.round(probability)
  });

  return { 
    probability: Math.round(Math.max(5, Math.min(100, probability))), // Minimum 5% chance
    bestPossibleGPA: bestFinalGPA 
  };
};

/**
 * Post-process AI response to fix incorrect probability calculations
 */
export const postProcessAIResponse = (parsedAnalysis, courseData, goalData) => {
  console.log('🎯 [PostProcess] Starting AI response correction...');

  const currentGrade = calculateCurrentGrade(courseData.grades, courseData.categories);
  // Use the course GPA directly from the database (already calculated and stored)
  const currentGPA = parseFloat(courseData.currentGPA) || 0;

  let targetGPA, gpaGap;
  if (goalData.goalType === 'COURSE_GRADE') {
    const targetPercentage = parseFloat(goalData.targetValue) || 100;
    targetGPA = calculateGPAFromPercentage(targetPercentage);
  } else {
    targetGPA = parseFloat(goalData.targetValue) || 4.0;
  }
  gpaGap = targetGPA - currentGPA;

  // 🔑 Step 1: Calculate max possible GPA with perfect future scores
  const maxAchievableGrade = calculateMaxPossibleGrade(courseData.grades, courseData.categories);
  const maxAchievableGPA = calculateGPAFromPercentage(maxAchievableGrade);

  let correctProbability;
  let bestPossibleGPA = maxAchievableGPA; // Default to max achievable GPA

  if (currentGPA >= targetGPA) {
    // Already at or above target
    correctProbability = 100;
  } else {
    // Always use realistic assessment scenarios, even if target seems unreachable
    // This accounts for potential future assessments and gives more optimistic probabilities
    const realisticResult = calculateRealisticAchievementProbability(
      currentGPA, 
      targetGPA, 
      courseData.categories, 
      courseData.grades
    );
    correctProbability = realisticResult.probability;
    bestPossibleGPA = realisticResult.bestPossibleGPA;
  }

  console.log('🎯 [PostProcess] Probability Analysis:', {
    currentGrade,
    currentGPA,
    targetGPA,
    gpaGap,
    maxAchievableGrade,
    maxAchievableGPA,
    correctProbability
  });

  parsedAnalysis.targetGoalProbability = {
    probability: `${correctProbability}%`,
    factors: [
      `Current GPA: ${currentGPA}`,
      `Target GPA: ${targetGPA}`,
      `Gap: ${gpaGap.toFixed(2)}`,
      `Max Achievable GPA: ${maxAchievableGPA.toFixed(2)}`,
      `Current Grade: ${currentGrade.toFixed(1)}%`
    ],
    confidence: correctProbability >= 70 ? "HIGH" : correctProbability >= 40 ? "MEDIUM" : "LOW",
    bestPossibleGPA: bestPossibleGPA.toFixed(2),
    explanation:
      correctProbability === 0
        ? `Target GPA ${targetGPA} is mathematically unreachable.`
        : correctProbability === 100
        ? `Target GPA ${targetGPA} is already achieved.`
        : `Student needs ${gpaGap.toFixed(
            2
          )} GPA points to reach target. Probability adjusted based on realistic improvement potential.`
  };

  return parsedAnalysis;
};

/**
 * Calculate enhanced achievement probability using AI insights
 * @param {Object} courseData - Course information
 * @param {Object} goalData - Goal information
 * @param {Object} aiAnalysis - AI analysis results
 * @returns {number} Achievement probability percentage
 */
export const calculateEnhancedAchievementProbability = (courseData, goalData, aiAnalysis) => {
  const { currentGPA, progress } = courseData;
  const { targetValue } = goalData;
  
  // If goal is already achieved, return 100% immediately
  if (currentGPA >= targetValue) {
    return 100;
  }
  
  if (!aiAnalysis || !aiAnalysis.targetGoalProbability) {
    // Fallback to basic calculation using the improved gpaConversionUtils function
    const { calculateAchievementProbability } = require('../../course/academic_goal/gpaConversionUtils');
    return calculateAchievementProbability(currentGPA, targetValue, progress || 0);
  }

  const { achievable, probability } = aiAnalysis.targetGoalProbability;
  
  if (!achievable) {
    return 0;
  }

  // Extract probability percentage from string
  const probabilityMatch = probability.match(/(\d+)%/);
  const probabilityValue = probabilityMatch ? parseInt(probabilityMatch[1]) : 50;
  
  // Don't penalize based on course progress - AI should be more optimistic
  // Instead, use progress as a confidence booster
  const progressBonus = Math.min(progress / 100, 1) * 0.1; // Up to 10% bonus
  const adjustedProbability = Math.min(probabilityValue + (progressBonus * 100), 100);
  
  return Math.max(adjustedProbability, 0);
};