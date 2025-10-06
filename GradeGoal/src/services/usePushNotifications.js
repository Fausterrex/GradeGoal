import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import pushNotificationService from '../services/pushNotificationService';

/**
 * Custom hook for managing push notifications
 * 
 * Provides push notification state and methods for the current user.
 * Automatically initializes push notifications when user logs in.
 */
export const usePushNotifications = () => {
  const { currentUser } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check support and current status
  useEffect(() => {
    const supported = pushNotificationService.isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      const status = pushNotificationService.getPermissionStatus();
      setPermissionStatus(status);
      // Don't set isEnabled here - let the database sync handle it
      // setIsEnabled(pushNotificationService.isEnabled());
    }
  }, []);

  // Sync with database state when user changes
  useEffect(() => {
    const syncWithDatabase = async () => {
      if (currentUser?.email) {
        try {
          const response = await fetch(`http://localhost:8080/api/users/email/${encodeURIComponent(currentUser.email)}`);
          if (response.ok) {
            const user = await response.json();
            // Update local state to match database state
            if (user.pushNotificationsEnabled !== undefined) {
              // Prioritize database state for UI display
              // Only check browser permission, not FCM token (which might not be loaded yet)
              const browserSupported = pushNotificationService.isNotificationSupported();
              const hasPermission = Notification.permission === 'granted';
              const shouldBeEnabled = user.pushNotificationsEnabled && browserSupported && hasPermission;
              
              console.log('🔔 Push Notification Sync:', {
                databaseEnabled: user.pushNotificationsEnabled,
                browserSupported,
                hasPermission,
                shouldBeEnabled,
                permissionStatus: Notification.permission
              });
              
              // Show as enabled if database says enabled AND browser supports it AND has permission
              setIsEnabled(shouldBeEnabled);
              
              // If database says enabled but browser doesn't have permission, 
              // we might need to re-request permission
              if (user.pushNotificationsEnabled && browserSupported && !hasPermission) {
              }
            }
          }
        } catch (error) {
          console.error('Failed to sync push notification state with database:', error);
        }
      }
    };

    syncWithDatabase();
  }, [currentUser]);

  // Initialize push notifications when user logs in
  useEffect(() => {
    // Don't auto-initialize - let the user choose via modal
    // if (currentUser?.email && isSupported && permissionStatus === 'default') {
    //   initializePushNotifications();
    // }
  }, [currentUser, isSupported, permissionStatus]);

  const initializePushNotifications = useCallback(async () => {
    if (!currentUser?.email || !isSupported) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.initialize(currentUser.email);
      setIsEnabled(success);
      setPermissionStatus(pushNotificationService.getPermissionStatus());
      return success;
    } catch (err) {
      setError('Failed to initialize push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isSupported]);

  const enablePushNotifications = useCallback(async () => {
    if (!currentUser?.email) {
      setError('User must be logged in to enable push notifications');
      return false;
    }

    return await initializePushNotifications();
  }, [currentUser, initializePushNotifications]);

  const disablePushNotifications = useCallback(async () => {
    if (!currentUser?.email) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pushNotificationService.cleanup(currentUser.email);
      setIsEnabled(false);
      setPermissionStatus('denied');
      return true;
    } catch (err) {
      setError('Failed to disable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const granted = await pushNotificationService.requestPermission();
      setPermissionStatus(pushNotificationService.getPermissionStatus());
      
      if (granted && currentUser?.email) {
        const success = await pushNotificationService.initialize(currentUser.email);
        setIsEnabled(success);
        return success;
      }
      
      return granted;
    } catch (err) {
      setError('Failed to request notification permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, currentUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isEnabled,
    isSupported,
    permissionStatus,
    isLoading,
    error,
    
    // Methods
    enablePushNotifications,
    disablePushNotifications,
    requestPermission,
    initializePushNotifications,
    clearError,
    
    // Computed
    canRequestPermission: isSupported && permissionStatus === 'default',
    isPermissionGranted: permissionStatus === 'granted',
    isPermissionDenied: permissionStatus === 'denied',
  };
};

export default usePushNotifications;

