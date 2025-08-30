import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseManager from './CourseManager';
import GradeEntry from './GradeEntry';
import GoalSetting from './GoalSetting';
import { getGradeColor, convertPercentageToScale, convertPercentageToGPA } from '../utils/gradeCalculations';
import GradeService from '../services/gradeService';
import { getGradesByCourseId, getCoursesByUid } from '../backend/api';

function MainDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const displayName = currentUser?.displayName || currentUser?.email || 'Unknown User';

  // Load courses and grades from database
  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);

  // Load courses from database
  const loadCourses = async () => {
    if (!currentUser) return;
    
    try {
      console.log('Loading courses for user:', currentUser.uid);
      const coursesData = await getCoursesByUid(currentUser.uid);
      console.log('Loaded courses:', coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  // Load all grades for all courses
  const loadAllGrades = async () => {
    if (!currentUser || courses.length === 0) {
      console.log('loadAllGrades: Skipping - no currentUser or courses:', { currentUser: !!currentUser, coursesLength: courses.length });
      return;
    }
    
    console.log('Loading all grades for courses:', courses);
    
    try {
      const allGrades = {};
      
      // Load grades for each course
      for (const course of courses) {
        console.log(`Loading grades for course: ${course.name} (ID: ${course.id})`);
        
        try {
          const courseGrades = await getGradesByCourseId(course.id);
          console.log(`Received grades for ${course.name}:`, courseGrades);
          
          if (courseGrades && courseGrades.length > 0) {
            // Transform grades to match our structure: grades[categoryId] = [gradeArray]
            courseGrades.forEach(grade => {
              const categoryId = grade.categoryId || grade.category?.id || grade.category_id;
              console.log(`Processing grade:`, grade, `Category ID:`, categoryId);
              if (categoryId) {
                if (!allGrades[categoryId]) {
                  allGrades[categoryId] = [];
                }
                allGrades[categoryId].push(grade);
              } else {
                console.warn(`Grade missing categoryId:`, grade);
              }
            });
          } else {
            console.log(`No grades found for course: ${course.name}`);
          }
        } catch (courseError) {
          console.error(`Error loading grades for course ${course.name}:`, courseError);
        }
      }
      
      console.log('Final allGrades structure:', allGrades);
      setGrades(allGrades);
      
      // Only set loading to false after a small delay to ensure state is updated
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error loading all grades:', error);
      setIsLoading(false);
    }
  };

  // Load grades for selected course
  useEffect(() => {
    if (selectedCourse && currentUser) {
      // Grades will be loaded by GradeEntry component
      setGrades({});
    }
  }, [selectedCourse, currentUser]);

  // Load all grades when courses change
  useEffect(() => {
    if (courses.length > 0) {
      console.log('Courses changed, scheduling loadAllGrades...');
      // Add a small delay to ensure courses are fully loaded
      const timer = setTimeout(() => {
        loadAllGrades();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [courses]);

  const handleCourseUpdate = (updatedCourses) => {
    setCourses(updatedCourses);
    if (selectedCourse && !updatedCourses.find(c => c.id === selectedCourse.id)) {
      setSelectedCourse(null);
    }
    // Trigger grade loading when courses are updated
    if (updatedCourses.length > 0) {
      loadAllGrades();
    }
  };

  const handleGradeUpdate = (updatedGrades) => {
    // Merge new grades with existing ones instead of replacing
    setGrades(prevGrades => {
      const mergedGrades = { ...prevGrades };
      
      // Merge the new grades
      Object.keys(updatedGrades).forEach(categoryId => {
        if (updatedGrades[categoryId] && updatedGrades[categoryId].length > 0) {
          mergedGrades[categoryId] = updatedGrades[categoryId];
        }
      });
      
      return mergedGrades;
    });
  };

  const handleCourseNavigation = (course) => {
    setSelectedCourse(course);
    setActiveTab('grades');
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
      console.log('No grades loaded yet, skipping GPA calculation');
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
    
    console.log('Courses:', courses);
    console.log('Original grades:', grades);
    console.log('Transformed grades:', transformedGrades);
    
    // Debug: Check what we're sending to GradeService
    console.log('=== SENDING TO GRADESERVICE ===');
    console.log('Courses being sent:', courses.map(c => ({ 
      id: c.id, 
      name: c.name, 
      creditHours: c.creditHours,
      gradingScale: c.gradingScale,
      gpaScale: c.gpaScale,
      categories: c.categories.map(cat => ({ id: cat.id, name: cat.name, weight: cat.weight }))
    })));
    console.log('Transformed grades being sent:', JSON.stringify(transformedGrades, null, 2));
    console.log('=== END SENDING TO GRADESERVICE ===');
    
    const result = GradeService.updateCGPA(courses, transformedGrades);
    console.log('GradeService result:', result);
    
    // Debug: Test GradeService methods directly
    console.log('=== GRADE SERVICE DIRECT TEST ===');
    try {
      // Test individual course calculation
      courses.forEach(course => {
        console.log(`\nTesting GradeService.calculateCourseImpact for ${course.name}:`);
        const courseGrades = {};
        course.categories.forEach(category => {
          if (grades[category.id] && grades[category.id].length > 0) {
            courseGrades[category.id] = grades[category.id];
          }
        });
        
        console.log('Course grades for GradeService:', courseGrades);
        const directResult = GradeService.calculateCourseImpact(course, courseGrades);
        console.log('Direct GradeService result:', directResult);
      });
    } catch (error) {
      console.error('Error testing GradeService directly:', error);
    }
    console.log('=== END GRADE SERVICE DIRECT TEST ===');
    
    // Debug: Manual GPA calculation to compare
    let manualGPA = 0;
    let totalCredits = 0;
    let totalWeightedGrade = 0;
    
    courses.forEach(course => {
      console.log(`\n--- Course: ${course.name} ---`);
      const courseGrades = {};
      course.categories.forEach(category => {
        if (grades[category.id] && grades[category.id].length > 0) {
          courseGrades[category.id] = grades[category.id];
          console.log(`Category ${category.name}: ${grades[category.id].length} grades`);
        }
      });
      
      if (Object.keys(courseGrades).length > 0) {
        const courseResult = GradeService.calculateCourseImpact(course, courseGrades);
        console.log(`Course ${course.name} result:`, courseResult);
        
        if (courseResult.success) {
          // Convert percentage to GPA for this course
          let courseGPA;
          if (course.gradingScale === 'percentage') {
            courseGPA = (courseResult.courseGrade / 100) * 4.0; // Convert to 4.0 scale
          } else if (course.gradingScale === 'gpa') {
            courseGPA = courseResult.courseGrade;
          } else {
            courseGPA = (courseResult.courseGrade / course.maxPoints) * 4.0;
          }
          
          console.log(`Course ${course.name} GPA: ${courseGPA}`);
          
          // Use default credit hours if not set
          const creditHours = course.creditHours || 3; // Default to 3 credits
          console.log(`Using credit hours: ${creditHours}`);
          
          totalWeightedGrade += (courseGPA * creditHours);
          totalCredits += creditHours;
        }
      }
    });
    
    if (totalCredits > 0) {
      manualGPA = totalWeightedGrade / totalCredits;
      console.log(`\nManual GPA calculation: ${manualGPA.toFixed(4)}`);
      console.log(`Total weighted grade: ${totalWeightedGrade}`);
      console.log(`Total credits: ${totalCredits}`);
    }
    
    // Debug: Check the final result
    const finalGPA = result.success ? parseFloat(result.overallGPA) : 0;
    console.log('Final calculated GPA:', finalGPA);
    console.log('Manual calculated GPA:', manualGPA);
    console.log('=== END GPA CALCULATION DEBUG ===');
    
    return finalGPA;
  };

  const overallGPA = isLoading ? 0 : calculateOverallGPA();

  console.log('Render state:', { 
    isLoading, 
    coursesLength: courses.length, 
    gradesLength: Object.keys(grades).length,
    hasGrades: Object.keys(grades).length > 0 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GradeGoal Dashboard</h1>
              <p className="text-gray-600">Welcome back, {displayName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall GPA</p>
                <p className={`text-2xl font-bold ${getGradeColor(overallGPA * 25)}`}>
                  {overallGPA.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-[#3B389f] text-[#3B389f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-[#3B389f] text-[#3B389f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Courses
            </button>
            {selectedCourse && (
              <>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'grades'
                      ? 'border-[#3B389f] text-[#3B389f]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {selectedCourse.name} - Grades
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'goals'
                      ? 'border-[#3B389f] text-[#3B389f]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {selectedCourse.name} - Goals
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B389f] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses and grades...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Courses</h3>
                    <p className="text-3xl font-bold text-[#3B389f]">{courses.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Active courses</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall GPA</h3>
                    <p className={`text-3xl font-bold ${getGradeColor(overallGPA * 25)}`}>
                      {overallGPA.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">4.0 scale</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Grades</h3>
                    <p className="text-3xl font-bold text-[#3B389f]">
                      {Object.values(grades).flat().length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">All assignments</p>
                  </div>
                </div>

                {/* Course Overview Cards */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Course Overview</h3>
                    <button
                      onClick={() => {
                        loadCourses();
                        loadAllGrades();
                      }}
                      className="bg-[#3B389f] text-white px-3 py-1 rounded text-sm hover:bg-[#2d2a7a] transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => {
                        console.log('Manual test - Current state:');
                        console.log('Courses:', courses);
                        console.log('Grades:', grades);
                        console.log('Current user:', currentUser);
                        // Test API call directly
                        if (courses.length > 0) {
                          getGradesByCourseId(courses[0].id).then(result => {
                            console.log('Direct API test result:', result);
                          }).catch(error => {
                            console.error('Direct API test error:', error);
                          });
                        }
                      }}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors ml-2"
                    >
                      Test API
                    </button>
                  </div>
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No courses added yet</p>
                      <button
                        onClick={() => setActiveTab('courses')}
                        className="bg-[#3B389f] text-white px-4 py-2 rounded-lg hover:bg-[#2d2a7a] transition-colors"
                      >
                        Add Your First Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map(course => {
                        // Get all grades for this course by looking through all categories
                        const courseGrades = {};
                        course.categories.forEach(category => {
                          if (grades[category.id]) {
                            courseGrades[category.id] = grades[category.id];
                          }
                        });
                        
                        const categoriesWithGrades = course.categories.map(cat => ({
                          ...cat,
                          grades: courseGrades[cat.id] || []
                        }));
                        
                        // Calculate course grade using service
                        const result = GradeService.calculateCourseImpact(course, courseGrades);
                        const coursePercentage = result.success ? result.courseGrade : 0;
                        
                        // Convert percentage to GPA for display
                        const courseGPA = convertPercentageToGPA(coursePercentage, course.gpaScale || '4.0');
                        
                        // Validate GPA value
                        const validGPA = isNaN(courseGPA) || courseGPA < 0 ? 0 : Math.max(0, Math.min(courseGPA, 5.0));
                        
                        // Check if there are any grades for this course
                        const hasGrades = Object.values(courseGrades).flat().length > 0;
                        
                        return (
                          <div 
                            key={course.id} 
                            className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:shadow-md transition-shadow group"
                            onClick={() => {
                              setSelectedCourse(course);
                              setActiveTab('grades');
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800 group-hover:text-[#3B389f] transition-colors">{course.name}</h4>
                              <span className={`text-sm font-medium px-2 py-1 rounded ${hasGrades ? getGradeColor(coursePercentage) : 'bg-gray-200 text-gray-600'}`}>
                                {hasGrades ? `${validGPA.toFixed(2)} GPA` : 'No grades'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {course.categories.length} categories • {Object.values(courseGrades).flat().length} grades
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {course.categories.map(cat => (
                                <span key={cat.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {cat.name} ({cat.weight}%)
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Term System: {course.termSystem || '3-term'}</p>
                              <p>GPA Scale: {course.gpaScale || '4.0'}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <p className="text-xs text-[#3B389f] font-medium group-hover:text-[#2d2a7a] transition-colors">
                                Click to view grades →
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <CourseManager onCourseUpdate={handleCourseUpdate} onCourseSelect={handleCourseNavigation} />
            )}

            {activeTab === 'grades' && selectedCourse && (
              <GradeEntry 
                course={selectedCourse} 
                onGradeUpdate={handleGradeUpdate}
              />
            )}

            {activeTab === 'goals' && selectedCourse && (
              <GoalSetting 
                course={selectedCourse} 
                grades={grades}
                onGoalUpdate={() => {}} // Handle goal updates if needed
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;
