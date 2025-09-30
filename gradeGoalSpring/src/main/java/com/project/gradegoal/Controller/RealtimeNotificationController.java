package com.project.gradegoal.Controller;

import com.project.gradegoal.Service.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Real-time Notification Controller
 * 
 * REST controller for triggering real-time email notifications.
 * These notifications are triggered by user actions in the frontend.
 */
@RestController
@RequestMapping("/api/realtime-notifications")
@CrossOrigin(origins = "*")
public class RealtimeNotificationController {
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    /**
     * Send grade alert notification
     * @param request Grade alert request
     * @return Response indicating success or failure
     */
    @PostMapping("/grade-alert")
    public ResponseEntity<String> sendGradeAlert(@RequestBody GradeAlertRequest request) {
        try {
            emailNotificationService.sendGradeAlertNotification(
                request.getUserEmail(),
                request.getCourseName(),
                request.getAssessmentName(),
                request.getScore(),
                request.getMaxScore()
            );
            return ResponseEntity.ok("Grade alert notification sent successfully to: " + request.getUserEmail());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send grade alert: " + e.getMessage());
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
            emailNotificationService.sendCourseCompletionNotification(
                request.getUserEmail(),
                request.getCourseName(),
                request.getFinalGrade(),
                request.getSemester()
            );
            return ResponseEntity.ok("Course completion notification sent successfully to: " + request.getUserEmail());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send course completion notification: " + e.getMessage());
        }
    }
    
    
    /**
     * Send custom reminder notification
     * @param request Custom reminder request
     * @return Response indicating success or failure
     */
    @PostMapping("/custom-reminder")
    public ResponseEntity<String> sendCustomReminder(@RequestBody CustomReminderRequest request) {
        try {
            emailNotificationService.sendCustomReminderNotification(
                request.getUserEmail(),
                request.getReminderTitle(),
                request.getReminderMessage(),
                request.getReminderType()
            );
            return ResponseEntity.ok("Custom reminder notification sent successfully to: " + request.getUserEmail());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send custom reminder notification: " + e.getMessage());
        }
    }
    
    // Request DTOs
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
    
    
    public static class CustomReminderRequest {
        private String userEmail;
        private String reminderTitle;
        private String reminderMessage;
        private String reminderType;
        
        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        
        public String getReminderTitle() { return reminderTitle; }
        public void setReminderTitle(String reminderTitle) { this.reminderTitle = reminderTitle; }
        
        public String getReminderMessage() { return reminderMessage; }
        public void setReminderMessage(String reminderMessage) { this.reminderMessage = reminderMessage; }
        
        public String getReminderType() { return reminderType; }
        public void setReminderType(String reminderType) { this.reminderType = reminderType; }
    }
}
