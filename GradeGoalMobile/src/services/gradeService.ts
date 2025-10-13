import { apiClient } from './apiClient';
import { currentConfig } from '../config/environment';

export class GradeService {
  // Test connectivity to backend
  static async testConnectivity() {
    try {
      console.log('🔍 [DEBUG] Testing backend connectivity...');
      console.log('🌐 [DEBUG] API Base URL:', currentConfig.api.baseURL);
      
      // Try to access a simple endpoint that should exist
      const response = await apiClient.get('/users/test');
      console.log('✅ [DEBUG] Backend is reachable:', response.status);
      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Backend connectivity test failed:', error);
      // If the test endpoint fails, try a basic connectivity test
      try {
        const response = await apiClient.get('/');
        console.log('✅ [DEBUG] Backend is reachable (root endpoint):', response.status);
        return true;
      } catch (rootError) {
        console.error('❌ [DEBUG] Root endpoint also failed:', rootError);
        return false;
      }
    }
  }

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
      console.log('🔄 [DEBUG] Updating grade:', { gradeId, gradeData });
      console.log('🌐 [DEBUG] API Base URL:', currentConfig.api.baseURL);
      
      const response = await apiClient.put(`/grades/${gradeId}`, gradeData);
      console.log('✅ [DEBUG] Grade updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DEBUG] Error updating grade:', error);
      console.error('❌ [DEBUG] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });
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

