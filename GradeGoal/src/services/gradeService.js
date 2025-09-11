// ========================================
// GRADE SERVICE
// ========================================
// This service handles all grade-related calculations and operations.
// It provides methods for calculating course grades, GPA conversions,
// course impact analysis, and progress tracking.

import {
  calculateCourseGrade,
  calculateCategoryAverage,
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

  static convertGPAToPercentage(gpa, gpaScale = "4.0") {
    const scale = this.getGPAScale(gpaScale);
    if (!scale) return 0;

    let percentage;
    if (scale.inverted) {
      // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
      // For inverted scale, we need to invert the result
      const rawPercentage = ((gpa - scale.min) / (scale.max - scale.min)) * 100;
      percentage = 100 - rawPercentage;
    } else {
      percentage = ((gpa - scale.min) / (scale.max - scale.min)) * 100;
    }

    // Ensure percentage is not negative
    percentage = Math.max(0, percentage);
    return Math.round(percentage * 100) / 100;
  }

  static convertPercentageToGPA(percentage, gpaScale = "4.0") {
    const scale = this.getGPAScale(gpaScale);
    if (!scale) return 0;

    let gpa;
    if (scale.inverted) {
      // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
      // For inverted scale, we need to invert the percentage first, capping at 0 for percentages >= 100
      const invertedPercentage = Math.max(0, 100 - percentage);
      gpa = scale.min + (invertedPercentage / 100) * (scale.max - scale.min);
    } else {
      gpa = scale.min + (percentage / 100) * (scale.max - scale.min);
    }

    // Cap the GPA at the scale maximum to prevent exceeding the scale
    gpa = Math.min(gpa, scale.max);

    return Math.round(gpa * 100) / 100;
  }

  static getGPAScale(gpaScale) {
    const scales = {
      "4.0": { max: 4.0, min: 1.0, inverted: false },
      "5.0": { max: 5.0, min: 1.0, inverted: false },
      "inverted-4.0": { max: 4.0, min: 1.0, inverted: true },
      "inverted-5.0": { max: 5.0, min: 1.0, inverted: true },
    };
    return scales[gpaScale] || scales["4.0"];
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
