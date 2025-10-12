// ========================================
// GOALS SERVICE
// ========================================
// Service for managing academic goals API calls

import { apiClient } from './apiClient';

export interface AcademicGoal {
  goalId: number;
  userId: number;
  goalTitle: string;
  goalType: 'COURSE_GRADE' | 'SEMESTER_GPA' | 'CUMMULATIVE_GPA';
  targetValue: number;
  targetDate?: string;
  description?: string;
  courseId?: number;
  semester?: string;
  academicYear?: string;
  status: 'active' | 'completed' | 'cancelled';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isAchieved: boolean;
  achievedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  userId: number;
  goalTitle: string;
  goalType: 'COURSE_GRADE' | 'SEMESTER_GPA' | 'CUMMULATIVE_GPA';
  targetValue: number;
  targetDate?: string;
  description?: string;
  courseId?: number;
  semester?: string;
  academicYear?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  goalId: number;
}

/**
 * Get all goals for a user
 */
export const getGoalsByUserId = async (userId: number): Promise<AcademicGoal[]> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

/**
 * Get a specific goal by ID
 */
export const getGoalById = async (goalId: number): Promise<AcademicGoal> => {
  try {
    const response = await apiClient.get(`/academic-goals/${goalId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
};

/**
 * Create a new goal
 */
export const createGoal = async (goalData: CreateGoalRequest): Promise<AcademicGoal> => {
  try {
    const response = await apiClient.post('/academic-goals', goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Update an existing goal
 */
export const updateGoal = async (goalId: number, goalData: Partial<CreateGoalRequest>): Promise<AcademicGoal> => {
  try {
    const response = await apiClient.put(`/academic-goals/${goalId}`, goalData);
    return response.data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (goalId: number): Promise<void> => {
  try {
    await apiClient.delete(`/academic-goals/${goalId}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

/**
 * Get goals by type
 */
export const getGoalsByType = async (userId: number, goalType: string): Promise<AcademicGoal[]> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/type/${goalType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals by type:', error);
    throw error;
  }
};

/**
 * Get goals by status
 */
export const getGoalsByStatus = async (userId: number, status: string): Promise<AcademicGoal[]> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals by status:', error);
    throw error;
  }
};

/**
 * Get goals by semester
 */
export const getGoalsBySemester = async (userId: number, semester: string): Promise<AcademicGoal[]> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/semester/${semester}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals by semester:', error);
    throw error;
  }
};

/**
 * Mark goal as achieved
 */
export const markGoalAsAchieved = async (goalId: number): Promise<AcademicGoal> => {
  try {
    const response = await apiClient.put(`/academic-goals/${goalId}/achieve`);
    return response.data;
  } catch (error) {
    console.error('Error marking goal as achieved:', error);
    throw error;
  }
};

/**
 * Get goal statistics for a user
 */
export const getGoalStatistics = async (userId: number): Promise<{
  totalGoals: number;
  achievedGoals: number;
  activeGoals: number;
  goalsByType: Record<string, number>;
  goalsByStatus: Record<string, number>;
  averageAchievementRate: number;
}> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goal statistics:', error);
    throw error;
  }
};

/**
 * Get goal progress for a specific goal
 */
export const getGoalProgress = async (goalId: number): Promise<{
  goalId: number;
  currentValue: number;
  targetValue: number;
  progress: number;
  isAchieved: boolean;
  isOnTrack: boolean;
  achievementProbability: number;
  status: string;
}> => {
  try {
    const response = await apiClient.get(`/academic-goals/${goalId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    throw error;
  }
};

/**
 * Get available courses for goal creation
 */
export const getAvailableCoursesForGoal = async (userId: number): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/available-courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available courses:', error);
    throw error;
  }
};

/**
 * Validate goal data before submission
 */
export const validateGoalData = (goalData: CreateGoalRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!goalData.goalTitle || goalData.goalTitle.trim().length === 0) {
    errors.push('Goal title is required');
  }

  if (!goalData.goalType) {
    errors.push('Goal type is required');
  }

  if (!goalData.targetValue || goalData.targetValue <= 0) {
    errors.push('Target value must be greater than 0');
  }

  if (goalData.goalType === 'COURSE_GRADE' && !goalData.courseId) {
    errors.push('Course is required for course grade goals');
  }

  if (goalData.goalType === 'SEMESTER_GPA' && (!goalData.semester || !goalData.academicYear)) {
    errors.push('Semester and academic year are required for semester GPA goals');
  }

  if (goalData.targetDate) {
    const targetDate = new Date(goalData.targetDate);
    const today = new Date();
    if (targetDate < today) {
      errors.push('Target date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get goal recommendations based on user's current performance
 */
export const getGoalRecommendations = async (userId: number): Promise<{
  recommendedGoals: CreateGoalRequest[];
  insights: string[];
  suggestions: string[];
}> => {
  try {
    const response = await apiClient.get(`/academic-goals/user/${userId}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goal recommendations:', error);
    throw error;
  }
};