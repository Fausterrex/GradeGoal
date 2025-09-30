import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/realtime-notifications';

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
      const response = await axios.post(`${API_BASE_URL}/grade-alert`, {
        userEmail,
        courseName,
        assessmentName,
        score,
        maxScore
      });
      console.log('Grade alert notification sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending grade alert notification:', error);
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
    console.log('🎓 Attempting to send course completion notification:', {
      userEmail,
      courseName,
      finalGrade,
      semester,
      apiUrl: `${API_BASE_URL}/course-completion`
    });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/course-completion`, {
        userEmail,
        courseName,
        finalGrade,
        semester
      });
      console.log('✅ Course completion notification sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending course completion notification:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
      console.log('Custom reminder notification sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending custom reminder notification:', error);
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
    
    console.log('🎯 Goal achievement check:', {
      goalType,
      actualValue: actual,
      targetValue: target,
      isAchieved: actual >= target
    });
    
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
    console.log('🔍 Checking course completion for', assessments.length, 'assessments');
    
    const result = assessments.every(assessment => {
      // Check different possible score properties
      const hasScore = assessment.score !== null && assessment.score !== undefined && assessment.score > 0;
      const hasPointsEarned = assessment.pointsEarned !== null && assessment.pointsEarned !== undefined && assessment.pointsEarned > 0;
      const hasGrades = assessment.grades && assessment.grades.length > 0;
      const hasValidGradeScore = hasGrades && assessment.grades.some(grade => grade.score !== null && grade.score > 0);
      
      // An assessment is completed if it has any valid score
      const isCompleted = hasScore || hasPointsEarned || hasValidGradeScore;
      
      console.log(`  📝 ${assessment.name || assessment.assessmentName}:`, {
        hasScore,
        score: assessment.score,
        hasPointsEarned,
        pointsEarned: assessment.pointsEarned,
        hasGrades,
        gradesCount: assessment.grades ? assessment.grades.length : 0,
        hasValidGradeScore,
        isCompleted,
        assessment: assessment
      });
      
      return isCompleted;
    });
    
    console.log('✅ Course completion result:', result);
    return result;
  }


  /**
   * Manually trigger goal achievement check for all goals
   * This function can be called from browser console to test goal achievement
   */
  static async triggerGoalAchievementCheck() {
    console.log('🔍 Manually triggering goal achievement check...');
    
    try {
      // Fetch all goals for user
      const response = await fetch('http://localhost:8080/api/academic-goals/user/1');
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      
      const goals = await response.json();
      console.log('📋 Found goals:', goals);
      
      // Check each goal
      for (const goal of goals) {
        console.log('🎯 Checking goal:', goal.goalTitle);
        
        if (goal.currentProgress && goal.targetValue) {
          const isAchieved = this.isGoalAchieved(
            goal.currentProgress,
            goal.targetValue,
            goal.goalType
          );
          
          console.log('📊 Goal analysis:', {
            goalTitle: goal.goalTitle,
            currentProgress: goal.currentProgress,
            targetValue: goal.targetValue,
            isAchieved,
            alreadyMarked: goal.isAchieved
          });
          
          if (isAchieved && !goal.isAchieved) {
            console.log('🎉 Goal should be marked as achieved!');
            
            // Update goal in database
            const updateData = {
              ...goal,
              isAchieved: 1,
              achievedDate: new Date().toISOString().split('T')[0],
              status: 'completed'
            };
            
            const updateResponse = await fetch(`http://localhost:8080/api/academic-goals/${goal.goalId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData)
            });
            
            if (updateResponse.ok) {
              console.log('✅ Goal updated in database:', goal.goalTitle);
            } else {
              console.error('❌ Failed to update goal:', goal.goalTitle);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in goal achievement check:', error);
    }
  }

}

export default RealtimeNotificationService;
