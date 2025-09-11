// ========================================
// GRADE SUCCESS FEEDBACK COMPONENT
// ========================================
// This component displays success feedback after adding a grade
// Features: Grade summary, course information, action buttons

import React from "react";
import { calculateCourseProgress } from "../../utils/progressCalculations";
import GradeService from "../../services/gradeService";
import { getCourseColorScheme } from "../../utils/courseColors";

function GradeSuccessFeedback({
  gradeData,
  course,
  grades,
  categories,
  onEnterAnother,
  onReturnToCourse,
  onClose,
}) {
  // Calculate updated course statistics
  const progress = calculateCourseProgress(categories, grades);
  const gradeResult = GradeService.calculateCourseGrade(course, grades);
  const currentGrade = gradeResult.success
    ? gradeResult.courseGrade
    : "Ongoing";

  // Get category name for the saved grade
  const category = categories.find((cat) => cat.id === gradeData.categoryId);
  const categoryName = category ? category.name : "Unknown Category";

  // Calculate grade percentage
  const gradePercentage =
    gradeData.score && gradeData.maxScore
      ? Math.round((gradeData.score / gradeData.maxScore) * 100)
      : 0;

  // Generate next action suggestions
  const getNextActionSuggestions = () => {
    const suggestions = [];

    // Check for categories with no assessments
    const categoriesWithoutAssessments = categories.filter((cat) => {
      const categoryGrades = grades[cat.id] || [];
      return categoryGrades.length === 0;
    });

    if (categoriesWithoutAssessments.length > 0) {
      suggestions.push({
        type: "add_assessment",
        title: "Add Assessment",
        description: `Add an assessment to ${categoriesWithoutAssessments[0].name}`,
        action: "Add another assessment to complete your course setup",
      });
    }

    // Check for assessments without scores
    const assessmentsWithoutScores = Object.values(grades)
      .flat()
      .filter(
        (grade) =>
          grade.score === null ||
          grade.score === undefined ||
          grade.score === ""
      );

    if (assessmentsWithoutScores.length > 0) {
      suggestions.push({
        type: "add_score",
        title: "Add Score",
        description: `Add scores to ${
          assessmentsWithoutScores.length
        } pending assessment${assessmentsWithoutScores.length > 1 ? "s" : ""}`,
        action: "Click on pending assessments to add your scores",
      });
    }

    // Check course progress
    if (progress < 100) {
      suggestions.push({
        type: "continue_progress",
        title: "Continue Progress",
        description: `You're ${Math.round(
          progress
        )}% complete with this course`,
        action: "Keep adding assessments and scores to reach 100%",
      });
    }

    // Default suggestion if no specific actions
    if (suggestions.length === 0) {
      suggestions.push({
        type: "course_complete",
        title: "Course Complete",
        description: "All assessments have been added and scored",
        action: "Great job! Your course is fully tracked",
      });
    }

    return suggestions;
  };

  const suggestions = getNextActionSuggestions();

  // Get course color scheme
  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-white/20">
        {/* ========================================
            SUCCESS HEADER
            ======================================== */}
        <div className={`${colorScheme.primary} text-white p-6 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Grade Saved Successfully!
                </h2>
                <p className="text-green-100">
                  Your assessment has been recorded
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ========================================
              GRADE DETAILS SECTION
              ======================================== */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Grade Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Assessment</p>
                <p className="font-semibold text-gray-800">{gradeData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold text-gray-800">{categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="font-semibold text-gray-800">
                  {gradeData.score} / {gradeData.maxScore} ({gradePercentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(gradeData.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              COURSE STATISTICS SECTION
              ======================================== */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Updated Course Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Course Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Grade</p>
                <p className="font-semibold text-gray-800">
                  {typeof currentGrade === "number"
                    ? currentGrade.toFixed(1)
                    : currentGrade}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              NEXT ACTIONS SECTION
              ======================================== */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              What's Next?
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {suggestion.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {suggestion.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================
              ACTION BUTTONS SECTION
              ======================================== */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onEnterAnother(gradeData.categoryId)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Another Assessment
            </button>
            <button
              onClick={onReturnToCourse}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Course Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradeSuccessFeedback;
