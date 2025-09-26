-- AI Analysis Persistence Schema - Simplified Version
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

-- Add AI prediction columns to existing assessments table (simple approach)
-- Note: Run these one by one to avoid errors if columns already exist

-- Check and add ai_predicted_score column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_predicted_score');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_predicted_score` decimal(10,2) DEFAULT NULL COMMENT ''AI predicted score''',
  'SELECT ''Column ai_predicted_score already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ai_predicted_percentage column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_predicted_percentage');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_predicted_percentage` decimal(10,2) DEFAULT NULL COMMENT ''AI predicted percentage''',
  'SELECT ''Column ai_predicted_percentage already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ai_confidence column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_confidence');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_confidence` enum(''HIGH'',''MEDIUM'',''LOW'') DEFAULT NULL COMMENT ''AI confidence level''',
  'SELECT ''Column ai_confidence already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ai_recommended_score column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_recommended_score');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_recommended_score` decimal(10,2) DEFAULT NULL COMMENT ''AI recommended score to reach target''',
  'SELECT ''Column ai_recommended_score already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ai_analysis_reasoning column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_analysis_reasoning');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_analysis_reasoning` text COMMENT ''AI explanation for prediction''',
  'SELECT ''Column ai_analysis_reasoning already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add ai_analysis_updated_at column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND COLUMN_NAME = 'ai_analysis_updated_at');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `assessments` ADD COLUMN `ai_analysis_updated_at` timestamp NULL DEFAULT NULL COMMENT ''When AI analysis was last updated''',
  'SELECT ''Column ai_analysis_updated_at already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance (with error handling)
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND INDEX_NAME = 'idx_ai_predicted_score');

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX `idx_ai_predicted_score` ON `assessments` (`ai_predicted_score`)',
  'SELECT ''Index idx_ai_predicted_score already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND INDEX_NAME = 'idx_ai_confidence');

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX `idx_ai_confidence` ON `assessments` (`ai_confidence`)',
  'SELECT ''Index idx_ai_confidence already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'assessments' 
  AND INDEX_NAME = 'idx_ai_analysis_updated');

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX `idx_ai_analysis_updated` ON `assessments` (`ai_analysis_updated_at`)',
  'SELECT ''Index idx_ai_analysis_updated already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

COMMIT;
