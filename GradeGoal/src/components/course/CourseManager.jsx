import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GradeService from '../../services/gradeService';
import { calculateCourseProgress } from '../../utils/progressCalculations';
import {
  deleteCourse as deleteCourseApi,
  archiveCourse as archiveCourseApi,
  unarchiveCourse as unarchiveCourseApi
} from '../../backend/api';
import { getCourseColorScheme } from '../../utils/courseColors';
import AddCourse from './AddCourse';

function CourseManager({ onCourseUpdate, onCourseSelect = () => {}, onBack = () => {}, grades = {}, courses = [], onRefreshGrades }) {
  const { currentUser } = useAuth();

  // State for managing the add/edit course modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // State for managing archived courses
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showCourses, setShowCourses] = useState(true);

  // Effect to handle grades synchronization after course updates
  useEffect(() => {
    // Force re-render when grades change to ensure progress calculations are updated
    // This prevents the "0" progress issue when editing courses
  }, [grades]);

  // Effect to refresh grades when CourseManager mounts
  useEffect(() => {
    if (onRefreshGrades && Object.keys(grades).length === 0) {
      onRefreshGrades();
    }
  }, [onRefreshGrades, grades]);

  // Effect to refresh grades when component becomes visible (after returning from GradeEntry)
  // This ensures progress calculations are accurate when navigating back from GradeEntry
  useEffect(() => {
    if (onRefreshGrades && courses.length > 0) {
      // Small delay to ensure the component is fully mounted and grades are updated
      const timeoutId = setTimeout(() => {
        onRefreshGrades();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [courses.length > 0]); // Trigger when courses are available (component becomes visible)

  // Effect to handle course updates
  useEffect(() => {
    // Handle course updates and state changes
  }, [courses, archivedCourses, showArchived]);

  // Effect to separate archived and active courses when component mounts or courses change
  useEffect(() => {
    if (courses && courses.length > 0) {
      // Separate archived and active courses based on database state
      const archived = courses.filter(course => course.isActive === false);
      const active = courses.filter(course => course.isActive !== false);

      // Update archived courses state
      setArchivedCourses(archived);

      // Don't update parent here - let the parent manage the full course list
      // The parent (MainDashboard) should handle filtering active vs archived courses
    }
  }, [courses]);

  // Note: Removed automatic grade refresh on course changes to prevent infinite loops
  // Grades will be refreshed manually when needed (e.g., after category updates)

  const updateParentCourses = (updatedCourses) => {
    if (onCourseUpdate) onCourseUpdate(updatedCourses);
  };

  const handleCourseCreated = (updatedCourses) => {
    updateParentCourses(updatedCourses);
      setShowAddCourse(false);
      setEditingCourse(null);

    // Note: Removed automatic grade refresh to prevent infinite loops
    // Grades will be refreshed manually when needed
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourseApi(courseId);

        // Update parent component with updated courses list
        const updatedCourses = courses.filter(course => course.id !== courseId);
        updateParentCourses(updatedCourses);
      } catch (error) {
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const archiveCourse = async (courseId) => {
    if (window.confirm('Archive this course? It will be hidden from the main view but all data will be preserved. You can restore it later from the archive.')) {
      try {
        await archiveCourseApi(courseId);

        // Find the course to archive
        const courseToArchive = courses.find(course => course.id === courseId);
        if (courseToArchive) {
          // Mark the course as inactive locally for immediate UI feedback
          const archivedCourse = { ...courseToArchive, isActive: false };

          // Add to archived courses
          setArchivedCourses(prev => [...prev, archivedCourse]);

          // Also update the local courses state to mark this course as inactive
          // This ensures it doesn't appear in the main courses section
          const updatedCourses = courses.map(course =>
            course.id === courseId
              ? { ...course, isActive: false }
              : course
          );

          // Update parent immediately so the course disappears from main section
          updateParentCourses(updatedCourses);
        }

        alert('Course archived successfully! You can restore it later from the archive.');
      } catch (error) {
        alert('Failed to archive course. Please try again.');
      }
    }
  };

  const handleCourseSelection = (course) => {
    // Check if the course is archived
    const isArchived = archivedCourses.some(archivedCourse => archivedCourse.id === course.id);

    if (isArchived) {
      // For archived courses, we need to pass both the course and archived status
      const courseWithArchiveStatus = { ...course, isActive: false };
      onCourseSelect(courseWithArchiveStatus);
    } else {
      // For active courses, pass normally
      onCourseSelect(course);
    }
  };

  const restoreCourse = async (courseId) => {
    try {
      // Call the backend API to unarchive the course
      await unarchiveCourseApi(courseId);

      // Find the course to restore
      const courseToRestore = archivedCourses.find(course => course.id === courseId);
      if (courseToRestore) {
        // Remove from archived courses
        setArchivedCourses(prev => prev.filter(course => course.id !== courseId));

        // Remove from archived courses locally for immediate UI feedback
        setArchivedCourses(prev => prev.filter(course => course.id !== courseId));

        // Also update the local courses state to mark this course as active
        // This ensures it appears in the main courses section again
        const updatedCourses = courses.map(course =>
          course.id === courseId
            ? { ...course, isActive: true }
            : course
        );

        // Update parent immediately so the course appears in main section without refresh
        updateParentCourses(updatedCourses);

        alert('Course restored successfully!');
      }
    } catch (error) {
      alert('Failed to restore course. Please try again.');
    }
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 h-full bg-[url('./drawables/coursesBG.png')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none"></div>
       <div className="mb-8 relative z-10">
         <div className="flex justify-between items-center mb-8">
           <button
             onClick={onBack}
             className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
             title="Back to Dashboard"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
             <span className="font-medium">Back to Dashboard</span>
           </button>

           <button
             onClick={() => setShowAddCourse(true)}
             className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
             <span className="font-medium">Add Course</span>
           </button>
         </div>

         <div className="text-center mb-6">
           <h2 className="text-5xl font-bold bg-gradient-to-r from-[#3E325F] to-[#8168C5] bg-clip-text text-transparent mb-3 drop-shadow-sm">Course List</h2>
           <p className="text-[#8168C5] text-xl font-medium drop-shadow-sm">Manage your academic courses</p>
         </div>
       </div>

       <div className="flex items-center gap-3 mb-6 bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/50 relative z-10">
         <button
           onClick={() => setShowCourses(!showCourses)}
           className="flex items-center gap-3 hover:bg-white/20 rounded-xl p-2 transition-all duration-300"
         >
           <div className={`w-10 h-10 bg-gradient-to-br from-[#8168C5] to-[#3E325F] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
             showCourses ? 'rotate-0' : '-rotate-90'
           }`}>
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
         </div>
           <h3 className="text-xl font-bold text-[#3E325F] uppercase tracking-wider">COURSES</h3>
         </button>
         <div className="ml-auto flex items-center gap-4">
           <span className="bg-gradient-to-r from-[#8168C5] to-[#6B5B9A] text-white px-3 py-2 rounded-xl text-xl shadow-md ">{courses.filter(course => course.isActive !== false).length} Course{courses.filter(course => course.isActive !== false).length !== 1 ? 's' : ''}</span>

         </div>
       </div>

      {showCourses && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 relative z-10">
          {courses.filter(course => course.isActive !== false).map((course) => {
          // Get course color scheme using stored colorIndex or fallback to generated
          const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);
          const color = colorScheme.primary;

          // Use pre-calculated progress and grade data from MainDashboard
          const courseGrade = course.currentGrade || 'Ongoing';
          const progress = course.progress || 0;
          const hasGrades = course.hasGrades || false;
          const isOngoing = !hasGrades;

          // Progress and grade are now pre-calculated in MainDashboard

          return (
            <div key={`${course.id}-${course.units}-${course.creditHours}`} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative" onClick={() => handleCourseSelection(course)}>
              <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme.primary}/10 via-${colorScheme.primary}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              <div className={`absolute inset-0 rounded-3xl border-2 border-${colorScheme.primary}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex-shrink-0 group-hover:scale-110`}>
                      <img
                        src="/src/drawables/logo.png"
                        alt="Course Logo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-[#3E325F] transition-colors duration-300">{course.courseCode || course.name.substring(0, 6).toUpperCase()}</h1>
                      <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">{course.name}</h3>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20 ${
                      hasGrades
                        ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                    }`}>
                      {hasGrades ? (typeof courseGrade === 'number' ? courseGrade.toFixed(1) : courseGrade) : 'Ongoing'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-bold ${colorScheme.accent} uppercase tracking-wide`}>Progress</span>
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                        {isOngoing && progress === 0 ? 'Ongoing' :
                         (isNaN(progress) || !isFinite(progress) ? 'Ongoing' :
                          (progress === 0 && course.categories && course.categories.length > 0 && (!grades || Object.keys(grades).length === 0) ? 'Ongoing' : `${Math.round(progress)}%`))}
                    </span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner border border-gray-300/50">
                    <div
                        className={`h-3 rounded-full transition-all duration-700 shadow-sm ${
                        isOngoing && progress === 0
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            : `bg-gradient-to-r ${colorScheme.progressGradient}`
                      }`}
                      style={{ width: `${isNaN(progress) || !isFinite(progress) ? 0 : progress}%` }}
                    ></div>
                  </div>
                </div>

                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCourse(course);
                        setShowAddCourse(true);
                      }}
                      className="w-10 h-10 rounded-2xl border-2 border-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-blue-200/50"
                      title="Edit Course"
                    >
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveCourse(course.id);
                      }}
                      className="w-10 h-10 rounded-2xl border-2 border-orange-500 bg-white hover:bg-orange-50 hover:border-orange-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-orange-200/50"
                      title="Archive Course"
                    >
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCourse(course.id);
                      }}
                      className="w-10 h-10 rounded-2xl border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-red-200/50"
                      title="Delete Course"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

        <div className="mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-orange-50/90 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-orange-200/50">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-3 hover:bg-orange-100/50 rounded-xl p-2 transition-all duration-300"
            >
              <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                showArchived ? 'rotate-0' : '-rotate-90'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-orange-700 uppercase tracking-wider">ARCHIVED COURSES</h3>
            </button>
            <div className="ml-auto">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-xl text-xl shadow-md">{archivedCourses.length} Archived</span>
            </div>
                </div>

            {showArchived && (
              archivedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {archivedCourses.map((course) => {
                  // Get course color scheme using stored colorIndex or fallback to generated
                  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);
                  const color = colorScheme.primary;

                  // Use pre-calculated progress and grade data from MainDashboard
                  const courseGrade = course.currentGrade || 'Ongoing';
                  const progress = course.progress || 0;
                  const hasGrades = course.hasGrades || false;
                  const isOngoing = !hasGrades;

                  // Progress and grade are now pre-calculated in MainDashboard

                  return (
                    <div
                      key={`archived-${course.id}`}
                      className="bg-orange-50/95 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative opacity-75"
                      onClick={() => handleCourseSelection(course)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                      <div className={`absolute inset-0 rounded-3xl border-2 border-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                      <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex-shrink-0 group-hover:scale-110`}>
                              <img
                                src="/src/drawables/logo.png"
                                alt="Course Logo"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                            <div className="flex-1 min-w-0">
                              <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-orange-700 transition-colors duration-300">{course.courseCode || course.name.substring(0, 6).toUpperCase()}</h1>
                              <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">{course.name}</h3>
                </div>
                </div>

                          <div className="text-right flex-shrink-0">
                            <span className="px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                              ARCHIVED
                            </span>
                </div>
                </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className={`text-sm font-bold text-orange-600 uppercase tracking-wide`}>Progress</span>
                              <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                {Math.round(progress)}%
                              </span>
                </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner border border-gray-300/50">
                              <div
                                className="h-3 rounded-full transition-all duration-700 shadow-sm bg-gradient-to-r from-orange-500 to-orange-600"
                                style={{ width: `${isNaN(progress) || !isFinite(progress) ? 0 : progress}%` }}
                              ></div>
                </div>
              </div>

                          <div className="flex gap-3 flex-shrink-0">
                    <button
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreCourse(course.id);
                              }}
                              className="w-10 h-10 rounded-2xl border-2 border-green-500 bg-white hover:bg-green-50 hover:border-green-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-green-200/50"
                              title="Restore Course"
                            >
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                    </button>

                    <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCourse(course.id);
                              }}
                              className="w-10 h-10 rounded-2xl border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-red-200/50"
                              title="Delete Course"
                            >
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                      </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-orange-500">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-orange-700 mb-2">No Archived Courses</h3>
                <p className="text-orange-500">Archive courses to see them here.</p>
              </div>
            )
          )}
        </div>

      <AddCourse
        isOpen={showAddCourse}
        onClose={() => {
          setShowAddCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseCreated}
        editingCourse={editingCourse}
        existingCourses={courses}
      />
    </div>
  );
}

export default CourseManager;
