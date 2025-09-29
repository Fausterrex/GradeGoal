package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.UserActivityLog;
import com.project.gradegoal.Service.UserActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-activity")
@CrossOrigin(origins = "*")
public class UserActivityLogController {

    @Autowired
    private UserActivityLogService userActivityLogService;

    /**
     * Save a new activity log entry
     */
    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@RequestBody ActivityLogRequest request) {
        try {
            UserActivityLog activity = userActivityLogService.saveActivity(
                request.getUserId(),
                request.getActivityType(),
                request.getContext(),
                request.getIpAddress()
            );
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to log activity: " + e.getMessage());
        }
    }

    /**
     * Save multiple activities in batch
     */
    @PostMapping("/log-batch")
    public ResponseEntity<?> logActivities(@RequestBody BatchActivityLogRequest request) {
        try {
            List<UserActivityLog> activities = request.getActivities().stream()
                .map(activityData -> new UserActivityLog(
                    activityData.getUserId(),
                    activityData.getActivityType(),
                    activityData.getContext(),
                    activityData.getIpAddress()
                ))
                .toList();
            
            List<UserActivityLog> savedActivities = userActivityLogService.saveActivities(activities);
            return ResponseEntity.ok(savedActivities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to log activities: " + e.getMessage());
        }
    }

    /**
     * Get all activities for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivities(@PathVariable Long userId) {
        try {
            List<UserActivityLog> activities = userActivityLogService.getUserActivities(userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch user activities: " + e.getMessage());
        }
    }

    /**
     * Get recent activities for a user (last N days)
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<?> getRecentUserActivities(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<UserActivityLog> activities = userActivityLogService.getRecentUserActivities(userId, days);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch recent activities: " + e.getMessage());
        }
    }

    /**
     * Get activities by type for a user
     */
    @GetMapping("/user/{userId}/type/{activityType}")
    public ResponseEntity<?> getUserActivitiesByType(
            @PathVariable Long userId,
            @PathVariable String activityType) {
        try {
            List<UserActivityLog> activities = userActivityLogService.getUserActivitiesByType(userId, activityType);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch activities by type: " + e.getMessage());
        }
    }

    /**
     * Get activity statistics for a user
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserActivityStats(@PathVariable Long userId) {
        try {
            Map<String, Long> stats = Map.of(
                "grade_entry", userActivityLogService.countUserActivitiesByType(userId, "grade_entry"),
                "goal_achievement", userActivityLogService.countUserActivitiesByType(userId, "goal_achievement"),
                "goal_created", userActivityLogService.countUserActivitiesByType(userId, "goal_created"),
                "notification", userActivityLogService.countUserActivitiesByType(userId, "notification"),
                "ai_analysis", userActivityLogService.countUserActivitiesByType(userId, "ai_analysis")
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch activity stats: " + e.getMessage());
        }
    }

    // Request DTOs
    public static class ActivityLogRequest {
        private Long userId;
        private String activityType;
        private String context;
        private String ipAddress;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    }

    public static class BatchActivityLogRequest {
        private List<ActivityLogRequest> activities;

        public List<ActivityLogRequest> getActivities() { return activities; }
        public void setActivities(List<ActivityLogRequest> activities) { this.activities = activities; }
    }
}
