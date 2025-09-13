// ========================================
// GOAL FILTER COMPONENT
// ========================================
// This component handles filtering goals by type (All, Course Grade, Semester GPA, etc.)

import React from "react";

const GoalFilter = ({ 
  activeFilter, 
  onFilterChange, 
  goalCounts, 
  isCompact = false 
}) => {
  const filterOptions = [
    { key: 'all', label: 'All Goals', count: goalCounts.all || 0 },
    { key: 'CUMMULATIVE_GPA', label: 'Cumulative GPA', count: goalCounts.cumulative || 0 },
    { key: 'SEMESTER_GPA', label: 'Semester GPA', count: goalCounts.semester || 0 },
    { key: 'COURSE_GRADE', label: 'Course Grade', count: goalCounts.course || 0 }
  ];

  if (isCompact) {
    return null; // Don't show filters in compact mode
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filterOptions.map((option) => (
        <button
          key={option.key}
          onClick={() => onFilterChange(option.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            activeFilter === option.key
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label} {option.count}
        </button>
      ))}
    </div>
  );
};

export default GoalFilter;
