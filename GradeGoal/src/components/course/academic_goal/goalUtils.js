// ========================================
// GOAL UTILITY FUNCTIONS
// ========================================
// This file contains utility functions for goal-related operations

/**
 * Convert goal type enum to readable label
 */
export const getGoalTypeLabel = (goalType) => {
  switch (goalType) {
    case 'COURSE_GRADE':
      return 'Course Grade';
    case 'SEMESTER_GPA':
      return 'Semester GPA';
    case 'CUMMULATIVE_GPA':
      return 'Cumulative GPA';
    default:
      return goalType;
  }
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-200 text-red-800 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-200 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-200 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get course name by course ID
 */
export const getCourseName = (courseId, courses) => {
  const course = courses.find(c => c.courseId === courseId);
  return course ? course.courseName : 'Unknown Course';
};


/**
 * Format date for display
 */
export const formatGoalDate = (dateString) => {
  if (!dateString) return 'No date';
  
  // Handle different date formats from API
  let date;
  if (typeof dateString === 'string') {
    // Try parsing as ISO string first
    date = new Date(dateString);
    
    // If invalid, try parsing as timestamp
    if (isNaN(date.getTime()) && !isNaN(parseInt(dateString))) {
      date = new Date(parseInt(dateString));
    }
  } else {
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString();
};

/**
 * Check if course has existing goal
 */
export const hasExistingGoal = (courseId, existingGoals, currentGoalId = null) => {
  return existingGoals.some(goal => 
    goal.goalType === 'COURSE_GRADE' && 
    goal.courseId === courseId &&
    goal.goalId !== currentGoalId
  );
};

/**
 * Get available courses for goal creation
 */
export const getAvailableCourses = (courses, existingGoals, currentGoalId = null) => {
  return courses.filter(course => 
    !hasExistingGoal(course.courseId, existingGoals, currentGoalId)
  );
};
