import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Bell, User } from "lucide-react";
import GradeService from '../services/gradeService';

/**
 * Dashboard Component
 * 
 * Displays the main dashboard overview with grade trends, GPA status, and course breakdown.
 * Features interactive charts, performance indicators, and course status tracking.
 * 
 * @param {Array} courses - Array of course objects to display
 * @param {Object} grades - Object containing grades for all courses
 * @param {number} overallGPA - The calculated overall GPA across all courses
 * @param {Function} onSearch - Callback for search functionality
 * @param {Function} onLogout - Callback for logout functionality
 */
const Dashboard = ({ courses, grades, overallGPA, onSearch, onLogout }) => {
  // State for course display tabs
  const [activeTab, setActiveTab] = React.useState('active');
  /**
   * Generate grade trends data based on actual course progress
   * Creates progression data showing how grades improve as courses are completed
   * @returns {Array} Array of progression data objects
   */
  const generateGradeTrends = () => {
    if (courses.length === 0) return [];
    
    // Filter out archived courses for trends
    const activeCourses = courses.filter(course => course.isArchived !== true);
    if (activeCourses.length === 0) return [];
    
    // Calculate progression stages based on course completion
    const progressionData = [];
    
    // Stage 1: Initial state (no courses completed)
    progressionData.push({
      stage: 'Initial',
      grade: 0,
      completedCourses: 0,
      totalCourses: activeCourses.length
    });
    
    // Stage 2: Some courses completed
    const coursesWithGrades = activeCourses.filter(course => {
      if (!course.categories || !grades) return false;
      const categoriesWithScores = course.categories.filter(category => {
        const categoryGrades = grades[course.id] || [];
        return categoryGrades.some(grade => 
          grade.score !== undefined && 
          grade.score !== null && 
          grade.score !== '' && 
          !isNaN(parseFloat(grade.score))
        );
      });
      return categoriesWithScores.length > 0;
    });
    
    if (coursesWithGrades.length > 0) {
      // Calculate average grade for courses with grades
      let totalGrade = 0;
      let validGrades = 0;
      
      coursesWithGrades.forEach(course => {
        try {
          const gradeResult = GradeService.calculateCourseGrade(course, grades);
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            if (course.gradingScale === 'percentage' || courseGrade > 100) {
              courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              totalGrade += courseGrade;
              validGrades++;
            }
          }
        } catch (error) {
          // Skip invalid grades
        }
      });
      
      if (validGrades > 0) {
        const averageGrade = totalGrade / validGrades;
        progressionData.push({
          stage: 'In Progress',
          grade: parseFloat(averageGrade.toFixed(2)),
          completedCourses: coursesWithGrades.length,
          totalCourses: activeCourses.length
        });
      }
    }
    
    // Stage 3: All courses completed (if applicable)
    const fullyCompletedCourses = activeCourses.filter(course => {
      if (!course.categories || !grades) return false;
      const totalAssessments = course.categories.length;
      const completedAssessments = course.categories.filter(category => {
        const categoryGrades = grades[course.id] || [];
        return categoryGrades.some(grade => 
          grade.score !== undefined && 
          grade.score !== null && 
          grade.score !== '' && 
          !isNaN(parseFloat(grade.score))
        );
      }).length;
      return totalAssessments > 0 && completedAssessments === totalAssessments;
    });
    
    if (fullyCompletedCourses.length > 0 && fullyCompletedCourses.length === activeCourses.length) {
      // Calculate final average grade
      let totalGrade = 0;
      let validGrades = 0;
      
      fullyCompletedCourses.forEach(course => {
        try {
          const gradeResult = GradeService.calculateCourseGrade(course, grades);
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            if (course.gradingScale === 'percentage' || courseGrade > 100) {
              courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              totalGrade += courseGrade;
              validGrades++;
            }
          }
        } catch (error) {
          // Skip invalid grades
        }
      });
      
      if (validGrades > 0) {
        const finalGrade = totalGrade / validGrades;
        progressionData.push({
          stage: 'Completed',
          grade: parseFloat(finalGrade.toFixed(2)),
          completedCourses: fullyCompletedCourses.length,
          totalCourses: activeCourses.length
        });
      }
    }
    
    // If we don't have enough data, add a current state
    if (progressionData.length === 1) {
      progressionData.push({
        stage: 'Current',
        grade: parseFloat(overallGPA.toFixed(2)),
        completedCourses: coursesWithGrades.length,
        totalCourses: activeCourses.length
      });
    }
    
    return progressionData;
  };

  const gradeTrendsData = generateGradeTrends();

  // Target GPA for comparison (can be made configurable)
  const targetGPA = 4.0;

  /**
   * Generate course breakdown data using GradeService
   * Calculates current grades and status for each course
   * @returns {Array} Array of course breakdown objects with grades and status
   */
  const generateCourseBreakdown = () => {
    if (courses.length === 0) return [];
    
    return courses.map(course => {
      let currentGrade = 0;
      let hasGrades = false;
      let isOngoing = true;
      
      try {
        // Check if any categories have actual grades with scores
        if (course.categories && grades) {
          const categoriesWithScores = course.categories.filter(category => {
            const categoryGrades = grades[category.id] || [];
            return categoryGrades.some(grade => 
              grade.score !== undefined && 
              grade.score !== null && 
              grade.score !== '' && 
              !isNaN(parseFloat(grade.score))
            );
          });

          // Only calculate GPA if we have actual scores
          if (categoriesWithScores.length > 0) {
            const gradeResult = GradeService.calculateCourseGrade(course, grades);
            if (gradeResult.success) {
              hasGrades = true;
              currentGrade = gradeResult.courseGrade;
              isOngoing = false;
              
              // Convert percentage to GPA if needed
              if (course.gradingScale === 'percentage' || currentGrade > 100) {
                currentGrade = GradeService.convertPercentageToGPA(currentGrade, course.gpaScale || '4.0');
              }
            }
          }
        }
      } catch (error) {
        // Silent fallback - use default values
      }
      
      // Determine status based on whether course is ongoing, has grades, or is archived
      let status = 'ON TRACK'; // Default status
      
      // Check if course is archived first
      if (course.isArchived === true) {
        status = 'ARCHIVED';
      } else {
        // Calculate progress percentage
        const totalAssessments = course.categories ? course.categories.length : 0;
        const completedAssessments = course.categories ? course.categories.filter(category => {
          const categoryGrades = grades[category.id] || [];
          return categoryGrades.some(grade => 
            grade.score !== undefined && 
            grade.score !== null && 
            grade.score !== '' && 
            !isNaN(parseFloat(grade.score))
          );
        }).length : 0;
        
        const progressPercentage = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
        
        if (progressPercentage === 100) {
          // Course is 100% complete - status based on grade performance
          if (currentGrade >= 3.0) {
            status = 'EXCELLENT';
          } else if (currentGrade >= 2.5) {
            status = 'ON TRACK';
          } else {
            status = 'AT RISK';
          }
        } else {
          // Course is not 100% complete yet - always ON TRACK
          status = 'ON TRACK';
        }
      }
      
      return {
        course: course.name,
        grade: isOngoing ? 'Ongoing' : currentGrade.toFixed(2),
        target: targetGPA.toFixed(2),
        status
      };
    });
  };

  const courseBreakdown = generateCourseBreakdown();

  /**
   * Filter course breakdown based on active tab selection
   * @returns {Array} Filtered array of courses based on selected tab
   */
  const getFilteredCourseBreakdown = () => {
    switch (activeTab) {
      case 'active':
        return courseBreakdown.filter(course => course.status !== 'ARCHIVED');
      case 'archived':
        return courseBreakdown.filter(course => course.status === 'ARCHIVED');
      case 'all':
      default:
        return courseBreakdown;
    }
  };

  return (
    <div className="flex flex-col p-6 bg-gray-100 w-full h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-4xl font-semibold text-[#1E0E62]">
          Dashboard
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, grades..."
              className="pl-10 pr-4 py-2 rounded-2xl border border-gray-300 text-black w-64"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8168C5] to-[#3E325F] rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      onLogout && onLogout();
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8 flex-shrink-0">
        {/* Grade Trends Chart */}
        <div className="col-span-3 h-90 bg-gradient-to-b from-[#8168C5] to-[#3E325F] p-6 rounded-[45px] shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-6 bg-green-400 rounded-full mr-2"></span>
            Grade Trends
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={gradeTrendsData}>
              <defs>
                <linearGradient id="lineShadow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="stage" stroke="#ddd" />
              <YAxis domain={[0, 4]} stroke="#ddd" />
              <Tooltip
                contentStyle={{ backgroundColor: "#2D2A4A", border: "none" }}
                labelStyle={{ color: "#fff" }}
                formatter={(value, name) => [value, name === 'grade' ? 'GPA' : name]}
                labelFormatter={(label) => `${label} (${gradeTrendsData.find(item => item.stage === label)?.completedCourses || 0}/${gradeTrendsData.find(item => item.stage === label)?.totalCourses || 0} courses)`}
              />

              <Area type="monotone" dataKey="grade" stroke="none" fill="url(#lineShadow)" />

              <Line
                type="monotone"
                dataKey="grade"
                stroke="#39FF14"
                strokeWidth={3}
                dot={{ fill: "#1E90FF", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          

        </div>

        {/* GPA Status Cards */}
        <div className="col-span-1 grid grid-cols-1 gap-4">
          {/* Current GPA Status */}
          <div className="bg-gradient-to-b from-[#6D4FC2] to-[#2E2150] rounded-2xl shadow-lg p-4 relative flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg mb-2">CPA STATUS</div>
            <div className="text-green-400 text-3xl font-bold">{overallGPA.toFixed(2)}</div>
            <div className="text-gray-300 text-xs mt-1">Current Semester</div>
            <div className="absolute bottom-0 left-0 w-full h-3 rounded-b-2xl bg-gradient-to-r from-pink-500 to-purple-500"></div>
          </div>

          {/* Target GPA Status */}
          <div className="bg-gradient-to-b from-[#6D4FC2] to-[#2E2150] rounded-2xl shadow-lg p-4 relative flex flex-col items-center justify-center">
            <div className="text-white font-semibold text-lg mb-2">Target GPA</div>
            <div className="text-green-400 text-3xl font-bold">{targetGPA.toFixed(2)}</div>
            <div className="text-gray-300 text-xs mt-1">Current Semester</div>
            <div className="absolute bottom-0 left-0 w-full h-3 rounded-b-2xl bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          </div>
        </div>
      </div>

      {/* Course Report Breakdown Table */}
      <div className="w-full bg-gradient-to-b from-[#8168C5] to-[#3E325F] p-8 rounded-[45px] shadow-md overflow-x-auto flex-1 min-h-0">
        <div className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-2 h-6 bg-green-400 rounded-full mr-2"></span>
            Course Report Breakdown
          </div>
          
          {/* Course Type Tabs */}
          <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-white text-[#3E325F] shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Active Courses ({courseBreakdown.filter(course => course.status !== 'ARCHIVED').length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'archived'
                  ? 'bg-white text-[#3E325F] shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Archived Courses ({courseBreakdown.filter(course => course.status === 'ARCHIVED').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-white text-[#3E325F] shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              All Courses ({courseBreakdown.length})
            </button>
          </div>
        </div>
        
        <table className="min-w-full table-fixed">
          <thead>
            <tr>
              <th className="w-1/3 py-4 px-6 text-left text-base text-white font-semibold">Course Name</th>
              <th className="w-1/6 py-4 px-6 text-center text-base text-white font-semibold">Current Grade</th>
              <th className="w-1/6 py-4 px-6 text-center text-base text-white font-semibold">Target Grade</th>
              <th className="w-1/6 py-4 px-6 text-center text-base text-white font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredCourseBreakdown().map((course, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="w-1/3 py-4 px-6 text-left text-white text-base">{course.course}</td>
                <td className="w-1/6 py-4 px-6 text-center text-white text-base">{course.grade}</td>
                <td className="w-1/6 py-4 px-6 text-center text-white text-base">{course.target}</td>
                <td className="w-1/6 py-4 px-6 text-center">
                  <span
                    className={`min-w-[120px] text-center px-4 py-2 rounded-full text-white text-sm font-medium inline-block ${
                      course.status === "EXCELLENT"
                        ? "bg-blue-500"
                        : course.status === "ON TRACK"
                        ? "bg-green-500"
                        : course.status === "ARCHIVED"
                        ? "bg-orange-500"
                        : course.status === "ONGOING"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
