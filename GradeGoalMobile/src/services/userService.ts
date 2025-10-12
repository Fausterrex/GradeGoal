import { apiClient } from './apiClient';

// User service for mobile app - matches web API endpoints
export class UserService {
  
  // Get user profile by email
  static async getUserProfile(email: string) {
    try {
      const url = `/users/email/${encodeURIComponent(email)}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error fetching user profile:', error);
      console.error('❌ [UserService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(email: string, profileData: any) {
    try {
      // First get the user by email to get the user ID
      const user = await this.getUserProfile(email);
      
      const requestData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        profilePictureUrl: profileData.profilePictureUrl || null,
        currentYearLevel: profileData.currentYearLevel || "1",
      };
      
      const url = `/users/${user.userId}/profile`;
      
      const response = await apiClient.put(url, requestData);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error updating user profile:', error);
      console.error('❌ [UserService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  }

  // Update user preferences
  static async updateUserPreferences(email: string, preferences: any) {
    try {
      const url = `/users/email/${encodeURIComponent(email)}/preferences`;
      
      const response = await apiClient.put(url, preferences);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error updating user preferences:', error);
      console.error('❌ [UserService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  }

  // Update user password
  static async updateUserPassword(email: string, passwordData: any) {
    try {
      // First get the user by email to get the user ID
      const user = await this.getUserProfile(email);
      
      const url = `/users/${user.userId}/password`;
      
      const response = await apiClient.put(url, passwordData);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error updating user password:', error);
      console.error('❌ [UserService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      throw error;
    }
  }

  // Check username availability
  static async checkUsernameAvailability(username: string) {
    try {
      const url = `/users/username/${encodeURIComponent(username)}/available`;
      
      const response = await apiClient.get(url);
      return response.data.available;
    } catch (error) {
      console.error('❌ [UserService] Error checking username availability:', error);
      console.error('❌ [UserService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }
}
