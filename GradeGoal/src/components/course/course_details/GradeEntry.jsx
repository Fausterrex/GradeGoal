// ========================================
// GRADE ENTRY COMPONENT (REFACTORED)
// ========================================
// Main component that orchestrates all the course detail components

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  convertPercentageToGPA,
  getGradeColor,
} from "../../../utils/gradeCalculations";
import GradeService from "../../../services/gradeService";
import { getAcademicGoalsByCourse, getUserProfile } from "../../../backend/api";
import { calculateCourseProgress } from "../../../utils/progressCalculations";
import {
  getGradesByCourseId,
  createGrade,
  updateGrade,
  deleteGrade as deleteGradeApi,
  getAssessmentCategoriesByCourseId,
} from "../../../backend/api";
import AddCourse from "../AddCourse";
import GradeSuccessFeedback from "../GradeSuccessFeedback";
import { getCourseColorScheme } from "../../../utils/courseColors";
import ConfirmationModal from "../../common/ConfirmationModal";
import progressTrackingService from "../../../services/progressTrackingService";
import AnalyticsService from "../../../services/analyticsService";
import { calculateAndStoreAnalytics } from "../../../backend/progressAnalyticsApi";
import { addOrUpdateGrade, updateCourseGrades, awardPoints, checkGoalProgress, checkGradeAlerts, checkUserAchievements } from "../../../services/databaseCalculationService";

// Import the new components
import MainHeader from "./MainHeader";
import SuccessMessage from "./SuccessMessage";
import ArchivedWarning from "./ArchivedWarning";
import AssessmentCategories from "./assessments/AssessmentCategories";
import AssessmentModal from "./assessments/AssessmentModal";
import AddScoreModal from "./assessments/AddScoreModal";
import EditScoreModal from "./assessments/EditScoreModal";
import Dashboard from "./dashboard/Dashboard";
import { generateAssessmentName } from "./assessments/AssessmentUtils";

function GradeEntry({ course, onGradeUpdate, onBack, onNavigateToCourse, onClearSelectedCourse, onCloseCourseManager }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [grades, setGrades] = useState({});
  const [categories, setCategories] = useState([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newGrade, setNewGrade] = useState({
    categoryId: "",
    name: "",
    maxScore: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
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
      updateCourseGrade();
    }
  }, [grades, categories, course]);

  useEffect(() => {
    if (course && currentUser) {
      loadGrades();
    }
  }, [course, currentUser]);

  // Load analytics when grades or categories change
  useEffect(() => {
    if (userId && course && Object.keys(grades).length > 0 && categories.length > 0) {
      loadUserAnalytics();
    }
  }, [userId, course, grades, categories, targetGrade]);

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
      const userProfile = await getUserProfile(currentUser.email);
      setUserId(userProfile.userId);

      const goals = await getAcademicGoalsByCourse(
        userProfile.userId,
        course.courseId
      );

      const courseGradeGoal = goals.find(
        (goal) =>
          goal.goalType === "COURSE_GRADE" && goal.courseId === course.courseId
      );

      if (courseGradeGoal) {
        // Convert target value from percentage to GPA if it's greater than 4.0
        const targetValue = courseGradeGoal.targetValue;
        if (targetValue > 4.0) {
          // It's a percentage, convert to GPA
          const gpaValue = convertPercentageToGPA(targetValue, course.gpaScale || "4.0");
          setTargetGrade(gpaValue);
        } else {
          // It's already a GPA value
          setTargetGrade(targetValue);
        }
      }
    } catch (error) {
      console.error("Error loading target grade:", error);
    }
  };

  const loadGrades = async () => {
    try {
      const gradesData = await getGradesByCourseId(course.id);
      const transformedGrades = {};
      const firstCategoryId =
        categories && categories.length > 0 ? categories[0].id : null;

      gradesData.forEach((grade) => {
        let categoryId = null;

        if (grade.assessment && grade.assessment.categoryId) {
          categoryId = grade.assessment.categoryId;
        } else if (grade.category && grade.category.id) {
          categoryId = grade.category.id;
        } else if (grade.categoryId) {
          categoryId = grade.categoryId;
        } else if (grade.category_id) {
          categoryId = grade.category_id;
        }

        if (!categoryId && firstCategoryId) {
          categoryId = firstCategoryId;
        }

        if (!categoryId) {
          return;
        }

        if (!transformedGrades[categoryId]) {
          transformedGrades[categoryId] = [];
        }

        const transformedGrade = {
          id: grade.gradeId || grade.id,
          categoryId: categoryId,
          name: grade.assessment?.assessmentName || grade.name,
          maxScore: grade.assessment?.maxPoints || grade.maxScore,
          score: grade.pointsEarned,
          date: grade.assessment?.dueDate || grade.date,
          assessmentType: "",
          isExtraCredit: grade.isExtraCredit,
          extraCreditPoints: grade.extraCreditPoints,
          note: grade.notes || grade.note,
          createdAt: grade.createdAt,
          updatedAt: grade.updatedAt,
        };
        
        transformedGrades[categoryId].push(transformedGrade);
      });
      setGrades(transformedGrades);
    } catch (error) {}
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getAssessmentCategoriesByCourseId(course.id);

      const transformedCategories = categoriesData.map((category) => ({
        id: category.categoryId || category.id,
        name: category.categoryName || category.name,
        weight: category.weightPercentage || category.weight,
        weightPercentage: category.weightPercentage || category.weight,
      }));

      setCategories(transformedCategories);
    } catch (error) {
      if (course.categories && course.categories.length > 0) {
        setCategories(course.categories);
      }
    }
  };

  const loadUserProgress = async () => {
    try {
      if (!userId) {
        return;
      }
      
      const progress = await progressTrackingService.getUserProgressWithLevel(userId);
      setUserProgress(progress);
      
      // Track daily login
      await progressTrackingService.trackDailyLogin(userId);
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      if (!userId || !course) return;

      // Calculate analytics
      const analytics = AnalyticsService.calculateCourseAnalytics(
        course,
        grades,
        categories,
        targetGrade
      );

      // Store analytics in database
      const courseData = {
        grades,
        categories,
        targetGrade,
        course
      };

      const storedAnalytics = await calculateAndStoreAnalytics(userId, course.id, courseData);
      
      // Handle both backend response and fallback response formats
      const analyticsData = storedAnalytics?.analytics || storedAnalytics || analytics;
      setUserAnalytics(analyticsData);

      // Update user GPA if we have grade data
      const currentGrade = analytics.current_grade;
      if (currentGrade > 0) {
        const currentGPA = convertPercentageToGPA(currentGrade, course.gpaScale || "4.0");
        await progressTrackingService.updateGPA(userId, currentGPA, userProgress?.cumulative_gpa || currentGPA);
      }
    } catch (error) {
      console.error("Error loading user analytics:", error);
    }
  };

  // ========================================
  // CALCULATION FUNCTIONS
  // ========================================
  const getCategoryAverage = async (categoryId) => {
    if (!categories || categories.length === 0) {
      return null;
    }

    const categoryGrades = grades[categoryId] || [];
    if (categoryGrades.length === 0) return null;

    try {
      // Use database calculation for category average
      const { calculateCategoryGrade } = await import('../../../services/databaseCalculationService');
      const average = await calculateCategoryGrade(categoryId);
      return average === 0 ? null : average;
    } catch (error) {
      console.warn('Database category calculation failed:', error);
      return null;
    }
  };

  const updateCourseGrade = async () => {
    if (!categories || categories.length === 0 || !course?.id) {
      setCourseGrade(0);
      return;
    }

    try {
      const hasAnyGrades = Object.values(grades).some(
        (categoryGrades) =>
          Array.isArray(categoryGrades) && categoryGrades.length > 0
      );

      if (!hasAnyGrades) {
        setCourseGrade(0);
        return;
      }

      // Try to use database calculation first
      try {
        const { calculateCourseGrade } = await import('../../../services/databaseCalculationService');
        const dbGrade = await calculateCourseGrade(course.id);
        
        if (dbGrade > 0) {
          setCourseGrade(dbGrade);
          return;
        }
      } catch (error) {
        console.warn('Database calculation failed, falling back to JavaScript calculation:', error);
      }

      // Fallback to JavaScript calculation
      const courseWithCategories = { ...course, categories };
      const result = GradeService.calculateCourseGrade(
        courseWithCategories,
        grades
      );

      if (result.success) {
        setCourseGrade(result.courseGrade);
      } else {
        setCourseGrade(0);
      }
    } catch (error) {
      console.error('Error calculating course grade:', error);
      setCourseGrade(0);
    }
  };

  const getTotalAssessments = () => {
    return Object.values(grades).reduce((total, categoryGrades) => {
      return total + categoryGrades.length;
    }, 0);
  };

  const getProgressPercentage = () => {
    return calculateCourseProgress(categories, grades);
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const gradeData = {
        name: newGrade.name,
        maxScore: parseFloat(newGrade.maxScore),
        score: null,
        date: newGrade.date,
        assessmentType: "",
        isExtraCredit: false,
        extraCreditPoints: null,
        note: newGrade.note,
        categoryId: newGrade.categoryId,
      };

      let savedGrade;
      if (editingGrade) {
        savedGrade = await updateGrade(editingGrade.id, gradeData);
      } else {
        savedGrade = await createGrade(gradeData);
      }

      const updatedGrades = { ...grades };

      if (editingGrade) {
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
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt,
        };

        if (existingIndex >= 0) {
          updatedGrades[newCategoryId][existingIndex] = updatedGradeData;
        } else {
          updatedGrades[newCategoryId].push(updatedGradeData);
        }

        setSuccessMessage("Assessment updated successfully!");
      } else {
        if (!updatedGrades[newGrade.categoryId]) {
          updatedGrades[newGrade.categoryId] = [];
        }
        const newGradeData = {
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
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt,
        };
        updatedGrades[newGrade.categoryId].push(newGradeData);

        setSuccessMessage("Assessment added successfully!");
        
        // Track assessment creation
        if (userId) {
          try {
            const category = categories.find(cat => cat.id === newGrade.categoryId);
            await progressTrackingService.trackGradeEntry(userId, newGradeData, { category });
          } catch (error) {
            console.error("Error tracking grade entry:", error);
          }
        }
      }

      setGrades(updatedGrades);

      if (onGradeUpdate) {
        onGradeUpdate(updatedGrades);
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setNewGrade({
        categoryId: "",
        name: "",
        maxScore: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      setShowAddGrade(false);
      setEditingGrade(null);
    } catch (error) {
      alert("Failed to save grade. Please try again.");
    }
  };

  const handleAssessmentClick = (grade) => {
    const hasScore =
      grade.score !== null &&
      grade.score !== undefined &&
      grade.score !== "" &&
      grade.score !== 0 &&
      !isNaN(parseFloat(grade.score));
    if (!hasScore) {
      setSelectedGrade(grade);
      setShowScoreInput(true);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.score.value);

    if (isNaN(score) || score < 0) {
      alert("Please enter a valid score");
      return;
    }

    if (score > selectedGrade.maxScore) {
      alert("Score cannot exceed maximum score");
      return;
    }

    try {
      // Calculate percentage score
      const percentageScore = (score / selectedGrade.maxScore) * 100;
      
      // Use the new database calculation API
      const gradeData = {
        assessmentId: selectedGrade.id, // Assuming the grade ID is the assessment ID
        pointsEarned: score,
        pointsPossible: selectedGrade.maxScore,
        percentageScore: percentageScore,
        scoreType: "PERCENTAGE",
        notes: selectedGrade.note || "",
        isExtraCredit: scoreExtraCredit || false
      };

      const dbResult = await addOrUpdateGrade(gradeData);
      
      if (!dbResult.success) {
        throw new Error(dbResult.result || 'Failed to save grade');
      }

      // Update course grades using database procedure
      if (course?.id) {
        try {
          await updateCourseGrades(course.id);
        } catch (error) {
          console.error('Failed to update course grades:', error);
        }
      }

      // Award points and check achievements
      if (userId) {
        try {
          await awardPoints(userId, 10, 'GRADE_ADDED');
          await checkGoalProgress(userId);
          await checkGradeAlerts(userId);
          await checkUserAchievements(userId);
        } catch (error) {
          console.error('Failed to process achievements/points:', error);
        }
      }

      // Also update via the old API for compatibility
      const updateGradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: "",
        isExtraCredit: scoreExtraCredit,
        extraCreditPoints: scoreExtraCredit && scoreExtraCreditPoints 
          ? parseFloat(scoreExtraCreditPoints) 
          : null,
        note: selectedGrade.note || "",
        categoryId: selectedGrade.categoryId,
      };

      await updateGrade(selectedGrade.id, updateGradeData);

      setGrades((prevGrades) => {
        const updatedGrades = { ...prevGrades };
        const categoryId = selectedGrade.categoryId;

        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(
            (g) => g.id === selectedGrade.id
          );
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString(),
            };
          }
        }

        return updatedGrades;
      });

      if (onGradeUpdate) {
        const updatedGrades = { ...grades };
        const categoryId = selectedGrade.categoryId;

        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(
            (g) => g.id === selectedGrade.id
          );
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString(),
            };
          }
        }

        onGradeUpdate(updatedGrades);
      }

      const savedGradeData = {
        id: selectedGrade.id,
        categoryId: selectedGrade.categoryId,
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: "",
        isExtraCredit: scoreExtraCredit,
        extraCreditPoints: scoreExtraCredit && scoreExtraCreditPoints 
          ? parseFloat(scoreExtraCreditPoints) 
          : null,
        note: selectedGrade.note,
      };
      
      setLastSavedGrade(savedGradeData);
      setShowSuccessFeedback(true);

      // Update course grade calculation
      await updateCourseGrade();

      // Track score submission
      if (userId) {
        try {
          const category = categories.find(cat => cat.id === selectedGrade.categoryId);
          await progressTrackingService.trackAssignmentCompletion(userId, savedGradeData, { category });
        } catch (error) {
          console.error("Error tracking assignment completion:", error);
        }
      }

      setShowScoreInput(false);
      setSelectedGrade(null);
      setScoreExtraCredit(false);
      setScoreExtraCreditPoints("");
    } catch (error) {
      alert("Failed to update score. Please try again.");
    }
  };

  const handleEditScore = (grade) => {
    setSelectedGrade(grade);
    setEditScoreExtraCredit(grade.isExtraCredit || false);
    setEditScoreExtraCreditPoints(grade.extraCreditPoints || "");
    setShowEditScore(true);
  };

  const handleEditScoreSubmit = async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.editScore.value);

    if (isNaN(score) || score < 0) {
      alert("Please enter a valid score");
      return;
    }

    if (score > selectedGrade.maxScore) {
      alert("Score cannot exceed maximum score");
      return;
    }

    try {
      const gradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: "",
        isExtraCredit: editScoreExtraCredit,
        extraCreditPoints: editScoreExtraCredit && editScoreExtraCreditPoints 
          ? parseFloat(editScoreExtraCreditPoints) 
          : null,
        note: selectedGrade.note || "",
        categoryId: selectedGrade.categoryId,
      };

      await updateGrade(selectedGrade.id, gradeData);

      setGrades((prevGrades) => {
        const updatedGrades = { ...prevGrades };
        const categoryId = selectedGrade.categoryId;

        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(
            (g) => g.id === selectedGrade.id
          );
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString(),
            };
          }
        }

        return updatedGrades;
      });

      if (onGradeUpdate) {
        const updatedGrades = { ...grades };
        const categoryId = selectedGrade.categoryId;

        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(
            (g) => g.id === selectedGrade.id
          );
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString(),
            };
          }
        }

        onGradeUpdate(updatedGrades);
      }

      setLastSavedGrade({
        id: selectedGrade.id,
        categoryId: selectedGrade.categoryId,
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: "",
        isExtraCredit: editScoreExtraCredit,
        extraCreditPoints: editScoreExtraCredit && editScoreExtraCreditPoints 
          ? parseFloat(editScoreExtraCreditPoints) 
          : null,
        note: selectedGrade.note,
      });
      setShowSuccessFeedback(true);

      setShowEditScore(false);
      setSelectedGrade(null);
    } catch (error) {
      alert("Failed to update score. Please try again.");
    }
  };

  const handleEditAssessment = (grade) => {
    setNewGrade({
      categoryId: grade.categoryId,
      name: grade.name,
      maxScore: grade.maxScore,
      date: grade.date,
      note: grade.note || "",
    });
    setEditingGrade(grade);
    setShowAddGrade(true);
  };

  const handleDeleteAssessment = (gradeId, categoryId) => {
    const grade = grades[categoryId]?.find(g => g.id === gradeId);
    const gradeName = grade?.name || "this assessment";
    
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      title: "Delete Assessment",
      message: `Permanently delete "${gradeName}"? This action will permanently remove the assessment and all associated data including scores and notes. This cannot be undone.`,
      confirmText: "Delete Permanently",
      cancelText: "Cancel",
      showWarning: true,
      warningItems: [
        "Assessment will be permanently removed",
        "All scores and data will be lost",
        "Course grade calculations will be affected",
        "This action CANNOT be undone"
      ],
      onConfirm: async () => {
        try {
          await deleteGradeApi(gradeId);

          setGrades((prevGrades) => {
            const updatedGrades = { ...prevGrades };
            if (updatedGrades[categoryId]) {
              updatedGrades[categoryId] = updatedGrades[categoryId].filter(
                (g) => g.id !== gradeId
              );
            }
            return updatedGrades;
          });

          setSuccessMessage("Assessment deleted successfully!");

          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);

          if (onGradeUpdate) {
            const updatedGrades = { ...grades };
            if (updatedGrades[categoryId]) {
              updatedGrades[categoryId] = updatedGrades[categoryId].filter(
                (g) => g.id !== gradeId
              );
            }
            onGradeUpdate(updatedGrades);
          }

          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          alert("Failed to delete assessment. Please try again.");
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  const handleAddAssessment = (categoryId) => {
    setNewGrade((prev) => ({
      ...prev,
      categoryId: categoryId,
    }));
    setShowAddGrade(true);
  };

  const handleEditCourseClick = (e) => {
    e.stopPropagation();
    const courseWithColorIndex = {
      ...course,
      colorIndex: course.colorIndex !== undefined ? course.colorIndex : 0,
    };
    setEditingCourse(courseWithColorIndex);
    setShowEditCourse(true);
  };

  const handleCourseUpdated = (updatedCourses) => {
    const updatedCourse = updatedCourses.find(
      (c) => c.courseId === course.courseId
    );
    if (updatedCourse) {
      if (onGradeUpdate) {
        onGradeUpdate(updatedCourse);
      }
    }
    setShowEditCourse(false);
    setEditingCourse(null);
  };

  const cancelGradeEdit = () => {
    setNewGrade({
      categoryId: "",
      name: "",
      maxScore: "",
      date: new Date().toISOString().split("T")[0],
      assessmentType: "",
      isExtraCredit: false,
      extraCreditPoints: 0,
      note: "",
    });
    setShowAddGrade(false);
    setEditingGrade(null);
  };

  // ========================================
  // RENDER
  // ========================================
  if (!course) return <div>No course selected</div>;

  const totalAssessments = getTotalAssessments();
  const progressPercentage = getProgressPercentage();
  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);

  return (
    <div className={`w-full h-full ${colorScheme.light} flex flex-col overflow-y-auto`}>
      <MainHeader
        course={course}
        colorScheme={colorScheme}
        onBack={onBack}
        onEditCourseClick={handleEditCourseClick}
        progressPercentage={progressPercentage}
        totalAssessments={totalAssessments}
        showDashboard={showDashboard}
        onToggleView={() => setShowDashboard(!showDashboard)}
      />

      <SuccessMessage successMessage={successMessage} />

      <div
        className={`w-full px-8 py-12 ${
          course.isActive === false ? "opacity-90" : ""
        } flex-1`}
      >
        {course.isActive === false && <ArchivedWarning />}

        <div className="max-w-[1600px] mx-auto">
          {showDashboard ? (
            <Dashboard
              course={course}
              grades={grades}
              categories={categories}
              targetGrade={targetGrade}
              currentGrade={courseGrade}
              colorScheme={colorScheme}
              userProgress={userProgress}
              userAnalytics={userAnalytics}
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
          ) : (
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
            />
          )}
        </div>
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
        onCancel={() => {
          setShowScoreInput(false);
          setSelectedGrade(null);
          setScoreExtraCredit(false);
          setScoreExtraCreditPoints("");
        }}
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
        onCancel={() => {
          setShowEditScore(false);
          setSelectedGrade(null);
          setEditScoreExtraCredit(false);
          setEditScoreExtraCreditPoints("");
        }}
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
        existingCourses={[course]}
        courseColorScheme={colorScheme}
      />

      {showSuccessFeedback && lastSavedGrade && (
        <GradeSuccessFeedback
          gradeData={lastSavedGrade}
          course={course}
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
              onNavigateToCourse(course);
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
}

export default GradeEntry;
