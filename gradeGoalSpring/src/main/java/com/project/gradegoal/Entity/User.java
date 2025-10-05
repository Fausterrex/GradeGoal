package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * User Entity
 * 
 * Represents a user in the GradeGoal system.
 * Contains user information including email for notifications.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "username", unique = true, nullable = true)
    private String username;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "role")
    private String role = "USER";
    
    @Column(name = "email_notifications_enabled")
    private Boolean emailNotificationsEnabled;
    
    @Column(name = "push_notifications_enabled")
    private Boolean pushNotificationsEnabled;
    
    @Column(name = "fcm_token", length = 1000)
    private String fcmToken;
    
    @Column(name = "profile_picture_url", columnDefinition = "LONGTEXT")
    private String profilePictureUrl;
    
    @Column(name = "current_year_level")
    private String currentYearLevel = "1";
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    
    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}