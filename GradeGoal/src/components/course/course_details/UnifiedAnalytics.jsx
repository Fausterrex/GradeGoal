// ========================================
// UNIFIED ANALYTICS COMPONENT
// ========================================
// Consolidated component that combines analytics, statistics, status badges, and key metrics

import React, { useMemo } from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function UnifiedAnalytics({ 
  userAnalytics, 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade 
}) {
  // Calculate key metrics
  const metrics = useMemo(() => {
    const allGrades = Object.values(grades).flat();
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Pending assessments
    const pendingAssessments = allGrades.filter(grade => 
      !grade.score || grade.score === null || grade.score === undefined || grade.score === ""
    );

    // Upcoming deadlines
    const upcomingDeadlines = allGrades.filter(grade => {
      if (!grade.date) return false;
      const dueDate = new Date(grade.date);
      return dueDate >= today && dueDate <= twoWeeksFromNow;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Overdue assessments
    const overdueAssessments = allGrades.filter(grade => {
      if (!grade.date || grade.score) return false;
      const dueDate = new Date(grade.date);
      return dueDate < today;
    });

    // Recent completions
    const recentCompletions = allGrades.filter(grade => {
      if (!grade.updatedAt) return false;
      const completionDate = new Date(grade.updatedAt);
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return completionDate >= oneWeekAgo && grade.score;
    });

    return {
      pendingAssessments,
      upcomingDeadlines,
      overdueAssessments,
      recentCompletions,
      totalAssessments: allGrades.length,
      completedAssessments: allGrades.filter(grade => grade.score).length
    };
  }, [grades]);

  // Get status based on current performance
  const getStatus = () => {
    const currentGPA = convertPercentageToGPA(currentGrade, course.gpaScale || "4.0");
    const targetGPA = targetGrade ? parseFloat(targetGrade) : null;
    
    if (!targetGPA) return { status: 'No Goal', color: 'gray', icon: '❓' };
    
    const gap = targetGPA - currentGPA;
    if (gap <= 0) return { status: 'Excelling', color: 'green', icon: '🎉' };
    if (gap <= 0.2) return { status: 'On Track', color: 'blue', icon: '✅' };
    if (gap <= 0.5) return { status: 'At Risk', color: 'yellow', icon: '⚠️' };
    return { status: 'Needs Attention', color: 'red', icon: '🚨' };
  };

  const status = getStatus();
  const performance_metrics = userAnalytics?.performance_metrics || {};
  const predictions = performance_metrics?.predictions || {};
  const statistics = performance_metrics?.statistics || {};

  const getStatusColor = (statusColor) => {
    switch (statusColor) {
      case 'green': return 'from-green-500 to-emerald-500';
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'yellow': return 'from-yellow-500 to-orange-500';
      case 'red': return 'from-red-500 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, urgent = false }) => (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${urgent ? 'border-red-300' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h4 className="font-medium text-gray-900">{title}</h4>
        {urgent && <span className="ml-auto text-red-600 text-sm font-medium">URGENT</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${getStatusColor(status.color)} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{status.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">Current Status</h3>
                <p className="text-white/80">{status.status}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {userAnalytics?.current_grade?.toFixed(1) || currentGrade?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-white/80">Current Grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending"
          value={metrics.pendingAssessments.length}
          subtitle="Assessments to complete"
          icon="📝"
          urgent={metrics.pendingAssessments.length > 5}
        />

        <MetricCard
          title="Upcoming"
          value={metrics.upcomingDeadlines.length}
          subtitle="Deadlines in next 2 weeks"
          icon="⏰"
          urgent={metrics.upcomingDeadlines.filter(g => {
            const daysUntilDue = Math.ceil((new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilDue <= 3;
          }).length > 0}
        />

        <MetricCard
          title="Overdue"
          value={metrics.overdueAssessments.length}
          subtitle="Past due assessments"
          icon="⚠️"
          urgent={metrics.overdueAssessments.length > 0}
        />

        <MetricCard
          title="Recent"
          value={metrics.recentCompletions.length}
          subtitle="Completed this week"
          icon="✅"
        />
      </div>

      {/* Performance Metrics */}
      {(performance_metrics?.study_efficiency || performance_metrics?.assignment_completion_rate) && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Study Efficiency */}
            <div className="p-4 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Study Efficiency</span>
                <span className="text-sm font-bold text-gray-900">
                  {performance_metrics?.study_efficiency?.toFixed(0) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${performance_metrics?.study_efficiency || 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">Based on grade consistency</div>
            </div>

            {/* Completion Rate */}
            <div className="p-4 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {performance_metrics?.assignment_completion_rate?.toFixed(0) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${performance_metrics?.assignment_completion_rate || 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">Assignments completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && Object.keys(statistics).length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average */}
            <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
              <div className="text-xl font-bold text-blue-900">
                {statistics.average?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-blue-600">Average Score</div>
            </div>

            {/* Best */}
            <div className="text-center p-4 bg-green-50 rounded border border-green-200">
              <div className="text-xl font-bold text-green-900">
                {statistics.best?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-green-600">Best Score</div>
            </div>

            {/* Total Assignments */}
            <div className="text-center p-4 bg-purple-50 rounded border border-purple-200">
              <div className="text-xl font-bold text-purple-900">
                {statistics.total_assignments || 0}
              </div>
              <div className="text-sm text-purple-600">Total Assignments</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines Detail */}
      {metrics.upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Deadlines</h4>
          <div className="space-y-2">
            {metrics.upcomingDeadlines.slice(0, 5).map((grade, index) => {
              const dueDate = new Date(grade.date);
              const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilDue <= 3;
              
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div>
                    <div className="font-medium text-gray-900">{grade.name}</div>
                    <div className="text-sm text-gray-600">
                      {dueDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                    {daysUntilDue === 0 ? 'Due Today' :
                     daysUntilDue === 1 ? 'Due Tomorrow' :
                     `${daysUntilDue} days`}
                  </div>
                </div>
              );
            })}
            {metrics.upcomingDeadlines.length > 5 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                +{metrics.upcomingDeadlines.length - 5} more deadlines
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedAnalytics;
