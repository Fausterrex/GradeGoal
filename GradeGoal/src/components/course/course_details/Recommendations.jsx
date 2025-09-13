// ========================================
// RECOMMENDATIONS COMPONENT
// ========================================
// Course-specific recommendations with categorization and priority levels

import React, { useState, useMemo } from "react";

function Recommendations({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade 
}) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());

  // Generate recommendations based on course data
  const recommendations = useMemo(() => {
    const allGrades = Object.values(grades).flat();
    const completedGrades = allGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    const pendingGrades = allGrades.filter(grade => !grade.score);
    const overdueGrades = pendingGrades.filter(grade => {
      if (!grade.date) return false;
      return new Date(grade.date) < new Date();
    });

    const upcomingDeadlines = pendingGrades.filter(grade => {
      if (!grade.date) return false;
      const dueDate = new Date(grade.date);
      const today = new Date();
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= oneWeekFromNow;
    });

    const completionRate = allGrades.length > 0 ? (completedGrades.length / allGrades.length) * 100 : 0;
    const currentPercentage = currentGrade || 0;
    const targetPercentage = targetGrade ? parseFloat(targetGrade) * 25 : null; // Convert GPA to percentage

    const recs = [];

    // Study Strategy Recommendations
    if (currentPercentage < 70) {
      recs.push({
        id: 'study-strategy-1',
        type: 'Study Strategy',
        priority: 'High',
        title: 'Improve Study Techniques',
        description: 'Your current performance suggests a need for better study strategies. Consider active learning techniques, spaced repetition, and regular review sessions.',
        action: 'Focus on understanding concepts rather than memorization. Try the Pomodoro technique for study sessions.',
        category: 'Study Strategy',
        icon: '📚',
        color: 'from-blue-500 to-cyan-500'
      });
    }

    if (currentPercentage < 80 && targetPercentage && currentPercentage < targetPercentage - 10) {
      recs.push({
        id: 'study-strategy-2',
        type: 'Study Strategy',
        priority: 'Medium',
        title: 'Targeted Study Sessions',
        description: 'Focus your study time on areas where you can make the most impact to reach your target grade.',
        action: 'Review past assessments to identify weak areas and create focused study plans.',
        category: 'Study Strategy',
        icon: '🎯',
        color: 'from-green-500 to-emerald-500'
      });
    }

    // Time Management Recommendations
    if (overdueGrades.length > 0) {
      recs.push({
        id: 'time-management-1',
        type: 'Time Management',
        priority: 'High',
        title: 'Address Overdue Assessments',
        description: `You have ${overdueGrades.length} overdue assessment${overdueGrades.length > 1 ? 's' : ''}. Prioritize completing these to avoid further grade impact.`,
        action: 'Create a schedule to complete overdue work immediately. Consider contacting instructors about extensions.',
        category: 'Time Management',
        icon: '⚠️',
        color: 'from-red-500 to-pink-500'
      });
    }

    if (upcomingDeadlines.length > 0) {
      recs.push({
        id: 'time-management-2',
        type: 'Time Management',
        priority: 'Medium',
        title: 'Plan for Upcoming Deadlines',
        description: `You have ${upcomingDeadlines.length} assessment${upcomingDeadlines.length > 1 ? 's' : ''} due within the next week.`,
        action: 'Create a timeline to complete these assessments. Break larger tasks into smaller, manageable chunks.',
        category: 'Time Management',
        icon: '⏰',
        color: 'from-orange-500 to-yellow-500'
      });
    }

    if (completionRate < 60) {
      recs.push({
        id: 'time-management-3',
        type: 'Time Management',
        priority: 'Medium',
        title: 'Improve Assignment Completion',
        description: 'Your completion rate is below optimal. Consider better time management and prioritization strategies.',
        action: 'Use a planner or digital calendar to schedule dedicated time for each assessment.',
        category: 'Time Management',
        icon: '📅',
        color: 'from-purple-500 to-indigo-500'
      });
    }

    // Performance Recommendations
    const recentGrades = completedGrades.slice(-3);
    if (recentGrades.length >= 2) {
      const recentAvg = recentGrades.reduce((sum, grade) => {
        let adjustedScore = grade.score;
        if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
          adjustedScore += grade.extraCreditPoints;
        }
        return sum + (adjustedScore / grade.maxScore) * 100;
      }, 0) / recentGrades.length;

      if (recentAvg < 70) {
        recs.push({
          id: 'performance-1',
          type: 'Performance',
          priority: 'High',
          title: 'Recent Performance Decline',
          description: 'Your recent assessment scores have been below expectations. Immediate attention is needed.',
          action: 'Review recent assessments for common mistakes. Consider seeking help from instructors or tutors.',
          category: 'Performance',
          icon: '📉',
          color: 'from-red-500 to-pink-500'
        });
      }
    }

    // Category-specific recommendations
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

        if (categoryAvg < 70) {
          recs.push({
            id: `category-${category.id}`,
            type: 'Study Strategy',
            priority: 'Medium',
            title: `Focus on ${category.name}`,
            description: `Your performance in ${category.name} (${categoryAvg.toFixed(1)}%) needs improvement. This category is worth ${category.weight}% of your grade.`,
            action: `Dedicate extra study time to ${category.name.toLowerCase()}. Review past assessments and seek additional resources.`,
            category: 'Study Strategy',
            icon: '📖',
            color: 'from-yellow-500 to-orange-500'
          });
        }
      }
    });

    // Positive reinforcement recommendations
    if (currentPercentage >= 85) {
      recs.push({
        id: 'positive-1',
        type: 'Motivation',
        priority: 'Low',
        title: 'Excellent Performance!',
        description: 'You are performing exceptionally well. Keep up the great work!',
        action: 'Continue your current study habits and consider helping classmates who might be struggling.',
        category: 'Motivation',
        icon: '🌟',
        color: 'from-green-500 to-emerald-500'
      });
    }

    return recs.filter(rec => !dismissedRecommendations.has(rec.id));
  }, [course, grades, categories, targetGrade, currentGrade, dismissedRecommendations]);

  const dismissRecommendation = (id) => {
    setDismissedRecommendations(prev => new Set([...prev, id]));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Study Strategy': return '📚';
      case 'Time Management': return '⏰';
      case 'Performance': return '📊';
      case 'Motivation': return '🌟';
      default: return '💡';
    }
  };

  const RecommendationCard = ({ recommendation }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">{recommendation.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">{recommendation.type}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                {recommendation.priority} Priority
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => dismissRecommendation(recommendation.id)}
          className="text-gray-400 hover:text-gray-600"
          title="Dismiss recommendation"
        >
          ✕
        </button>
      </div>
      <p className="text-gray-700 mb-3">{recommendation.description}</p>
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="font-medium text-blue-900 mb-1">Recommended Action:</div>
        <div className="text-blue-800 text-sm">{recommendation.action}</div>
      </div>
    </div>
  );

  // Group recommendations by type
  const recommendationsByType = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec);
    return acc;
  }, {});

  // Sort by priority
  Object.keys(recommendationsByType).forEach(type => {
    recommendationsByType[type].sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  });

  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Recommendations</h3>
        <p className="text-gray-600">No specific recommendations at this time. Keep up the great work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Course-Specific Recommendations</h3>
        <p className="text-gray-600 text-sm">{recommendations.length} personalized recommendation{recommendations.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Recommendations by Category */}
      {Object.entries(recommendationsByType).map(([type, recs]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(type)}</span>
            <h4 className="text-lg font-semibold text-gray-900">{type}</h4>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {recs.length} recommendation{recs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recs.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </div>
      ))}

      {/* Dismissed Recommendations Summary */}
      {dismissedRecommendations.size > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-700">Dismissed Recommendations</h4>
              <p className="text-sm text-gray-500">{dismissedRecommendations.size} recommendation{dismissedRecommendations.size !== 1 ? 's' : ''} dismissed</p>
            </div>
            <button
              onClick={() => setDismissedRecommendations(new Set())}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Restore All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
