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
import { 
  checkAIAnalysisExists, 
  getAIAnalysis, 
  getAchievementProbabilityFromData, 
  getBestPossibleGPAFromData, 
  getUserProgressWithGPAs, 
  getCourseAnalytics 
} from '../../services/aiAnalysisService';
import { getGoalsByUserId } from '../../services/goalsService';
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
    try {
      if (!userId || !course) {
        console.warn('❌ [DEBUG] Missing userId or course data:', { userId, course: course?.id || course?.courseId });
        return;
      }


      // Get current grade from database (same as web version)
      const calculatedGrade = await getCourseGradeFromDatabase();
      setCurrentGrade(calculatedGrade);
      
      // Update the course object with the correct courseGpa
      if (course && calculatedGrade !== null && calculatedGrade !== undefined) {
        const updatedCourseData = { ...course, courseGpa: calculatedGrade };
        setUpdatedCourse(updatedCourseData);
      }

      // Load target grade from goal data
      // First check if course has targetGrade property, then fetch from goals
      let targetGradeValue = null;
      
      if (course?.targetGrade && course.targetGrade > 0) {
        // Check if course.targetGrade is already in GPA format or percentage format
        // If it's <= 4.0, it's likely in GPA format, use as is
        if (course.targetGrade <= 4.0) {
          targetGradeValue = course.targetGrade; // Already in GPA format
        } else {
          // If it's > 4.0, it's likely in percentage format, convert to GPA
          targetGradeValue = (course.targetGrade / 100) * 4.0; // Convert percentage to GPA
        }
      } else {
        // Try to fetch goal data for this course
        try {
          const goals = await getGoalsByUserId(userId);
          
          const courseGoal = goals.find(goal => {
            // Try both string and number comparison for courseId
            const courseId = course.id || course.courseId;
            const courseIdMatch = goal.courseId === courseId || 
                                 goal.courseId === parseInt(courseId) || 
                                 goal.courseId === courseId.toString();
            const typeMatch = goal.goalType === 'COURSE_GRADE';
            // Handle undefined status - if status is undefined, consider it active
            const statusMatch = goal.status === 'active' || goal.status === undefined;
            
            return courseIdMatch && typeMatch && statusMatch;
          });
          
          if (courseGoal && courseGoal.targetValue > 0) {
            
            // Check if targetValue is already in GPA format or percentage format
            if (courseGoal.targetValue <= 4.0) {
              // Already in GPA format
              targetGradeValue = courseGoal.targetValue;
            } else {
              // In percentage format, convert to GPA
              targetGradeValue = (courseGoal.targetValue / 100) * 4.0; // 100% -> 4.0 GPA
            }
          } else {
          }
        } catch (error: any) {
          console.error('❌ [DEBUG] Failed to fetch goals:', error);
          console.error('❌ [DEBUG] Error details:', {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status
          });
        }
      }
      
      setTargetGrade(targetGradeValue);

      // Load real user progress from database (with fallback)
      // For newly created courses, only show course-specific data
      try {
        const userProgressData = await getUserProgressWithGPAs(userId);
        
        // For new courses with no grades, don't show global progress data
        const hasGrades = grades && grades.length > 0;
        if (hasGrades) {
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
        } else {
          // For new courses, show minimal data
          setUserProgress({
            totalAssessments: 0,
            completedAssessments: 0,
            averageScore: 0,
            level: 1,
            points: 0,
            streak: 0,
            semesterGPA: 0.00,
            cumulativeGPA: 0.00,
          });
        }
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
      // Only load analytics for courses with actual data
      const hasGrades = grades && grades.length > 0;
      if (hasGrades) {
        try {
          const analyticsData = await getCourseAnalytics(userId, course.id || course.courseId);
          setUserAnalytics(analyticsData);
        } catch (error) {
          console.warn('⚠️ [DEBUG] Failed to load course analytics, using empty data:', error);
          setUserAnalytics([]);
        }
      } else {
        setUserAnalytics([]);
      }

      // Load AI analysis data only if course has grades and categories
      // Don't load AI analysis for newly created courses with no data
      const hasCategories = categories && categories.length > 0;
      
      if (hasGrades && hasCategories) {
        try {
          await loadExistingAIAnalysis();
        } catch (error) {
          console.warn('⚠️ [DEBUG] Failed to load AI analysis, continuing without it:', error);
        }
      } else {
        // Clear any existing AI analysis data
        setAiAnalysisData(null);
        setSuccessRate(null);
        setBestPossibleGPA(null);
      }

      // Check if midterm is completed
      const midtermGrades = grades.filter(g => g.semesterTerm === 'MIDTERM');
      const completedMidtermGrades = midtermGrades.filter(g => g.score !== null);
      setIsMidtermCompleted(completedMidtermGrades.length > 0);


    } catch (error) {
      console.error('❌ [ERROR] Error loading dashboard data:', error);
    }
  };

  // Load existing AI analysis data
  const loadExistingAIAnalysis = async () => {
    try {
      if (!userId || !course) {
        console.warn('❌ [DEBUG] Missing userId or course in loadExistingAIAnalysis:', { userId, course: course?.id || course?.courseId });
        return;
      }

      
      // Check if AI analysis exists
      const existsResult = await checkAIAnalysisExists(userId, course.id || course.courseId);
      
      if (existsResult.success && existsResult.exists) {
        // Load the analysis data
        const analysisResult = await getAIAnalysis(userId, course.id || course.courseId);
        
        if (analysisResult.success && analysisResult.hasAnalysis && analysisResult.analysis) {
          setAiAnalysisData(analysisResult.analysis);
          
              // Extract success rate from the analysis data
              const probability = getAchievementProbabilityFromData(analysisResult.analysis.analysisData);
              
              // Extract best possible GPA from the analysis data
              const extractedBestPossibleGPA = getBestPossibleGPAFromData(analysisResult.analysis.analysisData);
              
              // Apply same logic as web version: force 100% if goal is achieved
              let finalSuccessRate = probability;
              
              if (probability !== null) {
                // Override probability calculation if goal is already achieved (same as web version)
                const currentGPA = currentGrade; // This is the database-fetched GPA
                const targetGPA = (targetGrade || 100) / 25; // Convert percentage to GPA
                const isCourseCompleted = course?.isCompleted === true;
                
                if (isCourseCompleted && currentGPA >= targetGPA) {
                  finalSuccessRate = 100; // Force 100% when goal is achieved
                }
                
                setSuccessRate(finalSuccessRate);
              }
              
              // Set best possible GPA
              if (extractedBestPossibleGPA !== null) {
                setBestPossibleGPA(extractedBestPossibleGPA);
              }
        }
      } else {
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

      const courseResponse = await fetch(courseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        
        // Check if courseGpa is available (same as web version logic)
        if (courseData && courseData.courseGpa !== null && courseData.courseGpa !== undefined) {
          return courseData.courseGpa; // This is already in GPA format (0-4.0)
        }
      }

      // Fallback: trigger calculation if course_gpa is null (same as web version)
      const calcUrl = `${API_BASE_URL}/api/database-calculations/course/${courseId}/grade`;

      const calcResponse = await fetch(calcUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (calcResponse.ok) {
        const calcData = await calcResponse.json();
        
        // The calculation API returns GPA directly
        const courseGradeGPA = calcData.gpa || 0;
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

      {/* AI Recommendations - Only show if there's actual AI analysis data */}
      {aiAnalysisData && (successRate !== null || bestPossibleGPA !== null) && (
        <CourseRecommendations
          course={course}
          grades={grades}
          categories={categories}
          targetGrade={targetGrade}
          currentGrade={currentGrade}
          userAnalytics={userAnalytics}
          refreshTrigger={aiAnalysisRefreshTrigger}
        />
      )}
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
