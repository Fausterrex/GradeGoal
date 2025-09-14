// ========================================
// ENHANCED GRADE TRENDS COMPONENT
// ========================================
// This component displays GPA cards and grade progression charts
// Features: GPA calculations, grade trends, filter options, course selection

import React, { useState, useMemo, useEffect } from "react";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from "recharts";
import GradeService from "../../services/gradeService";
import { getCourseColorScheme } from "../../utils/courseColors";
import { convertPercentageToGPA, convertGPAToPercentage } from "../../utils/gradeCalculations";
import {
  calculateCumulativeGPA,
  getCumulativeGPAStats,
} from "../../utils/cgpa";
import {
  calculateCurrentSemesterGPA,
  getCurrentSemesterGPADetails,
  getCurrentAcademicPeriod,
} from "../../utils/semestralGPA";
import { getTargetGPAInfo, calculateGoalProgress } from "../../utils/targetGPA";
import {
  getAcademicGoalsByCourse,
  getAcademicGoalsByUserId,
  getUserProfile,
} from "../../backend/api";
import { useAuth } from "../../context/AuthContext";

const EnhancedGradeTrends = ({ courses, grades, overallGPA }) => {
  const { currentUser } = useAuth();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [timeRange, setTimeRange] = useState("12weeks"); // 4weeks, 12weeks, semester
  const [viewMode, setViewMode] = useState("semester"); // semester, cumulative, individual, comparison
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [targetGPAInfo, setTargetGPAInfo] = useState({
    semesterTarget: 0,
    cumulativeTarget: 0,
    averageCourseTarget: 0,
    courseTargets: {},
    hasSemesterGoal: false,
    hasCumulativeGoal: false,
    hasCourseGoals: false,
  });
  const [currentSemestralGPA, setCurrentSemestralGPA] = useState(0);
  const [currentCourseGPA, setCurrentCourseGPA] = useState(0);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);
  const [userId, setUserId] = useState(null);

  // Load user ID and calculate GPAs when component mounts or data changes
  useEffect(() => {
    if (currentUser && (selectedCourse || courses.length > 0)) {
      loadTargetGPAInfo();
      calculateGPAs();
    }
  }, [currentUser, selectedCourse, courses, grades]);

  const loadTargetGPAInfo = async () => {
    if (!currentUser) {
      setTargetGPAInfo({
        semesterTarget: 0,
        cumulativeTarget: 0,
        averageCourseTarget: 0,
        courseTargets: {},
        hasSemesterGoal: false,
        hasCumulativeGoal: false,
        hasCourseGoals: false,
      });
      return;
    }

    try {
      // Get user profile to get userId
      const userProfile = await getUserProfile(currentUser.email);
      setUserId(userProfile.userId);

      // Get all goals
      const allGoals = await getAcademicGoalsByUserId(userProfile.userId);

      // Calculate target GPA info using utility function
      const targetInfo = getTargetGPAInfo(allGoals, courses);
      setTargetGPAInfo(targetInfo);
    } catch (error) {
      console.error("Error loading target GPA info:", error);
      setTargetGPAInfo({
        semesterTarget: 0,
        cumulativeTarget: 0,
        averageCourseTarget: 0,
        courseTargets: {},
        hasSemesterGoal: false,
        hasCumulativeGoal: false,
        hasCourseGoals: false,
      });
    }
  };

  const calculateGPAs = async () => {
    console.log("🔍 EnhancedGradeTrends - calculateGPAs called");
    console.log("🔍 Courses:", courses);
    console.log("🔍 Grades:", grades);
    
    // Calculate current semestral GPA using utility function
    const semestralGPA = await calculateCurrentSemesterGPA(courses, grades);
    console.log("🔍 Calculated semestralGPA:", semestralGPA);
    setCurrentSemestralGPA(semestralGPA);

    // Calculate individual course GPA if a course is selected
    if (selectedCourse) {
      const courseGPA = await calculateIndividualCourseGPA(selectedCourse, grades);
      console.log("🔍 Selected course GPA:", courseGPA);
      setCurrentCourseGPA(courseGPA);
    } else {
      setCurrentCourseGPA(0);
    }

    // Calculate cumulative GPA using utility function
    const cumulativeGPAValue = await calculateCumulativeGPA(courses, grades);
    console.log("🔍 Calculated cumulativeGPAValue:", cumulativeGPAValue);
    setCumulativeGPA(cumulativeGPAValue);
  };

  const calculateIndividualCourseGPA = async (course, grades) => {
    if (!course || !grades) {
      return 0;
    }

    try {
      // Use the same logic as GradeEntry component
      // Check if there are any grades at all
      const hasAnyGrades = Object.values(grades).some(
        (categoryGrades) =>
          Array.isArray(categoryGrades) && categoryGrades.length > 0
      );

      if (!hasAnyGrades) {
        return 0; // No grades at all, return 0
      }

      // Use the course with its categories for calculation (same as GradeEntry)
      const courseWithCategories = {
        ...course,
        categories: course.categories || [],
      };
      
      const result = await GradeService.calculateCourseGrade(
        courseWithCategories,
        grades
      );

      if (result.success) {
        let courseGrade = result.courseGrade;

        // Always convert to GPA using the same logic as GradeEntry
        // If the grade is greater than 4.0, it's a percentage and needs conversion
        if (courseGrade > 4.0) {
          courseGrade = GradeService.convertPercentageToGPA(
            courseGrade,
            course.gpaScale || "4.0"
          );
        }

        return courseGrade;
      }

      return 0;
    } catch (error) {
      console.error(
        `Error calculating GPA for course ${course.courseName || course.name}:`,
        error
      );
      return 0;
    }
  };

  // Generate weekly grade data - simplified for now, will be replaced with database
  const weeklyData = useMemo(() => {
    if (courses.length === 0) return [];

    const activeCourses = courses.filter((course) => course.isActive !== false);
    if (activeCourses.length === 0) return [];

    const weeks =
      timeRange === "4weeks" ? 4 : timeRange === "12weeks" ? 12 : 16;
    const weeklyData = [];

    // Calculate current GPA based on view mode
    let currentGPA = 0;
    if (selectedCourse) {
      // Individual course view
      if (grades && typeof grades === "object") {
        try {
          const gradeResult = GradeService.calculateCourseGrade(
            selectedCourse,
            grades
          );
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            if (courseGrade > 4.0) {
              courseGrade = GradeService.convertPercentageToGPA(
                courseGrade,
                selectedCourse.gpaScale || "4.0"
              );
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              currentGPA = courseGrade;
            }
          }
        } catch (error) {
          currentGPA = 0;
        }
      }
    } else {
      // Overall view - determine which GPA to show based on viewMode
      if (viewMode === "semester") {
        currentGPA = currentSemestralGPA || 0;
      } else if (viewMode === "cumulative") {
        currentGPA = cumulativeGPA || 0;
      } else {
        currentGPA = overallGPA || 0;
      }
    }

    // Create realistic progression data with some variation
    let previousGPA = 0;
    for (let i = 0; i < weeks; i++) {
      const weekNumber = i + 1;
      
      // Add some realistic variation to make the chart more interesting
      let weekGPA = currentGPA;
      if (i > 0) {
        // Add small random variations to simulate grade changes
        const variation = (Math.random() - 0.5) * 0.2; // ±0.1 GPA variation
        weekGPA = Math.max(0, Math.min(4.0, previousGPA + variation));
      } else {
        weekGPA = Math.max(0, Math.min(4.0, currentGPA - 0.3)); // Start slightly lower
      }
      
      // Calculate GPA change from previous week
      const gpaChange = i > 0 ? weekGPA - previousGPA : 0;
      
      const weekData = {
        week: `W${weekNumber}`,
        date: new Date().toISOString().split("T")[0],
        overallGPA: weekGPA,
        individualGPA: weekGPA,
        semesterGPA: weekGPA,
        cumulativeGPA: weekGPA,
        gradeChange: gpaChange,
        gpaChange: gpaChange, // Add explicit GPA change field
        individualGrades: {},
        [selectedCourse
          ? selectedCourse.name
          : viewMode === "semester"
          ? "semesterGPA"
          : viewMode === "cumulative"
          ? "cumulativeGPA"
          : "overallGPA"]: weekGPA,
      };

      weeklyData.push(weekData);
      previousGPA = weekGPA;
    }

    return weeklyData;
  }, [
    courses,
    grades,
    timeRange,
    selectedCourse,
    overallGPA,
    viewMode,
    currentSemestralGPA,
    cumulativeGPA,
  ]);

  // Calculate current GPA for display
  const currentDisplayGPA = useMemo(() => {
    if (selectedCourse) {
      // For individual course, calculate the course's current GPA using the same logic as GradeEntry
      if (!grades) {
        return 0;
      }

      // Use the same calculation logic as Dashboard component
      try {
        const gradeResult = GradeService.calculateCourseGrade(
          selectedCourse,
          grades
        );
        if (gradeResult.success) {
          let courseGrade = gradeResult.courseGrade;
          // Always convert to GPA if the grade is greater than 4.0 (indicating it's a percentage)
          if (courseGrade > 4.0) {
            courseGrade = GradeService.convertPercentageToGPA(
              courseGrade,
              selectedCourse.gpaScale || "4.0"
            );
          }
          if (courseGrade >= 1.0 && courseGrade <= 4.0) {
            return courseGrade;
          }
        }
        return 0;
      } catch (error) {
        return 0;
      }
    } else {
      // For overall view, calculate weighted average of all courses
      if (
        !grades ||
        !Array.isArray(grades) ||
        !courses ||
        !Array.isArray(courses)
      )
        return overallGPA || 0;

      const activeCourses = courses.filter(
        (course) => course.isActive !== false
      );
      if (activeCourses.length === 0) return overallGPA || 0;

      let totalWeightedGPA = 0;
      let totalWeight = 0;

      activeCourses.forEach((course) => {
        const courseGrades = grades.filter(
          (grade) => grade.courseId === course.id
        );
        if (courseGrades.length > 0) {
          const courseGpaScale = course.gpaScale || "4.0";
          const courseTotalGPA = courseGrades.reduce((sum, grade) => {
            const points = parseFloat(grade.points) || 0;
            const maxPoints = parseFloat(grade.maxPoints) || 100;
            const percentage = (points / maxPoints) * 100;
            const gpa = convertPercentageToGPA(percentage, courseGpaScale);
            return sum + gpa;
          }, 0);

          const courseAverageGPA = courseTotalGPA / courseGrades.length;
          const courseWeight = courseGrades.length; // Weight by number of grades

          totalWeightedGPA += courseAverageGPA * courseWeight;
          totalWeight += courseWeight;
        }
      });

      return totalWeight > 0 ? totalWeightedGPA / totalWeight : overallGPA || 0;
    }
  }, [selectedCourse, grades, overallGPA, courses]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Show different data based on view mode
      if (selectedCourse) {
        // Individual course view - show course-specific data
        const courseGPA = data[selectedCourse.name] || data.overallGPA || 0;
        const gpaChange = data.gpaChange || data.gradeChange || 0;
        return (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
            <p className="text-white font-semibold mb-2">{`Week: ${label}`}</p>
            <p className="text-green-400 mb-1 text-lg font-bold">
              {`${selectedCourse.name} GPA: ${courseGPA.toFixed(2)}`}
            </p>
            <p className="text-gray-300 text-sm mb-2">
              {`Percentage: ${Math.round(convertGPAToPercentage(courseGPA, "4.0"))}%`}
            </p>
            {gpaChange !== 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  gpaChange > 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {gpaChange > 0 ? "↗️" : "↘️"}
                </span>
                <p
                  className={`text-sm font-semibold ${
                    gpaChange > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {`GPA Change: ${
                    gpaChange > 0 ? "+" : ""
                  }${gpaChange.toFixed(2)}`}
                </p>
              </div>
            )}
            {gpaChange === 0 && (
              <p className="text-gray-400 text-sm">No change from previous week</p>
            )}
          </div>
        );
      } else {
        // Overall view - show data based on view mode
        let gpaValue = 0;
        let gpaLabel = "";

        if (viewMode === "semester") {
          gpaValue = data.semesterGPA || data.overallGPA || 0;
          gpaLabel = "Current Semester GPA";
        } else if (viewMode === "cumulative") {
          gpaValue = data.cumulativeGPA || data.overallGPA || 0;
          gpaLabel = "Cumulative GPA";
        } else {
          gpaValue = data.overallGPA || 0;
          gpaLabel = "Overall GPA";
        }

        const gpaChange = data.gpaChange || data.gradeChange || 0;

        return (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
            <p className="text-white font-semibold mb-2">{`Week: ${label}`}</p>
            <p className="text-green-400 mb-1 text-lg font-bold">
              {`${gpaLabel}: ${gpaValue.toFixed(2)}`}
            </p>
            <p className="text-gray-300 text-sm mb-2">
              {`Percentage: ${Math.round(convertGPAToPercentage(gpaValue, "4.0"))}%`}
            </p>
            {gpaChange !== 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  gpaChange > 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {gpaChange > 0 ? "↗️" : "↘️"}
                </span>
                <p
                  className={`text-sm font-semibold ${
                    gpaChange > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {`GPA Change: ${
                    gpaChange > 0 ? "+" : ""
                  }${gpaChange.toFixed(2)}`}
                </p>
              </div>
            )}
            {gpaChange === 0 && (
              <p className="text-gray-400 text-sm">No change from previous week</p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      {/* ========================================
          TITLE SECTION
          ======================================== */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Grade Trends</h2>
      </div>

      {/* ========================================
          CONTROLS SECTION
          ======================================== */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* ========================================
            TIME RANGE BUTTONS
            ======================================== */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("4weeks")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === "4weeks"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            4 Weeks
          </button>
          <button
            onClick={() => setTimeRange("12weeks")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === "12weeks"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            12 Weeks
          </button>
          <button
            onClick={() => setTimeRange("semester")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              timeRange === "semester"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Full Semester
          </button>
        </div>

        {/* ========================================
            VIEW MODE BUTTONS
            ======================================== */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode("semester");
              setSelectedCourse(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              viewMode === "semester"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Current Semester
          </button>
          <button
            onClick={() => {
              setViewMode("cumulative");
              setSelectedCourse(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              viewMode === "cumulative"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Cumulative Progress
          </button>
          <button
            onClick={() => {
              setViewMode("individual");
              // Auto-select the first active course when switching to individual mode
              const activeCourses = courses.filter(
                (course) => course.isActive !== false
              );
              if (activeCourses.length > 0) {
                setSelectedCourse(activeCourses[0]);
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              viewMode === "individual"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            Individual Courses
          </button>
        </div>
      </div>

      {/* ========================================
          GPA SUMMARY CARDS
          ======================================== */}
      <div className="flex justify-center">
        {/* ========================================
            GPA CARDS GRID
            ======================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
          {/* ========================================
              CURRENT GPA CARD
              ======================================== */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                {selectedCourse
                  ? "Current Course GPA"
                  : "Current Semestral GPA"}
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {selectedCourse
                ? currentCourseGPA.toFixed(2)
                : currentSemestralGPA.toFixed(2)}
            </p>
            <p className="text-lg text-gray-600 mb-1">
              ({selectedCourse
                ? Math.round(convertGPAToPercentage(currentCourseGPA, "4.0"))
                : Math.round(convertGPAToPercentage(currentSemestralGPA, "4.0"))
              }%)
            </p>
            <p className="text-sm opacity-80">
              {selectedCourse ? selectedCourse.name : "Current semester only"}
            </p>
          </div>

          {/* ========================================
              TARGET GPA CARD
              ======================================== */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                {selectedCourse ? "Course Target GPA" : "Semester Target GPA"}
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {selectedCourse
                ? targetGPAInfo.courseTargets[
                    selectedCourse.id || selectedCourse.courseId
                  ] > 0
                  ? Math.min(
                      targetGPAInfo.courseTargets[
                        selectedCourse.id || selectedCourse.courseId
                      ],
                      4.0
                    ).toFixed(2)
                  : "Not Set"
                : targetGPAInfo.semesterTarget > 0
                ? Math.min(targetGPAInfo.semesterTarget, 4.0).toFixed(2)
                : targetGPAInfo.averageCourseTarget > 0
                ? Math.min(targetGPAInfo.averageCourseTarget, 4.0).toFixed(2)
                : "Not Set"}
            </p>
            <p className="text-lg text-blue-200 mb-1">
              {selectedCourse
                ? targetGPAInfo.courseTargets[
                    selectedCourse.id || selectedCourse.courseId
                  ] > 0
                  ? `(${Math.round(convertGPAToPercentage(
                      Math.min(
                        targetGPAInfo.courseTargets[
                          selectedCourse.id || selectedCourse.courseId
                        ],
                        4.0
                      ),
                      "4.0"
                    ))}%)`
                  : ""
                : targetGPAInfo.semesterTarget > 0
                ? `(${Math.round(convertGPAToPercentage(
                    Math.min(targetGPAInfo.semesterTarget, 4.0),
                    "4.0"
                  ))}%)`
                : targetGPAInfo.averageCourseTarget > 0
                ? `(${Math.round(convertGPAToPercentage(
                    Math.min(targetGPAInfo.averageCourseTarget, 4.0),
                    "4.0"
                  ))}%)`
                : ""}
            </p>
            <p className="text-sm opacity-80">
              {selectedCourse
                ? selectedCourse.name
                : targetGPAInfo.semesterTarget > 0
                ? "Semester goal"
                : targetGPAInfo.averageCourseTarget > 0
                ? "Average course target"
                : "No targets set"}
            </p>
          </div>

          {/* ========================================
              CUMULATIVE GPA CARD
              ======================================== */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                Cumulative GPA
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {cumulativeGPA.toFixed(2)}
            </p>
            <p className="text-lg text-orange-200 mb-1">
              ({Math.round(convertGPAToPercentage(cumulativeGPA, "4.0"))}%)
            </p>
            <p className="text-sm opacity-80">All semesters combined</p>
          </div>

          {/* ========================================
              CUMULATIVE TARGET GPA CARD
              ======================================== */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                Cumulative Target GPA
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {targetGPAInfo.cumulativeTarget > 0
                ? Math.min(targetGPAInfo.cumulativeTarget, 4.0).toFixed(2)
                : "Not Set"}
            </p>
            <p className="text-lg text-purple-200 mb-1">
              {targetGPAInfo.cumulativeTarget > 0
                ? `(${Math.round(convertGPAToPercentage(
                    Math.min(targetGPAInfo.cumulativeTarget, 4.0),
                    "4.0"
                  ))}%)`
                : ""}
            </p>
            <p className="text-sm opacity-80">Long-term academic goal</p>
          </div>
        </div>
      </div>

      {/* ========================================
          GRADE PROGRESSION CHART
          ======================================== */}
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 border border-gray-200">
        {/* ========================================
            CHART HEADER
            ======================================== */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedCourse
              ? `${selectedCourse.name} GPA Progression`
              : viewMode === "semester"
              ? "Current Semester GPA Progression"
              : viewMode === "cumulative"
              ? "Cumulative GPA Progression"
              : "Weekly GPA Progression"}
          </h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📊 Hover over data points to see GPA changes
          </div>
        </div>

        {/* ========================================
            CHART CONTAINER
            ======================================== */}
        <div className="h-96 bg-white rounded-xl p-4 border border-gray-200">
          {weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Grade Data Yet
                </h3>
                <p className="text-gray-500">
                  Add some assessments to see your grade progression
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyData}>
                <defs>
                  <linearGradient
                    id="gradeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week"
                  stroke="#6b7280"
                  fontSize={14}
                  tick={{ fill: "#374151" }}
                  fontWeight="500"
                />
                <YAxis
                  domain={[0, 4]}
                  stroke="#6b7280"
                  fontSize={14}
                  tick={{ fill: "#374151" }}
                  tickFormatter={(value) => `${value.toFixed(1)} GPA`}
                  fontWeight="500"
                  label={{ 
                    value: 'GPA Scale', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '600' }
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Grade area - different for overall vs individual */}
                <Area
                  type="monotone"
                  dataKey={
                    selectedCourse
                      ? selectedCourse.name
                      : viewMode === "semester"
                      ? "semesterGPA"
                      : viewMode === "cumulative"
                      ? "cumulativeGPA"
                      : "overallGPA"
                  }
                  fill="url(#gradeGradient)"
                  stroke="none"
                />

                {/* Grade line - different for overall vs individual */}
                <Line
                  type="monotone"
                  dataKey={
                    selectedCourse
                      ? selectedCourse.name
                      : viewMode === "semester"
                      ? "semesterGPA"
                      : viewMode === "cumulative"
                      ? "cumulativeGPA"
                      : "overallGPA"
                  }
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  dot={(props) => {
                    // Show dot at the top of the line (GPA position) - always purple
                    const data = props.payload;
                    const gpaValue = selectedCourse
                      ? data[selectedCourse.name] || data.overallGPA || 0
                      : viewMode === "semester"
                      ? data.semesterGPA || data.overallGPA || 0
                      : viewMode === "cumulative"
                      ? data.cumulativeGPA || data.overallGPA || 0
                      : data.overallGPA || 0;

                    if (data && gpaValue > 0) {
                      return (
                        <circle
                          key={`dot-${props.index}`}
                          cx={props.cx}
                          cy={props.cy}
                          r={6}
                          fill="#8b5cf6"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={{
                    r: 10,
                    stroke: "#8b5cf6",
                    strokeWidth: 3,
                    fill: "#fff",
                  }}
                  name=""
                />

                {/* GPA progression line - same for both overall and individual */}
                <Line
                  type="monotone"
                  dataKey={
                    selectedCourse
                      ? `individualGrades.${selectedCourse.name}`
                      : "newAssessments"
                  }
                  stroke="#6D4FC2"
                  strokeWidth={2}
                  dot={{ fill: "#6D4FC2", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "#6D4FC2", strokeWidth: 2 }}
                  name=""
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ========================================
          INDIVIDUAL COURSE TRENDS
          ======================================== */}
      {viewMode === "individual" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          {/* ========================================
              INDIVIDUAL COURSES HEADER
              ======================================== */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Individual Course Trends
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Click on a course to view its detailed progression
            </p>
          </div>

          {/* ========================================
              COURSE SELECTION GRID
              ======================================== */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {courses.filter((course) => course.isActive !== false).length ===
            0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📚</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">
                  No Active Courses
                </h4>
                <p className="text-gray-500 text-sm">
                  Add some courses to see individual trends
                </p>
              </div>
            ) : (
              courses
                .filter((course) => course.isActive !== false)
                .map((course) => {
                  const courseColorScheme = getCourseColorScheme(
                    course.name,
                    course.colorIndex || 0
                  );
                  // Convert Tailwind color classes to hex values
                  const colorMap = {
                    "bg-green-600": "#16a34a",
                    "bg-blue-600": "#2563eb",
                    "bg-purple-600": "#9333ea",
                    "bg-red-600": "#dc2626",
                    "bg-teal-600": "#0d9488",
                    "bg-indigo-600": "#4f46e5",
                    "bg-pink-600": "#db2777",
                    "bg-orange-600": "#ea580c",
                    "bg-cyan-600": "#0891b2",
                    "bg-emerald-600": "#059669",
                  };
                  const strokeColor =
                    colorMap[courseColorScheme.primary] || "#8168C5";

                  const isSelected =
                    selectedCourse && selectedCourse.id === course.id;

                  return (
                    <div
                      key={course.id}
                      className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                        isSelected
                          ? "border-purple-500 shadow-lg ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setSelectedCourse(isSelected ? null : course)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: strokeColor }}
                          ></div>
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            {course.name}
                          </h4>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGradeTrends;
