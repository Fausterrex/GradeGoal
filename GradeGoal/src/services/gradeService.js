// ========================================
// GRADE SERVICE
// ========================================
// This service handles all grade-related calculations and operations.
// It provides methods for calculating course grades, GPA conversions,
// course impact analysis, and progress tracking.

import {
  calculateCourseGrade,
  calculateCategoryAverage,
  convertPercentageToGPA,
  convertGPAToPercentage,
  GPA_SCALES,
} from "../utils/gradeCalculations";
import { calculateCourseProgress } from "../utils/progressCalculations";

class GradeService {
  // Calculates the impact of a course on overall GPA
  // Converts course grade to percentage format for consistent comparison
  static calculateCourseImpact(course, currentGrades) {
    try {
      const courseGrade = this.calculateCourseGrade(course, currentGrades);

      if (!courseGrade.success) {
        return {
          success: false,
          message: "Unable to calculate course grade",
        };
      }

      const gradingScale = course.gradingScale || "percentage";
      const gpaScale = course.gpaScale || "4.0";
      const maxPoints = course.maxPoints || 100;

      let percentageGrade;
      if (gradingScale === "percentage") {
        percentageGrade = courseGrade.courseGrade;
      } else if (gradingScale === "gpa") {
        percentageGrade = this.convertGPAToPercentage(
          courseGrade.courseGrade,
          gpaScale
        );
      } else if (gradingScale === "points") {
        percentageGrade = (courseGrade.courseGrade / maxPoints) * 100;
      } else {
        percentageGrade = courseGrade.courseGrade;
      }

      return {
        success: true,
        courseGrade: percentageGrade,
        message: "Course grade calculated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error calculating course impact",
      };
    }
  }

  // Calculates the final grade for a course based on category weights and grades
  // Handles different grading scales (percentage, GPA, points)
  static calculateCourseGrade(course, currentGrades) {
    try {
      if (
        !course.categories ||
        !Array.isArray(course.categories) ||
        course.categories.length === 0
      ) {
        return {
          success: false,
          courseGrade: 0,
          categoryAverages: {},
          message: "No categories found for this course",
        };
      }

      const categoriesWithGrades = course.categories.map((cat) => ({
        ...cat,
        grades: currentGrades[cat.id] || [],
      }));

      const courseGrade = calculateCourseGrade(
        categoriesWithGrades,
        course.gradingScale,
        course.maxPoints,
        course.handleMissing
      );

      const categoryAverages = categoriesWithGrades.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name || cat.categoryName,
        average: calculateCategoryAverage(
          cat.grades,
          course.gradingScale,
          course.maxPoints,
          course.handleMissing
        ),
        weight: cat.weight || cat.weightPercentage,
      }));

      return {
        success: true,
        courseGrade,
        categoryAverages,
        message: "Course grade calculated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to calculate course grade",
      };
    }
  }

  // GPA conversion methods now use the imported functions from gradeCalculations.js
  static convertGPAToPercentage(gpa, gpaScale = "4.0") {
    return convertGPAToPercentage(gpa, gpaScale);
  }

  static convertPercentageToGPA(percentage, gpaScale = "4.0") {
    return convertPercentageToGPA(percentage, gpaScale);
  }

  static getGPAScale(gpaScale) {
    return GPA_SCALES[gpaScale] || GPA_SCALES["4.0"];
  }

  static updateCGPA(courses, grades) {
    try {
      if (!courses || courses.length === 0) {
        return {
          success: true,
          overallGPA: 0,
          message: "No courses to calculate",
        };
      }

      let totalWeightedGrade = 0;
      let totalCredits = 0;

      courses.forEach((course) => {
        if (course.isActive === false) {
          return;
        }

        const courseGrades = grades[course.id] || {};
        const result = this.calculateCourseImpact(course, courseGrades);

        if (result.success) {
          let courseGPA;

          const gradingScale = course.gradingScale || "percentage";
          const gpaScale = course.gpaScale || "4.0";
          const units = course.units || 3;
          const maxPoints = course.maxPoints || 100;

          if (gradingScale === "percentage") {
            courseGPA = this.convertPercentageToGPA(
              result.courseGrade,
              gpaScale
            );
          } else if (gradingScale === "gpa") {
            courseGPA = result.courseGrade;
          } else {
            const percentage = (result.courseGrade / maxPoints) * 100;
            courseGPA = this.convertPercentageToGPA(percentage, gpaScale);
          }

          if (!isNaN(courseGPA) && isFinite(courseGPA)) {
            totalWeightedGrade += courseGPA * units;
            totalCredits += units;
          }
        }
      });

      if (totalCredits === 0) {
        return {
          success: true,
          overallGPA: 0,
          message: "No valid courses for CGPA calculation",
        };
      }

      const overallGPA = totalWeightedGrade / totalCredits;

      return {
        success: true,
        overallGPA: Math.round(overallGPA * 100) / 100,
        message: "CGPA calculated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating CGPA",
      };
    }
  }

  static calculateCourseProgress(categories, grades) {
    return calculateCourseProgress(categories, grades);
  }
}

export default GradeService;
