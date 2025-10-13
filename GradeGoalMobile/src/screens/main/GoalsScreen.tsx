import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { GoalSetting } from '../../components/course/GoalSetting';
import { DashboardService } from '../../services/dashboardService';
import { CourseService } from '../../services/courseService';

export const GoalsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.email) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Get user profile first
      const userProfile = await DashboardService.getUserProfile(currentUser.email) as any;
      const userId = userProfile?.userId || currentUser?.userId;
      
      if (!userId) {
        throw new Error('Unable to get user ID');
      }

      // Fetch courses data
      const coursesData = await DashboardService.getCoursesByUserId(userId).catch(err => {
        console.warn('❌ Failed to fetch courses:', err);
        return [];
      });

      setCourses((coursesData as any[]) || []);

      // Load grades and categories for each course
      const coursesDataTyped = coursesData as any[];
      const gradesAndCategoriesPromises = (coursesDataTyped || []).map(async (course: any) => {
        try {
          const [courseGrades, courseCategories] = await Promise.all([
            DashboardService.getGradesByCourseId(course.id || course.courseId),
            CourseService.getCourseCategories(course.id || course.courseId).catch(() => [])
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
      const coursesWithData: any[] = [];
      
      gradesAndCategoriesResults.forEach(({ courseId, grades, categories }: { courseId: any; grades: any; categories: any }) => {
        gradesMap[courseId] = grades;
        
        // Find the corresponding course and add grades/categories to it
        const course = coursesDataTyped.find(c => (c.id || c.courseId) === courseId);
        if (course) {
          coursesWithData.push({
            ...course,
            grades: grades,
            categories: categories
          });
        }
      });
      
      setGrades(gradesMap);
      setCourses(coursesWithData); // Update courses with the loaded data

    } catch (error: any) {
      console.error('❌ Error loading goals data:', error);
      setError(`Failed to load goals data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading goals...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={loadData}>Tap to retry</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <GoalSetting
          userEmail={currentUser?.email || ''}
          courses={courses}
          grades={grades}
          isCompact={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    color: colors.purple[600],
    fontWeight: '600',
  },
});
