package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.CustomEvent;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.CustomEventRepository;
import com.project.gradegoal.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private PushNotificationService pushNotificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CustomEventRepository customEventRepository;
    
    @Value("${notification.overdue.enabled:true}")
    private boolean overdueNotificationsEnabled;
    
    @Value("${notification.upcoming.enabled:true}")
    private boolean upcomingNotificationsEnabled;
    
    @Value("${notification.upcoming.days.before:3}")
    private int upcomingDaysBefore;
    
    @Value("${notification.reminder.days.before:2}")
    private int reminderDaysBefore;
    
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
                // Send notifications to users with either email or push notifications enabled
                if (user.getEmail() != null && !user.getEmail().isEmpty() && 
                    ((user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) ||
                     (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()))) {
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
                    
                    // Send email notification if enabled
                    if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
                        emailNotificationService.sendOverdueNotification(user.getEmail(), overdueAssessments);
                    }
                    
                    // Send push notification if enabled
                    if (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()) {
                        sendOverduePushNotification(user.getEmail(), overdueAssessments);
                    }
                }
            }
            
            // Check for upcoming assessments
            if (upcomingNotificationsEnabled) {
                List<Assessment> upcomingAssessments = getUpcomingAssessments(userAssessments);
                if (!upcomingAssessments.isEmpty()) {
                    logger.info("Sending upcoming notification to: {} ({} assessments)", 
                        user.getEmail(), upcomingAssessments.size());
                    
                    // Send email notification if enabled
                    if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
                        emailNotificationService.sendUpcomingNotification(user.getEmail(), upcomingAssessments);
                    }
                    
                    // Send push notification if enabled
                    if (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()) {
                        sendUpcomingPushNotification(user.getEmail(), upcomingAssessments);
                    }
                }
            }
            
            // Check for 2-day prior assessment reminders
            List<Assessment> reminderAssessments = getReminderAssessments(userAssessments);
            if (!reminderAssessments.isEmpty()) {
                logger.info("Sending 2-day reminder notification to: {} ({} assessments)", 
                    user.getEmail(), reminderAssessments.size());
                
                // Send email notification if enabled
                if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
                    emailNotificationService.sendAssessmentReminderNotification(user.getEmail(), reminderAssessments);
                }
                
                // Send push notification if enabled
                if (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()) {
                    sendAssessmentReminderPushNotification(user.getEmail(), reminderAssessments);
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
    
    /**
     * Send overdue push notification
     * @param userEmail User's email address
     * @param overdueAssessments List of overdue assessments
     */
    private void sendOverduePushNotification(String userEmail, List<Assessment> overdueAssessments) {
        try {
            String title = "⚠️ Overdue Assessments - GradeGoal";
            String body = String.format("You have %d overdue assessment(s) that need attention", overdueAssessments.size());
            
            StringBuilder dataBuilder = new StringBuilder();
            dataBuilder.append("{\"type\":\"overdue_assessments\",\"assessments\":[");
            for (int i = 0; i < overdueAssessments.size(); i++) {
                Assessment assessment = overdueAssessments.get(i);
                dataBuilder.append(String.format("{\"name\":\"%s\",\"course\":\"%s\",\"dueDate\":\"%s\"}", 
                    assessment.getAssessmentName(), 
                    assessment.getCourseName(), 
                    assessment.getDueDate()));
                if (i < overdueAssessments.size() - 1) {
                    dataBuilder.append(",");
                }
            }
            dataBuilder.append("]}");
            
            pushNotificationService.sendNotificationToUser(userEmail, title, body, dataBuilder.toString());
        } catch (Exception e) {
            logger.error("Error sending overdue push notification to user: {}", userEmail, e);
        }
    }
    
    /**
     * Send upcoming push notification
     * @param userEmail User's email address
     * @param upcomingAssessments List of upcoming assessments
     */
    private void sendUpcomingPushNotification(String userEmail, List<Assessment> upcomingAssessments) {
        try {
            String title = "📅 Upcoming Assessments - GradeGoal";
            String body = String.format("You have %d assessment(s) due soon", upcomingAssessments.size());
            
            StringBuilder dataBuilder = new StringBuilder();
            dataBuilder.append("{\"type\":\"upcoming_assessments\",\"assessments\":[");
            for (int i = 0; i < upcomingAssessments.size(); i++) {
                Assessment assessment = upcomingAssessments.get(i);
                dataBuilder.append(String.format("{\"name\":\"%s\",\"course\":\"%s\",\"dueDate\":\"%s\"}", 
                    assessment.getAssessmentName(), 
                    assessment.getCourseName(), 
                    assessment.getDueDate()));
                if (i < upcomingAssessments.size() - 1) {
                    dataBuilder.append(",");
                }
            }
            dataBuilder.append("]}");
            
            pushNotificationService.sendNotificationToUser(userEmail, title, body, dataBuilder.toString());
        } catch (Exception e) {
            logger.error("Error sending upcoming push notification to user: {}", userEmail, e);
        }
    }
    
    /**
     * Get assessments that need 2-day reminders
     * @param assessments List of all assessments
     * @return List of assessments due in 2 days
     */
    private List<Assessment> getReminderAssessments(List<Assessment> assessments) {
        LocalDate today = LocalDate.now();
        LocalDate reminderDate = today.plusDays(reminderDaysBefore);
        
        return assessments.stream()
            .filter(assessment -> assessment.getDueDate() != null)
            .filter(assessment -> assessment.getDueDate().equals(reminderDate))
            .filter(assessment -> assessment.getStatus() != Assessment.AssessmentStatus.COMPLETED)
            .collect(Collectors.toList());
    }
    
    /**
     * Send assessment reminder push notification
     * @param userEmail User's email address
     * @param reminderAssessments List of assessments needing reminders
     */
    private void sendAssessmentReminderPushNotification(String userEmail, List<Assessment> reminderAssessments) {
        try {
            String title = "📚 Study Reminder - GradeGoal";
            String body = String.format("You have %d assessment(s) in 2 days - time to review!", reminderAssessments.size());
            
            StringBuilder dataBuilder = new StringBuilder();
            dataBuilder.append("{\"type\":\"assessment_reminder\",\"assessments\":[");
            for (int i = 0; i < reminderAssessments.size(); i++) {
                Assessment assessment = reminderAssessments.get(i);
                dataBuilder.append(String.format("{\"name\":\"%s\",\"course\":\"%s\",\"dueDate\":\"%s\"}", 
                    assessment.getAssessmentName(), 
                    assessment.getCourseName(), 
                    assessment.getDueDate()));
                if (i < reminderAssessments.size() - 1) {
                    dataBuilder.append(",");
                }
            }
            dataBuilder.append("]}");
            
            pushNotificationService.sendNotificationToUser(userEmail, title, body, dataBuilder.toString());
        } catch (Exception e) {
            logger.error("Error sending assessment reminder push notification to user: {}", userEmail, e);
        }
    }
    
    /**
     * Scheduled method to check for custom event reminders
     * Runs every minute to check for upcoming custom events
     */
    @Scheduled(fixedRate = 60000) // Run every minute (60,000 milliseconds)
    public void checkCustomEventReminders() {
        logger.debug("Checking for custom event reminders...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime checkUntil = now.plusMinutes(5); // Check events in the next 5 minutes
            
            // Get all custom events that need reminders
            List<CustomEvent> upcomingEvents = customEventRepository.findUpcomingEventsForReminder(now, checkUntil);
            
            for (CustomEvent event : upcomingEvents) {
                if (event.getReminderEnabled() && !event.getIsNotified()) {
                    // Calculate minutes until event
                    LocalDateTime eventTime = event.getEventStart();
                    long minutesUntilEvent = java.time.Duration.between(now, eventTime).toMinutes();
                    
                    // Check if it's time to send reminder (based on reminderDays converted to minutes)
                    int reminderMinutes = event.getReminderDays() * 24 * 60; // Convert days to minutes
                    
                    // For events today, use the reminderDays as minutes instead of days
                    if (eventTime.toLocalDate().equals(now.toLocalDate())) {
                        reminderMinutes = event.getReminderDays(); // Use as minutes for same-day events
                    }
                    
                    if (minutesUntilEvent <= reminderMinutes && minutesUntilEvent >= 0) {
                        sendCustomEventReminder(event);
                        
                        // Mark as notified to prevent duplicate notifications
                        event.setIsNotified(true);
                        customEventRepository.save(event);
                        
                        logger.info("Sent reminder for custom event: {} to user: {}", 
                                   event.getEventTitle(), event.getUserId());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error checking custom event reminders", e);
        }
    }
    
    /**
     * Send custom event reminder notifications
     */
    private void sendCustomEventReminder(CustomEvent event) {
        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user == null) {
                logger.warn("User not found for custom event reminder: {}", event.getUserId());
                return;
            }
            
            String title = "Event Reminder: " + event.getEventTitle();
            String message = String.format("Your event '%s' is starting soon at %s. %s", 
                                          event.getEventTitle(),
                                          event.getEventStart().toLocalTime(),
                                          event.getEventDescription() != null ? event.getEventDescription() : "");
            
            // Send email notification if enabled
            if (user.getEmailNotificationsEnabled() && user.getEmail() != null && !user.getEmail().isEmpty()) {
                emailNotificationService.sendCustomEventNotification(user.getEmail(), event.getEventTitle(), event.getEventDescription(), event.getEventStart(), "reminder");
                logger.info("Sent custom event reminder email to: {}", user.getEmail());
            }
            
            // Send push notification if enabled
            if (user.getPushNotificationsEnabled()) {
                String pushData = String.format("{\"type\":\"custom_event_reminder\",\"eventId\":%d,\"eventTitle\":\"%s\"}", 
                                              event.getEventId(), event.getEventTitle());
                pushNotificationService.sendNotificationToUser(user.getEmail(), title, message, pushData);
                logger.info("Sent custom event reminder push notification to: {}", user.getEmail());
            }
            
        } catch (Exception e) {
            logger.error("Error sending custom event reminder for event: {}", event.getEventId(), e);
        }
    }
    
}
