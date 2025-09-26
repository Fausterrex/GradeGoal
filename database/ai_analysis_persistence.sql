-- AI Analysis Persistence Schema
-- This script creates tables to store AI analysis results persistently

-- Table to store AI analysis results for courses
CREATE TABLE IF NOT EXISTS `ai_analysis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `analysis_type` enum('COURSE_ANALYSIS','ASSESSMENT_PREDICTION','GOAL_PROBABILITY') NOT NULL DEFAULT 'COURSE_ANALYSIS',
  `analysis_data` json NOT NULL COMMENT 'Complete AI analysis results',
  `ai_model` varchar(100) DEFAULT 'gemini-2.0-flash-exp',
  `ai_confidence` decimal(10,2) DEFAULT 0.85,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When this analysis expires (for cache invalidation)',
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_user_course` (`user_id`, `course_id`),
  KEY `idx_analysis_type` (`analysis_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store AI predictions for individual assessments
CREATE TABLE IF NOT EXISTS `ai_assessment_predictions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `assessment_id` bigint NOT NULL,
  `predicted_score` decimal(10,2) DEFAULT NULL COMMENT 'AI predicted score',
  `predicted_percentage` decimal(10,2) DEFAULT NULL COMMENT 'AI predicted percentage',
  `predicted_gpa` decimal(10,2) DEFAULT NULL COMMENT 'AI predicted GPA',
  `confidence_level` enum('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  `recommended_score` decimal(10,2) DEFAULT NULL COMMENT 'AI recommended score to reach target',
  `recommended_percentage` decimal(10,2) DEFAULT NULL COMMENT 'AI recommended percentage',
  `analysis_reasoning` text COMMENT 'AI explanation for the prediction',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assessment_prediction` (`assessment_id`, `user_id`),
  KEY `idx_user_course` (`user_id`, `course_id`),
  KEY `idx_assessment` (`assessment_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add AI prediction columns to existing assessments table (with error handling)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_predicted_score') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_predicted_score` decimal(10,2) DEFAULT NULL COMMENT ''AI predicted score''',
    'SELECT ''Column ai_predicted_score already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_predicted_percentage') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_predicted_percentage` decimal(10,2) DEFAULT NULL COMMENT ''AI predicted percentage''',
    'SELECT ''Column ai_predicted_percentage already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_confidence') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_confidence` enum(''HIGH'',''MEDIUM'',''LOW'') DEFAULT NULL COMMENT ''AI confidence level''',
    'SELECT ''Column ai_confidence already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_recommended_score') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_recommended_score` decimal(10,2) DEFAULT NULL COMMENT ''AI recommended score to reach target''',
    'SELECT ''Column ai_recommended_score already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_analysis_reasoning') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_analysis_reasoning` text COMMENT ''AI explanation for prediction''',
    'SELECT ''Column ai_analysis_reasoning already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'assessments' 
     AND COLUMN_NAME = 'ai_analysis_updated_at') = 0,
    'ALTER TABLE `assessments` ADD COLUMN `ai_analysis_updated_at` timestamp NULL DEFAULT NULL COMMENT ''When AI analysis was last updated''',
    'SELECT ''Column ai_analysis_updated_at already exists'' as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_ai_predicted_score` ON `assessments` (`ai_predicted_score`);
CREATE INDEX IF NOT EXISTS `idx_ai_confidence` ON `assessments` (`ai_confidence`);
CREATE INDEX IF NOT EXISTS `idx_ai_analysis_updated` ON `assessments` (`ai_analysis_updated_at`);

-- Procedure to clean up expired AI analysis
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `CleanupExpiredAIAnalysis`()
BEGIN
  -- Delete expired AI analysis
  DELETE FROM `ai_analysis` 
  WHERE `expires_at` IS NOT NULL 
    AND `expires_at` < NOW() 
    AND `is_active` = 1;
    
  -- Delete expired assessment predictions
  DELETE FROM `ai_assessment_predictions` 
  WHERE `expires_at` IS NOT NULL 
    AND `expires_at` < NOW() 
    AND `is_active` = 1;
    
  -- Update assessment AI columns to NULL for expired predictions
  UPDATE `assessments` a
  LEFT JOIN `ai_assessment_predictions` ap ON a.id = ap.assessment_id
  SET 
    a.ai_predicted_score = NULL,
    a.ai_predicted_percentage = NULL,
    a.ai_confidence = NULL,
    a.ai_recommended_score = NULL,
    a.ai_analysis_reasoning = NULL,
    a.ai_analysis_updated_at = NULL
  WHERE ap.id IS NULL 
    OR (ap.expires_at IS NOT NULL AND ap.expires_at < NOW())
    OR ap.is_active = 0;
END //
DELIMITER ;

-- Create event to run cleanup daily (optional - requires event scheduler to be enabled)
-- CREATE EVENT IF NOT EXISTS `daily_ai_cleanup`
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupExpiredAIAnalysis();

-- Insert sample data structure for testing
INSERT IGNORE INTO `ai_analysis` (
  `user_id`, 
  `course_id`, 
  `analysis_type`, 
  `analysis_data`,
  `ai_model`,
  `ai_confidence`,
  `expires_at`
) VALUES (
  1, 
  9, 
  'COURSE_ANALYSIS', 
  '{"focusIndicators":{"assignments":{"needsAttention":false,"reason":"Excellent performance","priority":"LOW"},"quizzes":{"needsAttention":true,"reason":"Low average score","priority":"HIGH"},"exams":{"needsAttention":true,"reason":"No grades yet","priority":"HIGH"}},"scorePredictions":{"assignments":{"neededScore":"95%","confidence":"HIGH"},"quizzes":{"neededScore":"90%","confidence":"MEDIUM"},"exams":{"neededScore":"85%","confidence":"MEDIUM"}},"achievementProbability":{"probability":"45%","factors":["Current GPA: 3.70","Target GPA: 4.00","Gap: 0.30"],"confidence":"MEDIUM"},"recommendations":{"assignments":"Maintain current high performance","quizzes":"Focus on consistent performance","exams":"Prepare thoroughly for upcoming exams"},"studyStrategy":{"focus":"Exam preparation","schedule":"3-4 hours daily","tips":["Active recall","Practice problems","Regular review"]}}',
  'gemini-2.0-flash-exp',
  0.85,
  DATE_ADD(NOW(), INTERVAL 1 HOUR)
);

COMMIT;
