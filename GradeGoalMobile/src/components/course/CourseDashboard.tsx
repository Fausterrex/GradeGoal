import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { colors } from '../../styles/colors';
import { CourseAnalytics } from './CourseAnalytics';
import { CourseProgress } from './CourseProgress';
import { CourseRecommendations } from './CourseRecommendations';
import { CourseGradeBreakdown } from './CourseGradeBreakdown';
import { GoalProgress } from './GoalProgress';
import { UserProgress } from './UserProgress';
import { AIAnalysisIndicator } from './AIAnalysisIndicator';

interface CourseDashboardProps {
  course: any;
  grades: any[];
  categories: any[];
  userId?: number;
  onCourseUpdate: (course: any) => void;
}

export const CourseDashboard: React.FC<CourseDashboardProps> = ({
  course,
  grades,
  categories,
  userId,
  onCourseUpdate,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [targetGrade, setTargetGrade] = useState<number | null>(null);
  const [currentGrade, setCurrentGrade] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [activeSemesterTerm, setActiveSemesterTerm] = useState<string>('MIDTERM');
  const [isMidtermCompleted, setIsMidtermCompleted] = useState<boolean>(false);
  const [aiAnalysisRefreshTrigger, setAiAnalysisRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [course, grades, categories]);

  const loadDashboardData = async () => {
    try {
      // Calculate current grade from grades and categories
      const calculatedGrade = calculateCurrentGrade();
      setCurrentGrade(calculatedGrade);

      // Load target grade from goal data
      // For now, we'll use a default target grade since we don't have goal data in this component
      // TODO: Pass goal data to this component to get the actual target grade
      setTargetGrade(100); // Default target grade

      // Load user progress and analytics
      // These would be fetched from the backend
      setUserProgress({
        totalAssessments: grades.length,
        completedAssessments: grades.filter(g => g.score !== null).length,
        averageScore: calculatedGrade,
        level: 1,
        points: 155,
        streak: 4,
        semesterGPA: 1.38,
        cumulativeGPA: 1.10,
      });

      setUserAnalytics({
        trend: 'improving', // This would be calculated from historical data
        performance: calculatedGrade >= 80 ? 'excellent' : calculatedGrade >= 70 ? 'good' : 'needs_improvement',
        performance_metrics: {
          statistics: {
            change: 77.78,
            trend: 'GPA improved by 77.78%',
            confidence: 'High'
          }
        }
      });

      // Check if midterm is completed
      const midtermGrades = grades.filter(g => g.semesterTerm === 'MIDTERM');
      const completedMidtermGrades = midtermGrades.filter(g => g.score !== null);
      setIsMidtermCompleted(completedMidtermGrades.length > 0);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateCurrentGrade = (): number => {
    if (!categories || categories.length === 0 || !grades || grades.length === 0) {
      return 0;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach((category: any) => {
      const categoryGrades = grades.filter((grade: any) => grade.categoryId === category.id);
      if (categoryGrades.length > 0) {
        const validGrades = categoryGrades.filter((grade: any) => grade.score !== null && grade.score !== undefined);
        if (validGrades.length > 0) {
          const categoryAverage = validGrades.reduce((sum: number, grade: any) => {
            const percentage = (grade.score / grade.maxScore) * 100;
            return sum + percentage;
          }, 0) / validGrades.length;
          const weight = category.weightPercentage || category.weight || 0;
          totalWeightedScore += (categoryAverage * weight) / 100;
          totalWeight += weight;
        }
      }
    });

    return totalWeight > 0 ? totalWeightedScore : 0;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const colorScheme = {
    primary: course?.courseColor || colors.primary,
    secondary: colors.primaryLight,
    background: colors.background.primary,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* AI Analysis Indicator */}
      <AIAnalysisIndicator
        course={course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
        activeSemesterTerm={activeSemesterTerm}
        onAnalysisComplete={(result) => {
          setAiAnalysisRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Mobile-Optimized Single Column Layout */}
      
      {/* Goal Progress */}
      <GoalProgress
        currentGrade={currentGrade}
        targetGrade={targetGrade}
        course={course}
        colorScheme={colorScheme}
        grades={grades}
        categories={categories}
        onSetGoal={() => {}}
        isCompact={true}
        aiAnalysis={null} // TODO: Pass AI analysis data
        successRate={null} // TODO: Pass success rate from AI analysis
      />
      
      {/* User Progress */}
      <UserProgress
        userProgress={userProgress}
        course={course}
        userId={userId}
      />

      {/* Course Analytics */}
      <CourseAnalytics
        userAnalytics={userAnalytics}
        course={course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
      />

      {/* Course Progress */}
      <CourseProgress
        currentGrade={currentGrade}
        targetGrade={targetGrade}
        course={course}
        grades={grades}
        categories={categories}
        colorScheme={colorScheme}
        isMidtermCompleted={isMidtermCompleted}
        activeSemesterTerm={activeSemesterTerm}
      />

      {/* Grade Breakdown */}
      <CourseGradeBreakdown
        categories={categories}
        grades={grades}
        course={course}
        colorScheme={colorScheme}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
        activeSemesterTerm={activeSemesterTerm}
        isMidtermCompleted={isMidtermCompleted}
      />

      {/* AI Recommendations */}
      <CourseRecommendations
        course={course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
        userAnalytics={userAnalytics}
        refreshTrigger={aiAnalysisRefreshTrigger}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
