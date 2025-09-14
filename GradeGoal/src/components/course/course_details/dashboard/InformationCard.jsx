// ========================================
// INFORMATION CARD COMPONENT
// ========================================
// Displays comprehensive course information including credits, instructor, etc.

import React from "react";

function InformationCard({ course, colorScheme }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-4`}>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📚</span>
          Course Information
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Course Code
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.courseCode || course.name.substring(0, 8).toUpperCase()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Course Name
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Credits
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.credits || "3"} Credits
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Academic Year
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.academicYear || "2024-2025"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Semester
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.semester || "Fall 2024"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Instructor
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {course.instructor || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Course Description */}
        {course.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Description
            </label>
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InformationCard;
