// ========================================
// GRADE CALCULATION UTILITIES
// ========================================
// Utility functions for grade and GPA calculations

import DatabaseGradeService from '../../../services/databaseGradeService.js';

/**
 * Calculate GPA from percentage (matching database CalculateGPA function)
 */
export const calculateGPAFromPercentage = (percentage) => {
  if (percentage >= 95.5) return '4.00';
  if (percentage >= 89.5) return '3.50';
  if (percentage >= 83.5) return '3.00';
  if (percentage >= 77.5) return '2.50';
  if (percentage >= 71.5) return '2.00';
  if (percentage >= 65.5) return '1.50';
  if (percentage >= 59.5) return '1.00';
  return 'R'; // Below 59.5 = R (Remedial/Fail)
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
 * Calculate GPA using database service with fallback
 */
export const calculateGPAWithFallback = async (percentage) => {
  try {
    // Use database service for accurate GPA calculation
    const gpa = await DatabaseGradeService.calculateGPA(percentage);
    console.log('✅ Database GPA calculation successful:', gpa);
    return gpa;
  } catch (error) {
    console.warn('Failed to get database GPA, using fallback:', error);
    // Fallback to local calculation if database call fails
    return calculateGPAFromPercentage(percentage);
  }
};
