import React, { useState, useEffect, useMemo, FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../../styles/colors';
import { calculateGoalProgress, getProgressStatusInfo, getProgressBarColor } from '../../utils/goalProgress';
import { getGoalTypeLabel, getPriorityColors, getCourseName, formatGoalDate, getGoalTypeIcon, getGoalTypeColors } from '../../utils/goalUtils';

// Import icon images
const EditIcon = require('../../../assets/edit.png');
const DeleteIcon = require('../../../assets/delete.png');

interface GoalCardProps {
  goal: any;
  courses: any[];
  grades: any;
  onEdit: (goal: any) => void;
  onDelete: (goal: any) => void;
  isCompact?: boolean;
  allGoals?: any[];
}

export const GoalCard: FC<GoalCardProps> = ({
  goal,
  courses,
  grades,
  onEdit,
  onDelete,
  isCompact = false,
  allGoals = []
}) => {
  const [progressData, setProgressData] = useState({
    progress: 0,
    currentValue: 0,
    targetValue: 0,
    isAchieved: false,
    isOnTrack: false,
    achievementProbability: 0,
    remainingValue: 0,
    progressPercentage: 0,
    status: 'not_started',
    isCourseCompleted: false,
    courseCompletionStatus: 'ongoing'
  });

  // Memoize the goal progress calculation to prevent infinite loops
  const memoizedGoalProgress = useMemo(() => {
    if (!goal) return Promise.resolve({
      progress: 0,
      currentValue: 0,
      targetValue: 0,
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
    courses.map((c: any) => c.id || c.courseId).join(','),
    Object.keys(grades).join(','),
    allGoals.length
  ]);

  // Calculate goal progress asynchronously with proper caching
  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        const data = await memoizedGoalProgress;
        if (isMounted) {
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error calculating goal progress:', error);
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [memoizedGoalProgress]);

  const statusInfo = getProgressStatusInfo(progressData.status);
  const priorityColors = getPriorityColors(goal.priority);
  const goalTypeColors = getGoalTypeColors(goal.goalType);

  // Check if course is completed (for course-specific goals)
  const isCourseCompleted = useMemo(() => {
    if (!goal.courseId) return true; // Non-course goals are always considered "completed" for display purposes
    const course = courses.find((c: any) => c.courseId === goal.courseId);
    return course?.isCompleted === true;
  }, [goal.courseId, courses]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.goalTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(goal) }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: goalTypeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: goalTypeColors.primary }]}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => onEdit(goal)}
            style={[styles.actionButton, progressData.isCourseCompleted && styles.disabledButton]}
            disabled={progressData.isCourseCompleted}
          >
            <Image source={EditIcon} style={[styles.actionButtonImage, progressData.isCourseCompleted && styles.disabledButtonImage]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, progressData.isCourseCompleted && styles.disabledButton]}
            disabled={progressData.isCourseCompleted}
          >
            <Image source={DeleteIcon} style={[styles.actionButtonImage, progressData.isCourseCompleted && styles.disabledButtonImage]} />
          </TouchableOpacity>
        </View>

        {/* Goal Title */}
        <View style={styles.titleSection}>
          <Text style={styles.goalTitle} numberOfLines={2}>
            {goal.goalTitle || (goal.courseId ? getCourseName(goal.courseId, courses) : 'Untitled Goal')}
          </Text>
          
          {/* Priority Badge and Achievement Status */}
          <View style={styles.badgeContainer}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors.secondary }]}>
              <Text style={[styles.priorityText, { color: priorityColors.primary }]}>
                {goal.priority} PRIORITY
              </Text>
            </View>
            {goal.isAchieved && (
              <View style={styles.achievedBadge}>
                <Text style={styles.achievedText}>🏆 ACHIEVED</Text>
              </View>
            )}
          </View>
          
          {/* Goal Type & Due Date */}
          <View style={styles.goalInfo}>
            <Text style={styles.goalType}>{getGoalTypeIcon(goal.goalType)} {getGoalTypeLabel(goal.goalType)}</Text>
            <Text style={styles.dueDate}>
              📅 {goal.isAchieved && goal.achievedDate 
                ? `Achieved: ${formatGoalDate(goal.achievedDate)}`
                : `Target: ${formatGoalDate(goal.targetDate)}`
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          {/* Current vs Target */}
          <View style={styles.valueContainer}>
            <View style={styles.valueItem}>
              <Text style={[
                styles.currentValue,
                {
                  color: progressData.currentValue >= progressData.targetValue 
                    ? colors.green[600] 
                    : progressData.currentValue >= progressData.targetValue * 0.8
                    ? colors.blue[600]
                    : progressData.currentValue >= progressData.targetValue * 0.6
                    ? colors.yellow[600]
                    : colors.red[600]
                }
              ]}>
                {progressData.currentValue.toFixed(2)}
              </Text>
              <Text style={styles.valueLabel}>Current</Text>
            </View>
            
            <Text style={styles.separator}>/</Text>
            
            <View style={styles.valueItem}>
              <Text style={[styles.targetValue, { color: colors.blue[600] }]}>
                {progressData.targetValue}
              </Text>
              <Text style={styles.valueLabel}>Target</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{progressData.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressData.progress}%`,
                    backgroundColor: progressData.progress >= 80
                      ? colors.green[500]
                      : progressData.progress >= 60
                      ? colors.blue[500]
                      : progressData.progress >= 40
                      ? colors.yellow[500]
                      : colors.red[500]
                  }
                ]}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: progressData.isAchieved 
                  ? colors.green[100] 
                  : progressData.isOnTrack 
                  ? colors.blue[100] 
                  : colors.orange[100]
              }
            ]}>
              <Text style={styles.statusIcon}>
                {progressData.isAchieved ? '✓' : progressData.isOnTrack ? '↑' : '!'}
              </Text>
              <Text style={[
                styles.statusText,
                {
                  color: progressData.isAchieved 
                    ? colors.green[700] 
                    : progressData.isOnTrack 
                    ? colors.blue[700] 
                    : colors.orange[700]
                }
              ]}>
                {progressData.isAchieved ? 'Goal Achieved!' : progressData.isOnTrack ? 'On Track' : 'Needs Focus'}
              </Text>
            </View>
            
            {!progressData.isAchieved && (
              <Text style={styles.remainingText}>
                <Text style={styles.remainingValue}>
                  {(progressData.targetValue - progressData.currentValue).toFixed(2)}
                </Text> points needed to reach your goal
              </Text>
            )}
          </View>
        </View>

        {/* Course Completion Status */}
        {progressData.isCourseCompleted && (
          <View style={[
            styles.completionSection,
            {
              backgroundColor: progressData.status === 'achieved' 
                ? colors.green[50] 
                : progressData.status === 'close_to_goal'
                ? colors.purple[50]
                : colors.orange[50]
            }
          ]}>
            <Text style={styles.completionIcon}>
              {progressData.status === 'achieved' ? '🎉' : progressData.status === 'close_to_goal' ? '✨' : '💪'}
            </Text>
            <Text style={[
              styles.completionTitle,
              {
                color: progressData.status === 'achieved' 
                  ? colors.green[800] 
                  : progressData.status === 'close_to_goal'
                  ? colors.purple[800]
                  : colors.orange[800]
              }
            ]}>
              Course Completed!
            </Text>
            <Text style={[
              styles.completionMessage,
              {
                color: progressData.status === 'achieved' 
                  ? colors.green[700] 
                  : progressData.status === 'close_to_goal'
                  ? colors.purple[700]
                  : colors.orange[700]
              }
            ]}>
              {progressData.status === 'achieved' 
                ? `Amazing! You exceeded your target with ${progressData.currentValue} GPA!`
                : progressData.status === 'close_to_goal'
                ? `So close! You achieved ${progressData.currentValue} GPA`
                : `Great effort! Final GPA: ${progressData.currentValue}`
              }
            </Text>
          </View>
        )}

        {/* Motivational Message */}
        {!progressData.isCourseCompleted && (
          <View style={styles.motivationSection}>
            <Text style={styles.motivationText}>🚀 Every journey starts with a single step!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    position: 'relative',
  },
  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonImage: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  disabledButtonImage: {
    tintColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  achievedBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  achievedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.green[700],
  },
  goalInfo: {
    alignItems: 'center',
    gap: 4,
  },
  goalType: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  dueDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 24,
  },
  valueItem: {
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    fontSize: 24,
    color: colors.gray[300],
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.gray[200],
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  remainingValue: {
    fontWeight: 'bold',
    color: colors.orange[600],
  },
  completionSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completionMessage: {
    fontSize: 12,
    textAlign: 'center',
  },
  motivationSection: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: colors.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.gray[200],
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});
