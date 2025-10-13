import { apiClient } from './apiClient';

export class NotificationService {
  /**
   * Send an email notification via backend
   */
  static async sendEmailNotification(
    userId: number,
    userEmail: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await apiClient.post('/notifications/send-email', {
        userId,
        userEmail,
        title,
        body,
        data,
      });
      console.log('Email notification sent via backend');
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Check if user has email notifications enabled
   */
  static async isEmailNotificationsEnabled(userId: number): Promise<boolean> {
    try {
      const response = await apiClient.get(`/users/${userId}/preferences`);
      return response.data?.emailNotificationsEnabled ?? false;
    } catch (error) {
      console.error('Error checking email notification preferences:', error);
      return false;
    }
  }

  /**
   * Send assessment created notification
   */
  static async notifyAssessmentCreated(
    userId: number,
    assessmentName: string,
    courseName: string,
    userEmail?: string
  ): Promise<void> {
    const title = 'New Assessment Added';
    const body = `${assessmentName} has been added to ${courseName}`;

    // Send email notification if user has email notifications enabled
    if (userEmail) {
      try {
        const emailEnabled = await this.isEmailNotificationsEnabled(userId);
        if (emailEnabled) {
          await this.sendEmailNotification(userId, userEmail, title, body, {
            type: 'assessment_created',
            assessmentName,
            courseName,
          });
        }
      } catch (error) {
        console.error('Error checking email preferences or sending email:', error);
      }
    }
  }

  /**
   * Send grade added notification
   */
  static async notifyGradeAdded(
    userId: number,
    assessmentName: string,
    score: number,
    maxScore: number,
    courseName: string,
    userEmail?: string
  ): Promise<void> {
    const title = 'Grade Added';
    const body = `You scored ${score}/${maxScore} on ${assessmentName} in ${courseName}`;

    // Send email notification if user has email notifications enabled
    if (userEmail) {
      try {
        const emailEnabled = await this.isEmailNotificationsEnabled(userId);
        if (emailEnabled) {
          await this.sendEmailNotification(userId, userEmail, title, body, {
            type: 'grade_added',
            assessmentName,
            score,
            maxScore,
            courseName,
          });
        }
      } catch (error) {
        console.error('Error checking email preferences or sending email:', error);
      }
    }
  }

  /**
   * Send goal achieved notification
   */
  static async notifyGoalAchieved(
    userId: number,
    goalName: string,
    courseName: string,
    userEmail?: string
  ): Promise<void> {
    const title = 'Goal Achieved! 🎉';
    const body = `Congratulations! You achieved your goal "${goalName}" in ${courseName}`;

    // Send email notification if user has email notifications enabled
    if (userEmail) {
      try {
        const emailEnabled = await this.isEmailNotificationsEnabled(userId);
        if (emailEnabled) {
          await this.sendEmailNotification(userId, userEmail, title, body, {
            type: 'goal_achieved',
            goalName,
            courseName,
          });
        }
      } catch (error) {
        console.error('Error checking email preferences or sending email:', error);
      }
    }
  }

  /**
   * Send test email notification
   */
  static async sendTestEmailNotification(
    userId: number,
    userEmail: string
  ): Promise<void> {
    const title = 'Test Email Notification';
    const body = 'This is a test email notification from GradeGoal. Email notifications are working correctly!';
    
    try {
      const emailEnabled = await this.isEmailNotificationsEnabled(userId);
      if (emailEnabled) {
        await this.sendEmailNotification(userId, userEmail, title, body, {
          type: 'test_email',
        });
        console.log('Test email notification sent');
      } else {
        console.log('Email notifications are disabled for this user');
      }
    } catch (error) {
      console.error('Error sending test email notification:', error);
    }
  }
}