import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseManager from './CourseManager';
import GradeEntry from './GradeEntry';
import GoalSetting from './GoalSetting';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import { getGradeColor, convertPercentageToScale, convertPercentageToGPA } from '../utils/gradeCalculations';
import GradeService from '../services/gradeService';
import { getGradesByCourseId, getCoursesByUid } from '../backend/api';
import { getCourseColorScheme } from '../utils/courseColors';

/**
 * CSS animations for slide-in and slide-out transitions
 * Provides smooth overlay animations for course management
 */
const slideInAnimation = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50px);
    }
  }
  
  .animate-slideIn {
    animation: slideIn 0.5s ease-out;
  }
  
  .animate-slideOut {
    animation: slideOut 0.5s ease-out;
  }
`;

// Inject the CSS animations into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = slideInAnimation;
  document.head.appendChild(style);
}

/**
 * MainDashboard Component
 * 
 * The main application container that manages navigation between different views.
 * Handles course management, grade entry, goal setting, and dashboard overview.
 * Features smooth overlay transitions and state management for all sub-components.
 * 
 * @param {string} initialTab - The initial active tab to display
 */
function MainDashboard({ initialTab = 'overview' }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for managing courses and UI
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCourseManagerExpanded, setIsCourseManagerExpanded] = useState(false);
  const [isClosingOverlay, setIsClosingOverlay] = useState(false);
  const [isOpeningOverlay, setIsOpeningOverlay] = useState(false);
  const [previousTab, setPreviousTab] = useState('overview');
  const [showArchivedCourses, setShowArchivedCourses] = useState(false);

  const displayName = currentUser?.displayName || currentUser?.email || 'Unknown User';

  /**
   * Load courses and grades from database when component mounts
   */
  useEffect(() => {
    if (currentUser) {
      loadCoursesAndGrades();
    }
  }, [currentUser]);

  /**
   * Load courses and grades efficiently from the database
   * Loads courses first, then grades only if needed for the overview tab
   */
  const loadCoursesAndGrades = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Load courses first
      const coursesData = await getCoursesByUid(currentUser.uid);
      setCourses(coursesData);
      
      // Only load grades if we have courses and are on overview tab
      if (coursesData.length > 0 && activeTab === 'overview') {
        await loadAllGrades(coursesData);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setIsLoading(false);
    }
  };

  /**
   * Reset opening overlay state after animation completes
   * Ensures smooth transition animations
   */
  useEffect(() => {
    if (isOpeningOverlay) {
      const timer = setTimeout(() => {
        setIsOpeningOverlay(false);
      }, 100); // Small delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [isOpeningOverlay]);

  /**
   * Load all grades for all courses efficiently using parallel API calls
   * @param {Array} coursesData - Array of courses to load grades for
   */
  const loadAllGrades = async (coursesData = courses) => {
    if (!currentUser || coursesData.length === 0) {
      setIsLoading(false);
      return;
    }
    
    try {
      const allGrades = {};
      
      // Use Promise.all to load grades in parallel instead of sequentially
      const gradePromises = coursesData.map(async (course) => {
        try {
          const courseGrades = await getGradesByCourseId(course.id);
          
          if (courseGrades && courseGrades.length > 0) {
            // Transform grades to match our structure: grades[categoryId] = [gradeArray]
            courseGrades.forEach(grade => {
              const categoryId = grade.categoryId || grade.category?.id || grade.category_id;
              if (categoryId) {
                if (!allGrades[categoryId]) {
                  allGrades[categoryId] = [];
                }
                allGrades[categoryId].push(grade);
              }
            });
          }
        } catch (courseError) {
          console.error(`Error loading grades for course ${course.name}:`, courseError);
        }
      });
      
      // Wait for all grade loading to complete
      await Promise.all(gradePromises);
      
      setGrades(allGrades);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading all grades:', error);
      setIsLoading(false);
    }
  };

  /**
   * Load grades for selected course when needed
   * Note: GradeEntry component handles its own grade loading
   */
  useEffect(() => {
    if (selectedCourse && currentUser) {
      // Don't clear grades - let GradeEntry component handle its own grade loading
      // The grades state should persist for the Dashboard
    }
  }, [selectedCourse, currentUser]);

  /**
   * Load grades only when needed (overview tab and no grades loaded yet)
   * Optimizes performance by avoiding unnecessary API calls
   */
  useEffect(() => {
    if (activeTab === 'overview' && courses.length > 0 && Object.keys(grades).length === 0) {
      loadAllGrades();
    }
  }, [activeTab, courses]);

  /**
   * Sync activeTab with URL when component mounts or initialTab changes
   * Handles deep linking to specific courses and tabs
   */
  useEffect(() => {
    setActiveTab(initialTab);
    
    // If we're on the grades tab, check if there's a course ID in the URL
    if (initialTab === 'grades') {
      const path = window.location.pathname;
      if (path.startsWith('/dashboard/course/')) {
        const courseId = path.split('/')[3];
        if (courseId && courses.length > 0) {
          const course = courses.find(c => c.id === courseId);
          if (course) {
            setSelectedCourse(course);
          }
        }
      }
    }
  }, [initialTab, courses]);

  /**
   * Handle browser back/forward navigation
   * Maintains application state consistency with browser history
   */
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        setActiveTab('overview');
      } else if (path.startsWith('/dashboard/')) {
        const tab = path.split('/')[2];
        if (['courses', 'goals', 'reports', 'calendar'].includes(tab)) {
          setActiveTab(tab);
        } else if (tab === 'course') {
          const courseId = path.split('/')[3];
          if (courseId) {
            const course = courses.find(c => c.id === courseId);
            if (course) {
              setSelectedCourse(course);
              setActiveTab('grades');
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [courses]);

  /**
   * Handle overlay state when course is selected
   * Triggers smooth animation for course detail view
   */
  useEffect(() => {
    if (selectedCourse) {
      setIsCourseManagerExpanded(true);
      setIsOpeningOverlay(true);
    }
  }, [selectedCourse]);

  /**
   * Handle course updates from CourseManager component
   * Updates local state and handles course deletion scenarios
   * @param {Array} updatedCourses - Array of updated courses
   */
  const handleCourseUpdate = (updatedCourses) => {
    setCourses(updatedCourses);
    if (selectedCourse && !updatedCourses.find(c => c.id === selectedCourse.id)) {
      setSelectedCourse(null);
    }
    // Always reload grades when courses are updated to prevent NaN progress calculations
    // This ensures that updated course data (like units) is properly synchronized with grades
    loadAllGrades(updatedCourses);
  };

  /**
   * Handle grade updates from GradeEntry component
   * Distinguishes between course updates and grade updates
   * @param {Object|Object} updatedData - Updated course or grades data
   */
  const handleGradeUpdate = (updatedData) => {
    // Check if this is a course update or grade update
    if (updatedData && typeof updatedData === 'object' && updatedData.id && updatedData.name) {
      // This is a course update
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === updatedData.id ? updatedData : course
        )
      );
      
      // Also update the selected course if it's the one being edited
      if (selectedCourse && selectedCourse.id === updatedData.id) {
        setSelectedCourse(updatedData);
      }
    } else {
      // This is a grade update
      setGrades(prevGrades => {
        const mergedGrades = { ...prevGrades };
        
        // Merge the new grades
        Object.keys(updatedData).forEach(categoryId => {
          if (updatedData[categoryId] && updatedData[categoryId].length > 0) {
            mergedGrades[categoryId] = updatedData[categoryId];
          }
        });
        
        return mergedGrades;
      });
    }
  };

  /**
   * Handle navigation to a specific course
   * Stores current tab and navigates to course detail view
   * @param {Object} course - The course to navigate to
   */
  const handleCourseNavigation = (course) => {
    // Store the current tab before navigating to course
    setPreviousTab(activeTab);
    setSelectedCourse(course);
    // Keep the courses tab active when viewing grades
    setActiveTab('courses');
    // Navigate to courses tab
    navigate('/dashboard/courses');
    // Trigger overlay animation immediately without triggering handleTabChange
    setIsOpeningOverlay(true);
    setIsCourseManagerExpanded(true);
  };

  /**
   * Handle navigation back from course detail view
   * Returns to courses tab and clears selected course
   */
  const handleBackFromCourse = () => {
    setSelectedCourse(null);
    
    // Always stay on the courses tab when going back from a course
    // This provides a more consistent experience
    setActiveTab('courses');
    navigate('/dashboard/courses');
  };

  /**
   * Handle tab changes and manage overlay states
   * @param {string} tab - The tab to switch to
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Clear selected course when switching to tabs that don't need it
    if (tab === 'overview' || tab === 'reports' || tab === 'calendar') {
      setSelectedCourse(null);
    }
    
    // Automatically expand course manager when courses tab is selected (but not when a course is already selected)
    if (tab === 'courses' && !selectedCourse) {
      // Trigger smooth expansion animation
      setIsOpeningOverlay(true);
      setIsCourseManagerExpanded(true);
    } else {
      // Collapse course manager for other tabs with smooth transition
      if (isCourseManagerExpanded) {
        setIsClosingOverlay(true);
        setTimeout(() => {
          setIsCourseManagerExpanded(false);
          setIsClosingOverlay(false);
        }, 500);
      } else {
        setIsCourseManagerExpanded(false);
      }
    }
    
    // Update URL based on selected tab
    if (tab === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  /**
   * Handle user logout and redirect to login page
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  /**
   * Calculate overall GPA across all courses using GradeService
   * @returns {number} The calculated overall GPA or 0 if calculation fails
   */
  const calculateOverallGPA = () => {
    if (courses.length === 0) return 0;
    
    // Only calculate GPA if grades are actually loaded
    const hasGrades = Object.keys(grades).length > 0;
    if (!hasGrades) {
      return 0;
    }
    
    // Transform grades structure to match what GradeService expects
    const transformedGrades = {};
    courses.forEach(course => {
      transformedGrades[course.id] = {};
      course.categories.forEach(category => {
        // Always include the category, even if empty
        transformedGrades[course.id][category.id] = grades[category.id] || [];
      });
    });
    
    const result = GradeService.updateCGPA(courses, transformedGrades);
    return result.success ? parseFloat(result.overallGPA) : 0;
  };

  const overallGPA = isLoading ? 0 : calculateOverallGPA();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Three Column Layout */}
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 flex-shrink-0 bg-white shadow-lg relative z-20">
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
        
                {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-100 min-h-0 overflow-hidden relative">
        {isLoading ? (
            <div className="text-center py-12 bg-gray-100 h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B389f] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your courses and grades...</p>
            </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="w-full h-full">
                <Dashboard 
                  courses={courses} 
                  grades={grades} 
                  overallGPA={overallGPA}
                  onSearch={(query) => {}}
                  onLogout={handleLogout}
                />
              </div>
            )}

            {activeTab === 'courses' && !isCourseManagerExpanded && (
              <div className="w-full h-full p-6 bg-gray-100">
                <CourseManager 
                  onCourseSelect={handleCourseNavigation}
                  onCourseUpdate={handleCourseUpdate}
                  courses={courses}
                  grades={grades}
                />
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="w-full h-full p-6 bg-gray-100">
                {selectedCourse ? (
                  <GoalSetting 
                    course={selectedCourse} 
                    grades={grades}
                    onGoalUpdate={() => {}} // Handle goal updates if needed
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Goals</h3>
                      <p className="text-gray-600">Select a course from the Course List to set goals</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="w-full h-full p-6 bg-gray-100">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reports</h3>
                    <p className="text-gray-600">Detailed reports and analytics coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="w-full h-full p-6 bg-gray-100">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Calendar</h3>
                    <p className="text-gray-600">Academic calendar and deadlines coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
        
        {/* Right Course Manager Sidebar - Only show when not in courses tab */}
        {activeTab !== 'courses' && (
          <div 
            className={`bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white shadow-lg border-l border-gray-200 flex flex-col relative transition-all duration-500 ease-in-out animate-slideIn ${
              isCourseManagerExpanded ? 'w-[340px]' : 'w-80'
            }`}
          >
            {/* Navigation Arrow Button - Left Side */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => {
                  if (!isCourseManagerExpanded) {
                    // Opening overlay - trigger slide-in animation
                    setIsOpeningOverlay(true);
                    setIsCourseManagerExpanded(true);
                  } else {
                    // Closing overlay - trigger slide-out animation
                    setIsClosingOverlay(true);
                    setTimeout(() => {
                      setIsCourseManagerExpanded(false);
                      setIsClosingOverlay(false);
                    }, 500);
                  }
                }}
                className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
              >
                <svg 
                  className={`w-6 h-6 text-[#8168C5] group-hover:text-[#3E325F] transition-all duration-300 ${
                    isCourseManagerExpanded ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isCourseManagerExpanded ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
                  />
                </svg>
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-row items-center my-4 justify-center">
              <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-2 mt-5"></span>
              <h2 className="text-3xl font-semibold leading-none mt-5">Course List</h2>
            </div>
            
            {/* Archive Toggle and Course Count */}
            <div className="flex items-center justify-center mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchivedCourses}
                  onChange={(e) => setShowArchivedCourses(e.target.checked)}
                  className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
                />
                <span className="text-sm text-gray-300 font-medium">Show Archived Courses</span>
              </label>
            </div>
            
            {/* Course Count */}
            <div className="text-center mb-2">
              <span className="text-xs text-gray-400">
                {courses.filter(course => showArchivedCourses ? true : course.isArchived !== true).length} of {courses.length} courses
              </span>
            </div>
            
            <div className="w-[80%] h-[1px] bg-gray-300 my-5 mx-auto"></div>
            
            {/* Course List */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 w-full">
              {courses.length === 0 ? (
                <div className="text-center text-gray-300 py-8 w-full">
                  <p>No courses added yet</p>
                  <p className="text-sm">Add courses to see them here</p>
                </div>
              ) : (
                courses
                  .filter(course => showArchivedCourses ? true : course.isArchived !== true)
                  .map((course) => {
                  // Calculate progress and grade for this course - synced with CourseManager
                  let totalProgress = 0;
                  let courseGrade = 'Ongoing';
                  let hasGrades = false;
                  let isOngoing = true;

                  // Ensure we have valid course data and grades before calculating
                  if (course.categories && course.categories.length > 0 && grades && typeof grades === 'object') {
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
                      
                      totalProgress = (completedCategories / course.categories.length) * 100;
                      
                      // Ensure progress is a valid number
                      if (isNaN(totalProgress) || !isFinite(totalProgress)) {
                        totalProgress = 0;
                      }
                    } catch (error) {
                      // Silent fallback - use default values
                      console.warn('Error calculating course progress:', error);
                    }
                  } else {
                    // Fallback when grades or categories are not available
                    if (course.categories && course.categories.length > 0) {
                      totalProgress = 0;
                      courseGrade = 'Ongoing';
                      hasGrades = false;
                      isOngoing = true;
                    } else {
                      totalProgress = 0;
                      courseGrade = 'Ongoing';
                      hasGrades = false;
                      isOngoing = true;
                    }
                  }

                  // Fallback: If we have progress > 0, we should have grades
                  if (totalProgress > 0 && !hasGrades) {
                    hasGrades = true;
                    isOngoing = false;
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
                  
                  // Additional fallback: If we have categories but no grades yet, try to preserve progress
                  if (totalProgress === 0 && course.categories && course.categories.length > 0 && (!grades || Object.keys(grades).length === 0)) {
                    isOngoing = true;
                    hasGrades = false;
                    courseGrade = 'Ongoing';
                  }

                  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);
                  
                  return (
                    /*Cards on Right Course Manager Sidebar*/
                    <div
                      key={course.id}
                      className={`bg-white text-black p-4 mx-3 rounded-xl shadow-lg relative cursor-pointer hover:shadow-xl transition-all duration-300 ${
                        selectedCourse && selectedCourse.id === course.id ? `ring-2 ${colorScheme.primary} ring-opacity-50` : ''
                      }`}
                      onClick={() => handleCourseNavigation(course)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">{course.courseCode || course.name.substring(0, 8).toUpperCase()}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          course.isArchived === true
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : hasGrades 
                            ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        }`}>
                          {course.isArchived === true 
                            ? 'ARCHIVED' 
                            : (hasGrades ? (typeof courseGrade === 'number' ? courseGrade.toFixed(1) : courseGrade) : 'Ongoing')}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium mb-2">{course.name}</h3>

                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          Progress:
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              course.isArchived === true
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                : `bg-gradient-to-r ${colorScheme.progressGradient}`
                            }`}
                            style={{ width: `${course.isArchived === true ? 100 : (isNaN(totalProgress) || !isFinite(totalProgress) ? 0 : totalProgress)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {course.isArchived === true 
                            ? '100%' 
                            : (isOngoing && totalProgress === 0 ? 'Ongoing' : 
                               (isNaN(totalProgress) || !isFinite(totalProgress) ? 'Ongoing' : 
                                (totalProgress === 0 && course.categories && course.categories.length > 0 && (!grades || Object.keys(grades).length === 0) ? 'Ongoing' : `${Math.round(totalProgress)}%`)))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>


          </div>
        )}

        {/* Full Screen Overlay - Shows CourseManager or GradeEntry */}
        {(isCourseManagerExpanded || selectedCourse) && (
          <div 
            className={`fixed inset-0 bg-gray-100 z-50 transition-all duration-500 ease-in-out ${
              isClosingOverlay ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
            style={{
              transform: isOpeningOverlay ? 'translateX(100%)' : 'translateX(0)',
              opacity: isOpeningOverlay ? 0 : 1
            }}
          >


            {/* Full Screen Content */}
            {selectedCourse ? (
              <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0 [&>*]:w-full [&>*]:h-full">
                <GradeEntry 
                  course={selectedCourse} 
                  onGradeUpdate={handleGradeUpdate}
                  onBack={() => setSelectedCourse(null)}
                />
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto bg-gray-50">
                <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0">
                  <CourseManager 
                    onCourseSelect={handleCourseNavigation}
                    onCourseUpdate={handleCourseUpdate}
                    onBack={() => {
                      setIsClosingOverlay(true);
                      setTimeout(() => {
                        setIsCourseManagerExpanded(false);
                        setIsClosingOverlay(false);
                        handleTabChange('overview');
                      }, 500);
                    }}
                    courses={courses}
                    grades={grades}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;
