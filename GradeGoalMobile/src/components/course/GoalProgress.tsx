import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface GoalProgressProps {
  currentGrade: number;
  targetGrade: number | null;
  course: any;
  colorScheme: any;
  grades: any[];
  categories: any[];
  onSetGoal: () => void;
  isCompact?: boolean;
  aiAnalysis?: any; // AI analysis data
  successRate?: number | null; // Success rate from AI analysis
  bestPossibleGPA?: number | null; // Best possible GPA from AI analysis
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  currentGrade,
  targetGrade,
  course,
  colorScheme,
  grades,
  categories,
  onSetGoal,
  isCompact = false,
  aiAnalysis,
  successRate,
  bestPossibleGPA,
}) => {
  // Debug logging
  // Calculate course completion progress (matching web version logic)
  const calculateCourseCompletion = () => {
    if (!categories || categories.length === 0) return 0;
    
    let totalExpectedAssessments = 0;
    let completedAssessments = 0;
    
    categories.forEach((category: any) => {
      const categoryGrades = grades.filter((grade: any) => grade.categoryId === category.id);
      
      // Each category should have at least 1 assessment for a complete course
      // If category has assessments, count them; if empty, expect at least 1
      const expectedInCategory = Math.max(categoryGrades.length, 1);
      totalExpectedAssessments += expectedInCategory;
      
      // Count completed assessments in this category
      categoryGrades.forEach((grade: any) => {
        // Only count as completed if there's a meaningful score (> 0)
        if (grade.score !== null && grade.score !== undefined && grade.score > 0) {
          completedAssessments++;
        }
      });
    });
    
    return totalExpectedAssessments > 0 ? (completedAssessments / totalExpectedAssessments) * 100 : 0;
  };

  const getProgressPercentage = () => {
    if (!targetGrade || targetGrade === 0) return 0;
    
    // Now targetGrade is already in GPA scale (4.0), no conversion needed
    
    // Match web version logic exactly:
    // Show 100% if GPA target is met or exceeded, regardless of completion status
    if (currentGrade >= targetGrade) {
      return 100;
    }
    
    // Otherwise, use course completion progress (same as web version)
    const courseProgress = calculateCourseCompletion();
    return courseProgress;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return colors.green[500];
    if (progress >= 80) return colors.blue[500];
    if (progress >= 70) return colors.yellow[500];
    if (progress >= 60) return colors.orange[500];
    return colors.red[500];
  };

  const progressPercentage = getProgressPercentage();
  const progressColor = getProgressColor(progressPercentage);

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactHeader, { backgroundColor: colorScheme.primary }]}>
          <View style={styles.compactHeaderLeft}>
            <View style={styles.goalIcon}>
              <Text style={styles.goalIconText}>G</Text>
            </View>
            <Text style={styles.compactHeaderText}>Goal Progress</Text>
          </View>
        </View>
        
        <View style={styles.compactContent}>
          {/* Main Progress Circle */}
          <View style={styles.progressCircle}>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {progressPercentage !== null && progressPercentage !== undefined ? progressPercentage.toFixed(0) : '0'}%
            </Text>
            <Text style={styles.progressLabel}>Progress</Text>
          </View>

          {/* GPA Goal Probability Section - Only show if AI analysis exists */}
          {(() => {
            const shouldShow = aiAnalysis && (successRate !== null || bestPossibleGPA !== null);
            return shouldShow;
          })() ? (
            <View style={styles.gpaGoalSection}>
              <View style={styles.gpaGoalHeader}>
                <View style={styles.gpaGoalHeaderLeft}>
                  <Text style={styles.gpaGoalIcon}>✓</Text>
                  <Text style={styles.gpaGoalTitle}>GPA Goal Probability</Text>
                </View>
              </View>
              
              <View style={styles.successProbabilitySection}>
                <View style={styles.successProbabilityHeader}>
                  <Text style={styles.successProbabilityIcon}>🎯</Text>
                  <Text style={styles.successProbabilityLabel}>Success Probability</Text>
                </View>
                {successRate !== null && successRate !== undefined ? (
                  <View style={styles.successProbabilityBar}>
                    <View style={[styles.successProbabilityFill, { width: `${Math.min(successRate, 100)}%`, backgroundColor: progressColor }]} />
                    <Text style={styles.successProbabilityText}>{successRate.toFixed(0)}%</Text>
                  </View>
                ) : (
                  <View style={styles.noAiAnalysisContainer}>
                    <Text style={styles.noAiAnalysisText}>Get AI Analysis to determine the success rate</Text>
                    <TouchableOpacity style={styles.getAiAnalysisButton} onPress={onSetGoal}>
                      <Text style={styles.getAiAnalysisButtonText}>Get AI Analysis</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.bestPossibleSection}>
                <Text style={styles.bestPossibleLabel}>Best Possible GPA</Text>
                <Text style={styles.bestPossibleValue}>
                  {bestPossibleGPA ? bestPossibleGPA.toFixed(2) : (targetGrade ? (targetGrade / 25).toFixed(2) : 'N/A')}
                </Text>
                <Text style={styles.bestPossibleSubtext}>With perfect performance on remaining assessments.</Text>
              </View>
            </View>
          ) : null}

          {/* GPA Stats Grid */}
          <View style={styles.gpaStatsGrid}>
            <View style={styles.gpaStatCard}>
              <Text style={styles.gpaStatIcon}>📊</Text>
              <Text style={styles.gpaStatValue}>{currentGrade.toFixed(2)}</Text>
              <Text style={styles.gpaStatLabel}>Current GPA</Text>
            </View>
            
            <View style={styles.gpaStatCard}>
              <View style={styles.targetGpaIcon}>
                <Text style={styles.targetGpaIconText}>G</Text>
              </View>
              <Text style={styles.gpaStatValue}>{targetGrade ? targetGrade.toFixed(2) : 'N/A'}</Text>
              <Text style={styles.gpaStatLabel}>Target GPA</Text>
            </View>
            
            <View style={styles.gpaStatCard}>
              <Text style={styles.gpaStatIcon}>✓</Text>
              <Text style={styles.gpaStatValue}>
                {targetGrade ? `Need ${(targetGrade - currentGrade).toFixed(2)} more GPA points` : 'Set a target GPA first'}
              </Text>
              <Text style={styles.gpaStatSubtext}>
                {targetGrade ? `to reach your target GPA of ${targetGrade.toFixed(2)}` : 'to track your progress'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colorScheme.primary }]}>
        <Text style={styles.headerText}>🎯 Goal Progress</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {progressPercentage !== null && progressPercentage !== undefined ? progressPercentage.toFixed(0) : '0'}%
            </Text>
            <Text style={styles.progressLabel}>Progress</Text>
          </View>
        </View>

        {targetGrade && (
          <View style={styles.goalDetails}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Current GPA</Text>
              <Text style={[styles.goalValue, { color: colors.blue[600] }]}>
                {currentGrade !== null && currentGrade !== undefined ? currentGrade.toFixed(2) : '0.00'}
              </Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target GPA</Text>
              <Text style={[styles.goalValue, { color: colors.green[600] }]}>
                {targetGrade !== null && targetGrade !== undefined ? targetGrade.toFixed(2) : '0.00'}
              </Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Gap to Close</Text>
              <Text style={[styles.goalValue, { color: colors.orange[600] }]}>
                {targetGrade !== null && currentGrade !== null && targetGrade !== undefined && currentGrade !== undefined ? (targetGrade - currentGrade).toFixed(2) : '0.00'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.setGoalButton} onPress={onSetGoal}>
          <Text style={styles.setGoalButtonText}>Set Goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  compactContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
  compactHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
  },
  content: {
    padding: 16,
  },
  compactContent: {
    padding: 12,
    alignItems: 'center',
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    borderWidth: 4,
    borderColor: colors.gray[200],
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  goalDetails: {
    gap: 12,
    marginBottom: 16,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  setGoalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  setGoalButtonText: {
    fontSize: 14,
    color: colors.text.white,
    fontWeight: '600',
  },
  // New styles for web-like design
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  goalIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.green[600],
  },
  gpaGoalSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  gpaGoalHeader: {
    marginBottom: 16,
  },
  gpaGoalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpaGoalIcon: {
    fontSize: 16,
    color: colors.green[600],
    marginRight: 8,
  },
  gpaGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  successProbabilitySection: {
    marginBottom: 16,
  },
  successProbabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successProbabilityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  successProbabilityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  successProbabilityBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  successProbabilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  successProbabilityText: {
    position: 'absolute',
    right: 8,
    top: -2,
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bestPossibleSection: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%',
  },
  bestPossibleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  bestPossibleValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue[600],
    marginBottom: 4,
    textAlign: 'center',
  },
  bestPossibleSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  gpaStatsGrid: {
    marginTop: 16,
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  gpaStatCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    width: '100%',
  },
  gpaStatIcon: {
    fontSize: 16,
    marginBottom: 8,
  },
  gpaStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  gpaStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  gpaStatSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  targetGpaIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.green[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetGpaIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  noAiAnalysisContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noAiAnalysisText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  getAiAnalysisButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  getAiAnalysisButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
