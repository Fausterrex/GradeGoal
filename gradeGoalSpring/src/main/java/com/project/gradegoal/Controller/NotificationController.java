package com.project.gradegoal.Controller;

import com.project.gradegoal.Service.NotificationSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Notification Controller
 * 
 * REST controller for managing email notifications.
 * Provides endpoints for manual triggering of scheduled notifications.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationSchedulerService notificationSchedulerService;
    
    /**
     * Trigger manual notification check
     * @return Response indicating success or failure
     */
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerNotificationCheck() {
        try {
            notificationSchedulerService.checkAndSendNotifications();
            return ResponseEntity.ok("Notification check triggered successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to trigger notification check: " + e.getMessage());
        }
    }
}
