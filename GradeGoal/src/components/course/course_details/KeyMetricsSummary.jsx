// ========================================
// KEY METRICS SUMMARY COMPONENT
// ========================================
// Key metrics summary including assignments pending and upcoming deadlines

import React, { useMemo } from "react";

function KeyMetricsSummary({ grades, categories }) {
  // Calculate key metrics
  const metrics = useMemo(() => {
    const allGrades = Object.values(grades).flat();
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Pending assessments (no score)
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

    // Recent completions (last 7 days)
    const recentCompletions = allGrades.filter(grade => {
      if (!grade.updatedAt) return false;
      const completionDate = new Date(grade.updatedAt);
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return completionDate >= oneWeekAgo && grade.score;
    });

    // Category distribution
    const categoryStats = categories.map(category => {
      const categoryGrades = allGrades.filter(grade => grade.categoryId === category.id);
      const completed = categoryGrades.filter(grade => grade.score).length;
      const pending = categoryGrades.length - completed;
      return {
        name: category.name,
        completed,
        pending,
        total: categoryGrades.length,
        weight: category.weight || 0
      };
    });

    return {
      pendingAssessments,
      upcomingDeadlines,
      overdueAssessments,
      recentCompletions,
      categoryStats,
      totalAssessments: allGrades.length,
      completedAssessments: allGrades.filter(grade => grade.score).length
    };
  }, [grades, categories]);

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

  const UpcomingDeadlineItem = ({ grade }) => {
    const dueDate = new Date(grade.date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const isUrgent = daysUntilDue <= 3;
    
    return (
      <div className={`flex items-center justify-between p-2 rounded border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900">Key Metrics Summary</h3>
      </div>

      {/* Main Metrics Grid */}
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

      {/* Upcoming Deadlines Detail */}
      {metrics.upcomingDeadlines.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Deadlines</h4>
          <div className="space-y-2">
            {metrics.upcomingDeadlines.slice(0, 5).map((grade, index) => (
              <UpcomingDeadlineItem key={index} grade={grade} />
            ))}
            {metrics.upcomingDeadlines.length > 5 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                +{metrics.upcomingDeadlines.length - 5} more deadlines
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Category Progress</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.categoryStats.map((category, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{category.name}</h5>
                <span className="text-sm text-gray-600">{category.weight}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{category.completed}/{category.total} completed</span>
                <span>{category.pending} pending</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${category.total > 0 ? (category.completed / category.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Overall Progress</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.completedAssessments}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalAssessments}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.totalAssessments > 0 ? Math.round((metrics.completedAssessments / metrics.totalAssessments) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${metrics.totalAssessments > 0 ? (metrics.completedAssessments / metrics.totalAssessments) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyMetricsSummary;
