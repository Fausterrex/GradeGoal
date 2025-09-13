// ========================================
// MAIN HEADER COMPONENT
// ========================================
// Main header section that combines header actions, title, and statistics

import React from "react";
import HeaderActions from "./HeaderActions";
import Title from "./Title";
import Statistics from "./Statistics";

function MainHeader({
  course,
  colorScheme,
  onBack,
  onEditCourseClick,
  courseGrade,
  targetGrade,
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
      <div className="w-full px-8 py-8">
        <HeaderActions
          onBack={onBack}
          onEditCourseClick={onEditCourseClick}
          isCourseArchived={isCourseArchived}
        />
        
        <Title course={course} />
        
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
        
        <Statistics
          courseGrade={courseGrade}
          targetGrade={targetGrade}
          progressPercentage={progressPercentage}
          totalAssessments={totalAssessments}
          course={course}
          isCourseArchived={isCourseArchived}
        />
      </div>
    </div>
  );
}

export default MainHeader;
