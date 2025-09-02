/**
 * Grade Calculations Utility
 * 
 * Provides comprehensive grade calculation and conversion functions for the GradeGoal application.
 * Supports multiple grading scales (percentage, GPA, points) with various GPA scale configurations.
 * Handles extra credit calculations, weighted averages, and grade validation.
 */

// Grading scale constants
export const GRADING_SCALES = {
  PERCENTAGE: 'percentage',
  GPA: 'gpa',
  POINTS: 'points'
};

// GPA scale configurations with support for inverted scales
export const GPA_SCALES = {
  '4.0': { max: 4.0, min: 1.0, inverted: false },
  '5.0': { max: 5.0, min: 1.0, inverted: false },
  'inverted-4.0': { max: 4.0, min: 1.0, inverted: true },
  'inverted-5.0': { max: 5.0, min: 1.0, inverted: true }
};

/**
 * Convert percentage to GPA based on specified scale
 * @param {number} percentage - Percentage value (0-100)
 * @param {string} gpaScale - GPA scale configuration key
 * @returns {number} GPA value rounded to 2 decimal places
 */
export function convertPercentageToGPA(percentage, gpaScale = '4.0') {
  const scale = GPA_SCALES[gpaScale];
  if (!scale) return 0;

  let gpa;
  if (scale.inverted) {
    // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
    gpa = scale.max - ((percentage / 100) * (scale.max - scale.min));
  } else {
    // Standard scale: 1.0 = F (0%), 4.0/5.0 = A (100%)
    gpa = scale.min + ((percentage / 100) * (scale.max - scale.min));
  }

  return Math.round(gpa * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert GPA to percentage based on specified scale
 * @param {number} gpa - GPA value
 * @param {string} gpaScale - GPA scale configuration key
 * @returns {number} Percentage value rounded to 2 decimal places
 */
export function convertGPAToPercentage(gpa, gpaScale = '4.0') {
  const scale = GPA_SCALES[gpaScale];
  if (!scale) return 0;

  let percentage;
  if (scale.inverted) {
    // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
    percentage = ((scale.max - gpa) / (scale.max - scale.min)) * 100;
  } else {
    // Standard scale: 1.0 = F (0%), 4.0/5.0 = A (100%)
    percentage = ((gpa - scale.min) / (scale.max - scale.min)) * 100;
  }

  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert grade to percentage for calculations
 * Always calculates percentage from score/maxScore regardless of course grading scale
 * @param {Object} grade - Grade object with score, maxScore, and extra credit info
 * @param {string} scale - Grading scale type
 * @param {number} maxPoints - Maximum points for points-based grading
 * @returns {number} Percentage value
 */
export function convertGradeToPercentage(grade, scale, maxPoints = 100) {
  if (!grade || grade.score === null || grade.score === undefined || grade.score === '') {
    return 0;
  }

  let adjustedScore = grade.score;
  
  // Add extra credit points if this is an extra credit assessment
  if (grade.isExtraCredit && grade.extraCreditPoints) {
    adjustedScore += grade.extraCreditPoints;
  }

  if (scale === GRADING_SCALES.PERCENTAGE) {
    return Math.min(adjustedScore, 100); // Cap at 100%
  } else if (scale === GRADING_SCALES.GPA) {
    // Convert GPA to percentage (assuming 4.0 = 100%, 0.0 = 0%)
    return (adjustedScore / 4.0) * 100;
  } else if (scale === GRADING_SCALES.POINTS) {
    return (adjustedScore / maxPoints) * 100;
  }
  
  return 0;
}

/**
 * Convert percentage to desired scale
 * @param {number} percentage - Percentage value (0-100)
 * @param {string} scale - Target grading scale
 * @param {number} maxPoints - Maximum points for points-based grading
 * @param {string} gpaScale - GPA scale for GPA conversions
 * @returns {number} Converted value in target scale
 */
export function convertPercentageToScale(percentage, scale, maxPoints = 100, gpaScale = '4.0') {
  if (scale === GRADING_SCALES.PERCENTAGE) {
    return Math.round(percentage);
  } else if (scale === GRADING_SCALES.GPA) {
    return convertPercentageToGPA(percentage, gpaScale);
  } else if (scale === GRADING_SCALES.POINTS) {
    return Math.round((percentage / 100) * maxPoints);
  }
  return percentage;
}

/**
 * Calculate category average from grades
 * @param {Array} grades - Array of grade objects
 * @param {string} scale - Grading scale type
 * @param {number} maxPoints - Maximum points for points-based grading
 * @param {string} handleMissing - How to handle missing grades ('exclude' or 'zero')
 * @returns {number} Average percentage for the category
 */
export function calculateCategoryAverage(grades, scale, maxPoints = 100, handleMissing = 'exclude') {
  if (!grades || grades.length === 0) return 0;
  
  let validGrades = grades.filter(grade => {
    if (handleMissing === 'exclude') {
      return grade.score !== null && grade.score !== undefined && grade.score !== '' &&
             grade.maxScore !== null && grade.maxScore !== undefined && grade.maxScore !== '';
    } else {
      return true; // treat missing as 0
    }
  });
  
  if (validGrades.length === 0) return 0;
  
  const totalPercentage = validGrades.reduce((sum, grade) => {
    let adjustedScore = grade.score || 0;
    
    // Add extra credit points if this is an extra credit assessment
    if (grade.isExtraCredit && grade.extraCreditPoints) {
      adjustedScore += grade.extraCreditPoints;
    }
    
    // Calculate percentage with adjusted score
    const percentage = (adjustedScore / grade.maxScore) * 100;
    return sum + percentage;
  }, 0);
  
  return totalPercentage / validGrades.length;
}

/**
 * Calculate weighted course grade from categories
 * @param {Array} categories - Array of category objects with weights and grades
 * @param {string} gradingScale - Course grading scale
 * @param {number} maxPoints - Maximum points for points-based grading
 * @param {string} handleMissing - How to handle missing grades
 * @returns {number} Weighted course grade
 */
export function calculateCourseGrade(categories, gradingScale, maxPoints = 100, handleMissing = 'exclude') {
  if (!categories || categories.length === 0) return 0;
  
  let totalWeightedGrade = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    if (category.weight && category.grades) {
      const categoryAverage = calculateCategoryAverage(
        category.grades, 
        category.gradingScale || gradingScale, 
        maxPoints, 
        handleMissing
      );
      
      totalWeightedGrade += (categoryAverage * category.weight);
      totalWeight += category.weight;
    }
  });
  
  if (totalWeight === 0) return 0;
  
  return totalWeightedGrade / totalWeight;
}

/**
 * Calculate extra credit impact on overall grade
 * @param {Array} grades - Array of grade objects
 * @param {string} scale - Grading scale type
 * @param {number} maxPoints - Maximum points for points-based grading
 * @returns {number} Average extra credit percentage
 */
export function calculateExtraCredit(grades, scale, maxPoints = 100) {
  if (!grades || grades.length === 0) return 0;
  
  const extraCreditGrades = grades.filter(grade => grade.isExtraCredit);
  if (extraCreditGrades.length === 0) return 0;
  
  const totalExtraCredit = extraCreditGrades.reduce((sum, grade) => {
    const percentage = convertGradeToPercentage(grade, scale, maxPoints);
    return sum + percentage;
  }, 0);
  
  return totalExtraCredit / extraCreditGrades.length;
}

/**
 * Get color class for grade display based on percentage
 * @param {number} percentage - Grade percentage
 * @returns {string} Tailwind CSS color class
 */
export function getGradeColor(percentage) {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Validate grade input based on scale and constraints
 * @param {number} grade - Grade value to validate
 * @param {string} scale - Grading scale type
 * @param {number} maxPoints - Maximum points for points-based grading
 * @returns {boolean} True if grade is valid for the scale
 */
export function validateGrade(grade, scale, maxPoints = 100) {
  if (scale === GRADING_SCALES.PERCENTAGE) {
    return grade >= 0 && grade <= 100;
  } else if (scale === GRADING_SCALES.GPA) {
    return grade >= 0 && grade <= 4.0;
  } else if (scale === GRADING_SCALES.POINTS) {
    return grade >= 0 && grade <= maxPoints;
  }
  return false;
}
