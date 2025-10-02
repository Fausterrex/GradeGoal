-- Create calendar_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS `calendar_events` (
    `event_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `assessment_id` BIGINT DEFAULT NULL,
    `event_title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `event_start` DATETIME NOT NULL,
    `event_end` DATETIME NOT NULL,
    `event_date` DATETIME NOT NULL,
    `event_type` VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    `reminder_enabled` BIT(1) DEFAULT 0,
    `reminder_days` INT DEFAULT 0,
    `is_notified` BIT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`event_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`assessment_id`) ON DELETE CASCADE
);
