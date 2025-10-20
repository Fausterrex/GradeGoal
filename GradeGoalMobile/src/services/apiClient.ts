import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentConfig } from '../config/environment';
import { auth } from '../config/firebase';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = currentConfig.api.baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: currentConfig.api.timeout,
      headers: currentConfig.network.defaultHeaders,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add Firebase auth token
    this.client.interceptors.request.use(
      async (config) => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error('Error getting Firebase token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh Firebase token
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              const newToken = await firebaseUser.getIdToken(true); // Force refresh
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Error refreshing Firebase token:', refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Firebase handles token refresh automatically
  // This method is kept for compatibility but not used with Firebase
  private async refreshToken(): Promise<string> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('No Firebase user available');
    }
    
    return await firebaseUser.getIdToken(true);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

export const apiClient = new ApiClient();
