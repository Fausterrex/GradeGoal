// ========================================
// GOAL PROGRESS CALCULATION UTILITY
// ========================================
// This utility calculates goal progress, achievement probability,
// and provides visual progress indicators for academic goals.

import { calculateCumulativeGPA } from '../../../utils/cgpa';
import GradeService from '../../../services/gradeService';

/**
 * Calculate goal progress for different goal types
 * @param {Object} goal - The academic goal object
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Object containing course grades
 * @param {Object} userStats - User statistics (current GPA, etc.)
 * @returns {Object} Progress information
 */
export const calculateGoalProgress = (goal, courses, grades, userStats = {}, allGoals = []) => {
  if (!goal) {
    return {
      progress: 0,
      currentValue: 0,
      targetValue: goal?.targetValue || 0,
      isAchieved: false,
      isOnTrack: false,
      achievementProbability: 0,
      remainingValue: 0,
      progressPercentage: 0,
      status: 'not_started',
      isCourseCompleted: false,
      courseCompletionStatus: 'ongoing'
    };
  }

  const targetValue = parseFloat(goal.targetValue) || 0;
  let currentValue = 0;
  let progress = 0;
  let isAchieved = false;
  let isOnTrack = false;
  let achievementProbability = 0;
  let remainingValue = 0;
  let status = 'not_started';
  let isCourseCompleted = false;
  let courseCompletionStatus = 'ongoing';
  

  try {
    switch (goal.goalType) {
      case 'COURSE_GRADE':
        const courseResult = calculateCourseGradeProgress(goal, courses, grades);
        currentValue = courseResult.currentValue;
        isCourseCompleted = courseResult.isCourseCompleted;
        courseCompletionStatus = courseResult.courseCompletionStatus;
        break;
      case 'SEMESTER_GPA':
        currentValue = calculateSemesterGPAProgress(goal, courses, grades, userStats, allGoals);
        break;
      case 'CUMMULATIVE_GPA':
        currentValue = calculateCumulativeGPAProgress(goal, courses, grades, userStats);
        break;
      default:
        return getDefaultProgress(targetValue);
    }

    // Handle unit conversion for GPA goals
    let normalizedCurrentValue = currentValue;
    let normalizedTargetValue = targetValue;

    // Calculate progress percentage
    if (targetValue > 0) {
      
      if (goal.goalType === 'SEMESTER_GPA' || goal.goalType === 'CUMMULATIVE_GPA') {
        // For semester GPA goals, we now use completion progress (0-100%)
        // So both current and target should be in percentage format
        if (goal.goalType === 'SEMESTER_GPA') {
          // Current value is already completion progress (0-100%)
          normalizedCurrentValue = currentValue; // Already in percentage
          normalizedTargetValue = targetValue; // Already in percentage
          
        } else if (goal.goalType === 'CUMMULATIVE_GPA') {
          // For cumulative GPA, still use GPA values
          if (targetValue > 4.0) {
            // Convert GPA to percentage (assuming 4.0 scale)
            normalizedCurrentValue = (currentValue / 4.0) * 100;
            normalizedTargetValue = targetValue; // Already in percentage
          } else {
            // Both are GPA values
            normalizedCurrentValue = currentValue;
            normalizedTargetValue = targetValue;
          }
        }
      }
      
      if (isCourseCompleted) {
        // Course is completed - show final result
        progress = 100; // Course is 100% complete
        isAchieved = normalizedCurrentValue >= normalizedTargetValue; // Did we meet the target?
        isOnTrack = isAchieved; // If achieved, we're on track
        remainingValue = isAchieved ? 0 : Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
        
        // Check if close to goal (within 20% of target) - more generous threshold
        const isCloseToGoal = normalizedCurrentValue >= normalizedTargetValue * 0.8 && normalizedCurrentValue < normalizedTargetValue;
        
        if (isAchieved) {
          status = 'achieved';
        } else if (isCloseToGoal) {
          status = 'close_to_goal';
        } else {
          status = 'not_achieved';
        }
      } else {
        // Course is ongoing - show progress toward target
        progress = Math.min((normalizedCurrentValue / normalizedTargetValue) * 100, 100);
        isAchieved = normalizedCurrentValue >= normalizedTargetValue;
        isOnTrack = normalizedCurrentValue >= normalizedTargetValue * 0.4; // 40% threshold
        remainingValue = Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
        
        // Check if close to goal for ongoing courses (within 20% of target) - more generous threshold
        const isCloseToGoal = normalizedCurrentValue >= normalizedTargetValue * 0.8 && normalizedCurrentValue < normalizedTargetValue;
        
        if (isAchieved) {
          status = 'achieved';
        } else if (isCloseToGoal) {
          status = 'close_to_goal';
        } else if (isOnTrack) {
          status = 'on_track';
        } else {
          status = 'needs_improvement';
        }
      }
    }

    // Calculate achievement probability using normalized values
    achievementProbability = calculateAchievementProbability(
      normalizedCurrentValue,
      normalizedTargetValue,
      goal.goalType,
      goal.targetDate
    );

    // Status is already determined above in the course completion logic
    // No need to override it here

    const result = {
      progress: Math.round(progress),
      currentValue: Math.round(normalizedCurrentValue * 100) / 100,
      targetValue: Math.round(normalizedTargetValue * 100) / 100,
      isAchieved,
      isOnTrack,
      achievementProbability: Math.round(achievementProbability),
      remainingValue: Math.round(remainingValue * 100) / 100,
      progressPercentage: Math.round(progress),
      status,
      isCourseCompleted,
      courseCompletionStatus
    };
    
    
    return result;
  } catch (error) {
    console.error('Error calculating goal progress:', error);
    return getDefaultProgress(targetValue);
  }
};

/**
 * Calculate progress for course-specific goals
 */
const calculateCourseGradeProgress = (goal, courses, grades) => {
  if (!goal.courseId) return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };

  const course = courses.find(c => c.courseId === goal.courseId);
  
  if (!course || !course.categories) return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };

  try {
    // Use pre-calculated progress from MainDashboard instead of recalculating
    const courseProgress = course.progress || 0;
    const isCourseCompleted = courseProgress >= 100;
    
    const gradeResult = GradeService.calculateCourseGrade(course, grades);
    
    if (gradeResult.success) {
      let courseGrade = gradeResult.courseGrade;
      
      // Convert to percentage if needed for comparison
      if (course.gradingScale === 'gpa') {
        // If it's a GPA scale, convert GPA to percentage
        courseGrade = convertGPAToPercentage(courseGrade, course.gpaScale || '4.0');
      } else if (course.gradingScale === 'points') {
        // If it's a points scale, convert to percentage
        courseGrade = (courseGrade / course.maxPoints) * 100;
      }
      // If it's already percentage, use as-is
      
      return { 
        currentValue: courseGrade, 
        isCourseCompleted,
        courseCompletionStatus: isCourseCompleted ? 'completed' : 'ongoing'
      };
    } else {
    }
  } catch (error) {
    console.error('Error calculating course grade progress:', error);
  }
  
  return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };
};

/**
 * Calculate progress for semester GPA goals
 */
const calculateSemesterGPAProgress = (goal, courses, grades, userStats, goals) => {
  try {

    // Get courses for the specific semester and academic year
    const currentSemesterCourses = courses.filter(course => 
      course.isActive !== false &&
      course.semester === goal.semester &&
      course.academicYear === goal.academicYear
    );

    


    if (currentSemesterCourses.length === 0) {
      return 0;
    }

    // Calculate progress based on course completion status
    let totalCompletionProgress = 0;
    let completedCourses = 0;
    
    for (const course of currentSemesterCourses) {
      // Use the pre-calculated progress from MainDashboard
      const courseProgress = course.progress || 0;
      
      totalCompletionProgress += courseProgress;
      
      if (courseProgress === 100) {
        completedCourses++;
      }
    }
    
    // Calculate average completion progress
    const averageCompletionProgress = totalCompletionProgress / currentSemesterCourses.length;
    
    
    
    return averageCompletionProgress || 0;
  } catch (error) {
    console.error('Error calculating semester GPA progress:', error);
  return userStats.currentSemesterGPA || 0;
  }
};

/**
 * Calculate progress for cumulative GPA goals
 */
const calculateCumulativeGPAProgress = (goal, courses, grades, userStats) => {
  try {
    // Get all completed courses across all semesters
    const allCourses = courses.filter(course => 
      course.isActive !== false && 
      course.semester && 
      course.academicYear
    );

    if (allCourses.length === 0) {
      return 0;
    }

    // Calculate cumulative GPA based on all completed courses
    const cumulativeGPA = calculateCumulativeGPA(allCourses, grades);
    
    return cumulativeGPA || 0;
  } catch (error) {
    console.error('Error calculating cumulative GPA progress:', error);
  return userStats.currentCGPA || 0;
  }
};

/**
 * Calculate achievement probability based on current performance and time remaining
 */
const calculateAchievementProbability = (currentValue, targetValue, goalType, targetDate) => {
  if (!targetValue || targetValue <= 0) return 0;
  if (currentValue >= targetValue) return 100;
  
  // If no progress has been made, probability should be 0
  if (currentValue <= 0) return 0;

  // Base probability from current progress
  const baseProgress = (currentValue / targetValue) * 100;
  
  // Time factor (if target date is set)
  let timeFactor = 1;
  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const totalDays = Math.max((target - now) / (1000 * 60 * 60 * 24), 1);
    const daysElapsed = Math.max(365 - totalDays, 0); // Assuming 1 year timeline
    
    if (totalDays > 0) {
      timeFactor = Math.min(daysElapsed / 365, 1);
    }
  }

  // More realistic probability calculation
  // Base probability should be much more optimistic for reasonable progress
  let probability = baseProgress;
  
  // Apply goal type modifiers (less conservative)
  let modifier = 1;
  switch (goalType) {
    case 'COURSE_GRADE':
      modifier = 1.1; // Course grades are easier to improve
      break;
    case 'SEMESTER_GPA':
      modifier = 1.0; // Semester GPA is moderately achievable
      break;
    case 'CUMMULATIVE_GPA':
      modifier = 0.9; // Cumulative GPA is harder but not impossible
      break;
  }

  // Apply time factor as a bonus, not a penalty
  if (targetDate) {
    const timeBonus = timeFactor * 0.1; // Up to 10% bonus for time remaining
    probability += timeBonus * 100;
  }
  
  // Ensure probability is realistic - if you're at 70% progress, you should have at least 50% chance
  const minimumProbability = Math.min(baseProgress * 0.7, 50); // At least 70% of progress, max 50%
  probability = Math.max(probability * modifier, minimumProbability);

  return Math.min(Math.max(probability, 0), 100);
};

/**
 * Get default progress object
 */
const getDefaultProgress = (targetValue) => ({
  progress: 0,
  currentValue: 0,
  targetValue: targetValue || 0,
  isAchieved: false,
  isOnTrack: false,
  achievementProbability: 0,
  remainingValue: targetValue || 0,
  progressPercentage: 0,
  status: 'not_started',
  isCourseCompleted: false,
  courseCompletionStatus: 'ongoing'
});

/**
 * Get status color and text for progress indicators
 */
export const getProgressStatusInfo = (status) => {
  switch (status) {
    case 'achieved':
      return {
        color: 'green',
        text: 'Achieved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-500'
      };
    case 'not_achieved':
      return {
        color: 'orange',
        text: 'Not Achieved - Keep Going!',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-500'
      };
    case 'close_to_goal':
      return {
        color: 'purple',
        text: 'So Close!',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-500'
      };
    case 'on_track':
      return {
        color: 'blue',
        text: 'On Track',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-500'
      };
    case 'at_risk':
      return {
        color: 'yellow',
        text: 'At Risk',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500'
      };
    case 'needs_improvement':
      return {
        color: 'red',
        text: 'Needs Improvement',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-500'
      };
    default:
      return {
        color: 'gray',
        text: 'Not Started',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-500'
      };
  }
};

/**
 * Get progress bar color based on status
 */
export const getProgressBarColor = (status, progress) => {
  switch (status) {
    case 'achieved':
      return 'bg-gradient-to-r from-green-500 to-green-600';
    case 'not_achieved':
      return 'bg-gradient-to-r from-orange-500 to-orange-600';
    case 'close_to_goal':
      return 'bg-gradient-to-r from-purple-500 to-purple-600';
    case 'on_track':
      return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'at_risk':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    case 'needs_improvement':
      return 'bg-gradient-to-r from-red-500 to-red-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
};
