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
import { checkAIAnalysisExists, getAIAnalysis, getAchievementProbabilityFromData, getBestPossibleGPAFromData, getUserProgressWithGPAs, getCourseAnalytics } from '../../services/aiAnalysisService';
import { getApiConfig } from '../../config/environment';

// Get API configuration
const apiConfig = getApiConfig();
const API_BASE_URL = apiConfig.baseURL.replace('/api', ''); // Remove /api suffix since we add it in each endpoint

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
  const [updatedCourse, setUpdatedCourse] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [activeSemesterTerm, setActiveSemesterTerm] = useState<string>('MIDTERM');
  const [isMidtermCompleted, setIsMidtermCompleted] = useState<boolean>(false);
  const [aiAnalysisRefreshTrigger, setAiAnalysisRefreshTrigger] = useState(0);
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [bestPossibleGPA, setBestPossibleGPA] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [course, grades, categories]);

  const loadDashboardData = async () => {
    console.log('🚀 [DEBUG] Starting loadDashboardData...');
    try {
      if (!userId || !course) {
        console.warn('❌ [DEBUG] Missing userId or course data:', { userId, course: course?.id || course?.courseId });
        return;
      }

      console.log('🔍 [DEBUG] Loading dashboard data for:', { userId, courseId: course.id || course.courseId });

      // Get current grade from database (same as web version)
      const calculatedGrade = await getCourseGradeFromDatabase();
      console.log('🔍 [DEBUG] Database course grade:', calculatedGrade);
      console.log('🔍 [DEBUG] Setting currentGrade to:', calculatedGrade);
      setCurrentGrade(calculatedGrade);
      
      // Update the course object with the correct courseGpa
      if (course && calculatedGrade !== null && calculatedGrade !== undefined) {
        const updatedCourseData = { ...course, courseGpa: calculatedGrade };
        console.log('🔍 [DEBUG] Updated course object with courseGpa:', updatedCourseData.courseGpa);
        setUpdatedCourse(updatedCourseData);
      }

      // Load target grade from goal data
      // For now, we'll use a default target grade since we don't have goal data in this component
      // TODO: Pass goal data to this component to get the actual target grade
      setTargetGrade(100); // Default target grade

      // Load real user progress from database (with fallback)
      console.log('🔍 [DEBUG] Loading user progress...');
      try {
        const userProgressData = await getUserProgressWithGPAs(userId);
        console.log('✅ [DEBUG] User progress loaded successfully:', userProgressData);
        setUserProgress({
          totalAssessments: grades.length,
          completedAssessments: grades.filter(g => g.score !== null).length,
          averageScore: calculatedGrade,
          level: userProgressData.currentLevel || 1,
          points: userProgressData.totalPoints || 0,
          streak: userProgressData.streakDays || 0,
          semesterGPA: userProgressData.semesterGpa || 0.00,
          cumulativeGPA: userProgressData.cumulativeGpa || 0.00,
        });
      } catch (error) {
        console.warn('⚠️ [DEBUG] Failed to load user progress, using local data:', error);
        setUserProgress({
          totalAssessments: grades.length,
          completedAssessments: grades.filter(g => g.score !== null).length,
          averageScore: calculatedGrade,
          level: 1,
          points: 0,
          streak: 0,
          semesterGPA: 0.00,
          cumulativeGPA: 0.00,
        });
      }

      // Load real course analytics from database (with fallback)
      console.log('🔍 [DEBUG] Loading course analytics...');
      try {
        const analyticsData = await getCourseAnalytics(userId, course.id || course.courseId);
        console.log('✅ [DEBUG] Course analytics loaded successfully:', analyticsData);
        setUserAnalytics(analyticsData);
      } catch (error) {
        console.warn('⚠️ [DEBUG] Failed to load course analytics, using empty data:', error);
        setUserAnalytics([]);
      }

      // Load AI analysis data if it exists (with fallback)
      console.log('🔍 [DEBUG] Loading AI analysis...');
      try {
        await loadExistingAIAnalysis();
      } catch (error) {
        console.warn('⚠️ [DEBUG] Failed to load AI analysis, continuing without it:', error);
      }

      // Check if midterm is completed
      const midtermGrades = grades.filter(g => g.semesterTerm === 'MIDTERM');
      const completedMidtermGrades = midtermGrades.filter(g => g.score !== null);
      setIsMidtermCompleted(completedMidtermGrades.length > 0);

      console.log('✅ [DEBUG] Dashboard data loading completed successfully');

    } catch (error) {
      console.error('❌ [ERROR] Error loading dashboard data:', error);
    }
  };

  // Load existing AI analysis data
  const loadExistingAIAnalysis = async () => {
    console.log('🔍 [DEBUG] Starting loadExistingAIAnalysis...');
    try {
      if (!userId || !course) {
        console.warn('❌ [DEBUG] Missing userId or course in loadExistingAIAnalysis:', { userId, course: course?.id || course?.courseId });
        return;
      }

      console.log('🔍 [DEBUG] Checking if AI analysis exists for:', { userId, courseId: course.id || course.courseId });
      
      // Check if AI analysis exists
      const existsResult = await checkAIAnalysisExists(userId, course.id || course.courseId);
      console.log('🔍 [DEBUG] AI analysis exists result:', existsResult);
      
      if (existsResult.success && existsResult.exists) {
        console.log('✅ [DEBUG] AI analysis exists, loading data...');
        // Load the analysis data
        const analysisResult = await getAIAnalysis(userId, course.id || course.courseId);
        console.log('🔍 [DEBUG] AI analysis result:', analysisResult);
        
        if (analysisResult.success && analysisResult.hasAnalysis && analysisResult.analysis) {
          console.log('✅ [DEBUG] Setting AI analysis data:', analysisResult.analysis);
          setAiAnalysisData(analysisResult.analysis);
          
              // Extract success rate from the analysis data
              const probability = getAchievementProbabilityFromData(analysisResult.analysis.analysisData);
              console.log('🔍 [DEBUG] Extracted probability:', probability);
              
              // Extract best possible GPA from the analysis data
              const extractedBestPossibleGPA = getBestPossibleGPAFromData(analysisResult.analysis.analysisData);
              console.log('🔍 [DEBUG] Extracted bestPossibleGPA:', extractedBestPossibleGPA);
              
              // Apply same logic as web version: force 100% if goal is achieved
              let finalSuccessRate = probability;
              
              if (probability !== null) {
                // Override probability calculation if goal is already achieved (same as web version)
                const currentGPA = currentGrade; // This is the database-fetched GPA
                const targetGPA = (targetGrade || 100) / 25; // Convert percentage to GPA
                const isCourseCompleted = course?.isCompleted === true;
                
                if (isCourseCompleted && currentGPA >= targetGPA) {
                  finalSuccessRate = 100; // Force 100% when goal is achieved
                  console.log('🔍 [DEBUG] Goal achieved, forcing 100% success rate in loadExistingAIAnalysis');
                }
                
                setSuccessRate(finalSuccessRate);
              }
              
              // Set best possible GPA
              if (extractedBestPossibleGPA !== null) {
                setBestPossibleGPA(extractedBestPossibleGPA);
              }
        }
      } else {
        console.log('ℹ️ [DEBUG] No AI analysis exists for this course');
      }
    } catch (error) {
      console.error('❌ [ERROR] Error loading existing AI analysis:', error);
    }
  };

  const getCourseGradeFromDatabase = async (): Promise<number> => {
    try {
      if (!course?.id && !course?.courseId) {
        console.warn('No course ID available for database lookup');
        return calculateCurrentGrade(); // Fallback to local calculation
      }

      const courseId = course.id || course.courseId;
      
      // Use the same approach as web version: get course data first, then fallback to calculation
      const courseUrl = `${API_BASE_URL}/api/courses/${courseId}`;
      console.log('🔍 [DEBUG] Fetching course data from database:', { courseId, courseUrl });

      const courseResponse = await fetch(courseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 [DEBUG] Course data response:', { 
        status: courseResponse.status, 
        statusText: courseResponse.statusText,
        ok: courseResponse.ok 
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        console.log('🔍 [DEBUG] Course data:', courseData);
        
        // Check if courseGpa is available (same as web version logic)
        if (courseData && courseData.courseGpa !== null && courseData.courseGpa !== undefined) {
          console.log('🔍 [DEBUG] Using courseGpa from database:', courseData.courseGpa);
          console.log('🔍 [DEBUG] courseData.calculatedCourseGrade:', courseData.calculatedCourseGrade);
          console.log('🔍 [DEBUG] Full course data:', courseData);
          return courseData.courseGpa; // This is already in GPA format (0-4.0)
        }
      }

      // Fallback: trigger calculation if course_gpa is null (same as web version)
      console.log('🔍 [DEBUG] courseGpa is null, triggering calculation...');
      const calcUrl = `${API_BASE_URL}/api/database-calculations/course/${courseId}/grade`;
      console.log('🔍 [DEBUG] Fetching calculated course grade:', { courseId, calcUrl });

      const calcResponse = await fetch(calcUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 [DEBUG] Course grade calculation response:', { 
        status: calcResponse.status, 
        statusText: calcResponse.statusText,
        ok: calcResponse.ok 
      });

      if (calcResponse.ok) {
        const calcData = await calcResponse.json();
        console.log('🔍 [DEBUG] Course grade calculation data:', calcData);
        
        // The calculation API returns GPA directly
        const courseGradeGPA = calcData.gpa || 0;
        console.log('🔍 [DEBUG] Using calculated GPA:', courseGradeGPA);
        return courseGradeGPA;
      }

      console.warn('Both course data and calculation APIs failed, using fallback calculation');
      return calculateCurrentGrade(); // Final fallback to local calculation
    } catch (error) {
      console.error('❌ [ERROR] Error fetching course grade from database:', error);
      return calculateCurrentGrade(); // Fallback to local calculation
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
          setAiAnalysisData(result);
          
          // Apply same logic as web version: force 100% if goal is achieved
          let finalSuccessRate = null;
          
          if (result && result.successRate) {
            finalSuccessRate = result.successRate;
          } else if (result && result.confidence) {
            finalSuccessRate = result.confidence;
          }
          
          // Extract best possible GPA from the analysis result
          if (result && result.analysisData) {
            const extractedBestPossibleGPA = getBestPossibleGPAFromData(result.analysisData);
            console.log('🔍 [DEBUG] Extracted bestPossibleGPA from analysis result:', extractedBestPossibleGPA);
            if (extractedBestPossibleGPA !== null) {
              setBestPossibleGPA(extractedBestPossibleGPA);
            }
          }
          
          // Override probability calculation if goal is already achieved (same as web version)
          const currentGPA = currentGrade; // This is the database-fetched GPA
          const targetGPA = (targetGrade || 100) / 25; // Convert percentage to GPA
          const isCourseCompleted = course?.isCompleted === true;
          
          if (finalSuccessRate && isCourseCompleted && currentGPA >= targetGPA) {
            finalSuccessRate = 100; // Force 100% when goal is achieved
            console.log('🔍 [DEBUG] Goal achieved, forcing 100% success rate');
          }
          
          setSuccessRate(finalSuccessRate);
          setAiAnalysisRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Mobile-Optimized Single Column Layout */}
      
      {/* Goal Progress */}
      <GoalProgress
        currentGrade={currentGrade}
        targetGrade={targetGrade}
        course={updatedCourse || course}
        colorScheme={colorScheme}
        grades={grades}
        categories={categories}
        onSetGoal={() => {}}
        isCompact={true}
        aiAnalysis={aiAnalysisData}
        successRate={successRate}
        bestPossibleGPA={bestPossibleGPA}
      />
      
      {/* User Progress */}
      <UserProgress
        userProgress={userProgress}
        course={updatedCourse || course}
        userId={userId}
      />

      {/* Course Analytics */}
      <CourseAnalytics
        userAnalytics={userAnalytics}
        course={updatedCourse || course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
      />

      {/* Course Progress */}
      <CourseProgress
        currentGrade={currentGrade}
        targetGrade={targetGrade}
        course={updatedCourse || course}
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
        course={updatedCourse || course}
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
