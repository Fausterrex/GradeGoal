// ========================================
// HEADER ACTIONS COMPONENT
// ========================================
// Handles the back button and edit course button in the header

import React from "react";

function HeaderActions({ 
  onBack, 
  onEditCourseClick, 
  isCourseArchived 
}) {
  return (
    <div className="flex justify-between items-center mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <span className="text-lg">←</span>
        <span className="font-medium">Back to Courses</span>
      </button>

      <button
        onClick={onEditCourseClick}
        className={`flex items-center gap-3 ${
          isCourseArchived
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
        } text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20 ${
          isCourseArchived ? "hover:bg-gray-400" : ""
        }`}
        disabled={isCourseArchived}
        title={
          isCourseArchived
            ? "Archived courses cannot be edited"
            : "Edit course settings"
        }
      >
        <span className="text-lg">✏️</span>
        <span className="font-medium">
          {isCourseArchived ? "View" : "Edit"}
        </span>
      </button>
    </div>
  );
}

export default HeaderActions;
