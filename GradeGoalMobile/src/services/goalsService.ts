import { apiClient } from './apiClient';

export interface AcademicGoal {
  goalId: number;
  userId: number;
  courseId?: number;
  goalType: 'COURSE_GRADE' | 'SEMESTER_GPA' | 'CUMMULATIVE_GPA';
  goalTitle: string;
  targetValue: number;
  targetDate?: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isAchieved: boolean;
  achievedDate?: string;
  semester?: string;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
}

export class GoalsService {
  /**
   * Get all academic goals for a user
   */
  static async getUserGoals(userId: number): Promise<AcademicGoal[]> {
    try {
      console.log('🔍 GoalsService: Fetching all goals for userId:', userId);
      const response = await apiClient.get(`/academic-goals/user/${userId}`);
      console.log('🔍 GoalsService: All goals API response status:', response.status);
      console.log('🔍 GoalsService: All goals API response data:', response.data);
      return response.data as AcademicGoal[];
    } catch (error) {
      console.error('❌ GoalsService: Error fetching all user goals:', error);
      if (error.response) {
        console.error('❌ GoalsService: Error response status:', error.response.status);
        console.error('❌ GoalsService: Error response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Get only active (non-achieved) goals for a user
   */
  static async getActiveGoals(userId: number): Promise<AcademicGoal[]> {
    try {
      console.log('🔍 GoalsService: Fetching active goals for userId:', userId);
      const response = await apiClient.get(`/academic-goals/user/${userId}/active`);
      console.log('🔍 GoalsService: API response status:', response.status);
      console.log('🔍 GoalsService: API response data:', response.data);
      return response.data as AcademicGoal[];
    } catch (error) {
      console.error('❌ GoalsService: Error fetching active goals:', error);
      if (error.response) {
        console.error('❌ GoalsService: Error response status:', error.response.status);
        console.error('❌ GoalsService: Error response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Get goals for a specific course
   */
  static async getCourseGoals(userId: number, courseId: number): Promise<AcademicGoal[]> {
    try {
      const response = await apiClient.get(`/academic-goals/user/${userId}/course/${courseId}`);
      return response.data as AcademicGoal[];
    } catch (error) {
      console.error('Error fetching course goals:', error);
      return [];
    }
  }

  /**
   * Get goals by type
   */
  static async getGoalsByType(userId: number, goalType: string): Promise<AcademicGoal[]> {
    try {
      const response = await apiClient.get(`/academic-goals/user/${userId}/type/${goalType}`);
      return response.data as AcademicGoal[];
    } catch (error) {
      console.error('Error fetching goals by type:', error);
      return [];
    }
  }

  /**
   * Create a new academic goal
   */
  static async createGoal(goalData: Partial<AcademicGoal>): Promise<AcademicGoal> {
    try {
      const response = await apiClient.post('/academic-goals', goalData);
      return response.data as AcademicGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  /**
   * Update an existing goal
   */
  static async updateGoal(goalId: number, goalData: Partial<AcademicGoal>): Promise<AcademicGoal> {
    try {
      const response = await apiClient.put(`/academic-goals/${goalId}`, goalData);
      return response.data as AcademicGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  /**
   * Mark a goal as achieved
   */
  static async markGoalAsAchieved(goalId: number): Promise<boolean> {
    try {
      const response = await apiClient.put(`/academic-goals/${goalId}/achieve`);
      return response.data as boolean;
    } catch (error) {
      console.error('Error marking goal as achieved:', error);
      return false;
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(goalId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/academic-goals/${goalId}`);
      return response.data as boolean;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }
}
