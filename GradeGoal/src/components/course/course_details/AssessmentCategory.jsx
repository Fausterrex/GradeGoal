// ========================================
// ASSESSMENT CATEGORY COMPONENT
// ========================================
// Individual assessment category with its assessments

import React from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";
import { getGradeColor } from "../../../utils/gradeCalculations";
import AssessmentCard from "./AssessmentCard";

function AssessmentCategory({
  category,
  categoryGrades,
  categoryAverage,
  colorScheme,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
      {/* Category Header */}
      <div
        className={`bg-gradient-to-r ${colorScheme.gradient} px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0`}
      >
        {/* Category Title and Weight */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {category.name}
          </h3>
          <span className="text-white/80 text-sm font-medium">
            Weight: {category.weight}%
          </span>
        </div>
        <button
          onClick={() => onAddAssessment(category.id)}
          className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white hover:text-gray-800 transition-all duration-300 font-medium border border-white/30 text-sm sm:text-base self-start sm:self-auto"
        >
          + Add Assessment
        </button>
      </div>

      {/* Category Content Area */}
      <div className="p-4 sm:p-6">
        {/* Category Average Display */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
          {categoryAverage !== null ? (
            <div className="text-right">
              <span className="text-sm text-gray-600">Average: </span>
              <span
                className={`ml-2 text-lg font-bold ${getGradeColor(
                  categoryAverage
                )}`}
              >
                {convertPercentageToGPA(
                  categoryAverage,
                  category.gpaScale || "4.0"
                ).toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-sm text-gray-600">Average: </span>
              <span className="ml-2 text-lg font-bold text-gray-400">--</span>
            </div>
          )}
        </div>

        {/* Assessments List */}
        <div className="space-y-3">
          {categoryGrades.length > 0 ? (
            categoryGrades.map((grade) => (
              <AssessmentCard
                key={grade.id}
                grade={grade}
                course={{ gpaScale: "4.0" }} // You might want to pass the actual course
                onAssessmentClick={onAssessmentClick}
                onEditScore={onEditScore}
                onEditAssessment={onEditAssessment}
                onDeleteAssessment={onDeleteAssessment}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {/* Empty Assessments State */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Assessments Yet
              </h3>
              <p className="text-gray-500 mb-1">This category is empty.</p>
              <p className="text-sm text-gray-400">
                Click the button above to add your first assessment!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentCategory;
