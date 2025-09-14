package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.UserAnalytics;
import com.project.gradegoal.Repository.UserAnalyticsRepository;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserAnalyticsService {
    
    @Autowired
    private UserAnalyticsRepository userAnalyticsRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    /**
     * Create new user analytics record
     * @param analyticsData the analytics data
     * @return Created UserAnalytics entity
     * @throws RuntimeException if user not found
     */
    public UserAnalytics createUserAnalytics(UserAnalytics analyticsData) {
        // Check if user exists
        if (!userRepository.existsById(analyticsData.getUserId())) {
            throw new RuntimeException("User not found with ID: " + analyticsData.getUserId());
        }
        
        // Check if course exists (if courseId is provided)
        if (analyticsData.getCourseId() != null && !courseRepository.existsById(analyticsData.getCourseId())) {
            throw new RuntimeException("Course not found with ID: " + analyticsData.getCourseId());
        }
        
        // Set default values if not provided
        if (analyticsData.getAnalyticsDate() == null) {
            analyticsData.setAnalyticsDate(LocalDate.now());
        }
        
        if (analyticsData.getGradeTrend() == null) {
            analyticsData.setGradeTrend(BigDecimal.ZERO);
        }
        
        if (analyticsData.getAssignmentsCompleted() == null) {
            analyticsData.setAssignmentsCompleted(0);
        }
        
        if (analyticsData.getAssignmentsPending() == null) {
            analyticsData.setAssignmentsPending(0);
        }
        
        if (analyticsData.getStudyHoursLogged() == null) {
            analyticsData.setStudyHoursLogged(BigDecimal.ZERO);
        }
        
        return userAnalyticsRepository.save(analyticsData);
    }
    
    /**
     * Get user analytics by user ID
     * @param userId the user ID
     * @return List of UserAnalytics entities
     */
    public List<UserAnalytics> getUserAnalytics(Long userId) {
        return userAnalyticsRepository.findByUserId(userId);
    }
    
    /**
     * Get latest user analytics by user ID
     * @param userId the user ID
     * @return Latest UserAnalytics entity or null if not found
     */
    public UserAnalytics getLatestUserAnalytics(Long userId) {
        return userAnalyticsRepository.findLatestByUserId(userId);
    }
    
    /**
     * Get user analytics by user ID and course ID
     * @param userId the user ID
     * @param courseId the course ID
     * @return List of UserAnalytics entities
     */
    public List<UserAnalytics> getUserAnalyticsByCourse(Long userId, Long courseId) {
        return userAnalyticsRepository.findByUserIdAndCourseId(userId, courseId);
    }
    
    /**
     * Get user analytics for a specific date
     * @param userId the user ID
     * @param analyticsDate the analytics date
     * @return List of UserAnalytics entities
     */
    public List<UserAnalytics> getUserAnalyticsByDate(Long userId, LocalDate analyticsDate) {
        return userAnalyticsRepository.findByUserIdAndAnalyticsDate(userId, analyticsDate);
    }
    
    /**
     * Get user analytics for a specific user, course, and date
     * @param userId the user ID
     * @param courseId the course ID
     * @param analyticsDate the analytics date
     * @return UserAnalytics entity or null if not found
     */
    public UserAnalytics getUserAnalyticsByUserCourseAndDate(Long userId, Long courseId, LocalDate analyticsDate) {
        return userAnalyticsRepository.findByUserIdAndCourseIdAndAnalyticsDate(userId, courseId, analyticsDate);
    }
    
    /**
     * Update existing user analytics
     * @param analyticsId the analytics ID
     * @param analyticsData the updated analytics data
     * @return Updated UserAnalytics entity
     * @throws RuntimeException if analytics not found
     */
    public UserAnalytics updateUserAnalytics(Long analyticsId, UserAnalytics analyticsData) {
        Optional<UserAnalytics> existingAnalytics = userAnalyticsRepository.findById(analyticsId);
        
        if (existingAnalytics.isPresent()) {
            UserAnalytics analytics = existingAnalytics.get();
            analytics.setCurrentGrade(analyticsData.getCurrentGrade());
            analytics.setGradeTrend(analyticsData.getGradeTrend());
            analytics.setAssignmentsCompleted(analyticsData.getAssignmentsCompleted());
            analytics.setAssignmentsPending(analyticsData.getAssignmentsPending());
            analytics.setStudyHoursLogged(analyticsData.getStudyHoursLogged());
            analytics.setPerformanceMetrics(analyticsData.getPerformanceMetrics());
            
            return userAnalyticsRepository.save(analytics);
        } else {
            throw new RuntimeException("UserAnalytics not found with ID: " + analyticsId);
        }
    }
    
    /**
     * Delete user analytics
     * @param analyticsId the analytics ID
     * @throws RuntimeException if analytics not found
     */
    public void deleteUserAnalytics(Long analyticsId) {
        if (userAnalyticsRepository.existsById(analyticsId)) {
            userAnalyticsRepository.deleteById(analyticsId);
        } else {
            throw new RuntimeException("UserAnalytics not found with ID: " + analyticsId);
        }
    }
    
    /**
     * Get all analytics for a specific course
     * @param courseId the course ID
     * @return List of UserAnalytics entities
     */
    public List<UserAnalytics> getCourseAnalytics(Long courseId) {
        return userAnalyticsRepository.findByCourseId(courseId);
    }
    
    /**
     * Check if analytics exists for user, course, and date
     * @param userId the user ID
     * @param courseId the course ID
     * @param analyticsDate the analytics date
     * @return true if exists, false otherwise
     */
    public boolean existsAnalytics(Long userId, Long courseId, LocalDate analyticsDate) {
        return userAnalyticsRepository.findByUserIdAndCourseIdAndAnalyticsDate(userId, courseId, analyticsDate) != null;
    }
}
