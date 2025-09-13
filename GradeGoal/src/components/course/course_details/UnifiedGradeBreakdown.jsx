// ========================================
// UNIFIED GRADE BREAKDOWN COMPONENT
// ========================================
// Consolidated component that combines enhanced grade breakdown and goal achievement likelihood

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function UnifiedGradeBreakdown({ 
  categories, 
  grades, 
  course, 
  colorScheme,
  targetGrade,
  currentGrade
}) {
  // Calculate category analysis
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

  // Calculate goal achievement likelihood
  const likelihoodAnalysis = useMemo(() => {
    const allGrades = Object.values(grades).flat();
    const completedGrades = allGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    const currentPercentage = currentGrade || 0;
    const currentGPA = convertPercentageToGPA(currentPercentage, course.gpaScale || "4.0");
    const targetGPA = targetGrade ? parseFloat(targetGrade) : null;

    if (!targetGPA) {
      return {
        likelihood: 0,
        status: 'No Goal Set',
        color: 'from-gray-400 to-gray-500',
        description: 'Set a target GPA to calculate achievement likelihood',
        factors: []
      };
    }

    const factors = [];
    let likelihood = 50; // Base likelihood

    // Factor 1: Current Performance vs Target
    const gpaGap = targetGPA - currentGPA;
    if (currentGPA >= targetGPA) {
      factors.push({ name: 'Current Performance', impact: 25, description: 'Already meeting target', positive: true });
      likelihood += 25;
    } else if (gpaGap <= 0.2) {
      factors.push({ name: 'Current Performance', impact: 15, description: 'Close to target', positive: true });
      likelihood += 15;
    } else if (gpaGap <= 0.5) {
      factors.push({ name: 'Current Performance', impact: 0, description: 'Moderate gap to close', positive: false });
      likelihood += 0;
    } else {
      factors.push({ name: 'Current Performance', impact: -20, description: 'Significant gap to close', positive: false });
      likelihood -= 20;
    }

    // Factor 2: Completion Rate
    const completionRate = allGrades.length > 0 ? (completedGrades.length / allGrades.length) * 100 : 0;
    if (completionRate >= 80) {
      factors.push({ name: 'Assessment Completion', impact: 15, description: 'High completion rate', positive: true });
      likelihood += 15;
    } else if (completionRate >= 60) {
      factors.push({ name: 'Assessment Completion', impact: 5, description: 'Good completion rate', positive: true });
      likelihood += 5;
    } else if (completionRate >= 40) {
      factors.push({ name: 'Assessment Completion', impact: -5, description: 'Moderate completion rate', positive: false });
      likelihood -= 5;
    } else {
      factors.push({ name: 'Assessment Completion', impact: -15, description: 'Low completion rate', positive: false });
      likelihood -= 15;
    }

    // Factor 3: Recent Performance Trend
    const recentGrades = completedGrades.slice(-3);
    const previousGrades = completedGrades.slice(-6, -3);
    if (recentGrades.length >= 2 && previousGrades.length >= 2) {
      const recentAvg = recentGrades.reduce((sum, grade) => {
        let adjustedScore = grade.score;
        if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
          adjustedScore += grade.extraCreditPoints;
        }
        return sum + (adjustedScore / grade.maxScore) * 100;
      }, 0) / recentGrades.length;

      const previousAvg = previousGrades.reduce((sum, grade) => {
        let adjustedScore = grade.score;
        if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
          adjustedScore += grade.extraCreditPoints;
        }
        return sum + (adjustedScore / grade.maxScore) * 100;
      }, 0) / previousGrades.length;

      const trend = recentAvg - previousAvg;
      if (trend > 5) {
        factors.push({ name: 'Recent Trend', impact: 10, description: 'Improving performance', positive: true });
        likelihood += 10;
      } else if (trend < -5) {
        factors.push({ name: 'Recent Trend', impact: -10, description: 'Declining performance', positive: false });
        likelihood -= 10;
      } else {
        factors.push({ name: 'Recent Trend', impact: 0, description: 'Stable performance', positive: false });
      }
    }

    // Factor 4: Remaining Assessments
    const remainingAssessments = allGrades.filter(grade => !grade.score).length;
    const totalAssessments = allGrades.length;
    const remainingPercentage = totalAssessments > 0 ? (remainingAssessments / totalAssessments) * 100 : 0;
    
    if (remainingPercentage <= 20) {
      factors.push({ name: 'Remaining Work', impact: 10, description: 'Minimal work remaining', positive: true });
      likelihood += 10;
    } else if (remainingPercentage <= 40) {
      factors.push({ name: 'Remaining Work', impact: 5, description: 'Moderate work remaining', positive: true });
      likelihood += 5;
    } else if (remainingPercentage <= 60) {
      factors.push({ name: 'Remaining Work', impact: -5, description: 'Significant work remaining', positive: false });
      likelihood -= 5;
    } else {
      factors.push({ name: 'Remaining Work', impact: -10, description: 'Most work still pending', positive: false });
      likelihood -= 10;
    }

    // Ensure likelihood is between 0 and 100
    likelihood = Math.max(0, Math.min(100, likelihood));

    // Determine status and color
    let status, color;
    if (likelihood >= 80) {
      status = 'Very Likely';
      color = 'from-green-500 to-emerald-500';
    } else if (likelihood >= 60) {
      status = 'Likely';
      color = 'from-blue-500 to-cyan-500';
    } else if (likelihood >= 40) {
      status = 'Possible';
      color = 'from-yellow-500 to-orange-500';
    } else if (likelihood >= 20) {
      status = 'Unlikely';
      color = 'from-orange-500 to-red-500';
    } else {
      status = 'Very Unlikely';
      color = 'from-red-500 to-pink-500';
    }

    return {
      likelihood,
      status,
      color,
      description: `Based on current performance and trends, you have a ${likelihood}% chance of achieving your target GPA of ${targetGPA.toFixed(2)}.`,
      factors,
      metrics: {
        currentGPA,
        targetGPA,
        gpaGap,
        completionRate,
        remainingAssessments,
        totalAssessments
      }
    };
  }, [grades, categories, targetGrade, currentGrade, course.gpaScale]);

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
            Grade Breakdown & Goal Analysis
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
            Grade Breakdown & Goal Analysis
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

      {/* Goal Achievement Likelihood */}
      {targetGrade && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">Goal Achievement Likelihood</h4>
              <p className="text-gray-600">{likelihoodAnalysis.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{likelihoodAnalysis.likelihood}%</div>
              <div className="text-sm text-gray-600">{likelihoodAnalysis.status}</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{likelihoodAnalysis.metrics.currentGPA.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current GPA</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{likelihoodAnalysis.metrics.targetGPA.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Target GPA</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{Math.abs(likelihoodAnalysis.metrics.gpaGap).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Gap to Close</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{likelihoodAnalysis.metrics.completionRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>

          {/* Factors Analysis */}
          <div className="space-y-2">
            {likelihoodAnalysis.factors.map((factor, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded border ${
                factor.positive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div>
                  <div className="font-medium text-gray-900">{factor.name}</div>
                  <div className="text-sm text-gray-600">{factor.description}</div>
                </div>
                <div className={`text-sm font-medium ${
                  factor.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default UnifiedGradeBreakdown;
