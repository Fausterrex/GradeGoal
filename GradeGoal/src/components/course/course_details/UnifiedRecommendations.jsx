// ========================================
// UNIFIED RECOMMENDATIONS COMPONENT
// ========================================
// Consolidated component that combines basic recommendations and smart analytics-based recommendations

import React, { useState, useMemo } from "react";
import analyticsService from "../../../services/analyticsService";

function UnifiedRecommendations({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  userAnalytics 
}) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());

  // Generate basic recommendations based on course data
  const basicRecommendations = useMemo(() => {
    const recommendations = [];
    const allGrades = Object.values(grades).flat();
    const completedGrades = allGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    const currentGPA = currentGrade ? (currentGrade / 100) * 4 : 0;
    const targetGPA = targetGrade ? parseFloat(targetGrade) : null;

    // Goal-based recommendations
    if (targetGPA && currentGPA < targetGPA) {
      const gap = targetGPA - currentGPA;
      if (gap > 0.5) {
        recommendations.push({
          id: 'goal-gap-large',
          type: 'goal_achievement',
          priority: 'high',
          title: 'Significant Goal Gap',
          message: `You need to improve by ${gap.toFixed(2)} GPA points to reach your target. Focus on upcoming high-weight assignments.`,
          action: 'goal_review'
        });
      } else if (gap > 0.2) {
        recommendations.push({
          id: 'goal-gap-moderate',
          type: 'goal_achievement',
          priority: 'medium',
          title: 'Moderate Goal Gap',
          message: `You're ${gap.toFixed(2)} GPA points away from your target. Stay consistent with current performance.`,
          action: 'goal_review'
        });
      }
    }

    // Completion-based recommendations
    const completionRate = allGrades.length > 0 ? (completedGrades.length / allGrades.length) * 100 : 0;
    if (completionRate < 70) {
      recommendations.push({
        id: 'completion-low',
        type: 'time_management',
        priority: 'high',
        title: 'Low Completion Rate',
        message: `Only ${completionRate.toFixed(0)}% of assignments completed. Focus on completing pending work.`,
        action: 'deadline_management'
      });
    }

    // Performance-based recommendations
    if (completedGrades.length >= 3) {
      const recentGrades = completedGrades.slice(-3);
      const olderGrades = completedGrades.slice(-6, -3);
      
      if (recentGrades.length >= 2 && olderGrades.length >= 2) {
        const recentAvg = recentGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / recentGrades.length;

        const olderAvg = olderGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / olderGrades.length;

        const trend = recentAvg - olderAvg;
        if (trend < -5) {
          recommendations.push({
            id: 'performance-declining',
            type: 'study_strategy',
            priority: 'high',
            title: 'Performance Declining',
            message: 'Recent grades show a declining trend. Consider reviewing study methods.',
            action: 'study_method_review'
          });
        }
      }
    }

    // Category-based recommendations
    categories.forEach(category => {
      const categoryGrades = completedGrades.filter(grade => grade.categoryId === category.id);
      if (categoryGrades.length >= 2) {
        const categoryAvg = categoryGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / categoryGrades.length;

        if (categoryAvg < 70) {
          recommendations.push({
            id: `category-weak-${category.id}`,
            type: 'study_strategy',
            priority: 'medium',
            title: `Weak in ${category.name}`,
            message: `Your average in ${category.name} is ${categoryAvg.toFixed(1)}%. Focus more on this category.`,
            action: 'study_focus',
            categories: [category.name]
          });
        }
      }
    });

    return recommendations;
  }, [course, grades, categories, targetGrade, currentGrade]);

  // Get smart recommendations from analytics service
  const smartRecommendations = useMemo(() => {
    if (!userAnalytics || !course) return [];
    return analyticsService.generateRecommendations(userAnalytics, course, categories);
  }, [userAnalytics, course, categories]);

  // Combine and deduplicate recommendations
  const allRecommendations = useMemo(() => {
    const combined = [...basicRecommendations, ...smartRecommendations];
    
    // Remove duplicates based on similar titles/messages
    const unique = [];
    const seen = new Set();
    
    combined.forEach(rec => {
      const key = `${rec.type}-${rec.title.toLowerCase().replace(/\s+/g, '-')}`;
      if (!seen.has(key) && !dismissedRecommendations.has(rec.id)) {
        seen.add(key);
        unique.push(rec);
      }
    });

    // Sort by priority
    return unique.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [basicRecommendations, smartRecommendations, dismissedRecommendations]);

  const dismissRecommendation = (id) => {
    setDismissedRecommendations(prev => new Set([...prev, id]));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study_strategy': return '📚';
      case 'time_management': return '⏰';
      case 'goal_achievement': return '🎯';
      case 'performance': return '📊';
      default: return '💡';
    }
  };

  const getActionButton = (action, title) => {
    switch (action) {
      case 'study_focus':
        return (
          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Focus Study
          </button>
        );
      case 'study_method_review':
        return (
          <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Review Methods
          </button>
        );
      case 'deadline_management':
        return (
          <button className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
            Manage Deadlines
          </button>
        );
      case 'goal_review':
        return (
          <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Review Goals
          </button>
        );
      default:
        return (
          <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Learn More
          </button>
        );
    }
  };

  if (allRecommendations.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <span className="text-4xl text-green-500">✅</span>
          <p className="text-gray-700 mt-2 font-medium">Great job!</p>
          <p className="text-gray-500">You're on track with your studies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
        </div>
        <p className="text-sm text-gray-600">
          Personalized study suggestions based on your performance data
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {allRecommendations.map((recommendation, index) => (
          <div 
            key={index}
            className={`rounded border p-4 ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                      recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation.message}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {getActionButton(recommendation.action, recommendation.title)}
                <button
                  onClick={() => dismissRecommendation(recommendation.id)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dismiss
                </button>
                {recommendation.categories && (
                  <div className="text-xs text-gray-500">
                    {recommendation.categories.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded border border-blue-200 p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          Study Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">📚 Spaced Repetition</div>
            <div>Review material at increasing intervals to improve retention</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">⏰ Pomodoro Technique</div>
            <div>Study in 25-minute focused sessions with 5-minute breaks</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">🎯 Active Recall</div>
            <div>Test yourself instead of just re-reading notes</div>
          </div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">📝 Practice Problems</div>
            <div>Solve problems similar to what you'll see on exams</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedRecommendations;
