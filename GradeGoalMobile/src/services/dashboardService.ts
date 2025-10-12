import { apiClient } from './apiClient';

// Dashboard data service for fetching real data from Spring Boot backend
export class DashboardService {
  
  // Get user profile by email
  static async getUserProfile(email: string) {
    try {
      const response = await apiClient.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Get courses by user ID
  static async getCoursesByUserId(userId: number) {
    try {
      const response = await apiClient.get(`/courses/user/id/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get user progress with GPAs
  static async getUserProgress(userId: number) {
    try {
      const response = await apiClient.get(`/user-progress/${userId}/with-gpas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Get all semester GPAs
  static async getAllSemesterGPAs(userId: number) {
    try {
      const response = await apiClient.get(`/user-progress/${userId}/all-semester-gpas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching semester GPAs:', error);
      throw error;
    }
  }

  // Get academic goals by user ID
  static async getAcademicGoals(userId: number) {
    try {
      const response = await apiClient.get(`/academic-goals/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching academic goals:', error);
      throw error;
    }
  }

  // Get grades by course ID
  static async getGradesByCourseId(courseId: number) {
    try {
      const response = await apiClient.get(`/grades/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  // Get AI analysis for course
  static async getAIAnalysis(userId: number, courseId: number) {
    try {
      const response = await apiClient.get(`/ai-analysis/${userId}/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      throw error;
    }
  }

  // Check if AI analysis exists
  static async checkAIAnalysisExists(userId: number, courseId: number) {
    try {
      const response = await apiClient.get(`/ai-analysis/${userId}/${courseId}/exists`);
      return response.data;
    } catch (error) {
      console.error('Error checking AI analysis:', error);
      throw error;
    }
  }

  // Get user login streak
  static async getUserLoginStreak(userId: number) {
    try {
      const response = await apiClient.get(`/users/${userId}/login-streak`);
      return response.data;
    } catch (error) {
      console.error('Error fetching login streak:', error);
      throw error;
    }
  }

  // Get user activities
  static async getUserActivities(userId: number, days: number = 7) {
    try {
      const response = await apiClient.get(`/user-activities/${userId}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  // Get notifications
  static async getNotifications(userId: number) {
    try {
      const response = await apiClient.get(`/achievements/notifications/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get user achievements
  static async getUserAchievements(userId: number) {
    try {
      const response = await apiClient.get(`/achievements/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }
}

export default DashboardService;
