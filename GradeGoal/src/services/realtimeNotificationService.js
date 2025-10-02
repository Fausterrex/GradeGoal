import axios from 'axios';
import pushNotificationService from './pushNotificationService';

const API_BASE_URL = 'http://localhost:8080/api/realtime-notifications';
const PUSH_API_BASE_URL = 'http://localhost:8080/api/push-notifications';

/**
 * Real-time Notification Service
 * 
 * Service for triggering real-time email notifications from the frontend.
 * These notifications are sent immediately when user actions occur.
 */
class RealtimeNotificationService {
  
  /**
   * Send grade alert notification
   * @param {string} userEmail - User's email address
   * @param {string} courseName - Course name
   * @param {string} assessmentName - Assessment name
   * @param {number} score - Grade score
   * @param {number} maxScore - Maximum possible score
   */
  static async sendGradeAlert(userEmail, courseName, assessmentName, score, maxScore) {
    try {
      // Send email notification
      const emailResponse = await axios.post(`${API_BASE_URL}/grade-alert`, {
        userEmail,
        courseName,
        assessmentName,
        score,
        maxScore
      });
      // Send push notification if enabled
      if (pushNotificationService.isEnabled()) {
        try {
          await axios.post(`${PUSH_API_BASE_URL}/grade-alert`, {
            userEmail,
            courseName,
            assessmentName,
            score,
            maxScore
          });
        } catch (pushError) {
          // Push notification failed, but email was sent
        }
      } else {
        // Try to initialize push notifications if not enabled
        try {
          const initialized = await pushNotificationService.initialize(userEmail);
          if (initialized) {
            // Retry sending push notification
            await axios.post(`${PUSH_API_BASE_URL}/grade-alert`, {
              userEmail,
              courseName,
              assessmentName,
              score,
              maxScore
            });
          }
        } catch (initError) {
          // Failed to initialize push notifications
        }
      }

      return emailResponse.data;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Send course completion notification
   * @param {string} userEmail - User's email address
   * @param {string} courseName - Course name
   * @param {string} finalGrade - Final course grade
   * @param {string} semester - Semester information
   */
  static async sendCourseCompletion(userEmail, courseName, finalGrade, semester) {
    try {
      // Send email notification
      const emailResponse = await axios.post(`${API_BASE_URL}/course-completion`, {
        userEmail,
        courseName,
        finalGrade,
        semester
      });

      // Send push notification if enabled
      if (pushNotificationService.isEnabled()) {
        try {
          await axios.post(`${PUSH_API_BASE_URL}/course-completion`, {
            userEmail,
            courseName,
            finalGrade,
            semester
          });
        } catch (pushError) {
          // Push notification failed, but email was sent
        }
      } else {
        // Try to initialize push notifications if not enabled
        try {
          const initialized = await pushNotificationService.initialize(userEmail);
          if (initialized) {
            // Retry sending push notification
            await axios.post(`${PUSH_API_BASE_URL}/course-completion`, {
              userEmail,
              courseName,
              finalGrade,
              semester
            });
          }
        } catch (initError) {
          // Failed to initialize push notifications
        }
      }

      return emailResponse.data;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Send custom reminder notification
   * @param {string} userEmail - User's email address
   * @param {string} reminderTitle - Reminder title
   * @param {string} reminderMessage - Reminder message
   * @param {string} reminderType - Reminder type
   */
  static async sendCustomReminder(userEmail, reminderTitle, reminderMessage, reminderType) {
    try {
      const response = await axios.post(`${API_BASE_URL}/custom-reminder`, {
        userEmail,
        reminderTitle,
        reminderMessage,
        reminderType
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a grade should trigger an alert (below 70%)
   * @param {number} score - Grade score
   * @param {number} maxScore - Maximum possible score
   * @returns {boolean} - True if grade alert should be sent
   */
  static shouldTriggerGradeAlert(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    return percentage < 70; // Alert if below 70%
  }

  /**
   * Check if a goal has been achieved
   * @param {number} actualValue - Actual value achieved
   * @param {number} targetValue - Target value
   * @param {string} goalType - Type of goal (higher is better, lower is better, etc.)
   * @returns {boolean} - True if goal has been achieved
   */
  static isGoalAchieved(actualValue, targetValue, goalType) {
    // Convert to numbers to ensure proper comparison
    const actual = parseFloat(actualValue);
    const target = parseFloat(targetValue);
    
    
    switch (goalType) {
      case 'COURSE_GRADE':
      case 'GPA':
      case 'CUMMULATIVE_GPA':
      case 'SEMESTER_GPA':
        return actual >= target;
      case 'ATTENDANCE':
        return actual >= target;
      default:
        return actual >= target;
    }
  }

  /**
   * Check if a course is completed (all assessments graded)
   * @param {Array} assessments - List of assessments
   * @returns {boolean} - True if course is completed
   */
  static isCourseCompleted(assessments) {
    console.log('🔍 [isCourseCompleted] Checking', assessments.length, 'assessments');
    
    const result = assessments.every(assessment => {
      // Check different possible score properties
      const hasScore = assessment.score !== null && assessment.score !== undefined && assessment.score > 0;
      const hasPointsEarned = assessment.pointsEarned !== null && assessment.pointsEarned !== undefined && assessment.pointsEarned > 0;
      const hasGrades = assessment.grades && assessment.grades.length > 0;
      const hasValidGradeScore = hasGrades && assessment.grades.some(grade => grade.score !== null && grade.score > 0);
      
      // An assessment is completed if it has any valid score
      const isCompleted = hasScore || hasPointsEarned || hasValidGradeScore;
      
      console.log('🔍 [isCourseCompleted] Assessment:', assessment.assessmentName || 'Unknown', {
        hasScore,
        hasPointsEarned,
        hasGrades,
        hasValidGradeScore,
        isCompleted,
        score: assessment.score,
        pointsEarned: assessment.pointsEarned,
        gradesCount: assessment.grades ? assessment.grades.length : 0
      });
      
      return isCompleted;
    });
    
    console.log('🔍 [isCourseCompleted] Final result:', result);
    return result;
  }



}

export default RealtimeNotificationService;
