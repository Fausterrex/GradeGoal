// ========================================
// FIREBASE AUTHENTICATION SERVICE FOR MOBILE
// ========================================
// Unified Firebase authentication service for mobile app
// Replaces direct database authentication with Firebase Auth

import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { User } from '../types';
import { apiClient } from './apiClient';

class FirebaseAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private isRegistering: boolean = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip auth state handling during registration to prevent 404 errors
      if (this.isRegistering) {
        console.log('Registration in progress, skipping auth state change...');
        return;
      }

      if (firebaseUser) {
        try {
          // Get user profile from database using Firebase UID
          const userProfile = await this.getUserProfileByFirebaseUid(firebaseUser.uid);
          
          if (userProfile) {
            // User profile exists in database
            this.currentUser = {
              userId: userProfile.userId,
              email: firebaseUser.email || '',
              firstName: userProfile.firstName || firebaseUser.displayName?.split(' ')[0] || '',
              lastName: userProfile.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: userProfile.role || 'USER',
              isActive: userProfile.isActive ?? true,
              currentYearLevel: userProfile.currentYearLevel || '1st Year',
              createdAt: userProfile.createdAt || new Date().toISOString(),
              updatedAt: userProfile.updatedAt || new Date().toISOString(),
              profilePictureUrl: firebaseUser.photoURL || userProfile.profilePictureUrl
            };
          } else {
            // User profile doesn't exist yet (new registration in progress)
            // Don't set currentUser yet, wait for registration to complete
            console.log('User profile not found, waiting for registration to complete...');
            this.currentUser = null;
          }
        } catch (error) {
          // Silently handle 404 errors during registration process
          if (error.response?.status === 404) {
            console.log('User profile not found (404), waiting for registration to complete...');
            this.currentUser = null;
          } else {
            console.error('Error fetching user profile:', error);
            // Only set fallback user for non-404 errors
            this.currentUser = {
              userId: null,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'USER',
              isActive: true,
              currentYearLevel: '1st Year',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              profilePictureUrl: firebaseUser.photoURL
            };
          }
        }
      } else {
        this.currentUser = null;
      }
      
      this.notifyAuthStateChange(this.currentUser);
    });
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Login failed');
      }

      // Get user profile from database
      const userProfile = await this.getUserProfileByFirebaseUid(firebaseUser.uid);
      
      const user: User = {
        userId: userProfile?.userId || null,
        email: firebaseUser.email || '',
        firstName: userProfile?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
        lastName: userProfile?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        role: userProfile?.role || 'USER',
        isActive: userProfile?.isActive ?? true,
        currentYearLevel: userProfile?.currentYearLevel || '1st Year',
        createdAt: userProfile?.createdAt || new Date().toISOString(),
        updatedAt: userProfile?.updatedAt || new Date().toISOString(),
        profilePictureUrl: firebaseUser.photoURL || userProfile?.profilePictureUrl
      };

      this.currentUser = user;
      this.notifyAuthStateChange(user);

      // Update login streak
      if (user.userId) {
        try {
          await this.updateUserLoginStreak(user.userId);
        } catch (error) {
          console.error('Error updating login streak:', error);
        }
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: any): Promise<User> {
    this.isRegistering = true;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email, 
        userData.password
      );
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Registration failed');
      }

      // Create user profile in database first
      const userProfile = await this.createUserProfile(firebaseUser, userData);
      
      if (!userProfile) {
        throw new Error('Failed to create user profile in database');
      }
      
      // Add a small delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
        userId: userProfile.userId,
        email: firebaseUser.email || '',
        firstName: userProfile.firstName || userData.firstName || '',
        lastName: userProfile.lastName || userData.lastName || '',
        role: userProfile.role || 'USER',
        isActive: userProfile.isActive ?? true,
        currentYearLevel: userProfile.currentYearLevel || '1st Year',
        createdAt: userProfile.createdAt || new Date().toISOString(),
        updatedAt: userProfile.updatedAt || new Date().toISOString(),
        profilePictureUrl: firebaseUser.photoURL || userProfile.profilePictureUrl
      };

      this.currentUser = user;
      this.notifyAuthStateChange(user);

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      // If registration fails, sign out the Firebase user
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Error signing out after failed registration:', signOutError);
      }
      throw error;
    } finally {
      this.isRegistering = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.notifyAuthStateChange(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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
      
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Helper methods
  private async getUserProfileByFirebaseUid(firebaseUid: string): Promise<any> {
    try {
      const response = await apiClient.get(`/users/firebase-uid/${firebaseUid}`);
      return response.data;
    } catch (error) {
      // Only log non-404 errors to reduce console noise during registration
      if (error.response?.status !== 404) {
        console.error('Error fetching user profile by Firebase UID:', error);
      }
      return null;
    }
  }

  private async createUserProfile(firebaseUser: FirebaseUser, userData: any): Promise<any> {
    try {
      const response = await apiClient.post('/users/register-firebase', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  private async updateUserLoginStreak(userId: number): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/update-login-streak`);
    } catch (error) {
      console.error('Error updating login streak:', error);
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
