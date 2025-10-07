// ========================================
// COURSE DETAILS ARCHIVED WARNING COMPONENT
// ========================================
// Displays warning for archived courses

import React from "react";
function CourseDetailsArchivedWarning() {
  return (
    <div className="max-w-[1000px] mx-auto mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-600 text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">
            Course Archived
          </h3>
          <p className="text-yellow-700">
            This course is archived and may not be actively updated.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsArchivedWarning;
