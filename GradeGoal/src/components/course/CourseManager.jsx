// ========================================
// COURSE MANAGER COMPONENT
// ========================================
// This component displays the main course list with course cards
// Features: Course grid, archive/restore, edit/delete actions, add course modal

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useYearLevel } from "../context/YearLevelContext";
// Removed GradeService import
import {
  deleteCourse as deleteCourseApi,
  archiveCourse as archiveCourseApi,
  unarchiveCourse as unarchiveCourseApi,
} from "../../backend/api";
import axios from "axios";
import { getCourseColorScheme } from "../utils/courseColors";
// Removed grade calculations import
import AddCourse from "../modals/AddCourse";
import ConfirmationModal from "../modals/ConfirmationModal";
function CourseManager({
  onCourseUpdate,
  onCourseSelect = () => {},
  onBack = () => {},
  grades = {},
  courses = [],
}) {
  const { currentUser } = useAuth();
  const { selectedYearLevel, filterDataByYearLevel } = useYearLevel();


  // ========================================
  // STATE MANAGEMENT
  // ========================================
  // State for managing the add/edit course modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // State for managing archived courses
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showCourses, setShowCourses] = useState(true);

  // State for managing completed courses
  const [completedCourses, setCompletedCourses] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Note: Year level and semester filtering now handled by global YearLevelContext

  // State for confirmation modals
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "edit",
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    showWarning: false,
    warningItems: [],
    showTip: false,
    tipMessage: "",
    onConfirm: null,
    onClose: null,
  });

  // Helper function to filter completed courses
  const getFilteredCompletedCourses = () => {
    let filtered = completedCourses;
    
    // Apply global year level filtering first
    if (selectedYearLevel !== 'all') {
      filtered = filtered.filter(course => {
        const courseYearLevel = course.creationYearLevel || course.yearLevel || "1"; // Fallback for old data
        const matchesYearLevel = courseYearLevel === selectedYearLevel;
        return matchesYearLevel;
      });
    }
    return filtered;
  };

  // Effect to handle course updates
  useEffect(() => {
    // Handle course updates and state changes
  }, [courses, archivedCourses, showArchived]);

  // Effect to separate archived, completed, and active courses when component mounts or courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      // Separate courses based on database state
      const archived = courses.filter((course) => course.isActive === false);
      const completed = courses.filter((course) => course.isActive !== false && course.isCompleted === true);
      const active = courses.filter((course) => course.isActive !== false && course.isCompleted !== true);

      // Update course states
      setArchivedCourses(archived);
      setCompletedCourses(completed);

      // Don't update parent here - let the parent manage the full course list
      // The parent (MainDashboard) should handle filtering active vs archived courses
    }
  }, [courses]);

  // Note: Removed automatic grade refresh on course changes to prevent infinite loops
  // Grades will be refreshed manually when needed (e.g., after category updates)

  const updateParentCourses = (updatedCourses) => {
    if (onCourseUpdate) onCourseUpdate(updatedCourses);
  };

  const handleCourseCreated = (updatedCourses) => {
    updateParentCourses(updatedCourses);
    setShowAddCourse(false);
    setEditingCourse(null);

    // Note: Removed automatic grade refresh to prevent infinite loops
    // Grades will be refreshed manually when needed
  };

  // Handle marking course as complete
  const handleMarkComplete = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: "complete",
      title: "Mark Course as Complete",
      message: `Are you sure you want to mark "${course.name}" as complete? This will move the course to the completed section and will send email and push notifications about the completion.`,
      confirmText: "Mark as Complete",
      cancelText: "Cancel",
      showWarning: false,
      warningItems: [],
      showTip: false,
      tipMessage: "",
      onConfirm: async () => {
        try {
          const response = await axios.put(`http://localhost:8080/api/courses/${courseId}/complete`);
          if (response.status === 200) {
            // Course completion notifications are now handled by the backend
            // Update the local course state and refresh the course list
            const updatedCourses = courses.map(course => 
              course.id === courseId 
                ? { ...course, isCompleted: true }
                : course
            );
            onCourseUpdate(updatedCourses);
          }
        } catch (error) {
          }
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      onClose: () => {
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      }
    });
  };

  // Handle marking course as incomplete
  const handleMarkIncomplete = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: "incomplete",
      title: "Mark Course as Incomplete",
      message: `Are you sure you want to mark "${course.name}" as incomplete? This will move the course back to the active section.`,
      confirmText: "Mark as Incomplete",
      cancelText: "Cancel",
      showWarning: false,
      warningItems: [],
      showTip: false,
      tipMessage: "",
      onConfirm: async () => {
        try {
          const response = await axios.put(`http://localhost:8080/api/courses/${courseId}/uncomplete`);
          if (response.status === 200) {
            // Update the local course state and refresh the course list
            const updatedCourses = courses.map(course => 
              course.id === courseId 
                ? { ...course, isCompleted: false }
                : course
            );
            onCourseUpdate(updatedCourses);
          }
        } catch (error) {
          }
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      onClose: () => {
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      }
    });
  };

  const handleDeleteClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      title: "Delete Course",
      message: `Permanently delete "${course.name}"? This action will permanently delete the course and ALL associated data including grades, assessments, categories, and goals. This cannot be undone.`,
      confirmText: "Delete Permanently",
      cancelText: "Cancel",
      showWarning: true,
      warningItems: [
        "All grades and assessment scores",
        "All assessment categories and weights", 
        "All academic goals for this course",
        "Course settings and configuration",
        "This action CANNOT be undone"
      ],
      showTip: true,
      tipMessage: "Consider archiving the course instead to preserve all data while removing it from your main course list.",
      onConfirm: async () => {
        try {
          await deleteCourseApi(course.id);
          const updatedCourses = courses.filter(c => c.id !== course.id);
          updateParentCourses(updatedCourses);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          alert("Failed to delete course. Please try again.");
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  const handleArchiveClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: "archive",
      title: "Archive Course",
      message: `Archive "${course.name}"? This course will be moved to the archive section. All data including grades, assessments, and categories will be preserved and can be restored later.`,
      confirmText: "Archive Course",
      cancelText: "Cancel",
      showWarning: true,
      warningItems: [
        "Course disappears from main course list",
        "All grades and data are preserved",
        "Course can be restored from archive anytime",
        "No data loss occurs"
      ],
      onConfirm: async () => {
        try {
          await archiveCourseApi(course.id);

          // Mark the course as inactive locally for immediate UI feedback
          const archivedCourse = { ...course, isActive: false };

          // Add to archived courses
          setArchivedCourses((prev) => [...prev, archivedCourse]);

          // Update the local courses state to mark this course as inactive
          const updatedCourses = courses.map(c =>
            c.id === course.id ? { ...c, isActive: false } : c
          );
          // Update parent immediately so the course disappears from main section
          updateParentCourses(updatedCourses);

          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          alert("Course archived successfully! You can restore it later from the archive.");
        } catch (error) {
          alert("Failed to archive course. Please try again.");
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  const handleCourseSelection = (course) => {
    // Check if the course is archived
    const isArchived = archivedCourses.some(
      (archivedCourse) => archivedCourse.id === course.id
    );
    if (isArchived) {
      // For archived courses, we need to pass both the course and archived status
      const courseWithArchiveStatus = { ...course, isActive: false };
      onCourseSelect(courseWithArchiveStatus);
    } else {
      // For active courses, pass normally
      onCourseSelect(course);
    }
  };

  const restoreCourse = async (courseId) => {
    try {
      // Call the backend API to unarchive the course
      await unarchiveCourseApi(courseId);

      // Find the course to restore
      const courseToRestore = archivedCourses.find(
        (course) => course.id === courseId
      );
      if (courseToRestore) {
        // Remove from archived courses
        setArchivedCourses((prev) =>
          prev.filter((course) => course.id !== courseId)
        );
        // Remove from archived courses locally for immediate UI feedback
        setArchivedCourses((prev) =>
          prev.filter((course) => course.id !== courseId)
        );
        // Also update the local courses state to mark this course as active
        // This ensures it appears in the main courses section again
        const updatedCourses = courses.map((course) =>
          course.id === courseId ? { ...course, isActive: true } : course
        );
        // Update parent immediately so the course appears in main section without refresh
        updateParentCourses(updatedCourses);

        alert("Course restored successfully!");
      }
    } catch (error) {
      alert("Failed to restore course. Please try again.");
    }
  };

  return (
    <div
      className="w-full p-4 sm:p-6 bg-gradient-to-br from-[#8168C5] via-[#6D4FC2] to-[#3E325F] relative pb-20"
      style={{ minHeight: "100vh" }}
    >
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="mb-8 relative z-10">
        {/* ========================================
            NAVIGATION AND ACTIONS BAR
            ======================================== */}
        <div className="flex justify-between items-center mb-8">
          {/* ========================================
              BACK TO DASHBOARD BUTTON
              ======================================== */}
          <button
            onClick={() => {
              onBack();
            }}
            className="w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            title="Back to Dashboard"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* ========================================
              ADD COURSE BUTTON
              ======================================== */}
          <button
            onClick={() => setShowAddCourse(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white px-3 py-2 rounded-xl hover:from-[#6D4FC2] hover:to-[#8168C5] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-bold">Add Course</span>
          </button>
        </div>

        {/* ========================================
            PAGE TITLE SECTION
            ======================================== */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Course List
          </h2>
          <p className="text-white/90 text-lg sm:text-xl font-medium drop-shadow-sm">
            Manage your academic courses
          </p>
        </div>
      </div>

      {/* ========================================
           COURSE LIST HEADER SECTION
           ======================================== */}
      <div className="flex items-center gap-3 mb-6 bg-white/20 rounded-2xl p-4 sm:p-5 shadow-lg relative z-10">
        {/* ========================================
             EXPAND/COLLAPSE TOGGLE BUTTON
             ======================================== */}
        <button
          onClick={() => setShowCourses(!showCourses)}
          className="flex items-center gap-3 hover:bg-white/20 rounded-xl p-2 transition-all duration-300"
        >
          <div
            className={`w-10 h-10 bg-gradient-to-br from-[#8168C5] to-[#3E325F] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
              showCourses ? "rotate-0" : "-rotate-90"
            }`}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#3E325F] uppercase tracking-wider">
            COURSES
          </h3>
        </button>
        {/* ========================================
             COURSE COUNT DISPLAY
             ======================================== */}
          <div className="ml-auto flex items-center gap-4">
            <span className="bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white px-3 py-2 rounded-xl text-lg sm:text-xl shadow-lg font-bold">
             {courses.filter((course) => course.isActive !== false && course.isCompleted !== true).length}{" "}
             Active Course
             {courses.filter((course) => course.isActive !== false && course.isCompleted !== true).length !== 1
               ? "s"
               : ""}
            </span>
          </div>
      </div>

      {/* ========================================
          ACTIVE COURSES GRID
          ======================================== */}
      {showCourses && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 relative z-10">
            {courses
             .filter((course) => course.isActive !== false && course.isCompleted !== true)
              .map((course) => {
              // Get course color scheme using stored colorIndex or fallback to generated
              const colorScheme = getCourseColorScheme(
                course.name,
                course.colorIndex || 0
              );
              const color = colorScheme.primary;

              // Use pre-calculated progress and grade data from MainDashboard
              const courseGrade = course.currentGrade || "Ongoing";
              const progress = course.progress || 0;
              const hasGrades = course.hasGrades || false;
              
              // Debug: Log progress values in CourseManager
              const isOngoing = !hasGrades;

              // Progress and grade are now pre-calculated in MainDashboard

              return (
                <div
                  key={`${course.id}-${course.units}-${course.creditHours}`}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
                  onClick={() => handleCourseSelection(course)}
                >
                  {/* ========================================
                  COURSE CARD HOVER OVERLAY
                  ======================================== */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${colorScheme.primary}/10 via-${colorScheme.primary}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  {/* ========================================
                  COURSE CARD HOVER BORDER
                  ======================================== */}
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 border-${colorScheme.primary}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  {/* ========================================
                  COURSE CARD CONTENT
                  ======================================== */}
                  <div className="p-4 sm:p-6 relative z-10">
                    {/* ========================================
                    COURSE CARD HEADER SECTION
                    ======================================== */}
                    <div className="flex items-start justify-between mb-4">
                      {/* ========================================
                      COURSE LOGO AND TITLE SECTION
                      ======================================== */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* ========================================
                        COURSE LOGO CONTAINER
                        ======================================== */}
                        <div
                          className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex-shrink-0 group-hover:scale-110`}
                        >
                          <img
                            src="/src/drawables/logo.png"
                            alt="Course Logo"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* ========================================
                        COURSE NAME AND CODE SECTION
                        ======================================== */}
                        <div className="flex-1 min-w-0">
                          <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-[#3E325F] transition-colors duration-300">
                            {course.courseCode ||
                              course.name.substring(0, 6).toUpperCase()}
                          </h1>
                          <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                            {course.name}
                          </h3>
                          {course.yearLevel && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              {course.yearLevel} • {course.semester} {course.academicYear}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ========================================
                      COURSE GRADE BADGE
                      ======================================== */}
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20 ${
                            hasGrades
                              ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                              : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                          }`}
                        >
                          {typeof courseGrade === "number"
                            ? courseGrade > 4.0
                              ? "0.00" // Removed GPA conversion
                              : courseGrade.toFixed(2)
                            : courseGrade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`text-sm font-bold ${colorScheme.accent} uppercase tracking-wide`}
                          >
                            Progress
                          </span>
                          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            {isNaN(progress) || !isFinite(progress)
                              ? "0%"
                              : `${Math.round(progress)}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner border border-gray-300/50">
                          <div
                            className={`h-3 rounded-full transition-all duration-700 shadow-sm ${
                              isOngoing && progress === 0
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : `bg-gradient-to-r ${colorScheme.progressGradient}`
                            }`}
                            style={{
                              width: `${
                                isNaN(progress) || !isFinite(progress)
                                  ? 0
                                  : progress
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCourse(course);
                            setShowAddCourse(true);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                          title="Edit Course"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Mark as Complete/Incomplete Button */}
                        {course.isCompleted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkIncomplete(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Mark as Incomplete"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Mark as Complete"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClick(course.id);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                          title="Archive Course"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(course.id);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                          title="Delete Course"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ========================================
          ARCHIVED COURSES SECTION
          ======================================== */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-6 bg-white/20 rounded-2xl p-4 sm:p-5 shadow-lg">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-3 hover:bg-white/10 rounded-xl p-2 transition-all duration-300"
          >
            <div
              className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                showArchived ? "rotate-0" : "-rotate-90"
              }`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-orange-700 uppercase tracking-wider">
              ARCHIVED COURSES
            </h3>
          </button>
          <div className="ml-auto flex items-center">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-xl text-lg sm:text-xl shadow-md font-bold whitespace-nowrap">
              {archivedCourses.length} Archived
            </span>
          </div>
        </div>

        {showArchived &&
          (archivedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {archivedCourses.map((course) => {
                // Get course color scheme using stored colorIndex or fallback to generated
                const colorScheme = getCourseColorScheme(
                  course.name,
                  course.colorIndex || 0
                );
                const color = colorScheme.primary;

                // Use pre-calculated progress and grade data from MainDashboard
                const courseGrade = course.currentGrade || "Ongoing";
                const progress = course.progress || 0;
                const hasGrades = course.hasGrades || false;
                const isOngoing = !hasGrades;

                // Progress and grade are now pre-calculated in MainDashboard

                return (
                  <div
                    key={`archived-${course.id}`}
                    className="bg-orange-50 rounded-2xl shadow-lg border border-orange-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative opacity-75"
                    onClick={() => handleCourseSelection(course)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    <div
                      className={`absolute inset-0 rounded-2xl border-2 border-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    <div className="p-4 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex-shrink-0 group-hover:scale-110`}
                          >
                            <img
                              src="/src/drawables/logo.png"
                              alt="Course Logo"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-orange-700 transition-colors duration-300">
                              {course.courseCode ||
                                course.name.substring(0, 6).toUpperCase()}
                            </h1>
                            <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                              {course.name}
                            </h3>
                            {course.yearLevel && (
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                {course.yearLevel} • {course.semester} {course.academicYear}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            ARCHIVED
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between items-center mb-3">
                            <span
                              className={`text-sm font-bold text-orange-600 uppercase tracking-wide`}
                            >
                              Progress
                            </span>
                            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner border border-gray-300/50">
                            <div
                              className="h-3 rounded-full transition-all duration-700 shadow-sm bg-gradient-to-r from-orange-500 to-orange-600"
                              style={{
                                width: `${
                                  isNaN(progress) || !isFinite(progress)
                                    ? 0
                                    : progress
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreCourse(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Restore Course"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCourse(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Delete Course"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-orange-600">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-orange-700 mb-2">
                No Archived Courses
              </h3>
              <p className="text-orange-600">
                Archive courses to see them here.
              </p>
            </div>
          ))}
      </div>

      {/* ========================================
          COMPLETED COURSES SECTION
          ======================================== */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-6 bg-white/20 rounded-2xl p-4 sm:p-5 shadow-lg">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-3 hover:bg-white/10 rounded-xl p-2 transition-all duration-300"
          >
            <div
              className={`w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                showCompleted ? "rotate-0" : "-rotate-90"
              }`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-green-700 uppercase tracking-wider">
              COMPLETED COURSES
            </h3>
          </button>
          <div className="ml-auto flex items-center">
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl text-lg sm:text-xl shadow-md font-bold whitespace-nowrap">
              {getFilteredCompletedCourses().length} of {completedCourses.length} Completed
            </span>
          </div>
        </div>

        {/* ========================================
            COMPLETED COURSES FILTERS
            ======================================== */}
        {showCompleted && completedCourses.length > 0 && (
          <div className="mb-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Year Level:</span>
                <select
                  value={completedYearFilter}
                  onChange={(e) => setCompletedYearFilter(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                  <option value="4th year">4th Year</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Semester:</span>
                <select
                  value={completedSemesterFilter}
                  onChange={(e) => setCompletedSemesterFilter(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Semesters</option>
                  <option value="FIRST">1st Semester</option>
                  <option value="SECOND">2nd Semester</option>
                  <option value="THIRD">3rd Semester</option>
                  <option value="SUMMER">Summer</option>
                </select>
              </div>
              
              {completedSemesterFilter !== "all" && (
                <button
                  onClick={() => {
                    setCompletedSemesterFilter("all");
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Clear Semester Filter
                </button>
              )}
            </div>
          </div>
        )}

        {showCompleted &&
          (getFilteredCompletedCourses().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {getFilteredCompletedCourses().map((course) => {
                // Get course color scheme using stored colorIndex or fallback to generated
                const colorScheme = getCourseColorScheme(
                  course.name,
                  course.colorIndex || 0
                );
                const color = colorScheme.primary;

                // Use pre-calculated progress and grade data from MainDashboard
                const courseGrade = course.currentGrade || "Ongoing";
                const progress = course.progress || 0;
                const hasGrades = course.hasGrades || false;
                const isOngoing = !hasGrades;

                return (
                  <div
                    key={`completed-${course.id}`}
                    className="bg-green-50 rounded-2xl shadow-lg border border-green-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
                    onClick={() => handleCourseSelection(course)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    <div
                      className={`absolute inset-0 rounded-2xl border-2 border-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    <div className="p-4 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex-shrink-0 group-hover:scale-110`}
                          >
                            <img
                              src="/src/drawables/logo.png"
                              alt="Course Logo"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-green-700 transition-colors duration-300">
                              {course.courseCode ||
                                course.name.substring(0, 6).toUpperCase()}
                            </h1>
                            <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
                              {course.name}
                            </h3>
                            {course.yearLevel && (
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                {course.yearLevel} • {course.semester} {course.academicYear}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20 bg-gradient-to-r from-green-500 to-green-600 text-white">
                            COMPLETED
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between items-center mb-3">
                            <span
                              className={`text-sm font-bold ${colorScheme.accent} uppercase tracking-wide`}
                            >
                              Progress
                            </span>
                            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                              {isNaN(progress) || !isFinite(progress)
                                ? "0%"
                                : `${Math.round(progress)}%`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner border border-gray-300/50">
                            <div
                              className={`h-3 rounded-full transition-all duration-700 shadow-sm ${
                                isOngoing && progress === 0
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                  : `bg-gradient-to-r ${colorScheme.progressGradient}`
                              }`}
                              style={{
                                width: `${
                                  isNaN(progress) || !isFinite(progress)
                                    ? 0
                                    : progress
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCourse(course);
                              setShowAddCourse(true);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Edit Course"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Mark as Incomplete Button for Completed Courses */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkIncomplete(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Mark as Incomplete"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveClick(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Archive Course"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(course.id);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Delete Course"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-green-600">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                No Completed Courses
              </h3>
              <p className="text-green-600">
                Mark courses as complete to see them here.
              </p>
            </div>
          ))}
      </div>

      <AddCourse
        isOpen={showAddCourse}
        onClose={() => {
          setShowAddCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseCreated}
        editingCourse={editingCourse}
        existingCourses={courses}
      />

      {/* ========================================
          REUSABLE CONFIRMATION MODAL
          ======================================== */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={confirmationModal.onClose}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        showWarning={confirmationModal.showWarning}
        warningItems={confirmationModal.warningItems}
        showTip={confirmationModal.showTip}
        tipMessage={confirmationModal.tipMessage}
      />
    </div>
  );
};

export default CourseManager;
