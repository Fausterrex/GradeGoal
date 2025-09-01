import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GRADING_SCALES } from '../utils/gradeCalculations';
import GradeService from '../services/gradeService';
import { 
  deleteCourse as deleteCourseApi,
  archiveCourse as archiveCourseApi
} from '../backend/api';
import { getCourseColorScheme } from '../utils/courseColors';
import AddCourse from './AddCourse';

function CourseManager({ onCourseUpdate, onCourseSelect = () => {}, grades = {}, courses = [] }) {
  const { currentUser } = useAuth();
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Update parent component when courses change
  const updateParentCourses = (updatedCourses) => {
    if (onCourseUpdate) onCourseUpdate(updatedCourses);
  };

  // Handle course creation/update from AddCourse component
  const handleCourseCreated = (updatedCourses) => {
    updateParentCourses(updatedCourses);
      setShowAddCourse(false);
      setEditingCourse(null);
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setShowAddCourse(true);
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourseApi(courseId);
        
        // Update parent component with updated courses list
        const updatedCourses = courses.filter(course => course.id !== courseId);
        updateParentCourses(updatedCourses);
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const archiveCourse = async (courseId) => {
    if (window.confirm('Archive this course? It will be hidden from the main view but all data will be preserved. You can restore it later from the archive.')) {
      try {
        // Call the archive API
        await archiveCourseApi(courseId);
        
        // Remove the archived course from the main view
        const updatedCourses = courses.filter(course => course.id !== courseId);
        updateParentCourses(updatedCourses);
        
        // Show success message
        alert('Course archived successfully! You can restore it later from the archive.');
      } catch (error) {
        console.error('Failed to archive course:', error);
        alert('Failed to archive course. Please try again.');
      }
    }
  };

  const cancelEdit = () => {
    setShowAddCourse(false);
    setEditingCourse(null);
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-purple-50 to-indigo-50 h-full bg-[url('./drawables/coursesBG.png')] bg-cover bg-center">
             {/* Header */}
       <div className="mb-8">
         {/* Top Row - Back Button and Add Course Button */}
         <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 bg-[#8168C5] rounded-xl flex items-center justify-center">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
           </div>
           <button
             onClick={() => setShowAddCourse(true)}
             className="bg-white text-[#8168C5] px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 font-medium border-2 border-[#8168C5] hover:bg-[#8168C5] hover:text-white"
           >
             + Add Course
           </button>
         </div>
         
         {/* Course List Title - Positioned below the top row */}
         <div className="text-center mb-6">
           <h2 className="text-4xl font-bold text-[#3E325F] mb-2">Course List</h2>
           <p className="text-[#8168C5] text-lg">Manage your academic courses</p>
         </div>
       </div>

             {/* Courses Section Header */}
       <div className="flex items-center gap-3 mb-6 bg-white backdrop-blur-sm rounded-xl p-4 shadow-md">
         <div className="w-8 h-8 bg-gradient-to-br from-[#8168C5] to-[#3E325F] rounded-lg flex items-center justify-center">
           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
         </div>
         <h3 className="text-lg font-semibold text-[#3E325F] uppercase tracking-wide">COURSES</h3>
         <div className="ml-auto">
           <span className="text-[#8168C5] font-medium text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
         </div>
       </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {courses.map((course, index) => {
          // Get course color scheme using stored colorIndex or fallback to generated
          const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);
          const color = colorScheme.primary;
          
          // Generate initials from course name
          const initials = course.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();

          // Calculate course grade and progress using GradeService and grades from database
          let courseGrade = 'Ongoing';
          let progress = 0;
          let hasGrades = false;
          let isOngoing = true;

          if (course.categories && grades) {
            try {
              // Check if any categories have actual grades with scores
              const categoriesWithScores = course.categories.filter(category => {
                const categoryGrades = grades[category.id] || [];
                return categoryGrades.some(grade => 
                  grade.score !== undefined && 
                  grade.score !== null && 
                  grade.score !== '' && 
                  !isNaN(parseFloat(grade.score))
                );
              });

              // Calculate GPA if we have any scores (even partial)
              if (categoriesWithScores.length > 0) {
                const gradeResult = GradeService.calculateCourseGrade(course, grades);
                if (gradeResult.success) {
                  hasGrades = true;
                  courseGrade = gradeResult.courseGrade;
                  isOngoing = false;
                  
                  if (course.gradingScale === 'percentage' || courseGrade > 100) {
                    courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
                  }
                }
              }
              
              // Calculate progress based on categories with actual scores
              const completedCategories = course.categories.filter(category => {
                const categoryGrades = grades[category.id] || [];
                return categoryGrades.some(grade => 
                  grade.score !== undefined && 
                  grade.score !== null && 
                  grade.score !== '' && 
                  !isNaN(parseFloat(grade.score))
                );
              }).length;
              
              progress = (completedCategories / course.categories.length) * 100;
            } catch (error) {
              // Silent fallback - use default values
            }
          }

          // Fallback: If we have progress > 0, we should have grades
          if (progress > 0 && !hasGrades) {
            hasGrades = true;
            isOngoing = false;
            // Try to get a basic grade calculation
            try {
              const gradeResult = GradeService.calculateCourseGrade(course, grades);
              if (gradeResult.success) {
                courseGrade = gradeResult.courseGrade;
                if (course.gradingScale === 'percentage' || courseGrade > 100) {
                  courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
                }
              }
            } catch (error) {
              // Silent fallback - use default values
            }
          }

          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative" onClick={() => onCourseSelect && onCourseSelect(course)}>
              {/* Gradient Background Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme.primary}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Course Card Content */}
              <div className="p-6 relative z-10">
                {/* Top Row - Header and Info */}
                <div className="flex items-start justify-between mb-4">
                  {/* Left Side - Icon and Course Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-18 h-18 ${color} rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}>
                      <img 
                        src="/src/drawables/logo.png" 
                        alt="Course Logo" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-black text-gray-900 mb-1 tracking-tight">{course.courseCode || course.name.substring(0, 6).toUpperCase()}</h1>
                      <h3 className="text-base font-semibold text-gray-700 leading-tight line-clamp-1">{course.name}</h3>
                    </div>
                  </div>
                  
                  {/* Right Side - Grade Badge */}
                  <div className="text-right flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      hasGrades 
                        ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                    }`}>
                      {hasGrades ? (typeof courseGrade === 'number' ? courseGrade.toFixed(1) : courseGrade) : 'Ongoing'}
                    </span>
                  </div>
                </div>



                {/* Bottom Row - Progress and Actions */}
                <div className="flex items-center justify-between">
                  {/* Progress Section */}
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${colorScheme.accent}`}>Progress</span>
                      <span className="text-xs font-bold text-gray-700">
                        {isOngoing && progress === 0 ? 'Ongoing' : `${Math.round(progress)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 shadow-sm ${
                          isOngoing && progress === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                            : `bg-gradient-to-r ${colorScheme.progressGradient}`
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editCourse(course);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-md hover:shadow-lg"
                      title="Edit Course"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveCourse(course.id);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-orange-500 bg-white hover:bg-orange-50 hover:border-orange-600 flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-md hover:shadow-lg"
                      title="Archive Course"
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCourse(course.id);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-md hover:shadow-lg"
                      title="Delete Course"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Add/Edit Course Form */}
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
