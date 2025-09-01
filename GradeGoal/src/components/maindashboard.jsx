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

// Add CSS for slide-in and slide-out animations
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

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = slideInAnimation;
  document.head.appendChild(style);
}

function MainDashboard({ initialTab = 'overview' }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCourseManagerExpanded, setIsCourseManagerExpanded] = useState(false);
  const [isClosingOverlay, setIsClosingOverlay] = useState(false);
  const [isOpeningOverlay, setIsOpeningOverlay] = useState(false);
  const [previousTab, setPreviousTab] = useState('overview');

  const displayName = currentUser?.displayName || currentUser?.email || 'Unknown User';

  // Load courses and grades from database
  useEffect(() => {
    if (currentUser) {
      loadCoursesAndGrades();
    }
  }, [currentUser]);

  // Load courses and grades efficiently
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

  // Reset opening overlay state after animation
  useEffect(() => {
    if (isOpeningOverlay) {
      const timer = setTimeout(() => {
        setIsOpeningOverlay(false);
      }, 100); // Small delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [isOpeningOverlay]);

  // Load all grades for all courses efficiently
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

  // Load grades for selected course
  useEffect(() => {
    if (selectedCourse && currentUser) {
      // Don't clear grades - let GradeEntry component handle its own grade loading
      // The grades state should persist for the Dashboard
    }
  }, [selectedCourse, currentUser]);

  // Load grades only when needed (overview tab and no grades loaded yet)
  useEffect(() => {
    if (activeTab === 'overview' && courses.length > 0 && Object.keys(grades).length === 0) {
      loadAllGrades();
    }
  }, [activeTab, courses]);

  // Sync activeTab with URL when component mounts or initialTab changes
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

  // Handle browser back/forward navigation
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

  // Handle overlay state when course is selected
  useEffect(() => {
    if (selectedCourse) {
      setIsCourseManagerExpanded(true);
      setIsOpeningOverlay(true);
    }
  }, [selectedCourse]);

  const handleCourseUpdate = (updatedCourses) => {
    setCourses(updatedCourses);
    if (selectedCourse && !updatedCourses.find(c => c.id === selectedCourse.id)) {
      setSelectedCourse(null);
    }
    // Only reload grades if we're on overview tab and grades are currently loaded
    if (activeTab === 'overview' && Object.keys(grades).length > 0) {
      loadAllGrades(updatedCourses);
    }
  };

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

  const handleBackFromCourse = () => {
    setSelectedCourse(null);
    
    // Always stay on the courses tab when going back from a course
    // This provides a more consistent experience
    setActiveTab('courses');
    navigate('/dashboard/courses');
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Calculate overall GPA across all courses
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
            
            <div className="w-[80%] h-[1px] bg-gray-300 my-5 mx-auto"></div>
            
            {/* Course List */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 w-full">
              {courses.length === 0 ? (
                <div className="text-center text-gray-300 py-8 w-full">
                  <p>No courses added yet</p>
                  <p className="text-sm">Add courses to see them here</p>
                </div>
              ) : (
                courses.map((course) => {
                  // Calculate progress and grade for this course
                  let totalProgress = 0;
                  let courseGrade = 0;
                  let hasGrades = false;

                  if (course.categories && grades) {
                    try {
                      const gradeResult = GradeService.calculateCourseGrade(course, grades);
                      if (gradeResult.success) {
                        hasGrades = true;
                        courseGrade = gradeResult.courseGrade;
                        
                        if (course.gradingScale === 'percentage' || courseGrade > 100) {
                          courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
                        }
                      }
                      
                      const completedCategories = course.categories.filter(category => {
                        const categoryGrades = grades[category.id] || [];
                        return categoryGrades.length > 0;
                      }).length;
                      totalProgress = (completedCategories / course.categories.length) * 100;
                    } catch (error) {
                      // Fallback calculation
                      if (course.categories && grades) {
                        const completedCategories = course.categories.filter(category => {
                          const categoryGrades = grades[category.id] || [];
                          return categoryGrades.length > 0;
                        }).length;
                        totalProgress = (completedCategories / course.categories.length) * 100;
                      }
                    }
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
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">{course.code || course.name.substring(0, 8).toUpperCase()}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          hasGrades 
                            ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {hasGrades ? courseGrade.toFixed(1) : 'N/A'}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium mb-2">{course.name}</h3>

                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          Progress:
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`bg-gradient-to-r ${colorScheme.progressGradient} h-2.5 rounded-full transition-all duration-300`}
                            style={{ width: `${totalProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.round(totalProgress)}%
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
            {/* Back Button - Top Left Corner */}
            <div className="absolute top-6 left-6 z-60">
              <button
                onClick={() => {
                  if (selectedCourse) {
                    // If viewing a course, go back to course list
                    setSelectedCourse(null);
                  } else {
                    // If viewing course manager, go back to overview
                    setIsClosingOverlay(true);
                    setTimeout(() => {
                      setIsCourseManagerExpanded(false);
                      setIsClosingOverlay(false);
                      handleTabChange('overview');
                    }, 500);
                  }
                }}
                className="bg-white/90 backdrop-blur-sm text-[#3E325F] px-4 py-2 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300 font-semibold shadow-lg border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Back</span>
                </div>
              </button>
            </div>

            {/* Full Screen Content */}
            <div className="w-full h-full overflow-y-auto bg-gray-50">
              {selectedCourse ? (
                <GradeEntry 
                  course={selectedCourse} 
                  onGradeUpdate={handleGradeUpdate}
                  onBack={() => setSelectedCourse(null)}
                />
              ) : (
                <div className="w-full h-full">
                  <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0">
                    <CourseManager 
                      onCourseSelect={handleCourseNavigation}
                      onCourseUpdate={handleCourseUpdate}
                      courses={courses}
                      grades={grades}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;
