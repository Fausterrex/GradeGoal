// ========================================
// SIDE COURSE LIST COMPONENT
// ========================================
// This component displays a list of courses in the sidebar
// Features: Course selection, archived courses toggle, course progress display

import React, { useState } from "react";
import { getCourseColorScheme } from "../../utils/courseColors";

const SideCourseList = ({
  courses = [],
  selectedCourse,
  onCourseSelect,
  showArchivedCourses,
  onToggleArchived,
  isExpanded = false,
  onToggleExpanded,
}) => {
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
          <svg
            className={`w-6 h-6 text-[#8168C5] group-hover:text-[#3E325F] transition-all duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isExpanded ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
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
          SHOW ARCHIVED COURSES TOGGLE
          ======================================== */}
      <div className="flex items-center justify-center mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchivedCourses}
            onChange={(e) => onToggleArchived(e.target.checked)}
            className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
          />
          <span className="text-sm text-gray-300 font-medium">
            Show Archived Courses
          </span>
        </label>
      </div>

      {/* ========================================
          COURSE COUNT DISPLAY
          ======================================== */}
      <div className="text-center mb-2">
        <span className="text-xs text-gray-400">
          {
            courses.filter((course) =>
              showArchivedCourses ? true : course.isActive !== false
            ).length
          }{" "}
          of {courses.length} courses
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
        {courses.length === 0 ? (
          <div className="text-center text-gray-300 py-8 w-full">
            <p>No courses added yet</p>
            <p className="text-sm">Add courses to see them here</p>
          </div>
        ) : (
          courses
            .filter((course) =>
              showArchivedCourses ? true : course.isActive !== false
            )
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
                  } text-white p-4 mx-3 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                    selectedCourse && selectedCourse.id === course.id
                      ? `ring-2 ring-white ring-opacity-50`
                      : ""
                  }`}
                  onClick={() => onCourseSelect(course)}
                >
                  {/* Course Code */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">
                      {course.courseCode ||
                        course.name.substring(0, 8).toUpperCase()}
                    </span>
                    {course.isActive === false && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        ARCHIVED
                      </span>
                    )}
                  </div>

                  {/* Course Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <span>View</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

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
                      {totalProgress === 0
                        ? "No Assessments Yet"
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
