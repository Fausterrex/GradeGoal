// ========================================
// PROGRESS CALCULATION SERVICE
// ========================================
// Centralized service for calculating course progress across all components
// This ensures consistency and eliminates duplicate calculation logic

/**
 * Calculate overall course progress based on semester term completion
 * This is the single source of truth for progress calculation
 * 
 * @param {Object} course - Course object with completion status
 * @param {Array} categories - Assessment categories (optional, for fallback)
 * @param {Object} grades - Grades data (optional, for fallback)
 * @returns {number} Progress percentage (0-100)
 */
export const calculateCourseProgress = (course, categories = null, grades = null) => {
  // Priority 1: Course is fully completed
  if (course.isCompleted === true) {
    return 100;
  }
  
  // Priority 2: Use midterm completion status if available
  if (course.isMidtermCompleted !== undefined) {
    return course.isMidtermCompleted ? 50 : 0;
  }
  
  // Priority 3: Fallback to assessment-based calculation
  if (categories && grades) {
    const assessmentProgress = calculateAssessmentBasedProgress(categories, grades);
    
    // If course is not completed and has high assessment progress,
    // assume it's midterm progress and cap at 50%
    if (course.isCompleted !== true && assessmentProgress > 50) {
      return 50; // Assume midterm is done but course is not fully completed
    }
    
    return assessmentProgress;
  }
  
  // Priority 4: Default fallback
  return 0;
};

/**
 * Calculate progress based on assessment completion (fallback method)
 * @param {Array} categories - Assessment categories
 * @param {Object} grades - Grades data
 * @returns {number} Progress percentage (0-100)
 */
const calculateAssessmentBasedProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  
  categories.forEach((category) => {
    const categoryGrades = grades[category.id] || [];
    
    // Each category should have at least 1 assessment for a complete course
    const expectedInCategory = Math.max(categoryGrades.length, 1);
    totalExpectedAssessments += expectedInCategory;
    
    // Count completed assessments in this category
    categoryGrades.forEach((grade) => {
      if (hasValidScore(grade)) {
        completedAssessments++;
      }
    });
  });
  
  return totalExpectedAssessments > 0 ? (completedAssessments / totalExpectedAssessments) * 100 : 0;
};

/**
 * Check if a grade has a valid score
 * @param {Object} grade - Grade object
 * @returns {boolean} True if grade has valid score
 */
const hasValidScore = (grade) => {
  return grade && 
         grade.percentageScore !== null && 
         grade.percentageScore !== undefined &&
         grade.percentageScore >= 0;
};

/**
 * Get progress status text based on progress percentage
 * @param {number} progress - Progress percentage
 * @returns {string} Status text
 */
export const getProgressStatus = (progress) => {
  if (progress >= 100) return "Completed";
  if (progress >= 50) return "Midterm Done";
  if (progress > 0) return "In Progress";
  return "Not Started";
};

/**
 * Get progress color based on progress percentage
 * @param {number} progress - Progress percentage
 * @returns {string} CSS color class
 */
export const getProgressColor = (progress) => {
  if (progress >= 100) return "text-green-600";
  if (progress >= 50) return "text-blue-600";
  if (progress > 0) return "text-yellow-600";
  return "text-gray-600";
};
