// ========================================
// ACHIEVEMENT CONTEXT
// ========================================
// Global context for managing achievement notifications across the entire app
// Features: Queue system for multiple achievements, level up notifications, global state

import React, { createContext, useContext, useState, useCallback } from 'react';

const AchievementContext = createContext();

export const useAchievementNotifications = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementNotifications must be used within an AchievementProvider');
  }
  return context;
};

export const AchievementProvider = ({ children }) => {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show achievement notification
  const showAchievementNotification = useCallback((achievement) => {
    const notification = {
      id: `achievement-${achievement.achievementId}-${Date.now()}`,
      type: 'achievement',
      achievement,
      timestamp: Date.now()
    };

    setNotificationQueue(prev => [...prev, notification]);
    
    // If no modal is currently open, show this notification immediately
    if (!isModalOpen) {
      processNextNotification([notification]);
    }
  }, [isModalOpen]);

  // Show level up notification
  const showLevelUpNotification = useCallback((newLevel, rewards = null) => {
    const notification = {
      id: `levelup-${newLevel}-${Date.now()}`,
      type: 'levelup',
      newLevel,
      levelUpRewards: rewards,
      timestamp: Date.now()
    };

    setNotificationQueue(prev => [...prev, notification]);
    
    // If no modal is currently open, show this notification immediately
    if (!isModalOpen) {
      processNextNotification([notification]);
    }
  }, [isModalOpen]);

  // Process the next notification in the queue
  const processNextNotification = useCallback((queue = null) => {
    const currentQueue = queue || notificationQueue;
    
    if (currentQueue.length > 0 && !isModalOpen) {
      const nextNotification = currentQueue[0];
      setCurrentNotification(nextNotification);
      setIsModalOpen(true);
      
      // Remove the notification from queue
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [notificationQueue, isModalOpen]);

  // Close current notification and show next one
  const closeNotification = useCallback(() => {
    setIsModalOpen(false);
    setCurrentNotification(null);
    
    // Process next notification after a short delay
    setTimeout(() => {
      processNextNotification();
    }, 500);
  }, [processNextNotification]);

  // Clear all notifications (useful for cleanup)
  const clearAllNotifications = useCallback(() => {
    setNotificationQueue([]);
    setCurrentNotification(null);
    setIsModalOpen(false);
  }, []);

  // Get queue status
  const getQueueStatus = useCallback(() => {
    return {
      queueLength: notificationQueue.length,
      hasCurrentNotification: !!currentNotification,
      isModalOpen
    };
  }, [notificationQueue.length, currentNotification, isModalOpen]);

  const value = {
    // Notification functions
    showAchievementNotification,
    showLevelUpNotification,
    closeNotification,
    clearAllNotifications,
    
    // Current state
    currentNotification,
    isModalOpen,
    notificationQueue,
    
    // Utility functions
    getQueueStatus
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export default AchievementContext;










