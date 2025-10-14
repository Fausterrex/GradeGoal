// ========================================
// GOAL PROGRESS CALCULATION UTILITY
// ========================================
// This utility calculates goal progress, achievement probability,
// and provides visual progress indicators for academic goals.

import { percentageToGPA } from './gpaConversionUtils';

// Cache for database calculations to prevent infinite loops
const calculationCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Clear expired cache entries
 */
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of calculationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      calculationCache.delete(key);
    }
  }
};

// Clear expired cache every 5 minutes
setInterval(clearExpiredCache, 300000);

/**
 * Cached database calculation to prevent infinite loops
 */
const getCachedCourseGrade = async (courseId: number): Promise<number> => {
  const cacheKey = `course_grade_${courseId}`;
  const now = Date.now();
  
  // Check if we have a valid cached result
  if (calculationCache.has(cacheKey)) {
    const cached = calculationCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }
  
  // Make the database call to get course GPA
  try {
    // Import the API function
    const { CourseService } = await import('../services/courseService');
    
    // Get course data including the calculated GPA
    const courseData = await CourseService.getCourseById(courseId);
    const result = courseData?.courseGpa || 0;
    
    
    calculationCache.set(cacheKey, {
      data: result,
      timestamp: now
    });
    return result;
  } catch (error) {
    console.warn('Database calculation failed:', error);
    throw error;
  }
};

/**
 * Calculate goal progress for different goal types using database calculations
 */
export const calculateGoalProgress = async (
  goal: any, 
  courses: any[], 
  grades: any, 
  userStats: any = {}, 
  allGoals: any[] = []
): Promise<any> => {
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
        const courseResult = await calculateCourseGradeProgress(goal, courses, grades);
        currentValue = courseResult.currentValue;
        isCourseCompleted = courseResult.isCourseCompleted;
        courseCompletionStatus = courseResult.courseCompletionStatus;
        break;
      case 'SEMESTER_GPA':
        currentValue = await calculateSemesterGPAProgress(goal, courses, grades, userStats, allGoals);
        break;
      case 'CUMMULATIVE_GPA':
        currentValue = await calculateCumulativeGPAProgress(goal, courses, grades, userStats);
        break;
      default:
        return getDefaultProgress(targetValue);
    }

    // Handle unit conversion for GPA goals
    let normalizedCurrentValue = currentValue;
    let normalizedTargetValue = targetValue;

    // Convert target value from percentage to GPA if needed
    if (goal.goalType === 'COURSE_GRADE') {
      // For course grade goals, convert target from percentage to GPA
      const { convertToGPA } = await import('./gpaConversionUtils');
      normalizedCurrentValue = currentValue; // Already GPA from course_gpa column
      normalizedTargetValue = convertToGPA(targetValue, 4.0); // Convert target to GPA if needed
    } else if (goal.goalType === 'SEMESTER_GPA' || goal.goalType === 'CUMMULATIVE_GPA') {
      // For semester and cumulative GPA goals, convert target from percentage to GPA
      const { convertToGPA } = await import('./gpaConversionUtils');
      normalizedTargetValue = convertToGPA(targetValue, 4.0);
    }

    // Calculate progress percentage
    if (normalizedTargetValue > 0) {
      // Calculate progress percentage
      progress = Math.min((normalizedCurrentValue / normalizedTargetValue) * 100, 100);
      progress = Math.max(progress, 0);
      
      // Calculate remaining value needed
      remainingValue = Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
      
      // Determine if goal is achieved
      isAchieved = normalizedCurrentValue >= normalizedTargetValue;
      
      // Calculate achievement probability
      achievementProbability = calculateAchievementProbability(normalizedCurrentValue, normalizedTargetValue, goal.goalType, goal.targetDate);
      
      // Determine if on track
      isOnTrack = achievementProbability >= 0.7;
      
      // Determine status
      if (isAchieved) {
        status = 'achieved';
      } else if (isOnTrack) {
        status = 'on_track';
      } else {
        status = 'needs_focus';
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
      } else if (goal.goalType === 'SEMESTER_GPA') {
        // For semester GPA goals, calculate progress based on GPA achievement only
        const gpaAchieved = normalizedCurrentValue >= normalizedTargetValue;
        isOnTrack = normalizedCurrentValue >= normalizedTargetValue * 0.4; // 40% threshold
        remainingValue = Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
        
        // Calculate progress based on current GPA vs target GPA
        progress = gpaAchieved ? 100 : Math.min((normalizedCurrentValue / normalizedTargetValue) * 100, 100);
        
        // Goal is achieved when GPA target is met
        isAchieved = gpaAchieved;
        
        // Check if close to goal (within 20% of target) - more generous threshold
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
      } else if (goal.goalType === 'CUMMULATIVE_GPA') {
        // For cumulative GPA goals, calculate progress based on GPA achievement
        isAchieved = normalizedCurrentValue >= normalizedTargetValue;
        isOnTrack = normalizedCurrentValue >= normalizedTargetValue * 0.4; // 40% threshold
        remainingValue = Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
        
        // Calculate progress percentage based on GPA achievement
        if (isAchieved) {
          progress = 100; // Goal achieved = 100% progress
        } else {
          // Calculate progress as percentage of target achieved
          progress = Math.min((normalizedCurrentValue / normalizedTargetValue) * 100, 100);
        }
        
        // Check if close to goal (within 20% of target) - more generous threshold
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
      } else {
        // Course is ongoing - show progress based on GPA achievement, not course completion
        // Calculate progress as percentage of target GPA achieved
        progress = Math.min((normalizedCurrentValue / normalizedTargetValue) * 100, 100);
        
        // Goal cannot be achieved until course is manually marked as complete
        isAchieved = false; // Never achieved until course is completed
        isOnTrack = normalizedCurrentValue >= normalizedTargetValue * 0.4; // 40% threshold
        remainingValue = Math.max(normalizedTargetValue - normalizedCurrentValue, 0);
        
        // Check if close to goal for ongoing courses (within 20% of target) - more generous threshold
        const isCloseToGoal = normalizedCurrentValue >= normalizedTargetValue * 0.8 && normalizedCurrentValue < normalizedTargetValue;
        
        // Status cannot be 'achieved' until course is completed
        if (isCloseToGoal) {
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
 * Calculate progress for course-specific goals using database calculations
 */
const calculateCourseGradeProgress = async (goal: any, courses: any[], grades: any): Promise<any> => {
  if (!goal.courseId) return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };

  const course = courses.find(c => c.courseId === goal.courseId || c.id === goal.courseId);
  
  if (!course) return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };

  try {
    // Course is only considered completed if manually marked as complete
    const isCourseCompleted = course.isCompleted === true;
    
    let courseGrade = 0;
    
    // Try to use cached database calculation first if course has an ID
    if (course.id || course.courseId) {
      try {
        courseGrade = await getCachedCourseGrade(course.id || course.courseId);
      } catch (error) {
        // Fallback to JavaScript calculation using grades data
        courseGrade = calculateCourseGradeFromGrades(course, grades);
      }
    } else {
      // Fallback to JavaScript calculation
      courseGrade = calculateCourseGradeFromGrades(course, grades);
    }
    
    // courseGrade is now the GPA value
    return { 
      currentValue: courseGrade, // This is GPA (0-4.0)
      isCourseCompleted, 
      courseCompletionStatus: isCourseCompleted ? 'completed' : 'ongoing' 
    };
  } catch (error) {
    console.error('Error calculating course grade progress:', error);
    return { currentValue: 0, isCourseCompleted: false, courseCompletionStatus: 'ongoing' };
  }
};

/**
 * Calculate course grade from grades data
 */
const calculateCourseGradeFromGrades = (course: any, grades: any): number => {
  try {
    // Get grades for this course
    const courseGrades = grades[course.id] || grades[course.courseId] || [];
    
    if (!courseGrades || courseGrades.length === 0) {
      return 0;
    }

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Group grades by category
    const gradesByCategory: any = {};
    courseGrades.forEach((grade: any) => {
      const categoryId = grade.categoryId || grade.category_id;
      if (!gradesByCategory[categoryId]) {
        gradesByCategory[categoryId] = [];
      }
      gradesByCategory[categoryId].push(grade);
    });

    // Calculate category averages and apply weights
    Object.keys(gradesByCategory).forEach(categoryId => {
      const categoryGrades = gradesByCategory[categoryId];
      const category = course.categories?.find((c: any) => c.id === categoryId || c.categoryId === categoryId);
      
      if (category && categoryGrades.length > 0) {
        // Calculate average for this category
        const validGrades = categoryGrades.filter((grade: any) => 
          grade.score !== null && grade.score !== undefined && grade.maxScore > 0
        );
        
        if (validGrades.length > 0) {
          const categoryAverage = validGrades.reduce((sum: number, grade: any) => {
            const percentage = (grade.score / grade.maxScore) * 100;
            return sum + percentage;
          }, 0) / validGrades.length;
          
          const weight = category.weightPercentage || category.weight || 0;
          totalWeightedScore += categoryAverage * weight;
          totalWeight += weight;
        }
      }
    });

    if (totalWeight === 0) {
      return 0;
    }

    const finalPercentage = totalWeightedScore / totalWeight;
    
    // Convert percentage to GPA using the same conversion as the web version
    let gpa = 0;
    if (finalPercentage >= 95.5) gpa = 4.0;
    else if (finalPercentage >= 89.5) gpa = 3.5;
    else if (finalPercentage >= 83.5) gpa = 3.0;
    else if (finalPercentage >= 77.5) gpa = 2.5;
    else if (finalPercentage >= 71.5) gpa = 2.0;
    else if (finalPercentage >= 65.5) gpa = 1.5;
    else if (finalPercentage >= 59.5) gpa = 1.0;
    
    return gpa;
  } catch (error) {
    console.error('Error calculating course grade from grades:', error);
    return 0;
  }
};

/**
 * Calculate progress for semester GPA goals
 */
const calculateSemesterGPAProgress = async (goal: any, courses: any[], grades: any, userStats: any, goals: any[]): Promise<number> => {
  try {
    // Try to get semester GPA from userStats first
    if (userStats && userStats.semesterGPA) {
      return userStats.semesterGPA;
    }

    // Fallback: Calculate from courses for the specific semester
    let currentSemesterCourses = courses.filter(course => {
      if (course.isActive === false) return false;
      if (course.semester !== goal.semester) return false;
      
      // Handle academic year format mismatch
      // Goal format: "2025-2026", Course format: "2025"
      const courseAcademicYear = course.academicYear;
      const goalAcademicYear = goal.academicYear;
      
      // Direct match
      if (courseAcademicYear === goalAcademicYear) return true;
      
      // Handle year range format (e.g., "2025-2026" vs "2025")
      if (goalAcademicYear && goalAcademicYear.includes('-')) {
        const goalStartYear = goalAcademicYear.split('-')[0];
        if (courseAcademicYear === goalStartYear) return true;
      }
      
      // Handle single year format (e.g., "2025" vs "2025-2026")
      if (courseAcademicYear && !courseAcademicYear.includes('-') && goalAcademicYear && goalAcademicYear.includes('-')) {
        const goalStartYear = goalAcademicYear.split('-')[0];
        if (courseAcademicYear === goalStartYear) return true;
      }
      
      return false;
    });
    
    // If no courses found with specific semester/year, try fallback logic
    if (currentSemesterCourses.length === 0) {
      // If goal has specific semester, only fallback to FIRST semester if goal is for FIRST semester
      if (goal.semester === 'FIRST') {
        // Try to find courses from the FIRST semester as fallback for FIRST semester goals
        currentSemesterCourses = courses.filter(course => {
          if (course.isActive === false) return false;
          if (!(course.semester === 'FIRST' || course.semester === 'FIRST_SEMESTER' || course.semester === 1)) return false;
          
          // Also check academic year format for fallback
          const courseAcademicYear = course.academicYear;
          const goalAcademicYear = goal.academicYear;
          
          // Direct match
          if (courseAcademicYear === goalAcademicYear) return true;
          
          // Handle year range format (e.g., "2025-2026" vs "2025")
          if (goalAcademicYear && goalAcademicYear.includes('-')) {
            const goalStartYear = goalAcademicYear.split('-')[0];
            if (courseAcademicYear === goalStartYear) return true;
          }
          
          // Handle single year format (e.g., "2025" vs "2025-2026")
          if (courseAcademicYear && !courseAcademicYear.includes('-') && goalAcademicYear && goalAcademicYear.includes('-')) {
            const goalStartYear = goalAcademicYear.split('-')[0];
            if (courseAcademicYear === goalStartYear) return true;
          }
          
          return false;
        });
      } else if (!goal.semester || !goal.academicYear) {
        // If goal doesn't have specific semester/year (legacy goals), fallback to FIRST semester courses
        currentSemesterCourses = courses.filter(course => 
          course.isActive !== false &&
          (course.semester === 'FIRST' || course.semester === 'FIRST_SEMESTER' || course.semester === 1)
        );
      }
      // For SECOND/THIRD semester goals with specific values but no matching courses, return 0 (no fallback)
    }

    if (currentSemesterCourses.length === 0) {
      return 0;
    }

    // Calculate semester GPA based on course GPAs
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    
    for (const course of currentSemesterCourses) {
      const courseGPA = course.courseGpa || course.course_gpa || 0;
      const credits = course.credits || 3; // Default to 3 credits if not specified
      
      if (courseGPA > 0) {
        totalWeightedGPA += courseGPA * credits;
        totalCredits += credits;
      }
    }
    
    const semesterGPA = totalCredits > 0 ? totalWeightedGPA / totalCredits : 0;
    return semesterGPA || 0;
  } catch (error) {
    console.error('Error calculating semester GPA progress:', error);
    return userStats?.currentSemesterGPA || 0;
  }
};

/**
 * Calculate progress for cumulative GPA goals
 */
const calculateCumulativeGPAProgress = async (goal: any, courses: any[], grades: any, userStats: any): Promise<number> => {
  try {
    // Try to get cumulative GPA from userStats first
    if (userStats && userStats.cumulativeGPA) {
      return userStats.cumulativeGPA;
    }

    // Fallback: Calculate from courses if available
    const allCourses = courses.filter(course => 
      course.isActive !== false && 
      course.semester && 
      course.academicYear
    );
    if (allCourses.length === 0) {
      return 0;
    }

    // Calculate cumulative GPA based on all completed courses
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    
    for (const course of allCourses) {
      const courseGPA = course.courseGpa || course.course_gpa || 0;
      const credits = course.credits || 3; // Default to 3 credits if not specified
      
      if (courseGPA > 0) {
        totalWeightedGPA += courseGPA * credits;
        totalCredits += credits;
      }
    }
    
    const cumulativeGPA = totalCredits > 0 ? totalWeightedGPA / totalCredits : 0;
    return cumulativeGPA || 0;
  } catch (error) {
    console.error('Error calculating cumulative GPA progress:', error);
    return userStats?.currentCGPA || 0;
  }
};

/**
 * Calculate achievement probability based on current performance and time remaining
 */
const calculateAchievementProbability = (currentValue: number, targetValue: number, goalType: string, targetDate: string | null): number => {
  if (!targetValue || targetValue <= 0) return 0;
  
  // If goal is already achieved, return 100% immediately
  if (currentValue >= targetValue) return 100;
  
  // If no progress has been made, probability should be 0
  if (currentValue <= 0) return 0;

  // Base probability from current progress
  const baseProgress = (currentValue / targetValue) * 100;
  
  // Time factor (if target date is set) - more optimistic
  let timeFactor = 1;
  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const totalDays = Math.max((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), 1);
    
    if (totalDays > 30) {
      timeFactor = 1.1; // Bonus for having time
    } else if (totalDays > 7) {
      timeFactor = 1.0; // Neutral for reasonable time
    } else {
      timeFactor = 0.9; // Small penalty for very little time
    }
  }

  // Start with more optimistic baseline
  let probability = baseProgress;
  
  // Apply goal type modifiers (more optimistic)
  let modifier = 1;
  switch (goalType) {
    case 'COURSE_GRADE':
      modifier = 1.2; // Course grades are very achievable
      break;
    case 'SEMESTER_GPA':
      modifier = 1.1; // Semester GPA is quite achievable
      break;
    case 'CUMMULATIVE_GPA':
      modifier = 1.0; // Cumulative GPA is still achievable
      break;
  }

  // Apply time factor
  probability = probability * timeFactor;
  
  // Strong boosts for good progress
  if (baseProgress > 90) {
    probability = Math.min(probability * 1.3, 100); // 30% boost for excellent progress
  } else if (baseProgress > 80) {
    probability = Math.min(probability * 1.2, 100); // 20% boost for very good progress
  } else if (baseProgress > 70) {
    probability = Math.min(probability * 1.15, 100); // 15% boost for good progress
  }
  
  // Ensure realistic minimum probability for reasonable progress
  const minimumProbability = Math.min(baseProgress * 0.85, 85); // Much more optimistic minimum
  probability = Math.max(probability * modifier, minimumProbability);

  return Math.min(Math.max(probability, 0), 100);
};

/**
 * Get default progress object
 */
const getDefaultProgress = (targetValue: number): any => ({
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
export const getProgressStatusInfo = (status: string): any => {
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
export const getProgressBarColor = (status: string, progress: number): string => {
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
