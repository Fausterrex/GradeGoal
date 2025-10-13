// ========================================
// GRADE ENTRY COMPONENT (REFACTORED)
// ========================================
// Main component that orchestrates all the course detail components

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "../../services/useAchievements";
import AddCourse from "../../modals/AddCourse";
import GradeSuccessFeedback from "../../modals/GradeSuccessFeedback";
import ConfirmationModal from "../../modals/ConfirmationModal";
// Import the new components
import MainHeader from "./MainHeader";
import SuccessMessage from "./SuccessMessage";
import ArchivedWarning from "./ArchivedWarning";
import AssessmentCategories from "./assessments/AssessmentCategories";
import AssessmentModal from "../../modals/AssessmentModal";
import AddScoreModal from "../../modals/AddScoreModal";
import EditScoreModal from "../../modals/EditScoreModal";
import Dashboard from "./dashboard/Dashboard";
import SemesterTermTabs from "./SemesterTermTabs";
// Import utility functions
import { 
  calculateAndStoreCourseGrade,
  calculateCategoryAverage,
  calculateGPAForPercentage,
} from "./utils/gradeEntryCalculations";
import {
  loadCourseGrades,
  loadAssessmentCategories,
  getUserIdFromEmail,
  saveGradeWithCalculation,
  createNewAssessment,
  updateExistingAssessment,
  deleteAssessment,
  awardPointsAndCheckAchievements,
  updateGradesState,
} from "./utils/gradeEntryDataStore";
import { getCourseById, calculateCategoryGrade } from "../../../backend/api";
import {
  validateScore,
  prepareGradeData,
  prepareAssessmentData,
  createSavedGradeData,
  getInitialGradeState,
  getInitialScoreState,
  assessmentHasScore,
} from "./utils/gradeEntryAssessments";
import { generateAssessmentName } from "./assessments/AssessmentUtils";
import RealtimeNotificationService from "../../services/realtimeNotificationService";
import { calculateCourseProgress } from "../../services/progressCalculationService";
import {
  getCourseColors,
  loadCourseTargetGrade,
  getCourseStatistics,
  getCourseStatisticsByTerm,
  isCourseArchived,
  getCourseDisplayName,
} from "./utils/gradeEntryCourse";
import {
  createScoreSubmitHandler,
  createEditScoreSubmitHandler,
  createAssessmentSubmitHandler,
  createDeleteAssessmentHandler,
  createAddAssessmentHandler,
  createAssessmentClickHandler,
  createEditScoreClickHandler,
  createEditAssessmentHandler,
  createCourseEditHandler,
  createCourseUpdateHandler,
  createCancelHandler,
  createViewToggleHandler,
  createSuccessFeedbackHandlers,
} from "./utils/gradeEntryHandlers";
function GradeEntry({ course, onGradeUpdate, onBack, onNavigateToCourse, onClearSelectedCourse, onCloseCourseManager, onCourseDataRefresh }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Initialize achievement checking hook
  const { checkForAchievements } = useAchievements(currentUser?.userId);

  // Debug log when GradeEntry component mounts/renders
  useEffect(() => {
  }, [course]);

  // Sync local course state with prop changes
  useEffect(() => {
    setLocalCourse(course);
  }, [course]);

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [grades, setGrades] = useState({});
  const [categories, setCategories] = useState([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newGrade, setNewGrade] = useState(getInitialGradeState('MIDTERM')); // Will be updated when activeSemesterTerm changes
  const [editingGrade, setEditingGrade] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [lastSavedGrade, setLastSavedGrade] = useState(null);
  const [targetGrade, setTargetGrade] = useState(null);
  const [userId, setUserId] = useState(null);
  const [scoreExtraCredit, setScoreExtraCredit] = useState(false);
  const [scoreExtraCreditPoints, setScoreExtraCreditPoints] = useState("");
  const [editScoreExtraCredit, setEditScoreExtraCredit] = useState(false);
  const [editScoreExtraCreditPoints, setEditScoreExtraCreditPoints] = useState("");
  const [showDashboard, setShowDashboard] = useState(true); // Toggle between dashboard and assessments
  const [userProgress, setUserProgress] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [courseGrade, setCourseGrade] = useState(0);
  const [activeSemesterTerm, setActiveSemesterTerm] = useState('MIDTERM');
  const [isMidtermCompleted, setIsMidtermCompleted] = useState(false);
  
  // Local course state that can be updated immediately
  const [localCourse, setLocalCourse] = useState(course);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "edit",
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    showWarning: false,
    warningItems: [],
    showTip: false,
    tipMessage: "",
    onConfirm: null,
    onClose: null,
  });

  // ========================================
  // EFFECTS AND DATA LOADING
  // ========================================
  useEffect(() => {
    if (course && currentUser) {
      loadCategories();
      loadUserAndTargetGrade();
      loadMidtermStatus();
    }
  }, [course, currentUser]);

  // Load user progress when userId becomes available
  useEffect(() => {
    if (userId && course && currentUser) {
      loadUserProgress();
    }
  }, [userId, course, currentUser]);

  // Update course grade when grades or categories change
  useEffect(() => {
    if (course && categories.length > 0) {
      // Add a small delay to ensure database calculations have completed
      const timer = setTimeout(() => {
        updateCourseGrade();
      }, 500); // 500ms delay to allow database to finish calculations
      return () => clearTimeout(timer);
    }
  }, [grades, categories, course]);

  useEffect(() => {
    if (course && currentUser) {
      loadGrades();
    }
  }, [course, currentUser]);

  // Update newGrade semesterTerm when activeSemesterTerm changes
  useEffect(() => {
    setNewGrade(prev => ({
      ...prev,
      semesterTerm: activeSemesterTerm
    }));
  }, [activeSemesterTerm]);

  // Load analytics when grades or categories change
  useEffect(() => {
    if (userId && course && Object.keys(grades).length > 0 && categories.length > 0) {
      loadUserAnalytics();
    }
  }, [userId, course, grades, categories, targetGrade]);

  // Listen for analytics refresh events (triggered after assessment deletion)
  useEffect(() => {
    const handleRefreshAnalytics = (event) => {
      const { courseId, userId: eventUserId } = event.detail;
      // Only refresh if the event is for this course and user
      if (courseId === course?.id && eventUserId === userId) {
        loadUserAnalytics();
      }
    };

    window.addEventListener('refreshAnalytics', handleRefreshAnalytics);
    
    return () => {
      window.removeEventListener('refreshAnalytics', handleRefreshAnalytics);
    };
  }, [course?.id, userId]);

  // Update course grade when grades change
  useEffect(() => {
    if (course && Object.keys(grades).length > 0) {
      updateCourseGrade();
    }
  }, [grades, course]);

  // Monitor userId changes
  useEffect(() => {
    // userId state updated
  }, [userId]);

  // Auto-generate name when category changes
  useEffect(() => {
    if (newGrade.categoryId && !newGrade.name) {
      const generatedName = generateAssessmentName(
        newGrade.categoryId,
        categories,
        grades
      );

      setNewGrade(prev => ({ ...prev, name: generatedName }));
    }
  }, [newGrade.categoryId, categories, grades]);

  // ========================================
  // DATA LOADING FUNCTIONS
  // ========================================
  const loadUserAndTargetGrade = async () => {
    try {
      const userResult = await getUserIdFromEmail(currentUser.email);
      if (userResult.success) {
        setUserId(userResult.userId);
        
        const targetResult = await loadCourseTargetGrade(userResult.userId, course.courseId);
        if (targetResult.success && targetResult.targetGrade) {
          setTargetGrade(targetResult.targetGrade);
        }
      }
    } catch (error) {
      console.error("Error loading target grade:", error);
    }
  };

  const loadMidtermStatus = async () => {
    try {
      // Check if midterm is completed from the course data
      if (course.isMidtermCompleted) {
        setIsMidtermCompleted(true);
        setActiveSemesterTerm('FINAL_TERM');
      } else {
        setIsMidtermCompleted(false);
        setActiveSemesterTerm('MIDTERM');
      }
    } catch (error) {
      console.error("Error loading midterm status:", error);
    }
  };

  const handleTermChange = (term) => {
    // Only allow switching to final term if midterm is completed
    if (term === 'FINAL_TERM' && !isMidtermCompleted) {
      return; // Don't allow switching to final term if midterm is not completed
    }
    setActiveSemesterTerm(term);
  };

  const markMidtermAsDone = async () => {
    try {
      const response = await fetch(`/api/database-calculations/course/${course.courseId}/mark-midterm-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsMidtermCompleted(true);
        setActiveSemesterTerm('FINAL_TERM');
        setSuccessMessage("Midterm marked as completed! Final Term is now unlocked.");
        
        // Update the local course state immediately for instant UI update
        setLocalCourse(prevCourse => ({ ...prevCourse, isMidtermCompleted: true }));
        
        // Refresh course data and grades
        if (onGradeUpdate) {
          onGradeUpdate();
        }
        
        // Refresh the course data in the parent component
        if (onCourseDataRefresh) {
          onCourseDataRefresh();
        }
      } else {
        console.error("Failed to mark midterm as completed");
      }
    } catch (error) {
      console.error("Error marking midterm as completed:", error);
    }
  };

  const loadGrades = async () => {
    const result = await loadCourseGrades(course.id);
    if (result.success) {
      setGrades(result.grades);
    }
  };

  const loadCategories = async () => {
    const result = await loadAssessmentCategories(course.id);
    if (result.success) {
      setCategories(result.categories);
    } else if (course.categories && course.categories.length > 0) {
        setCategories(course.categories);
    }
  };

  const loadUserProgress = async () => {
    try {
      if (!userId) {
        return;
      }
      
      // Fetch user progress with accurate GPA values
      const response = await fetch(`/api/user-progress/${userId}/with-gpas`);
      if (response.ok) {
        const progressData = await response.json();
        setUserProgress(progressData);
      } else {
        // Fallback to default values if API fails
        setUserProgress({ 
          currentLevel: 1, 
          totalPoints: 0, 
          streakDays: 0,
          semesterGpa: 0.00,
          cumulativeGpa: 0.00
        });
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
      // Fallback to default values on error
      setUserProgress({ 
        currentLevel: 1, 
        totalPoints: 0, 
        streakDays: 0,
        semesterGpa: 0.00,
        cumulativeGpa: 0.00
      });
    }
  };

  const loadUserAnalytics = async () => {
    try {
      if (!userId || !course) {
        return;
      }

      // Check if there are any grades at all before calculating analytics
      const hasAnyGrades = Object.values(grades).some(
        (categoryGrades) =>
          Array.isArray(categoryGrades) && categoryGrades.length > 0
      );

      if (!hasAnyGrades) {
        // No grades, set default analytics as empty array
        setUserAnalytics([]);
        return;
      }
      
      // Load analytics from database
      const analyticsResponse = await fetch(`/api/database-calculations/user/${userId}/analytics/${course.courseId}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setUserAnalytics(analyticsData);
      } else {
        // Fallback to empty array
        setUserAnalytics([]);
      }

    } catch (error) {
      console.error("Error loading user analytics:", error);
      // Set empty array on error
      setUserAnalytics([]);
    }
  };

  // ========================================
  // CALCULATION FUNCTIONS
  // ========================================
  const getCategoryAverage = async (categoryId) => {
    try {
      // Use the same API call as AssessmentCategories but with term parameter
      const result = await calculateCategoryGrade(categoryId, activeSemesterTerm);
      if (result.success) {
        return parseFloat(result.categoryGrade);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const updateCourseGrade = async () => {
    if (!course?.id) return;
    
    try {
      // Get the course GPA directly from the course_gpa column
      const courseData = await getCourseById(course.id);
      if (courseData && courseData.courseGpa !== null && courseData.courseGpa !== undefined) {
        setCourseGrade(courseData.courseGpa);
      } else {
        // Fallback: trigger calculation if course_gpa is null
        const result = await calculateAndStoreCourseGrade(course.id);
        if (result.success && result.gpa !== undefined) {
          setCourseGrade(result.gpa);
        }
        }
      } catch (error) {
      console.error('Failed to update course grade:', error);
    }
  };

  const getTotalAssessments = () => {
    const stats = getCourseStatisticsByTerm(categories, grades, activeSemesterTerm);
    return stats.totalAssessments;
  };

  const getProgressPercentage = () => {
    // Use centralized progress calculation service with local course state
    return calculateCourseProgress(localCourse, categories, grades);
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  // Create handler using utility function
  const handleSubmit = createAssessmentSubmitHandler(
    newGrade,
    editingGrade,
    grades,
    setGrades,
    setNewGrade,
    setShowAddGrade,
    setEditingGrade,
    setSuccessMessage,
    onGradeUpdate,
    course,
    activeSemesterTerm
  );

  // Create handler using utility function
  const handleAssessmentClick = createAssessmentClickHandler(setSelectedGrade, setShowScoreInput);
  

  // Create handler using utility function
  const handleScoreSubmit = createScoreSubmitHandler(
    selectedGrade,
    scoreExtraCredit,
    scoreExtraCreditPoints,
    userId,
    currentUser,
    course,
    grades,
    setGrades,
    setLastSavedGrade,
    setShowSuccessFeedback,
    setShowScoreInput,
    setSelectedGrade,
    setScoreExtraCredit,
    setScoreExtraCreditPoints,
    onGradeUpdate,
    checkForAchievements
  );

  // Create handler using utility function
  const handleEditScore = createEditScoreClickHandler(
    setSelectedGrade,
    setEditScoreExtraCredit,
    setEditScoreExtraCreditPoints,
    setShowEditScore
  );

  // Create handler using utility function
  const handleAddAssessment = createAddAssessmentHandler(setNewGrade, setShowAddGrade);

  // Create handler using utility function
  const handleEditCourseClick = createCourseEditHandler(course, setEditingCourse, setShowEditCourse);

  // Use the onBack prop from MainDashboard to handle proper state management
  const handleBackToCourses = () => {
    if (onBack) {
      onBack(); // Use the proper back handler from MainDashboard
    } else {
      // Fallback to direct navigation if onBack is not provided
      navigate('/dashboard/courses');
    }
  };

  // Create handler using utility function
  const handleCourseUpdated = createCourseUpdateHandler(
    course,
    setShowEditCourse,
    setEditingCourse,
    onGradeUpdate
  );

  // Create handler using utility function
  const cancelGradeEdit = createCancelHandler(
    setNewGrade,
    setShowAddGrade,
    setEditingGrade,
    null,
    null,
    null,
    null,
    activeSemesterTerm
  );

  // Create missing handlers using utility functions
  const handleEditAssessment = createEditAssessmentHandler(setEditingGrade, setNewGrade, setShowAddGrade);
  
  const handleDeleteAssessment = createDeleteAssessmentHandler(
    grades,
    setGrades,
    setSuccessMessage,
    setConfirmationModal,
    onGradeUpdate,
    course
  );

  const handleEditScoreSubmit = createEditScoreSubmitHandler(
    selectedGrade,
    editScoreExtraCredit,
    editScoreExtraCreditPoints,
    userId,
    currentUser,
    course,
    grades,
    setGrades,
    setShowEditScore,
    setSelectedGrade,
    setEditScoreExtraCredit,
    setEditScoreExtraCreditPoints,
    onGradeUpdate
  );

  // ========================================
  // RENDER
  // ========================================
  if (!course) return <div>No course selected</div>;

  const totalAssessments = getTotalAssessments();
  const progressPercentage = getProgressPercentage();
  const colorScheme = getCourseColors(course);
  
  // Create view toggle handler
  const handleToggleView = createViewToggleHandler(showDashboard, setShowDashboard);

  // Set up global function for marking midterm as done
  useEffect(() => {
    window.markMidtermAsDone = markMidtermAsDone;
    return () => {
      delete window.markMidtermAsDone;
    };
  }, [markMidtermAsDone]);

  return (
    <div className={`w-full h-full ${colorScheme.light} flex flex-col overflow-y-auto`}>
      <MainHeader
        course={localCourse}
        colorScheme={colorScheme}
        onBack={handleBackToCourses}
        onEditCourseClick={handleEditCourseClick}
        progressPercentage={progressPercentage}
        totalAssessments={totalAssessments}
        showDashboard={showDashboard}
        onToggleView={handleToggleView}
      />

      <SuccessMessage successMessage={successMessage} />

      <div
        className={`w-full ${showDashboard ? 'px-0 py-0' : 'px-8 py-12'} ${
          localCourse.isActive === false ? "opacity-90" : ""
        } flex-1`}
      >
        {localCourse.isActive === false && <ArchivedWarning />}

        {showDashboard ? (
          <div className="w-full">
            <Dashboard
              course={localCourse}
              grades={grades}
              categories={categories}
              targetGrade={targetGrade}
              currentGrade={courseGrade}
              colorScheme={colorScheme}
              userProgress={userProgress}
              userAnalytics={userAnalytics}
              userId={userId}
              activeSemesterTerm={activeSemesterTerm}
              isMidtermCompleted={isMidtermCompleted}
              isCourseCompleted={localCourse?.isCompleted}
              onSetGoal={() => {
                // Clear the selected course and close course manager first, then navigate
                if (onClearSelectedCourse) {
                  onClearSelectedCourse();
                }
                if (onCloseCourseManager) {
                  onCloseCourseManager();
                }
                navigate('/dashboard/goals');
              }}
            />
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto">
            <SemesterTermTabs
              activeTerm={activeSemesterTerm}
              onTermChange={handleTermChange}
              isMidtermCompleted={isMidtermCompleted}
              colorScheme={colorScheme}
              setConfirmationModal={setConfirmationModal}
              isCourseCompleted={localCourse?.isCompleted}
            />
            <AssessmentCategories
              categories={categories}
              grades={grades}
              colorScheme={colorScheme}
              getCategoryAverage={getCategoryAverage}
              onAddAssessment={handleAddAssessment}
              onAssessmentClick={handleAssessmentClick}
              onEditScore={handleEditScore}
              onEditAssessment={handleEditAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              course={localCourse}
              targetGrade={targetGrade}
              activeSemesterTerm={activeSemesterTerm}
              isMidtermCompleted={isMidtermCompleted}
              isCourseCompleted={localCourse?.isCompleted}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AssessmentModal
        isOpen={showAddGrade}
        editingGrade={editingGrade}
        newGrade={newGrade}
        setNewGrade={setNewGrade}
        categories={categories}
        colorScheme={colorScheme}
        onSubmit={handleSubmit}
        onCancel={cancelGradeEdit}
        activeSemesterTerm={activeSemesterTerm}
        isMidtermCompleted={isMidtermCompleted}
      />

      <AddScoreModal
        isOpen={showScoreInput}
        selectedGrade={selectedGrade}
        colorScheme={colorScheme}
        scoreExtraCredit={scoreExtraCredit}
        setScoreExtraCredit={setScoreExtraCredit}
        scoreExtraCreditPoints={scoreExtraCreditPoints}
        setScoreExtraCreditPoints={setScoreExtraCreditPoints}
        onSubmit={handleScoreSubmit}
        onCancel={createCancelHandler(
          null,
          null,
          null,
          setShowScoreInput,
          setSelectedGrade,
          null,
          (initialState) => {
            setScoreExtraCredit(initialState.scoreExtraCredit);
            setScoreExtraCreditPoints(initialState.scoreExtraCreditPoints);
          },
          activeSemesterTerm
        )}
      />

      <EditScoreModal
        isOpen={showEditScore}
        selectedGrade={selectedGrade}
        colorScheme={colorScheme}
        editScoreExtraCredit={editScoreExtraCredit}
        setEditScoreExtraCredit={setEditScoreExtraCredit}
        editScoreExtraCreditPoints={editScoreExtraCreditPoints}
        setEditScoreExtraCreditPoints={setEditScoreExtraCreditPoints}
        onSubmit={handleEditScoreSubmit}
        onCancel={createCancelHandler(
          null,
          null,
          null,
          null,
          setSelectedGrade,
          setShowEditScore,
          (initialState) => {
            setEditScoreExtraCredit(initialState.editScoreExtraCredit);
            setEditScoreExtraCreditPoints(initialState.editScoreExtraCreditPoints);
          },
          activeSemesterTerm
        )}
      />

      {/* Other components */}
      <AddCourse
        isOpen={showEditCourse}
        onClose={() => {
          setShowEditCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseUpdated}
        editingCourse={editingCourse}
        existingCourses={[localCourse]}
        courseColorScheme={colorScheme}
      />

      {showSuccessFeedback && lastSavedGrade && (
        <GradeSuccessFeedback
          gradeData={lastSavedGrade}
          course={localCourse}
          grades={grades}
          categories={categories}
          onEnterAnother={(categoryId) => {
            setShowSuccessFeedback(false);
            setNewGrade((prev) => ({
              ...prev,
              categoryId: categoryId,
              name: "",
              maxScore: "",
              date: new Date().toISOString().split("T")[0],
              note: "",
            }));
            setEditingGrade(null);
            setShowAddGrade(true);
          }}
          onReturnToCourse={() => {
            setShowSuccessFeedback(false);
            if (onNavigateToCourse) {
              onNavigateToCourse(localCourse);
            } else {
              onBack();
            }
          }}
          onClose={() => {
            setShowSuccessFeedback(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={confirmationModal.onClose}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        showWarning={confirmationModal.showWarning}
        warningItems={confirmationModal.warningItems}
        showTip={confirmationModal.showTip}
        tipMessage={confirmationModal.tipMessage}
      />
    </div>
  );
};

export default GradeEntry;
