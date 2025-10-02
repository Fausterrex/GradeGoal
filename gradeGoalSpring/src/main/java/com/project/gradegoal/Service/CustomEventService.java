package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.CustomEvent;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.Notification;
import com.project.gradegoal.Repository.CustomEventRepository;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomEventService {

    private static final Logger logger = LoggerFactory.getLogger(CustomEventService.class);

    @Autowired
    private CustomEventRepository customEventRepository;

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Create a new custom event
     */
    @Transactional
    public CustomEvent createCustomEvent(CustomEvent customEvent) {
        // Validate user exists
        Optional<User> userOpt = userRepository.findById(customEvent.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + customEvent.getUserId());
        }

        // Set eventDate to eventStart if not provided
        if (customEvent.getEventDate() == null) {
            customEvent.setEventDate(customEvent.getEventStart());
        }

        // Save the custom event
        CustomEvent savedEvent = customEventRepository.save(customEvent);
        logger.info("Created custom event: {} for user: {}", savedEvent.getEventTitle(), savedEvent.getUserId());

        // Send immediate notification about the event creation
        try {
            sendCustomEventNotification(savedEvent, "created");
        } catch (Exception e) {
            logger.error("Failed to send custom event creation notification", e);
        }

        return savedEvent;
    }

    /**
     * Get all custom events for a user
     */
    public List<CustomEvent> getCustomEventsByUserId(Long userId) {
        return customEventRepository.findByUserIdOrderByEventStartAsc(userId);
    }

    /**
     * Get custom events for a user within a date range
     */
    public List<CustomEvent> getCustomEventsByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return customEventRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    /**
     * Get custom event by ID
     */
    public Optional<CustomEvent> getCustomEventById(Long eventId) {
        return customEventRepository.findById(eventId);
    }

    /**
     * Update a custom event
     */
    @Transactional
    public CustomEvent updateCustomEvent(Long eventId, CustomEvent updatedEvent) {
        Optional<CustomEvent> existingEventOpt = customEventRepository.findById(eventId);
        if (existingEventOpt.isEmpty()) {
            throw new RuntimeException("Custom event not found with ID: " + eventId);
        }

        CustomEvent existingEvent = existingEventOpt.get();
        existingEvent.setEventTitle(updatedEvent.getEventTitle());
        existingEvent.setEventDescription(updatedEvent.getEventDescription());
        existingEvent.setEventStart(updatedEvent.getEventStart());
        existingEvent.setEventEnd(updatedEvent.getEventEnd());
        existingEvent.setReminderEnabled(updatedEvent.getReminderEnabled());
        existingEvent.setReminderDays(updatedEvent.getReminderDays());

        return customEventRepository.save(existingEvent);
    }

    /**
     * Delete a custom event
     */
    @Transactional
    public boolean deleteCustomEvent(Long eventId) {
        if (customEventRepository.existsById(eventId)) {
            customEventRepository.deleteById(eventId);
            logger.info("Deleted custom event with ID: {}", eventId);
            return true;
        }
        return false;
    }

    /**
     * Get upcoming events that need reminders
     */
    public List<CustomEvent> getUpcomingEventsForReminder() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderDate = now.plusDays(7); // Check for events in the next 7 days
        return customEventRepository.findUpcomingEventsForReminder(now, reminderDate);
    }

    /**
     * Send notification for custom event
     */
    private void sendCustomEventNotification(CustomEvent customEvent, String action) {
        try {
            Optional<User> userOpt = userRepository.findById(customEvent.getUserId());
            if (userOpt.isEmpty()) {
                logger.warn("User not found for custom event notification: {}", customEvent.getUserId());
                return;
            }

            User user = userOpt.get();
            String title = "Custom Event " + action.substring(0, 1).toUpperCase() + action.substring(1);
            String message = String.format("Your custom event '%s' has been %s successfully.", 
                customEvent.getEventTitle(), action);

            // Send in-app notification
            createInAppNotification(
                customEvent.getUserId(),
                title,
                message,
                "CUSTOM_EVENT",
                "MEDIUM"
            );

            // Send email notification if enabled
            if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
                try {
                    emailNotificationService.sendCustomEventNotification(
                        user.getEmail(),
                        customEvent.getEventTitle(),
                        customEvent.getEventDescription(),
                        customEvent.getEventStart(),
                        action
                    );
                } catch (Exception e) {
                    logger.error("Failed to send email notification for custom event", e);
                }
            }

            // Send push notification if enabled
            if (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()) {
                try {
                    pushNotificationService.sendCustomEventNotification(
                        user.getEmail(),
                        customEvent.getEventTitle(),
                        customEvent.getEventStart(),
                        action
                    );
                } catch (Exception e) {
                    logger.error("Failed to send push notification for custom event", e);
                }
            }

            logger.info("Custom event notification sent successfully for event: {}", customEvent.getEventTitle());
        } catch (Exception e) {
            logger.error("Error sending custom event notification", e);
        }
    }

    /**
     * Mark custom event as notified
     */
    @Transactional
    public void markEventAsNotified(Long eventId) {
        Optional<CustomEvent> eventOpt = customEventRepository.findById(eventId);
        if (eventOpt.isPresent()) {
            CustomEvent event = eventOpt.get();
            event.setIsNotified(true);
            customEventRepository.save(event);
            logger.info("Marked custom event as notified: {}", eventId);
        }
    }

    /**
     * Create in-app notification
     */
    private void createInAppNotification(Long userId, String title, String message, String type, String priority) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setNotificationType(Notification.NotificationType.valueOf(type));
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setPriority(Notification.NotificationPriority.valueOf(priority));
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
            logger.info("In-app notification created for custom event: {}", title);
        } catch (Exception e) {
            logger.error("Failed to create in-app notification for custom event", e);
        }
    }
}
