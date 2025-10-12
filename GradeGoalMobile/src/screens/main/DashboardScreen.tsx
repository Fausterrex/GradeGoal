import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { EnhancedGradeTrends } from '../../components/dashboard/EnhancedGradeTrends';
import { GoalsOverview } from '../../components/dashboard/GoalsOverview';
import { AIRecommendations } from '../../components/dashboard/AIRecommendations';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { DashboardService } from '../../services/dashboardService';
import { GoalsService } from '../../services/goalsService';

export const DashboardScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({});
  const [overallGPA, setOverallGPA] = useState(0);
  const [gpaData, setGpaData] = useState({
    semesterGPA: 0,
    cumulativeGPA: 0,
    courseGPAs: {} as any,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<any[]>([]);

  // Load real data on component mount
  useEffect(() => {
    if (currentUser) {
      loadRealData();
    }
  }, [currentUser]);

  const loadRealData = async () => {
    if (!currentUser?.email) return;
    
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading REAL data from backend for user:', currentUser.email);

      // Get user profile first
      console.log('📋 Step 1: Getting user profile...');
      const userProfile = await DashboardService.getUserProfile(currentUser.email) as any;
      console.log('✅ User profile:', userProfile);
      const userId = userProfile.userId;
      console.log('👤 User ID:', userId);

      // Fetch all data in parallel
      console.log('📊 Step 2: Fetching courses, progress, GPAs, and goals...');
      const [coursesData, progressData, semesterGPAs, goalsData] = await Promise.all([
        DashboardService.getCoursesByUserId(userId).catch(err => {
          console.warn('❌ Failed to fetch courses:', err);
          return [];
        }),
        DashboardService.getUserProgress(userId).catch(err => {
          console.warn('❌ Failed to fetch progress:', err);
          return {};
        }),
        DashboardService.getAllSemesterGPAs(userId).catch(err => {
          console.warn('❌ Failed to fetch semester GPAs:', err);
          return null;
        }),
        GoalsService.getUserGoals(userId).catch(err => {
          console.warn('❌ Failed to fetch goals:', err);
          return [];
        }),
      ]);

      console.log('📚 Courses data:', coursesData);
      console.log('📈 Progress data:', progressData);
      console.log('🎓 Semester GPAs:', semesterGPAs);
      console.log('🎯 Goals data:', goalsData);

      // Set courses data
      setCourses((coursesData as any[]) || []);
      console.log('✅ Courses set:', (coursesData as any[])?.length || 0, 'courses');

      // Set goals data
      setGoals((goalsData as any[]) || []);
      console.log('✅ Goals set:', (goalsData as any[])?.length || 0, 'goals');

      // Set GPA data
      const progressDataTyped = progressData as any;
      const semesterGPAsTyped = semesterGPAs as any;
      const semesterGPA = progressDataTyped?.semesterGpa || progressDataTyped?.semester_gpa || 0;
      const cumulativeGPA = progressDataTyped?.cumulativeGpa || progressDataTyped?.cumulative_gpa || 0;
      
      console.log('📊 GPA values - Semester:', semesterGPA, 'Cumulative:', cumulativeGPA);
      
      setOverallGPA(semesterGPA);
      setGpaData({
        semesterGPA,
        cumulativeGPA,
        courseGPAs: progressDataTyped?.courseGPAs || {},
        // Add semester-specific GPAs if available
        ...(semesterGPAsTyped && {
          firstSemesterGPA: semesterGPAsTyped.semesterGPAs?.FIRST || 0,
          secondSemesterGPA: semesterGPAsTyped.semesterGPAs?.SECOND || 0,
          thirdSemesterGPA: semesterGPAsTyped.semesterGPAs?.THIRD || 0,
          summerSemesterGPA: semesterGPAsTyped.semesterGPAs?.SUMMER || 0,
        }),
      });

      // Load grades for each course
      console.log('📝 Step 3: Loading grades for courses...');
      const coursesDataTyped = coursesData as any[];
      const gradesPromises = (coursesDataTyped || []).map(async (course: any) => {
        try {
          const courseGrades = await DashboardService.getGradesByCourseId(course.id || course.courseId);
          console.log(`✅ Grades for course ${course.name}:`, (courseGrades as any[])?.length || 0, 'grades');
          return { courseId: course.id || course.courseId, grades: courseGrades };
        } catch (error) {
          console.warn(`❌ Failed to load grades for course ${course.id}:`, error);
          return { courseId: course.id || course.courseId, grades: [] };
        }
      });

      const gradesResults = await Promise.all(gradesPromises);
      const gradesMap: any = {};
      gradesResults.forEach(({ courseId, grades }: { courseId: any; grades: any }) => {
        gradesMap[courseId] = grades;
      });
      setGrades(gradesMap);
      console.log('✅ Grades map set:', Object.keys(gradesMap).length, 'courses with grades');

      console.log('🎉 Real data loaded successfully!');
      console.log('📊 Final state - Courses:', coursesDataTyped?.length || 0, 'GPA:', semesterGPA);
      console.log('👤 Current user ID for goals:', currentUser?.userId);

    } catch (error: any) {
      console.error('❌ Error loading real data:', error);
      setError(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRealData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };



  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRealData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >

      {/* Enhanced Grade Trends Section */}
      <EnhancedGradeTrends
        courses={courses}
        grades={grades}
        overallGPA={overallGPA}
        gpaData={gpaData}
        goals={goals}
      />

      {/* Goals Overview Section */}
      <GoalsOverview
        courses={courses}
        gpaData={gpaData}
        userId={currentUser?.userId}
        onGoalUpdate={() => {
          // Refresh goals data when needed
          loadRealData();
        }}
      />

      {/* AI Recommendations Section */}
      <AIRecommendations courses={courses} />

      {/* Recent Activities Section */}
      <RecentActivities courses={courses} />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.needsImprovement,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
