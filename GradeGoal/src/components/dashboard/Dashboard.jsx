// ========================================
// DASHBOARD COMPONENT
// ========================================
// This component displays the main dashboard overview
// Features: Course overview cards, GPA display, grade trends, course progress

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, Bell, User } from "lucide-react";
// Removed GradeService import
import EnhancedGradeTrends from "./EnhancedGradeTrends";
import ProfileEdit from "../auth/ProfileEdit";
import { getAcademicGoalsByCourse, getUserProfile } from "../../backend/api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = ({ courses, grades, overallGPA, onSearch, onLogout }) => {
  const { currentUser } = useAuth();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [activeTab, setActiveTab] = React.useState("active");
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);
  const [targetGrades, setTargetGrades] = useState({});
  const [userId, setUserId] = useState(null);
  const [gpaData, setGpaData] = useState({
    semesterGPA: 0,
    cumulativeGPA: 0,
    courseGPAs: {}
  });
  const [isLoadingGpa, setIsLoadingGpa] = useState(false);

  // Load user ID, target grades, and GPA data when component mounts
  useEffect(() => {
    if (currentUser && courses.length > 0) {
      loadUserAndTargetGrades();
      loadGpaData();
    }
  }, [currentUser, courses.length]); // Only depend on courses.length, not the entire courses array

  const loadUserAndTargetGrades = async () => {
    try {
      // Get user profile to get userId
      const userProfile = await getUserProfile(currentUser.email);
      setUserId(userProfile.userId);

      // Fetch target grades for all courses
      const targetGradesMap = {};
      for (const course of courses) {
        try {
          const goals = await getAcademicGoalsByCourse(
            userProfile.userId,
            course.id || course.courseId
          );
          const courseGradeGoal = goals.find(
            (goal) =>
              goal.goalType === "COURSE_GRADE" &&
              goal.courseId === (course.id || course.courseId)
          );
          if (courseGradeGoal) {
            targetGradesMap[course.id || course.courseId] =
              courseGradeGoal.targetValue;
          }
        } catch (error) {
          console.error(
            `Error loading target grade for course ${course.id}:`,
            error
          );
        }
      }
      setTargetGrades(targetGradesMap);
    } catch (error) {
      console.error("Error loading target grades:", error);
    }
  };

  const loadGpaData = async () => {
    if (isLoadingGpa) return; // Prevent multiple simultaneous calls
    
    try {
      setIsLoadingGpa(true);
      
      // Use existing userId if available, otherwise get user profile
      let currentUserId = userId;
      if (!currentUserId) {
        const userProfile = await getUserProfile(currentUser.email);
        currentUserId = userProfile.userId;
        setUserId(currentUserId);
      }

      // Fetch all semester GPAs from the new API
      const response = await fetch(`/api/user-progress/${currentUserId}/all-semester-gpas`);
      if (response.ok) {
        const data = await response.json();
        
        // Extract semester GPAs
        const semesterGPAs = data.semesterGPAs || {};
        const firstSemesterGPA = semesterGPAs.FIRST || 0;
        const secondSemesterGPA = semesterGPAs.SECOND || 0;
        const thirdSemesterGPA = semesterGPAs.THIRD || 0;
        const summerSemesterGPA = semesterGPAs.SUMMER || 0;
        
        // Get cumulative GPA from the original endpoint
        const cumulativeResponse = await fetch(`/api/user-progress/${currentUserId}/with-gpas`);
        let cumulativeGPA = 0;
        if (cumulativeResponse.ok) {
          const userProgress = await cumulativeResponse.json();
          cumulativeGPA = userProgress.cumulativeGpa || userProgress.cumulative_gpa || 0;
        }
        
        // Get course GPAs from the courses data
        const courseGPAs = {};
        courses.forEach(course => {
          const courseId = course.id || course.courseId;
          courseGPAs[courseId] = course.courseGpa || course.course_gpa || 0;
        });

        setGpaData({
          semesterGPA: firstSemesterGPA, // Default to first semester for backward compatibility
          cumulativeGPA,
          courseGPAs,
          // Add semester-specific GPAs
          firstSemesterGPA,
          secondSemesterGPA,
          thirdSemesterGPA,
          summerSemesterGPA
        });
        
        console.log("📊 Loaded semester GPAs:", {
          first: firstSemesterGPA,
          second: secondSemesterGPA,
          third: thirdSemesterGPA,
          summer: summerSemesterGPA,
          cumulative: cumulativeGPA
        });
      } else {
        console.error("Failed to fetch semester GPA data");
        // Fallback to original method
        const fallbackResponse = await fetch(`/api/user-progress/${currentUserId}/with-gpas`);
        if (fallbackResponse.ok) {
          const userProgress = await fallbackResponse.json();
          const semesterGPA = userProgress.semesterGpa || userProgress.semester_gpa || 0;
          const cumulativeGPA = userProgress.cumulativeGpa || userProgress.cumulative_gpa || 0;
          
          const courseGPAs = {};
          courses.forEach(course => {
            const courseId = course.id || course.courseId;
            courseGPAs[courseId] = course.courseGpa || course.course_gpa || 0;
          });

          setGpaData({
            semesterGPA,
            cumulativeGPA,
            courseGPAs
          });
        }
      }
    } catch (error) {
      console.error("Error loading GPA data:", error);
    } finally {
      setIsLoadingGpa(false);
    }
  };

  const generateGradeTrends = () => {
    if (courses.length === 0) return [];

    const activeCourses = courses.filter((course) => course.isActive !== false);
    if (activeCourses.length === 0) return [];

    const progressionData = [];

    progressionData.push({
      stage: "Initial",
      grade: 0,
      completedCourses: 0,
      totalCourses: activeCourses.length,
    });

    progressionData.push({
      stage: "Current",
      grade: parseFloat(overallGPA.toFixed(2)),
      completedCourses: 0,
      totalCourses: activeCourses.length,
    });

    return progressionData;
  };

  const gradeTrendsData = generateGradeTrends();

  const generateCourseBreakdown = useMemo(() => {
    if (courses.length === 0) return [];

    return courses.map((course) => {
      let status = "ON TRACK";

      if (course.isActive === false) {
        status = "ARCHIVED";
      } else {
        status = "ON TRACK";
      }

      // Get target grade from academic goals
      const courseId = course.id || course.courseId;
      const targetGrade = targetGrades[courseId];
      let targetGradeDisplay = targetGrade ? targetGrade.toString() : "Not Set";

      // Get actual course GPA from gpaData
      const courseGPA = gpaData.courseGPAs[courseId] || 0;
      const gradeDisplay = courseGPA > 0 ? courseGPA.toFixed(2) : "N/A";

      return {
        course: course.name,
        grade: gradeDisplay,
        targetGrade: targetGradeDisplay,
        status,
      };
    });
  }, [courses, targetGrades, gpaData]);

  const courseBreakdown = generateCourseBreakdown;

  const getFilteredCourseBreakdown = () => {
    switch (activeTab) {
      case "active":
        return courseBreakdown.filter((course) => course.status !== "ARCHIVED");
      case "archived":
        return courseBreakdown.filter((course) => course.status === "ARCHIVED");
      case "all":
      default:
        return courseBreakdown;
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 lg:p-6 w-full min-h-screen bg-gray-50">
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg">
        {/* ========================================
            HEADER CONTENT WRAPPER
            ======================================== */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          {/* ========================================
              DASHBOARD TITLE SECTION
              ======================================== */}
          <div className="text-center lg:text-left">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Dashboard
            </div>
          </div>

          {/* ========================================
              SEARCH AND ACTIONS SECTION
              ======================================== */}
          <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* ========================================
                SEARCH BAR INPUT
                ======================================== */}
            <div className="relative w-full sm:w-80 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, grades..."
                className="pl-10 pr-4 py-2.5 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 w-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>

            {/* ========================================
                ACTION ICONS SECTION
                ======================================== */}
            <div className="flex items-center space-x-3">
              {/* ========================================
                  NOTIFICATION BELL ICON
                  ======================================== */}
              <div className="relative">
                <Bell className="w-5 h-5 text-white cursor-pointer hover:text-white/80 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              {/* ========================================
                  USER PROFILE DROPDOWN
                  ======================================== */}
              <div className="relative group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-200 border border-white/30">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-semibold">Profile</p>
                      <p className="text-xs text-gray-500">
                        Manage your account
                      </p>
                    </div>
                    <button
                      onClick={() => setShowProfileEdit(true)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm("Are you sure you want to logout?")
                        ) {
                          onLogout && onLogout();
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mb-8 flex-shrink-0">
        <EnhancedGradeTrends
          courses={courses}
          grades={grades}
          overallGPA={overallGPA}
          gpaData={gpaData}
        />
      </div>

      {/* ========================================
          COURSE BREAKDOWN SECTION
          ======================================== */}
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl flex-1 min-h-0 border border-gray-100">
        {/* ========================================
            COURSE BREAKDOWN HEADER
            ======================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            {/* ========================================
                SECTION TITLE WITH ICON
                ======================================== */}
            <div className="flex items-center">
              <span className="w-3 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full mr-4"></span>
              <h2 className="text-2xl font-bold text-gray-900">
                Course Report Breakdown
              </h2>
            </div>

            {/* ========================================
                FILTER TABS SECTION
                ======================================== */}
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "active"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Active (
                {
                  courseBreakdown.filter(
                    (course) => course.status !== "ARCHIVED"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "archived"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Archived (
                {
                  courseBreakdown.filter(
                    (course) => course.status === "ARCHIVED"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                All ({courseBreakdown.length})
              </button>
            </div>
          </div>
        </div>

        {/* ========================================
            MOBILE CARD LAYOUT
            ======================================== */}
        <div className="block lg:hidden space-y-4">
          {getFilteredCourseBreakdown().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                Add some courses to see your progress here
              </p>
            </div>
          ) : (
            getFilteredCourseBreakdown().map((course, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 text-center shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="mb-3">
                  <h3 className="text-gray-800 font-semibold text-lg mb-2">
                    {course.course}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === "EXCELLENT"
                        ? "bg-blue-500 text-white"
                        : course.status === "ON TRACK"
                        ? "bg-green-500 text-white"
                        : course.status === "ARCHIVED"
                        ? "bg-orange-500 text-white"
                        : course.status === "ONGOING"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="text-gray-600 text-sm space-y-1">
                  <div>
                    Current GPA:{" "}
                    <span className="font-semibold text-gray-800">
                      {course.grade}
                    </span>
                  </div>
                  <div>
                    Target GPA:{" "}
                    <span className="font-semibold text-gray-800">
                      {course.targetGrade}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================
            DESKTOP TABLE LAYOUT
            ======================================== */}
        <div className="hidden lg:block overflow-x-auto">
          {getFilteredCourseBreakdown().length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-3">
                No courses found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Add some courses to see your detailed progress breakdown here
              </p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">
                    Course Name
                  </th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">
                    Current GPA
                  </th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">
                    Target GPA
                  </th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredCourseBreakdown().map((course, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6 text-center text-gray-800 text-lg font-medium">
                      {course.course}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-800 text-lg font-semibold">
                      {course.grade}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-800 text-lg font-semibold">
                      {course.targetGrade}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`min-w-[120px] text-center px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                          course.status === "EXCELLENT"
                            ? "bg-blue-100 text-blue-800"
                            : course.status === "ON TRACK"
                            ? "bg-green-100 text-green-800"
                            : course.status === "ARCHIVED"
                            ? "bg-orange-100 text-orange-800"
                            : course.status === "ONGOING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Profile Edit Modal */}
      <ProfileEdit
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
      />
    </div>
  );
};

export default Dashboard;
