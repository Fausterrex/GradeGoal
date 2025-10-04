// ========================================
// MAIN DASHBOARD COMPONENT
// ========================================
// This is the main dashboard component that orchestrates the entire application
// Features: Navigation, course management, grade entry, goal setting, data management

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useYearLevel } from "../../context/YearLevelContext";
import { useNavigate } from "react-router-dom";
import CourseManager from "../course/CourseManager";
import GradeEntry from "../course/course_details/GradeEntry";
import GoalSetting from "../course/academic_goal/GoalSetting";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import SideCourseList from "./SideCourseList";
import MyCalendar from "../calendar/Calendar";
import Report from "./Report";
import {
  getGradesByCourseId,
  getCoursesByUid,
  getAssessmentCategoriesByCourseId,
} from "../../backend/api";
import {
  FaTachometerAlt,
  FaBook,
  FaBullseye,
  FaClipboardList,
  FaCalendarAlt,
  FaCog,
} from "react-icons/fa";
import { getCourseColorScheme } from "../../utils/courseColors";
import { calculateCourseProgress } from "../../services/progressCalculationService";
import RealtimeNotificationService from "../../services/realtimeNotificationService";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import UserSettings from "../settings/UserSettings";
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

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = slideInAnimation;
  document.head.appendChild(style);
}

function MainDashboard({ initialTab = "overview" }) {
  const { currentUser, logout } = useAuth();
  const { selectedYearLevel, filterDataByYearLevel } = useYearLevel();
  const navigate = useNavigate();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isCourseManagerExpanded, setIsCourseManagerExpanded] = useState(false);
  const [isClosingOverlay, setIsClosingOverlay] = useState(false);
  const [isOpeningOverlay, setIsOpeningOverlay] = useState(false);
  const [previousTab, setPreviousTab] = useState("overview");
  const [previousRoute, setPreviousRoute] = useState("/dashboard");
  const [isFromSidebar, setIsFromSidebar] = useState(false);
  
  const [showArchivedCourses, setShowArchivedCourses] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileCourseListOpen, setIsMobileCourseListOpen] = useState(false);
  
  // Push notifications hook
  const { 
    isEnabled: pushNotificationsEnabled, 
    canRequestPermission, 
    requestPermission 
  } = usePushNotifications();

  const displayName = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : currentUser?.displayName || currentUser?.email || "Unknown User";

    useEffect(() => {
      if (currentUser?.email) {
        loadCoursesAndGrades();
      }
    }, [currentUser?.email]); // Only reload when email changes, not on profile updates

    // Reload courses when year level changes
    useEffect(() => {
      console.log('🎓 [MainDashboard] Year level changed, reloading courses:', selectedYearLevel);
      if (currentUser?.email) {
        loadCoursesAndGrades();
      }
    }, [selectedYearLevel]);

  const loadCoursesAndGrades = async () => {
    if (!currentUser) return;
    
    // Prevent concurrent calls
    if (isLoadingCourses) {
      return;
    }
    try {
      setIsLoadingCourses(true);
      setIsLoading(true);

      const coursesData = await getCoursesByUid(currentUser.email);

      const coursesWithCategories = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const categories = await getAssessmentCategoriesByCourseId(
              course.id || course.courseId
            );

            // Transform backend course data to frontend format
            const transformedCourse = {
              ...course,
              id: course.id || course.courseId,
              name: course.name || course.courseName,
              courseCode: course.courseCode,
              colorIndex:
                course.colorIndex !== undefined ? course.colorIndex : 0,
              semester: course.semester,
              academicYear: course.academicYear,
              isMidtermCompleted: course.isMidtermCompleted || false, // Ensure this field is preserved
              categories,
            };

            return transformedCourse;
          } catch (error) {
            const transformedCourse = {
              ...course,
              id: course.id || course.courseId,
              name: course.name || course.courseName,
              courseCode: course.courseCode,
              colorIndex:
                course.colorIndex !== undefined ? course.colorIndex : 0,
              semester: course.semester,
              academicYear: course.academicYear,
              isMidtermCompleted: course.isMidtermCompleted || false, // Ensure this field is preserved
              categories: [],
            };
            return transformedCourse;
          }
        })
      );

      // Filter courses based on selected year level
      const filteredCourses = filterDataByYearLevel(coursesWithCategories, 'creationYearLevel');
      console.log('🎓 [MainDashboard] Filtering courses by year level:', {
        selectedYearLevel,
        totalCourses: coursesWithCategories.length,
        filteredCourses: filteredCourses.length
      });

      // Don't set courses immediately - wait for loadAllGrades to complete
      // setCourses(filteredCourses);

      if (filteredCourses.length > 0 && (activeTab === "overview" || activeTab === "goals")) {
        await loadAllGrades(filteredCourses);
      } else {
        // If no grades to load, still calculate progress for courses with categories
        const allGrades = {};
        
        const gradePromises = filteredCourses.map(async (course) => {
          try {
            const courseGrades = await getGradesByCourseId(course.id);
            
            if (courseGrades && courseGrades.length > 0) {
              courseGrades.forEach((grade) => {
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
            console.error(`Error fetching grades for course ${course.name}:`, courseError);
          }
        });
        
        await Promise.all(gradePromises);
        
        // Calculate progress for courses with categories using actual grades
        const coursesWithProgress = filteredCourses.map(course => {
          let progress = 0;
          let courseGrade = 0.00;
          let hasGrades = false;

          if (course.categories && course.categories.length > 0) {
            // Calculate progress using centralized service
            progress = calculateCourseProgress(course, course.categories, allGrades);
            
            // Check if course has any grades to determine hasGrades
            hasGrades = course.categories.some(category => 
              category.assessments && category.assessments.some(assessment =>
                assessment.grades && assessment.grades.length > 0 &&
                assessment.grades.some(grade => 
                  grade.percentageScore !== null && grade.percentageScore !== undefined
                )
              )
            );

            // Always try to get course grade, even if no grades yet
            try {
              // Try to get course grade from the course data first
              if (course.courseGpa && course.courseGpa > 0) {
                courseGrade = course.courseGpa;
              } else if (course.currentGrade && typeof course.currentGrade === 'number') {
                courseGrade = course.currentGrade;
              } else if (hasGrades) {
                // Calculate from assessments only if there are actual grades
                let totalWeightedGrade = 0;
                let totalWeight = 0;

                for (const category of course.categories) {
                  if (category.assessments && category.assessments.length > 0) {
                    for (const assessment of category.assessments) {
                      if (assessment.grades && assessment.grades.length > 0) {
                        const categoryWeight = category.weight || 0;
                        
                        let assessmentTotal = 0;
                        let assessmentCount = 0;
                        
                        for (const grade of assessment.grades) {
                          if (grade.percentageScore !== null && grade.percentageScore !== undefined) {
                            assessmentTotal += grade.percentageScore;
                            assessmentCount++;
                          }
                        }
                        if (assessmentCount > 0) {
                          totalWeightedGrade += (assessmentTotal / assessmentCount) * (categoryWeight / 100);
                          totalWeight += (categoryWeight / 100);
                        }
                      }
                    }
                  }
                }
                if (totalWeight > 0) {
                  courseGrade = (totalWeightedGrade / totalWeight) / 25; // Convert percentage to GPA
                }
              }
            } catch (gradeError) {
              console.error(`Error calculating course grade for ${course.name}:`, gradeError);
              courseGrade = 0.00;
            }
          }

          return {
            ...course,
            progress: progress,
            currentGrade: courseGrade,
            hasGrades: hasGrades,
          };
        });

        setCourses(coursesWithProgress);
        setIsLoading(false);
        setIsLoadingCourses(false);
      }
    } catch (error) {
      console.error('Error loading courses and grades:', error);
      setIsLoading(false);
      setIsLoadingCourses(false);
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

  const loadAllGrades = useCallback(
    async (coursesData) => {
      if (!currentUser || !coursesData || coursesData.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const allGrades = {};

        const gradePromises = coursesData.map(async (course) => {
          try {
            const courseGrades = await getGradesByCourseId(course.id);

            if (courseGrades && courseGrades.length > 0) {
              courseGrades.forEach((grade) => {
                const categoryId =
                  grade.categoryId || grade.category?.id || grade.category_id;
                if (categoryId) {
                  if (!allGrades[categoryId]) {
                    allGrades[categoryId] = [];
                  }
                  allGrades[categoryId].push(grade);
                }
              });
            } else {
            }
          } catch (courseError) {}
        });

        await Promise.all(gradePromises);

        setGrades(allGrades);

        const coursesWithProgressPromises = coursesData.map(async (course) => {
          try {
            // Use existing progress calculation from GradeEntry
            let progress = 0;
            let courseGrade = 0.00; // Default to 0.00 instead of "Ongoing"
            let hasGrades = false;

            if (course.categories && course.categories.length > 0) {
              // Calculate progress using centralized service
              progress = calculateCourseProgress(course, course.categories, allGrades);
              
              // Check if course has any grades to determine hasGrades
              hasGrades = course.categories.some(category => 
                category.assessments && category.assessments.some(assessment =>
                  assessment.grades && assessment.grades.length > 0 &&
                  assessment.grades.some(grade => 
                    grade.percentageScore !== null && grade.percentageScore !== undefined
                  )
                )
              );

              // Always try to get course grade, even if no grades yet
              try {
                // Try to get course grade from the course data first
                if (course.courseGpa && course.courseGpa > 0) {
                  courseGrade = course.courseGpa;
                } else if (course.currentGrade && typeof course.currentGrade === 'number') {
                  courseGrade = course.currentGrade;
                } else if (hasGrades) {
                  // Calculate from assessments only if there are actual grades
                  let totalWeightedGrade = 0;
                  let totalWeight = 0;

                  for (const category of course.categories) {
                    if (category.assessments && category.assessments.length > 0) {
                      for (const assessment of category.assessments) {
                        if (assessment.grades && assessment.grades.length > 0) {
                          const categoryWeight = category.weight || 0;
                          
                          let assessmentTotal = 0;
                          let assessmentCount = 0;
                          
                          for (const grade of assessment.grades) {
                            if (grade.percentageScore !== null && grade.percentageScore !== undefined) {
                              assessmentTotal += grade.percentageScore;
                              assessmentCount++;
                            }
                          }
                          
                          if (assessmentCount > 0) {
                            const assessmentAverage = assessmentTotal / assessmentCount;
                            totalWeightedGrade += (assessmentAverage * categoryWeight);
                            totalWeight += categoryWeight;
                          }
                        }
                      }
                    }
                  }

                  if (totalWeight > 0) {
                    courseGrade = totalWeightedGrade / totalWeight;
                    
                    const gradingScale = course.gradingScale || "percentage";
                    if (gradingScale === "gpa" || (gradingScale === "percentage" && courseGrade > 4.0)) {
                      courseGrade = gradingScale === "percentage" ? (courseGrade / 100) * 4.0 : courseGrade;
                    }
                  }
                }
                // If no grades yet, courseGrade remains 0.00
              } catch (error) {
                console.error('Error getting course grade:', error);
              }
            }

            return {
              ...course,
              progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
              currentGrade: courseGrade,
              hasGrades: hasGrades,
            };
          } catch (error) {
            return {
              ...course,
              progress: 0,
              currentGrade: 0.00,
              hasGrades: false,
            };
          }
        });

        const coursesWithProgress = await Promise.all(coursesWithProgressPromises);

        

        setCourses(coursesWithProgress);
        setIsLoading(false);
        setIsLoadingCourses(false);
      } catch (error) {
        console.error('Error loading courses and grades:', error);
        setIsLoading(false);
        setIsLoadingCourses(false);
      }
    },
    [currentUser, isLoadingCourses] // Add isLoadingCourses to dependencies
  );

  useEffect(() => {
    if (selectedCourse && currentUser) {
    }
  }, [selectedCourse, currentUser]);

  const refreshGrades = async () => {
    if (courses.length > 0) {
      await loadAllGrades(courses);
    }
  };

  useEffect(() => {
    if (
      courses.length > 0 &&
      Object.keys(grades).length === 0 &&
      activeTab === "overview"
    ) {
      loadAllGrades(courses);
    }
  }, [courses.length, activeTab, loadAllGrades]);

  // Load grades when switching to goals tab
  useEffect(() => {
    if (activeTab === "goals" && courses.length > 0 && Object.keys(grades).length === 0) {
      loadAllGrades(courses);
    }
  }, [activeTab, courses.length, Object.keys(grades).length, loadAllGrades]);

  useEffect(() => {
    // Only set initial tab on first load, not on every courses update
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }

    if (initialTab === "grades") {
      const path = window.location.pathname;
      if (path.startsWith("/dashboard/course/")) {
        const courseId = path.split("/")[3];
        if (courseId && courses.length > 0) {
          const course = courses.find((c) => c.id === courseId);
          if (course) {
            setSelectedCourse(course);
          }
        }
      }
    }
  }, [initialTab, courses.length, activeTab]);

  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      
      if (path === "/dashboard") {
        setActiveTab("overview");
      } else if (path.startsWith("/dashboard/")) {
        const tab = path.split("/")[2];
         if (["courses", "goals", "reports", "calendar", "settings"].includes(tab)) {
           setActiveTab(tab);
           // Clear selected course when navigating to goals, reports, calendar, or settings
           if (tab === "goals" || tab === "reports" || tab === "calendar" || tab === "settings") {
            setSelectedCourse(null);
            // Also close course manager when navigating to these tabs
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
        } else if (tab === "course") {
          const courseId = path.split("/")[3];
          if (courseId) {
            const course = courses.find((c) => c.id === courseId);
            if (course) {
              setPreviousRoute(window.location.pathname); // Store current route before navigation
              setSelectedCourse(course);
              setActiveTab("grades");
            }
          }
        }
      }
    };

    // Only add the event listener, don't call handlePopState immediately
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [courses.length, isCourseManagerExpanded]);

  useEffect(() => {
    if (selectedCourse) {
      setIsCourseManagerExpanded(true);
      setIsOpeningOverlay(true);
    }
  }, [selectedCourse]);

  const handleCourseUpdate = (updatedCourses) => {
    // Preserve progress data when updating courses
    setCourses(prevCourses => {
      // Safety check: if updatedCourses is undefined, return current courses
      if (!updatedCourses || !Array.isArray(updatedCourses)) {
        console.warn('handleCourseUpdate called with invalid updatedCourses:', updatedCourses);
        return prevCourses;
      }
      
      return updatedCourses.map(updatedCourse => {
        const existingCourse = prevCourses.find(c => c.id === updatedCourse.id);
        if (existingCourse) {
          // Preserve progress, currentGrade, and hasGrades from existing course
          return {
            ...updatedCourse,
            progress: existingCourse.progress,
            currentGrade: existingCourse.currentGrade,
            hasGrades: existingCourse.hasGrades
          };
        }
        // For new courses, set default values
        return {
          ...updatedCourse,
          progress: 0,
          currentGrade: 0.00,
          hasGrades: false
        };
      });
    });
    
    if (
      selectedCourse &&
      !updatedCourses.find((c) => c.id === selectedCourse.id)
    ) {
      setSelectedCourse(null);
    }
  };

  const handleGradeUpdate = (updatedData) => {
    // Safety check: ensure updatedData is not null/undefined
    if (!updatedData) {
      console.warn("handleGradeUpdate called with null/undefined data");
      return;
    }

    if (
      updatedData &&
      typeof updatedData === "object" &&
      updatedData.id &&
      updatedData.name
    ) {
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === updatedData.id ? updatedData : course
        )
      );

      if (selectedCourse && selectedCourse.id === updatedData.id) {
        setSelectedCourse(updatedData);
      }
    } else {
      setGrades((prevGrades) => {
        const mergedGrades = { ...prevGrades };

        Object.keys(updatedData).forEach((categoryId) => {
          if (updatedData[categoryId] && updatedData[categoryId].length > 0) {
            mergedGrades[categoryId] = updatedData[categoryId];
          } else if (updatedData[categoryId] && updatedData[categoryId].length === 0) {
            // Category is empty (all grades deleted)
            mergedGrades[categoryId] = [];
          }
        });

        // Recalculate progress for ALL courses with the updated grades
        setCourses(prevCourses => {
          // Process courses asynchronously and update state when complete
          Promise.all(prevCourses.map(async (course) => {
            try {
              // Calculate progress using the same logic as loadAllGrades
              let progress = 0;
              let courseGrade = 0.00; // Default to 0.00 instead of "Ongoing"
              let hasGrades = false;

              if (course.categories && course.categories.length > 0) {
                // Calculate progress using centralized service
                progress = calculateCourseProgress(course, course.categories, mergedGrades);
                
                // Check if course has any grades to determine hasGrades
                hasGrades = course.categories.some(category => 
                  category.assessments && category.assessments.some(assessment =>
                    assessment.grades && assessment.grades.length > 0 &&
                    assessment.grades.some(grade => 
                      grade.percentageScore !== null && grade.percentageScore !== undefined
                    )
                  )
                );

                // Always try to get course grade, even if no grades yet
                try {
                  // Try to get course grade from the course data first
                  if (course.courseGpa && course.courseGpa > 0) {
                    courseGrade = course.courseGpa;
                  } else if (course.currentGrade && typeof course.currentGrade === 'number') {
                    courseGrade = course.currentGrade;
                  } else if (hasGrades) {
                    // Calculate from assessments only if there are actual grades
                    let totalWeightedGrade = 0;
                    let totalWeight = 0;

                    for (const category of course.categories) {
                      if (category.assessments && category.assessments.length > 0) {
                        for (const assessment of category.assessments) {
                          if (assessment.grades && assessment.grades.length > 0) {
                            const categoryWeight = category.weight || 0;
                            
                            let assessmentTotal = 0;
                            let assessmentCount = 0;
                            
                            for (const grade of assessment.grades) {
                              if (grade.percentageScore !== null && grade.percentageScore !== undefined) {
                                assessmentTotal += grade.percentageScore;
                                assessmentCount++;
                              }
                            }
                            
                            if (assessmentCount > 0) {
                              const assessmentAverage = assessmentTotal / assessmentCount;
                              totalWeightedGrade += (assessmentAverage * categoryWeight);
                              totalWeight += categoryWeight;
                            }
                          }
                        }
                      }
                    }

                    if (totalWeight > 0) {
                      courseGrade = totalWeightedGrade / totalWeight;
                      
                      const gradingScale = course.gradingScale || "percentage";
                      if (gradingScale === "gpa" || (gradingScale === "percentage" && courseGrade > 4.0)) {
                        courseGrade = gradingScale === "percentage" ? (courseGrade / 100) * 4.0 : courseGrade;
                      }
                    }
                  }
                  // If no grades yet, courseGrade remains 0.00
                } catch (error) {
                  console.error('Error getting course grade:', error);
                }
              }

              return {
                ...course,
                progress: isNaN(progress) || !isFinite(progress) ? 0 : progress,
                currentGrade: courseGrade,
                hasGrades: hasGrades,
              };
            } catch (error) {
              return {
                ...course,
                progress: 0,
                currentGrade: 0.00,
                hasGrades: false,
              };
            }
          })).then(updatedCourses => {
            // Update the courses state with recalculated progress
            setCourses(updatedCourses);
          }).catch(error => {
            console.error('🔄 [MainDashboard] handleGradeUpdate Error recalculating course progress:', error);
          });

          // Don't return anything - let the async update handle the state change
          return prevCourses;
        });

        return mergedGrades;
      });
    }
  };

  const handleCourseNavigation = (course) => {
    // Only update previous values if we're not coming from sidebar
    // This prevents overriding values set by sidebar expansion
    if (!isFromSidebar) {
      setPreviousTab(activeTab);
      setPreviousRoute(window.location.pathname);
    }
    
    setSelectedCourse(course);

    setActiveTab("grades");

    navigate(`/dashboard/course/${course.id}`);

    setIsOpeningOverlay(true);
    setIsCourseManagerExpanded(true);
  };

  const handleBackFromCourse = () => {
    setSelectedCourse(null);

    // Navigate back to the previous route
    navigate(previousRoute);
    
    // Update active tab based on the previous tab (more reliable than parsing route)
    setActiveTab(previousTab);
    
    // Reset sidebar flag
    setIsFromSidebar(false);
    
    // Refresh course data to get updated progress after assessment changes
    if (currentUser?.email) {
      loadCoursesAndGrades();
    }
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "overview" || tab === "reports" || tab === "calendar" || tab === "goals" || tab === "settings") {
      setSelectedCourse(null);
      // Also close course manager when switching to these tabs
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

    if (tab === "courses" && !selectedCourse) {
      setIsOpeningOverlay(true);
      setIsCourseManagerExpanded(true);
      // Refresh course data when opening course manager to ensure up-to-date progress
      if (currentUser?.email) {
        loadCoursesAndGrades();
      }
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

    if (tab === "overview") {
      navigate("/dashboard");
      // Refresh course data when returning to overview to ensure up-to-date progress
      if (currentUser?.email) {
        loadCoursesAndGrades();
      }
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {}
  };

  const handleToggleArchived = (checked) => {
    setShowArchivedCourses(checked);
  };

  const calculateOverallGPA = () => {
    // UI-only stub: calculations removed during cleanup
    return 0;
  };

  const overallGPA = isLoading ? 0 : calculateOverallGPA();

  return (
    <div>
      {/* ========================================
          MOBILE MENU BUTTONS
          ======================================== */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        {/* ========================================
            MOBILE SIDEBAR TOGGLE BUTTON
            ======================================== */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-[#8168C5] text-white p-2 rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* ========================================
          MOBILE COURSE LIST BUTTON
          ======================================== */}
      <div className="lg:hidden fixed top-4 right-4 z-30">
        {/* ========================================
            MOBILE COURSE LIST TOGGLE BUTTON
            ======================================== */}
        <button
          onClick={() => setIsMobileCourseListOpen(!isMobileCourseListOpen)}
          className="bg-[#8168C5] text-white p-2 rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </button>
      </div>

      {/* ========================================
          SIDEBAR LAYOUT
          ======================================== */}
      <div className="flex min-h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0 fixed left-0 top-0 h-screen z-20">
          <Sidebar 
            activeTab={activeTab} 
            onTabClick={handleTabChange}
            onLogout={handleLogout}
            displayName={displayName}
             tabs={[
               { id: "overview", label: "Overview", icon: FaTachometerAlt },
               { id: "courses", label: "Courses", icon: FaBook },
               { id: "goals", label: "Goals", icon: FaBullseye },
               { id: "reports", label: "Reports", icon: FaClipboardList },
               { id: "calendar", label: "Calendar", icon: FaCalendarAlt },
               { id: "settings", label: "Settings", icon: FaCog },
             ]}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed left-0 top-0 h-screen w-full bg-gradient-to-b from-[#8168C5] to-[#3E325F] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========================================
                  MOBILE SIDEBAR CLOSE BUTTON
                  ======================================== */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full max-w-sm mx-auto">
                {/* ========================================
                    MOBILE SIDEBAR CONTENT
                    ======================================== */}
                <div className="w-full h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-center items-center px-8 py-6 z-10 rounded-2xl overflow-hidden">
                  <div className="space-y-8 w-full">
                    {/* ========================================
                        MOBILE SIDEBAR LOGO SECTION
                        ======================================== */}
                    <div className="flex flex-col items-center justify-center text-2xl font-bold mb-8">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3">
                        <span className="text-[#8168C5] text-2xl font-bold">
                          GG
                        </span>
                      </div>
                      <h2 className="text-3xl">Grade Goal</h2>
                    </div>

                    {/* ========================================
                        MOBILE SIDEBAR NAVIGATION ITEMS
                        ======================================== */}
                    <div className="flex flex-col items-center space-y-6 w-full">
                      {[
                        {
                          icon: <FaTachometerAlt />,
                          label: "Dashboard",
                          tab: "overview",
                        },
                        { icon: <FaBook />, label: "Courses", tab: "courses" },
                        { icon: <FaBullseye />, label: "Goals", tab: "goals" },
                        {
                          icon: <FaClipboardList />,
                          label: "Reports",
                          tab: "reports",
                        },
                         {
                           icon: <FaCalendarAlt />,
                           label: "Calendar",
                           tab: "calendar",
                         },
                         {
                           icon: <FaCog />,
                           label: "Settings",
                           tab: "settings",
                         },
                       ].map((item) => (
                        <div
                          key={item.tab}
                          className={`flex items-center justify-center p-4 rounded-xl cursor-pointer w-full transition-all duration-300 ${
                            activeTab === item.tab
                              ? "bg-white/20 text-white shadow-lg scale-105"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => {
                            handleTabChange(item.tab);
                            setIsMobileSidebarOpen(false);
                          }}
                        >
                          <div className="text-2xl mr-3">{item.icon}</div>
                          <span className="text-xl font-medium">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            MAIN CONTENT AREA
            ======================================== */}
        <div
          className={`flex-1 flex flex-col bg-gray-100 min-h-screen overflow-y-auto relative ${
            // Desktop margins
            "lg:ml-64" +
            (activeTab !== "courses"
              ? isCourseManagerExpanded
                ? " lg:mr-[340px]"
                : " lg:mr-80"
              : "")
          }`}
        >
          {isLoading ? (
            <></>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="w-full">
                  <Dashboard
                    courses={courses}
                    grades={grades}
                    overallGPA={overallGPA}
                    onSearch={(query) => {}}
                  />
                </div>
              )}

              {activeTab === "courses" && !isCourseManagerExpanded && (
                <div className="w-full p-6 bg-gray-100">
                  <CourseManager
                    key={`courses-${Object.keys(grades).length}-${
                      courses.length
                    }`}
                    onCourseSelect={handleCourseNavigation}
                    onCourseUpdate={handleCourseUpdate}
                    courses={courses}
                    grades={grades}
                  />
                </div>
              )}

              {activeTab === "goals" && (
                <div className="w-full h-screen bg-gray-100 overflow-y-auto">
                  <GoalSetting
                    userEmail={currentUser?.email}
                    courses={courses}
                    grades={grades}
                  />
                </div>
              )}

              {activeTab === "reports" && (
                <div className="w-full bg-gray-100">
                  <Report />
                </div>
              )}

               {activeTab === "calendar" && (
                 <div className="w-full p-6 bg-gray-100 flex  min-h-screen">
                   <MyCalendar/>
                 </div>
               )}

               {activeTab === "settings" && (
                 <div className="w-full">
                   <UserSettings />
                 </div>
               )}
            </>
          )}
        </div>

        {/* ========================================
            DESKTOP SIDE COURSE LIST
            ======================================== */}
        {activeTab !== "courses" && (
          <div
            className={`hidden lg:block fixed right-0 top-0 h-screen z-10 transition-all duration-500 ease-in-out animate-slideIn ${
              isCourseManagerExpanded ? "w-[340px]" : "w-80"
            }`}
          >
            {/* Side Course List Component */}
            <SideCourseList
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseClick={handleCourseNavigation}
              showArchivedCourses={showArchivedCourses}
              setShowArchivedCourses={setShowArchivedCourses}
              isMobileCourseListOpen={isMobileCourseListOpen}
              setIsMobileCourseListOpen={setIsMobileCourseListOpen}
              isExpanded={isCourseManagerExpanded}
              onToggleExpanded={() => {
                if (!isCourseManagerExpanded) {
                  // Store current tab and route when expanding course manager
                  setPreviousTab(activeTab);
                  setPreviousRoute(window.location.pathname);
                  setIsFromSidebar(true); // Mark that we're coming from sidebar
                  setIsOpeningOverlay(true);
                  setIsCourseManagerExpanded(true);
                } else {
                  setIsClosingOverlay(true);
                  setTimeout(() => {
                    setIsCourseManagerExpanded(false);
                    setIsClosingOverlay(false);
                    setIsFromSidebar(false); // Reset sidebar flag
                  }, 500);
                }
              }}
            />
          </div>
        )}

        {/* ========================================
            MOBILE COURSE LIST OVERLAY
            ======================================== */}
        {isMobileCourseListOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed right-0 top-0 h-full w-full bg-gradient-to-b from-[#8168C5] to-[#3E325F] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========================================
                  MOBILE COURSE LIST CLOSE BUTTON
                  ======================================== */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => setIsMobileCourseListOpen(false)}
                  className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full max-w-sm mx-auto">
                {/* ========================================
                    MOBILE COURSE LIST CONTENT
                    ======================================== */}
                <div className="w-full h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-start items-center px-6 py-8 z-10 rounded-2xl overflow-hidden">
                  <div className="w-full space-y-6">
                    {/* ========================================
                        MOBILE COURSE LIST HEADER
                        ======================================== */}
                    <div className="flex flex-col items-center justify-center mb-8">
                      <div className="flex items-center mb-4">
                        <span className="w-2 h-8 bg-[#D1F310] rounded-full mr-3"></span>
                        <h2 className="text-3xl font-semibold">Course List</h2>
                      </div>

                      {/* ========================================
                          ARCHIVED COURSES TOGGLE
                          ======================================== */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={showArchivedCourses}
                          onChange={(e) =>
                            setShowArchivedCourses(e.target.checked)
                          }
                          className="w-4 h-4 text-[#8168C5] bg-gray-100 border-gray-300 rounded focus:ring-[#8168C5] focus:ring-2"
                        />
                        <span className="text-sm text-white/80 font-medium">
                          Show Archived Courses
                        </span>
                      </div>
                    </div>

                    {/* ========================================
                        COURSE COUNT DISPLAY
                        ======================================== */}
                    <div className="text-center mb-4">
                      <span className="text-sm text-white/60">
                        {
                          courses.filter((course) =>
                            showArchivedCourses
                              ? true
                              : course.isActive !== false
                          ).length
                        }{" "}
                        of {courses.length} courses
                      </span>
                    </div>

                    {/* ========================================
                        COURSES LIST CONTAINER
                        ======================================== */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {courses.length === 0 ? (
                        <div className="text-center text-white/60 py-8">
                          <p>No courses added yet</p>
                          <p className="text-sm">
                            Add courses to see them here
                          </p>
                        </div>
                      ) : (
                        courses
                          .filter((course) =>
                            showArchivedCourses
                              ? true
                              : course.isActive !== false
                          )
                          .map((course) => {
                            const isSelected =
                              selectedCourse && selectedCourse.id === course.id;
                            const colorScheme = getCourseColorScheme(
                              course.name,
                              course.colorIndex || 0
                            );

                            // Calculate course progress and grade
                            let totalProgress = course.progress || 0;
                            let courseGrade = course.currentGrade || "Ongoing";
                            let hasGrades = course.hasGrades || false;
                            let isOngoing = !hasGrades;

                            // Ensure progress is valid
                            if (
                              isNaN(totalProgress) ||
                              !isFinite(totalProgress)
                            ) {
                              totalProgress = 0;
                            }

                            return (
                              <div
                                key={course.id}
                                className={`relative overflow-hidden bg-gradient-to-br ${
                                  colorScheme.gradient
                                } text-white p-4 mx-3 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                                  isSelected
                                    ? `ring-2 ring-white ring-opacity-50`
                                    : ""
                                }`}
                                onClick={() => {
                                  handleCourseNavigation(course);
                                  setIsMobileCourseListOpen(false);
                                }}
                              >
                                {/* Course Code and Grade Badge */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-white/80">
                                    {course.courseCode ||
                                      course.name.substring(0, 8).toUpperCase()}
                                  </span>
                                  <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                      course.isActive === false
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                        : hasGrades
                                        ? `bg-gradient-to-r ${colorScheme.gradeGradient} text-white`
                                        : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                                    }`}
                                  >
                                    {course.isActive === false
                                      ? "ARCHIVED"
                                      : hasGrades
                                      ? typeof courseGrade === "number"
                                        ? courseGrade.toFixed(1)
                                        : courseGrade
                                      : "Ongoing"}
                                  </span>
                                </div>

                                {/* Course Name */}
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-medium text-white">
                                    {course.name}
                                  </h3>
                                  <div className="flex items-center gap-1 text-white/60 text-xs">
                                    <span>View Details</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center">
                                  <span className="text-sm text-white/80 mr-2">
                                    Progress:
                                  </span>
                                  <div className="flex-1 bg-white/20 rounded-full h-2.5 mr-2">
                                    <div
                                      className={`h-2.5 rounded-full transition-all duration-300 ${
                                        course.isActive === false
                                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                          : `bg-gradient-to-r ${colorScheme.progressGradient}`
                                      }`}
                                      style={{ width: `${totalProgress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-white">
                                    {isOngoing && totalProgress === 0
                                      ? "Ongoing"
                                      : `${Math.round(totalProgress)}%`}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            COURSE MANAGER OVERLAY
            ======================================== */}
        {(isCourseManagerExpanded || selectedCourse) && (
          <div
            className={`fixed inset-0 bg-gray-100 z-50 transition-all duration-500 ease-in-out ${
              isClosingOverlay
                ? "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
            style={{
              transform: isOpeningOverlay
                ? "translateX(100%)"
                : "translateX(0)",
              opacity: isOpeningOverlay ? 0 : 1,
            }}
          >
            {selectedCourse ? (
              <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0 [&>*]:w-full [&>*]:h-full">
                <GradeEntry
                  course={selectedCourse}
                  onGradeUpdate={handleGradeUpdate}
                  onBack={handleBackFromCourse}
                  onNavigateToCourse={handleCourseNavigation}
                  onClearSelectedCourse={() => setSelectedCourse(null)}
                  onCloseCourseManager={() => {
                    if (isCourseManagerExpanded) {
                      setIsClosingOverlay(true);
                      setTimeout(() => {
                        setIsCourseManagerExpanded(false);
                        setIsClosingOverlay(false);
                      }, 500);
                    } else {
                      setIsCourseManagerExpanded(false);
                    }
                  }}
                  onCourseDataRefresh={() => {
                    if (currentUser?.email) {
                      loadCoursesAndGrades();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto bg-gray-50">
                <div className="w-full h-full [&>*]:max-w-none [&>*]:mx-0 [&>*]:min-h-0">
                  <CourseManager
                    key={`courses-expanded-${Object.keys(grades).length}-${
                      courses.length
                    }`}
                    onCourseSelect={handleCourseNavigation}
                    onCourseUpdate={handleCourseUpdate}
                    onBack={() => {
                      setIsClosingOverlay(true);
                      setTimeout(() => {
                        setIsCourseManagerExpanded(false);
                        setIsClosingOverlay(false);
                        handleTabChange("overview");
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
