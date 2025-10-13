// ========================================
// UNIFIED GRADE BREAKDOWN COMPONENT
// ========================================
// Consolidated component that combines enhanced grade breakdown and goal achievement likelihood

import React, { useMemo } from "react";
import { calculateCategoryAverage, calculateGPAForPercentage, calculateAssessmentPercentage, hasValidScore } from "../utils/gradeEntryCalculations";
import { percentageToGPA } from "../../academic_goal/gpaConversionUtils";
function UnifiedGradeBreakdown({
  categories,
  grades,
  course,
  colorScheme,
  targetGrade,
  currentGrade,
  activeSemesterTerm,
  isMidtermCompleted
}) {
  // Get category analysis with proper calculations
  const getCategoryAnalysis = (category) => {
    const categoryGrades = grades[category.id] || [];
    const completedGrades = categoryGrades.filter(grade => hasValidScore(grade));

    // Calculate category average
    let average = null;
    if (completedGrades.length > 0) {
      const totalPercentage = completedGrades.reduce((sum, grade) => {
        const percentage = calculateAssessmentPercentage(grade.score, grade.maxScore);
        return sum + (percentage || 0);
      }, 0);
      average = totalPercentage / completedGrades.length;
    }

    // Calculate contribution to overall grade
    let contribution = 0;
    if (average !== null && category.weight) {
      contribution = (average * category.weight) / 100;
    }

    return {
      average,
      count: categoryGrades.length,
      completed: completedGrades.length,
      pending: categoryGrades.length - completedGrades.length,
      weight: category.weight || 0,
      contribution
    };
  };

  // Calculate term-specific contributions (50/50 split)
  const getTermContribution = (term) => {
    let termContribution = 0;
    let totalCategoryWeight = 0;
    
    categories.forEach(category => {
      const categoryGrades = grades[category.id] || [];
      const termGrades = categoryGrades.filter(grade => grade.semesterTerm === term);
      const completedTermGrades = termGrades.filter(grade => hasValidScore(grade));
      
      // Each term gets 50% of each category's weight
      const termCategoryWeight = (category.weight || 0) * 0.5;
      totalCategoryWeight += category.weight || 0;
      
      if (completedTermGrades.length > 0) {
        // Calculate term average for this category
        const termAverage = completedTermGrades.reduce((sum, grade) => {
          const percentage = calculateAssessmentPercentage(grade.score, grade.maxScore);
          return sum + (percentage || 0);
        }, 0) / completedTermGrades.length;
        
        // Calculate contribution based on 50% of category weight
        const categoryContribution = (termAverage * termCategoryWeight) / 100;
        termContribution += categoryContribution;
      }
    });
    
    return {
      contribution: termContribution,
      weight: totalCategoryWeight * 0.5, // Each term gets 50% of total weight
      percentage: totalCategoryWeight > 0 ? (termContribution / (totalCategoryWeight * 0.5)) * 100 : 0
    };
  };

  // Calculate term-specific data
  const midtermData = getTermContribution('MIDTERM');
  const finalTermData = getTermContribution('FINAL_TERM');

  const getOverallContribution = () => {
    // Calculate overall contribution as sum of term contributions for consistency
    const totalContribution = midtermData.contribution + finalTermData.contribution;
    
    return totalContribution;
  };

  // Calculate current GPA - handle both number and string formats
  const currentGPA = (() => {
    console.log('🔍 [DEBUG] UnifiedGradeBreakdown - currentGrade prop:', currentGrade, typeof currentGrade);
    console.log('🔍 [DEBUG] UnifiedGradeBreakdown - course prop:', course);
    console.log('🔍 [DEBUG] UnifiedGradeBreakdown - course?.courseGpa:', course?.courseGpa);
    
    if (typeof currentGrade === 'number') {
      return currentGrade;
    } else if (typeof currentGrade === 'string') {
      if (currentGrade === 'R') {
        return 0; // R grade = 0 GPA
      } else {
        return parseFloat(currentGrade) || 0;
      }
    }
    return 0;
  })();

  // Goal achievement likelihood analysis with proper calculations
  const likelihoodAnalysis = useMemo(() => {
    // Handle targetGrade conversion - it might be a string like 'R', '1.00', etc.
    let targetGPA = null;
    if (targetGrade) {
      if (typeof targetGrade === 'string') {
        // If it's already a GPA string (like 'R', '1.00', '2.50'), use it directly
        if (targetGrade === 'R') {
          targetGPA = 0; // R grade = 0 GPA
        } else {
          targetGPA = parseFloat(targetGrade);
        }
      } else if (typeof targetGrade === 'number') {
        // If it's a number, convert from percentage to GPA
        targetGPA = percentageToGPA(targetGrade, course?.gpaScale === '5.0' ? 5.0 : 4.0);
      }
    }
    
    const overallContribution = getOverallContribution();

    if (!targetGPA) {
      return {
        likelihood: 0,
        status: 'No Goal Set',
        color: 'from-gray-400 to-gray-500',
        description: 'Set a target GPA to calculate achievement likelihood',
        factors: [],
        metrics: {
          currentGPA: currentGPA,
          targetGPA: 0,
          gpaGap: 0,
          completionRate: 0,
          remainingAssessments: 0,
          totalAssessments: 0
        }
      };
    }

    // Calculate completion rate
    let totalAssessments = 0;
    let completedAssessments = 0;
    categories.forEach(category => {
      const analysis = getCategoryAnalysis(category);
      totalAssessments += analysis.count;
      completedAssessments += analysis.completed;
    });

    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
    const remainingAssessments = totalAssessments - completedAssessments;
    const gpaGap = targetGPA - currentGPA;

    // Calculate likelihood based on current progress and gap
    let likelihood = 50; // Default
    let status = 'Unknown';
    let description = 'Goal achievement analysis in progress';
    const factors = [];

    if (currentGPA >= targetGPA) {
      likelihood = 100;
      status = 'Achieved';
      description = 'Goal already achieved!';
    } else if (completionRate >= 100) {
      likelihood = 0;
      status = 'Not Achievable';
      description = 'Course completed but goal not reached';
    } else if (gpaGap <= 0.5 && completionRate >= 75) {
      likelihood = 85;
      status = 'Very Likely';
      description = 'Strong progress toward goal';
      factors.push({ name: 'Small Gap', description: 'Close to target GPA', impact: 20, positive: true });
      factors.push({ name: 'High Completion', description: 'Most assessments completed', impact: 15, positive: true });
    } else if (gpaGap <= 1.0 && completionRate >= 50) {
      likelihood = 65;
      status = 'Likely';
      description = 'Good progress toward goal';
      factors.push({ name: 'Moderate Gap', description: 'Manageable GPA difference', impact: 10, positive: true });
      factors.push({ name: 'Steady Progress', description: 'Halfway through assessments', impact: 10, positive: true });
    } else if (gpaGap <= 2.0 && completionRate >= 25) {
      likelihood = 40;
      status = 'Possible';
      description = 'Challenging but achievable';
      factors.push({ name: 'Large Gap', description: 'Significant GPA improvement needed', impact: -15, positive: false });
      factors.push({ name: 'Early Stage', description: 'Many assessments remaining', impact: 10, positive: true });
    } else {
      likelihood = 20;
      status = 'Unlikely';
      description = 'Very challenging to achieve goal';
      factors.push({ name: 'Large Gap', description: 'Significant GPA improvement needed', impact: -25, positive: false });
      factors.push({ name: 'Low Completion', description: 'Few assessments completed', impact: -10, positive: false });
    }

    return {
      likelihood,
      status,
      color: likelihood >= 80 ? 'from-green-400 to-green-500' :
             likelihood >= 60 ? 'from-blue-400 to-blue-500' :
             likelihood >= 40 ? 'from-yellow-400 to-yellow-500' :
             'from-red-400 to-red-500',
      description,
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
  }, [targetGrade, currentGPA, categories, grades]);

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
      <div className="bg-white rounded-xl border border-gray-300 shadow-xl">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <h4 className="text-xl font-bold text-gray-900">{category.name}</h4>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Weight</div>
              <div className="text-lg font-bold text-gray-900">{category.weight}%</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 ">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-orange-100 rounded-2xl border border-orange-300 shadow-xl flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.average ? `${analysis.average.toFixed(2)}%` : '--'}
              </div>
              <div className="text-sm text-gray-600">Average</div>
            </div>

            <div className="text-center p-4 bg-blue-100 rounded-2xl border border-blue-300 shadow-xl flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.average ? (() => {
                  const gpa = percentageToGPA(analysis.average, course?.gpaScale === '5.0' ? 5.0 : 4.0);
                  return gpa === 'R' ? 'R' : parseFloat(gpa).toFixed(2);
                })() : '--'}
              </div>
              <div className="text-sm text-gray-500">
                {analysis.average ? `(${Math.round(analysis.average)}%)` : ''}
              </div>
              <div className="text-sm text-gray-600">GPA</div>
            </div>

            <div className="text-center p-4 bg-green-100 rounded-2xl border border-green-300 shadow-xl flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">{analysis.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>

            <div className="text-center p-4 bg-red-100 rounded-2xl border border-red-300 shadow-xl flex flex-col items-center justify-center">
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
                className={`h-full ${progressPercentage < 40
                    ? "bg-red-600"
                    : progressPercentage < 80
                      ? "bg-orange-500"
                      : "bg-green-600"
                  }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

          </div>

          {/* Contribution to Overall Grade */}
          <div className="bg-gray-100 rounded border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Contribution to Course Grade</div>
                <div className="text-xs text-gray-500">Based on weight and performance</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{analysis.contribution.toFixed(2)}%</div>
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
            Grade Breakdown
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
      <div className="bg-white rounded-xl border border-gray-300 shadow overflow-hidden">
        <div className="bg-gray-100 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Grade Breakdown
          </h3>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gray-50 rounded-xl border border-gray-300 p-6">
        <h4 className="text-xl font-bold text-gray-900 ml-5 mb-4">Overall Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          <div className="text-center p-9 bg-orange-100 rounded-xl border border-orange-300 shadow-xl flex flex-col justify-center transition-transform duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-black">
              {getOverallContribution().toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Weighted Average</div>
          </div>
          <div className="text-center p-4 bg-pink-100 rounded-xl border border-pink-300 shadow-xl flex flex-col justify-center transition-transform duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-gray-900">
              {(() => {
                const gpa = course?.courseGpa || currentGPA;
                console.log('🔍 [DEBUG] Overall GPA calculation - course?.courseGpa:', course?.courseGpa);
                console.log('🔍 [DEBUG] Overall GPA calculation - currentGPA:', currentGPA);
                console.log('🔍 [DEBUG] Overall GPA calculation - final gpa value:', gpa);
                if (typeof gpa === 'string' && gpa === 'R') return 'R';
                return parseFloat(gpa).toFixed(2);
              })()}
            </div>
            <div className="text-sm text-gray-500">
              ({getOverallContribution().toFixed(2)}%)
            </div>
            <div className="text-sm text-gray-600">Overall GPA</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-xl border border-red-300 shadow-xl flex flex-col justify-center transition-transform duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
        
        {/* Term Contributions (50/50 Split) */}
        <div className="mt-6">
          <h5 className="text-lg font-bold text-gray-900 ml-5 mb-2">Term Contributions</h5>
          <p className="text-sm text-gray-600 ml-5 mb-4">Each term contributes 50% to the final grade</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="text-center p-6 bg-blue-100 rounded-xl border border-blue-300 shadow-xl flex flex-col justify-center transition-transform duration-300 hover:scale-105">
              <div className="text-2xl font-bold text-gray-900">
                {midtermData.contribution.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500">
                (50% of total weight)
              </div>
              <div className="text-sm text-gray-600">Midterm</div>
              <div className="text-xs text-gray-500 mt-1">
                {isMidtermCompleted ? '✅ Completed' : '⏳ In Progress'}
              </div>
            </div>
            <div className="text-center p-6 bg-green-100 rounded-xl border border-green-300 shadow-xl flex flex-col justify-center transition-transform duration-300 hover:scale-105">
              <div className="text-2xl font-bold text-gray-900">
                {finalTermData.contribution.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500">
                (50% of total weight)
              </div>
              <div className="text-sm text-gray-600">Final Term</div>
              <div className="text-xs text-gray-500 mt-1">
                {activeSemesterTerm === 'FINAL_TERM' ? '⏳ In Progress' : '📅 Upcoming'}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Goal Achievement Likelihood */}
      {targetGrade && (
        <div className="bg-white rounded-lg border border-gray-400 shadow-lg p-6">
          <h4 className="text-2xl font-bold text-center text-gray-900">
            Goal Achievement Likelihood
          </h4>
          <p className="text-center text-gray-600 mb-6">
            {likelihoodAnalysis.description}
          </p>

          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-50 h-50">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="18"
                  fill="none"
                />

                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  stroke={
                    likelihoodAnalysis.likelihood < 25
                      ? "#EF4444"
                      : likelihoodAnalysis.likelihood < 50
                        ? "#F97316"
                        : likelihoodAnalysis.likelihood < 80
                          ? "#3B82F6"
                          : "#22C55E"
                  }
                  strokeWidth="18"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={
                    2 * Math.PI * 70 - (likelihoodAnalysis.likelihood / 100) * (2 * Math.PI * 70)
                  }
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">
                  {likelihoodAnalysis.likelihood}%
                </div>
                <div className="text-m text-gray-600">{likelihoodAnalysis.status}</div>
              </div>
            </div>
          </div>


          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-4xl bg-gradient-to-r from-blue-200 to-blue-300 border border-blue-500 p-4 text-center shadow-xl transition-transform duration-300 hover:scale-105">
              <div className="text-gray-500 mb-1 text-2xl">📈</div>
              <div className="font-semibold text-lg text-gray-900">Current GPA</div>
              <div className="text-xl font-bold text-gray-900">
                {typeof likelihoodAnalysis.metrics.currentGPA === 'string' ? likelihoodAnalysis.metrics.currentGPA : likelihoodAnalysis.metrics.currentGPA.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-4xl bg-gradient-to-r from-green-200 to-green-300 border border-green-500 p-4 text-center shadow-xl transition-transform duration-300 hover:scale-105">
              <div className="text-gray-500 mb-1 text-2xl">🎯</div>
              <div className="font-medium text-lg text-gray-900">Target GPA</div>
              <div className="text-xl font-bold text-gray-900">
                {typeof likelihoodAnalysis.metrics.targetGPA === 'string' ? likelihoodAnalysis.metrics.targetGPA : likelihoodAnalysis.metrics.targetGPA.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-4xl bg-gradient-to-r from-orange-200 to-orange-300 border border-orange-500 p-4 text-center shadow-xl transition-transform duration-300 hover:scale-105">
              <div className="text-gray-500 mb-1 text-2xl">📊</div>
              <div className="font-medium text-lg text-gray-900">Gap to Close</div>
              <div className="text-lg font-bold text-gray-900">
                {Math.abs(typeof likelihoodAnalysis.metrics.gpaGap === 'string' ? parseFloat(likelihoodAnalysis.metrics.gpaGap) : likelihoodAnalysis.metrics.gpaGap).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-4xl bg-gradient-to-r from-violet-200 to-violet-300 border border-violet-500 p-4 text-center shadow-xl transition-transform duration-300 hover:scale-105">
              <div className="text-gray-500 mb-1 text-2xl">✔️</div>
              <div className="font-medium text-lg text-gray-900">Completion</div>
              <div className="text-lg font-bold text-gray-900">
                {typeof likelihoodAnalysis.metrics.completionRate === 'string' ? likelihoodAnalysis.metrics.completionRate : likelihoodAnalysis.metrics.completionRate.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Factors */}
          <div className="space-y-3">
            {likelihoodAnalysis.factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full ${factor.positive ? factor.impact > 0 ? "bg-green-500" : "bg-gray-400" : factor.impact < -10
                      ? "bg-red-500" : "bg-orange-500"
                      }`}
                  ></span>
                  <div>
                    <div className="font-medium text-gray-900">{factor.name}</div>
                    <div className="text-sm text-gray-600">{factor.description}</div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${factor.positive ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {factor.impact > 0 ? "+" : ""}
                  {factor.impact}%
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
