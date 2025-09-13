// ========================================
// STATISTICAL INDICATORS COMPONENT
// ========================================
// Displays statistical performance indicators (average, best, worst)

import React from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function StatisticalIndicators({ 
  grades, 
  categories, 
  course 
}) {
  // Calculate statistics from all grades
  const getAllGrades = () => {
    return Object.values(grades).flat().filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );
  };

  const allGrades = getAllGrades();
  
  const getStatistics = () => {
    if (allGrades.length === 0) {
      return {
        average: 0,
        best: 0,
        worst: 0,
        totalAssessments: 0,
        completedAssessments: 0
      };
    }

    const percentages = allGrades.map(grade => {
      let adjustedScore = grade.score;
      if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
        adjustedScore += grade.extraCreditPoints;
      }
      return (adjustedScore / grade.maxScore) * 100;
    });

    const totalAssessments = Object.values(grades).flat().length;
    const completedAssessments = allGrades.length;

    return {
      average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
      best: Math.max(...percentages),
      worst: Math.min(...percentages),
      totalAssessments,
      completedAssessments
    };
  };

  const stats = getStatistics();

  const StatCard = ({ title, value, subtitle, icon }) => (
    <div className="bg-white p-6 rounded border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
      </div>
      <div className="text-3xl font-bold mb-1 text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );

  const getPerformanceIcon = (value, type) => {
    const isGood = (type === 'average' && value >= 80) || 
                   (type === 'best' && value >= 90) || 
                   (type === 'worst' && value >= 70);
    
    return (
      <span className="text-lg text-gray-600">
        {type === 'average' && '📊'}
        {type === 'best' && '🏆'}
        {type === 'worst' && '⚠️'}
      </span>
    );
  };

  if (allGrades.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Performance Statistics
          </h3>
        </div>
        <div className="p-8 text-center">
          <span className="text-6xl mb-4 text-gray-300">📊</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500">Complete some assessments to see performance statistics</p>
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
            Performance Statistics
          </h3>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Average Performance"
          value={`${stats.average.toFixed(1)}%`}
          subtitle={`${convertPercentageToGPA(stats.average, course.gpaScale || "4.0").toFixed(2)} GPA`}
          icon={getPerformanceIcon(stats.average, 'average')}
        />
        
        <StatCard
          title="Best Performance"
          value={`${stats.best.toFixed(1)}%`}
          subtitle={`${convertPercentageToGPA(stats.best, course.gpaScale || "4.0").toFixed(2)} GPA`}
          icon={getPerformanceIcon(stats.best, 'best')}
        />
        
        <StatCard
          title="Lowest Performance"
          value={`${stats.worst.toFixed(1)}%`}
          subtitle={`${convertPercentageToGPA(stats.worst, course.gpaScale || "4.0").toFixed(2)} GPA`}
          icon={getPerformanceIcon(stats.worst, 'worst')}
        />
      </div>

      {/* Completion Summary */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Assessment Completion</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900">{stats.completedAssessments}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded border">
            <div className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span>{((stats.completedAssessments / stats.totalAssessments) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-600 h-2 rounded-full"
              style={{ width: `${(stats.completedAssessments / stats.totalAssessments) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticalIndicators;
