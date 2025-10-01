package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Achievement;
import com.project.gradegoal.Entity.Notification;
import com.project.gradegoal.Service.AchievementService;
import com.project.gradegoal.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementController {
    
    @Autowired
    private AchievementService achievementService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Check and award achievements for a user
     * Typically called after user actions (grade entry, goal achievement, etc.)
     */
    @PostMapping("/check/{userId}")
    public ResponseEntity<?> checkAchievements(@PathVariable Long userId) {
        try {
            List<Achievement> newlyUnlocked = achievementService.checkAndAwardAchievements(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("newlyUnlocked", newlyUnlocked);
            response.put("count", newlyUnlocked.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get all achievements for a user (earned)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAchievements(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> achievements = achievementService.getUserAchievements(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get all achievements with progress (locked and unlocked)
     */
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<?> getAllAchievementsWithProgress(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> achievements = achievementService.getAllAchievementsWithProgress(userId);
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get notifications for a user
     */
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<?> getNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get unread notifications for a user
     */
    @GetMapping("/notifications/{userId}/unread")
    public ResponseEntity<?> getUnreadNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/notifications/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Mark notification as read
     */
    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/notifications/{userId}/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}

