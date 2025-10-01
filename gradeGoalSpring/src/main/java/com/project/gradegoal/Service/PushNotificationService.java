package com.project.gradegoal.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Push Notification Service
 * 
 * Service class for sending push notifications using Firebase Cloud Messaging.
 * Handles token registration, unregistration, and sending notifications.
 */
@Service
public class PushNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);
    
    @Autowired(required = false)
    private FirebaseMessaging firebaseMessaging;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Register FCM token for a user
     * @param userEmail User's email address
     * @param fcmToken FCM token
     * @return true if registration successful
     */
    public boolean registerToken(String userEmail, String fcmToken) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFcmToken(fcmToken);
                user.setPushNotificationsEnabled(true);
                userRepository.save(user);
                
                logger.info("FCM token registered for user: {}", userEmail);
                return true;
            } else {
                logger.warn("User not found for FCM token registration: {}", userEmail);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error registering FCM token for user: {}", userEmail, e);
            return false;
        }
    }
    
    /**
     * Unregister FCM token for a user
     * @param userEmail User's email address
     * @param fcmToken FCM token
     * @return true if unregistration successful
     */
    public boolean unregisterToken(String userEmail, String fcmToken) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (fcmToken.equals(user.getFcmToken())) {
                    user.setFcmToken(null);
                    user.setPushNotificationsEnabled(false);
                    userRepository.save(user);
                    
                    logger.info("FCM token unregistered for user: {}", userEmail);
                    return true;
                } else {
                    logger.warn("FCM token mismatch for user: {}", userEmail);
                    return false;
                }
            } else {
                logger.warn("User not found for FCM token unregistration: {}", userEmail);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error unregistering FCM token for user: {}", userEmail, e);
            return false;
        }
    }
    
    /**
     * Send push notification to a specific user
     * @param userEmail User's email address
     * @param title Notification title
     * @param body Notification body
     * @param data Additional data
     * @return true if notification sent successfully
     */
    public boolean sendNotificationToUser(String userEmail, String title, String body, String data) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
                    logger.warn("No FCM token found for user: {}", userEmail);
                    return false;
                }
                
                if (user.getPushNotificationsEnabled() == null || !user.getPushNotificationsEnabled()) {
                    logger.warn("Push notifications disabled for user: {}", userEmail);
                    return false;
                }
                
                return sendNotification(user.getFcmToken(), title, body, data);
            } else {
                logger.warn("User not found: {}", userEmail);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error sending notification to user: {}", userEmail, e);
            return false;
        }
    }
    
    /**
     * Send push notification to multiple users
     * @param userEmails List of user email addresses
     * @param title Notification title
     * @param body Notification body
     * @param data Additional data
     * @return number of notifications sent successfully
     */
    public int sendNotificationToUsers(List<String> userEmails, String title, String body, String data) {
        int successCount = 0;
        
        for (String userEmail : userEmails) {
            if (sendNotificationToUser(userEmail, title, body, data)) {
                successCount++;
            }
        }
        
        logger.info("Sent notifications to {}/{} users", successCount, userEmails.size());
        return successCount;
    }
    
    /**
     * Send push notification using FCM token
     * @param fcmToken FCM token
     * @param title Notification title
     * @param body Notification body
     * @param data Additional data
     * @return true if notification sent successfully
     */
    private boolean sendNotification(String fcmToken, String title, String body, String data) {
        if (firebaseMessaging == null) {
            logger.warn("FirebaseMessaging is not available. Push notifications are disabled.");
            return false;
        }
        
        try {
            Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putData("data", data != null ? data : "")
                .putData("timestamp", String.valueOf(System.currentTimeMillis()))
                .build();
            
            String response = firebaseMessaging.send(message);
            logger.info("Push notification sent successfully. Response: {}", response);
            return true;
            
        } catch (FirebaseMessagingException e) {
            logger.error("Failed to send push notification", e);
            return false;
        }
    }
    
    /**
     * Send grade alert notification
     * @param userEmail User's email address
     * @param courseName Course name
     * @param assessmentName Assessment name
     * @param score Grade score
     * @param maxScore Maximum possible score
     * @return true if notification sent successfully
     */
    public boolean sendGradeAlertNotification(String userEmail, String courseName, String assessmentName, double score, double maxScore) {
        String title = "📊 Grade Alert - " + courseName;
        String body = String.format("You received %.1f/%.1f (%.1f%%) on %s", 
            score, maxScore, (score/maxScore)*100, assessmentName);
        
        String data = String.format("{\"type\":\"grade_alert\",\"course\":\"%s\",\"assessment\":\"%s\",\"score\":%.1f,\"maxScore\":%.1f}", 
            courseName, assessmentName, score, maxScore);
        
        return sendNotificationToUser(userEmail, title, body, data);
    }
    
    /**
     * Send course completion notification
     * @param userEmail User's email address
     * @param courseName Course name
     * @param finalGrade Final course grade
     * @param semester Semester information
     * @return true if notification sent successfully
     */
    public boolean sendCourseCompletionNotification(String userEmail, String courseName, String finalGrade, String semester) {
        String title = "🎓 Course Completed - " + courseName;
        String body = String.format("Congratulations! You completed %s with a final grade of %s", courseName, finalGrade);
        
        String data = String.format("{\"type\":\"course_completion\",\"course\":\"%s\",\"grade\":\"%s\",\"semester\":\"%s\"}", 
            courseName, finalGrade, semester);
        
        return sendNotificationToUser(userEmail, title, body, data);
    }
    
    /**
     * Send goal achievement notification
     * @param userEmail User's email address
     * @param goalTitle Goal title
     * @param goalType Goal type
     * @param achievedValue Achieved value
     * @return true if notification sent successfully
     */
    public boolean sendGoalAchievementNotification(String userEmail, String goalTitle, String goalType, String achievedValue) {
        String title = "🎯 Goal Achieved!";
        String body = String.format("Congratulations! You achieved your goal: %s (%s)", goalTitle, achievedValue);
        
        String data = String.format("{\"type\":\"goal_achievement\",\"goal\":\"%s\",\"goalType\":\"%s\",\"value\":\"%s\"}", 
            goalTitle, goalType, achievedValue);
        
        return sendNotificationToUser(userEmail, title, body, data);
    }
    
    /**
     * Send assessment reminder notification
     * @param userEmail User's email address
     * @param courseName Course name
     * @param assessmentName Assessment name
     * @param dueDate Due date
     * @return true if notification sent successfully
     */
    public boolean sendAssessmentReminderNotification(String userEmail, String courseName, String assessmentName, String dueDate) {
        String title = "⏰ Assessment Reminder - " + courseName;
        String body = String.format("Don't forget! %s is due on %s", assessmentName, dueDate);
        
        String data = String.format("{\"type\":\"assessment_reminder\",\"course\":\"%s\",\"assessment\":\"%s\",\"dueDate\":\"%s\"}", 
            courseName, assessmentName, dueDate);
        
        return sendNotificationToUser(userEmail, title, body, data);
    }
    
    /**
     * Send achievement notification
     * @param userEmail User's email address
     * @param achievementName Achievement name
     * @param description Achievement description
     * @param pointsValue Points earned
     * @return true if notification sent successfully
     */
    public boolean sendAchievementNotification(String userEmail, String achievementName, String description, int pointsValue) {
        String title = "🏆 Achievement Unlocked!";
        String body = String.format("You earned '%s'! +%d points", achievementName, pointsValue);
        
        String data = String.format("{\"type\":\"achievement\",\"name\":\"%s\",\"description\":\"%s\",\"points\":%d}", 
            achievementName, description, pointsValue);
        
        return sendNotificationToUser(userEmail, title, body, data);
    }
    
    /**
     * Check if user has push notifications enabled
     * @param userEmail User's email address
     * @return true if enabled
     */
    public boolean isPushNotificationsEnabled(String userEmail) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled();
            }
            return false;
        } catch (Exception e) {
            logger.error("Error checking push notification status for user: {}", userEmail, e);
            return false;
        }
    }
}

