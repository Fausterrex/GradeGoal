package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.UserAnalytics;
import com.project.gradegoal.Service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get user analytics for a specific course or overall
     * @param userId User ID
     * @param courseId Course ID (optional)
     * @return User analytics data
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAnalytics(
            @PathVariable Long userId,
            @RequestParam(required = false) Long courseId) {
        try {
            if (courseId != null) {
                // Get course-specific analytics
                Optional<UserAnalytics> analytics = analyticsService.getLatestUserAnalytics(userId, courseId);
                if (analytics.isPresent()) {
                    return ResponseEntity.ok(analytics.get());
                } else {
                    return ResponseEntity.ok(createDefaultAnalytics(userId, courseId));
                }
            } else {
                // Get overall user analytics
                List<UserAnalytics> analytics = analyticsService.getAllUserAnalytics(userId);
                return ResponseEntity.ok(analytics);
            }
        } catch (Exception e) {
            System.err.println("Error fetching user analytics: " + e.getMessage());
            return ResponseEntity.ok(createDefaultAnalytics(userId, courseId));
        }
    }

    /**
     * Get grade trend for a specific course
     * @param userId User ID
     * @param courseId Course ID
     * @return Grade trend value
     */
    @GetMapping("/user/{userId}/trend")
    public ResponseEntity<?> getGradeTrend(
            @PathVariable Long userId,
            @RequestParam Long courseId) {
        try {
            Optional<UserAnalytics> analytics = analyticsService.getLatestUserAnalytics(userId, courseId);
            if (analytics.isPresent()) {
                return ResponseEntity.ok(analytics.get().getGradeTrend());
            } else {
                return ResponseEntity.ok(0.0);
            }
        } catch (Exception e) {
            System.err.println("Error fetching grade trend: " + e.getMessage());
            return ResponseEntity.ok(0.0);
        }
    }

    /**
     * Create default analytics when none exist
     */
    private UserAnalytics createDefaultAnalytics(Long userId, Long courseId) {
        UserAnalytics analytics = new UserAnalytics();
        analytics.setUserId(userId);
        analytics.setCourseId(courseId);
        analytics.setCurrentGrade(BigDecimal.ZERO);
        analytics.setGradeTrend(BigDecimal.ZERO);
        analytics.setAssignmentsCompleted(0);
        analytics.setAssignmentsPending(0);
        analytics.setStudyHoursLogged(BigDecimal.ZERO);
        return analytics;
    }
}
