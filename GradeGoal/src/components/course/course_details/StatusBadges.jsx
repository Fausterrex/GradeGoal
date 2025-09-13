// ========================================
// STATUS BADGES COMPONENT
// ========================================
// Status badges showing overall course performance status

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function StatusBadges({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade 
}) {
  // Calculate status based on performance metrics
  const statusAnalysis = useMemo(() => {
    const allGrades = Object.values(grades).flat().filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    const totalAssessments = Object.values(grades).flat().length;
    const completedAssessments = allGrades.length;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

    // Calculate current performance
    const currentPercentage = currentGrade || 0;
    const currentGPA = convertPercentageToGPA(currentPercentage, course.gpaScale || "4.0");
    const targetGPA = targetGrade ? parseFloat(targetGrade) : null;

    // Calculate trend (simplified)
    const recentGrades = allGrades.slice(-3);
    const previousGrades = allGrades.slice(-6, -3);
    let trendDirection = 'stable';
    
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

      if (recentAvg - previousAvg > 5) trendDirection = 'improving';
      else if (recentAvg - previousAvg < -5) trendDirection = 'declining';
    }

    // Determine overall status
    let overallStatus = 'On Track';
    let statusColor = 'from-green-500 to-emerald-500';
    let statusIcon = '✅';
    let statusDescription = 'You are performing well and on track to meet your goals.';

    // Excelling criteria
    if (currentPercentage >= 90 || (targetGPA && currentGPA >= targetGPA + 0.5)) {
      overallStatus = 'Excelling';
      statusColor = 'from-purple-500 to-indigo-500';
      statusIcon = '🌟';
      statusDescription = 'Outstanding performance! You are exceeding expectations.';
    }
    // At Risk criteria
    else if (currentPercentage < 70 || completionRate < 50 || 
             (targetGPA && currentGPA < targetGPA - 0.5) ||
             trendDirection === 'declining') {
      overallStatus = 'At Risk';
      statusColor = 'from-red-500 to-pink-500';
      statusIcon = '⚠️';
      statusDescription = 'Performance needs immediate attention to stay on track.';
    }
    // Needs Attention criteria
    else if (currentPercentage < 80 || completionRate < 70 || 
             (targetGPA && currentGPA < targetGPA - 0.2)) {
      overallStatus = 'Needs Attention';
      statusColor = 'from-orange-500 to-yellow-500';
      statusIcon = '📈';
      statusDescription = 'Some areas need improvement to reach your goals.';
    }

    return {
      overallStatus,
      statusColor,
      statusIcon,
      statusDescription,
      metrics: {
        currentPercentage,
        currentGPA,
        targetGPA,
        completionRate,
        trendDirection,
        completedAssessments,
        totalAssessments
      }
    };
  }, [course, grades, targetGrade, currentGrade]);

  const StatusBadge = ({ title, value, subtitle, icon }) => (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{statusAnalysis.statusIcon}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{statusAnalysis.overallStatus}</h3>
            <p className="text-gray-600">{statusAnalysis.statusDescription}</p>
          </div>
        </div>
        
        {/* Status Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{statusAnalysis.metrics.currentPercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Current Grade</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{statusAnalysis.metrics.currentGPA.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Current GPA</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{statusAnalysis.metrics.completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Supporting Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Badge */}
        <StatusBadge
          title="Performance"
          value={statusAnalysis.metrics.currentPercentage.toFixed(0) + '%'}
          subtitle={statusAnalysis.metrics.currentPercentage >= 80 ? 'Strong' : 
                   statusAnalysis.metrics.currentPercentage >= 70 ? 'Good' : 'Needs Improvement'}
          icon="📊"
        />

        {/* Completion Badge */}
        <StatusBadge
          title="Completion"
          value={statusAnalysis.metrics.completedAssessments + '/' + statusAnalysis.metrics.totalAssessments}
          subtitle={statusAnalysis.metrics.completionRate >= 80 ? 'On Schedule' :
                   statusAnalysis.metrics.completionRate >= 60 ? 'Catching Up' : 'Behind Schedule'}
          icon="✅"
        />

        {/* Trend Badge */}
        <StatusBadge
          title="Trend"
          value={statusAnalysis.metrics.trendDirection === 'improving' ? '↗️' :
                 statusAnalysis.metrics.trendDirection === 'declining' ? '↘️' : '→'}
          subtitle={statusAnalysis.metrics.trendDirection === 'improving' ? 'Improving' :
                   statusAnalysis.metrics.trendDirection === 'declining' ? 'Declining' : 'Stable'}
          icon="📈"
        />
      </div>

      {/* Target Comparison */}
      {statusAnalysis.metrics.targetGPA && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Target Progress</h4>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{statusAnalysis.metrics.currentGPA.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current GPA</div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="text-2xl">
                {statusAnalysis.metrics.currentGPA >= statusAnalysis.metrics.targetGPA ? '🎯' : '📊'}
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-gray-900">{statusAnalysis.metrics.targetGPA.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Target GPA</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            {statusAnalysis.metrics.currentGPA >= statusAnalysis.metrics.targetGPA ? (
              <span className="text-green-600 font-medium">Target Achieved!</span>
            ) : (
              <span className="text-gray-600">
                Need {(statusAnalysis.metrics.targetGPA - statusAnalysis.metrics.currentGPA).toFixed(2)} more points
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusBadges;
