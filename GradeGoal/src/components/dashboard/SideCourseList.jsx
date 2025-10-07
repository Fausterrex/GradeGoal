// ========================================
// SIDE COURSE LIST COMPONENT
// ========================================
// This component displays a list of courses in the sidebar
// Features: Course selection, archived courses toggle, course progress display

import React, { useState } from "react";
import { getCourseColorScheme } from "../utils/courseColors";
const SideCourseList = ({
  courses = [],
  selectedCourse,
  onCourseClick,
  showArchivedCourses,
  setShowArchivedCourses,
  isMobileCourseListOpen,
  setIsMobileCourseListOpen,
  isExpanded = false,
  isLoadingCourses = false,
  onToggleExpanded,
}) => {
  // Local state for additional filters
  const [showCompletedCourses, setShowCompletedCourses] = useState(false);

  // Helper function to filter courses
  const getFilteredCourses = () => {
    let filtered = courses;

    // Filter by active/archived status
    if (!showArchivedCourses) {
      filtered = filtered.filter(course => course.isActive !== false);
    }

    // Filter by completed status
    if (!showCompletedCourses) {
      filtered = filtered.filter(course => course.isCompleted !== true);
    }

    return filtered;
  };
  return (
    <div className="bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white shadow-lg border-l border-gray-200 flex flex-col relative h-screen">
      {/* ========================================
          EXPAND/COLLAPSE TOGGLE BUTTON
          ======================================== */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={onToggleExpanded}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <span className={`text-[#8168C5] group-hover:text-[#3E325F] transition-all duration-300 text-xl ${
              isExpanded ? "rotate-180" : ""
            }`}>
            {isExpanded ? "❯" : "❮"}
          </span>
        </button>
      </div>
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="flex flex-row items-center my-4 justify-center">
        <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-2 mt-5"></span>
        <h2 className="text-3xl font-semibold leading-none mt-5">
          Course List
        </h2>
      </div>

      {/* ========================================
          COURSE FILTERS
          ======================================== */}
      <div className="px-3 mb-4 space-y-3">
        {/* Archived Courses Toggle */}
        <div className="flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchivedCourses}
              onChange={(e) => setShowArchivedCourses(e.target.checked)}
              className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
            />
            <span className="text-sm text-gray-300 font-medium">
              Show Archived
            </span>
          </label>
        </div>

        {/* Completed Courses Toggle */}
        <div className="flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompletedCourses}
              onChange={(e) => setShowCompletedCourses(e.target.checked)}
              className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
            />
            <span className="text-sm text-gray-300 font-medium">
              Show Completed
            </span>
          </label>
        </div>

      </div>

      {/* ========================================
          COURSE COUNT DISPLAY
          ======================================== */}
      <div className="text-center mb-2">
        <span className="text-xs text-gray-400">
          {getFilteredCourses().length} of {courses.length} courses
        </span>
      </div>

      {/* ========================================
          DIVIDER
          ======================================== */}
      <div className="w-[80%] h-[1px] bg-gray-300 my-5 mx-auto"></div>

      {/* ========================================
          COURSE LIST SECTION
          ======================================== */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 w-full">
        {isLoadingCourses ? (
          <div className="text-center text-gray-300 py-8 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-3"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-300 py-8 w-full">
            <p>No courses added yet</p>
            <p className="text-sm">Add courses to see them here</p>
          </div>
        ) : (
          getFilteredCourses()
            .map((course) => {
              const colorScheme = getCourseColorScheme(
                course.name,
                course.colorIndex || 0
              );
              // Calculate course progress
              let totalProgress = course.progress || 0;


              // Ensure progress is valid
              if (isNaN(totalProgress) || !isFinite(totalProgress)) {
                totalProgress = 0;
              }

              return (
                <div
                  key={course.id}
                  className={`relative overflow-hidden bg-gradient-to-br ${
                    colorScheme.gradient
                  } text-white p-4 mx-3 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/20 backdrop-blur-sm ${
                    selectedCourse && selectedCourse.id === course.id
                      ? `ring-2 ring-white ring-opacity-70 shadow-white/20`
                      : ""
                  }`}
                  onClick={() => onCourseClick(course)}
                >
                  {/* Course Code */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white/90 bg-black/20 px-2 py-1 rounded-full">
                      {course.courseCode ||
                        course.name.substring(0, 8).toUpperCase()}
                    </span>
                    {course.isActive === false && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                        ARCHIVED
                      </span>
                    )}
                  </div>

                  {/* Course Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/70 text-xs bg-black/20 px-2 py-1 rounded-full">
                      <span>View</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Course Details */}
                  {course.yearLevel && (
                    <div className="mb-3">
                      <span className="text-xs text-white/80 bg-black/20 px-2 py-1 rounded-full">
                        {course.yearLevel} • {course.semester} {course.academicYear}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="flex items-center">
                    <span className="text-sm text-white/90 mr-2 font-medium">
                      Progress:
                    </span>
                    <div className="flex-1 bg-black/30 rounded-full h-3 mr-2 shadow-inner border border-white/10">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                          course.isActive === false
                            ? "bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-400/50"
                            : totalProgress === 0
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-400/50"
                            : `bg-gradient-to-r from-white to-white/90 shadow-white/50`
                        }`}
                        style={{ width: `${totalProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-white bg-black/20 px-2 py-1 rounded-full">
                      {totalProgress === 0
                        ? "0%"
                        : `${Math.round(totalProgress)}%`}
                    </span>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default SideCourseList;
