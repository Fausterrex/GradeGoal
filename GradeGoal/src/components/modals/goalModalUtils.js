// ========================================
// GOAL MODAL UTILITY FUNCTIONS
// ========================================

import { percentageToGPA, gpaToPercentage, detectValueFormat } from "../course/academic_goal/gpaConversionUtils";
// This file contains utility functions specific to goal modal operations

// Removed grade calculation imports
import { hasExistingGoal, getAvailableCourses } from "../course/academic_goal/goalUtils";
/**
 * Validate goal form data
 */
export const validateGoalForm = (formData, courses, existingGoals, editingGoal) => {
  const errors = [];

  // Required field validation
  if (!formData.goalTitle?.trim()) {
    errors.push('Goal title is required');
  }

  if (!formData.targetValue || isNaN(parseFloat(formData.targetValue))) {
    errors.push('Target value must be a valid number');
  }

  const targetValue = parseFloat(formData.targetValue);
  
  // Course-specific validation
  if (formData.goalType === 'COURSE_GRADE' && formData.courseId) {
    const course = courses.find(c => c.courseId === parseInt(formData.courseId));
    if (course) {
      const validation = validateTargetValue(targetValue, course);
      if (validation.error) {
        errors.push(validation.error);
      }
    }
  }

  // Duplicate goal validation
  if (formData.goalType === 'COURSE_GRADE' && formData.courseId) {
    const courseId = parseInt(formData.courseId);
    if (hasExistingGoal(courseId, existingGoals, editingGoal?.goalId)) {
      errors.push('A goal already exists for this course');
    }
  }

  // Semester goal validation
  if (formData.goalType === 'SEMESTER_GPA') {
    if (!formData.semester?.trim()) {
      errors.push('Semester is required for semester GPA goals');
    }
    if (!formData.academicYear?.trim()) {
      errors.push('Academic year is required for semester GPA goals');
    }
    
    // Check for duplicate semester GPA goals
    const existingSemesterGoal = existingGoals.find(goal => 
      goal.goalType === 'SEMESTER_GPA' && 
      goal.semester === formData.semester && 
      goal.academicYear === formData.academicYear &&
      goal.goalId !== editingGoal?.goalId
    );
    if (existingSemesterGoal) {
      const semesterName = formData.semester === 'FIRST' ? '1st' : 
                          formData.semester === 'SECOND' ? '2nd' : 
                          formData.semester === 'THIRD' ? '3rd' : formData.semester;
      errors.push(`A goal already exists for ${semesterName} Semester ${formData.academicYear}`);
    }
  }
  
  // Cumulative GPA goal validation
  if (formData.goalType === 'CUMMULATIVE_GPA') {
    const existingCumulativeGoal = existingGoals.find(goal => 
      goal.goalType === 'CUMMULATIVE_GPA' && 
      goal.goalId !== editingGoal?.goalId
    );
    if (existingCumulativeGoal) {
      errors.push('A cumulative GPA goal already exists');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate target value based on course grading scale
 */
export const validateTargetValue = (targetValue, course) => {
  if (course.gradingScale === 'percentage') {
    if (targetValue < 0 || targetValue > 100) {
      return { error: 'Target percentage must be between 0 and 100' };
    }
  } else if (course.gradingScale === 'gpa') {
    const maxGPA = course.gpaScale === '5.0' ? 5.0 : 4.0;
    if (targetValue < 0 || targetValue > maxGPA) {
      return { error: `Target GPA must be between 0 and ${maxGPA}` };
    }
  } else if (course.gradingScale === 'points') {
    if (targetValue < 0 || targetValue > course.maxPoints) {
      return { error: `Target points must be between 0 and ${course.maxPoints}` };
    }
  }
  
  return { error: null };
};

/**
 * Get input constraints for form fields
 */
export const getInputConstraints = (goalType, courseId, courses) => {
  if (goalType === 'COURSE_GRADE' && courseId) {
    const course = courses.find(c => c.courseId === parseInt(courseId));
    if (course) {
      return {
        min: 0,
        max: course.gradingScale === 'percentage' ? 100 : 
             course.gradingScale === 'gpa' ? (course.gpaScale === '5.0' ? 5 : 4) :
             course.gradingScale === 'points' ? course.maxPoints : 100,
        step: course.gradingScale === 'gpa' ? 0.1 : 1
      };
    }
  }
  return { min: 0, max: 100, step: 1 };
};

/**
 * Get conversion display text for target value
 */
export const getConversionDisplay = (goalType, courseId, targetValue, courses) => {
  if (goalType === 'COURSE_GRADE' && courseId && targetValue) {
    const course = courses.find(c => c.courseId === parseInt(courseId));
    if (course && targetValue) {
      const numValue = parseFloat(targetValue);
      const gpaScale = course.gpaScale === '5.0' ? 5.0 : 4.0;
      const format = detectValueFormat(numValue, gpaScale);
      
      if (format === 'gpa') {
        // Input is GPA, show percentage conversion
        const percentage = gpaToPercentage(numValue, gpaScale);
        return `(${percentage.toFixed(1)}%)`;
      } else if (format === 'percentage') {
        // Input is percentage, show GPA conversion
        const gpa = percentageToGPA(numValue, gpaScale);
        return `(${gpa.toFixed(2)} GPA)`;
      }
    }
  }
  return '';
};

/**
 * Get available courses for goal creation
 */
export const getAvailableCoursesForModal = (goalType, courses, existingGoals, editingGoalId) => {
  if (goalType === 'COURSE_GRADE') {
    return getAvailableCourses(courses, existingGoals, editingGoalId);
  }
  return courses;
};

