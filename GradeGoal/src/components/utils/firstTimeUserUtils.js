// ========================================
// FIRST TIME USER DETECTION UTILITY
// ========================================
// Utility functions to detect if a user is logging in for the first time

import { getCoursesByUid, getUserProfile } from "../../backend/api";
/**
 * Check if a user is a first-time user
 * @param {string} email - User email
 * @returns {Promise<boolean>} True if user is first-time
 */
export async function isFirstTimeUser(email) {
  try {
    // Check if user has any courses
    const courses = await getCoursesByUid(email);
    
    // If user has no courses, they're likely a first-time user
    if (!courses || courses.length === 0) {
      return true;
    }

    // Also check if user was created recently (within last 24 hours)
    const userProfile = await getUserProfile(email);
    if (userProfile?.createdAt) {
      const createdAt = new Date(userProfile.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
      
      // If user was created within last 24 hours and has no courses, they're first-time
      if (hoursSinceCreation < 24 && courses.length === 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking first-time user status:', error);
    // Default to false if we can't determine
    return false;
  }
}

/**
 * Check if welcome modal has been shown before
 * @param {string} userId - User ID
 * @returns {boolean} True if welcome modal has been shown
 */
export function hasSeenWelcomeModal(userId) {
  if (!userId) return false;
  
  const key = `welcomeModalShown_${userId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Mark welcome modal as shown
 * @param {string} userId - User ID
 */
export function markWelcomeModalAsShown(userId) {
  if (!userId) return;
  
  const key = `welcomeModalShown_${userId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Reset welcome modal status (for testing)
 * @param {string} userId - User ID
 */
export function resetWelcomeModalStatus(userId) {
  if (!userId) return;
  
  const key = `welcomeModalShown_${userId}`;
  localStorage.removeItem(key);
}

/**
 * Check if user has courses - if no courses, treat as new user
 * @param {string} email - User email
 * @returns {Promise<boolean>} True if user has no courses (should show welcome modal)
 */
export async function shouldShowWelcomeModal(email) {
  try {
    // Check if user has any courses
    const courses = await getCoursesByUid(email);
    
    // If user has no courses, they should see the welcome modal
    if (!courses || courses.length === 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking if user should see welcome modal:', error);
    // Default to true if we can't determine (show modal to be safe)
    return true;
  }
}
