// ========================================
// MAIN HEADER COMPONENT
// ========================================
// Main header section that combines header actions, title, and statistics

import React from "react";
// Removed GPA conversion imports - no longer needed in MainHeader

function MainHeader({
  course,
  colorScheme,
  onBack,
  onEditCourseClick,
  progressPercentage,
  totalAssessments,
  showDashboard,
  onToggleView
}) {
  const isCourseArchived = course.isActive === false;

  return (
    <div
      className={`bg-gradient-to-br ${
        colorScheme.gradient
      } text-white shadow-2xl ${
        isCourseArchived ? "border-l-4 border-yellow-400" : ""
      } flex-shrink-0`}
    >
      {/* Back to dashboard Button */}
      <div className="w-full px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <span className="text-2xl font-bold">←</span>
          </button>
          
          {/* Edit Course Button */}
          <div className="flex items-center space-x-3">
            {!isCourseArchived && (
              <button
                onClick={onEditCourseClick}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Edit Course
              </button>
            )}
            {isCourseArchived && (
              <div className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-200 text-sm font-medium border border-yellow-400/30">
                Archived
              </div>
            )}
          </div>
        </div>
        
        {/* Course Name */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            {course.courseName}
          </h1>
          {/*Course Code, Semester, Academic Year, and Year Level text*/}
          <p className="text-white/80 text-lg mb-2">
            {course.courseCode} • {course.semester} {course.academicYear}
            {course.yearLevel && ` • ${course.yearLevel}`}
          </p>
          {/* Instructor Name */}
          {course.instructor && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-white/70 text-sm">👨‍🏫</span>
              <span className="text-white/90 text-base font-medium">
                {course.instructor}
              </span>
            </div>
          )}
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
            <button
              onClick={() => onToggleView()}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                showDashboard
                  ? "bg-white text-gray-800 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="inline mr-2">📊</span>
              Dashboard
            </button>
            <button
              onClick={() => onToggleView()}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                !showDashboard
                  ? "bg-white text-gray-800 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="inline mr-2">📝</span>
              Assessments
            </button>
          </div>
        </div>
        
        {/* Course Info Cards */}
        <div className={`max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 ${
          isCourseArchived ? "opacity-75" : ""
        }`}>
          {/* Credits Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">
                {course.credits || 3}
              </p>
              <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
                Credits
              </p>
            </div>
          </div>

          {/* Semester Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">
                {course.semester || "FIRST"}
              </p>
              <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
                Semester
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">
                {Math.round(progressPercentage)}%
              </p>
              <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
                Progress
              </p>
            </div>
          </div>

          {/* Assessments Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">
                {totalAssessments}
              </p>
              <p className="text-sm text-white/80 font-medium uppercase tracking-wider">
                Assessments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainHeader;
