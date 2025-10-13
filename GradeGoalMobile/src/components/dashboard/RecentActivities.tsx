import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';
import { DashboardService } from '../../services/dashboardService';
import { CourseService } from '../../services/courseService';
import { getGoalsByUserId } from '../../services/goalsService';
import { apiClient } from '../../services/apiClient';

interface Activity {
  id: string;
  type: 'grade_entry' | 'goal_achievement' | 'goal_created' | 'notification' | 'achievement' | 'ai_analysis';
  title: string;
  description: string;
  timestamp: Date;
  courseName?: string;
  status?: string;
  isRead?: boolean;
  score?: string;
  goalType?: string;
  analysisType?: string;
  notificationType?: string;
  priority?: string;
  icon?: string;
  color?: string;
  rarity?: string;
  points?: number;
  category?: string;
  notificationId?: number;
  actionData?: string;
}

interface RecentActivitiesProps {
  courses: any[];
}

const ActivityCard: React.FC<{ 
  activity: Activity; 
  onPress: () => void;
  getActivityIcon: (iconName?: string) => string;
  getColorClasses: (color?: string) => any;
}> = ({ 
  activity, 
  onPress,
  getActivityIcon,
  getColorClasses
}) => {
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return timestamp.toLocaleDateString();
  };

  const colorClasses = getColorClasses(activity.color);

  return (
    <TouchableOpacity style={styles.activityCard} onPress={onPress}>
      <View style={[styles.activityIcon, { backgroundColor: colorClasses.bg, borderColor: colorClasses.border }]}>
        <Text style={styles.activityIconText}>{getActivityIcon(activity.icon)}</Text>
      </View>
      
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.clockIcon}>🕐</Text>
            <Text style={styles.activityTime}>{formatTimestamp(activity.timestamp)}</Text>
          </View>
        </View>
        
        <Text style={styles.activityDescription}>{activity.description}</Text>
        
        {activity.courseName && (
          <View style={styles.courseTag}>
            <Text style={styles.courseTagText}>{activity.courseName}</Text>
          </View>
        )}
        
        {activity.score && (
          <View style={[styles.statusTag, { backgroundColor: activity.score === 'Upcoming' ? colors.purple[500] : colors.blue[500] }]}>
            <Text style={styles.statusTagText}>
              {activity.score === 'Upcoming' ? 'Status: Upcoming' : `Score: ${activity.score}`}
            </Text>
          </View>
        )}

        {/* Achievement details */}
        {activity.type === 'achievement' && activity.rarity && (
          <View style={styles.achievementDetails}>
            <View style={[styles.rarityTag, { 
              backgroundColor: activity.rarity === 'LEGENDARY' ? colors.yellow[500] :
                              activity.rarity === 'EPIC' ? colors.purple[500] :
                              activity.rarity === 'RARE' ? colors.blue[500] :
                              activity.rarity === 'UNCOMMON' ? colors.green[500] :
                              colors.gray[500]
            }]}>
              <Text style={styles.rarityText}>{activity.rarity}</Text>
            </View>
            <Text style={styles.pointsText}>+{activity.points} points</Text>
            {activity.category && (
              <Text style={styles.categoryText}>{activity.category}</Text>
            )}
          </View>
        )}

        {/* Unread indicator for notifications */}
        {activity.type === 'notification' && !activity.isRead && (
          <View style={styles.unreadIndicator}>
            <Text style={styles.unreadText}>Unread</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ courses }) => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Activity[]>([]);
  const [userAchievements, setUserAchievements] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<7 | 14>(7);
  const [activityFilter, setActivityFilter] = useState<'all' | 'grade_entry' | 'goal_achievement' | 'notification' | 'achievement' | 'ai_analysis' | 'goal_created'>('all');

  // Load activities when dependencies change
  useEffect(() => {
    if (currentUser) {
      loadRecentActivities();
    }
  }, [currentUser, courses.length, timeFilter]);

  // Fetch notifications when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUserAchievements();
    }
  }, [userId]);

  // Filter activities based on selected filter
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'notification') {
      return notifications;
    }
    if (activityFilter === 'achievement') {
      return userAchievements;
    }
    if (activityFilter === 'all') {
      return [...activities, ...notifications, ...userAchievements];
    }
    return activities.filter(activity => activity.type === activityFilter);
  }, [activities, notifications, userAchievements, activityFilter]);

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const response = await apiClient.get(`/achievements/notifications/${userId}`);
      const data = response.data as any[];
      
      // Convert notifications to activity format
      const notificationActivities = data.map((notification: any) => ({
        id: `notification-${notification.notificationId}`,
        type: 'notification' as const,
        title: notification.title,
        description: notification.message,
        timestamp: new Date(notification.createdAt),
        icon: 'Bell',
        color: 'blue',
        isRead: notification.isRead,
        notificationId: notification.notificationId,
        notificationType: notification.notificationType,
        actionData: notification.actionData
      }));
      
      setNotifications(notificationActivities);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty array on error to prevent UI issues
      setNotifications([]);
    }
  };

  // Fetch user achievements from database
  const fetchUserAchievements = async () => {
    if (!userId) return;
    
    try {
      const response = await apiClient.get(`/user-progress/${userId}/recent-achievements`);
      const data = response.data as any[];
      
      // Convert user achievements to activity format
      const achievementActivities = data.map((achievement: any) => ({
        id: `achievement-${achievement.userAchievementId}`,
        type: 'achievement' as const,
        title: achievement.name,
        description: achievement.description,
        timestamp: new Date(achievement.earnedAt),
        icon: 'Award',
        color: 'yellow',
        rarity: achievement.rarity,
        points: achievement.points,
        category: achievement.category
      }));
      
      setUserAchievements(achievementActivities);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      // Set empty array on error to prevent UI issues
      setUserAchievements([]);
    }
  };

  const loadRecentActivities = async () => {
    try {
      setIsLoading(true);
      
      // Get user profile
      const userProfile = await DashboardService.getUserProfile(currentUser!.email) as any;
      setUserId(userProfile.userId);
      
      // If no courses, still load notifications and achievements but skip course-related activities
      if (!courses.length) {
        await Promise.all([
          fetchNotifications(),
          fetchUserAchievements()
        ]);
        
        // Load goals even without courses
        const allGoals = await getGoalsByUserId(userProfile.userId);
        setGoals(allGoals);
        
        setIsLoading(false);
        return;
      }
      
      // Fetch notifications and user achievements
      await Promise.all([
        fetchNotifications(),
        fetchUserAchievements()
      ]);

      // Load goals
      const allGoals = await getGoalsByUserId(userProfile.userId);
      setGoals(allGoals);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeFilter);

      // Fetch different types of activities
      const [recentGrades, recentGoalChanges, recentAIAnalysis] = await Promise.all([
        fetchRecentGrades(userProfile.userId, startDate, endDate),
        fetchRecentGoalChanges(allGoals, startDate, endDate),
        fetchRecentAIAnalysis(userProfile.userId, startDate, endDate)
      ]);

      // Combine and sort all activities
      const allActivities = [
        ...recentGrades,
        ...recentGoalChanges,
        ...recentAIAnalysis
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(allActivities.slice(0, 20)); // Limit to 20 most recent

    } catch (error) {
      console.error("Error loading recent activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // ACTIVITY FETCHERS
  // ========================================
  const fetchRecentGrades = async (userId: number, startDate: Date, endDate: Date) => {
    try {
      // Fetch recent grades from all courses
      const gradeActivities: Activity[] = [];
      
      for (const course of courses) {
        if (course.isActive === false) continue;
        
        try {
          const [grades, categories] = await Promise.all([
            DashboardService.getGradesByCourseId(course.id || course.courseId),
            CourseService.getCourseCategories(course.id || course.courseId)
          ]) as [any[], any[]];
          
          // Create a map of assessment_id to assessment_name
          const assessmentMap: { [key: number]: string } = {};
          
          // Fetch assessments for each category
          for (const category of categories) {
            try {
              const response = await apiClient.get(`/assessments/category/${category.categoryId}`);
              const assessments = response.data as any[];
              assessments.forEach((assessment: any) => {
                assessmentMap[assessment.assessmentId || assessment.id] = assessment.assessmentName || assessment.name;
              });
            } catch (error) {
              console.warn(`Failed to fetch assessments for category ${category.categoryId}:`, error);
            }
          }
          
          // Filter grades by date range
          const recentGrades = grades.filter((grade: any) => {
            const gradeDate = new Date(grade.createdAt || grade.updatedAt);
            return gradeDate >= startDate && gradeDate <= endDate;
          });
          
          recentGrades.forEach((grade: any) => {
            const pointsEarned = grade.pointsEarned;
            const pointsPossible = grade.pointsPossible;
            const isPending = pointsEarned === 0 || pointsEarned === null || pointsEarned === undefined;
            const assessmentName = assessmentMap[grade.assessmentId] || 'Assessment';
            
            gradeActivities.push({
              id: `grade-${grade.gradeId}`,
              type: 'grade_entry',
              title: isPending ? 'New Assessment Added' : 'Grade Added',
              description: isPending 
                ? `Upcoming ${assessmentName} in ${course.name}` 
                : `${grade.percentageScore}% in ${assessmentName}`,
              timestamp: new Date(grade.createdAt || grade.updatedAt),
              courseName: course.name,
              score: isPending ? 'Upcoming' : `${pointsEarned}/${pointsPossible}`,
              icon: 'BookOpen',
              color: isPending ? 'purple' : 'blue'
            });
          });
        } catch (error) {
          console.warn(`Failed to fetch grades for course ${course.id}:`, error);
        }
      }
      
      return gradeActivities;
    } catch (error) {
      console.error("Error fetching recent grades:", error);
      return [];
    }
  };

  const fetchRecentGoalChanges = (goals: any[], startDate: Date, endDate: Date) => {
    const goalActivities: Activity[] = [];
    
    goals.forEach(goal => {
      // Check for recently achieved goals
      if (goal.isAchieved && goal.achievedDate) {
        const achievedDate = new Date(goal.achievedDate);
        if (achievedDate >= startDate && achievedDate <= endDate) {
          goalActivities.push({
            id: `goal-achieved-${goal.goalId}`,
            type: 'goal_achievement',
            title: 'Goal Achieved!',
            description: `Completed ${goal.goalTitle} - ${goal.targetValue}${goal.goalType === 'COURSE_GRADE' ? '%' : ' GPA'}`,
            timestamp: new Date(goal.achievedDate),
            goalType: goal.goalType,
            icon: 'Award',
            color: 'green'
          });
        }
      }
      
      // Check for recently created goals
      if (goal.createdAt) {
        const createdDate = new Date(goal.createdAt);
        if (createdDate >= startDate && createdDate <= endDate) {
          goalActivities.push({
            id: `goal-created-${goal.goalId}`,
            type: 'goal_created',
            title: 'New Goal Set',
            description: `Set target for ${goal.goalTitle} - ${goal.targetValue}${goal.goalType === 'COURSE_GRADE' ? '%' : ' GPA'}`,
            timestamp: new Date(goal.createdAt),
            goalType: goal.goalType,
            icon: 'Target',
            color: 'purple'
          });
        }
      }
    });
    
    return goalActivities;
  };

  const fetchRecentAIAnalysis = async (userId: number, startDate: Date, endDate: Date) => {
    try {
      const aiAnalysisActivities: Activity[] = [];
      
      // Check for recent AI analysis for each course
      for (const course of courses) {
        if (course.isActive === false) continue;
        
        try {
          const response = await apiClient.get(`/ai-analysis/${userId}/${course.id || course.courseId}`);
          const analysisResponse = response.data as any;
          
          if (analysisResponse.success && analysisResponse.hasAnalysis) {
            const analysis = analysisResponse.analysis;
            const createdAt = new Date(analysis.createdAt);
            const updatedAt = new Date(analysis.updatedAt);
            
            // Check if analysis was created or updated within the time range
            if ((createdAt >= startDate && createdAt <= endDate) || 
                (updatedAt >= startDate && updatedAt <= endDate)) {
              
              aiAnalysisActivities.push({
                id: `ai-analysis-${course.id}-${analysis.id}`,
                type: 'ai_analysis',
                title: 'AI Analysis Generated',
                description: `New AI insights and recommendations for ${course.name}`,
                timestamp: updatedAt > createdAt ? updatedAt : createdAt,
                courseName: course.name,
                analysisType: analysis.analysisType,
                icon: 'TrendingUp',
                color: 'indigo'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check AI analysis for course ${course.id}:`, error);
        }
      }
      
      return aiAnalysisActivities;
    } catch (error) {
      console.error("Error fetching recent AI analysis:", error);
      return [];
    }
  };

  const handleActivityPress = (activity: Activity) => {
    Alert.alert(
      activity.title,
      `${activity.description}\n\nTime: ${activity.timestamp.toLocaleString()}`,
      [
        { text: 'OK' },
        { text: 'Mark as Read', onPress: () => markAsRead(activity.id) },
      ]
    );
  };

  const markAsRead = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, isRead: true }
          : activity
      )
    );
  };

  const getUnreadCount = () => {
    return activities.filter(activity => !activity.isRead).length;
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const getActivityIcon = (iconName?: string) => {
    const iconMap: { [key: string]: string } = {
      'BookOpen': '📚',
      'Award': '🏆',
      'Target': '🎯',
      'Bell': '🔔',
      'TrendingUp': '📈',
      'Calendar': '📅',
      'CheckCircle': '✅',
      'AlertCircle': '⚠️',
      'Star': '⭐'
    };
    return iconMap[iconName || 'Bell'] || '🔔';
  };

  const getColorClasses = (color?: string) => {
    const colorMap: { [key: string]: any } = {
      blue: { bg: colors.blue[100], text: colors.blue[700], border: colors.blue[200] },
      green: { bg: colors.green[100], text: colors.green[700], border: colors.green[200] },
      purple: { bg: colors.purple[100], text: colors.purple[700], border: colors.purple[200] },
      red: { bg: colors.red[100], text: colors.red[700], border: colors.red[200] },
      yellow: { bg: colors.yellow[100], text: colors.yellow[700], border: colors.yellow[200] },
      gray: { bg: colors.gray[100], text: colors.gray[700], border: colors.gray[200] },
      indigo: { bg: colors.indigo[100], text: colors.indigo[700], border: colors.indigo[200] }
    };
    return colorMap[color || 'gray'] || colorMap.gray;
  };

  const getFilterCounts = () => {
    return {
      all: filteredActivities.length,
      grade_entry: activities.filter(a => a.type === 'grade_entry').length,
      goal_achievement: activities.filter(a => a.type === 'goal_achievement').length,
      goal_created: activities.filter(a => a.type === 'goal_created').length,
      notification: notifications.length,
      achievement: userAchievements.length,
      ai_analysis: activities.filter(a => a.type === 'ai_analysis').length,
    };
  };

  const filterCounts = getFilterCounts();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading recent activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.headerIcon}>🕐</Text>
            <Text style={styles.title}>Recent Activities</Text>
          </View>
          <Text style={styles.subtitle}>Your academic progress over the last {timeFilter} days</Text>
        </View>
        <View style={styles.timeFilter}>
          <TouchableOpacity
            style={[styles.timeFilterButton, timeFilter === 7 && styles.timeFilterButtonActive]}
            onPress={() => setTimeFilter(7)}
          >
            <Text style={[styles.timeFilterText, timeFilter === 7 && styles.timeFilterTextActive]}>
              7 days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeFilterButton, timeFilter === 14 && styles.timeFilterButtonActive]}
            onPress={() => setTimeFilter(14)}
          >
            <Text style={[styles.timeFilterText, timeFilter === 14 && styles.timeFilterTextActive]}>
              14 days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activities List */}
      <ScrollView style={styles.activitiesList} showsVerticalScrollIndicator={true}>
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Activities Found</Text>
            <Text style={styles.emptyStateText}>
              Your recent academic activities will appear here
            </Text>
          </View>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onPress={() => handleActivityPress(activity)}
              getActivityIcon={getActivityIcon}
              getColorClasses={getColorClasses}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation and Summary */}
      <View style={styles.bottomSection}>
        {/* Navigation Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navigationTabs}>
          {[
            { key: 'all', label: 'All' },
            { key: 'notification', label: 'Notifications' },
            { key: 'grade_entry', label: 'Grades' },
            { key: 'goal_achievement', label: 'Goal Achieved' },
            { key: 'goal_created', label: 'New Goal' },
            { key: 'achievement', label: 'Achievements' },
            { key: 'ai_analysis', label: 'AI Analysis' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.navigationTab,
                activityFilter === filter.key && styles.navigationTabActive
              ]}
              onPress={() => setActivityFilter(filter.key as any)}
            >
              <Text style={[
                styles.navigationTabText,
                activityFilter === filter.key && styles.navigationTabTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Numerical Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.blue[600] }]}>
              {activityFilter === 'all' ? filterCounts.grade_entry : 
               activityFilter === 'grade_entry' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>Grade Entries</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.green[600] }]}>
              {activityFilter === 'all' ? filterCounts.goal_achievement : 
               activityFilter === 'goal_achievement' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>Goals Achieved</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.purple[600] }]}>
              {activityFilter === 'all' ? filterCounts.goal_created : 
               activityFilter === 'goal_created' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>New Goals</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.orange[600] }]}>
              {activityFilter === 'all' ? filterCounts.notification : 
               activityFilter === 'notification' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>Notifications</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.yellow[600] }]}>
              {activityFilter === 'all' ? filterCounts.achievement : 
               activityFilter === 'achievement' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>Achievements</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.indigo[600] }]}>
              {activityFilter === 'all' ? filterCounts.ai_analysis : 
               activityFilter === 'ai_analysis' ? filteredActivities.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>AI Analysis</Text>
          </View>
        </View>
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
    marginBottom: 16,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
    color: colors.purple[500],
  },
  
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  
  timeFilter: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 2,
  },
  
  timeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  timeFilterButtonActive: {
    backgroundColor: colors.blue[600],
  },
  
  timeFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  
  timeFilterTextActive: {
    color: colors.text.white,
  },
  
  activitiesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purple[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  activityIconText: {
    fontSize: 20,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  clockIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  
  activityTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  
  activityDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  
  courseTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  courseTagText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  
  statusTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purple[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusTagText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '500',
  },
  
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 16,
  },
  
  navigationTabs: {
    marginBottom: 16,
  },
  
  navigationTab: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  
  navigationTabActive: {
    backgroundColor: colors.purple[500],
  },
  
  navigationTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  
  navigationTabTextActive: {
    color: colors.text.white,
  },
  
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  summaryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    lineHeight: 20,
  },
  
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
    padding: 20,
  },
  
  achievementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  
  rarityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  
  rarityText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: '600',
  },
  
  pointsText: {
    fontSize: 12,
    color: colors.purple[600],
    fontWeight: '600',
    marginRight: 8,
  },
  
  categoryText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  unreadIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: colors.blue[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  
  unreadText: {
    color: colors.blue[700],
    fontSize: 12,
    fontWeight: '500',
  },
});
