import { apiClient } from './apiClient';

export interface StreakData {
  streakDays: number;
  lastActivityDate: string;
  isStreakActive: boolean;
}

export class StreakService {
  /**
   * Get user's current streak data
   */
  static async getUserStreak(userId: string): Promise<StreakData> {
    try {
      const response = await apiClient.get(`/users/${userId}/streak`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      // Return default streak data on error
      return {
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        isStreakActive: false,
      };
    }
  }

  /**
   * Update user's streak on login
   */
  static async updateStreakOnLogin(userId: string): Promise<StreakData> {
    try {
      const response = await apiClient.post(`/users/${userId}/streak/login`);
      return response.data;
    } catch (error) {
      console.error('Error updating streak on login:', error);
      // Return default streak data on error
      return {
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        isStreakActive: false,
      };
    }
  }

  /**
   * Reset user's streak
   */
  static async resetStreak(userId: string): Promise<StreakData> {
    try {
      const response = await apiClient.post(`/users/${userId}/streak/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting streak:', error);
      throw error;
    }
  }

  /**
   * Get streak statistics
   */
  static async getStreakStats(userId: string): Promise<{
    streakDays: number;
    longestStreak: number;
    totalLogins: number;
    streakStartDate: string;
    isStreakActive: boolean;
  }> {
    try {
      const response = await apiClient.get(`/users/${userId}/streak/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streak stats:', error);
      return {
        streakDays: 0,
        longestStreak: 0,
        totalLogins: 0,
        streakStartDate: new Date().toISOString(),
        isStreakActive: false,
      };
    }
  }
}
