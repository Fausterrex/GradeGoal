// ========================================
// TARGET GPA UTILITY
// ========================================
// This utility handles all calculations related to target grade point averages
// from academic goals. It processes different types of goals and converts
// them to appropriate GPA values for display and comparison.

import GradeService from "../services/gradeService";

/**
 * Calculate semester target GPA from academic goals
 * @param {Array} goals - Array of academic goals
 * @returns {number} Semester target GPA (0-4.0 scale)
 */
export const calculateSemesterTargetGPA = (goals) => {
  if (!goals || !Array.isArray(goals)) {
    return 0;
  }

  try {
    // Find semester-level GPA goal
    const semesterGPAGoal = goals.find(
      (goal) => goal.goalType === "SEMESTER_GPA"
    );

    if (semesterGPAGoal) {
      let targetValue = semesterGPAGoal.targetValue;
      if (targetValue > 4.0) {
        // Convert percentage to GPA if needed
        targetValue = GradeService.convertPercentageToGPA(targetValue, "4.0");
      }
      return targetValue;
    }

    return 0;
  } catch (error) {
    console.error("Error calculating semester target GPA:", error);
    return 0;
  }
};

/**
 * Calculate cumulative target GPA from academic goals
 * @param {Array} goals - Array of academic goals
 * @returns {number} Cumulative target GPA (0-4.0 scale)
 */
export const calculateCumulativeTargetGPA = (goals) => {
  if (!goals || !Array.isArray(goals)) {
    return 0;
  }

  try {
    // Find cumulative GPA goal
    const cumulativeGPAGoal = goals.find(
      (goal) => goal.goalType === "CUMMULATIVE_GPA"
    );

    if (cumulativeGPAGoal) {
      let targetValue = cumulativeGPAGoal.targetValue;
      if (targetValue > 4.0) {
        // Convert percentage to GPA if needed
        targetValue = GradeService.convertPercentageToGPA(targetValue, "4.0");
      }
      return targetValue;
    }

    return 0;
  } catch (error) {
    console.error("Error calculating cumulative target GPA:", error);
    return 0;
  }
};

/**
 * Calculate course target GPA from academic goals
 * @param {Array} goals - Array of academic goals
 * @param {number} courseId - Course ID to filter by
 * @returns {number} Course target GPA (0-4.0 scale)
 */
export const calculateCourseTargetGPA = (goals, courseId) => {
  if (!goals || !Array.isArray(goals) || !courseId) {
    return 0;
  }

  try {
    // Find course-specific GPA goal
    const courseGPAGoal = goals.find(
      (goal) => goal.goalType === "COURSE_GRADE" && goal.courseId === courseId
    );

    if (courseGPAGoal) {
      let targetValue = courseGPAGoal.targetValue;
      if (targetValue > 4.0) {
        // Convert percentage to GPA if needed
        targetValue = GradeService.convertPercentageToGPA(targetValue, "4.0");
      }
      return targetValue;
    }

    return 0;
  } catch (error) {
    console.error(
      `Error calculating course target GPA for course ${courseId}:`,
      error
    );
    return 0;
  }
};

/**
 * Calculate average target GPA from course goals
 * @param {Array} goals - Array of academic goals
 * @param {Array} courses - Array of courses to calculate average for
 * @returns {number} Average target GPA (0-4.0 scale)
 */
export const calculateAverageCourseTargetGPA = (goals, courses) => {
  if (!goals || !Array.isArray(goals) || !courses || !Array.isArray(courses)) {
    return 0;
  }

  try {
    let totalTargetGPA = 0;
    let courseCount = 0;

    courses.forEach((course) => {
      const courseTargetGPA = calculateCourseTargetGPA(
        goals,
        course.id || course.courseId
      );
      if (courseTargetGPA > 0) {
        totalTargetGPA += courseTargetGPA;
        courseCount++;
      }
    });

    return courseCount > 0 ? totalTargetGPA / courseCount : 0;
  } catch (error) {
    console.error("Error calculating average course target GPA:", error);
    return 0;
  }
};

/**
 * Get comprehensive target GPA information
 * @param {Array} goals - Array of academic goals
 * @param {Array} courses - Array of courses
 * @returns {Object} Object containing all target GPA information
 */
export const getTargetGPAInfo = (goals, courses) => {
  if (!goals || !Array.isArray(goals)) {
    return {
      semesterTarget: 0,
      cumulativeTarget: 0,
      averageCourseTarget: 0,
      courseTargets: {},
      hasSemesterGoal: false,
      hasCumulativeGoal: false,
      hasCourseGoals: false,
    };
  }

  try {
    const semesterTarget = calculateSemesterTargetGPA(goals);
    const cumulativeTarget = calculateCumulativeTargetGPA(goals);
    const averageCourseTarget = calculateAverageCourseTargetGPA(
      goals,
      courses || []
    );

    // Get individual course targets
    const courseTargets = {};
    if (courses && Array.isArray(courses)) {
      courses.forEach((course) => {
        const courseId = course.id || course.courseId;
        courseTargets[courseId] = calculateCourseTargetGPA(goals, courseId);
      });
    }

    return {
      semesterTarget,
      cumulativeTarget,
      averageCourseTarget,
      courseTargets,
      hasSemesterGoal: semesterTarget > 0,
      hasCumulativeGoal: cumulativeTarget > 0,
      hasCourseGoals: averageCourseTarget > 0,
    };
  } catch (error) {
    console.error("Error getting target GPA info:", error);
    return {
      semesterTarget: 0,
      cumulativeTarget: 0,
      averageCourseTarget: 0,
      courseTargets: {},
      hasSemesterGoal: false,
      hasCumulativeGoal: false,
      hasCourseGoals: false,
    };
  }
};

/**
 * Calculate goal achievement progress
 * @param {number} currentGPA - Current GPA
 * @param {number} targetGPA - Target GPA
 * @returns {Object} Progress information
 */
export const calculateGoalProgress = (currentGPA, targetGPA) => {
  if (!targetGPA || targetGPA <= 0) {
    return {
      progress: 0,
      isAchieved: false,
      isOnTrack: false,
      remaining: 0,
      percentage: 0,
    };
  }

  try {
    const progress = Math.min((currentGPA / targetGPA) * 100, 100);
    const isAchieved = currentGPA >= targetGPA;
    const isOnTrack = currentGPA >= targetGPA * 0.8; // 80% threshold
    const remaining = Math.max(targetGPA - currentGPA, 0);
    const percentage = Math.round(progress);

    return {
      progress,
      isAchieved,
      isOnTrack,
      remaining,
      percentage,
    };
  } catch (error) {
    console.error("Error calculating goal progress:", error);
    return {
      progress: 0,
      isAchieved: false,
      isOnTrack: false,
      remaining: 0,
      percentage: 0,
    };
  }
};

/**
 * Get goal recommendations based on current performance
 * @param {number} currentGPA - Current GPA
 * @param {Object} targetInfo - Target GPA information
 * @returns {Array} Array of recommendation strings
 */
export const getGoalRecommendations = (currentGPA, targetInfo) => {
  const recommendations = [];

  try {
    if (targetInfo.hasSemesterGoal) {
      const semesterProgress = calculateGoalProgress(
        currentGPA,
        targetInfo.semesterTarget
      );

      if (semesterProgress.isAchieved) {
        recommendations.push(
          "🎉 Great job! You've achieved your semester goal!"
        );
      } else if (semesterProgress.isOnTrack) {
        recommendations.push(
          `📈 You're on track for your semester goal. Keep it up!`
        );
      } else {
        recommendations.push(
          `📚 Focus on improving your grades to reach your semester target of ${targetInfo.semesterTarget.toFixed(
            2
          )}`
        );
      }
    }

    if (targetInfo.hasCumulativeGoal) {
      const cumulativeProgress = calculateGoalProgress(
        currentGPA,
        targetInfo.cumulativeTarget
      );

      if (cumulativeProgress.isAchieved) {
        recommendations.push(
          "🌟 Excellent! You've achieved your cumulative goal!"
        );
      } else if (cumulativeProgress.isOnTrack) {
        recommendations.push(
          `🚀 You're making good progress toward your cumulative goal!`
        );
      } else {
        recommendations.push(
          `🎯 Work on improving your overall GPA to reach your cumulative target of ${targetInfo.cumulativeTarget.toFixed(
            2
          )}`
        );
      }
    }

    if (!targetInfo.hasSemesterGoal && !targetInfo.hasCumulativeGoal) {
      recommendations.push(
        "💡 Consider setting academic goals to track your progress!"
      );
    }

    return recommendations;
  } catch (error) {
    console.error("Error getting goal recommendations:", error);
    return ["Error calculating recommendations"];
  }
};
