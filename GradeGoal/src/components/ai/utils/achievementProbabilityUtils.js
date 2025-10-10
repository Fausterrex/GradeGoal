// ========================================
// ACHIEVEMENT PROBABILITY UTILITIES
// ========================================
// Utility functions for calculating achievement probability and related metrics
// Updated: 2025-01-06 - Fixed duplicate function declaration

import DatabaseGradeService from "../../services/databaseGradeService.js";
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
      // Separate graded and ungraded assessments
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
        return percentage === 0 || percentage === null || percentage === undefined;
      });
      
      // Process categories that have either graded or ungraded assessments
      if (gradedAssessments.length > 0 || ungradedAssessments.length > 0) {
        let maxCategoryAverage = 0;
        
        if (gradedAssessments.length > 0 && ungradedAssessments.length > 0) {
          // Calculate weighted average: keep current scores for graded + perfect scores for ungraded
          const currentGradedTotal = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0);
          
          const perfectUngradedTotal = ungradedAssessments.length * 100; // Perfect scores for ungraded
          const totalAssessments = categoryGrades.length;
          
          maxCategoryAverage = (currentGradedTotal + perfectUngradedTotal) / totalAssessments;
          
          // Mixed category calculation: current scores + perfect scores for ungraded
        } else if (ungradedAssessments.length > 0) {
          // Only ungraded assessments, max possible is 100%
          maxCategoryAverage = 100;
        } else {
          // Only graded assessments, use current average
          maxCategoryAverage = gradedAssessments.reduce((sum, g) => {
            let percentage = g.percentage;
            if (!percentage && g.score !== undefined && g.maxScore !== undefined) {
              percentage = (g.score / g.maxScore) * 100;
            }
            return sum + (percentage || 0);
          }, 0) / gradedAssessments.length;
        }
        
        if (maxCategoryAverage > 0) {
          const weightedScore = (maxCategoryAverage * category.weight / 100);
          totalWeightedScore += weightedScore;
          totalWeight += category.weight;
          // Added to total weighted score
        }
      } else {
        // No graded assessments, assume perfect scores
        const weightedScore = (100 * category.weight / 100);
        totalWeightedScore += weightedScore;
        totalWeight += category.weight;
        // No assessments - assumed perfect
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
    const finalGrade = (totalWeightedScore / totalWeight) * 100;
    return finalGrade;
  }
  
  // No total weight - returning 0
  return 0;
};

/**
 * Calculate GPA from percentage (fallback function matching database logic)
 */
export const calculateGPAFromPercentage = (percentage) => {
  if (percentage >= 95.5) return 4.00;
  if (percentage >= 89.5) return 3.50;
  if (percentage >= 83.5) return 3.00;
  if (percentage >= 77.5) return 2.50;
  if (percentage >= 71.5) return 2.00;
  if (percentage >= 65.5) return 1.50;
  if (percentage >= 59.5) return 1.00;
  return 0.00; // Below 59.5% = R (Remedial/Fail) - represented as 0.00 in frontend
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
    
    // Processing category
    
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
      
      // Processing graded assessments
      
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
    const finalGrade = (totalWeightedScore / totalWeight) * 100;
    return finalGrade;
  }
  
  // No total weight - returning 0
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
  if (!categories || !grades || categories.length === 0) {
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

  // Check if target is already achieved or achievable with future potential
  // Consider both remaining assessments AND future potential (empty categories, final term)
  const emptyCategories = categories.filter(cat => {
    const categoryGrades = grades[cat.id] || [];
    return categoryGrades.length === 0;
  });
  
  const hasEmptyCategories = emptyCategories.length > 0;
  const isMidtermOnly = currentGrade < 100; // If not perfect, final term could help
  
  // Calculate potential improvement from empty categories
  let emptyCategoryPotential = 0;
  if (hasEmptyCategories) {
    // If there are empty categories, assume they could contribute significantly
    // Calculate weighted potential based on empty category weights
    emptyCategoryPotential = emptyCategories.reduce((sum, cat) => {
      return sum + (cat.weightPercentage || cat.weight || 0);
    }, 0);
    
    // Convert percentage to GPA potential (assume 90% average on new assessments)
    emptyCategoryPotential = (emptyCategoryPotential / 100) * 0.9; // 90% = 3.6 GPA
  }
  
  // Calculate final term potential - if midterm is done, consider final term improvement
  const finalTermPotential = isMidtermOnly ? 0.5 : 0; // 0.5 GPA points potential
  
  // Calculate remaining assessment potential
  let remainingAssessmentPotential = 0;
  if (remainingAssessments.length > 0) {
    // Calculate potential from remaining assessments (assume 90% average)
    remainingAssessmentPotential = remainingAssessments.reduce((sum, assessment) => {
      const weight = assessment.categoryWeight || 0;
      return sum + (weight / 100) * 0.9; // 90% = 3.6 GPA
    }, 0);
  }
  
  const totalPotential = emptyCategoryPotential + finalTermPotential + remainingAssessmentPotential;
  
  if (currentGPA >= targetGPA) {
    return {
      probability: 100,
      bestPossibleGPA: currentGPA,
      confidence: "HIGH"
    };
  } else if ((currentGPA + totalPotential) >= targetGPA) {
    return {
      probability: hasEmptyCategories ? 85 : 75, // Higher probability if empty categories exist
      bestPossibleGPA: Math.min(currentGPA + totalPotential, 4.0),
      confidence: hasEmptyCategories ? "HIGH" : "MEDIUM"
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
            
            console.log({
              gradedWeight: gradedWeight.toFixed(2),
              remainingWeight: remainingWeight.toFixed(2),
              scenarioPerformance: scenarioPerformance.toFixed(2),
              finalCategoryAverage: finalCategoryAverage.toFixed(2),
              gradedCount: gradedAssessments.length,
              ungradedCount: ungradedAssessments.length
            });
          } else {
            finalCategoryAverage = currentAverage;
            console.log({
              finalCategoryAverage: finalCategoryAverage.toFixed(2),
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
          
          console.log({
            scenarioPerformance: scenarioPerformance.toFixed(2),
            categoryWeight: category.weight,
            contribution: (scenarioPerformance * category.weight / 100).toFixed(2),
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

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
    const finalGPA = calculateGPAFromPercentage(finalGrade);

    console.log({
      finalGPA: finalGPA.toFixed(2),
      meetsTarget: finalGPA >= targetGPA,
      totalWeightedScore: totalWeightedScore.toFixed(2),
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

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
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

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
    const bestPossibleGPA = calculateGPAFromPercentage(finalGrade);

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

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
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

  console.log({
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
  console.log('🔍 [POST-PROCESS DEBUG] Starting post-processing with:', {
    currentGPA: courseData.currentGPA,
    goalType: goalData.goalType,
    targetValue: goalData.targetValue,
    gradesCount: Object.keys(courseData.grades || {}).length,
    categoriesCount: courseData.categories?.length || 0
  });
  
  const currentGrade = calculateCurrentGrade(courseData.grades, courseData.categories);
  // Use the course GPA directly from the database (already calculated and stored)
  const currentGPA = parseFloat(courseData.currentGPA) || 0;
  
  console.log('🔍 [POST-PROCESS DEBUG] Calculated values:', {
    currentGrade: currentGrade.toFixed(2),
    currentGPA: currentGPA.toFixed(2)
  });

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
  // Always use the correctly calculated maxAchievableGPA as bestPossibleGPA
  // This ensures consistency with the assessment card's GPA Impact Analysis
  let bestPossibleGPA = maxAchievableGPA;

  // Ensure we're comparing numbers, not strings
  const currentGPANum = parseFloat(currentGPA);
  const targetGPANum = parseFloat(targetGPA);
  const bestPossibleGPANum = parseFloat(bestPossibleGPA);

  if (currentGPANum >= targetGPANum) {
    // Already at or above target
    correctProbability = 100;
  } else if (bestPossibleGPANum >= targetGPANum) {
    // Target is achievable with perfect performance on remaining assessments
    correctProbability = 100;
  } else {
    // Target is not achievable even with perfect performance
    // Calculate probability based on how close we can get
    // Since GPA scale uses 0.5 increments only, adjust probability accordingly
    const gap = targetGPANum - bestPossibleGPANum;
    if (gap <= 0.5) {
      correctProbability = 80; // One GPA level away (0.5 gap)
    } else if (gap <= 1.0) {
      correctProbability = 60; // Two GPA levels away (1.0 gap)
    } else if (gap <= 1.5) {
      correctProbability = 40; // Three GPA levels away (1.5 gap)
    } else if (gap <= 2.0) {
      correctProbability = 25; // Four GPA levels away (2.0 gap)
    } else {
      correctProbability = 10; // Very large gap (2.5+ gap)
    }
  }

  console.log('🔍 [POST-PROCESS DEBUG] Final probability calculation:', {
    correctProbability,
    bestPossibleGPA: bestPossibleGPA.toFixed(2),
    maxAchievableGPA: maxAchievableGPA.toFixed(2),
    gpaGap: gpaGap.toFixed(2)
  });

  parsedAnalysis.targetGoalProbability = {
    probability: `${correctProbability}%`,
    factors: [
      `Current GPA: ${currentGPA}`,
      `Target GPA: ${targetGPA}`,
      `Gap: ${gpaGap.toFixed(2)}`,
      `Max Achievable GPA: ${maxAchievableGPA.toFixed(2)}`,
      `Current Grade: ${currentGrade.toFixed(2)}%`
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