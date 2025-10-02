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
  
  // Add userAnalytics state
  const [userAnalytics, setUserAnalytics] = useState([]);

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [viewMode, setViewMode] = useState("semester"); // semester, cumulative, individual, comparison
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentSemester, setCurrentSemester] = useState("FIRST"); // Current semester filter
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

  // Load userAnalytics data for the selected course
  const loadUserAnalytics = async () => {
    try {

      // Always clear analytics first to prevent state pollution
      setUserAnalytics([]);

      if (!currentUser) {
        return;
      }

      if (viewMode === "individual" && !selectedCourse) {
        return;
      }

      // For semester and cumulative modes, we need to load analytics for all courses
      // For individual mode, we load analytics for the selected course
      let allAnalytics = [];
      
      if (viewMode === "individual" && selectedCourse) {
        // Individual mode: load analytics for specific course
        const userId = selectedCourse.userId || selectedCourse.id;
        const courseId = selectedCourse.courseId || selectedCourse.id;
        
        
        // For individual mode, always fetch ALL analytics for the course, then filter by semester in frontend
        // This ensures we have complete data and can handle semester switching properly
        const analyticsResponse = await fetch(`/api/database-calculations/user/${userId}/analytics/${courseId}`);
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          allAnalytics = Array.isArray(analyticsData) ? analyticsData : [analyticsData];
          console.log('✅ [EnhancedGradeTrends] Individual analytics loaded (all semesters):', {
            count: allAnalytics.length,
            data: allAnalytics,
            willFilterBySemester: currentSemester
          });
        } else {
          console.log('❌ [EnhancedGradeTrends] Failed to load individual analytics:', analyticsResponse.status);
        }
      } else {
        // Semester/Cumulative mode: load analytics for all courses
        const activeCourses = courses.filter(course => course.isActive !== false);
        console.log('📊 [EnhancedGradeTrends] Loading semester/cumulative analytics', {
          activeCourses: activeCourses.map(c => ({ id: c.id, name: c.name })),
          semester: currentSemester,
          viewMode
        });
        
        const analyticsPromises = activeCourses.map(async (course) => {
          const userId = course.userId || course.id;
          const courseId = course.courseId || course.id;
          
          try {
            // For cumulative mode, get ALL analytics (no semester filter)
            // For semester mode, filter by current semester
            const apiUrl = viewMode === "cumulative" 
              ? `/api/database-calculations/user/${userId}/analytics/${courseId}`
              : `/api/database-calculations/user/${userId}/analytics/${courseId}?semester=${currentSemester}`;
              
            console.log(`🔗 [EnhancedGradeTrends] API call for ${course.name}:`, { viewMode, apiUrl });
            
            const analyticsResponse = await fetch(apiUrl);
            if (analyticsResponse.ok) {
              const analyticsData = await analyticsResponse.json();
              const courseAnalytics = Array.isArray(analyticsData) ? analyticsData : [analyticsData];
              console.log(`📈 [EnhancedGradeTrends] Analytics for ${course.name}:`, courseAnalytics.length);
              return courseAnalytics;
            } else {
              console.log(`❌ [EnhancedGradeTrends] Failed to load analytics for ${course.name}:`, analyticsResponse.status);
              return [];
            }
          } catch (error) {
            console.error(`❌ [EnhancedGradeTrends] Error loading analytics for ${course.name}:`, error);
            return [];
          }
        });
        
        const analyticsResults = await Promise.all(analyticsPromises);
        allAnalytics = analyticsResults.flat();
        console.log('✅ [EnhancedGradeTrends] All analytics loaded:', {
          totalCount: allAnalytics.length,
          byViewMode: viewMode,
          semester: currentSemester
        });
      }
      
      console.log('🎯 [EnhancedGradeTrends] Setting user analytics:', {
        count: allAnalytics.length,
        viewMode,
        semester: currentSemester,
        preview: allAnalytics.slice(0, 3)
      });
      
      setUserAnalytics(allAnalytics);
    } catch (error) {
      console.error("❌ [EnhancedGradeTrends] Error loading user analytics:", error);
      setUserAnalytics([]);
    }
  };

  // Set default selected course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      const firstActiveCourse = courses.find(course => course.isActive !== false);
      if (firstActiveCourse) {
        setSelectedCourse(firstActiveCourse);
      }
    }
  }, [courses, selectedCourse]);

  // Load userAnalytics when selectedCourse or viewMode changes
  useEffect(() => {
    console.log('🔄 [EnhancedGradeTrends] useEffect triggered for analytics reload:', {
      currentUser: !!currentUser,
      viewMode,
      currentSemester,
      selectedCourse: selectedCourse ? { id: selectedCourse.id, name: selectedCourse.name } : null
    });
    
    if (currentUser) {
      loadUserAnalytics();
    }
  }, [selectedCourse, currentUser, viewMode, currentSemester]);

  // Load user ID and calculate GPAs when component mounts or data changes
  useEffect(() => {
    if (currentUser && selectedCourse) {
      loadTargetGPAInfo();
      calculateGPAs();
    }
  }, [currentUser, selectedCourse, courses, grades, gpaData]);

  // Recalculate GPAs when semester changes
  useEffect(() => {
    if (gpaData) {
      calculateGPAs();
    }
  }, [currentSemester, gpaData]);

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
    // Use semester-specific GPA based on currentSemester
    let semestralGPA = 0;
    if (gpaData) {
      switch (currentSemester) {
        case "FIRST":
          semestralGPA = gpaData.firstSemesterGPA || gpaData.semesterGPA || 0;
          break;
        case "SECOND":
          semestralGPA = gpaData.secondSemesterGPA || 0;
          break;
        case "THIRD":
          semestralGPA = gpaData.thirdSemesterGPA || 0;
          break;
        case "SUMMER":
          semestralGPA = gpaData.summerSemesterGPA || 0;
          break;
        default:
          semestralGPA = gpaData.semesterGPA || 0;
      }
    }
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

  // Generate weekly grade data using userAnalytics (same logic as UnifiedProgress)
  const weeklyData = useMemo(() => {
    // Only log when there's a significant change to reduce console noise
    if (userAnalytics?.length === 0) {
      console.log('📊 [EnhancedGradeTrends] Calculating weeklyData...', {
        coursesLength: courses.length,
        userAnalyticsLength: userAnalytics?.length || 0,
        viewMode,
        currentSemester,
        selectedCourse: selectedCourse ? selectedCourse.name : null
      });
    }

    if (courses.length === 0) {
      console.log('❌ [EnhancedGradeTrends] No courses available');
      return [];
    }

    const activeCourses = courses.filter((course) => course.isActive !== false);
    if (activeCourses.length === 0) {
      console.log('❌ [EnhancedGradeTrends] No active courses available');
      return [];
    }

    // Use userAnalytics data which contains the current_grade progression
    if (!userAnalytics || userAnalytics.length === 0) {
      console.log('❌ [EnhancedGradeTrends] No userAnalytics data available');
      return [];
    }

    // Add safety check to ensure userAnalytics is an array
    if (!Array.isArray(userAnalytics)) {
      console.warn('❌ [EnhancedGradeTrends] userAnalytics is not an array:', userAnalytics);
      return [];
    }

    // Filter analytics by current semester and course (if individual mode)
    let filteredAnalytics;
    
    if (viewMode === "cumulative") {
      // Cumulative mode: include ALL analytics from ALL semesters
      filteredAnalytics = userAnalytics;
      console.log('🔍 [EnhancedGradeTrends] Cumulative mode - using all analytics:', {
        totalCount: userAnalytics.length,
        sampleData: userAnalytics.slice(0, 2)
      });
    } else {
      // Semester/Individual mode: filter by current semester
      filteredAnalytics = userAnalytics.filter(analytics => 
        analytics.semester === currentSemester
      );
      console.log('🔍 [EnhancedGradeTrends] After semester filter:', {
        originalCount: userAnalytics.length,
        filteredCount: filteredAnalytics.length,
        semester: currentSemester,
        sampleData: filteredAnalytics.slice(0, 2)
      });
    }

    // If in individual mode and a course is selected, filter by that specific course
    if (viewMode === "individual" && selectedCourse) {
      const courseId = selectedCourse.courseId || selectedCourse.id;
      const beforeCourseFilter = filteredAnalytics.length;
      filteredAnalytics = filteredAnalytics.filter(analytics => 
        analytics.courseId === courseId
      );
      console.log('🔍 [EnhancedGradeTrends] After course filter:', {
        courseId,
        beforeCount: beforeCourseFilter,
        afterCount: filteredAnalytics.length,
        courseName: selectedCourse.name
      });
    }

    if (filteredAnalytics.length === 0) {
      console.log('❌ [EnhancedGradeTrends] No filtered analytics available');
      return [];
    }

    // Sort analytics by due_date to get chronological progression
    const sortedAnalytics = [...filteredAnalytics].sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });

    // Group analytics by week (Monday start)
    const weeklyGroups = {};
    sortedAnalytics.forEach((analytics, index) => {
      const dueDate = new Date(analytics.dueDate || analytics.createdAt);
      if (isNaN(dueDate.getTime())) return;

      const weekStart = new Date(dueDate);
      const dayOfWeek = weekStart.getDay();
      let daysToMonday;
      if (dayOfWeek === 0) {
        daysToMonday = -6;
      } else {
        daysToMonday = -(dayOfWeek - 1);
      }
      weekStart.setDate(weekStart.getDate() + daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = {
          weekStart: weekStart,
          analytics: [],
          latestCurrentGrade: 0,
          latestTimestamp: null
        };
      }
      
      weeklyGroups[weekKey].analytics.push(analytics);
      
      // Keep track of the latest current_grade for this week (by calculated_at timestamp)
      const currentTimestamp = new Date(analytics.calculatedAt || analytics.createdAt);
      const existingTimestamp = weeklyGroups[weekKey].latestTimestamp ? 
        new Date(weeklyGroups[weekKey].latestTimestamp) : new Date(0);
      
      if (currentTimestamp > existingTimestamp) {
        weeklyGroups[weekKey].latestCurrentGrade = analytics.currentGrade || 0;
        weeklyGroups[weekKey].latestTimestamp = analytics.calculatedAt || analytics.createdAt;
      }
    });
    
    
    const weeklyData = [];
    Object.values(weeklyGroups).forEach((group, index) => {
      let currentGPA = group.latestCurrentGrade;
      
      // For semester mode, use the current semester GPA for the latest week
      if (viewMode === "semester" && index === Object.values(weeklyGroups).length - 1) {
        currentGPA = currentSemestralGPA || 0;
      }
      
      // For individual mode, use the current course GPA for the latest week
      if (viewMode === "individual" && selectedCourse && index === Object.values(weeklyGroups).length - 1) {
        currentGPA = currentCourseGPA || 0;
      }
      
      // For cumulative mode, use the current cumulative GPA for the latest week
      if (viewMode === "cumulative" && index === Object.values(weeklyGroups).length - 1) {
        currentGPA = cumulativeGPA || 0;
      }
      
      const weekData = {
        week: `W${index + 1}`,
        gpa: currentGPA,
        semesterGPA: currentSemestralGPA || 0,
        cumulativeGPA: cumulativeGPA || 0,
        [selectedCourse ? selectedCourse.name : "currentGPA"]: currentGPA,
        currentGrade: currentGPA,
        assessmentCount: group.analytics.length,
        weekNumber: index + 1
      };

      weeklyData.push(weekData);
    });

    // Only log successful calculations with data
    if (weeklyData.length > 0) {
      console.log('✅ [EnhancedGradeTrends] Final weeklyData calculated:', {
        count: weeklyData.length,
        viewMode,
        semester: currentSemester,
        dataPreview: weeklyData.slice(0, 2)
      });
    }

    return weeklyData;
  }, [
    courses,
    userAnalytics,
    selectedCourse,
    viewMode,
    currentCourseGPA,
    currentSemestralGPA,
    cumulativeGPA,
    overallGPA,
    currentSemester
  ]);


  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gpaValue = data.gpa || 0;
      
        let gpaLabel = "";
      if (viewMode === "individual" && selectedCourse) {
        gpaLabel = `${selectedCourse.name} GPA`;
      } else if (viewMode === "semester") {
        gpaLabel = `${currentSemester === "FIRST" ? "1st" : currentSemester === "SECOND" ? "2nd" : currentSemester === "THIRD" ? "3rd" : "Summer"} Semester GPA`;
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
            {`Percentage: ${Math.round((gpaValue / 4.0) * 100)}%`}
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
            VIEW MODE BUTTONS
            ======================================== */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🔄 [EnhancedGradeTrends] Switching to semester mode');
              setViewMode("semester");
              setSelectedCourse(null);
              // Clear analytics to force reload
              setUserAnalytics([]);
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
              console.log('🔄 [EnhancedGradeTrends] Switching to cumulative mode');
              setViewMode("cumulative");
              setSelectedCourse(null);
              // Clear analytics to force reload
              setUserAnalytics([]);
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
              console.log('🔄 [EnhancedGradeTrends] Switching to individual mode');
              setViewMode("individual");
              // Clear analytics to force reload with fresh data
              setUserAnalytics([]);
              
              // Filter courses by current semester
              const semesterCourses = courses.filter(
                (course) => course.isActive !== false && course.semester === currentSemester
              );
              
              // Check if current selected course is in the current semester
              const isSelectedCourseInCurrentSemester = selectedCourse && 
                selectedCourse.semester === currentSemester;
              
              if (!selectedCourse || !isSelectedCourseInCurrentSemester) {
                // Auto-select first course from current semester
                if (semesterCourses.length > 0) {
                  console.log('🎯 [EnhancedGradeTrends] Auto-selecting first course from current semester:', semesterCourses[0].name);
                  setSelectedCourse(semesterCourses[0]);
                } else {
                  console.log('⚠️ [EnhancedGradeTrends] No courses in current semester, clearing selection');
                  setSelectedCourse(null);
                }
              } else {
                console.log('🎯 [EnhancedGradeTrends] Keeping current course selection:', selectedCourse.name);
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
                {viewMode === "individual" && selectedCourse
                  ? "Current Course GPA"
                  : viewMode === "semester"
                  ? `${currentSemester === "FIRST" ? "1st" : currentSemester === "SECOND" ? "2nd" : currentSemester === "THIRD" ? "3rd" : "Summer"} Semester GPA`
                  : viewMode === "cumulative"
                  ? "Cumulative GPA"
                  : "Current Semestral GPA"}
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {viewMode === "individual" && selectedCourse
                ? currentCourseGPA.toFixed(2)
                : viewMode === "semester"
                ? currentSemestralGPA.toFixed(2)
                : viewMode === "cumulative"
                ? cumulativeGPA.toFixed(2)
                : currentSemestralGPA.toFixed(2)}
            </p>
            <p className="text-lg text-gray-600 mb-1">
              ({viewMode === "individual" && selectedCourse
                ? gpaToPercentage(currentCourseGPA)
                : viewMode === "semester"
                ? gpaToPercentage(currentSemestralGPA)
                : viewMode === "cumulative"
                ? gpaToPercentage(cumulativeGPA)
                : gpaToPercentage(currentSemestralGPA)
              }%)
            </p>
            <p className="text-sm opacity-80">
              {viewMode === "individual" && selectedCourse
                ? selectedCourse.name
                : viewMode === "semester"
                ? "Current semester only"
                : viewMode === "cumulative"
                ? "All semesters combined"
                : "Current semester only"}
            </p>
          </div>

          {/* ========================================
              TARGET GPA CARD
              ======================================== */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-2">
              <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                {viewMode === "individual" && selectedCourse
                  ? "Course Target GPA"
                  : viewMode === "semester"
                  ? `${currentSemester === "FIRST" ? "1st" : currentSemester === "SECOND" ? "2nd" : currentSemester === "THIRD" ? "3rd" : "Summer"} Semester Target GPA`
                  : viewMode === "cumulative"
                  ? "Cumulative Target GPA"
                  : "Semester Target GPA"}
              </h3>
            </div>
            <p className="text-4xl font-bold mb-1">
              {viewMode === "individual" && selectedCourse
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
                : viewMode === "semester"
                ? targetGPAInfo.semesterTarget > 0
                  ? Math.min(targetGPAInfo.semesterTarget, 4.0).toFixed(2)
                  : "Not Set"
                : viewMode === "cumulative"
                ? targetGPAInfo.cumulativeTarget > 0
                  ? Math.min(targetGPAInfo.cumulativeTarget, 4.0).toFixed(2)
                  : "Not Set"
                : targetGPAInfo.semesterTarget > 0
                ? Math.min(targetGPAInfo.semesterTarget, 4.0).toFixed(2)
                : "Not Set"}
            </p>
            <p className="text-lg text-blue-200 mb-1">
              {viewMode === "individual" && selectedCourse
                ? targetGPAInfo.courseTargets[
                    selectedCourse.id || selectedCourse.courseId
                  ] > 0
                  ? `(${gpaToPercentage(targetGPAInfo.courseTargets[selectedCourse.id || selectedCourse.courseId])}%)`
                  : ""
                : viewMode === "semester"
                ? targetGPAInfo.semesterTarget > 0
                  ? `(${gpaToPercentage(targetGPAInfo.semesterTarget)}%)`
                  : ""
                : viewMode === "cumulative"
                ? targetGPAInfo.cumulativeTarget > 0
                  ? `(${gpaToPercentage(targetGPAInfo.cumulativeTarget)}%)`
                  : ""
                : targetGPAInfo.semesterTarget > 0
                ? `(${gpaToPercentage(targetGPAInfo.semesterTarget)}%)`
                : ""}
            </p>
            <p className="text-sm opacity-80">
              {viewMode === "individual" && selectedCourse
                ? selectedCourse.name
                : viewMode === "semester"
                ? targetGPAInfo.semesterTarget > 0
                  ? "Semester goal"
                  : "No targets set"
                : viewMode === "cumulative"
                ? targetGPAInfo.cumulativeTarget > 0
                  ? "Long-term academic goal"
                  : "No targets set"
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
            {viewMode === "individual" && selectedCourse
              ? `${selectedCourse.name} GPA`
              : viewMode === "semester"
              ? `${currentSemester === "FIRST" ? "1st" : currentSemester === "SECOND" ? "2nd" : currentSemester === "THIRD" ? "3rd" : "Summer"} Semester GPA`
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

        {/* ========================================
            SEMESTER SELECTOR (Only for semester mode)
            ======================================== */}
        {viewMode === "semester" && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Select Semester
              </h4>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                📅 View different semester progress
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["FIRST", "SECOND", "THIRD", "SUMMER"].map((semester) => (
                <button
                  key={semester}
                  onClick={() => {
                    console.log('🔄 [EnhancedGradeTrends] Switching semester:', {
                      from: currentSemester,
                      to: semester,
                      viewMode
                    });
                    setCurrentSemester(semester);
                    // Clear analytics to force reload with new semester
                    setUserAnalytics([]);
                    
                    // If in individual mode, check if selected course belongs to new semester
                    if (viewMode === "individual" && selectedCourse) {
                      if (selectedCourse.semester !== semester) {
                        console.log('🎯 [EnhancedGradeTrends] Selected course not in new semester, clearing selection');
                        setSelectedCourse(null);
                      }
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentSemester === semester
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-300"
                  }`}
                >
                  {semester === "FIRST" && "1st Semester"}
                  {semester === "SECOND" && "2nd Semester"}
                  {semester === "THIRD" && "3rd Semester"}
                  {semester === "SUMMER" && "Summer"}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Currently viewing: <span className="font-semibold">{currentSemester === "FIRST" ? "1st" : currentSemester === "SECOND" ? "2nd" : currentSemester === "THIRD" ? "3rd" : "Summer"} Semester</span>
              </span>
            </div>
          </div>
        )}
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
              SEMESTER SELECTOR FOR INDIVIDUAL MODE
              ======================================== */}
           <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
             <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
               Select Semester
             </h4>
             <div className="flex gap-2 flex-wrap">
               {["FIRST", "SECOND", "THIRD", "SUMMER"].map((semester) => (
                 <button
                   key={semester}
                   onClick={() => {
                     console.log('🔄 [EnhancedGradeTrends] Switching semester in individual mode:', {
                       from: currentSemester,
                       to: semester,
                       viewMode,
                       selectedCourse: selectedCourse?.name
                     });
                     setCurrentSemester(semester);
                     // Clear analytics to force reload with new semester data
                     setUserAnalytics([]);
                     
                     // Check if selected course belongs to new semester
                     if (selectedCourse && selectedCourse.semester !== semester) {
                       console.log('🎯 [EnhancedGradeTrends] Selected course not in new semester, clearing selection');
                       setSelectedCourse(null);
                     }
                   }}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                     currentSemester === semester
                       ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105"
                       : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-300"
                   }`}
                 >
                   {semester === "FIRST" && "1st Semester"}
                   {semester === "SECOND" && "2nd Semester"}
                   {semester === "THIRD" && "3rd Semester"}
                   {semester === "SUMMER" && "Summer"}
                 </button>
               ))}
             </div>
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
                .filter((course) => {
                  // Filter courses by current semester
                  const courseSemester = course.semester;
                  const matchesSemester = courseSemester === currentSemester;
                  
                  console.log('🔍 [EnhancedGradeTrends] Course semester filter:', {
                    courseName: course.name,
                    courseSemester,
                    currentSemester,
                    matches: matchesSemester
                  });
                  
                  return matchesSemester;
                })
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
                      onClick={() => {
                        const newCourse = isSelected ? null : course;
                        console.log('🎯 [EnhancedGradeTrends] Course selection changed:', {
                          from: selectedCourse?.name || 'none',
                          to: newCourse?.name || 'none',
                          semester: currentSemester
                        });
                        
                        // Clear analytics to force fresh data load for the new course
                        setUserAnalytics([]);
                        setSelectedCourse(newCourse);
                      }}
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
