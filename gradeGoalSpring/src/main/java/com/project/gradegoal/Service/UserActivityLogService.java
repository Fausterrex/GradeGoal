package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.UserActivityLog;
import com.project.gradegoal.Repository.UserActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserActivityLogService {

    @Autowired
    private UserActivityLogRepository userActivityLogRepository;

    /**
     * Save a new activity log entry
     */
    public UserActivityLog saveActivity(Long userId, String activityType, String context) {
        UserActivityLog activity = new UserActivityLog(userId, activityType, context);
        return userActivityLogRepository.save(activity);
    }

    /**
     * Save a new activity log entry with IP address
     */
    public UserActivityLog saveActivity(Long userId, String activityType, String context, String ipAddress) {
        UserActivityLog activity = new UserActivityLog(userId, activityType, context, ipAddress);
        return userActivityLogRepository.save(activity);
    }

    /**
     * Get all activities for a user
     */
    public List<UserActivityLog> getUserActivities(Long userId) {
        return userActivityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get activities for a user within a date range
     */
    public List<UserActivityLog> getUserActivitiesByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return userActivityLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    /**
     * Get recent activities for a user (last N days)
     */
    public List<UserActivityLog> getRecentUserActivities(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userActivityLogRepository.findRecentActivitiesByUserId(userId, since);
    }

    /**
     * Get activities by type for a user
     */
    public List<UserActivityLog> getUserActivitiesByType(Long userId, String activityType) {
        return userActivityLogRepository.findByUserIdAndActivityTypeOrderByCreatedAtDesc(userId, activityType);
    }

    /**
     * Count activities by type for a user
     */
    public Long countUserActivitiesByType(Long userId, String activityType) {
        return userActivityLogRepository.countByUserIdAndActivityType(userId, activityType);
    }

    /**
     * Save multiple activities in batch
     */
    public List<UserActivityLog> saveActivities(List<UserActivityLog> activities) {
        return userActivityLogRepository.saveAll(activities);
    }
}
