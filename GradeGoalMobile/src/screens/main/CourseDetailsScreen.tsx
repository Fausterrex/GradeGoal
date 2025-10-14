import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { CourseDashboard } from '../../components/course/CourseDashboard';
import { CourseAssessments } from '../../components/course/CourseAssessments';
import { CourseService } from '../../services/courseService';

interface CourseDetailsScreenProps {
  route: {
    params: {
      course: any;
    };
  };
  navigation: any;
}

export const CourseDetailsScreen: React.FC<CourseDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { course: initialCourse } = route.params;
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [course, setCourse] = useState(initialCourse);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assessments'>('dashboard');
  const [grades, setGrades] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load course data
  useEffect(() => {
    loadCourseData();
  }, [course?.id]);

  const loadCourseData = async () => {
    if (!course?.id) {
      setError('No course selected');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Load course, grades and categories in parallel
      const [courseData, gradesData, categoriesData] = await Promise.all([
        CourseService.getCourseById(course.id).catch(() => null),
        CourseService.getGradesByCourseId(course.id).catch(() => []),
        CourseService.getCourseCategories(course.id).catch(() => []),
      ]);

      // Update course data if fetched successfully
      if (courseData) {
        setCourse(courseData);
      }
      
      setGrades(gradesData || []);
      setCategories(categoriesData || []);
      
    } catch (error: any) {
      console.error('Error loading course data:', error);
      setError('Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCourseUpdate = (updatedCourse?: any) => {
    if (updatedCourse) {
      setCourse(updatedCourse);
    } else {
      // Refresh course data from backend
      loadCourseData();
    }
  };

  const handleGradeUpdate = () => {
    // Refresh grades data
    loadCourseData();
  };

  const renderTabButton = (tab: 'dashboard' | 'assessments', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonIcon,
        activeTab === tab && styles.tabButtonIconActive,
      ]}>
        {icon}
      </Text>
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading course details...</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={loadCourseData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.courseName} numberOfLines={1}>
              {course?.name || course?.courseName || 'Course'}
            </Text>
            <Text style={styles.courseCode}>
              {course?.courseCode || 'N/A'}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton('dashboard', 'Dashboard', '📊')}
          {renderTabButton('assessments', 'Assessments', '📝')}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'dashboard' ? (
            <CourseDashboard
              course={course}
              grades={grades}
              categories={categories}
              userId={currentUser?.userId}
              onCourseUpdate={handleCourseUpdate}
            />
          ) : (
            <CourseAssessments
              course={course}
              grades={grades}
              categories={categories}
              userId={currentUser?.userId}
              onGradeUpdate={handleGradeUpdate}
              onCourseUpdate={handleCourseUpdate}
            />
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  courseCode: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 60, // Same width as back button to center the title
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonIcon: {
    fontSize: 18,
  },
  tabButtonIconActive: {
    // Icon color handled by parent
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.text.white,
  },
  tabContent: {
    flex: 1,
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
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
});
