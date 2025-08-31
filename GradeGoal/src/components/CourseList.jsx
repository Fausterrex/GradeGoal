import React, { useState, useEffect } from 'react';
import GradeService from '../services/gradeService';

const CourseList = ({ courses, grades, onCourseSelect, selectedCourse }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Monitor state changes
  useEffect(() => {
    console.log('isExpanded state changed to:', isExpanded);
  }, [isExpanded]);
  
  // Transform courses data to include grades and progress
  const coursesWithProgress = courses.map(course => {
    let totalProgress = 0;
    let courseGrade = 0;
    let hasGrades = false;

    // Calculate progress and grade for this course using GradeService
    if (course.categories && grades) {
      try {
        // Use GradeService to calculate the course grade
        const gradeResult = GradeService.calculateCourseGrade(course, grades);
        if (gradeResult.success) {
          hasGrades = true;
          courseGrade = gradeResult.courseGrade;
          
          // Convert percentage to GPA if needed
          if (course.gradingScale === 'percentage' || courseGrade > 100) {
            courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
          }
        }
        
        // Calculate progress based on completed categories
        const completedCategories = course.categories.filter(category => {
          const categoryGrades = grades[category.id] || [];
          return categoryGrades.length > 0;
        }).length;
        totalProgress = (completedCategories / course.categories.length) * 100;
      } catch (error) {
        console.error('Error calculating course grade:', error);
        
        // Fallback calculation if GradeService fails
        if (course.categories && grades) {
          const categoryGrades = course.categories.map(category => {
            const categoryGrades = grades[category.id] || [];
            if (categoryGrades.length > 0) {
              hasGrades = true;
              const avgGrade = categoryGrades.reduce((sum, grade) => sum + (grade.score || 0), 0) / categoryGrades.length;
              return { category, avgGrade, weight: category.weight };
            }
            return { category, avgGrade: 0, weight: category.weight };
          });

          const totalWeight = categoryGrades.reduce((sum, item) => sum + item.weight, 0);
          if (totalWeight > 0) {
            courseGrade = categoryGrades.reduce((sum, item) => sum + (item.avgGrade * item.weight), 0) / totalWeight;
          }
        }
      }
    }

    // Use the calculated grade from GradeService (already converted to GPA if needed)
    let displayGrade = courseGrade;

    return {
      ...course,
      progress: Math.round(totalProgress),
      grade: displayGrade.toFixed(1),
      hasGrades
    };
  });

  return (
    <div className="h-screen flex flex-col p-4 bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white w-90 relative">
      {/* Simple Test - Always Show */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'lime',
        color: 'black',
        padding: '10px',
        fontSize: '16px',
        zIndex: 9999
      }}>
        TEST: isExpanded = {isExpanded.toString()}
      </div>

      {/* Navigation Arrow Button - Left Side */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={() => {
            console.log('Button clicked, setting expanded to:', !isExpanded);
            setIsExpanded(!isExpanded);
          }}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <svg 
            className={`w-6 h-6 text-[#8168C5] group-hover:text-[#3E325F] transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isExpanded ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-row items-center my-4 w-full">
        <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-2"></span>
        <h2 className="text-4xl font-semibold leading-none">Course List</h2>
      </div>
      
      <div className="w-full h-[1px] bg-gray-300 my-5"></div>
      
      <div className="flex-1 overflow-y-auto space-y-4 w-full">
        {coursesWithProgress.length === 0 ? (
          <div className="text-center text-gray-300 py-8 w-full">
            <p>No courses added yet</p>
            <p className="text-sm">Add courses to see them here</p>
          </div>
        ) : (
          coursesWithProgress.map((course) => (
            <div
              key={course.id}
              className={`bg-white text-black p-4 rounded-xl shadow-lg relative cursor-pointer hover:shadow-xl transition-shadow w-full ${
                selectedCourse && selectedCourse.id === course.id ? 'ring-2 ring-[#8168C5] ring-opacity-50' : ''
              }`}
              onClick={() => onCourseSelect(course)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">{course.code || course.name.substring(0, 8).toUpperCase()}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  course.hasGrades 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {course.hasGrades ? course.grade : 'N/A'}
                </span>
              </div>

              <h3 className="text-lg font-medium mb-2">{course.name}</h3>

              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  Progress:
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-gradient-to-r from-indigo-700 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {course.progress}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Manager Full Page - Appears when expanded */}
      {isExpanded && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'red',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <h1 style={{ color: 'white', fontSize: '48px', textAlign: 'center' }}>
            🎯 COURSE MANAGER IS WORKING! 🎯
          </h1>
          <p style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>
            State: {isExpanded.toString()}
          </p>
          <button 
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              color: 'black',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
