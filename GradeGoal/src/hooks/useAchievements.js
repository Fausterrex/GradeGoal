import { useState, useCallback } from 'react';
import { checkAchievements } from '../backend/api';

/**
 * Custom hook for achievement checking and management
 * Automatically checks for new achievements after user actions
 */
export const useAchievements = (userId) => {
  const [isChecking, setIsChecking] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);

  /**
   * Check for achievements and return newly unlocked ones
   */
  const checkForAchievements = useCallback(async () => {
    if (!userId || isChecking) return;

    setIsChecking(true);
    try {
      const response = await checkAchievements(userId);
      
      if (response.success && response.newlyUnlocked && response.newlyUnlocked.length > 0) {
        setNewAchievements(response.newlyUnlocked);
        
        // Show achievement notification toast for each new achievement
        response.newlyUnlocked.forEach(achievement => {
          showAchievementToast(achievement);
        });
        
        return response.newlyUnlocked;
      }
      
      return [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  }, [userId, isChecking]);

  /**
   * Show achievement toast notification
   */
  const showAchievementToast = (achievement) => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    const rarityEmojis = {
      LEGENDARY: '🏆',
      EPIC: '💎',
      RARE: '⭐',
      UNCOMMON: '🎖️',
      COMMON: '🏅'
    };

    const emoji = rarityEmojis[achievement.rarity] || '🎉';
    const title = `${emoji} Achievement Unlocked!`;
    const body = `${achievement.achievementName} - ${achievement.description}`;

    // Create a custom browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/vite.svg', // You can replace with achievement icon
        badge: '/vite.svg',
        tag: `achievement-${achievement.achievementId}`,
        requireInteraction: achievement.rarity === 'LEGENDARY',
        vibrate: achievement.rarity === 'LEGENDARY' ? [200, 100, 200] : [100]
      });
    }
  };

  /**
   * Clear new achievements
   */
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    checkForAchievements,
    isChecking,
    newAchievements,
    clearNewAchievements
  };
};

