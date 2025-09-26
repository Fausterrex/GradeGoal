// ========================================
// GRADE CALCULATION UTILITIES
// ========================================
// Utility functions for grade and GPA calculations

import DatabaseGradeService from '../../../services/databaseGradeService.js';

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

/**
 * Calculate weighted average for a specific category
 */
export const calculateCategoryAverage = (categoryGrades) => {
  if (!categoryGrades || categoryGrades.length === 0) {
    return 0;
  }
  
  // Filter out ungraded assessments
  const gradedAssessments = categoryGrades.filter(grade => {
    let percentage = grade.percentage;
    if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
      percentage = (grade.score / grade.maxScore) * 100;
    }
    return percentage > 0;
  });
  
  if (gradedAssessments.length === 0) {
    return 0;
  }
  
  const totalPercentage = gradedAssessments.reduce((sum, grade) => {
    let percentage = grade.percentage;
    if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
      percentage = (grade.score / grade.maxScore) * 100;
    }
    return sum + (percentage || 0);
  }, 0);
  
  return totalPercentage / gradedAssessments.length;
};

/**
 * Calculate overall course grade from categories
 */
export const calculateOverallCourseGrade = (categories, grades) => {
  if (!categories || categories.length === 0) {
    return 0;
  }
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    const categoryGrades = grades[category.id] || [];
    const categoryAverage = calculateCategoryAverage(categoryGrades);
    
    if (categoryAverage > 0) {
      const weightedScore = (categoryAverage * category.weight) / 100;
      totalWeightedScore += weightedScore;
      totalWeight += category.weight;
    }
  });
  
  if (totalWeight > 0) {
    return (totalWeightedScore / totalWeight) * 100;
  }
  
  return 0;
};

/**
 * Calculate grade needed on remaining assessments to reach target
 */
export const calculateGradeNeededForTarget = (currentGrade, targetGrade, completedWeight, remainingWeight) => {
  if (remainingWeight <= 0) {
    return currentGrade >= targetGrade ? 0 : null; // Already achieved or impossible
  }
  
  const currentWeightedScore = (currentGrade * completedWeight) / 100;
  const targetWeightedScore = (targetGrade * (completedWeight + remainingWeight)) / 100;
  const neededWeightedScore = targetWeightedScore - currentWeightedScore;
  
  const gradeNeeded = (neededWeightedScore / remainingWeight) * 100;
  
  return Math.max(0, Math.min(100, gradeNeeded));
};

/**
 * Calculate GPA impact of a specific score
 */
export const calculateGPAImpact = (currentGPA, newScore, maxScore, categoryWeight, totalWeight) => {
  const newPercentage = (newScore / maxScore) * 100;
  const newGPA = calculateGPAFromPercentage(newPercentage);
  
  // Calculate weighted impact
  const impact = ((newGPA - currentGPA) * categoryWeight) / totalWeight;
  
  return {
    newGPA,
    impact,
    newPercentage,
    weightedImpact: impact
  };
};

/**
 * Calculate semester GPA from course GPAs
 */
export const calculateSemesterGPA = (courseGPAs, creditHours) => {
  if (!courseGPAs || courseGPAs.length === 0 || !creditHours || creditHours.length === 0) {
    return 0;
  }
  
  let totalQualityPoints = 0;
  let totalCredits = 0;
  
  courseGPAs.forEach((gpa, index) => {
    const credits = creditHours[index] || 0;
    totalQualityPoints += gpa * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
};

/**
 * Calculate cumulative GPA from semester GPAs
 */
export const calculateCumulativeGPA = (semesterGPAs, semesterCredits) => {
  if (!semesterGPAs || semesterGPAs.length === 0 || !semesterCredits || semesterCredits.length === 0) {
    return 0;
  }
  
  let totalQualityPoints = 0;
  let totalCredits = 0;
  
  semesterGPAs.forEach((gpa, index) => {
    const credits = semesterCredits[index] || 0;
    totalQualityPoints += gpa * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
};

/**
 * Convert GPA to letter grade
 */
export const gpaToLetterGrade = (gpa) => {
  if (gpa >= 4.0) return 'A+';
  if (gpa >= 3.7) return 'A';
  if (gpa >= 3.3) return 'A-';
  if (gpa >= 3.0) return 'B+';
  if (gpa >= 2.7) return 'B';
  if (gpa >= 2.3) return 'B-';
  if (gpa >= 2.0) return 'C+';
  if (gpa >= 1.7) return 'C';
  if (gpa >= 1.3) return 'C-';
  if (gpa >= 1.0) return 'D+';
  if (gpa >= 0.7) return 'D';
  return 'F';
};

/**
 * Convert percentage to letter grade
 */
export const percentageToLetterGrade = (percentage) => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
};
