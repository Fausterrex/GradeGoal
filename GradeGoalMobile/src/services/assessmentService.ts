import { apiClient } from './apiClient';

export class AssessmentService {
  // Create a new assessment
  static async createAssessment(assessmentData: any) {
    try {
      const response = await apiClient.post('/assessments', assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  // Update an existing assessment
  static async updateAssessment(assessmentId: number, assessmentData: any) {
    try {
      const response = await apiClient.put(`/assessments/${assessmentId}`, assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  // Delete an assessment
  static async deleteAssessment(assessmentId: number) {
    try {
      const response = await apiClient.delete(`/grades/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }

  // Get assessments by course ID
  static async getAssessmentsByCourseId(courseId: number) {
    try {
      const response = await apiClient.get(`/grades/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments by course:', error);
      throw error;
    }
  }

  // Get assessments by category ID
  static async getAssessmentsByCategoryId(categoryId: number) {
    try {
      const response = await apiClient.get(`/grades/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments by category:', error);
      throw error;
    }
  }

  // Get assessment by ID
  static async getAssessmentById(assessmentId: number) {
    try {
      const response = await apiClient.get(`/grades/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment by ID:', error);
      throw error;
    }
  }

  // Create a new assessment category
  static async createCategory(categoryData: any) {
    try {
      const response = await apiClient.post('/assessment-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment category:', error);
      throw error;
    }
  }

  // Update an existing assessment category
  static async updateCategory(categoryId: number, categoryData: any) {
    try {
      const response = await apiClient.put(`/assessment-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating assessment category:', error);
      throw error;
    }
  }

  // Delete an assessment category
  static async deleteCategory(categoryId: number) {
    try {
      const response = await apiClient.delete(`/assessment-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assessment category:', error);
      throw error;
    }
  }

  // Get categories by course ID
  static async getCategoriesByCourseId(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories by course:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(categoryId: number) {
    try {
      const response = await apiClient.get(`/assessment-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }
}
