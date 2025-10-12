import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { EnhancedGradeTrends } from '../../components/dashboard/EnhancedGradeTrends';
import { GoalsOverview } from '../../components/dashboard/GoalsOverview';
import { AIRecommendations } from '../../components/dashboard/AIRecommendations';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { DashboardService } from '../../services/dashboardService';
import { CourseService } from '../../services/courseService';
import { getGoalsByUserId } from '../../services/goalsService';

export const DashboardScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
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

      // Get user profile first
      const userProfile = await DashboardService.getUserProfile(currentUser.email) as any;
      const userId = userProfile.userId;

      // Fetch all data in parallel
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
        getGoalsByUserId(userId).catch((err: any) => {
          console.warn('❌ Failed to fetch goals:', err);
          return [];
        }),
      ]);

      // Set courses data (will be updated with grades and categories below)
      setCourses((coursesData as any[]) || []);

      // Set goals data
      setGoals((goalsData as any[]) || []);

      // Set GPA data
      const progressDataTyped = progressData as any;
      const semesterGPAsTyped = semesterGPAs as any;
      const semesterGPA = progressDataTyped?.semesterGpa || progressDataTyped?.semester_gpa || 0;
      const cumulativeGPA = progressDataTyped?.cumulativeGpa || progressDataTyped?.cumulative_gpa || 0;
      
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

      // Load grades and categories for each course
      const coursesDataTyped = coursesData as any[];
      const gradesAndCategoriesPromises = (coursesDataTyped || []).map(async (course: any) => {
        try {
          const [courseGrades, courseCategories] = await Promise.all([
            DashboardService.getGradesByCourseId(course.id || course.courseId),
            CourseService.getCourseCategories(course.id || course.courseId).catch(() => []) // Fallback to empty array if categories fail
          ]);
          return { 
            courseId: course.id || course.courseId, 
            grades: courseGrades,
            categories: courseCategories
          };
        } catch (error) {
          console.warn(`❌ Failed to load data for course ${course.id}:`, error);
          return { 
            courseId: course.id || course.courseId, 
            grades: [],
            categories: []
          };
        }
      });

      const gradesAndCategoriesResults = await Promise.all(gradesAndCategoriesPromises);
      const gradesMap: any = {};
      const categoriesMap: any = {};
      gradesAndCategoriesResults.forEach(({ courseId, grades, categories }: { courseId: any; grades: any; categories: any }) => {
        gradesMap[courseId] = grades;
        categoriesMap[courseId] = categories;
      });
      setGrades(gradesMap);

      // Attach grades and categories to course objects for GoalsOverview
      const coursesWithData = (coursesDataTyped || []).map((course: any) => {
        const courseGrades = gradesMap[course.id || course.courseId] || [];
        const courseCategories = categoriesMap[course.id || course.courseId] || [];
        
        // Group grades by category for easier access
        const gradesByCategory: any = {};
        courseGrades.forEach((grade: any) => {
          const categoryId = grade.categoryId || grade.category_id;
          if (!gradesByCategory[categoryId]) {
            gradesByCategory[categoryId] = [];
          }
          gradesByCategory[categoryId].push(grade);
        });

        return {
          ...course,
          grades: gradesByCategory,
          categories: courseCategories
        };
      });

      // Update courses with the enhanced data
      setCourses(coursesWithData);

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
      <View style={commonStyles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadRealData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <ScrollView
          style={styles.scrollView}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
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
