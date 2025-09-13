// ========================================
// TITLE COMPONENT
// ========================================
// Displays the course title, code, and status information

import React from "react";

function Title({ course }) {
  return (
    <div className="text-center mb-10">
      {/* Course Code and Status Badge */}
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="text-lg text-white/70 font-medium">
          {course.courseCode || course.name.substring(0, 8).toUpperCase()}
        </span>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            course.isActive === false
              ? "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30"
              : "bg-green-500/20 text-green-200 border border-green-400/30"
          }`}
        >
          {course.isActive === false ? "Archived Course" : "Active Course"}
        </span>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-2">
        {course.name}
      </h1>
      
      {/* Archived Course Warning Badge */}
      {course.isActive === false && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
          <span className="text-yellow-300">⚠️</span>
          <span className="text-sm text-yellow-200 font-medium">
            Course Archived
          </span>
        </div>
      )}
    </div>
  );
}

export default Title;
