

import { calculateCourseGrade, calculateCategoryAverage } from '../utils/gradeCalculations';
import { calculateCourseProgress } from '../utils/progressCalculations';

class GradeService {

  static calculateCourseImpact(course, currentGrades) {
    try {
      const courseGrade = this.calculateCourseGrade(course, currentGrades);

      if (!courseGrade.success) {
        return {
          success: false,
          message: 'Unable to calculate course grade'
        };
      }

      const gradingScale = course.gradingScale || 'percentage';
      const gpaScale = course.gpaScale || '4.0';
      const maxPoints = course.maxPoints || 100;

      let percentageGrade;
      if (gradingScale === 'percentage') {
        percentageGrade = courseGrade.courseGrade;
      } else if (gradingScale === 'gpa') {

        percentageGrade = this.convertGPAToPercentage(courseGrade.courseGrade, gpaScale);
      } else if (gradingScale === 'points') {
        percentageGrade = (courseGrade.courseGrade / maxPoints) * 100;
      } else {
        percentageGrade = courseGrade.courseGrade;
      }

      return {
        success: true,
        courseGrade: percentageGrade,
        message: 'Course grade calculated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error calculating course impact'
      };
    }
  }

  static calculateCourseGrade(course, currentGrades) {
    try {

      if (!course.categories || !Array.isArray(course.categories) || course.categories.length === 0) {
        return {
          success: false,
          courseGrade: 0,
          categoryAverages: {},
          message: 'No categories found for this course'
        };
      }

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
        categoryName: cat.name || cat.categoryName,
        average: calculateCategoryAverage(
          cat.grades,
          course.gradingScale,
          course.maxPoints,
          course.handleMissing
        ),
        weight: cat.weight || cat.weightPercentage
      }));

      return {
        success: true,
        courseGrade,
        categoryAverages,
        message: 'Course grade calculated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to calculate course grade'
      };
    }
  }

  static convertGPAToPercentage(gpa, gpaScale = '4.0') {
    const scale = this.getGPAScale(gpaScale);
    if (!scale) return 0;

    let percentage;
    if (scale.inverted) {

      percentage = ((scale.max - gpa) / (scale.max - scale.min)) * 100;
    } else {

      percentage = ((gpa - scale.min) / (scale.max - scale.min)) * 100;
    }

    return Math.round(percentage * 100) / 100;
  }

  static convertPercentageToGPA(percentage, gpaScale = '4.0') {
    const scale = this.getGPAScale(gpaScale);
    if (!scale) return 0;

    let gpa;
    if (scale.inverted) {

      gpa = scale.max - ((percentage / 100) * (scale.max - scale.min));
    } else {

      gpa = scale.min + ((percentage / 100) * (scale.max - scale.min));
    }

    return Math.round(gpa * 100) / 100;
  }

  static getGPAScale(gpaScale) {
    const scales = {
      '4.0': { max: 4.0, min: 1.0, inverted: false },
      '5.0': { max: 5.0, min: 1.0, inverted: false },
      'inverted-4.0': { max: 4.0, min: 1.0, inverted: true },
      'inverted-5.0': { max: 5.0, min: 1.0, inverted: true }
    };
    return scales[gpaScale] || scales['4.0'];
  }

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

        if (course.isActive === false) {
          return;
        }

        const courseGrades = grades[course.id] || {};
        const result = this.calculateCourseImpact(course, courseGrades);

        if (result.success) {

          let courseGPA;

          const gradingScale = course.gradingScale || 'percentage';
          const gpaScale = course.gpaScale || '4.0';
          const units = course.units || 3;
          const maxPoints = course.maxPoints || 100;

          if (gradingScale === 'percentage') {
            courseGPA = this.convertPercentageToGPA(result.courseGrade, gpaScale);
          } else if (gradingScale === 'gpa') {
            courseGPA = result.courseGrade;
          } else {

            const percentage = (result.courseGrade / maxPoints) * 100;
            courseGPA = this.convertPercentageToGPA(percentage, gpaScale);
          }

          if (!isNaN(courseGPA) && isFinite(courseGPA)) {
            totalWeightedGrade += (courseGPA * units);
            totalCredits += units;
          }
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
      return {
        success: false,
        message: 'Error updating CGPA'
      };
    }
  }


  static analyzeGoalFeasibility(course, targetGrade, currentGrades) {
    try {
      const currentGrade = this.calculateCourseImpact(course, currentGrades);

      if (!currentGrade.success) {
        return {
          success: false,
          message: 'Unable to calculate current grade'
        };
      }

      let targetPercentage;
      if (course.gradingScale === 'percentage') {
        targetPercentage = parseFloat(targetGrade);
      } else if (course.gradingScale === 'gpa') {

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
      return {
        success: false,
        message: 'Error analyzing goal feasibility'
      };
    }
  }

  static calculateCourseProgress(categories, grades) {
    return calculateCourseProgress(categories, grades);
  }
}

export default GradeService;
