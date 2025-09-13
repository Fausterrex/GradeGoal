// ========================================
// GOAL ACHIEVEMENT LIKELIHOOD COMPONENT
// ========================================
// Calculates and displays the likelihood of achieving course goals

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function GoalAchievementLikelihood({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade 
}) {
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

    // Calculate various factors affecting likelihood
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

    // Factor 5: Category Performance Distribution
    let categoryPerformance = 0;
    categories.forEach(category => {
      const categoryGrades = completedGrades.filter(grade => grade.categoryId === category.id);
      if (categoryGrades.length > 0) {
        const categoryAvg = categoryGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / categoryGrades.length;
        
        if (categoryAvg >= 80) categoryPerformance += 1;
        else if (categoryAvg < 70) categoryPerformance -= 1;
      }
    });

    if (categoryPerformance > 0) {
      factors.push({ name: 'Category Performance', impact: 5, description: 'Strong across categories', positive: true });
      likelihood += 5;
    } else if (categoryPerformance < 0) {
      factors.push({ name: 'Category Performance', impact: -5, description: 'Weak in some categories', positive: false });
      likelihood -= 5;
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
  }, [course, grades, categories, targetGrade, currentGrade]);

  const FactorItem = ({ factor }) => (
    <div className={`flex items-center justify-between p-2 rounded border ${
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
  );

  if (!targetGrade) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Achievement Likelihood</h3>
        <p className="text-gray-600 mb-4">No goal set. Set a target GPA to see achievement likelihood.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Set Target Goal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Likelihood Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Goal Achievement Likelihood</h3>
            <p className="text-gray-600">{likelihoodAnalysis.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{likelihoodAnalysis.likelihood}%</div>
            <div className="text-sm text-gray-600">{likelihoodAnalysis.status}</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
      </div>

      {/* Factors Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Factors Affecting Likelihood</h4>
        <div className="space-y-2">
          {likelihoodAnalysis.factors.map((factor, index) => (
            <FactorItem key={index} factor={factor} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {likelihoodAnalysis.likelihood < 60 && (
            <div className="flex items-start gap-2 p-3 bg-white rounded border border-orange-200">
              <div className="text-orange-600 mt-0.5">⚠️</div>
              <div>
                <div className="font-medium text-gray-900">Focus on Improvement</div>
                <div className="text-sm text-gray-600">Consider additional study time or seeking help to improve performance</div>
              </div>
            </div>
          )}
          {likelihoodAnalysis.metrics.completionRate < 70 && (
            <div className="flex items-start gap-2 p-3 bg-white rounded border border-blue-200">
              <div className="text-blue-600 mt-0.5">⏰</div>
              <div>
                <div className="font-medium text-gray-900">Complete Pending Work</div>
                <div className="text-sm text-gray-600">Focus on completing pending assessments to improve your standing</div>
              </div>
            </div>
          )}
          {likelihoodAnalysis.likelihood >= 80 && (
            <div className="flex items-start gap-2 p-3 bg-white rounded border border-green-200">
              <div className="text-green-600 mt-0.5">✅</div>
              <div>
                <div className="font-medium text-gray-900">Keep Up the Great Work!</div>
                <div className="text-sm text-gray-600">Continue maintaining your current performance to achieve your goal</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoalAchievementLikelihood;
