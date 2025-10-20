import { messaging, auth } from "../../backend/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";
const API_BASE_URL = 'http://localhost:8080/api/push-notifications';

/**
 * Push Notification Service
 * 
 * Service for managing Firebase Cloud Messaging (FCM) push notifications.
 * Handles token registration, permission requests, and message handling.
 */
class PushNotificationService {
  
  constructor() {
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.currentToken = null;
  }

  /**
   * Get Firebase authentication headers
   * @returns {Promise<Object>} Headers object with auth token
   */
  async getAuthHeaders() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if push notifications are supported
   * @returns {boolean} True if supported
   */
  isNotificationSupported() {
    return this.isSupported;
  }

  /**
   * Request notification permission from user
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get FCM token for the current user
   * @returns {Promise<string|null>} FCM token or null if failed
   */
  async getToken() {
    if (!this.isSupported) {
      return null;
    }

    try {
      // Register service worker first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        } catch (swError) {
          return null;
        }
      }

      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      });
      
      if (token) {
        this.currentToken = token;
        return token;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Register FCM token with backend
   * @param {string} userEmail - User's email address
   * @param {string} token - FCM token
   * @returns {Promise<boolean>} True if registration successful
   */
  async registerToken(userEmail, token) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/register`, {
        userEmail,
        fcmToken: token
      }, { headers });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Unregister FCM token from backend
   * @param {string} userEmail - User's email address
   * @param {string} token - FCM token
   * @returns {Promise<boolean>} True if unregistration successful
   */
  async unregisterToken(userEmail, token) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/unregister`, {
        userEmail,
        fcmToken: token
      }, { headers });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize push notifications for the current user
   * @param {string} userEmail - User's email address
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initialize(userEmail) {
    if (!this.isSupported) {
      return false;
    }

    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return false;
      }

      // Get FCM token
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      // Register token with backend
      const registered = await this.registerToken(userEmail, token);
      if (!registered) {
        return false;
      }

      // Set up message listener
      this.setupMessageListener();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set up message listener for incoming push notifications
   */
  setupMessageListener() {
    onMessage(messaging, (payload) => {
      // Show notification with fallback
      if (payload.notification) {
        this.showNotification(payload.notification);
      } else if (payload.data) {
        // Fallback to data payload
        this.showNotification({
          title: payload.data.title || 'GradeGoal Notification',
          body: payload.data.body || 'You have a new notification'
        });
      } else {
        // Last resort fallback
        this.showNotification({
          title: 'GradeGoal',
          body: 'You have a new notification'
        });
      }
    });
  }

  /**
   * Show browser notification
   * @param {Object} notification - Notification data
   */
  showNotification(notification) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const notificationOptions = {
      body: notification.body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'gradegoal-notification',
      requireInteraction: true
    };

    const browserNotification = new Notification(notification.title, notificationOptions);

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Navigate to relevant page if needed
      if (notification.click_action) {
        window.location.href = notification.click_action;
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);
  }

  /**
   * Clean up push notifications
   * @param {string} userEmail - User's email address
   */
  async cleanup(userEmail) {
    if (this.currentToken) {
      await this.unregisterToken(userEmail, this.currentToken);
      this.currentToken = null;
    }
  }

  /**
   * Check if user has push notifications enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.isSupported && 
           Notification.permission === 'granted' && 
           this.currentToken !== null;
  }

  /**
   * Get current notification permission status
   * @returns {string} Permission status
   */
  getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;

