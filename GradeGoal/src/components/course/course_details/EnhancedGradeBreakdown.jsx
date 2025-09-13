// ========================================
// ENHANCED GRADE BREAKDOWN COMPONENT
// ========================================
// Comprehensive grade breakdown with detailed category analysis

import React from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";
import { getGradeColor } from "../../../utils/gradeCalculations";

function EnhancedGradeBreakdown({ 
  categories, 
  grades, 
  course, 
  colorScheme 
}) {
  const getCategoryAnalysis = (category) => {
    const categoryGrades = grades[category.id] || [];
    const completedGrades = categoryGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    if (completedGrades.length === 0) {
      return {
        average: null,
        count: categoryGrades.length,
        completed: 0,
        pending: categoryGrades.length,
        weight: category.weight || 0,
        contribution: 0
      };
    }

    const percentages = completedGrades.map(grade => {
      let adjustedScore = grade.score;
      if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
        adjustedScore += grade.extraCreditPoints;
      }
      return (adjustedScore / grade.maxScore) * 100;
    });

    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const contribution = (average * category.weight) / 100;

    return {
      average,
      count: categoryGrades.length,
      completed: completedGrades.length,
      pending: categoryGrades.length - completedGrades.length,
      weight: category.weight || 0,
      contribution
    };
  };

  const getOverallContribution = () => {
    return categories.reduce((total, category) => {
      const analysis = getCategoryAnalysis(category);
      return total + analysis.contribution;
    }, 0);
  };

  const CategoryBreakdownCard = ({ category, analysis, index }) => {
    const progressPercentage = analysis.count > 0 ? (analysis.completed / analysis.count) * 100 : 0;
    const isComplete = analysis.completed === analysis.count && analysis.count > 0;
    const isPartial = analysis.completed > 0 && analysis.completed < analysis.count;
    const isEmpty = analysis.count === 0;

    const getStatusIcon = () => {
      if (isEmpty) {
        return <span className="text-lg">📦</span>;
      }
      if (isComplete) {
        return <span className="text-lg">✅</span>;
      }
      return <span className="text-lg">⏰</span>;
    };

    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <h4 className="text-lg font-bold text-gray-900">{category.name}</h4>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Weight</div>
              <div className="text-lg font-bold text-gray-900">{category.weight}%</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded border">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.average ? `${analysis.average.toFixed(1)}%` : '--'}
              </div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded border">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.average ? convertPercentageToGPA(analysis.average, course.gpaScale || "4.0").toFixed(2) : '--'}
              </div>
              <div className="text-sm text-gray-600">GPA</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded border">
              <div className="text-2xl font-bold text-gray-900">{analysis.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded border">
              <div className="text-2xl font-bold text-gray-900">{analysis.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Completion Progress</span>
              <span className="text-sm font-bold text-gray-900">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gray-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Contribution to Overall Grade */}
          <div className="bg-gray-50 rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Contribution to Course Grade</div>
                <div className="text-xs text-gray-500">Based on weight and performance</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{analysis.contribution.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">points</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Enhanced Grade Breakdown
          </h3>
        </div>
        <div className="p-8 text-center">
          <span className="text-6xl mb-4 text-gray-300">📊</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Categories Found</h3>
          <p className="text-gray-500">Assessment categories need to be set up to see grade breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Enhanced Grade Breakdown
          </h3>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gray-50 rounded border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded border">
            <div className="text-3xl font-bold text-gray-900">{getOverallContribution().toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Weighted Average</div>
          </div>
          <div className="text-center p-4 bg-white rounded border">
            <div className="text-3xl font-bold text-gray-900">
              {convertPercentageToGPA(getOverallContribution(), course.gpaScale || "4.0").toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Overall GPA</div>
          </div>
          <div className="text-center p-4 bg-white rounded border">
            <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category, index) => {
          const analysis = getCategoryAnalysis(category);
          return (
            <CategoryBreakdownCard
              key={category.id}
              category={category}
              analysis={analysis}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default EnhancedGradeBreakdown;
