import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseManager from '../course/CourseManager';
import GradeEntry from '../course/GradeEntry';
import GoalSetting from './GoalSetting';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import { getGradeColor, convertPercentageToScale, convertPercentageToGPA } from '../../utils/gradeCalculations';
import { calculateCourseProgress } from '../../utils/progressCalculations';
import GradeService from '../../services/gradeService';
import { getGradesByCourseId, getCoursesByUid, getAssessmentCategoriesByCourseId } from '../../backend/api';
import { getCourseColorScheme } from '../../utils/courseColors';

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
  const [showArchivedCourses, setShowArchivedCourses] = useState(false);

  const displayName = currentUser?.displayName || currentUser?.email || 'Unknown User';

  useEffect(() => {
    if (currentUser) {
      loadCoursesAndGrades();
    }
  }, [currentUser]);

  const loadCoursesAndGrades = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      const coursesData = await getCoursesByUid(currentUser.email);

      const coursesWithCategories = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const categories = await getAssessmentCategoriesByCourseId(course.id);
            return { ...course, categories };
          } catch (error) {
            return { ...course, categories: [] };
          }
        })
      );

      setCourses(coursesWithCategories);

      if (coursesWithCategories.length > 0 && activeTab === 'overview') {
        await loadAllGrades(coursesWithCategories);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpeningOverlay) {
      const timer = setTimeout(() => {
        setIsOpeningOverlay(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpeningOverlay]);

  const loadAllGrades = useCallback(async (coursesData = courses) => {
    if (!currentUser || coursesData.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const allGrades = {};

      const gradePromises = coursesData.map(async (course) => {
        try {
          const courseGrades = await getGradesByCourseId(course.id);

          if (courseGrades && courseGrades.length > 0) {

            courseGrades.forEach(grade => {
              const categoryId = grade.categoryId || grade.category?.id || grade.category_id;
              if (categoryId) {
                if (!allGrades[categoryId]) {
                  allGrades[categoryId] = [];
                }
                allGrades[categoryId].push(grade);
              }
            });
          } else {
          }
        } catch (courseError) {

        }
      });

      await Promise.all(gradePromises);

      setGrades(allGrades);

      const coursesWithProgress = coursesData.map(course => {
        try {

          const progress = calculateCourseProgress(course.categories, allGrades);

          let courseGrade = 'Ongoing';
          let hasGrades = false;

          if (course.categories && course.categories.length > 0) {
            const gradeResult = GradeService.calculateCourseGrade(course, allGrades);
            if (gradeResult.success) {
              courseGrade = gradeResult.courseGrade;
              hasGrades = true;

              const gradingScale = course.gradingScale || 'percentage';
              const gpaScale = course.gpaScale || '4.0';

              if (gradingScale === 'gpa' || (gradingScale === 'percentage' && courseGrade > 100)) {
                courseGrade = GradeService.convertPercentageToGPA(courseGrade, gpaScale);
              }

            }
          }

          return {
            ...course,
            progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
            currentGrade: courseGrade,
            hasGrades: hasGrades
          };
        } catch (error) {

          return {
            ...course,
            progress: 0,
            currentGrade: 'Ongoing',
            hasGrades: false
          };
        }
      });

      setCourses(coursesWithProgress);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }, [currentUser, courses]);

  useEffect(() => {
    if (selectedCourse && currentUser) {

    }
  }, [selectedCourse, currentUser]);

  const refreshGrades = async () => {
    if (courses.length > 0) {
      await loadAllGrades();
    }
  };

  useEffect(() => {
    if (courses.length > 0 && Object.keys(grades).length === 0 && activeTab === 'overview') {
      loadAllGrades();
    }
  }, [courses, activeTab, loadAllGrades]);

  useEffect(() => {
    setActiveTab(initialTab);

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

  };

  const handleGradeUpdate = (updatedData) => {

    if (updatedData && typeof updatedData === 'object' && updatedData.id && updatedData.name) {

      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === updatedData.id ? updatedData : course
        )
      );

      if (selectedCourse && selectedCourse.id === updatedData.id) {
        setSelectedCourse(updatedData);
      }
    } else {

      setGrades(prevGrades => {
        const mergedGrades = { ...prevGrades };

        Object.keys(updatedData).forEach(categoryId => {
          if (updatedData[categoryId] && updatedData[categoryId].length > 0) {
            mergedGrades[categoryId] = updatedData[categoryId];
          }
        });

        if (selectedCourse) {
          try {

            const progress = calculateCourseProgress(selectedCourse.categories, mergedGrades);

            let courseGrade = 'Ongoing';
            let hasGrades = false;

            if (selectedCourse.categories && selectedCourse.categories.length > 0) {
              const gradeResult = GradeService.calculateCourseGrade(selectedCourse, mergedGrades);
              if (gradeResult.success) {
                courseGrade = gradeResult.courseGrade;
                hasGrades = true;

                const gradingScale = selectedCourse.gradingScale || 'percentage';
                const gpaScale = selectedCourse.gpaScale || '4.0';

                if (gradingScale === 'gpa' || (gradingScale === 'percentage' && courseGrade > 100)) {
                  courseGrade = GradeService.convertPercentageToGPA(courseGrade, gpaScale);
                }

              }
            }

            const updatedCourse = {
              ...selectedCourse,
              categories: selectedCourse.categories.map(cat => ({ ...cat })),
              progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
              currentGrade: courseGrade,
              hasGrades: hasGrades
            };

            setSelectedCourse(updatedCourse);

            setCourses(prevCourses =>
              prevCourses.map(course =>
                course.id === selectedCourse.id ? updatedCourse : course
              )
            );
          } catch (error) {

          }
        }

        return mergedGrades;
      });
    }
  };

  const handleCourseNavigation = (course) => {

    setPreviousTab(activeTab);
    setSelectedCourse(course);

    setActiveTab('courses');

    navigate('/dashboard/courses');

    setIsOpeningOverlay(true);
    setIsCourseManagerExpanded(true);
  };

  const handleBackFromCourse = () => {
    setSelectedCourse(null);

    setActiveTab('courses');
    navigate('/dashboard/courses');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === 'overview' || tab === 'reports' || tab === 'calendar') {
      setSelectedCourse(null);
    }

    if (tab === 'courses' && !selectedCourse) {

      setIsOpeningOverlay(true);
      setIsCourseManagerExpanded(true);
    } else {

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

    }
  };

  const calculateOverallGPA = () => {
    if (courses.length === 0) return 0;

    const hasGrades = Object.keys(grades).length > 0;
    if (!hasGrades) {
      return 0;
    }

    const transformedGrades = {};
    courses.forEach(course => {
      transformedGrades[course.id] = {};

      if (course.categories && Array.isArray(course.categories)) {
        course.categories.forEach(category => {

          transformedGrades[course.id][category.id] = grades[category.id] || [];
        });
      }
    });

    const result = GradeService.updateCGPA(courses, transformedGrades);

    return result.success ? parseFloat(result.overallGPA) : 0;
  };

  const overallGPA = isLoading ? 0 : calculateOverallGPA();

  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 flex-shrink-0 bg-white shadow-lg relative z-20">
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

                {}
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
                  key={`courses-${Object.keys(grades).length}-${courses.length}`}
                  onCourseSelect={handleCourseNavigation}
                  onCourseUpdate={handleCourseUpdate}
                  courses={courses}
                  grades={grades}
                  onRefreshGrades={refreshGrades}
                />
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="w-full h-full p-6 bg-gray-100">
                {selectedCourse ? (
                  <GoalSetting
                    course={selectedCourse}
                    grades={grades}
                    onGoalUpdate={() => {}}
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

        {}
        {activeTab !== 'courses' && (
          <div
            className={`bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white shadow-lg border-l border-gray-200 flex flex-col relative transition-all duration-500 ease-in-out animate-slideIn ${
              isCourseManagerExpanded ? 'w-[340px]' : 'w-80'
            }`}
          >
            {}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => {
                  if (!isCourseManagerExpanded) {

                    setIsOpeningOverlay(true);
                    setIsCourseManagerExpanded(true);
                  } else {

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

            {}
            <div className="flex flex-row items-center my-4 justify-center">
              <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-2 mt-5"></span>
              <h2 className="text-3xl font-semibold leading-none mt-5">Course List</h2>
            </div>

            {}
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

            {}
            <div className="text-center mb-2">
              <span className="text-xs text-gray-400">
                {courses.filter(course => showArchivedCourses ? true : course.isActive !== false).length} of {courses.length} courses
              </span>
            </div>

            <div className="w-[80%] h-[1px] bg-gray-300 my-5 mx-auto"></div>

            {}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 w-full">
              {courses.length === 0 ? (
                <div className="text-center text-gray-300 py-8 w-full">
                  <p>No courses added yet</p>
                  <p className="text-sm">Add courses to see them here</p>
                </div>
              ) : (
                courses
                  .filter(course => showArchivedCourses ? true : course.isActive !== false)
                  .map((course) => {

                  let totalProgress = 0;
                  let courseGrade = 'Ongoing';
                  let hasGrades = false;
                  let isOngoing = true;

                  if (course.categories && course.categories.length > 0 && grades && typeof grades === 'object') {
                    try {

                      const categoriesWithScores = course.categories.filter(category => {
                        const categoryGrades = grades[category.id] || [];
                        return categoryGrades.some(grade =>
                          grade.score !== undefined &&
                          grade.score !== null &&
                          grade.score !== '' &&
                          !isNaN(parseFloat(grade.score))
                        );
                      });

                      courseGrade = course.currentGrade || 'Ongoing';
                      hasGrades = course.hasGrades || false;
                      isOngoing = !hasGrades;

                      totalProgress = course.progress || 0;

                      if (isNaN(totalProgress) || !isFinite(totalProgress)) {
                        totalProgress = 0;
                      }
                    } catch (error) {

                    }
                  } else {

                    totalProgress = course.progress || 0;
                    courseGrade = course.currentGrade || 'Ongoing';
                    hasGrades = course.hasGrades || false;
                    isOngoing = !hasGrades;
                  }

                  if (totalProgress === 0 && course.categories && course.categories.length > 0 && (!grades || Object.keys(grades).length === 0)) {
                    isOngoing = true;
                    hasGrades = false;
                    courseGrade = 'Ongoing';
                  }

                  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);

                  return (

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
                          course.isActive === false
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : hasGrades
                            ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        }`}>
                          {course.isActive === false
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
                              course.isActive === false
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                : `bg-gradient-to-r ${colorScheme.progressGradient}`
                            }`}
                            style={{ width: `${isNaN(totalProgress) || !isFinite(totalProgress) ? 0 : totalProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {isOngoing && totalProgress === 0 ? 'Ongoing' :
                           (isNaN(totalProgress) || !isFinite(totalProgress) ? 'Ongoing' :
                            (totalProgress === 0 && course.categories && course.categories.length > 0 && (!grades || Object.keys(grades).length === 0) ? 'Ongoing' : `${Math.round(totalProgress)}%`))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {}
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

            {}
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
                    key={`courses-expanded-${Object.keys(grades).length}-${courses.length}`}
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
                    onRefreshGrades={refreshGrades}
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
