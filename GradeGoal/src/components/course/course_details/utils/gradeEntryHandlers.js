// ========================================
// GRADE ENTRY HANDLERS UTILITIES
// ========================================
// This file contains all button handling and event management functions
// Functions: Submit handlers, delete handlers, modal handlers, form handlers

import {
  validateScore,
  prepareGradeData,
  prepareAssessmentData,
  createSavedGradeData,
  getInitialGradeState,
  getInitialScoreState,
  assessmentHasScore,
} from "./gradeEntryAssessments";
import {
  saveGradeWithCalculation,
  createNewAssessment,
  updateExistingAssessment,
  deleteAssessment,
  awardPointsAndCheckAchievements,
  updateGradesState,
  getUserIdFromEmail,
  loadCourseGrades,
} from "./gradeEntryDataStore";
import {
  calculateAndStoreCourseGrade,
} from "./gradeEntryCalculations";
import RealtimeNotificationService from "../../../../services/realtimeNotificationService";

/**
 * Handle score submission for adding new scores to assessments
 */
export const createScoreSubmitHandler = (
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
  checkForAchievements = null
) => {
  return async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.score.value);

    // Validate score using utility function
    const validation = validateScore(score, selectedGrade.maxScore);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Get user ID if not available
      let currentUserId = userId;
      if (!currentUserId && currentUser) {
        const userResult = await getUserIdFromEmail(currentUser.email);
        if (userResult.success) {
          currentUserId = userResult.userId;
        }
      }

      // Prepare grade data using utility function
      const gradeData = prepareGradeData(
        selectedGrade, 
        score, 
        scoreExtraCredit, 
        scoreExtraCreditPoints, 
        currentUserId
      );
      
            // Save grade with calculation using utility function
            const saveResult = await saveGradeWithCalculation(gradeData, currentUserId);
            
            if (!saveResult.success) {
              throw new Error(saveResult.error || 'Failed to save grade');
            }

            // Give the database a moment to process the grade
            await new Promise(resolve => setTimeout(resolve, 100));

            // Calculate and store course grade and GPA using utility function
            if (course?.id) {
              await calculateAndStoreCourseGrade(course.id);
            }

            // Award points and check achievements using utility function
            if (currentUserId) {
              await awardPointsAndCheckAchievements(currentUserId, 10, 'GRADE_ADDED', checkForAchievements);
            }

            // Check if grade alert should be sent (real-time notification)
            if (currentUser && currentUser.email && selectedGrade) {
              const percentage = (score / selectedGrade.maxScore) * 100;
              if (percentage < 70) {
                try {
                  await RealtimeNotificationService.sendGradeAlert(
                    currentUser.email,
                    course.courseName || course.name || 'Unknown Course',
                    selectedGrade.name || selectedGrade.assessmentName || 'Assessment',
                    score,
                    selectedGrade.maxScore
                  );
                  console.log('Grade alert notification sent for low score');
                } catch (error) {
                  console.error('Failed to send grade alert notification:', error);
                }
              }
            }

            // Course completion notifications are now handled by the backend
            // when a course is manually marked as complete via the Course Manager
            console.log('📝 Course completion notifications are handled by the backend when manually marking courses as complete');

      // Update grades state using utility function with complete extra credit data
      const completeGradeUpdate = {
        score: score,
        isExtraCredit: scoreExtraCredit,
        extraCreditPoints: scoreExtraCredit && scoreExtraCreditPoints ? parseFloat(scoreExtraCreditPoints) : null
      };
      
      // First update the local state immediately for responsive UI
      setGrades((prevGrades) => 
        updateGradesState(prevGrades, selectedGrade.categoryId, selectedGrade.id, completeGradeUpdate)
      );

      // Then refresh from database to ensure accuracy (including extra credit data)
      try {
        const refreshResult = await loadCourseGrades(course.id);
        if (refreshResult.success) {
          setGrades(refreshResult.grades);
          
          // Update parent component with fresh data
          if (onGradeUpdate) {
            onGradeUpdate(refreshResult.grades);
          }
        }
      } catch (refreshError) {
        // Fallback to local state update
        if (onGradeUpdate) {
          const updatedGrades = updateGradesState(grades, selectedGrade.categoryId, selectedGrade.id, completeGradeUpdate);
          onGradeUpdate(updatedGrades);
        }
      }

      // Create saved grade data for success feedback using utility function
      const savedGradeData = createSavedGradeData(
        selectedGrade, 
        score, 
        scoreExtraCredit, 
        scoreExtraCreditPoints
      );
      
      setLastSavedGrade(savedGradeData);
      setShowSuccessFeedback(true);

      // Reset form state using utility function
      const initialScoreState = getInitialScoreState();
      setShowScoreInput(false);
      setSelectedGrade(null);
      setScoreExtraCredit(initialScoreState.scoreExtraCredit);
      setScoreExtraCreditPoints(initialScoreState.scoreExtraCreditPoints);
      
    } catch (error) {
      alert("Failed to update score. Please try again.");
    }
  };
};

/**
 * Handle score editing submission for existing assessments
 */
export const createEditScoreSubmitHandler = (
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
) => {
  return async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.editScore.value);

    // Validate score using utility function
    const validation = validateScore(score, selectedGrade.maxScore);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Get user ID if not available
      let currentUserId = userId;
      if (!currentUserId && currentUser) {
        const userResult = await getUserIdFromEmail(currentUser.email);
        if (userResult.success) {
          currentUserId = userResult.userId;
        }
      }

      // Prepare grade data using utility function
      const gradeData = prepareGradeData(
        selectedGrade, 
        score, 
        editScoreExtraCredit, 
        editScoreExtraCreditPoints, 
        currentUserId
      );

            // Save grade with calculation using utility function
            const saveResult = await saveGradeWithCalculation(gradeData, currentUserId);
            
            if (!saveResult.success) {
              throw new Error(saveResult.error || 'Failed to update grade');
            }

            // Calculate and store course grade and GPA using utility function
            if (course?.id) {
              await calculateAndStoreCourseGrade(course.id);
            }

            // Check if grade alert should be sent (real-time notification)
            if (currentUser && currentUser.email && selectedGrade) {
              const percentage = (score / selectedGrade.maxScore) * 100;
              if (percentage < 70) {
                try {
                  await RealtimeNotificationService.sendGradeAlert(
                    currentUser.email,
                    course.courseName || course.name || 'Unknown Course',
                    selectedGrade.name || selectedGrade.assessmentName || 'Assessment',
                    score,
                    selectedGrade.maxScore
                  );
                  console.log('Grade alert notification sent for low score (edit)');
                } catch (error) {
                  console.error('Failed to send grade alert notification:', error);
                }
              }
            }

      // Update grades state using utility function with complete extra credit data
      const completeEditGradeUpdate = {
        score: score,
        isExtraCredit: editScoreExtraCredit,
        extraCreditPoints: editScoreExtraCredit && editScoreExtraCreditPoints ? parseFloat(editScoreExtraCreditPoints) : null
      };
      
      // First update the local state immediately for responsive UI
      setGrades((prevGrades) => 
        updateGradesState(prevGrades, selectedGrade.categoryId, selectedGrade.id, completeEditGradeUpdate)
      );

      // Then refresh from database to ensure accuracy (including extra credit data)
      try {
        const refreshResult = await loadCourseGrades(course.id);
        if (refreshResult.success) {
          setGrades(refreshResult.grades);
          
          // Update parent component with fresh data
          if (onGradeUpdate) {
            onGradeUpdate(refreshResult.grades);
          }
        }
      } catch (refreshError) {
        // Fallback to local state update
        if (onGradeUpdate) {
          const updatedGrades = updateGradesState(grades, selectedGrade.categoryId, selectedGrade.id, completeEditGradeUpdate);
          onGradeUpdate(updatedGrades);
        }
      }

      // Reset form state using utility function
      const initialScoreState = getInitialScoreState();
      setShowEditScore(false);
      setSelectedGrade(null);
      setEditScoreExtraCredit(initialScoreState.editScoreExtraCredit);
      setEditScoreExtraCreditPoints(initialScoreState.editScoreExtraCreditPoints);
    } catch (error) {
      alert("Failed to update score. Please try again.");
    }
  };
};

/**
 * Handle assessment creation/editing submission
 */
export const createAssessmentSubmitHandler = (
  newGrade,
  editingGrade,
  grades,
  setGrades,
  setNewGrade,
  setShowAddGrade,
  setEditingGrade,
  setSuccessMessage,
  onGradeUpdate,
  course
) => {
  return async (e) => {
    e.preventDefault();

    try {
      // Prepare assessment data using utility function
      const assessmentData = prepareAssessmentData(newGrade, newGrade.categoryId, [], grades);

      let savedGrade;
      if (editingGrade) {
        const updateResult = await updateExistingAssessment(editingGrade.id, assessmentData);
        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }
        savedGrade = updateResult.assessment;
      } else {
        const createResult = await createNewAssessment(assessmentData);
        if (!createResult.success) {
          throw new Error(createResult.error);
        }
        savedGrade = createResult.assessment;
      }

      // Update grades state
      const updatedGrades = { ...grades };

      if (editingGrade) {
        // Handle category changes for edited assessments
        const oldCategoryId = editingGrade.categoryId;
        const newCategoryId = newGrade.categoryId;

        if (oldCategoryId !== newCategoryId && updatedGrades[oldCategoryId]) {
          updatedGrades[oldCategoryId] = updatedGrades[oldCategoryId].filter(
            (grade) => grade.id !== editingGrade.id
          );
        }

        if (!updatedGrades[newCategoryId]) {
          updatedGrades[newCategoryId] = [];
        }

        const existingIndex = updatedGrades[newCategoryId].findIndex(
          (grade) => grade.id === editingGrade.id
        );

        const updatedGradeData = {
          id: savedGrade.id,
          categoryId: newGrade.categoryId,
          name: savedGrade.name,
          maxScore: savedGrade.maxScore,
          score: savedGrade.score,
          date: savedGrade.date,
          assessmentType: savedGrade.assessmentType,
          isExtraCredit: savedGrade.isExtraCredit,
          extraCreditPoints: savedGrade.extraCreditPoints,
          note: savedGrade.note,
          semesterTerm: newGrade.semesterTerm || 'MIDTERM',
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt,
        };

        if (existingIndex >= 0) {
          updatedGrades[newCategoryId][existingIndex] = updatedGradeData;
        } else {
          updatedGrades[newCategoryId].push(updatedGradeData);
        }
      } else {
        // Add new assessment
        if (!updatedGrades[newGrade.categoryId]) {
          updatedGrades[newGrade.categoryId] = [];
        }
        updatedGrades[newGrade.categoryId].push({
          id: savedGrade.id,
          categoryId: savedGrade.categoryId,
          name: savedGrade.name,
          maxScore: savedGrade.maxScore,
          score: savedGrade.score,
          date: savedGrade.date,
          assessmentType: savedGrade.assessmentType,
          isExtraCredit: savedGrade.isExtraCredit,
          extraCreditPoints: savedGrade.extraCreditPoints,
          note: savedGrade.note,
          semesterTerm: newGrade.semesterTerm || 'MIDTERM',
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt,
        });
      }

      // First update the local state immediately for responsive UI
      setGrades(updatedGrades);

      // Then refresh from database to ensure accuracy and include semesterTerm
      try {
        const refreshResult = await loadCourseGrades(course.id);
        if (refreshResult.success) {
          setGrades(refreshResult.grades);
          
          // Update parent component with fresh data
          if (onGradeUpdate) {
            onGradeUpdate(refreshResult.grades);
          }
        }
      } catch (refreshError) {
        // Fallback to local state update
        if (onGradeUpdate) {
          onGradeUpdate(updatedGrades);
        }
      }

      setSuccessMessage(
        editingGrade ? "Assessment updated successfully!" : "Assessment added successfully!"
      );

      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form state
      setNewGrade(getInitialGradeState());
      setShowAddGrade(false);
      setEditingGrade(null);
    } catch (error) {
      alert("Failed to save assessment. Please try again.");
    }
  };
};

/**
 * Handle assessment deletion
 */
export const createDeleteAssessmentHandler = (
  grades,
  setGrades,
  setSuccessMessage,
  setConfirmationModal,
  onGradeUpdate,
  course = null
) => {
  return (gradeId, categoryId) => {
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      title: "Delete Assessment",
      message: "Are you sure you want to delete this assessment? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      showWarning: true,
      warningItems: [
        "This assessment and its score will be permanently deleted",
        "This may affect your course grade calculation",
        "This action cannot be undone"
      ],
      showTip: true,
      tipMessage: "Consider archiving the assessment instead if you want to keep it for records.",
      onConfirm: async () => {
        try {
          const deleteResult = await deleteAssessment(gradeId);
          if (!deleteResult.success) {
            throw new Error(deleteResult.error);
          }

          setGrades((prevGrades) => {
            const updatedGrades = { ...prevGrades };
            if (updatedGrades[categoryId]) {
              updatedGrades[categoryId] = updatedGrades[categoryId].filter(
                (g) => g.id !== gradeId
              );
            }
            return updatedGrades;
          });

          // Give the database a moment to process the deletion
          await new Promise(resolve => setTimeout(resolve, 100));

          // Update course grades using database stored procedure after assessment deletion
          if (course?.id) {
            try {
              // Use the updateCourseGrades function which calls the UpdateCourseGrades stored procedure
              const response = await fetch(`/api/database-calculations/course/${course.id}/update-grades`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Database calculation service update failed:", errorText);
              } else {
                const result = await response.json();
                console.log("✅ Course grades updated after assessment deletion:", result);
                
                // Fetch updated course data to refresh the frontend
                try {
                  const courseResponse = await fetch(`/api/courses/${course.id}`);
                  if (courseResponse.ok) {
                    const updatedCourse = await courseResponse.json();
                    console.log("✅ Updated course data fetched:", updatedCourse);
                    
                    // Update the course data in the parent component
                    if (onGradeUpdate) {
                      onGradeUpdate(updatedCourse);
                    }
                  }
                } catch (courseError) {
                  console.error("⚠️ Failed to fetch updated course data:", courseError);
                }
              }
            } catch (error) {
              console.error("⚠️ Failed to update course grades after deletion:", error);
              // Don't fail the entire operation if course grade calculation fails
            }
          }

          setSuccessMessage("Assessment deleted successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);

          if (onGradeUpdate) {
            const updatedGrades = { ...grades };
            if (updatedGrades[categoryId]) {
              updatedGrades[categoryId] = updatedGrades[categoryId].filter(
                (g) => g.id !== gradeId
              );
            }
            onGradeUpdate(updatedGrades);
          }

          // Trigger analytics refresh after assessment deletion
          // This ensures the trajectory chart updates to remove the deleted assessment
          setTimeout(() => {
            // Dispatch a custom event to trigger analytics refresh
            window.dispatchEvent(new CustomEvent('refreshAnalytics', { 
              detail: { courseId: course?.id, userId: course?.userId } 
            }));
          }, 200); // Small delay to ensure database operations complete

          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          alert("Failed to delete assessment. Please try again.");
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
    });
  };
};

/**
 * Handle adding new assessment to category
 */
export const createAddAssessmentHandler = (setNewGrade, setShowAddGrade) => {
  return (categoryId) => {
    setNewGrade((prev) => ({
      ...prev,
      categoryId: categoryId,
    }));
    setShowAddGrade(true);
  };
};

/**
 * Handle assessment click (for adding scores)
 */
export const createAssessmentClickHandler = (setSelectedGrade, setShowScoreInput) => {
  return (grade) => {
    if (!assessmentHasScore(grade)) {
      setSelectedGrade(grade);
      setShowScoreInput(true);
    }
  };
};

/**
 * Handle edit score button click
 */
export const createEditScoreClickHandler = (
  setSelectedGrade,
  setEditScoreExtraCredit,
  setEditScoreExtraCreditPoints,
  setShowEditScore
) => {
  return (grade) => {
    setSelectedGrade(grade);
    setEditScoreExtraCredit(grade.isExtraCredit || false);
    setEditScoreExtraCreditPoints(grade.extraCreditPoints || "");
    setShowEditScore(true);
  };
};

/**
 * Handle edit assessment button click
 */
export const createEditAssessmentHandler = (setEditingGrade, setNewGrade, setShowAddGrade) => {
  return (grade) => {
    setEditingGrade(grade);
    setNewGrade({
      categoryId: grade.categoryId,
      name: grade.name,
      maxScore: grade.maxScore,
      date: grade.date,
      note: grade.note || "",
    });
    setShowAddGrade(true);
  };
};

/**
 * Handle course edit button click
 */
export const createCourseEditHandler = (course, setEditingCourse, setShowEditCourse) => {
  return (e) => {
    e.stopPropagation();
    const courseWithColorIndex = {
      ...course,
      colorIndex: course.colorIndex !== undefined ? course.colorIndex : 0,
    };
    setEditingCourse(courseWithColorIndex);
    setShowEditCourse(true);
  };
};

/**
 * Handle course update completion
 */
export const createCourseUpdateHandler = (
  course,
  setShowEditCourse,
  setEditingCourse,
  onGradeUpdate
) => {
  return (updatedCourses) => {
    const updatedCourse = updatedCourses.find(
      (c) => c.courseId === course.courseId
    );
    if (updatedCourse && onGradeUpdate) {
      onGradeUpdate(updatedCourse);
    }
    setShowEditCourse(false);
    setEditingCourse(null);
  };
};

/**
 * Handle modal cancellation
 */
export const createCancelHandler = (
  setNewGrade,
  setShowAddGrade,
  setEditingGrade,
  setShowScoreInput,
  setSelectedGrade,
  setShowEditScore,
  resetScoreState = null
) => {
  return () => {
    if (setNewGrade) setNewGrade(getInitialGradeState());
    if (setShowAddGrade) setShowAddGrade(false);
    if (setEditingGrade) setEditingGrade(null);
    if (setShowScoreInput) setShowScoreInput(false);
    if (setSelectedGrade) setSelectedGrade(null);
    if (setShowEditScore) setShowEditScore(false);
    
    // Reset score-specific state if provided
    if (resetScoreState) {
      const initialState = getInitialScoreState();
      resetScoreState(initialState);
    }
  };
};

/**
 * Handle dashboard/assessment view toggle
 */
export const createViewToggleHandler = (showDashboard, setShowDashboard) => {
  return () => {
    setShowDashboard(!showDashboard);
  };
};

/**
 * Handle success feedback actions
 */
export const createSuccessFeedbackHandlers = (
  setShowSuccessFeedback,
  setNewGrade,
  setEditingGrade,
  setShowAddGrade,
  onNavigateToCourse,
  onBack,
  course
) => {
  return {
    onEnterAnother: (categoryId) => {
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
    },
    onReturnToCourse: () => {
      setShowSuccessFeedback(false);
      if (onNavigateToCourse) {
        onNavigateToCourse(course);
      } else {
        onBack();
      }
    },
    onClose: () => {
      setShowSuccessFeedback(false);
    }
  };
};
