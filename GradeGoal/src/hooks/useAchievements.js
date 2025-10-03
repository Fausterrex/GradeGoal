import { useState, useCallback } from 'react';
import { checkAchievements } from '../backend/api';
import { useAchievementNotifications } from '../context/AchievementContext';

/**
 * Custom hook for achievement checking and management
 * Automatically checks for new achievements after user actions
 */
export const useAchievements = (userId) => {
  const [isChecking, setIsChecking] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const { showAchievementNotification, showLevelUpNotification } = useAchievementNotifications();

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
        
        // Show achievement notification modal for each new achievement
        response.newlyUnlocked.forEach(achievement => {
          showAchievementNotification(achievement);
        });
        
        return response.newlyUnlocked;
      }
      
      // Check for level up notifications in the response
      if (response.success && response.levelUpInfo && response.levelUpInfo.leveledUp) {
        showLevelUpNotification(response.levelUpInfo.newLevel, response.levelUpInfo.rewards);
      }
      
      return [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  }, [userId, isChecking, showAchievementNotification, showLevelUpNotification]);

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

