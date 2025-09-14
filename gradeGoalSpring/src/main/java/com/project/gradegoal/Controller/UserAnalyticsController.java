package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.UserAnalytics;
import com.project.gradegoal.Service.UserAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/user-analytics")
@CrossOrigin(origins = "*")
public class UserAnalyticsController {
    
    @Autowired
    private UserAnalyticsService userAnalyticsService;
    
    /**
     * Create new user analytics record
     * POST /api/user-analytics
     * @param analyticsData the analytics data
     * @return Created UserAnalytics entity
     */
    @PostMapping
    public ResponseEntity<UserAnalytics> createUserAnalytics(@RequestBody UserAnalytics analyticsData) {
        try {
            UserAnalytics createdAnalytics = userAnalyticsService.createUserAnalytics(analyticsData);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAnalytics);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all user analytics by user ID
     * GET /api/user-analytics/user/{userId}
     * @param userId the user ID
     * @return List of UserAnalytics entities
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAnalytics>> getUserAnalytics(@PathVariable Long userId) {
        try {
            List<UserAnalytics> analytics = userAnalyticsService.getUserAnalytics(userId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get latest user analytics by user ID
     * GET /api/user-analytics/user/{userId}/latest
     * @param userId the user ID
     * @return Latest UserAnalytics entity
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<UserAnalytics> getLatestUserAnalytics(@PathVariable Long userId) {
        try {
            UserAnalytics analytics = userAnalyticsService.getLatestUserAnalytics(userId);
            if (analytics != null) {
                return ResponseEntity.ok(analytics);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get user analytics by user ID and course ID
     * GET /api/user-analytics/user/{userId}/course/{courseId}
     * @param userId the user ID
     * @param courseId the course ID
     * @return List of UserAnalytics entities
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<UserAnalytics>> getUserAnalyticsByCourse(
            @PathVariable Long userId, 
            @PathVariable Long courseId) {
        try {
            List<UserAnalytics> analytics = userAnalyticsService.getUserAnalyticsByCourse(userId, courseId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get user analytics by user ID and date
     * GET /api/user-analytics/user/{userId}/date/{date}
     * @param userId the user ID
     * @param date the analytics date (YYYY-MM-DD format)
     * @return List of UserAnalytics entities
     */
    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<List<UserAnalytics>> getUserAnalyticsByDate(
            @PathVariable Long userId, 
            @PathVariable String date) {
        try {
            LocalDate analyticsDate = LocalDate.parse(date);
            List<UserAnalytics> analytics = userAnalyticsService.getUserAnalyticsByDate(userId, analyticsDate);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get user analytics by user ID, course ID, and date
     * GET /api/user-analytics/user/{userId}/course/{courseId}/date/{date}
     * @param userId the user ID
     * @param courseId the course ID
     * @param date the analytics date (YYYY-MM-DD format)
     * @return UserAnalytics entity
     */
    @GetMapping("/user/{userId}/course/{courseId}/date/{date}")
    public ResponseEntity<UserAnalytics> getUserAnalyticsByUserCourseAndDate(
            @PathVariable Long userId, 
            @PathVariable Long courseId, 
            @PathVariable String date) {
        try {
            LocalDate analyticsDate = LocalDate.parse(date);
            UserAnalytics analytics = userAnalyticsService.getUserAnalyticsByUserCourseAndDate(userId, courseId, analyticsDate);
            if (analytics != null) {
                return ResponseEntity.ok(analytics);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update user analytics
     * PUT /api/user-analytics/{analyticsId}
     * @param analyticsId the analytics ID
     * @param analyticsData the updated analytics data
     * @return Updated UserAnalytics entity
     */
    @PutMapping("/{analyticsId}")
    public ResponseEntity<UserAnalytics> updateUserAnalytics(
            @PathVariable Long analyticsId, 
            @RequestBody UserAnalytics analyticsData) {
        try {
            UserAnalytics updatedAnalytics = userAnalyticsService.updateUserAnalytics(analyticsId, analyticsData);
            return ResponseEntity.ok(updatedAnalytics);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete user analytics
     * DELETE /api/user-analytics/{analyticsId}
     * @param analyticsId the analytics ID
     * @return No content response
     */
    @DeleteMapping("/{analyticsId}")
    public ResponseEntity<Void> deleteUserAnalytics(@PathVariable Long analyticsId) {
        try {
            userAnalyticsService.deleteUserAnalytics(analyticsId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all analytics for a specific course
     * GET /api/user-analytics/course/{courseId}
     * @param courseId the course ID
     * @return List of UserAnalytics entities
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<UserAnalytics>> getCourseAnalytics(@PathVariable Long courseId) {
        try {
            List<UserAnalytics> analytics = userAnalyticsService.getCourseAnalytics(courseId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
