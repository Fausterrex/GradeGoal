import { User, LoginCredentials, RegisterData } from '../types';
import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUser = user;
        this.notifyAuthStateChange(user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthStateChange(user: User | null) {
    this.authStateListeners.forEach(listener => listener(user));
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      const user = response.data as User;
      
      // Store user data in AsyncStorage (no JWT tokens in your current backend)
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      this.currentUser = user;
      this.notifyAuthStateChange(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post('/users/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      const user = response.data as User;
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      this.currentUser = user;
      this.notifyAuthStateChange(user);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // No logout endpoint in your backend, just clear local data
      await AsyncStorage.removeItem('user_data');
      this.currentUser = null;
      this.notifyAuthStateChange(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async googleLogin(): Promise<User> {
    try {
      // For now, return a mock user - implement Google OAuth later
      const mockUser: User = {
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        currentYearLevel: '1st Year',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async facebookLogin(): Promise<User> {
    try {
      // For now, return a mock user - implement Facebook OAuth later
      const mockUser: User = {
        userId: 2,
        email: 'facebook@example.com',
        firstName: 'Facebook',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        currentYearLevel: '2nd Year',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data as User;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
