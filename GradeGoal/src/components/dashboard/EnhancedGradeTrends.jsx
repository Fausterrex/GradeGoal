// ========================================
// ENHANCED GRADE TRENDS COMPONENT
// ========================================
// This component displays GPA cards and grade progression charts
// Features: GPA calculations, grade trends, filter options, course selection

import React, { useState, useMemo, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
} from "recharts";
// Removed GradeService import
import { getCourseColorScheme } from "../../utils/courseColors";
// Removed grade calculations import
// Removed all GPA calculation imports
import {
  getAcademicGoalsByUserId,
  getUserProfile,
} from "../../backend/api";
import { useAuth } from "../../context/AuthContext";

// Utility function to convert GPA to percentage
const gpaToPercentage = (gpa, scale = 4.0) => {
  return Math.round((gpa / scale) * 100);
};

// Utility function to convert percentage to GPA
const percentageToGPA = (percentage, scale = 4.0) => {
  return (percentage / 100) * scale;
};

const EnhancedGradeTrends = ({ courses, grades, overallGPA, gpaData }) => {
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
  }, [currentUser, selectedCourse, courses, grades, gpaData]);

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

      // Calculate target GPAs from goals
      const targetInfo = {
        semesterTarget: 0,
        cumulativeTarget: 0,
        averageCourseTarget: 0,
        courseTargets: {},
        hasSemesterGoal: false,
        hasCumulativeGoal: false,
        hasCourseGoals: false,
      };

      // Process each goal and convert target_value from percentage to GPA
      allGoals.forEach(goal => {
        if (goal.targetValue) {
          const targetPercentage = parseFloat(goal.targetValue);
          const targetGPA = percentageToGPA(targetPercentage);

          switch (goal.goalType) {
            case 'SEMESTER_GPA':
              targetInfo.semesterTarget = targetGPA;
              targetInfo.hasSemesterGoal = true;
              break;
            case 'CUMMULATIVE_GPA':
              targetInfo.cumulativeTarget = targetGPA;
              targetInfo.hasCumulativeGoal = true;
              break;
            case 'COURSE_GRADE':
              if (goal.courseId) {
                targetInfo.courseTargets[goal.courseId] = targetGPA;
                targetInfo.hasCourseGoals = true;
              }
              break;
          }
        }
      });

      // Calculate average course target if we have course goals
      if (Object.keys(targetInfo.courseTargets).length > 0) {
        const courseTargetValues = Object.values(targetInfo.courseTargets);
        targetInfo.averageCourseTarget = courseTargetValues.reduce((sum, target) => sum + target, 0) / courseTargetValues.length;
      }

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
    // Use actual GPA data from props
    const semestralGPA = gpaData?.semesterGPA || 0;
    setCurrentSemestralGPA(semestralGPA);

    // Calculate individual course GPA if a course is selected
    if (selectedCourse) {
      const courseId = selectedCourse.id || selectedCourse.courseId;
      const courseGPA = gpaData?.courseGPAs?.[courseId] || 0;
      setCurrentCourseGPA(courseGPA);
    } else {
      setCurrentCourseGPA(0);
    }

    // Use actual cumulative GPA from props
    const cumulativeGPAValue = gpaData?.cumulativeGPA || 0;
    setCumulativeGPA(cumulativeGPAValue);
  };

  // Removed calculateIndividualCourseGPA function

  // Generate simple weekly grade data for line chart
  const weeklyData = useMemo(() => {
    if (courses.length === 0) return [];

    const activeCourses = courses.filter((course) => course.isActive !== false);
    if (activeCourses.length === 0) return [];

    const weeks = timeRange === "4weeks" ? 4 : timeRange === "12weeks" ? 12 : 16;
    const weeklyData = [];

    // Get current GPA based on view mode
    let currentGPA = 0;
    if (selectedCourse) {
      currentGPA = currentCourseGPA || 0;
    } else {
      if (viewMode === "semester") {
        currentGPA = currentSemestralGPA || 0;
      } else if (viewMode === "cumulative") {
        currentGPA = cumulativeGPA || 0;
      } else {
        currentGPA = overallGPA || 0;
      }
    }

    // Create simple progression data
    for (let i = 0; i < weeks; i++) {
      const weekNumber = i + 1;
      
      const weekData = {
        week: `W${weekNumber}`,
        gpa: currentGPA,
        semesterGPA: currentSemestralGPA || 0,
        cumulativeGPA: cumulativeGPA || 0,
        [selectedCourse ? selectedCourse.name : "currentGPA"]: currentGPA,
      };

      weeklyData.push(weekData);
    }

    return weeklyData;
  }, [
    courses,
    timeRange,
    selectedCourse,
    currentCourseGPA,
    currentSemestralGPA,
    cumulativeGPA,
    overallGPA,
    viewMode,
  ]);


  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gpaValue = data.gpa || 0;
      
      let gpaLabel = "";
      if (selectedCourse) {
        gpaLabel = `${selectedCourse.name} GPA`;
      } else if (viewMode === "semester") {
        gpaLabel = "Current Semester GPA";
      } else if (viewMode === "cumulative") {
        gpaLabel = "Cumulative GPA";
      } else {
        gpaLabel = "Overall GPA";
      }

      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-semibold mb-2">{`Week: ${label}`}</p>
          <p className="text-green-400 mb-1 text-lg font-bold">
            {`${gpaLabel}: ${gpaValue.toFixed(2)}`}
          </p>
          <p className="text-gray-300 text-sm">
            {`Percentage: ${Math.round(0 /* Removed GPA conversion */)}%`}
          </p>
        </div>
      );
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
                ? gpaToPercentage(currentCourseGPA)
                : gpaToPercentage(currentSemestralGPA)
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
                : "Not Set"}
            </p>
            <p className="text-lg text-blue-200 mb-1">
              {selectedCourse
                ? targetGPAInfo.courseTargets[
                    selectedCourse.id || selectedCourse.courseId
                  ] > 0
                  ? `(${gpaToPercentage(targetGPAInfo.courseTargets[selectedCourse.id || selectedCourse.courseId])}%)`
                  : ""
                : targetGPAInfo.semesterTarget > 0
                ? `(${gpaToPercentage(targetGPAInfo.semesterTarget)}%)`
                : ""}
            </p>
            <p className="text-sm opacity-80">
              {selectedCourse
                ? selectedCourse.name
                : targetGPAInfo.semesterTarget > 0
                ? "Semester goal"
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
              ({gpaToPercentage(cumulativeGPA)}%)
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
                ? `(${gpaToPercentage(targetGPAInfo.cumulativeTarget)}%)`
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
              ? `${selectedCourse.name} GPA`
              : viewMode === "semester"
              ? "Current Semester GPA"
              : viewMode === "cumulative"
              ? "Cumulative GPA"
              : "Overall GPA"}
          </h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            📊 Hover over data points to see GPA values
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
              <LineChart data={weeklyData}>
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
                  tickFormatter={(value) => `${value.toFixed(1)}`}
                  fontWeight="500"
                  label={{ 
                    value: 'GPA Scale', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: '600' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={selectedCourse ? selectedCourse.name : "gpa"}
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
                />
              </LineChart>
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
