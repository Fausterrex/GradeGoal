import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Bell, User } from "lucide-react";
import GradeService from '../../services/gradeService';
import EnhancedGradeTrends from './EnhancedGradeTrends';
import ProfileEdit from '../auth/ProfileEdit';

const Dashboard = ({ courses, grades, overallGPA, onSearch, onLogout }) => {

  const [activeTab, setActiveTab] = React.useState('active');
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);

  const generateGradeTrends = () => {
    if (courses.length === 0) return [];

    const activeCourses = courses.filter(course => course.isActive !== false);
    if (activeCourses.length === 0) return [];

    const progressionData = [];

    progressionData.push({
      stage: 'Initial',
      grade: 0,
      completedCourses: 0,
      totalCourses: activeCourses.length
    });

    const coursesWithGrades = activeCourses.filter(course => {
      if (!course.categories || !grades) return false;
      const categoriesWithScores = course.categories.filter(category => {
        const categoryGrades = grades[category.id] || [];
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

      let totalGrade = 0;
      let validGrades = 0;

      coursesWithGrades.forEach(course => {
        try {
          const gradeResult = GradeService.calculateCourseGrade(course, grades);
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            // Always convert to GPA if the grade is greater than 4.0 (indicating it's a percentage)
            if (courseGrade > 4.0) {
              courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              totalGrade += courseGrade;
              validGrades++;
            }
          }
        } catch (error) {

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

    const fullyCompletedCourses = activeCourses.filter(course => {
      if (!course.categories || !grades) return false;
      const totalAssessments = course.categories.length;
      const completedAssessments = course.categories.filter(category => {
        const categoryGrades = grades[category.id] || [];
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

      let totalGrade = 0;
      let validGrades = 0;

      fullyCompletedCourses.forEach(course => {
        try {
          const gradeResult = GradeService.calculateCourseGrade(course, grades);
          if (gradeResult.success) {
            let courseGrade = gradeResult.courseGrade;
            // Always convert to GPA if the grade is greater than 4.0 (indicating it's a percentage)
            if (courseGrade > 4.0) {
              courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
            }
            if (courseGrade >= 1.0 && courseGrade <= 4.0) {
              totalGrade += courseGrade;
              validGrades++;
            }
          }
        } catch (error) {

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

  const generateCourseBreakdown = () => {
    if (courses.length === 0) return [];

    return courses.map(course => {
      let currentGrade = 0;
      let hasGrades = false;
      let isOngoing = true;

      try {

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

          if (categoriesWithScores.length > 0) {
            const gradeResult = GradeService.calculateCourseGrade(course, grades);
            if (gradeResult.success) {
              hasGrades = true;
              currentGrade = gradeResult.courseGrade;
              isOngoing = false;

              // Always convert to GPA if the grade is greater than 4.0 (indicating it's a percentage)
              if (currentGrade > 4.0) {
                currentGrade = GradeService.convertPercentageToGPA(currentGrade, course.gpaScale || '4.0');
              }
            }
          }
        }
      } catch (error) {

      }

      let status = 'ON TRACK';

      if (course.isActive === false) {
        status = 'ARCHIVED';
      } else {

        const progressPercentage = course.progress || 0;

        if (progressPercentage === 100) {

          if (currentGrade >= 3.0) {
            status = 'EXCELLENT';
          } else if (currentGrade >= 2.5) {
            status = 'ON TRACK';
          } else {
            status = 'AT RISK';
          }
        } else {

          status = 'ON TRACK';
        }
      }

      // Convert target grade to GPA if it's a percentage
      let targetGradeDisplay = 'Not Set';
      if (course.targetGrade) {
        const targetValue = parseFloat(course.targetGrade);
        if (targetValue > 4.0) {
          // Convert percentage to GPA using course's GPA scale
          targetGradeDisplay = GradeService.convertPercentageToGPA(targetValue, course.gpaScale || '4.0').toFixed(2);
        } else {
          // Already in GPA format
          targetGradeDisplay = targetValue.toFixed(2);
        }
      }

      return {
        course: course.name,
        grade: isOngoing ? 'Ongoing' : currentGrade.toFixed(2),
        targetGrade: targetGradeDisplay,
        status
      };
    });
  };

  const courseBreakdown = generateCourseBreakdown();

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
    <div className="flex flex-col p-3 sm:p-4 lg:p-6 w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          {/* Dashboard Title - Centered on mobile, left-aligned on desktop */}
          <div className="text-center lg:text-left">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Dashboard
            </div>
          </div>

          {/* Search and Actions - Centered on mobile, right-aligned on desktop */}
          <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, grades..."
                className="pl-10 pr-4 py-2.5 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 w-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <Bell className="w-5 h-5 text-white cursor-pointer hover:text-white/80 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              {/* User Profile */}
              <div className="relative group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-200 border border-white/30">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-semibold">Profile</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                    <button
                      onClick={() => setShowProfileEdit(true)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                          onLogout && onLogout();
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mb-8 flex-shrink-0">
        <EnhancedGradeTrends courses={courses} grades={grades} overallGPA={overallGPA} />
      </div>

      {/* Course Breakdown Section */}
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl flex-1 min-h-0 border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="w-3 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full mr-4"></span>
              <h2 className="text-2xl font-bold text-gray-900">Course Report Breakdown</h2>
            </div>
            
            {/* Filter Tabs - Moved to the right, no background */}
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Active ({courseBreakdown.filter(course => course.status !== 'ARCHIVED').length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'archived'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Archived ({courseBreakdown.filter(course => course.status === 'ARCHIVED').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                All ({courseBreakdown.length})
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="block lg:hidden space-y-4">
          {getFilteredCourseBreakdown().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">Add some courses to see your progress here</p>
            </div>
          ) : (
            getFilteredCourseBreakdown().map((course, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 text-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="mb-3">
                <h3 className="text-gray-800 font-semibold text-lg mb-2">{course.course}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === "EXCELLENT"
                      ? "bg-blue-500 text-white"
                      : course.status === "ON TRACK"
                      ? "bg-green-500 text-white"
                      : course.status === "ARCHIVED"
                      ? "bg-orange-500 text-white"
                      : course.status === "ONGOING"
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {course.status}
                </span>
              </div>
              <div className="text-gray-600 text-sm space-y-1">
                <div>
                  Current GPA: <span className="font-semibold text-gray-800">{course.grade}</span>
                </div>
                <div>
                  Target GPA: <span className="font-semibold text-gray-800">{course.targetGrade}</span>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          {getFilteredCourseBreakdown().length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-3">No courses found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Add some courses to see your detailed progress breakdown here</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">Course Name</th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">Current GPA</th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">Target GPA</th>
                  <th className="py-4 px-6 text-center text-gray-700 font-semibold text-lg">Status</th>
                </tr>
              </thead>
            <tbody>
              {getFilteredCourseBreakdown().map((course, index) => (
                <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-4 px-6 text-center text-gray-800 text-lg font-medium">{course.course}</td>
                  <td className="py-4 px-6 text-center text-gray-800 text-lg font-semibold">{course.grade}</td>
                  <td className="py-4 px-6 text-center text-gray-800 text-lg font-semibold">{course.targetGrade}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`min-w-[120px] text-center px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                        course.status === "EXCELLENT"
                          ? "bg-blue-100 text-blue-800"
                          : course.status === "ON TRACK"
                          ? "bg-green-100 text-green-800"
                          : course.status === "ARCHIVED"
                          ? "bg-orange-100 text-orange-800"
                          : course.status === "ONGOING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Profile Edit Modal */}
      <ProfileEdit 
        isOpen={showProfileEdit} 
        onClose={() => setShowProfileEdit(false)} 
      />
    </div>
  );
};

export default Dashboard;
