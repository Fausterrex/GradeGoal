package com.project.gradegoal.Controller;

import com.project.gradegoal.Service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Push Notification Controller
 * 
 * REST controller for managing push notifications.
 * Provides endpoints for token registration, unregistration, and sending notifications.
 */
@RestController
@RequestMapping("/api/push-notifications")
@CrossOrigin(origins = "*")
public class PushNotificationController {
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    /**
     * Register FCM token for a user
     * @param request Token registration request
     * @return Response indicating success or failure
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerToken(@RequestBody TokenRegistrationRequest request) {
        try {
            boolean success = pushNotificationService.registerToken(
                request.getUserEmail(), 
                request.getFcmToken()
            );
            
            if (success) {
                return ResponseEntity.ok("FCM token registered successfully for: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to register FCM token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error registering FCM token: " + e.getMessage());
        }
    }
    
    /**
     * Unregister FCM token for a user
     * @param request Token unregistration request
     * @return Response indicating success or failure
     */
    @PostMapping("/unregister")
    public ResponseEntity<String> unregisterToken(@RequestBody TokenRegistrationRequest request) {
        try {
            boolean success = pushNotificationService.unregisterToken(
                request.getUserEmail(), 
                request.getFcmToken()
            );
            
            if (success) {
                return ResponseEntity.ok("FCM token unregistered successfully for: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to unregister FCM token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error unregistering FCM token: " + e.getMessage());
        }
    }
    
    /**
     * Send push notification to a specific user
     * @param request Notification request
     * @return Response indicating success or failure
     */
    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        try {
            boolean success = pushNotificationService.sendNotificationToUser(
                request.getUserEmail(),
                request.getTitle(),
                request.getBody(),
                request.getData()
            );
            
            if (success) {
                return ResponseEntity.ok("Notification sent successfully to: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to send notification");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending notification: " + e.getMessage());
        }
    }
    
    /**
     * Send push notification to multiple users
     * @param request Bulk notification request
     * @return Response indicating success or failure
     */
    @PostMapping("/send-bulk")
    public ResponseEntity<String> sendBulkNotification(@RequestBody BulkNotificationRequest request) {
        try {
            int successCount = pushNotificationService.sendNotificationToUsers(
                request.getUserEmails(),
                request.getTitle(),
                request.getBody(),
                request.getData()
            );
            
            return ResponseEntity.ok(String.format("Notifications sent to %d users", successCount));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending bulk notifications: " + e.getMessage());
        }
    }
    
    /**
     * Check if user has push notifications enabled
     * @param userEmail User's email address
     * @return Response with notification status
     */
    @GetMapping("/status/{userEmail}")
    public ResponseEntity<Map<String, Object>> getNotificationStatus(@PathVariable String userEmail) {
        try {
            boolean enabled = pushNotificationService.isPushNotificationsEnabled(userEmail);
            
            return ResponseEntity.ok(Map.of(
                "userEmail", userEmail,
                "pushNotificationsEnabled", enabled
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error checking notification status: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Send grade alert notification
     * @param request Grade alert request
     * @return Response indicating success or failure
     */
    @PostMapping("/grade-alert")
    public ResponseEntity<String> sendGradeAlert(@RequestBody GradeAlertRequest request) {
        try {
            boolean success = pushNotificationService.sendGradeAlertNotification(
                request.getUserEmail(),
                request.getCourseName(),
                request.getAssessmentName(),
                request.getScore(),
                request.getMaxScore()
            );
            
            if (success) {
                return ResponseEntity.ok("Grade alert notification sent successfully to: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to send grade alert notification");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending grade alert: " + e.getMessage());
        }
    }
    
    /**
     * Send course completion notification
     * @param request Course completion request
     * @return Response indicating success or failure
     */
    @PostMapping("/course-completion")
    public ResponseEntity<String> sendCourseCompletion(@RequestBody CourseCompletionRequest request) {
        try {
            boolean success = pushNotificationService.sendCourseCompletionNotification(
                request.getUserEmail(),
                request.getCourseName(),
                request.getFinalGrade(),
                request.getSemester()
            );
            
            if (success) {
                return ResponseEntity.ok("Course completion notification sent successfully to: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to send course completion notification");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending course completion notification: " + e.getMessage());
        }
    }
    
    /**
     * Send goal achievement notification
     * @param request Goal achievement request
     * @return Response indicating success or failure
     */
    @PostMapping("/goal-achievement")
    public ResponseEntity<String> sendGoalAchievement(@RequestBody GoalAchievementRequest request) {
        try {
            boolean success = pushNotificationService.sendGoalAchievementNotification(
                request.getUserEmail(),
                request.getGoalTitle(),
                request.getGoalType(),
                request.getAchievedValue()
            );
            
            if (success) {
                return ResponseEntity.ok("Goal achievement notification sent successfully to: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to send goal achievement notification");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending goal achievement notification: " + e.getMessage());
        }
    }
    
    /**
     * Send assessment reminder notification
     * @param request Assessment reminder request
     * @return Response indicating success or failure
     */
    @PostMapping("/assessment-reminder")
    public ResponseEntity<String> sendAssessmentReminder(@RequestBody AssessmentReminderRequest request) {
        try {
            boolean success = pushNotificationService.sendAssessmentReminderNotification(
                request.getUserEmail(),
                request.getCourseName(),
                request.getAssessmentName(),
                request.getDueDate()
            );
            
            if (success) {
                return ResponseEntity.ok("Assessment reminder notification sent successfully to: " + request.getUserEmail());
            } else {
                return ResponseEntity.badRequest().body("Failed to send assessment reminder notification");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending assessment reminder notification: " + e.getMessage());
        }
    }
    
    // Request DTOs
    public static class TokenRegistrationRequest {
        private String userEmail;
        private String fcmToken;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getFcmToken() { return fcmToken; }
        public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
    }
    
    public static class NotificationRequest {
        private String userEmail;
        private String title;
        private String body;
        private String data;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
    }
    
    public static class BulkNotificationRequest {
        private List<String> userEmails;
        private String title;
        private String body;
        private String data;
        
        // Getters and setters
        public List<String> getUserEmails() { return userEmails; }
        public void setUserEmails(List<String> userEmails) { this.userEmails = userEmails; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
    }
    
    public static class GradeAlertRequest {
        private String userEmail;
        private String courseName;
        private String assessmentName;
        private double score;
        private double maxScore;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getAssessmentName() { return assessmentName; }
        public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public double getMaxScore() { return maxScore; }
        public void setMaxScore(double maxScore) { this.maxScore = maxScore; }
    }
    
    public static class CourseCompletionRequest {
        private String userEmail;
        private String courseName;
        private String finalGrade;
        private String semester;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getFinalGrade() { return finalGrade; }
        public void setFinalGrade(String finalGrade) { this.finalGrade = finalGrade; }
        public String getSemester() { return semester; }
        public void setSemester(String semester) { this.semester = semester; }
    }
    
    public static class GoalAchievementRequest {
        private String userEmail;
        private String goalTitle;
        private String goalType;
        private String achievedValue;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getGoalTitle() { return goalTitle; }
        public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }
        public String getGoalType() { return goalType; }
        public void setGoalType(String goalType) { this.goalType = goalType; }
        public String getAchievedValue() { return achievedValue; }
        public void setAchievedValue(String achievedValue) { this.achievedValue = achievedValue; }
    }
    
    public static class AssessmentReminderRequest {
        private String userEmail;
        private String courseName;
        private String assessmentName;
        private String dueDate;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getAssessmentName() { return assessmentName; }
        public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    }
}

