// ========================================
// GRADE ENTRY ASSESSMENTS UTILITIES
// ========================================
// This file contains all assessment-related functions for the GradeEntry component
// Functions: Assessment validation, score handling, modal management

import { generateAssessmentName } from "../assessments/AssessmentUtils";

/**
 * Validate score input
 */
export const validateScore = (score, maxScore) => {
  const numScore = parseFloat(score);
  const numMaxScore = parseFloat(maxScore);
  
  if (isNaN(numScore) || numScore < 0) {
    return { valid: false, error: "Please enter a valid score" };
  }
  
  if (numScore > numMaxScore) {
    return { valid: false, error: "Score cannot exceed maximum score" };
  }
  
  return { valid: true };
};

/**
 * Prepare grade data for database submission
 */
export const prepareGradeData = (selectedGrade, score, isExtraCredit, extraCreditPoints, currentUserId) => {
  const percentageScore = (score / selectedGrade.maxScore) * 100;
  
  // Handle extraCreditPoints properly
  let processedExtraCreditPoints = null;
  if (isExtraCredit && extraCreditPoints !== null && extraCreditPoints !== undefined && extraCreditPoints !== "") {
    processedExtraCreditPoints = parseFloat(extraCreditPoints);
  }
  
  return {
    assessmentId: selectedGrade.id,
    pointsEarned: score,
    pointsPossible: selectedGrade.maxScore,
    percentageScore: percentageScore,
    scoreType: "PERCENTAGE",
    notes: selectedGrade.note || "",
    isExtraCredit: isExtraCredit || false,
    userId: currentUserId,
    // Additional fields for fallback API
    name: selectedGrade.name,
    date: selectedGrade.date,
    categoryId: selectedGrade.categoryId,
    extraCreditPoints: processedExtraCreditPoints,
  };
};

/**
 * Prepare assessment data for creation/update
 */
export const prepareAssessmentData = (gradeData, categoryId, categories, grades) => {
  // Auto-generate name if not provided
  const assessmentName = gradeData.name || generateAssessmentName(
    categoryId, 
    categories, 
    grades, 
    gradeData.name
  );
  
  return {
    name: assessmentName,
    maxScore: parseFloat(gradeData.maxScore),
    score: null, // New assessments start without scores
    date: gradeData.date,
    assessmentType: "",
    isExtraCredit: false,
    extraCreditPoints: null,
    note: gradeData.note || "",
    categoryId: categoryId,
    semesterTerm: gradeData.semesterTerm || 'MIDTERM', // Add semesterTerm field
  };
};

/**
 * Create saved grade data for success feedback
 */
export const createSavedGradeData = (selectedGrade, score, isExtraCredit, extraCreditPoints) => {
  return {
    id: selectedGrade.id,
    categoryId: selectedGrade.categoryId,
    name: selectedGrade.name,
    maxScore: selectedGrade.maxScore,
    score: score,
    date: selectedGrade.date,
    assessmentType: "",
    isExtraCredit: isExtraCredit,
    extraCreditPoints: isExtraCredit && extraCreditPoints 
      ? parseFloat(extraCreditPoints) 
      : null,
    note: selectedGrade.note,
  };
};

/**
 * Reset assessment form state
 */
export const getInitialGradeState = (activeSemesterTerm = 'MIDTERM') => {
  return {
    categoryId: "",
    name: "",
    maxScore: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    semesterTerm: activeSemesterTerm, // Use the active semester term
  };
};

/**
 * Reset score input state
 */
export const getInitialScoreState = () => {
  return {
    scoreExtraCredit: false,
    scoreExtraCreditPoints: "",
    editScoreExtraCredit: false,
    editScoreExtraCreditPoints: "",
  };
};

/**
 * Check if assessment has a score
 */
export const assessmentHasScore = (grade) => {
  return (
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== "" &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score)) &&
    parseFloat(grade.score) > 0
  );
};

/**
 * Calculate percentage for display
 */
export const calculateDisplayPercentage = (score, maxScore) => {
  if (!score || !maxScore) return null;
  return ((parseFloat(score) / parseFloat(maxScore)) * 100);
};
