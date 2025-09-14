// ========================================
// SEMESTRAL GPA UTILITY
// ========================================
// This utility handles all calculations related to semester-specific grade point average.
// It manages academic period detection and semester-based GPA calculations.

import GradeService from "../services/gradeService";

/**
 * Get all academic periods from course data (no filtering)
 * @param {Array} courses - Array of all courses
 * @returns {Array} Array of all unique academic periods from database
 */
export const getAllAcademicPeriods = (courses = []) => {
  if (!courses || courses.length === 0) {
    return [];
  }

  try {
    // Get all unique academic years and semesters from courses
    const academicPeriods = courses
      .filter(
        (course) =>
          course.academicYear && course.semester && course.isActive !== false
      )
      .map((course) => ({
        academicYear: course.academicYear,
        semester: course.semester,
      }));

    // Remove duplicates
    const uniquePeriods = academicPeriods.filter(
      (period, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.academicYear === period.academicYear &&
            p.semester === period.semester
        )
    );

    return uniquePeriods;
  } catch (error) {
    console.error("Error getting academic periods from courses:", error);
    return [];
  }
};

/**
 * Get current academic year and semester based on course data
 * @param {Array} courses - Array of all courses to determine current semester
 * @returns {Object} Object containing current year and semester from database
 */
export const getCurrentAcademicPeriod = (courses = []) => {
  if (!courses || courses.length === 0) {
    // Fallback to current year if no courses available
    return {
      academicYear: new Date().getFullYear().toString(),
      semester: "FIRST",
    };
  }

  try {
    // Get all academic periods
    const allPeriods = getAllAcademicPeriods(courses);

    if (allPeriods.length === 0) {
      return {
        academicYear: new Date().getFullYear().toString(),
        semester: "FIRST",
      };
    }

    // For now, just return the first available period
    // This can be customized based on your specific needs
    const currentPeriod = allPeriods[0];

    console.log("Available academic periods:", allPeriods);
    console.log("Selected period:", currentPeriod);

    return {
      academicYear: currentPeriod.academicYear,
      semester: currentPeriod.semester,
    };
  } catch (error) {
    console.error(
      "Error determining current academic period from courses:",
      error
    );
    return {
      academicYear: new Date().getFullYear().toString(),
      semester: "FIRST",
    };
  }
};

/**
 * Calculate GPA for a specific semester
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @param {string} academicYear - Academic year to filter by
 * @param {string} semester - Semester to filter by ('FIRST' or 'SECOND')
 * @returns {number} Semester GPA (0-4.0 scale)
 */
export const calculateSemesterGPA = async (
  courses,
  grades,
  academicYear,
  semester
) => {
  if (
    !courses ||
    !Array.isArray(courses) ||
    !grades ||
    !academicYear ||
    !semester
  ) {
    return 0;
  }

  try {
    // Filter courses for the specific semester
    const semesterCourses = courses.filter(
      (course) =>
        course.isActive !== false &&
        course.academicYear === academicYear &&
        course.semester === semester
    );
    if (semesterCourses.length === 0) {
      return 0;
    }

    // Calculate weighted average for semester courses
    let totalWeightedGPA = 0;
    let totalWeight = 0;

    for (const course of semesterCourses) {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = await GradeService.calculateCourseGrade(course, grades);

        if (courseResult.success) {
          let courseGPA = courseResult.courseGrade;

          // Convert to GPA if it's a percentage
          if (courseGPA > 4.0) {
            courseGPA = GradeService.convertPercentageToGPA(
              courseGPA,
              course.gpaScale || "4.0"
            );
          }

          // Only include courses with meaningful grades (greater than 0)
          if (courseGPA > 0) {
            const courseWeight = course.creditHours || 3;
            totalWeightedGPA += courseGPA * courseWeight;
            totalWeight += courseWeight;
          }
        }
      } catch (error) {
        console.error(
          `Error calculating GPA for course ${course.courseName}:`,
          error
        );
      }
    }

    const finalGPA = totalWeight > 0 ? totalWeightedGPA / totalWeight : 0;
    return finalGPA;
  } catch (error) {
    console.error(
      `Error calculating semester GPA for ${academicYear} ${semester}:`,
      error
    );
    return 0;
  }
};

/**
 * Calculate GPA for all active courses (no semester filtering)
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {number} Overall GPA for all active courses (0-4.0 scale)
 */
export const calculateAllCoursesGPA = async (courses, grades) => {
  if (!courses || !Array.isArray(courses) || !grades) {
    return 0;
  }

  try {
    // Filter for active courses only
    const activeCourses = courses.filter((course) => course.isActive !== false);

    if (activeCourses.length === 0) {
      return 0;
    }

    // Calculate weighted average for all active courses
    let totalWeightedGPA = 0;
    let totalWeight = 0;

    for (const course of activeCourses) {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = await GradeService.calculateCourseGrade(course, grades);

        if (courseResult.success) {
          let courseGPA = courseResult.courseGrade;

          // Convert to GPA if it's a percentage
          if (courseGPA > 4.0) {
            courseGPA = GradeService.convertPercentageToGPA(
              courseGPA,
              course.gpaScale || "4.0"
            );
          }

          // Only include courses with meaningful grades (greater than 0)
          if (courseGPA > 0) {
            const courseWeight = course.creditHours || 3;
            totalWeightedGPA += courseGPA * courseWeight;
            totalWeight += courseWeight;
          }
        }
      } catch (error) {
        console.error(
          `Error calculating GPA for course ${course.courseName}:`,
          error
        );
      }
    }

    return totalWeight > 0 ? totalWeightedGPA / totalWeight : 0;
  } catch (error) {
    console.error("Error calculating all courses GPA:", error);
    return 0;
  }
};

/**
 * Calculate current semester GPA based on most recent academic year/semester
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {number} Current semester GPA (0-4.0 scale)
 */
export const calculateCurrentSemesterGPA = async (courses, grades) => {
  if (!courses || courses.length === 0) {
    return 0;
  }

  try {
    // Get the most recent academic year and semester from courses
    const academicPeriods = getAllAcademicPeriods(courses);

    if (academicPeriods.length === 0) {
      return await calculateAllCoursesGPA(courses, grades);
    }

    // Sort by academic year and semester to get the most recent
    const sortedPeriods = academicPeriods.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return b.academicYear.localeCompare(a.academicYear);
      }
      // For same academic year, prioritize FIRST semester
      if (a.semester === "FIRST" && b.semester === "SECOND") return -1;
      if (a.semester === "SECOND" && b.semester === "FIRST") return 1;
      return 0;
    });

    const mostRecentPeriod = sortedPeriods[0];

    // Calculate GPA for the most recent semester
    const semesterGPA = await calculateSemesterGPA(
      courses,
      grades,
      mostRecentPeriod.academicYear,
      mostRecentPeriod.semester
    );

    // If semester GPA is 0, fall back to all courses GPA
    if (semesterGPA === 0) {
      return await calculateAllCoursesGPA(courses, grades);
    }

    return semesterGPA;
  } catch (error) {
    console.error("Error calculating current semester GPA:", error);
    return await calculateAllCoursesGPA(courses, grades);
  }
};

/**
 * Get current semester GPA with detailed information
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {Object} Object containing GPA and semester details
 */
export const getCurrentSemesterGPADetails = async (courses, grades) => {
  if (!courses || courses.length === 0) {
    return {
      gpa: 0,
      academicYear: "No Data",
      semester: "No Data",
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
      coursesInSemester: [],
    };
  }

  try {
    // Get the most recent academic year and semester from courses
    const academicPeriods = getAllAcademicPeriods(courses);

    if (academicPeriods.length === 0) {
      // Fallback to all courses
      const gpa = calculateAllCoursesGPA(courses, grades);
      const activeCourses = courses.filter(
        (course) => course.isActive !== false
      );

      return {
        gpa: gpa,
        academicYear: "All Years",
        semester: "All Semesters",
        totalCredits: activeCourses.reduce(
          (total, course) => total + (course.creditHours || 3),
          0
        ),
        totalCourses: activeCourses.length,
        completedCourses: 0,
        coursesInSemester: activeCourses,
      };
    }

    // Sort by academic year and semester to get the most recent
    const sortedPeriods = academicPeriods.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return b.academicYear.localeCompare(a.academicYear);
      }
      // For same academic year, prioritize FIRST semester
      if (a.semester === "FIRST" && b.semester === "SECOND") return -1;
      if (a.semester === "SECOND" && b.semester === "FIRST") return 1;
      return 0;
    });

    const mostRecentPeriod = sortedPeriods[0];

    // Calculate GPA for the most recent semester
    const gpa = await calculateSemesterGPA(
      courses,
      grades,
      mostRecentPeriod.academicYear,
      mostRecentPeriod.semester
    );

    // Get courses in the most recent semester
    const coursesInSemester = courses.filter(
      (course) =>
        course.isActive !== false &&
        course.academicYear === mostRecentPeriod.academicYear &&
        course.semester === mostRecentPeriod.semester
    );

    // Count completed courses (courses with meaningful grades)
    let completedCourses = 0;
    coursesInSemester.forEach((course) => {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = GradeService.calculateCourseGrade(
          course,
          grades
        );
        if (courseResult.success && courseResult.courseGrade > 0) {
          completedCourses++;
        }
      } catch (error) {
        // Course not completed
      }
    });

    // Calculate total credits
    const totalCredits = coursesInSemester.reduce((total, course) => {
      return total + (course.creditHours || 3);
    }, 0);

    return {
      gpa: gpa,
      academicYear: mostRecentPeriod.academicYear,
      semester: mostRecentPeriod.semester,
      totalCredits: totalCredits,
      totalCourses: coursesInSemester.length,
      completedCourses: completedCourses,
      coursesInSemester: coursesInSemester,
    };
  } catch (error) {
    console.error("Error getting current semester GPA details:", error);
    return {
      gpa: 0,
      academicYear: "Error",
      semester: "Error",
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
      coursesInSemester: [],
    };
  }
};

/**
 * Get semester GPA statistics
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @param {string} academicYear - Academic year to filter by
 * @param {string} semester - Semester to filter by
 * @returns {Object} Statistics object containing GPA, credits, etc.
 */
export const getSemesterGPAStats = (
  courses,
  grades,
  academicYear,
  semester
) => {
  if (
    !courses ||
    !Array.isArray(courses) ||
    !grades ||
    !academicYear ||
    !semester
  ) {
    return {
      gpa: 0,
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
      academicYear,
      semester,
    };
  }

  try {
    // Filter courses for the specific semester
    const semesterCourses = courses.filter(
      (course) =>
        course.isActive !== false &&
        course.academicYear === academicYear &&
        course.semester === semester
    );

    if (semesterCourses.length === 0) {
      return {
        gpa: 0,
        totalCredits: 0,
        totalCourses: 0,
        completedCourses: 0,
        academicYear,
        semester,
      };
    }

    let totalWeightedGPA = 0;
    let totalWeight = 0;
    let completedCourses = 0;

    semesterCourses.forEach((course) => {
      try {
        // Pass the entire grades object - GradeService will filter by course categories
        const courseResult = GradeService.calculateCourseGrade(
          course,
          grades
        );

        if (courseResult.success) {
          let courseGPA = courseResult.courseGrade;

          // Convert to GPA if it's a percentage
          if (courseGPA > 4.0) {
            courseGPA = GradeService.convertPercentageToGPA(
              courseGPA,
              course.gpaScale || "4.0"
            );
          }

          // Only include courses with meaningful grades (greater than 0)
          if (courseGPA > 0) {
            const courseWeight = course.creditHours || 3;
            totalWeightedGPA += courseGPA * courseWeight;
            totalWeight += courseWeight;
            completedCourses++;
          }
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
      totalCourses: semesterCourses.length,
      completedCourses: completedCourses,
      academicYear,
      semester,
    };
  } catch (error) {
    console.error(
      `Error calculating semester GPA stats for ${academicYear} ${semester}:`,
      error
    );
    return {
      gpa: 0,
      totalCredits: 0,
      totalCourses: 0,
      completedCourses: 0,
      academicYear,
      semester,
    };
  }
};

/**
 * Get all available semesters from courses
 * @param {Array} courses - Array of all courses
 * @returns {Array} Array of semester objects with year and semester
 */
export const getAvailableSemesters = (courses) => {
  if (!courses || !Array.isArray(courses)) {
    return [];
  }

  try {
    const semesterSet = new Set();

    courses.forEach((course) => {
      if (course.academicYear && course.semester) {
        semesterSet.add(`${course.academicYear}-${course.semester}`);
      }
    });

    return Array.from(semesterSet)
      .map((semesterKey) => {
        const [academicYear, semester] = semesterKey.split("-");
        return { academicYear, semester };
      })
      .sort((a, b) => {
        if (a.academicYear !== b.academicYear) {
          return a.academicYear.localeCompare(b.academicYear);
        }
        return a.semester.localeCompare(b.semester);
      });
  } catch (error) {
    console.error("Error getting available semesters:", error);
    return [];
  }
};

/**
 * Calculate semester GPA trend over time
 * @param {Array} courses - Array of all courses
 * @param {Object} grades - Grades object containing all course grades
 * @returns {Array} Array of semester GPA objects sorted by time
 */
export const calculateSemesterGPATrend = (courses, grades) => {
  if (!courses || !Array.isArray(courses) || !grades) {
    return [];
  }

  try {
    const availableSemesters = getAvailableSemesters(courses);

    return availableSemesters.map(({ academicYear, semester }) => {
      const stats = getSemesterGPAStats(
        courses,
        grades,
        academicYear,
        semester
      );
      return {
        academicYear,
        semester,
        gpa: stats.gpa,
        totalCredits: stats.totalCredits,
        courseCount: stats.totalCourses,
        completedCourses: stats.completedCourses,
      };
    });
  } catch (error) {
    console.error("Error calculating semester GPA trend:", error);
    return [];
  }
};
