// ========================================
// ASSESSMENT CARD COMPONENT
// ========================================
// Individual assessment card within a category

import React from "react";
import { calculateGPAFromPercentage } from "../../../../backend/api";
import AIAssessmentPrediction from "../../../ai/components/AIAssessmentPrediction";
import AIScorePrediction from "../../../ai/components/AIScorePrediction";
import { getScorePredictionForAssessment, subscribeToAIAnalysis } from "../../../ai/services/aiAnalysisService";

// Simple grade color function to replace the deleted one
const getGradeColor = (percentage) => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};
import { getStatusColor, determineAssessmentStatus } from "./AssessmentUtils";

function AssessmentCard({
  grade,
  course,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  userId,
  targetGrade,
  categoryName,
  allGrades,
  allCategories
}) {
  const [gpa, setGpa] = React.useState("0.00");
  const [scorePrediction, setScorePrediction] = React.useState(null);
  
  const hasScore =
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== "" &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score)) &&
    parseFloat(grade.score) > 0;

  // Get score prediction for pending assessments
  React.useEffect(() => {
    const unsubscribe = subscribeToAIAnalysis((analysisData) => {
      if (analysisData && !hasScore && categoryName) {
        const assessmentName = grade.assessmentName || grade.name || grade.title || 'Assessment';
        const prediction = getScorePredictionForAssessment(assessmentName, categoryName);
        setScorePrediction(prediction);
      }
    });

    // Get initial prediction
    if (!hasScore && categoryName) {
      const assessmentName = grade.assessmentName || grade.name || grade.title || 'Assessment';
      const prediction = getScorePredictionForAssessment(assessmentName, categoryName);
      setScorePrediction(prediction);
    }

    return unsubscribe;
  }, [grade.assessmentName, grade.name, grade.title, categoryName, hasScore]);
    
  const percentage = hasScore ? ((parseFloat(grade.score) / parseFloat(grade.maxScore)) * 100) : null;

  // Calculate GPA when percentage changes
  React.useEffect(() => {
    if (percentage !== null) {
      calculateGPAFromPercentage(percentage)
        .then(result => {
          if (result.success) {
            setGpa(parseFloat(result.gpa).toFixed(2));
          }
        })
        .catch(() => {
          setGpa("0.00");
        });
    } else {
      setGpa("0.00");
    }
  }, [percentage]);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg relative ${
        hasScore
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm"
          : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-sm hover:shadow-md"
      }`}
      onClick={() => !hasScore && onAssessmentClick(grade)}
    >
      {/* Action Buttons - Mobile Responsive */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
        {!hasScore ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssessmentClick(grade);
            }}
            className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
          >
            Add Score
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditScore(grade);
            }}
            className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
          >
            Edit Score
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditAssessment(grade);
          }}
          className="bg-gray-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
        >
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAssessment(grade.id, grade.categoryId);
          }}
          className="bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
        >
          Delete
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pr-16 sm:pr-32">
        {/* Assessment Icon */}
        <div
          className={`w-14 h-14 ${
            hasScore ? "bg-green-500" : "bg-blue-500"
          } rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
        >
          <span className="text-white text-2xl">📝</span>
        </div>

        {/* Assessment Details */}
        <div className="flex-1 min-w-0">
          {/* Assessment Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {grade.name}
            </h4>
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold self-start ${getStatusColor(
                determineAssessmentStatus(grade)
              )}`}
            >
              {determineAssessmentStatus(grade)}
            </span>
            {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold self-start bg-yellow-100 text-yellow-800 border border-yellow-200">
                EXTRA CREDIT
              </span>
            )}
          </div>
          
          {/* Assessment Score and Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
            <div className="text-sm text-gray-600">
              {hasScore ? (
                <span
                  className={`font-bold text-base sm:text-lg ${getGradeColor(
                    percentage
                  )}`}
                >
                  {grade.score}
                  /{grade.maxScore} (
                  {percentage.toFixed(1)}% |{" "}
                  {gpa}{" "}
                  GPA)
                  {grade.isExtraCredit &&
                    grade.extraCreditPoints &&
                    grade.extraCreditPoints > 0 && (
                      <span className="ml-2 text-green-600 font-medium">
                        (+{grade.extraCreditPoints})
                      </span>
                    )}
                </span>
              ) : (
                <span className="font-medium">
                  Max Score:{" "}
                  <span className="text-gray-800">{grade.maxScore}</span>
                  {grade.isExtraCredit &&
                    grade.extraCreditPoints &&
                    grade.extraCreditPoints > 0 && (
                      <span className="ml-2 text-green-600 font-medium">
                        +{grade.extraCreditPoints}
                      </span>
                    )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">📅</span>
              <span className="text-sm font-medium">Due: {grade.date}</span>
            </div>
          </div>

          {/* Assessment Note */}
          {grade.note && grade.note.trim() !== "" && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 text-sm">📝</span>
                <span className="text-sm text-blue-800 font-semibold">Note</span>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed break-words">
                {grade.note}
              </p>
            </div>
          )}

          {/* AI Prediction */}
          {userId && targetGrade && (
            <AIAssessmentPrediction
              assessment={grade}
              course={course}
              userId={userId}
              targetGrade={targetGrade}
            />
          )}

          {/* AI Score Prediction for Pending Assessments */}
          {!hasScore && scorePrediction && (
            <AIScorePrediction
              assessment={grade}
              prediction={scorePrediction}
              isVisible={true}
              courseData={(() => {
                const courseData = {
                  currentGPA: course?.courseGpa || course?.course_gpa || 0,
                  categories: allCategories || course?.categories || [],
                  grades: allGrades || course?.grades || []
                };
                return courseData;
              })()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentCard;
