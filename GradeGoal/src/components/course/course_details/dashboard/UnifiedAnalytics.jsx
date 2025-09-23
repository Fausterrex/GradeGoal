// ========================================
// UNIFIED ANALYTICS COMPONENT
// ========================================
// Consolidated component that combines analytics, statistics, status badges, and key metrics

import React, { useMemo } from "react";
// Removed grade calculations import

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

    // Upcoming deadlines (only for assessments without scores)
    const upcomingDeadlines = allGrades.filter(grade => {
      if (!grade.date || grade.score) return false; // Exclude if no date or already has a score
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

  const performance_metrics = userAnalytics?.performance_metrics || {};
  const statistics = performance_metrics?.statistics || {};

  const MetricCard = ({ colorScheme,title, value, subtitle, icon, urgent = false }) => (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm  ${urgent ? 'border-red-300' : ''}`}>
      <div className={`${colorScheme} flex items-center gap-2 p-4 rounded-t-2xl`}>
        <span className="text-lg">{icon}</span>
        <h4 className="font-medium text-xl text-white">{title}</h4>
        {urgent && <span className="ml-auto text-red-600 text-sm font-medium">URGENT</span>}
      </div>

      <div className="p-6">
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-m text-gray-600">{subtitle}</div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          colorScheme='bg-orange-400'
          title="Pending"
          value={metrics.pendingAssessments.length}
          subtitle="Assessments to complete"
          icon="📝"
          urgent={metrics.pendingAssessments.length > 5}
        />

        <MetricCard
          colorScheme='bg-blue-500'
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
          colorScheme='bg-red-800'
          title="Overdue"
          value={metrics.overdueAssessments.length}
          subtitle="Past due assessments"
          icon="⚠️"
          urgent={metrics.overdueAssessments.length > 0}
        />

        <MetricCard
          colorScheme='bg-green-800'
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
