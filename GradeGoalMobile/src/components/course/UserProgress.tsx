import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../styles/colors';

interface UserProgressProps {
  userProgress: any;
  course: any;
  userId?: number;
}

export const UserProgress: React.FC<UserProgressProps> = ({
  userProgress,
  course,
  userId,
}) => {
  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Master Scholar';
    if (level >= 8) return 'Expert Scholar';
    if (level >= 6) return 'Advanced Scholar';
    if (level >= 4) return 'Intermediate Scholar';
    if (level >= 2) return 'Developing Scholar';
    return 'Beginner Scholar';
  };

  const getNextLevelPoints = (currentLevel: number) => {
    return (currentLevel + 1) * 100 - (userProgress?.points || 0);
  };

  const getProgressPercentage = () => {
    const currentLevel = userProgress?.level || 1;
    const currentPoints = userProgress?.points || 0;
    const levelStartPoints = (currentLevel - 1) * 100;
    const levelEndPoints = currentLevel * 100;
    const levelProgress = currentPoints - levelStartPoints;
    const levelTotal = levelEndPoints - levelStartPoints;
    return (levelProgress / levelTotal) * 100;
  };

  const progressPercentage = getProgressPercentage();
  const nextLevelPoints = getNextLevelPoints(userProgress?.level || 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      
      <View style={styles.progressHeader}>
        <Text style={styles.levelTitle}>
          {getLevelTitle(userProgress?.level || 1)}
        </Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {userProgress?.level || 1}</Text>
          <Text style={styles.pointsText}>{userProgress?.points || 0} pts</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {nextLevelPoints} points to next level
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{userProgress?.level || 1}</Text>
          <Text style={styles.metricLabel}>Level</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{userProgress?.streak || 0}</Text>
          <Text style={styles.metricLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{userProgress?.semesterGPA || 0}</Text>
          <Text style={styles.metricLabel}>Semester GPA</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{userProgress?.cumulativeGPA || 0}</Text>
          <Text style={styles.metricLabel}>Cumulative GPA</Text>
        </View>
      </View>


      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.achievementsTitle}>Recent Achievements</Text>
        
        <View style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementIconText}>💎</Text>
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Perfect Score</Text>
            <Text style={styles.achievementDescription}>
              Achieve 100% on any assessment.
            </Text>
            <View style={[styles.achievementBadge, { backgroundColor: colors.orange[100] }]}>
              <Text style={[styles.achievementBadgeText, { color: colors.orange[700] }]}>
                UNCOMMON +20 points
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementIconText}>💎</Text>
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>A+ Student</Text>
            <Text style={styles.achievementDescription}>
              Achieve a grade of 95% or higher.
            </Text>
            <View style={[styles.achievementBadge, { backgroundColor: colors.green[100] }]}>
              <Text style={[styles.achievementBadgeText, { color: colors.green[700] }]}>
                UNCOMMON +20 points
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Next Milestone */}
      <View style={styles.milestoneSection}>
        <Text style={styles.milestoneTitle}>Next Milestone</Text>
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneLevel}>Level {userProgress?.level + 1 || 2}</Text>
          <Text style={styles.milestonePoints}>{nextLevelPoints} points needed</Text>
          <View style={styles.milestoneProgressBar}>
            <View 
              style={[
                styles.milestoneProgressFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  pointsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.green[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementIcon: {
    marginRight: 12,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  achievementBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  milestoneSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  milestoneContent: {
    alignItems: 'center',
  },
  milestoneLevel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  milestonePoints: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  milestoneProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: 3,
  },
});
