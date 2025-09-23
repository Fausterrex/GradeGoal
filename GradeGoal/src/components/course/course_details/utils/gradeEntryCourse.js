// ========================================
// GRADE ENTRY COURSE UTILITIES
// ========================================
// This file contains all course-related functions for the GradeEntry component
// Functions: Course data management, navigation, state updates

import { getAcademicGoalsByCourse } from "../../../../backend/api";
import { getCourseColorScheme } from "../../../../utils/courseColors";
import { assessmentHasScore } from "./gradeEntryAssessments";

/**
 * Get course color scheme
 */
export const getCourseColors = (course) => {
  const courseName = course.name || course.courseName || 'Default Course';
  const colorIndex = course.colorIndex !== undefined ? course.colorIndex : 0;
  return getCourseColorScheme(courseName, colorIndex);
};

/**
 * Load target grade for a course
 */
export const loadCourseTargetGrade = async (userId, courseId) => {
  try {
    const goals = await getAcademicGoalsByCourse(userId, courseId);
    const courseGradeGoal = goals.find(
      (goal) =>
        goal.goalType === "COURSE_GRADE" &&
        goal.courseId === courseId
    );
    
    return {
      success: true,
      targetGrade: courseGradeGoal ? courseGradeGoal.targetValue : null
    };
  } catch (error) {
    console.error('Failed to load target grade:', error);
    return { success: false, error: error.message, targetGrade: null };
  }
};

/**
 * Calculate course progress based on completed assessments
 * Progress considers both existing assessments and expected assessments per category
 */
export const calculateCourseProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  
  categories.forEach((category) => {
    const categoryGrades = grades[category.id] || [];
    
    // Each category should have at least 1 assessment for a complete course
    // If category has assessments, count them; if empty, expect at least 1
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
 * Check if a grade has a valid score (using imported function)
 */
const hasValidScore = (grade) => {
  return assessmentHasScore(grade);
};

/**
 * Get course statistics
 */
export const getCourseStatistics = (categories, grades) => {
  let totalAssessments = 0;
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  
  categories.forEach((category) => {
    const categoryGrades = grades[category.id] || [];
    totalAssessments += categoryGrades.length;
    
    // Each category should have at least 1 assessment for a complete course
    const expectedInCategory = Math.max(categoryGrades.length, 1);
    totalExpectedAssessments += expectedInCategory;
    
    categoryGrades.forEach((grade) => {
      totalPoints += parseFloat(grade.maxScore || 0);
      
      if (hasValidScore(grade)) {
        completedAssessments++;
        earnedPoints += parseFloat(grade.score || 0);
      }
    });
  });
  
  return {
    totalAssessments,
    totalExpectedAssessments,
    completedAssessments,
    totalPoints,
    earnedPoints,
    completionPercentage: totalExpectedAssessments > 0 ? (completedAssessments / totalExpectedAssessments) * 100 : 0,
    overallPercentage: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0,
  };
};

/**
 * Determine if course is archived
 */
export const isCourseArchived = (course) => {
  return course.isActive === false;
};

/**
 * Get course display name
 */
export const getCourseDisplayName = (course) => {
  return course.name || course.courseName || 'Unnamed Course';
};

/**
 * Get course code for display
 */
export const getCourseCode = (course) => {
  return course.courseCode || '';
};

/**
 * Format course semester and year
 */
export const formatCoursePeriod = (course) => {
  const semester = course.semester || '';
  const year = course.academicYear || '';
  return `${semester} ${year}`.trim();
};
