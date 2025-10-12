import { apiClient } from './apiClient';

// Course management service for mobile app
export class CourseService {
  
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

  // Get course by ID (includes calculated GPA)
  static async getCourseById(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw error;
    }
  }

  // Create a new course
  static async createCourse(courseData: any) {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Update an existing course
  static async updateCourse(courseId: number, courseData: any) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete a course permanently
  static async deleteCourse(courseId: number) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Archive a course
  static async archiveCourse(courseId: number) {
    try {
      const response = await apiClient.put(`/courses/${courseId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving course:', error);
      throw error;
    }
  }

  // Unarchive/restore a course
  static async unarchiveCourse(courseId: number) {
    try {
      const response = await apiClient.put(`/courses/${courseId}/unarchive`);
      return response.data;
    } catch (error) {
      console.error('Error unarchiving course:', error);
      throw error;
    }
  }

  // Mark course as complete with AI rating
  static async completeCourseWithRating(courseId: number, aiPredictionRating: number) {
    try {
      const response = await apiClient.put(`/courses/${courseId}/complete-with-rating`, {
        aiPredictionRating
      });
      return response.data;
    } catch (error) {
      console.error('Error completing course with rating:', error);
      throw error;
    }
  }

  // Mark course as incomplete
  static async uncompleteCourse(courseId: number) {
    try {
      const response = await apiClient.put(`/courses/${courseId}/uncomplete`);
      return response.data;
    } catch (error) {
      console.error('Error marking course as incomplete:', error);
      throw error;
    }
  }

  // Get grades for a specific course
  static async getGradesByCourseId(courseId: number) {
    try {
      const response = await apiClient.get(`/grades/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  // Get course categories
  static async getCourseCategories(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course categories:', error);
      throw error;
    }
  }
}

export default CourseService;
