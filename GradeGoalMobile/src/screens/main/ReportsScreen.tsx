import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { useYearLevel } from '../../context/YearLevelContext';

interface Course {
  courseName: string;
  semester: string;
  academicYear: string;
  currentGpa: number | null;
  goals: Record<string, any>;
  categories: Record<string, any>;
  level: string;
}

interface Goal {
  goalTitle: string;
  priority: string;
  progress: number;
  categories: Record<string, any>;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  earnedAt: string;
}

export const ReportsScreen: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { selectedYearLevel, filterDataByYearLevel } = useYearLevel();
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resData, setResData] = useState<any>(null);
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalGoals: 0,
    totalAchievements: 0,
  });

  // Fetch courses data
  useEffect(() => {
    if (loading || !currentUser?.userId) {
      setCourses([]);
      return;
    }

    setIsLoading(true);
    fetchCourses();
  }, [currentUser?.userId, loading, selectedYearLevel]);

  // Fetch achievements
  useEffect(() => {
    if (!currentUser?.userId || loading) return;

    fetchAchievements();
  }, [currentUser?.userId, loading]);

  // Calculate summary
  useEffect(() => {
    if (!courses || courses.length === 0) {
      setSummary({
        totalCourses: 0,
        totalGoals: 0,
        totalAchievements: achievements.length,
      });
      return;
    }

    let totalGoals = 0;
    courses.forEach(course => {
      if (course.goals && Object.values(course.goals).length > 0) {
        totalGoals += Object.values(course.goals).length;
      }
    });

    setSummary({
      totalCourses: courses.length,
      totalGoals: totalGoals,
      totalAchievements: achievements.length,
    });
  }, [courses, achievements]);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get(`/dashboard/courses/grouped?userId=${currentUser.userId}`);
      const allCourses = response.data.courses || [];
      setResData(response.data);
      const filteredCourses = filterDataByYearLevel(allCourses, 'creationYearLevel');
      const finalCourses = filteredCourses.length === 0 && allCourses.length > 0 ? allCourses : filteredCourses;
      setCourses(finalCourses);
    } catch (error) {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await apiClient.get(`/user-progress/${currentUser.userId}/recent-achievements`);
      setAchievements(response.data || []);
    } catch (error) {
      setAchievements([]);
    }
  };



  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading user data...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!currentUser?.userId) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <Text style={styles.title}>📊 Academic Report</Text>
          <Text style={styles.subtitle}>Please log in to view your reports.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Academic Report</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Information */}
        <View style={styles.userInfoCard}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <View style={styles.userInfoGrid}>
            <View style={styles.userInfoItem}>
              <Text style={styles.userInfoLabel}>Name:</Text>
              <Text style={styles.userInfoValue}>
                {resData?.name || currentUser?.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.userInfoItem}>
              <Text style={styles.userInfoLabel}>Level:</Text>
              <Text style={styles.userInfoValue}>
                {courses[0]?.level || 'N/A'}
              </Text>
            </View>
            <View style={styles.userInfoItem}>
              <Text style={styles.userInfoLabel}>School Year:</Text>
              <Text style={styles.userInfoValue}>
                {courses[0]?.academicYear || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.totalCourses}</Text>
              <Text style={styles.summaryLabel}>Courses</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.totalGoals}</Text>
              <Text style={styles.summaryLabel}>Goals</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.totalAchievements}</Text>
              <Text style={styles.summaryLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Course List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses found.</Text>
          </View>
        ) : (
          courses.map((course, index) => (
            <View key={index} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>
                  {course.courseName} ({course.semester} - {course.academicYear})
                </Text>
                
                <View style={styles.gpaInfo}>
                  <Text style={styles.gpaText}>
                    Current GPA: {course.currentGpa != null ? Number(course.currentGpa).toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.gpaText}>
                    Target GPA: {Object.values(course.goals || {})[0]?.targetGoal ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Goals */}
              {course.goals && Object.values(course.goals).length > 0 ? (
                Object.values(course.goals).map((goal: Goal, goalIndex) => (
                  <View key={goalIndex} style={styles.goalSection}>
                    <Text style={styles.goalTitle}>
                      🎯 {goal.goalTitle} [{goal.priority}]
                    </Text>
                    
                    {goal.progress && (
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${goal.progress}%`,
                              backgroundColor: goal.progress >= 100
                                ? colors.green[500]
                                : goal.progress >= 75
                                ? colors.blue[500]
                                : goal.progress >= 50
                                ? colors.yellow[500]
                                : colors.red[500],
                            },
                          ]}
                        />
                      </View>
                    )}

                    {/* Categories */}
                    {goal.categories &&
                      Object.values(goal.categories).map((category: any, catIndex) => (
                        <View key={catIndex} style={styles.categorySection}>
                          <Text style={styles.categoryTitle}>{category.categoryName}</Text>
                          
                          {category.assessments && category.assessments.length > 0 ? (
                            category.assessments.map((assessment: any, assIndex) => (
                              <View key={assIndex} style={styles.assessmentItem}>
                                <Text style={styles.assessmentName}>{assessment.assessmentName}</Text>
                                <View style={styles.assessmentDetails}>
                                  <Text style={[
                                    styles.assessmentStatus,
                                    { color: assessment.status === 'COMPLETED' ? colors.green[600] :
                                            assessment.status === 'UPCOMING' ? colors.blue[600] :
                                            assessment.status === 'OVERDUE' ? colors.red[600] :
                                            colors.gray[600] }
                                  ]}>
                                    {assessment.status}
                                  </Text>
                                  <Text style={styles.assessmentScore}>
                                    {assessment.percentageScore != null ? `${assessment.percentageScore}%` : '-'}
                                  </Text>
                                  <Text style={styles.assessmentPoints}>
                                    {assessment.pointsEarned != null && assessment.pointsPossible != null
                                      ? `${assessment.pointsEarned}/${assessment.pointsPossible}`
                                      : '-'}
                                  </Text>
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noAssessmentsText}>No assessments</Text>
                          )}
                        </View>
                      ))}
                  </View>
                ))
              ) : (
                <View style={styles.noGoalsSection}>
                  {course.categories && Object.values(course.categories).length > 0 ? (
                    Object.values(course.categories).map((category: any, catIndex) => (
                      <View key={catIndex} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category.categoryName}</Text>
                        
                        {category.assessments && category.assessments.length > 0 ? (
                          category.assessments.map((assessment: any, assIndex) => (
                            <View key={assIndex} style={styles.assessmentItem}>
                              <Text style={styles.assessmentName}>{assessment.assessmentName}</Text>
                              <View style={styles.assessmentDetails}>
                                <Text style={[
                                  styles.assessmentStatus,
                                  { color: assessment.status === 'COMPLETED' ? colors.green[600] :
                                          assessment.status === 'UPCOMING' ? colors.blue[600] :
                                          assessment.status === 'OVERDUE' ? colors.red[600] :
                                          colors.gray[600] }
                                ]}>
                                  {assessment.status}
                                </Text>
                                <Text style={styles.assessmentScore}>
                                  {assessment.percentageScore != null ? `${assessment.percentageScore}%` : '-'}
                                </Text>
                                <Text style={styles.assessmentPoints}>
                                  {assessment.pointsEarned != null && assessment.pointsPossible != null
                                    ? `${assessment.pointsEarned}/${assessment.pointsPossible}`
                                    : '-'}
                                </Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noAssessmentsText}>No assessments</Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No assessment data available.</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  userInfoGrid: {
    marginBottom: 16,
  },
  userInfoItem: {
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 2,
  },
  courseHeader: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  gpaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpaText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  goalSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categorySection: {
    marginTop: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.blue[600],
    marginBottom: 8,
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  assessmentName: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  assessmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessmentStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 60,
  },
  assessmentScore: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 8,
    minWidth: 40,
  },
  assessmentPoints: {
    fontSize: 12,
    color: colors.text.secondary,
    minWidth: 50,
  },
  noAssessmentsText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  noGoalsSection: {
    padding: 16,
  },
  noDataText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
