// ========================================
// GRADE SERVICE
// ========================================
// This service handles all grade-related calculations and operations.
// It provides methods for calculating course grades, GPA conversions,
// course impact analysis, and progress tracking.

import {
  convertPercentageToGPA,
  convertGPAToPercentage,
  GPA_SCALES,
} from "../utils/gradeCalculations";
import { calculateCourseProgress } from "../utils/progressCalculations";
import { calculateCourseGrade as calculateCourseGradeDB, calculateCategoryGrade as calculateCategoryGradeDB } from './databaseCalculationService';

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

  // Calculates the final grade for a course using database functions with fallback
  // Handles different grading scales (percentage, GPA, points)
  static async calculateCourseGrade(course, currentGrades) {
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

      // Try to use database calculation first if course has an ID
      if (course.id) {
        try {
          const dbCourseGrade = await calculateCourseGradeDB(course.id);
          
          // Check if there are actually any grades in the currentGrades object
          const hasAnyGrades = Object.values(currentGrades).some(
            (categoryGrades) =>
              Array.isArray(categoryGrades) && categoryGrades.length > 0
          );
          
          if (dbCourseGrade > 0 && hasAnyGrades) {
            
            // For database calculation, we'll still calculate category averages with JavaScript
            // as the database function returns the overall course grade
            const categoriesWithGrades = course.categories.map((cat) => ({
              ...cat,
              grades: currentGrades[cat.id] || [],
            }));

            // For database calculation, we'll calculate category averages using database functions
            const categoryAverages = await Promise.all(categoriesWithGrades.map(async (cat) => {
              let average = 0;
              try {
                average = await calculateCategoryGradeDB(cat.id);
              } catch (error) {
                console.warn('Database category calculation failed, using 0:', error);
                average = 0;
              }
              
              return {
                categoryId: cat.id,
                categoryName: cat.name || cat.categoryName,
                average: average,
                weight: cat.weight || cat.weightPercentage,
              };
            }));

            return {
              success: true,
              courseGrade: dbCourseGrade,
              categoryAverages,
              message: "Course grade calculated successfully using database function",
            };
          }
        } catch (error) {
          console.warn('Database calculation failed, falling back to JavaScript:', error);
        }
      }

      // Fallback to JavaScript calculation (simplified)
      const categoriesWithGrades = course.categories.map((cat) => ({
        ...cat,
        grades: currentGrades[cat.id] || [],
      }));

      // Simple fallback calculation without the removed functions
      let courseGrade = 0;
      let totalWeight = 0;
      let weightedSum = 0;

      categoriesWithGrades.forEach((category) => {
        const categoryWeight = category.weight || category.weightPercentage || 0;
        
        if (categoryWeight > 0 && category.grades && category.grades.length > 0) {
          // Simple average calculation for fallback
          const validGrades = category.grades.filter(grade => 
            grade.score !== null && grade.score !== undefined && grade.score !== ""
          );
          
          if (validGrades.length > 0) {
            const categoryAverage = validGrades.reduce((sum, grade) => {
              let adjustedScore = grade.score || 0;
              if (grade.isExtraCredit && grade.extraCreditPoints) {
                adjustedScore += grade.extraCreditPoints;
              }
              return sum + (adjustedScore / grade.maxScore) * 100;
            }, 0) / validGrades.length;

            weightedSum += categoryAverage * categoryWeight;
            totalWeight += categoryWeight;
          }
        }
      });

      courseGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

      const categoryAverages = categoriesWithGrades.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name || cat.categoryName,
        average: 0, // Simplified fallback - no individual category calculation
        weight: cat.weight || cat.weightPercentage,
      }));

      return {
        success: true,
        courseGrade,
        categoryAverages,
        message: "Course grade calculated successfully using JavaScript calculation",
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
