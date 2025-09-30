package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Notification Scheduler Service
 * 
 * Service class for scheduling and managing email notifications for assessments.
 * Runs daily to check for overdue and upcoming assessments and send notifications.
 */
@Service
public class NotificationSchedulerService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationSchedulerService.class);
    
    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${notification.overdue.enabled:true}")
    private boolean overdueNotificationsEnabled;
    
    @Value("${notification.upcoming.enabled:true}")
    private boolean upcomingNotificationsEnabled;
    
    @Value("${notification.upcoming.days.before:3}")
    private int upcomingDaysBefore;
    
    /**
     * Scheduled method to check and send notifications daily at 9 AM
     */
    @Scheduled(cron = "${notification.schedule.cron:0 0 9 * * ?}")
    public void checkAndSendNotifications() {
        logger.info("Starting daily notification check...");
        
        try {
            // Get all users who should receive notifications
            List<User> users = userRepository.findAll();
            
            for (User user : users) {
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    sendNotificationsForUser(user);
                }
            }
            
            logger.info("Daily notification check completed successfully");
            
        } catch (Exception e) {
            logger.error("Error during daily notification check", e);
        }
    }
    
    /**
     * Send notifications for a specific user
     * @param user User to send notifications to
     */
    private void sendNotificationsForUser(User user) {
        try {
            // Get user's assessments
            List<Assessment> userAssessments = assessmentService.getAllAssessmentsWithCourseInfo()
                .stream()
                .filter(assessment -> assessment.getCourseName() != null) // Only assessments with course info
                .collect(Collectors.toList());
            
            if (userAssessments.isEmpty()) {
                logger.debug("No assessments found for user: {}", user.getEmail());
                return;
            }
            
            // Check for overdue assessments
            if (overdueNotificationsEnabled) {
                List<Assessment> overdueAssessments = getOverdueAssessments(userAssessments);
                if (!overdueAssessments.isEmpty()) {
                    logger.info("Sending overdue notification to: {} ({} assessments)", 
                        user.getEmail(), overdueAssessments.size());
                    emailNotificationService.sendOverdueNotification(user.getEmail(), overdueAssessments);
                }
            }
            
            // Check for upcoming assessments
            if (upcomingNotificationsEnabled) {
                List<Assessment> upcomingAssessments = getUpcomingAssessments(userAssessments);
                if (!upcomingAssessments.isEmpty()) {
                    logger.info("Sending upcoming notification to: {} ({} assessments)", 
                        user.getEmail(), upcomingAssessments.size());
                    emailNotificationService.sendUpcomingNotification(user.getEmail(), upcomingAssessments);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error sending notifications for user: {}", user.getEmail(), e);
        }
    }
    
    /**
     * Get overdue assessments for a user
     * @param assessments List of user's assessments
     * @return List of overdue assessments
     */
    private List<Assessment> getOverdueAssessments(List<Assessment> assessments) {
        LocalDate today = LocalDate.now();
        
        return assessments.stream()
            .filter(assessment -> assessment.getDueDate() != null)
            .filter(assessment -> assessment.getDueDate().isBefore(today))
            .filter(assessment -> assessment.getStatus() != Assessment.AssessmentStatus.COMPLETED)
            .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming assessments for a user
     * @param assessments List of user's assessments
     * @return List of upcoming assessments
     */
    private List<Assessment> getUpcomingAssessments(List<Assessment> assessments) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(upcomingDaysBefore);
        
        return assessments.stream()
            .filter(assessment -> assessment.getDueDate() != null)
            .filter(assessment -> assessment.getDueDate().isAfter(today))
            .filter(assessment -> assessment.getDueDate().isBefore(futureDate) || 
                    assessment.getDueDate().isEqual(futureDate))
            .filter(assessment -> assessment.getStatus() != Assessment.AssessmentStatus.COMPLETED)
            .collect(Collectors.toList());
    }
    
}
