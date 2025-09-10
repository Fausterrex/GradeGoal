// ========================================
// MAIN DASHBOARD COMPONENT
// ========================================
// This is the main dashboard component that orchestrates the entire application
// Features: Navigation, course management, grade entry, goal setting, data management

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CourseManager from "../course/CourseManager";
import GradeEntry from "../course/GradeEntry";
import GoalSetting from "./GoalSetting";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import SideCourseList from "./SideCourseList";
import { calculateCourseProgress } from "../../utils/progressCalculations";
import GradeService from "../../services/gradeService";
import {
  getGradesByCourseId,
  getCoursesByUid,
  getAssessmentCategoriesByCourseId,
} from "../../backend/api";
import {
  FaTachometerAlt,
  FaBook,
  FaBullseye,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";
import { getCourseColorScheme } from "../../utils/courseColors";
const slideInAnimation = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50px);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.5s ease-out;
  }

  .animate-slideOut {
    animation: slideOut 0.5s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = slideInAnimation;
  document.head.appendChild(style);
}

function MainDashboard({ initialTab = "overview" }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCourseManagerExpanded, setIsCourseManagerExpanded] = useState(false);
  const [isClosingOverlay, setIsClosingOverlay] = useState(false);
  const [isOpeningOverlay, setIsOpeningOverlay] = useState(false);
  const [previousTab, setPreviousTab] = useState("overview");
  const [showArchivedCourses, setShowArchivedCourses] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileCourseListOpen, setIsMobileCourseListOpen] = useState(false);

  const displayName =
    currentUser?.displayName || currentUser?.email || "Unknown User";

  useEffect(() => {
    if (currentUser) {
      loadCoursesAndGrades();
    }
  }, [currentUser]);

  const loadCoursesAndGrades = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      const coursesData = await getCoursesByUid(currentUser.email);

      const coursesWithCategories = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const categories = await getAssessmentCategoriesByCourseId(
              course.id || course.courseId
            );

            // Transform backend course data to frontend format
            const transformedCourse = {
              ...course,
              id: course.id || course.courseId,
              name: course.name || course.courseName,
              courseCode: course.courseCode,
              colorIndex:
                course.colorIndex !== undefined ? course.colorIndex : 0,
              categories,
            };

            return transformedCourse;
          } catch (error) {
            const transformedCourse = {
              ...course,
              id: course.id || course.courseId,
              name: course.name || course.courseName,
              courseCode: course.courseCode,
              colorIndex:
                course.colorIndex !== undefined ? course.colorIndex : 0,
              categories: [],
            };
            return transformedCourse;
          }
        })
      );

      setCourses(coursesWithCategories);

      if (coursesWithCategories.length > 0 && activeTab === "overview") {
        await loadAllGrades(coursesWithCategories);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpeningOverlay) {
      const timer = setTimeout(() => {
        setIsOpeningOverlay(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpeningOverlay]);

  const loadAllGrades = useCallback(
    async (coursesData = courses) => {
      if (!currentUser || coursesData.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const allGrades = {};

        const gradePromises = coursesData.map(async (course) => {
          try {
            const courseGrades = await getGradesByCourseId(course.id);

            if (courseGrades && courseGrades.length > 0) {
              courseGrades.forEach((grade) => {
                const categoryId =
                  grade.categoryId || grade.category?.id || grade.category_id;
                if (categoryId) {
                  if (!allGrades[categoryId]) {
                    allGrades[categoryId] = [];
                  }
                  allGrades[categoryId].push(grade);
                }
              });
            } else {
            }
          } catch (courseError) {}
        });

        await Promise.all(gradePromises);

        setGrades(allGrades);

        const coursesWithProgress = coursesData.map((course) => {
          try {
            const progress = calculateCourseProgress(
              course.categories,
              allGrades
            );

            let courseGrade = "Ongoing";
            let hasGrades = false;

            if (course.categories && course.categories.length > 0) {
              const gradeResult = GradeService.calculateCourseGrade(
                course,
                allGrades
              );
              if (gradeResult.success) {
                courseGrade = gradeResult.courseGrade;
                hasGrades = true;

                const gradingScale = course.gradingScale || "percentage";
                const gpaScale = course.gpaScale || "4.0";

                if (
                  gradingScale === "gpa" ||
                  (gradingScale === "percentage" && courseGrade > 100)
                ) {
                  courseGrade = GradeService.convertPercentageToGPA(
                    courseGrade,
                    gpaScale
                  );
                }
              }
            }

            return {
              ...course,
              progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
              currentGrade: courseGrade,
              hasGrades: hasGrades,
            };
          } catch (error) {
            return {
              ...course,
              progress: 0,
              currentGrade: "Ongoing",
              hasGrades: false,
            };
          }
        });

        setCourses(coursesWithProgress);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    },
    [currentUser, courses]
  );

  useEffect(() => {
    if (selectedCourse && currentUser) {
    }
  }, [selectedCourse, currentUser]);

  const refreshGrades = async () => {
    if (courses.length > 0) {
      await loadAllGrades();
    }
  };

  useEffect(() => {
    if (
      courses.length > 0 &&
      Object.keys(grades).length === 0 &&
      activeTab === "overview"
    ) {
      loadAllGrades();
    }
  }, [courses, activeTab, loadAllGrades]);

  useEffect(() => {
    setActiveTab(initialTab);

    if (initialTab === "grades") {
      const path = window.location.pathname;
      if (path.startsWith("/dashboard/course/")) {
        const courseId = path.split("/")[3];
        if (courseId && courses.length > 0) {
          const course = courses.find((c) => c.id === courseId);
          if (course) {
            setSelectedCourse(course);
          }
        }
      }
    }
  }, [initialTab, courses]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/dashboard") {
        setActiveTab("overview");
      } else if (path.startsWith("/dashboard/")) {
        const tab = path.split("/")[2];
        if (["courses", "goals", "reports", "calendar"].includes(tab)) {
          setActiveTab(tab);
        } else if (tab === "course") {
          const courseId = path.split("/")[3];
          if (courseId) {
            const course = courses.find((c) => c.id === courseId);
            if (course) {
              setSelectedCourse(course);
              setActiveTab("grades");
            }
          }
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [courses]);

  useEffect(() => {
    if (selectedCourse) {
      setIsCourseManagerExpanded(true);
      setIsOpeningOverlay(true);
    }
  }, [selectedCourse]);

  const handleCourseUpdate = (updatedCourses) => {
    setCourses(updatedCourses);
    if (
      selectedCourse &&
      !updatedCourses.find((c) => c.id === selectedCourse.id)
    ) {
      setSelectedCourse(null);
    }
  };

  const handleGradeUpdate = (updatedData) => {
    if (
      updatedData &&
      typeof updatedData === "object" &&
      updatedData.id &&
      updatedData.name
    ) {
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === updatedData.id ? updatedData : course
        )
      );

      if (selectedCourse && selectedCourse.id === updatedData.id) {
        setSelectedCourse(updatedData);
      }
    } else {
      setGrades((prevGrades) => {
        const mergedGrades = { ...prevGrades };

        Object.keys(updatedData).forEach((categoryId) => {
          if (updatedData[categoryId] && updatedData[categoryId].length > 0) {
            mergedGrades[categoryId] = updatedData[categoryId];
          }
        });

        if (selectedCourse) {
          try {
            const progress = calculateCourseProgress(
              selectedCourse.categories,
              mergedGrades
            );

            let courseGrade = "Ongoing";
            let hasGrades = false;

            if (
              selectedCourse.categories &&
              selectedCourse.categories.length > 0
            ) {
              const gradeResult = GradeService.calculateCourseGrade(
                selectedCourse,
                mergedGrades
              );
              if (gradeResult.success) {
                courseGrade = gradeResult.courseGrade;
                hasGrades = true;

                const gradingScale =
                  selectedCourse.gradingScale || "percentage";
                const gpaScale = selectedCourse.gpaScale || "4.0";

                if (
                  gradingScale === "gpa" ||
                  (gradingScale === "percentage" && courseGrade > 100)
                ) {
                  courseGrade = GradeService.convertPercentageToGPA(
                    courseGrade,
                    gpaScale
                  );
                }
              }
            }

            const updatedCourse = {
              ...selectedCourse,
              categories: selectedCourse.categories.map((cat) => ({ ...cat })),
              progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
              currentGrade: courseGrade,
              hasGrades: hasGrades,
            };

            setSelectedCourse(updatedCourse);

            setCourses((prevCourses) =>
              prevCourses.map((course) =>
                course.id === selectedCourse.id ? updatedCourse : course
              )
            );
          } catch (error) {}
        }

        return mergedGrades;
      });
    }
  };

  const handleCourseNavigation = (course) => {
    setPreviousTab(activeTab);
    setSelectedCourse(course);

    setActiveTab("courses");

    navigate("/dashboard/courses");

    setIsOpeningOverlay(true);
    setIsCourseManagerExpanded(true);
  };

  const handleBackFromCourse = () => {
    setSelectedCourse(null);

    setActiveTab("courses");
    navigate("/dashboard/courses");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "overview" || tab === "reports" || tab === "calendar") {
      setSelectedCourse(null);
    }

    if (tab === "courses" && !selectedCourse) {
      setIsOpeningOverlay(true);
      setIsCourseManagerExpanded(true);
    } else {
      if (isCourseManagerExpanded) {
        setIsClosingOverlay(true);
        setTimeout(() => {
          setIsCourseManagerExpanded(false);
          setIsClosingOverlay(false);
        }, 500);
      } else {
        setIsCourseManagerExpanded(false);
      }
    }

    if (tab === "overview") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {}
  };

  const handleToggleArchived = (checked) => {
    setShowArchivedCourses(checked);
  };

  const calculateOverallGPA = () => {
    if (courses.length === 0) return 0;

    const hasGrades = Object.keys(grades).length > 0;
    if (!hasGrades) {
      return 0;
    }

    const transformedGrades = {};
    courses.forEach((course) => {
      transformedGrades[course.id] = {};

      if (course.categories && Array.isArray(course.categories)) {
        course.categories.forEach((category) => {
          transformedGrades[course.id][category.id] = grades[category.id] || [];
        });
      }
    });

    const result = GradeService.updateCGPA(courses, transformedGrades);

    return result.success ? parseFloat(result.overallGPA) : 0;
  };

  const overallGPA = isLoading ? 0 : calculateOverallGPA();

  return (
    <div>
      {/* ========================================
          MOBILE MENU BUTTONS
          ======================================== */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        {/* ========================================
            MOBILE SIDEBAR TOGGLE BUTTON
            ======================================== */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-[#8168C5] text-white p-2 rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* ========================================
          MOBILE COURSE LIST BUTTON
          ======================================== */}
      <div className="lg:hidden fixed top-4 right-4 z-30">
        {/* ========================================
            MOBILE COURSE LIST TOGGLE BUTTON
            ======================================== */}
        <button
          onClick={() => setIsMobileCourseListOpen(!isMobileCourseListOpen)}
          className="bg-[#8168C5] text-white p-2 rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </button>
      </div>

      {/* ========================================
          SIDEBAR LAYOUT
          ======================================== */}
      <div className="flex min-h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0 fixed left-0 top-0 h-screen z-20">
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed left-0 top-0 h-screen w-full bg-gradient-to-b from-[#8168C5] to-[#3E325F] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========================================
                  MOBILE SIDEBAR CLOSE BUTTON
                  ======================================== */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full max-w-sm mx-auto">
                {/* ========================================
                    MOBILE SIDEBAR CONTENT
                    ======================================== */}
                <div className="w-full h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-center items-center px-8 py-6 z-10 rounded-2xl overflow-hidden">
                  <div className="space-y-8 w-full">
                    {/* ========================================
                        MOBILE SIDEBAR LOGO SECTION
                        ======================================== */}
                    <div className="flex flex-col items-center justify-center text-2xl font-bold mb-8">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3">
                        <span className="text-[#8168C5] text-2xl font-bold">
                          GG
                        </span>
                      </div>
                      <h2 className="text-3xl">Grade Goal</h2>
                    </div>

                    {/* ========================================
                        MOBILE SIDEBAR NAVIGATION ITEMS
                        ======================================== */}
                    <div className="flex flex-col items-center space-y-6 w-full">
                      {[
                        {
                          icon: <FaTachometerAlt />,
                          label: "Dashboard",
                          tab: "overview",
                        },
                        { icon: <FaBook />, label: "Courses", tab: "courses" },
                        { icon: <FaBullseye />, label: "Goals", tab: "goals" },
                        {
                          icon: <FaClipboardList />,
                          label: "Reports",
                          tab: "reports",
                        },
                        {
                          icon: <FaCalendarAlt />,
                          label: "Calendar",
                          tab: "calendar",
                        },
                      ].map((item) => (
                        <div
                          key={item.tab}
                          className={`flex items-center justify-center p-4 rounded-xl cursor-pointer w-full transition-all duration-300 ${
                            activeTab === item.tab
                              ? "bg-white/20 text-white shadow-lg scale-105"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => {
                            handleTabChange(item.tab);
                            setIsMobileSidebarOpen(false);
                          }}
                        >
                          <div className="text-2xl mr-3">{item.icon}</div>
                          <span className="text-xl font-medium">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            MAIN CONTENT AREA
            ======================================== */}
        <div
          className={`flex-1 flex flex-col bg-gray-100 min-h-screen overflow-y-auto relative ${
            // Desktop margins
            "lg:ml-64" +
            (activeTab !== "courses"
              ? isCourseManagerExpanded
                ? " lg:mr-[340px]"
                : " lg:mr-80"
              : "")
          }`}
        >
          {isLoading ? (
            <></>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="w-full">
                  <Dashboard
                    courses={courses}
                    grades={grades}
                    overallGPA={overallGPA}
                    onSearch={(query) => {}}
                    onLogout={handleLogout}
                  />
                </div>
              )}

              {activeTab === "courses" && !isCourseManagerExpanded && (
                <div className="w-full p-6 bg-gray-100">
                  <CourseManager
                    key={`courses-${Object.keys(grades).length}-${
                      courses.length
                    }`}
                    onCourseSelect={handleCourseNavigation}
                    onCourseUpdate={handleCourseUpdate}
                    courses={courses}
                    grades={grades}
                  />
                </div>
              )}

              {activeTab === "goals" && (
                <div className="w-full h-screen bg-gray-100 overflow-y-auto">
                  <GoalSetting
                    userEmail={currentUser?.email}
                    courses={courses}
                  />
                </div>
              )}

              {activeTab === "reports" && (
                <div className="w-full p-6 bg-gray-100">
                  <div className="w-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Reports
                      </h3>
                      <p className="text-gray-600">
                        Detailed reports and analytics coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "calendar" && (
                <div className="w-full p-6 bg-gray-100">
                  <div className="w-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Calendar
                      </h3>
                      <p className="text-gray-600">
                        Academic calendar and deadlines coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================
            DESKTOP SIDE COURSE LIST
            ======================================== */}
        {activeTab !== "courses" && (
          <div
            className={`hidden lg:block fixed right-0 top-0 h-screen z-10 transition-all duration-500 ease-in-out animate-slideIn ${
              isCourseManagerExpanded ? "w-[340px]" : "w-80"
            }`}
          >
            {/* Side Course List Component */}
            <SideCourseList
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseSelect={handleCourseNavigation}
              showArchivedCourses={showArchivedCourses}
              onToggleArchived={handleToggleArchived}
              isExpanded={isCourseManagerExpanded}
              onToggleExpanded={() => {
                if (!isCourseManagerExpanded) {
                  setIsOpeningOverlay(true);
                  setIsCourseManagerExpanded(true);
                } else {
                  setIsClosingOverlay(true);
                  setTimeout(() => {
                    setIsCourseManagerExpanded(false);
                    setIsClosingOverlay(false);
                  }, 500);
                }
              }}
            />
          </div>
        )}

        {/* ========================================
            MOBILE COURSE LIST OVERLAY
            ======================================== */}
        {isMobileCourseListOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed right-0 top-0 h-full w-full bg-gradient-to-b from-[#8168C5] to-[#3E325F] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========================================
                  MOBILE COURSE LIST CLOSE BUTTON
                  ======================================== */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => setIsMobileCourseListOpen(false)}
                  className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full max-w-sm mx-auto">
                {/* ========================================
                    MOBILE COURSE LIST CONTENT
                    ======================================== */}
                <div className="w-full h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-start items-center px-6 py-8 z-10 rounded-2xl overflow-hidden">
                  <div className="w-full space-y-6">
                    {/* ========================================
                        MOBILE COURSE LIST HEADER
                        ======================================== */}
                    <div className="flex flex-col items-center justify-center mb-8">
                      <div className="flex items-center mb-4">
                        <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-3"></span>
                        <h2 className="text-3xl font-semibold">Course List</h2>
                      </div>

                      {/* ========================================
                          ARCHIVED COURSES TOGGLE
                          ======================================== */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={showArchivedCourses}
                          onChange={(e) =>
                            setShowArchivedCourses(e.target.checked)
                          }
                          className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
                        />
                        <span className="text-sm text-white/80 font-medium">
                          Show Archived Courses
                        </span>
                      </div>
                    </div>

                    {/* ========================================
                        COURSE COUNT DISPLAY
                        ======================================== */}
                    <div className="text-center mb-4">
                      <span className="text-sm text-white/60">
                        {
                          courses.filter((course) =>
                            showArchivedCourses
                              ? true
                              : course.isActive !== false
                          ).length
                        }{" "}
                        of {courses.length} courses
                      </span>
                    </div>

                    {/* ========================================
                        COURSES LIST CONTAINER
                        ======================================== */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {courses.length === 0 ? (
                        <div className="text-center text-white/60 py-8">
                          <p>No courses added yet</p>
                          <p className="text-sm">
                            Add courses to see them here
                          </p>
                        </div>
                      ) : (
                        courses
                          .filter((course) =>
                            showArchivedCourses
                              ? true
                              : course.isActive !== false
                          )
                          .map((course) => {
                            const isSelected =
                              selectedCourse && selectedCourse.id === course.id;
                            const colorScheme = getCourseColorScheme(
                              course.name,
                              course.colorIndex || 0
                            );

                            // Calculate course progress and grade
                            let totalProgress = course.progress || 0;
                            let courseGrade = course.currentGrade || "Ongoing";
                            let hasGrades = course.hasGrades || false;
                            let isOngoing = !hasGrades;

                            // Ensure progress is valid
                            if (
                              isNaN(totalProgress) ||
                              !isFinite(totalProgress)
                            ) {
                              totalProgress = 0;
                            }

                            return (
                              <div
                                key={course.id}
                                className={`relative overflow-hidden bg-gradient-to-br ${
                                  colorScheme.gradient
                                } text-white p-4 mx-3 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                                  isSelected
                                    ? `ring-2 ring-white ring-opacity-50`
                                    : ""
                                }`}
                                onClick={() => {
                                  handleCourseNavigation(course);
                                  setIsMobileCourseListOpen(false);
                                }}
                              >
                                {/* Course Code and Grade Badge */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-white/80">
                                    {course.courseCode ||
                                      course.name.substring(0, 8).toUpperCase()}
                                  </span>
                                  <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                      course.isActive === false
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                        : hasGrades
                                        ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                                        : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                                    }`}
                                  >
                                    {course.isActive === false
                                      ? "ARCHIVED"
                                      : hasGrades
                                      ? typeof courseGrade === "number"
                                        ? courseGrade.toFixed(1)
                                        : courseGrade
                                      : "Ongoing"}
                                  </span>
                                </div>

                                {/* Course Name */}
                                <h3 className="text-lg font-medium mb-2 text-white">
                                  {course.name}
                                </h3>

                                {/* Progress Bar */}
                                <div className="flex items-center">
                                  <span className="text-sm text-white/80 mr-2">
                                    Progress:
                                  </span>
                                  <div className="flex-1 bg-white/20 rounded-full h-2.5 mr-2">
                                    <div
                                      className={`h-2.5 rounded-full transition-all duration-300 ${
                                        course.isActive === false
                                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                          : `bg-gradient-to-r ${colorScheme.progressGradient}`
                                      }`}
                                      style={{ width: `${totalProgress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-white">
                                    {isOngoing && totalProgress === 0
                                      ? "Ongoing"
                                      : `${Math.round(totalProgress)}%`}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            COURSE MANAGER OVERLAY
            ======================================== */}
        {(isCourseManagerExpanded || selectedCourse) && (
          <div
            className={`fixed inset-0 bg-gray-100 z-50 transition-all duration-500 ease-in-out ${
              isClosingOverlay
                ? "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
            style={{
              transform: isOpeningOverlay
                ? "translateX(100%)"
                : "translateX(0)",
              opacity: isOpeningOverlay ? 0 : 1,
            }}
          >
            {selectedCourse ? (
              <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0 [&>*]:w-full [&>*]:h-full">
                <GradeEntry
                  course={selectedCourse}
                  onGradeUpdate={handleGradeUpdate}
                  onBack={() => setSelectedCourse(null)}
                />
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto bg-gray-50">
                <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0">
                  <CourseManager
                    key={`courses-expanded-${Object.keys(grades).length}-${
                      courses.length
                    }`}
                    onCourseSelect={handleCourseNavigation}
                    onCourseUpdate={handleCourseUpdate}
                    onBack={() => {
                      setIsClosingOverlay(true);
                      setTimeout(() => {
                        setIsCourseManagerExpanded(false);
                        setIsClosingOverlay(false);
                        handleTabChange("overview");
                      }, 500);
                    }}
                    courses={courses}
                    grades={grades}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;
