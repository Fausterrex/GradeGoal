package com.project.gradegoal.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.gradegoal.Entity.Achievement;
import com.project.gradegoal.Entity.Notification;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.NotificationRepository;
import com.project.gradegoal.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Send achievement notification based on rarity
     * - All rarities: In-app notification (notification bell)
     * - LEGENDARY: In-app + Email + Push notification
     */
    @Transactional
    public void sendAchievementNotification(Long userId, Achievement achievement) {
        logger.info("Sending achievement notification for '{}' to user {}", 
            achievement.getAchievementName(), userId);
        
        // Always create in-app notification
        createInAppNotification(userId, achievement);
        
        // If LEGENDARY, also send email and push notifications
        if (Achievement.AchievementRarity.LEGENDARY.equals(achievement.getRarity())) {
            sendLegendaryNotifications(userId, achievement);
        }
    }
    
    /**
     * Create in-app notification (visible in notification bell)
     */
    private void createInAppNotification(Long userId, Achievement achievement) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setNotificationType(Notification.NotificationType.ACHIEVEMENT);
            notification.setTitle("🎉 Achievement Unlocked!");
            notification.setMessage(String.format("You earned '%s' - %s", 
                achievement.getAchievementName(), 
                achievement.getDescription()));
            notification.setPriority(mapRarityToPriority(achievement.getRarity()));
            notification.setIsRead(false);
            
            // Add achievement data as JSON
            Map<String, Object> actionData = new HashMap<>();
            actionData.put("achievementId", achievement.getAchievementId());
            actionData.put("achievementName", achievement.getAchievementName());
            actionData.put("rarity", achievement.getRarity().toString());
            actionData.put("points", achievement.getPointsValue());
            actionData.put("category", achievement.getCategory().toString());
            
            notification.setActionData(objectMapper.writeValueAsString(actionData));
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);
            logger.info("In-app notification created for user {}", userId);
            
        } catch (Exception e) {
            logger.error("Error creating in-app notification", e);
        }
    }
    
    /**
     * Send email and push notifications for LEGENDARY achievements
     */
    private void sendLegendaryNotifications(Long userId, Achievement achievement) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            logger.warn("User not found for legendary notification: {}", userId);
            return;
        }
        
        User user = userOpt.get();
        String userEmail = user.getEmail();
        
        // Send email notification if enabled
        if (user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled()) {
            sendLegendaryEmail(userEmail, user.getFirstName(), achievement);
        }
        
        // Send push notification if enabled
        if (user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled()) {
            sendLegendaryPushNotification(userEmail, achievement);
        }
    }
    
    /**
     * Send legendary achievement email
     */
    private void sendLegendaryEmail(String userEmail, String firstName, Achievement achievement) {
        try {
            String subject = "🏆 LEGENDARY Achievement Unlocked!";
            String body = buildLegendaryEmailBody(firstName, achievement);
            
            emailNotificationService.sendEmail(userEmail, subject, body);
            logger.info("Legendary achievement email sent to {}", userEmail);
            
        } catch (Exception e) {
            logger.error("Error sending legendary achievement email", e);
        }
    }
    
    /**
     * Send legendary achievement push notification
     */
    private void sendLegendaryPushNotification(String userEmail, Achievement achievement) {
        try {
            String title = "🏆 LEGENDARY Achievement!";
            String body = String.format("You unlocked '%s'! +%d points", 
                achievement.getAchievementName(), 
                achievement.getPointsValue());
            
            pushNotificationService.sendAchievementNotification(userEmail, 
                achievement.getAchievementName(), 
                achievement.getDescription(), 
                achievement.getPointsValue());
            
            logger.info("Legendary achievement push notification sent to {}", userEmail);
            
        } catch (Exception e) {
            logger.error("Error sending legendary achievement push notification", e);
        }
    }
    
    /**
     * Build HTML email body for legendary achievement
     */
    private String buildLegendaryEmailBody(String firstName, Achievement achievement) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { background-color: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { text-align: center; color: #FFD700; font-size: 48px; margin-bottom: 20px; }
                    .achievement-title { color: #8168C5; font-size: 32px; text-align: center; margin: 20px 0; }
                    .badge { background: linear-gradient(135deg, #FFD700, #FFA500); color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; }
                    .description { color: #555; font-size: 18px; text-align: center; margin: 20px 0; }
                    .points { background-color: #8168C5; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; margin: 20px 0; }
                    .footer { text-align: center; color: #888; margin-top: 30px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">🏆</div>
                    <h1 style="text-align: center; color: #333;">Congratulations, %s!</h1>
                    <div class="achievement-title">%s</div>
                    <div style="text-align: center; margin: 20px 0;">
                        <span class="badge">LEGENDARY</span>
                    </div>
                    <div class="description">%s</div>
                    <div class="points">+%d Points Earned!</div>
                    <div class="footer">
                        <p>This is a rare achievement! Keep up the excellent work!</p>
                        <p>Continue your journey in GradeGoal to unlock more achievements.</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            firstName != null ? firstName : "Student",
            achievement.getAchievementName(),
            achievement.getDescription(),
            achievement.getPointsValue()
        );
    }
    
    /**
     * Map achievement rarity to notification priority
     */
    private Notification.NotificationPriority mapRarityToPriority(Achievement.AchievementRarity rarity) {
        return switch (rarity) {
            case LEGENDARY, EPIC -> Notification.NotificationPriority.HIGH;
            case RARE -> Notification.NotificationPriority.MEDIUM;
            default -> Notification.NotificationPriority.LOW;
        };
    }
    
    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }
    
    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        notificationOpt.ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unreadNotifications);
    }
    
    /**
     * Get unread notification count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
}

