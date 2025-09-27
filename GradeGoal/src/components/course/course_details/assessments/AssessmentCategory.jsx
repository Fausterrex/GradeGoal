// ========================================
// ASSESSMENT CATEGORY COMPONENT
// ========================================
// Individual assessment category with its assessments

import React, { useState, useEffect } from "react";
import AssessmentCard from "./AssessmentCard";
import AIFocusIndicator from "../../../ai/components/AIFocusIndicator";
import { generateAIRecommendations } from "../../../ai/services/geminiService";
import { convertToGPA } from "../../academic_goal/gpaConversionUtils";
import { getFocusIndicatorForCategory, subscribeToAIAnalysis } from "../../../ai/services/aiAnalysisService";

// Simple grade color function to replace the deleted one
const getGradeColor = (percentage) => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

function AssessmentCategory({
  category,
  categoryGrades,
  categoryAverage,
  colorScheme,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  course, // Add course prop for AI analysis
  allGrades, // Add all grades for AI analysis
  allCategories, // Add all categories for AI analysis
  targetGrade // Add target grade for AI analysis
}) {
  const [focusIndicator, setFocusIndicator] = useState(null);

  // Subscribe to AI analysis data changes
  useEffect(() => {
    const unsubscribe = subscribeToAIAnalysis((analysisData) => {
      if (analysisData) {
        const categoryName = category.categoryName || category.name;
        const indicator = getFocusIndicatorForCategory(categoryName);
        setFocusIndicator(indicator);
      }
    });

    // Get initial focus indicator
    const categoryName = category.categoryName || category.name;
    const indicator = getFocusIndicatorForCategory(categoryName);
    setFocusIndicator(indicator);

    return unsubscribe;
  }, [category.categoryName, category.name]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
      {/* Category Header */}
      <div
        className={`bg-gradient-to-r ${colorScheme.gradient} px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden`}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          {/* Category Title and Weight */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {category.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {category.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 text-sm font-medium">
                    Weight: {category.weight}%
                  </span>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span className="text-white/80 text-sm">
                    {categoryGrades.length} assessments
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onAddAssessment(category.id)}
            className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white hover:text-gray-800 transition-all duration-300 font-medium border border-white/30 text-sm sm:text-base self-start sm:self-auto hover:scale-105 transform"
          >
            + Add Assessment
          </button>
        </div>
        
        {/* AI Focus Indicator - Show for both categories with assessments and empty categories */}
        {focusIndicator && (
          <div className="mt-4 relative z-10">
            <AIFocusIndicator 
              categoryName={category.categoryName || category.name}
              focusData={focusIndicator}
              isVisible={true}
            />
          </div>
        )}
      </div>

      {/* Category Content Area */}
      <div className="p-4 sm:p-6">
        {/* Category Average Display */}
        <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Category Average</div>
                <div className="text-xs text-gray-500">Performance Summary</div>
              </div>
            </div>
            
            {categoryAverage !== null && !isNaN(categoryAverage) ? (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-2xl font-bold ${getGradeColor(
                      categoryAverage
                    )}`}
                  >
                    {categoryAverage.toFixed(1)}%
                  </span>
                  <div className={`w-3 h-3 rounded-full ${
                    categoryAverage >= 90 ? 'bg-green-500' :
                    categoryAverage >= 80 ? 'bg-blue-500' :
                    categoryAverage >= 70 ? 'bg-yellow-500' :
                    categoryAverage >= 60 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {categoryAverage >= 90 ? 'Excellent' :
                   categoryAverage >= 80 ? 'Good' :
                   categoryAverage >= 70 ? 'Fair' :
                   categoryAverage >= 60 ? 'Needs Improvement' :
                   'Poor'}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-400">--</span>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">No scores yet</div>
              </div>
            )}
          </div>
        </div>

        {/* AI Focus indicators will be shown in the main Goal Progress section */}

        {/* Assessments List */}
        <div className="space-y-3">
          {categoryGrades.length > 0 ? (
            categoryGrades.map((grade) => (
              <AssessmentCard
                key={grade.id}
                grade={grade}
                course={course}
                onAssessmentClick={onAssessmentClick}
                onEditScore={onEditScore}
                onEditAssessment={onEditAssessment}
                onDeleteAssessment={onDeleteAssessment}
                userId={course?.userId}
                targetGrade={targetGrade}
                categoryName={category.categoryName || category.name}
                allGrades={allGrades}
                allCategories={allCategories}
              />
            ))
          ) : (
            <div className="text-center py-12">
              {/* Empty Assessments State */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">📝</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Assessments Yet
              </h3>
              <p className="text-gray-500 mb-3">This category is waiting for assessments.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm mx-auto">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Add assessments to track your progress and get AI insights!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentCategory;
