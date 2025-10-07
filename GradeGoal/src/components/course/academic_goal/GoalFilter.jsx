// ========================================
// GOAL FILTER COMPONENT
// ========================================
// This component handles filtering goals by type (All, Course Grade, Semester GPA, etc.)

import React, { useState, useEffect, useRef } from "react";
const GoalFilter = ({ 
  activeFilters, 
  onFilterChange, 
  goalCounts, 
  courses = [],
  isCompact = false 
}) => {
  const [selectedGoalType, setSelectedGoalType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const isInitialMount = useRef(true);
  const filterOptions = [
    { key: 'all', label: 'All Goals', count: goalCounts.all || 0 },
    { key: 'CUMMULATIVE_GPA', label: 'Cumulative GPA', count: goalCounts.cumulative || 0 },
    { key: 'SEMESTER_GPA', label: 'Semester GPA', count: goalCounts.semester || 0 },
    { key: 'COURSE_GRADE', label: 'Course Grade', count: goalCounts.course || 0 }
  ];

  const achievementFilters = [
    { key: 'active', label: 'Active', count: goalCounts.active || 0 },
    { key: 'achieved', label: 'Achieved', count: goalCounts.achieved || 0 },
    { key: 'not_achieved', label: 'Not Achieved', count: goalCounts.notAchieved || 0 }
  ];

  
  // Get unique semesters from courses
  const semesters = [...new Set(courses.map(course => course.semester).filter(Boolean))].sort();

  // Handle goal type selection
  const handleGoalTypeChange = (e) => {
    const goalType = e.target.value;
    setSelectedGoalType(goalType);
    applyFilters();
  };

  // Handle status selection
  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    applyFilters();
  };


  // Handle semester selection
  const handleSemesterChange = (e) => {
    const semester = e.target.value;
    setSelectedSemester(semester);
    applyFilters();
  };

  // Apply all filters and notify parent component
  const applyFilters = () => {
    const filters = {
      goalType: selectedGoalType,
      status: selectedStatus,
      semester: selectedSemester
    };
    onFilterChange(filters);
  };

  // Sync local state with activeFilters prop
  useEffect(() => {
    if (activeFilters && isInitialMount.current) {
      setSelectedGoalType(activeFilters.goalType || '');
      setSelectedStatus(activeFilters.status || '');
      setSelectedSemester(activeFilters.semester || '');
      isInitialMount.current = false;
    }
  }, [activeFilters]);

  // Apply filters when any selection changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters();
    }
  }, [selectedGoalType, selectedStatus, selectedSemester]);

  if (isCompact) {
    return null; // Don't show filters in compact mode
  }

  return (
    <div className="space-y-4 mb-6">
      {/* All Filters in Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Goal Type Dropdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Type</h4>
          <select
            value={selectedGoalType}
            onChange={handleGoalTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">All Types</option>
            {filterOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h4>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Status</option>
            {achievementFilters.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>


        {/* Semester Dropdown */}
        {semesters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Semester</h4>
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              <option value="">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester === 'FIRST' ? '1st Semester' : 
                   semester === 'SECOND' ? '2nd Semester' : 
                   semester === 'THIRD' ? '3rd Semester' : 
                   semester === 'SUMMER' ? 'Summer' : semester} ({goalCounts[`semester_${semester}`] || 0})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalFilter;
