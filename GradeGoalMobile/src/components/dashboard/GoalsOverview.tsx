import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';
import { GoalsService, AcademicGoal } from '../../services/goalsService';
import { apiClient } from '../../services/apiClient';

  const { width } = Dimensions.get('window');

  // GPA conversion utility (matching web version)
  const percentageToGPA = (percentage: number): number => {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
      return 0;
    }
    
    const percent = parseFloat(percentage.toString());
    
    // Custom GPA scale conversion (matching web version's percentageToGPA function)
    if (percent >= 95.5) return 4.00;
    if (percent >= 89.5) return 3.50;
    if (percent >= 83.5) return 3.00;
    if (percent >= 77.5) return 2.50;
    if (percent >= 71.5) return 2.00;
    if (percent >= 65.5) return 1.50;
    if (percent >= 59.5) return 1.00;
    
    return 0; // Below 59.5 = 0 GPA (Remedial/Fail)
  };

  // Fetch AI analysis data for a course (matching web version)
  const fetchAIAnalysisForCourse = async (userId: number, courseId: number) => {
    try {
      console.log('🤖 Fetching AI analysis for userId:', userId, 'courseId:', courseId);
      const response = await apiClient.get(`/recommendations/user/${userId}/course/${courseId}/ai-analysis`);
      console.log('🤖 AI analysis response:', response.data);
      
      // Extract the first AI analysis recommendation if available
      const responseData = response.data as any;
      if (responseData.success && responseData.recommendations && responseData.recommendations.length > 0) {
        const aiAnalysis = responseData.recommendations[0];
        console.log('🤖 Found AI analysis:', aiAnalysis);
        return aiAnalysis;
      } else {
        console.log('🤖 No AI analysis found for this course');
        return null;
      }
    } catch (error) {
      console.warn('❌ Failed to fetch AI analysis:', error);
      return null;
    }
  };

  // Calculate achievement probability (matching web version exactly)
  const calculateAchievementProbability = (currentValue: number, targetValue: number, goalType: string, targetDate?: string): number => {
    console.log('🔍 calculateAchievementProbability called with:', { currentValue, targetValue, goalType, targetDate });
    
    if (!targetValue || targetValue <= 0) return 0;
    
    // If goal is already achieved, return 100% immediately
    if (currentValue >= targetValue) return 100;
    
    // If no progress has been made, probability should be 0
    if (currentValue <= 0) return 0;

    // Base probability from current progress
    const baseProgress = (currentValue / targetValue) * 100;
    console.log('🔍 baseProgress:', baseProgress);
    
    // Time factor (if target date is set) - more optimistic
    let timeFactor = 1;
    if (targetDate) {
      const now = new Date();
      const target = new Date(targetDate);
      const totalDays = Math.max((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), 1);
      
      if (totalDays > 30) {
        timeFactor = 1.1; // Bonus for having time
      } else if (totalDays > 7) {
        timeFactor = 1.0; // Neutral for reasonable time
      } else {
        timeFactor = 0.9; // Small penalty for very little time
      }
    }
    console.log('🔍 timeFactor:', timeFactor);

    // Start with more optimistic baseline
    let probability = baseProgress;
    
    // Apply goal type modifiers (more optimistic)
    let modifier = 1;
    switch (goalType) {
      case 'COURSE_GRADE':
        modifier = 1.2; // Course grades are very achievable
        break;
      case 'SEMESTER_GPA':
        modifier = 1.1; // Semester GPA is quite achievable
        break;
      case 'CUMMULATIVE_GPA':
        modifier = 1.0; // Cumulative GPA is still achievable
        break;
    }
    console.log('🔍 modifier:', modifier);

    // Apply time factor
    probability = probability * timeFactor;
    console.log('🔍 probability after time factor:', probability);
    
    // Strong boosts for good progress
    if (baseProgress > 90) {
      probability = Math.min(probability * 1.3, 100); // 30% boost for excellent progress
      console.log('🔍 applied 30% boost for >90% progress:', probability);
    } else if (baseProgress > 80) {
      probability = Math.min(probability * 1.2, 100); // 20% boost for very good progress
      console.log('🔍 applied 20% boost for >80% progress:', probability);
    } else if (baseProgress > 70) {
      probability = Math.min(probability * 1.15, 100); // 15% boost for good progress
      console.log('🔍 applied 15% boost for >70% progress:', probability);
    }
    
    // Ensure realistic minimum probability for reasonable progress
    const minimumProbability = Math.min(baseProgress * 0.85, 85); // Much more optimistic minimum
    console.log('🔍 minimumProbability:', minimumProbability);
    probability = Math.max(probability * modifier, minimumProbability);
    console.log('🔍 final probability after modifier and minimum:', probability);

    const finalResult = Math.min(Math.max(probability, 0), 100);
    console.log('🔍 final result:', finalResult);
    return finalResult;
  };

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  successRate: number | null; // Allow null to show "Get AI Analysis" message
  isAchieved: boolean;
  goalType: string;
  courseName?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: string;
}

interface GoalsOverviewProps {
  courses: any[];
  gpaData: any;
  onGoalUpdate?: () => void;
  userId?: number;
}

const GoalCard: React.FC<{ goal: Goal; onPress: () => void }> = ({ goal, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return colors.status.needsImprovement;
      case 'MEDIUM': return colors.status.ongoing;
      case 'LOW': return colors.status.onTrack;
      default: return colors.gray[500];
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return colors.status.excellent;
    if (progress >= 75) return colors.status.onTrack;
    if (progress >= 50) return colors.status.ongoing;
    return colors.status.needsImprovement;
  };

  const getStatusInfo = (progress: number) => {
    if (progress >= 100) return { text: 'Completed', color: colors.green[500], bgColor: colors.green[100] };
    if (progress >= 80) return { text: 'So Close!', color: colors.purple[500], bgColor: colors.purple[100] };
    if (progress >= 60) return { text: 'On Track', color: colors.blue[500], bgColor: colors.blue[100] };
    if (progress >= 40) return { text: 'Needs Focus', color: colors.yellow[500], bgColor: colors.yellow[100] };
    return { text: 'Needs Improvement', color: colors.red[500], bgColor: colors.red[100] };
  };

  const statusInfo = getStatusInfo(goal.progress);
  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'COURSE_GRADE': return '📚';
      case 'SEMESTER_GPA': return '📊';
      case 'CUMMULATIVE_GPA': return '🏆';
      default: return '🎯';
    }
  };

  return (
    <TouchableOpacity style={styles.goalCard} onPress={onPress}>
      <View style={styles.goalCardHeader}>
        <View style={styles.goalCardLeft}>
          <View style={styles.goalTypeIcon}>
            <Text style={styles.goalTypeIconText}>{getGoalTypeIcon(goal.goalType)}</Text>
          </View>
          <View>
            <Text style={styles.goalCardTitle}>{goal.title}</Text>
            <Text style={styles.goalCardSubtitle}>
              {goal.courseName || goal.goalType} • {goal.targetValue}%
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.goalProgressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{goal.progress.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(goal.progress, 100)}%`,
                backgroundColor: getProgressColor(goal.progress)
              }
            ]} 
          />
        </View>
      </View>

      {/* Success Rate Bar */}
      <View style={styles.successRateSection}>
        <View style={styles.successRateHeader}>
          <View style={styles.successRateLeft}>
            <Text style={styles.trendingIcon}>📈</Text>
            <Text style={styles.successRateLabel}>Success Rate</Text>
          </View>
          {goal.successRate !== null ? (
            <Text style={styles.successRateValue}>
              {Math.round(goal.successRate)}%
            </Text>
          ) : (
            <Text style={styles.getAIAnalysisText}>
              Get AI Analysis
            </Text>
          )}
        </View>
        
        {goal.successRate !== null ? (
          <View style={styles.successRateBar}>
            <View 
                style={[
                  styles.successRateFill, 
                  { 
                    width: `${Math.min(goal.successRate, 100)}%`,
                    backgroundColor: goal.successRate >= 70 ? colors.green[500] : 
                                   goal.successRate >= 40 ? colors.yellow[500] : colors.red[500]
                  }
                ]}
            />
          </View>
        ) : (
          <View style={styles.getAIAnalysisBar}>
            <View style={styles.getAIAnalysisMessage}>
              <Text style={styles.getAIAnalysisMessageText}>
                Get AI Analysis to determine the success rate
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const GoalsOverview: React.FC<GoalsOverviewProps> = ({
  courses,
  gpaData,
  onGoalUpdate,
  userId,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickStats, setQuickStats] = useState({
    totalCourses: 0,
    totalCredits: 0,
    achievements: 0,
    activeGoals: 0,
  });

  // Load real goals data
  useEffect(() => {
    if (userId) {
      loadGoalsData();
    }
  }, [userId, courses, gpaData]);

  const loadGoalsData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🎯 Loading REAL goals data from backend for user:', userId);
      
      if (userId) {
        // Fetch all goals from backend (more reliable than getActiveGoals)
        console.log('🔍 Fetching all goals for userId:', userId);
        const allGoals = await GoalsService.getUserGoals(userId);
        console.log('📋 All goals response:', allGoals);
        console.log('📋 All goals count:', allGoals?.length || 0);
        
        // Filter for active goals on the client side (simpler and more reliable)
        const filteredActiveGoals = (allGoals || []).filter(goal => {
          // A goal is active if it's not achieved
          return !goal.isAchieved;
        });
        
        console.log('📋 Filtered active goals count:', filteredActiveGoals.length);
        console.log('📋 Active goals:', filteredActiveGoals);
        
        const goalsToUse = filteredActiveGoals;
        
        // Convert backend goals to our Goal interface (matching web version logic)
        const convertedGoals: Goal[] = await Promise.all((goalsToUse || []).map(async (backendGoal: AcademicGoal) => {
          // Find the course name for this goal
          const course = courses.find(c => c.id === backendGoal.courseId || c.courseId === backendGoal.courseId);
          const courseName = course?.name || course?.courseName || 'Unknown Course';
          
          // Calculate progress based on goal type and current data (matching web version logic)
          let progress = 0;
          let currentValue = 0;
          let successRate: number | null = 0;
          
          const targetValue = parseFloat(backendGoal.targetValue.toString());
          
          if (backendGoal.goalType === 'COURSE_GRADE' && course) {
            // For course goals, use courseGpa directly (already in GPA format) - matching web version
            currentValue = course.courseGpa || course.course_gpa || 0; // Use GPA directly
            
            // Convert target percentage to GPA for comparison (matching web version)
            const targetGPA = percentageToGPA(targetValue);
            
            // Calculate progress as percentage of target achieved (GPA vs GPA)
            progress = targetGPA > 0 ? Math.min((currentValue / targetGPA) * 100, 100) : 0;
            
            // Try to get AI analysis success rate first (matching web version)
            try {
              console.log('🤖 Fetching AI analysis for course goal:', backendGoal.goalTitle, 'Course ID:', course.id || course.courseId);
              const aiAnalysis = await fetchAIAnalysisForCourse(userId, course.id || course.courseId);
              if (aiAnalysis && (aiAnalysis as any).content) {
                const content = typeof (aiAnalysis as any).content === 'string' 
                  ? JSON.parse((aiAnalysis as any).content) 
                  : (aiAnalysis as any).content;
                
                console.log('🤖 AI analysis content:', content);
                
                // Extract success rate from AI analysis (matching web version)
                const aiSuccessRate = content.targetGoalProbability?.probability || 
                                    content.achievementProbability?.probability || 
                                    content.successProbability || 
                                    content.probability;
                
                if (aiSuccessRate !== undefined && aiSuccessRate !== null) {
                  successRate = typeof aiSuccessRate === 'string' 
                    ? parseFloat(aiSuccessRate.replace('%', '')) 
                    : aiSuccessRate;
                  console.log('✅ Using AI success rate:', successRate, 'for goal:', backendGoal.goalTitle);
                } else {
                  // No AI success rate found - set to null to show "Get AI Analysis" message
                  successRate = null;
                  console.log('⚠️ No AI success rate found, will show "Get AI Analysis" message for goal:', backendGoal.goalTitle);
                }
              } else {
                // No AI analysis found - set to null to show "Get AI Analysis" message
                successRate = null;
                console.log('⚠️ No AI analysis found, will show "Get AI Analysis" message for goal:', backendGoal.goalTitle);
              }
            } catch (aiError) {
              console.warn('❌ Error fetching AI analysis, will show "Get AI Analysis" message:', aiError);
              // No AI analysis available - set to null to show "Get AI Analysis" message
              successRate = null;
            }
            
          } else if (backendGoal.goalType === 'SEMESTER_GPA' && gpaData?.semesterGPA) {
            currentValue = gpaData.semesterGPA;
            
            // Convert target percentage to GPA for comparison (matching web version)
            const targetGPA = percentageToGPA(targetValue);
            
            // Calculate progress as percentage of target achieved (GPA vs GPA)
            progress = targetGPA > 0 ? Math.min((currentValue / targetGPA) * 100, 100) : 0;
            
            // For non-course goals, use mathematical calculation (no AI analysis available)
            successRate = calculateAchievementProbability(currentValue, targetGPA, backendGoal.goalType, backendGoal.targetDate);
            
          } else if (backendGoal.goalType === 'CUMMULATIVE_GPA' && gpaData?.cumulativeGPA) {
            currentValue = gpaData.cumulativeGPA;
            
            // Convert target percentage to GPA for comparison (matching web version)
            const targetGPA = percentageToGPA(targetValue);
            
            // Calculate progress as percentage of target achieved (GPA vs GPA)
            progress = targetGPA > 0 ? Math.min((currentValue / targetGPA) * 100, 100) : 0;
            
            // For non-course goals, use mathematical calculation (no AI analysis available)
            successRate = calculateAchievementProbability(currentValue, targetGPA, backendGoal.goalType, backendGoal.targetDate);
          }
          
          return {
            id: backendGoal.goalId.toString(),
            title: backendGoal.goalTitle,
            description: backendGoal.description || `Achieve ${backendGoal.targetValue} in ${backendGoal.goalType}`,
            targetValue: backendGoal.targetValue,
            currentValue,
            progress: Math.min(progress, 100), // Cap at 100%
            successRate: successRate, // Add success rate
            isAchieved: backendGoal.isAchieved,
            goalType: backendGoal.goalType,
            courseName: backendGoal.goalType === 'COURSE_GRADE' ? courseName : backendGoal.goalType,
            priority: backendGoal.priority,
            deadline: backendGoal.targetDate,
          };
        }));

        setGoals(convertedGoals);
        console.log('✅ Real goals loaded from backend:', convertedGoals.length);
        
        // Calculate quick stats based on real data
        const activeCourses = courses.filter(course => course.isActive !== false);
        const totalCredits = activeCourses.reduce((sum, course) => sum + (course.credits || 3), 0);
        const achievedGoals = convertedGoals.filter(goal => goal.isAchieved).length;
        const activeGoalsCount = convertedGoals.filter(goal => !goal.isAchieved).length;
        
        setQuickStats({
          totalCourses: activeCourses.length,
          totalCredits,
          achievements: achievedGoals,
          activeGoals: activeGoalsCount,
        });
        
        console.log('📊 Quick stats calculated:', {
          totalCourses: activeCourses.length,
          totalCredits,
          achievements: achievedGoals,
          activeGoals: activeGoalsCount,
        });
      } else {
        console.log('⚠️ No userId provided, showing empty goals');
        setGoals([]);
        setQuickStats({
          totalCourses: 0,
          totalCredits: 0,
          achievements: 0,
          activeGoals: 0,
        });
      }

    } catch (error) {
      console.error('❌ Error loading goals data:', error);
      setGoals([]);
      setQuickStats({
        totalCourses: 0,
        totalCredits: 0,
        achievements: 0,
        activeGoals: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalPress = (goal: Goal) => {
    Alert.alert(
      goal.title,
      `${goal.description}\n\nProgress: ${goal.progress.toFixed(1)}%\nCurrent: ${goal.currentValue}\nTarget: ${goal.targetValue}`,
      [{ text: 'OK' }]
    );
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = width * 0.75 + 12; // Card width + margin
    const index = Math.round(contentOffsetX / cardWidth);
    setCurrentIndex(index);
  };

  const getAchievementRate = () => {
    if (quickStats.activeGoals === 0) return 0;
    return (quickStats.achievements / quickStats.activeGoals) * 100;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🎯</Text>
          </View>
          <View>
            <Text style={styles.title}>Goals Overview</Text>
            <Text style={styles.subtitle}>Track your academic progress and achievements</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.lastUpdatedLabel}>Last updated</Text>
          <Text style={styles.lastUpdatedDate}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.quickStatsGrid}>
        {/* Total Courses */}
        <View style={[styles.statCard, styles.blueCard]}>
          <View style={styles.statContent}>
            <View>
              <Text style={[styles.statNumber, { color: colors.blue[700] }]}>{quickStats.totalCourses}</Text>
              <Text style={[styles.statLabel, { color: colors.blue[600] }]}>Total Courses</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: colors.blue[500] }]}>
              <Text style={styles.statIconText}>📚</Text>
            </View>
          </View>
        </View>

        {/* Total Credits */}
        <View style={[styles.statCard, styles.greenCard]}>
          <View style={styles.statContent}>
            <View>
              <Text style={[styles.statNumber, { color: colors.green[700] }]}>{quickStats.totalCredits}</Text>
              <Text style={[styles.statLabel, { color: colors.green[600] }]}>Total Credits</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: colors.green[500] }]}>
              <Text style={styles.statIconText}>🏆</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.statCard, styles.yellowCard]}>
          <View style={styles.statContent}>
            <View>
              <Text style={[styles.statNumber, { color: colors.yellow[700] }]}>{quickStats.achievements}</Text>
              <Text style={[styles.statLabel, { color: colors.yellow[600] }]}>Achievements</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: colors.yellow[500] }]}>
              <Text style={styles.statIconText}>🏆</Text>
            </View>
          </View>
        </View>

        {/* Active Goals */}
        <View style={[styles.statCard, styles.purpleCard]}>
          <View style={styles.statContent}>
            <View>
              <Text style={[styles.statNumber, { color: colors.purple[700] }]}>{quickStats.activeGoals}</Text>
              <Text style={[styles.statLabel, { color: colors.purple[600] }]}>Active Goals</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: colors.purple[500] }]}>
              <Text style={styles.statIconText}>🎯</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Active Goals Section */}
      <View style={styles.activeGoalsSection}>
        <View style={styles.activeGoalsHeader}>
          <Text style={styles.activeGoalsTitle}>Active Goals</Text>
          <View style={styles.goalsCountBadge}>
            <Text style={styles.goalsCountText}>{goals.length} goals</Text>
          </View>
        </View>
        
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No Active Goals</Text>
            <Text style={styles.emptyStateText}>Set some academic goals to track your progress</Text>
          </View>
        ) : (
          <>
            {/* Goals Horizontal Scroll */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.goalsScroll}
              contentContainerStyle={styles.goalsScrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 12} // Card width + margin
              snapToAlignment="start"
            >
              {goals.map((goal) => (
                <View key={goal.id} style={styles.goalCardContainer}>
                  <GoalCard
                    goal={goal}
                    onPress={() => handleGoalPress(goal)}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Page Indicators */}
            {goals.length > 1 && (
              <View style={styles.pageIndicators}>
                {goals.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.pageIndicator,
                      index === currentIndex && styles.pageIndicatorActive
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  headerIconText: {
    fontSize: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  
  headerRight: {
    alignItems: 'flex-end',
  },
  
  lastUpdatedLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  lastUpdatedDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  
  addButtonText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  
  statCard: {
    borderRadius: 16,
    padding: 24,
    flex: 1,
    minWidth: '45%',
    marginBottom: 16,
  },
  
  blueCard: {
    backgroundColor: colors.blue[50],
    borderColor: colors.blue[200],
    borderWidth: 1,
  },
  
  greenCard: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[200],
    borderWidth: 1,
  },
  
  yellowCard: {
    backgroundColor: colors.yellow[50],
    borderColor: colors.yellow[200],
    borderWidth: 1,
  },
  
  purpleCard: {
    backgroundColor: colors.purple[50],
    borderColor: colors.purple[200],
    borderWidth: 1,
  },
  
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statIconText: {
    fontSize: 24,
  },
  
  achievementContainer: {
    marginBottom: 20,
  },
  
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  achievementBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  
  achievementFill: {
    height: '100%',
    backgroundColor: colors.status.excellent,
    borderRadius: 4,
  },
  
  achievementRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  
  goalsList: {
    maxHeight: 400,
  },
  
  activeGoalsSection: {
    marginBottom: 20,
  },
  
  activeGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  activeGoalsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  
  goalsCountBadge: {
    backgroundColor: colors.blue[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  goalsCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue[800],
  },
  
  goalsScroll: {
    marginBottom: 16,
  },
  
  goalsScrollContent: {
    paddingHorizontal: 4,
  },
  
  goalCardContainer: {
    width: width * 0.75, // 75% of screen width for better readability
    marginRight: 12, // Space between cards
  },
  
  goalCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  
  pageIndicatorActive: {
    backgroundColor: colors.purple[500],
    width: 16, // Make active indicator wider
  },
  
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  goalTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  goalTypeIconText: {
    fontSize: 16,
  },
  
  goalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  goalCardSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  goalProgressSection: {
    marginBottom: 16,
  },
  
  successRateSection: {
    marginBottom: 8,
  },
  
  successRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  successRateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  trendingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  successRateLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  successRateValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  
  successRateBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
  },
  
  successRateFill: {
    height: 8,
    borderRadius: 4,
  },
  
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  goalTitleContainer: {
    flex: 1,
  },
  
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  goalCourse: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.white,
  },
  
  goalDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  goalProgress: {
    marginBottom: 8,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  progressValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  currentValue: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  targetValue: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  deadlineLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 4,
  },
  
  deadlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  emptyStateButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
    padding: 20,
  },
  
  // Get AI Analysis styles (matching web version)
  getAIAnalysisText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  
  getAIAnalysisBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    position: 'relative',
  },
  
  getAIAnalysisMessage: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  getAIAnalysisMessageText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '500',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
