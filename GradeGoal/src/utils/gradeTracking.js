// ========================================
// GRADE TRACKING UTILITY
// ========================================
// This utility provides functions for tracking grade progress over time,
// generating weekly snapshots, and analyzing grade trends for visualization.

import GradeService from "../services/gradeService";

/**
 * Generate a weekly snapshot of grades
 * @param {Array} courses - Array of course objects
 * @param {Object} grades - Object containing grades by category ID
 * @param {Date} weekStart - Start of the week
 * @param {Date} weekEnd - End of the week
 * @returns {Object} Weekly grade snapshot
 */
export const generateWeeklySnapshot = (courses, grades, weekStart, weekEnd) => {
  const snapshot = {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    overallGPA: 0,
    courseGrades: {},
    newAssessments: 0,
    totalAssessments: 0,
    progress: 0,
    trends: {
      improving: 0,
      declining: 0,
      stable: 0,
    },
  };

  let totalGrade = 0;
  let validGrades = 0;
  let totalWeight = 0;

  courses.forEach((course) => {
    if (!course.categories || !grades) return;

    const courseSnapshot = {
      name: course.name,
      courseCode: course.courseCode,
      currentGPA: 0,
      progress: 0,
      newAssessments: 0,
      categories: [],
    };

    course.categories.forEach((category) => {
      const categoryGrades = grades[category.id] || [];
      const categorySnapshot = {
        name: category.name,
        weight: category.weight || 0,
        currentAverage: 0,
        newAssessments: 0,
        totalAssessments: categoryGrades.length,
      };

      // Count new assessments for this week
      categoryGrades.forEach((grade) => {
        if (grade.date) {
          const gradeDate = new Date(grade.date);
          if (gradeDate >= weekStart && gradeDate <= weekEnd) {
            categorySnapshot.newAssessments++;
            courseSnapshot.newAssessments++;
            snapshot.newAssessments++;
          }
        }
      });

      // Calculate category average
      const validGrades = categoryGrades.filter((grade) => {
        const hasScore =
          grade.score !== undefined &&
          grade.score !== null &&
          grade.score !== "" &&
          !isNaN(parseFloat(grade.score));

        if (hasScore && grade.date) {
          const gradeDate = new Date(grade.date);
          return gradeDate <= weekEnd;
        }
        return hasScore;
      });

      if (validGrades.length > 0) {
        const categoryAverage = GradeService.calculateCourseGrade(
          [
            {
              ...category,
              grades: validGrades,
            },
          ],
          course.gradingScale,
          course.maxPoints,
          course.handleMissing
        );

        categorySnapshot.currentAverage = categoryAverage;
        courseSnapshot.currentGPA +=
          (categoryAverage * (category.weight || 0)) / 100;
      }

      courseSnapshot.categories.push(categorySnapshot);
      snapshot.totalAssessments += categorySnapshot.totalAssessments;
    });

    // Convert to GPA if needed
    if (
      course.gradingScale === "percentage" ||
      courseSnapshot.currentGPA > 100
    ) {
      courseSnapshot.currentGPA = GradeService.convertPercentageToGPA(
        courseSnapshot.currentGPA,
        course.gpaScale || "4.0"
      );
    }

    if (courseSnapshot.currentGPA >= 1.0 && courseSnapshot.currentGPA <= 4.0) {
      totalGrade += courseSnapshot.currentGPA;
      validGrades++;
    }

    // Calculate course progress
    courseSnapshot.progress = calculateCourseProgress(
      courseSnapshot.categories
    );
    snapshot.courseGrades[course.name] = courseSnapshot;
  });

  snapshot.overallGPA = validGrades > 0 ? totalGrade / validGrades : 0;
  snapshot.progress = calculateOverallProgress(snapshot.courseGrades);

  return snapshot;
};

/**
 * Generate multiple weekly snapshots
 * @param {Array} courses - Array of course objects
 * @param {Object} grades - Object containing grades by category ID
 * @param {number} weeks - Number of weeks to generate
 * @returns {Array} Array of weekly snapshots
 */
export const generateWeeklySnapshots = (courses, grades, weeks = 12) => {
  const snapshots = [];
  const currentDate = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(currentDate.getDate() - i * 7);

    const weekStart = new Date(weekDate);
    weekStart.setDate(weekDate.getDate() - weekDate.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const snapshot = generateWeeklySnapshot(
      courses,
      grades,
      weekStart,
      weekEnd
    );
    snapshots.push(snapshot);
  }

  return snapshots;
};

/**
 * Calculate course progress based on categories
 * @param {Array} categories - Array of category snapshots
 * @returns {number} Progress percentage
 */
const calculateCourseProgress = (categories) => {
  if (!categories || categories.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  categories.forEach((category) => {
    totalWeight += category.weight || 0;
    if (category.currentAverage > 0) {
      completedWeight += category.weight || 0;
    }
  });

  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
};

/**
 * Calculate overall progress across all courses
 * @param {Object} courseGrades - Object containing course grade snapshots
 * @returns {number} Overall progress percentage
 */
const calculateOverallProgress = (courseGrades) => {
  const courses = Object.values(courseGrades);
  if (courses.length === 0) return 0;

  const totalProgress = courses.reduce(
    (sum, course) => sum + course.progress,
    0
  );
  return totalProgress / courses.length;
};

/**
 * Analyze grade trends from weekly snapshots
 * @param {Array} snapshots - Array of weekly snapshots
 * @returns {Object} Trend analysis
 */
export const analyzeGradeTrends = (snapshots) => {
  if (snapshots.length < 2) return null;

  const firstWeek = snapshots[0].overallGPA;
  const lastWeek = snapshots[snapshots.length - 1].overallGPA;
  const change = lastWeek - firstWeek;

  const weeklyChanges = snapshots.slice(1).map((snapshot, index) => {
    const prevSnapshot = snapshots[index];
    return snapshot.overallGPA - prevSnapshot.overallGPA;
  });

  const volatility = Math.sqrt(
    weeklyChanges.reduce((sum, change) => sum + change * change, 0) /
      weeklyChanges.length
  );

  const trend =
    change > 0.1 ? "improving" : change < -0.1 ? "declining" : "stable";
  const consistency =
    volatility < 0.2 ? "high" : volatility < 0.5 ? "medium" : "low";

  return {
    trend,
    change: parseFloat(change.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
    consistency,
    weeklyChanges,
    firstWeek,
    lastWeek,
    totalWeeks: snapshots.length,
  };
};

/**
 * Generate grade predictions based on current trends
 * @param {Array} snapshots - Array of weekly snapshots
 * @param {number} weeksAhead - Number of weeks to predict
 * @returns {Object} Prediction data
 */
export const predictGradeTrends = (snapshots, weeksAhead = 4) => {
  if (snapshots.length < 3) return null;

  const recentSnapshots = snapshots.slice(-3); // Use last 3 weeks for prediction
  const changes = recentSnapshots.slice(1).map((snapshot, index) => {
    return snapshot.overallGPA - recentSnapshots[index].overallGPA;
  });

  const averageChange =
    changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const currentGPA = snapshots[snapshots.length - 1].overallGPA;

  const predictions = [];
  for (let i = 1; i <= weeksAhead; i++) {
    const predictedGPA = Math.max(
      0,
      Math.min(4.0, currentGPA + averageChange * i)
    );
    predictions.push({
      week: `Week ${snapshots.length + i}`,
      predictedGPA: parseFloat(predictedGPA.toFixed(2)),
      confidence: Math.max(0, 1 - i * 0.1), // Confidence decreases over time
    });
  }

  return {
    predictions,
    averageChange: parseFloat(averageChange.toFixed(2)),
    currentGPA,
    confidence: "medium", // Could be calculated based on volatility
  };
};

/**
 * Get grade insights and recommendations
 * @param {Array} snapshots - Array of weekly snapshots
 * @returns {Array} Array of insights
 */
export const generateGradeInsights = (snapshots) => {
  const insights = [];
  const trendAnalysis = analyzeGradeTrends(snapshots);

  if (!trendAnalysis) return insights;

  // Trend insights
  if (trendAnalysis.trend === "improving") {
    insights.push({
      type: "positive",
      title: "Great Progress!",
      message: `Your GPA has improved by ${trendAnalysis.change} points over the last ${trendAnalysis.totalWeeks} weeks. Keep up the excellent work!`,
      action: "Continue your current study habits and maintain consistency.",
    });
  } else if (trendAnalysis.trend === "declining") {
    insights.push({
      type: "warning",
      title: "Grade Decline Detected",
      message: `Your GPA has decreased by ${Math.abs(
        trendAnalysis.change
      )} points. It's time to reassess your study strategy.`,
      action:
        "Consider seeking help, reviewing study methods, or meeting with instructors.",
    });
  }

  // Consistency insights
  if (trendAnalysis.consistency === "low") {
    insights.push({
      type: "info",
      title: "Inconsistent Performance",
      message:
        "Your grades are fluctuating significantly. This might indicate inconsistent study habits.",
      action: "Try to establish a regular study schedule and stick to it.",
    });
  } else if (trendAnalysis.consistency === "high") {
    insights.push({
      type: "positive",
      title: "Consistent Performance",
      message:
        "Your grades are stable and consistent. This shows good study discipline.",
      action:
        "Maintain your current approach while looking for opportunities to improve.",
    });
  }

  // Recent performance insights
  const recentSnapshots = snapshots.slice(-2);
  if (recentSnapshots.length === 2) {
    const recentChange =
      recentSnapshots[1].overallGPA - recentSnapshots[0].overallGPA;
    if (recentChange > 0.2) {
      insights.push({
        type: "positive",
        title: "Recent Improvement",
        message: `Your GPA increased by ${recentChange.toFixed(
          2
        )} points this week!`,
        action:
          "Identify what worked well this week and continue those practices.",
      });
    } else if (recentChange < -0.2) {
      insights.push({
        type: "warning",
        title: "Recent Decline",
        message: `Your GPA decreased by ${Math.abs(recentChange).toFixed(
          2
        )} points this week.`,
        action:
          "Review what might have caused this decline and adjust accordingly.",
      });
    }
  }

  return insights;
};
