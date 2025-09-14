// ========================================
// ENHANCED GOAL CARD COMPONENT
// ========================================
// This component displays academic goal cards with enhanced analytics
// Features: Grade trend analysis, predictive insights, trend-based recommendations

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateGoalProgress } from './goalProgress';
import AnalyticsService from '../../../services/analyticsService';
import { getProgressStatusInfo, getProgressBarColor } from './goalProgress';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../backend/api';

const EnhancedGoalCard = ({ goal, courses, grades, allGoals, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);

  // Memoized goal progress calculation
  const memoizedGoalProgress = useMemo(() => {
    if (!goal) return Promise.resolve({
      progress: 0,
      currentValue: 0,
      targetValue: goal?.targetValue || 0,
      isAchieved: false,
      isOnTrack: false,
      achievementProbability: 0,
      remainingValue: 0,
      progressPercentage: 0,
      status: 'not_started',
      isCourseCompleted: false,
      courseCompletionStatus: 'ongoing'
    });
    
    return calculateGoalProgress(goal, courses, grades, {}, allGoals);
  }, [
    goal?.goalId,
    goal?.targetValue,
    goal?.goalType,
    goal?.courseId,
    goal?.semester,
    goal?.academicYear,
    courses.map(c => c.id || c.courseId).join(','),
    Object.keys(grades).join(','),
    allGoals.length
  ]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser || !goal) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile to get userId
        const userProfile = await getUserProfile(currentUser.email);
        
        // Load analytics data
        const analyticsData = await AnalyticsService.getUserAnalytics(
          userProfile.userId, 
          goal.courseId || null
        );
        
        setAnalytics(analyticsData);
        
        // Calculate enhanced progress with trend data
        const progress = await memoizedGoalProgress;
        const enhancedProgress = {
          ...progress,
          achievementProbability: AnalyticsService.calculateTrendBasedProbability(
            progress.currentValue,
            progress.targetValue,
            analyticsData.gradeTrend,
            goal.goalType,
            goal.targetDate
          ),
          status: AnalyticsService.getTrendBasedStatus(
            progress.currentValue,
            progress.targetValue,
            analyticsData.gradeTrend,
            progress.isAchieved,
            progress.currentValue >= progress.targetValue * 0.8,
            progress.isOnTrack
          )
        };
        
        setProgressData(enhancedProgress);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to basic progress calculation
        const progress = await memoizedGoalProgress;
        setProgressData(progress);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser, goal, memoizedGoalProgress]);

  if (isLoading || !progressData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const statusInfo = getProgressStatusInfo(progressData.status);
  const trendInfo = analytics ? AnalyticsService.getTrendColorScheme(analytics.gradeTrend) : null;
  const recommendations = analytics ? AnalyticsService.getTrendBasedRecommendations(
    analytics.gradeTrend, 
    progressData.status
  ) : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGoalTypeIcon = (goalType) => {
    switch (goalType) {
      case 'COURSE_GRADE':
        return '📚';
      case 'SEMESTER_GPA':
        return '📊';
      case 'CUMMULATIVE_GPA':
        return '🎓';
      default:
        return '🎯';
    }
  };

  const getGoalTypeText = (goalType) => {
    switch (goalType) {
      case 'COURSE_GRADE':
        return 'Course Grade';
      case 'SEMESTER_GPA':
        return 'Semester GPA';
      case 'CUMMULATIVE_GPA':
        return 'Cumulative GPA';
      default:
        return 'Academic Goal';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className={`${statusInfo.bgColor} px-6 py-4 border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getGoalTypeIcon(goal.goalType)}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{goal.goalTitle}</h3>
              <p className="text-sm text-gray-600">{getGoalTypeText(goal.goalType)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {trendInfo && (
              <div className={`${trendInfo.bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
                <span className="text-sm">{trendInfo.icon}</span>
                <span className={`text-xs font-medium ${trendInfo.textColor}`}>
                  {analytics.gradeTrend > 0 ? '+' : ''}{analytics.gradeTrend.toFixed(2)}/week
                </span>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
              <span className={`text-xs font-medium ${statusInfo.textColor}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{progressData.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(progressData.status, progressData.progressPercentage)}`}
              style={{ width: `${Math.min(progressData.progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Grade Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progressData.currentValue}</div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progressData.targetValue}</div>
            <div className="text-sm text-gray-600">Target</div>
          </div>
        </div>

        {/* Analytics Insights */}
        {analytics && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics Insights
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Assignments:</span>
                <span className="font-medium ml-1">{analytics.assignmentsCompleted} completed</span>
              </div>
              <div>
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium ml-1">{analytics.assignmentsPending}</span>
              </div>
            </div>
            {analytics.gradeTrend !== 0 && (
              <div className="mt-3 text-sm">
                <span className="text-gray-600">Trend:</span>
                <span className={`font-medium ml-1 ${trendInfo.textColor}`}>
                  {analytics.gradeTrend > 0 ? 'Improving' : 'Declining'} by {Math.abs(analytics.gradeTrend).toFixed(2)} points per week
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievement Probability */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Achievement Probability</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(progressData.achievementProbability)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${Math.min(progressData.achievementProbability, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Goal Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Target Date: {formatDate(goal.targetDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Priority: {goal.priority || 'Medium'}</span>
          </div>
          {goal.description && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              {goal.description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit Goal
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGoalCard;
