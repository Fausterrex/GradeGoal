package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "course_id")
    private Long courseId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private NotificationPriority priority = NotificationPriority.MEDIUM;
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "action_data", columnDefinition = "JSON")
    private String actionData;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    public enum NotificationType {
        GRADE_ALERT, GOAL_REMINDER, ACHIEVEMENT, PREDICTION_UPDATE, SYSTEM, ASSIGNMENT_DUE, CUSTOM_EVENT
    }
    
    public enum NotificationPriority {
        HIGH, MEDIUM, LOW
    }
}

