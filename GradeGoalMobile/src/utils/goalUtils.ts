// ========================================
// GOAL UTILITY FUNCTIONS
// ========================================
// This file contains utility functions for goal-related operations

/**
 * Convert goal type enum to readable label
 */
export const getGoalTypeLabel = (goalType: string): string => {
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
export const getPriorityColor = (priority: string): string => {
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
export const getCourseName = (courseId: number, courses: any[]): string => {
  const course = courses.find(c => c.courseId === courseId);
  return course ? course.courseName : 'Unknown Course';
};

/**
 * Format date for display
 */
export const formatGoalDate = (dateString: string | null): string => {
  if (!dateString) return 'No date';
  
  // Handle different date formats from API
  let date: Date;
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
export const hasExistingGoal = (courseId: number, existingGoals: any[], currentGoalId: number | null = null): boolean => {
  return existingGoals.some(goal => 
    goal.goalType === 'COURSE_GRADE' && 
    goal.courseId === courseId &&
    goal.goalId !== currentGoalId
  );
};

/**
 * Get available courses for goal creation
 */
export const getAvailableCourses = (courses: any[], existingGoals: any[], currentGoalId: number | null = null): any[] => {
  return courses.filter(course => 
    !hasExistingGoal(course.courseId, existingGoals, currentGoalId)
  );
};

/**
 * Get goal type icon
 */
export const getGoalTypeIcon = (goalType: string): string => {
  switch (goalType) {
    case 'COURSE_GRADE':
      return '📚';
    case 'SEMESTER_GPA':
      return '📊';
    case 'CUMMULATIVE_GPA':
      return '🎓';
    default:
      return '🎯';
  }
};

/**
 * Get goal type colors for mobile
 */
export const getGoalTypeColors = (goalType: string) => {
  switch (goalType) {
    case 'COURSE_GRADE':
      return {
        primary: '#10B981', // green-500
        secondary: '#DCFCE7', // green-100
        background: '#F0FDF4' // green-50
      };
    case 'SEMESTER_GPA':
      return {
        primary: '#8B5CF6', // purple-500
        secondary: '#E9D5FF', // purple-100
        background: '#FAF5FF' // purple-50
      };
    case 'CUMMULATIVE_GPA':
      return {
        primary: '#F97316', // orange-500
        secondary: '#FED7AA', // orange-100
        background: '#FFF7ED' // orange-50
      };
    default:
      return {
        primary: '#6B7280', // gray-500
        secondary: '#F3F4F6', // gray-100
        background: '#F9FAFB' // gray-50
      };
  }
};

/**
 * Get priority colors for mobile
 */
export const getPriorityColors = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return {
        primary: '#DC2626', // red-600
        secondary: '#FEE2E2', // red-100
        background: '#FEF2F2' // red-50
      };
    case 'MEDIUM':
      return {
        primary: '#D97706', // amber-600
        secondary: '#FEF3C7', // amber-100
        background: '#FFFBEB' // amber-50
      };
    case 'LOW':
      return {
        primary: '#059669', // emerald-600
        secondary: '#D1FAE5', // emerald-100
        background: '#ECFDF5' // emerald-50
      };
    default:
      return {
        primary: '#6B7280', // gray-500
        secondary: '#F3F4F6', // gray-100
        background: '#F9FAFB' // gray-50
      };
  }
};
