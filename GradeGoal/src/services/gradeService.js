// Simplified Grade Service - Core calculations without ML
// This replaces the Java backend calls in the flowchart

import { calculateCourseGrade, calculateCategoryAverage } from '../utils/gradeCalculations';

/**
 * GradeService Class
 * 
 * Core service for handling grade calculations, conversions, and analysis.
 * Provides methods for calculating course grades, converting between grading scales,
 * analyzing goal feasibility, and generating academic recommendations.
 * 
 * This service replaces Java backend calls and provides client-side grade calculations
 * for better performance and offline capability.
 */
class GradeService {
  /**
   * Calculate course impact on CGPA
   * 
   * Determines how a specific course affects the overall Cumulative Grade Point Average.
   * Converts course grades to a consistent percentage format for CGPA calculations.
   * 
   * @param {Object} course - Course object with grading scale and GPA scale
   * @param {Object} currentGrades - Current grades for the course
   * @returns {Object} Result object with success status, course grade, and message
   */
  static calculateCourseImpact(course, currentGrades) {
    try {
      const courseGrade = this.calculateCourseGrade(course, currentGrades);
      
      if (!courseGrade.success) {
        return {
          success: false,
          message: 'Unable to calculate course grade'
        };
      }

      // Convert to percentage for consistent calculations
      let percentageGrade;
      if (course.gradingScale === 'percentage') {
        percentageGrade = courseGrade.courseGrade;
      } else if (course.gradingScale === 'gpa') {
        // Convert GPA to percentage based on course's GPA scale
        percentageGrade = this.convertGPAToPercentage(courseGrade.courseGrade, course.gpaScale || '4.0');
      } else if (course.gradingScale === 'points') {
        percentageGrade = (courseGrade.courseGrade / course.maxPoints) * 100;
      } else {
        percentageGrade = courseGrade.courseGrade;
      }

      return {
        success: true,
        courseGrade: percentageGrade,
        message: 'Course grade calculated successfully'
      };
    } catch (error) {
      console.error('Error calculating course impact:', error);
      return {
        success: false,
        message: 'Error calculating course impact'
      };
    }
  }

  /**
   * Calculate course grade using utility functions
   * 
   * Computes the overall course grade based on weighted category averages.
   * Uses the gradeCalculations utility for consistent calculations across the application.
   * 
   * @param {Object} course - Course object with categories and grading information
   * @param {Object} currentGrades - Current grades organized by category ID
   * @returns {Object} Result object with success status, course grade, category averages, and message
   */
  static calculateCourseGrade(course, currentGrades) {
    try {
      const categoriesWithGrades = course.categories.map(cat => ({
        ...cat,
        grades: currentGrades[cat.id] || []
      }));
      
      const courseGrade = calculateCourseGrade(
        categoriesWithGrades,
        course.gradingScale,
        course.maxPoints,
        course.handleMissing
      );
      
      const categoryAverages = categoriesWithGrades.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        average: calculateCategoryAverage(
          cat.grades,
          course.gradingScale,
          course.maxPoints,
          course.handleMissing
        ),
        weight: cat.weight
      }));

      return {
        success: true,
        courseGrade,
        categoryAverages,
        message: 'Course grade calculated successfully'
      };
    } catch (error) {
      console.error('Error calculating course grade:', error);
      return {
        success: false,
        message: 'Failed to calculate course grade'
      };
    }
  }

  /**
   * Convert GPA to percentage based on scale
   * 
   * Converts GPA values to percentage equivalents using the specified GPA scale.
   * Supports both standard and inverted GPA scales for different educational systems.
   * 
   * @param {number} gpa - GPA value to convert
   * @param {string} gpaScale - GPA scale configuration (4.0, 5.0, inverted-4.0, inverted-5.0)
   * @returns {number} Percentage value (0-100) rounded to 2 decimal places
   */
  static convertGPAToPercentage(gpa, gpaScale = '4.0') {
    const scale = this.getGPAScale(gpaScale);
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
   * Convert percentage to GPA based on scale
   * 
   * Converts percentage values to GPA equivalents using the specified GPA scale.
   * Supports both standard and inverted GPA scales for different educational systems.
   * 
   * @param {number} percentage - Percentage value (0-100) to convert
   * @param {string} gpaScale - GPA scale configuration (4.0, 5.0, inverted-4.0, inverted-5.0)
   * @returns {number} GPA value rounded to 2 decimal places
   */
  static convertPercentageToGPA(percentage, gpaScale = '4.0') {
    const scale = this.getGPAScale(gpaScale);
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
   * Get GPA scale configuration
   * 
   * Returns the configuration object for a specific GPA scale.
   * Defines the range and whether the scale is inverted.
   * 
   * @param {string} gpaScale - GPA scale identifier
   * @returns {Object|null} Scale configuration object or null if not found
   */
  static getGPAScale(gpaScale) {
    const scales = {
      '4.0': { max: 4.0, min: 1.0, inverted: false },
      '5.0': { max: 5.0, min: 1.0, inverted: false },
      'inverted-4.0': { max: 4.0, min: 1.0, inverted: true },
      'inverted-5.0': { max: 5.0, min: 1.0, inverted: true }
    };
    return scales[gpaScale] || scales['4.0'];
  }

  /**
   * Update CGPA across all courses
   * 
   * Calculates the overall Cumulative Grade Point Average across all user courses.
   * Converts all course grades to a consistent GPA scale and applies credit hour weighting.
   * 
   * @param {Array} courses - Array of course objects
   * @param {Object} grades - Object containing grades for all courses
   * @returns {Object} Result object with success status, overall GPA, and message
   */
  static updateCGPA(courses, grades) {
    try {
      if (!courses || courses.length === 0) {
        return {
          success: true,
          overallGPA: 0,
          message: 'No courses to calculate'
        };
      }

      let totalWeightedGrade = 0;
      let totalCredits = 0;

      courses.forEach(course => {
        // Skip archived courses - they shouldn't affect CGPA
        if (course.isArchived === true) {
          return;
        }
        
        // Get grades for this specific course
        const courseGrades = grades[course.id] || {};
        const result = this.calculateCourseImpact(course, courseGrades);
        if (result.success) {
          // Convert percentage to GPA for CGPA calculation
          let courseGPA;
          if (course.gradingScale === 'percentage') {
            courseGPA = this.convertPercentageToGPA(result.courseGrade, course.gpaScale || '4.0');
          } else if (course.gradingScale === 'gpa') {
            courseGPA = result.courseGrade;
          } else {
            // For points, convert to percentage first, then to GPA
            const percentage = (result.courseGrade / course.maxPoints) * 100;
            courseGPA = this.convertPercentageToGPA(percentage, course.gpaScale || '4.0');
          }

          totalWeightedGrade += (courseGPA * (course.units || 3));
          totalCredits += (course.units || 3);
        }
      });

      if (totalCredits === 0) {
        return {
          success: true,
          overallGPA: 0,
          message: 'No valid courses for CGPA calculation'
        };
      }

      const overallGPA = totalWeightedGrade / totalCredits;

      return {
        success: true,
        overallGPA: Math.round(overallGPA * 100) / 100,
        message: 'CGPA calculated successfully'
      };
    } catch (error) {
      console.error('Error updating CGPA:', error);
      return {
        success: false,
        message: 'Error updating CGPA'
      };
    }
  }

  /**
   * Validate grade input
   * 
   * Performs comprehensive validation on grade input data.
   * Checks required fields, data types, and logical constraints.
   * 
   * @param {Object} grade - Grade object to validate
   * @param {Object} course - Course object for context
   * @returns {Array} Array of validation error messages (empty if valid)
   */
  static validateGradeInput(grade, course) {
    const errors = [];
    
    if (!grade.categoryId) {
      errors.push('Category is required');
    }
    
    if (!grade.name || grade.name.trim() === '') {
      errors.push('Assessment name is required');
    }
    
    if (!grade.maxScore || grade.maxScore === '') {
      errors.push('Maximum score is required');
    }
    
    if (!grade.assessmentType) {
      errors.push('Assessment type is required');
    }
    
    if (!grade.date) {
      errors.push('Date is required');
    }
    
    // Validate maxScore value
    if (grade.maxScore !== '') {
      const maxScore = parseFloat(grade.maxScore);
      
      if (isNaN(maxScore) || maxScore <= 0) {
        errors.push('Maximum score must be a positive number');
      }
    }
    
    // Validate score if provided
    if (grade.score !== null && grade.score !== undefined && grade.score !== '') {
      const score = parseFloat(grade.score);
      const maxScore = parseFloat(grade.maxScore);
      
      if (isNaN(score) || score < 0) {
        errors.push('Score must be a non-negative number');
      }
      
      if (score > maxScore) {
        errors.push('Score cannot exceed maximum score');
      }
    }
    
    return errors;
  }

  /**
   * Analyze goal feasibility (simplified version)
   * 
   * Determines how achievable a target grade is based on current performance.
   * Provides feasibility levels and recommendations for improvement.
   * 
   * @param {Object} course - Course object with grading information
   * @param {string|number} targetGrade - Target grade to analyze
   * @param {Object} currentGrades - Current grades for the course
   * @returns {Object} Result object with feasibility analysis and recommendations
   */
  static analyzeGoalFeasibility(course, targetGrade, currentGrades) {
    try {
      const currentGrade = this.calculateCourseImpact(course, currentGrades);
      
      if (!currentGrade.success) {
        return {
          success: false,
          message: 'Unable to calculate current grade'
        };
      }
      
      // Convert target grade to percentage for comparison
      let targetPercentage;
      if (course.gradingScale === 'percentage') {
        targetPercentage = parseFloat(targetGrade);
      } else if (course.gradingScale === 'gpa') {
        // Convert GPA to percentage based on course's GPA scale
        targetPercentage = this.convertGPAToPercentage(parseFloat(targetGrade), course.gpaScale || '4.0');
      } else if (course.gradingScale === 'points') {
        targetPercentage = (parseFloat(targetGrade) / course.maxPoints) * 100;
      } else {
        targetPercentage = parseFloat(targetGrade);
      }
      
      if (isNaN(targetPercentage)) {
        return {
          success: false,
          message: 'Invalid target grade format'
        };
      }
      
      const currentPercentage = currentGrade.courseGrade;
      const difference = targetPercentage - currentPercentage;
      
      let feasibility;
      if (difference <= 0) {
        feasibility = 'exceeded';
      } else if (difference <= 10) {
        feasibility = 'achievable';
      } else if (difference <= 20) {
        feasibility = 'moderate';
      } else {
        feasibility = 'challenging';
      }
      
      return {
        success: true,
        currentGrade: currentPercentage,
        targetGrade: targetPercentage,
        difference: Math.abs(difference),
        feasibility,
        message: 'Goal feasibility analyzed successfully'
      };
    } catch (error) {
      console.error('Error analyzing goal feasibility:', error);
      return {
        success: false,
        message: 'Error analyzing goal feasibility'
      };
    }
  }

  /**
   * Generate simple recommendations
   * 
   * Creates actionable recommendations based on performance gaps.
   * Identifies low-performing categories and suggests improvement strategies.
   * 
   * @param {number} difference - Gap between current and target grades
   * @param {Object} course - Course object with categories
   * @param {Object} currentGrades - Current grades for the course
   * @returns {Array} Array of recommendation strings
   */
  static generateRecommendations(difference, course, currentGrades) {
    const recommendations = [];
    
    if (difference > 0) {
      // Find categories with lowest performance
      const categoryPerformance = course.categories.map(cat => {
        const catGrades = currentGrades[cat.id] || [];
        if (catGrades.length === 0) return { category: cat.name, average: 0, weight: cat.weight };
        
        const totalPercentage = catGrades.reduce((sum, grade) => {
          if (grade.score !== null && grade.score !== undefined) {
            return sum + ((grade.score / grade.maxScore) * 100);
          }
          return sum;
        }, 0);
        
        const average = totalPercentage / catGrades.length;
        return { category: cat.name, average, weight: cat.weight };
      }).sort((a, b) => a.average - b.average);
      
      // Recommend focusing on lowest performing categories
      const lowPerforming = categoryPerformance.slice(0, 2);
      lowPerforming.forEach(cat => {
        if (cat.average < 80) {
          recommendations.push(`Focus on improving ${cat.category} performance (current: ${cat.average.toFixed(1)}%)`);
        }
      });
      
      // General study recommendations
      if (difference > 15) {
        recommendations.push('Consider seeking additional help (tutoring, office hours)');
        recommendations.push('Increase study time for this course');
      }
      
      if (difference > 10) {
        recommendations.push('Review and practice previous material regularly');
        recommendations.push('Form study groups with classmates');
      }
    }
    
    return recommendations;
  }
}

export default GradeService;
