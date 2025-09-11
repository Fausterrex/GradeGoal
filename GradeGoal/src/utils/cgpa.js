// ========================================
// CUMULATIVE GPA (CGPA) UTILITY
// ========================================
// This utility handles all calculations related to cumulative grade point average.
// It calculates GPA across all courses and semesters for comprehensive academic tracking.

import GradeService from "../services/gradeService";

/**
 * Calculate cumulative GPA for all courses across all semesters
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {number} Cumulative GPA (0-4.0 scale)
 */
export const calculateCumulativeGPA = (courses, grades) => {
  if (!courses || !Array.isArray(courses) || !grades) {
    return 0;
  }

  try {
    let totalWeightedGPA = 0;
    let totalWeight = 0;

    courses.forEach((course) => {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = GradeService.calculateCourseGrade(course, grades);

        if (courseResult.success) {
          let courseGPA = courseResult.courseGrade;

          // Convert to GPA if it's a percentage (check against the course's actual GPA scale)
          const courseGPAScale = GradeService.getGPAScale(course.gpaScale || "4.0");
          if (courseGPAScale && courseGPA > courseGPAScale.max) {
            courseGPA = GradeService.convertPercentageToGPA(
              courseGPA,
              course.gpaScale || "4.0"
            );
          }

          const courseWeight = course.creditHours || 3;
          totalWeightedGPA += courseGPA * courseWeight;
          totalWeight += courseWeight;
        }
      } catch (error) {
        console.error(
          `Error calculating GPA for course ${course.courseName}:`,
          error
        );
      }
    });

    return totalWeight > 0 ? totalWeightedGPA / totalWeight : 0;
  } catch (error) {
    console.error("Error calculating cumulative GPA:", error);
    return 0;
  }
};

/**
 * Calculate cumulative GPA for a specific academic year
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @param {string} academicYear - Academic year to filter by
 * @returns {number} Cumulative GPA for the specified year
 */
export const calculateYearlyCumulativeGPA = (courses, grades, academicYear) => {
  if (!courses || !Array.isArray(courses) || !grades || !academicYear) {
    return 0;
  }

  try {
    // Filter courses for the specific academic year
    const yearlyCourses = courses.filter(
      (course) => course.academicYear === academicYear.toString()
    );

    return calculateCumulativeGPA(yearlyCourses, grades);
  } catch (error) {
    console.error(
      `Error calculating yearly cumulative GPA for ${academicYear}:`,
      error
    );
    return 0;
  }
};

/**
 * Get cumulative GPA statistics
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {Object} Statistics object containing GPA, total credits, etc.
 */
export const getCumulativeGPAStats = (courses, grades) => {
  if (!courses || !Array.isArray(courses) || !grades) {
    return {
      gpa: 0,
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
    };
  }

  try {
    let totalWeightedGPA = 0;
    let totalWeight = 0;
    let completedCourses = 0;

    courses.forEach((course) => {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = GradeService.calculateCourseGrade(course, grades);

        if (courseResult.success) {
          let courseGPA = courseResult.courseGrade;

          // Convert to GPA if it's a percentage (check against the course's actual GPA scale)
          const courseGPAScale = GradeService.getGPAScale(course.gpaScale || "4.0");
          if (courseGPAScale && courseGPA > courseGPAScale.max) {
            courseGPA = GradeService.convertPercentageToGPA(
              courseGPA,
              course.gpaScale || "4.0"
            );
          }

          const courseWeight = course.creditHours || 3;
          totalWeightedGPA += courseGPA * courseWeight;
          totalWeight += courseWeight;
          completedCourses++;
        }
      } catch (error) {
        console.error(
          `Error calculating GPA for course ${course.courseName}:`,
          error
        );
      }
    });

    return {
      gpa: totalWeight > 0 ? totalWeightedGPA / totalWeight : 0,
      totalCredits: totalWeight,
      totalCourses: courses.length,
      completedCourses: completedCourses,
    };
  } catch (error) {
    console.error("Error calculating cumulative GPA stats:", error);
    return {
      gpa: 0,
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
    };
  }
};

/**
 * Calculate GPA trend over multiple semesters
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {Array} Array of semester GPA objects
 */
export const calculateGPATrend = (courses, grades) => {
  if (!courses || !Array.isArray(courses) || !grades) {
    return [];
  }

  try {
    // Group courses by academic year and semester
    const semesterGroups = {};

    courses.forEach((course) => {
      if (course.academicYear && course.semester) {
        const key = `${course.academicYear}-${course.semester}`;
        if (!semesterGroups[key]) {
          semesterGroups[key] = [];
        }
        semesterGroups[key].push(course);
      }
    });

    // Calculate GPA for each semester
    const trend = Object.keys(semesterGroups).map((semesterKey) => {
      const semesterCourses = semesterGroups[semesterKey];
      const semesterGPA = calculateCumulativeGPA(semesterCourses, grades);
      const [academicYear, semester] = semesterKey.split("-");

      return {
        academicYear,
        semester,
        gpa: semesterGPA,
        courseCount: semesterCourses.length,
      };
    });

    // Sort by academic year and semester
    return trend.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return a.academicYear.localeCompare(b.academicYear);
      }
      return a.semester.localeCompare(b.semester);
    });
  } catch (error) {
    console.error("Error calculating GPA trend:", error);
    return [];
  }
};
