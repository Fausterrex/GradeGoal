// ========================================
// PROGRESS TRACKING SERVICE
// ========================================
// Service for tracking user progress and gamification

import { 
  getUserProgress, 
  updateUserProgress, 
  awardPoints, 
  updateUserGPA,
  calculatePointsForAction,
  calculateLevel,
  calculateStreak
} from '../backend/progressAnalyticsApi';

class ProgressTrackingService {
  constructor() {
    this.pointsConfig = {
      grade_entered: 10,
      assignment_completed: 25,
      course_completed: 100,
      streak_maintained: 5,
      goal_achieved: 50,
      perfect_score: 15,
      improvement_made: 20,
      on_time_submission: 10,
      extra_credit_earned: 5,
      study_session_completed: 5,
      daily_login: 2,
      weekly_goal_met: 30,
      monthly_milestone: 100
    };
  }

  /**
   * Track grade entry and award points
   * @param {number} userId - User ID
   * @param {Object} gradeData - Grade data
   * @param {Object} context - Additional context
   */
  async trackGradeEntry(userId, gradeData, context = {}) {
    try {
      // Calculate points for grade entry
      let points = this.pointsConfig.grade_entered;
      
      // Bonus points for high scores
      if (gradeData.score && gradeData.maxScore) {
        const percentage = (gradeData.score / gradeData.maxScore) * 100;
        if (percentage >= 90) points += 10;
        if (percentage >= 95) points += 5;
        if (percentage === 100) points += this.pointsConfig.perfect_score;
      }

      // Bonus for extra credit
      if (gradeData.isExtraCredit && gradeData.extraCreditPoints) {
        points += this.pointsConfig.extra_credit_earned;
      }

      // Award points
      const result = await awardPoints(userId, points, 'grade_entered');
      
      // Check for level up
      await this.checkLevelUp(userId, result);
      
      return result;
    } catch (error) {
      console.error('Error tracking grade entry:', error);
      throw error;
    }
  }

  /**
   * Track assignment completion
   * @param {number} userId - User ID
   * @param {Object} assignmentData - Assignment data
   * @param {Object} context - Additional context
   */
  async trackAssignmentCompletion(userId, assignmentData, context = {}) {
    try {
      let points = this.pointsConfig.assignment_completed;
      
      // Bonus points for completing important categories
      if (context.category && context.category.weight >= 30) {
        points += 10;
      }

      // Bonus for on-time submission
      if (assignmentData.date && this.isOnTimeSubmission(assignmentData.date)) {
        points += this.pointsConfig.on_time_submission;
      }

      const result = await awardPoints(userId, points, 'assignment_completed');
      await this.checkLevelUp(userId, result);
      
      return result;
    } catch (error) {
      console.error('Error tracking assignment completion:', error);
      throw error;
    }
  }

  /**
   * Track daily login and maintain streak
   * @param {number} userId - User ID
   */
  async trackDailyLogin(userId) {
    try {
      const currentProgress = await getUserProgress(userId);
      const updatedStreak = calculateStreak(
        currentProgress.last_activity_date, 
        currentProgress.streak_days
      );

      const points = this.pointsConfig.daily_login;
      
      // Bonus for maintaining streak
      if (updatedStreak > currentProgress.streak_days) {
        points += this.pointsConfig.streak_maintained;
      }

      const result = await updateUserProgress(userId, {
        streak_days: updatedStreak,
        last_activity_date: new Date().toISOString().split('T')[0]
      });

      // Award points for login
      await awardPoints(userId, points, 'daily_login');
      
      return result;
    } catch (error) {
      console.error('Error tracking daily login:', error);
      throw error;
    }
  }

  /**
   * Track goal achievement
   * @param {number} userId - User ID
   * @param {Object} goalData - Goal data
   * @param {Object} context - Additional context
   */
  async trackGoalAchievement(userId, goalData, context = {}) {
    try {
      let points = this.pointsConfig.goal_achieved;
      
      // Bonus points based on goal type
      if (goalData.goalType === 'COURSE_GRADE') {
        points += 25;
      } else if (goalData.goalType === 'GPA') {
        points += 50;
      }

      const result = await awardPoints(userId, points, 'goal_achieved');
      await this.checkLevelUp(userId, result);
      
      return result;
    } catch (error) {
      console.error('Error tracking goal achievement:', error);
      throw error;
    }
  }

  /**
   * Track improvement made
   * @param {number} userId - User ID
   * @param {Object} improvementData - Improvement data
   */
  async trackImprovement(userId, improvementData) {
    try {
      const points = this.pointsConfig.improvement_made;
      const result = await awardPoints(userId, points, 'improvement_made');
      await this.checkLevelUp(userId, result);
      
      return result;
    } catch (error) {
      console.error('Error tracking improvement:', error);
      throw error;
    }
  }

  /**
   * Update user GPA in progress tracking
   * @param {number} userId - User ID
   * @param {number} semesterGPA - Current semester GPA
   * @param {number} cumulativeGPA - Cumulative GPA
   */
  async updateGPA(userId, semesterGPA, cumulativeGPA) {
    try {
      const result = await updateUserGPA(userId, semesterGPA, cumulativeGPA);
      return result;
    } catch (error) {
      console.error('Error updating GPA:', error);
      throw error;
    }
  }

  /**
   * Get user progress with level information
   * @param {number} userId - User ID
   */
  async getUserProgressWithLevel(userId) {
    try {
      const progress = await getUserProgress(userId);
      const levelInfo = calculateLevel(progress.total_points);
      
      return {
        ...progress,
        level_info: levelInfo
      };
    } catch (error) {
      console.error('Error getting user progress with level:', error);
      throw error;
    }
  }

  /**
   * Check if user leveled up and handle level up logic
   * @param {number} userId - User ID
   * @param {Object} updatedProgress - Updated progress data
   */
  async checkLevelUp(userId, updatedProgress) {
    try {
      const currentLevel = calculateLevel(updatedProgress.total_points);
      const previousProgress = await getUserProgress(userId);
      const previousLevel = calculateLevel(previousProgress.total_points);
      
      if (currentLevel.level > previousLevel.level) {
        // User leveled up!
        await this.handleLevelUp(userId, currentLevel, previousLevel);
        return {
          leveledUp: true,
          newLevel: currentLevel,
          previousLevel: previousLevel
        };
      }
      
      return {
        leveledUp: false,
        currentLevel: currentLevel
      };
    } catch (error) {
      console.error('Error checking level up:', error);
      throw error;
    }
  }

  /**
   * Handle level up logic
   * @param {number} userId - User ID
   * @param {Object} newLevel - New level info
   * @param {Object} previousLevel - Previous level info
   */
  async handleLevelUp(userId, newLevel, previousLevel) {
    try {
      // Award bonus points for leveling up
      const levelUpBonus = newLevel.level * 10;
      await awardPoints(userId, levelUpBonus, 'level_up');
      
      // You could also trigger notifications, achievements, etc. here
      console.log(`User ${userId} leveled up from ${previousLevel.level} to ${newLevel.level}!`);
      
      return true;
    } catch (error) {
      console.error('Error handling level up:', error);
      throw error;
    }
  }

  /**
   * Check if submission was on time
   * @param {string} dueDate - Due date
   * @param {string} submissionDate - Submission date (optional, defaults to now)
   */
  isOnTimeSubmission(dueDate, submissionDate = new Date().toISOString()) {
    const due = new Date(dueDate);
    const submitted = new Date(submissionDate);
    
    return submitted <= due;
  }

  /**
   * Calculate achievement progress
   * @param {number} userId - User ID
   * @param {Object} currentProgress - Current progress data
   */
  calculateAchievements(userId, currentProgress) {
    const achievements = [];

    // Level achievements
    if (currentProgress.current_level >= 5) {
      achievements.push({
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reached level 5',
        icon: '⭐',
        unlocked: true
      });
    }

    if (currentProgress.current_level >= 10) {
      achievements.push({
        id: 'level_10',
        name: 'Academic Champion',
        description: 'Reached level 10',
        icon: '🏆',
        unlocked: true
      });
    }

    // Streak achievements
    if (currentProgress.streak_days >= 7) {
      achievements.push({
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        unlocked: true
      });
    }

    if (currentProgress.streak_days >= 30) {
      achievements.push({
        id: 'month_streak',
        name: 'Consistency Master',
        description: 'Maintained a 30-day streak',
        icon: '💎',
        unlocked: true
      });
    }

    // GPA achievements
    if (currentProgress.semester_gpa >= 3.5) {
      achievements.push({
        id: 'honor_roll',
        name: 'Honor Roll',
        description: 'Achieved 3.5+ GPA',
        icon: '🎓',
        unlocked: true
      });
    }

    return achievements;
  }

  /**
   * Get progress summary for dashboard
   * @param {number} userId - User ID
   */
  async getProgressSummary(userId) {
    try {
      const progress = await this.getUserProgressWithLevel(userId);
      const achievements = this.calculateAchievements(userId, progress);
      
      return {
        progress,
        achievements,
        nextMilestone: this.getNextMilestone(progress),
        recentActivity: await this.getRecentActivity(userId)
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      throw error;
    }
  }

  /**
   * Get next milestone
   * @param {Object} progress - Current progress
   */
  getNextMilestone(progress) {
    const levelInfo = progress.level_info;
    
    if (levelInfo.isMaxLevel) {
      return {
        type: 'max_level',
        description: 'You\'ve reached the maximum level!',
        progress: 100
      };
    }
    
    return {
      type: 'level_up',
      description: `Reach level ${levelInfo.level + 1}`,
      progress: (levelInfo.totalPoints / (levelInfo.totalPoints + levelInfo.pointsToNextLevel)) * 100,
      pointsNeeded: levelInfo.pointsToNextLevel
    };
  }

  /**
   * Get recent activity (placeholder - would be implemented with actual activity tracking)
   * @param {number} userId - User ID
   */
  async getRecentActivity(userId) {
    // This would typically fetch from an activity log table
    return [
      {
        type: 'grade_entered',
        description: 'Entered a new grade',
        timestamp: new Date().toISOString(),
        points: 10
      },
      {
        type: 'streak_maintained',
        description: 'Maintained daily streak',
        timestamp: new Date().toISOString(),
        points: 5
      }
    ];
  }
}

export default new ProgressTrackingService();
