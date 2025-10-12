import { apiClient } from './apiClient';

export class GradeService {
  // Create a new grade
  static async createGrade(gradeData: any) {
    try {
      const response = await apiClient.post('/grades', gradeData);
      return response.data;
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  }

  // Update an existing grade
  static async updateGrade(gradeId: number, gradeData: any) {
    try {
      const response = await apiClient.put(`/grades/${gradeId}`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  }

  // Delete a grade
  static async deleteGrade(gradeId: number) {
    try {
      const response = await apiClient.delete(`/grades/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  }

  // Get grades by course ID
  static async getGradesByCourseId(courseId: number) {
    try {
      const response = await apiClient.get(`/grades/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades by course:', error);
      throw error;
    }
  }

  // Get grades by assessment ID
  static async getGradesByAssessmentId(assessmentId: number) {
    try {
      const response = await apiClient.get(`/grades/assessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades by assessment:', error);
      throw error;
    }
  }

  // Get grades by category ID
  static async getGradesByCategoryId(categoryId: number) {
    try {
      const response = await apiClient.get(`/grades/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades by category:', error);
      throw error;
    }
  }

  // Get grade by ID
  static async getGradeById(gradeId: number) {
    try {
      const response = await apiClient.get(`/grades/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade by ID:', error);
      throw error;
    }
  }
}
