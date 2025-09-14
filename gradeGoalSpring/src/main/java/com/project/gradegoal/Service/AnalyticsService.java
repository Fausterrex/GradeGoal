package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.UserAnalytics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnalyticsService {

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    /**
     * Get the latest user analytics for a specific course
     * @param userId User ID
     * @param courseId Course ID
     * @return Latest analytics data
     */
    public Optional<UserAnalytics> getLatestUserAnalytics(Long userId, Long courseId) {
        try {
            List<UserAnalytics> courseAnalytics = userAnalyticsService.getUserAnalyticsByCourse(userId, courseId);
            if (!courseAnalytics.isEmpty()) {
                return Optional.of(courseAnalytics.get(0)); // First item is latest due to ordering
            }
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error fetching latest user analytics: " + e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get all user analytics for a user
     * @param userId User ID
     * @return List of analytics data
     */
    public List<UserAnalytics> getAllUserAnalytics(Long userId) {
        try {
            return userAnalyticsService.getUserAnalytics(userId);
        } catch (Exception e) {
            System.err.println("Error fetching all user analytics: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get the latest overall user analytics (courseId = null)
     * @param userId User ID
     * @return Latest overall analytics data
     */
    public Optional<UserAnalytics> getLatestOverallAnalytics(Long userId) {
        try {
            UserAnalytics latest = userAnalyticsService.getLatestUserAnalytics(userId);
            return Optional.ofNullable(latest);
        } catch (Exception e) {
            System.err.println("Error fetching latest overall analytics: " + e.getMessage());
            return Optional.empty();
        }
    }
}
