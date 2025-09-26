-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: gradegoal
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_goals`
--

DROP TABLE IF EXISTS `academic_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_goals` (
  `achieved_date` date DEFAULT NULL,
  `is_achieved` bit(1) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `target_value` decimal(5,2) NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `goal_id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `goal_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal_type` enum('COURSE_GRADE','CUMMULATIVE_GPA','SEMESTER_GPA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('HIGH','LOW','MEDIUM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` enum('FIRST','SECOND','THIRD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `FKdtcq2dk59cvthkf4whgwy2aa8` (`course_id`),
  KEY `FKmhnd6knfsmobeir1nu2fwt9o0` (`user_id`),
  CONSTRAINT `FKdtcq2dk59cvthkf4whgwy2aa8` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `FKmhnd6knfsmobeir1nu2fwt9o0` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_goals`
--

LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0','2025-09-19',100.00,9,'2025-09-25 05:51:52.378962',1,'2025-09-25 05:51:52.378962',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,100.00,5,'2025-09-25 07:50:44.863607',2,'2025-09-25 07:50:44.863607',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL);
/*!40000 ALTER TABLE `academic_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `achievement_id` int NOT NULL AUTO_INCREMENT,
  `achievement_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `category` enum('ACADEMIC','CONSISTENCY','IMPROVEMENT','GOAL','SOCIAL') NOT NULL,
  `points_value` int NOT NULL DEFAULT '0',
  `rarity` enum('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') DEFAULT 'COMMON',
  `unlock_criteria` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`achievement_id`),
  UNIQUE KEY `achievement_name` (`achievement_name`),
  KEY `idx_category` (`category`),
  KEY `idx_rarity` (`rarity`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'First Steps','Welcome to GradeGoal! Complete your profile setup.',NULL,'CONSISTENCY',50,'COMMON','{\"action\": \"profile_complete\"}',1,'2025-09-13 22:48:10'),(2,'Grade Entry Rookie','Enter your first 5 grades.',NULL,'ACADEMIC',100,'COMMON','{\"grades_entered\": 5}',1,'2025-09-13 22:48:10'),(3,'Streak Starter','Maintain a 3-day login streak.',NULL,'CONSISTENCY',75,'COMMON','{\"streak_days\": 3}',1,'2025-09-13 22:48:10'),(4,'Week Warrior','Maintain a 7-day login streak.',NULL,'CONSISTENCY',200,'UNCOMMON','{\"streak_days\": 7}',1,'2025-09-13 22:48:10'),(5,'Goal Setter','Create your first academic goal.',NULL,'GOAL',100,'COMMON','{\"goals_created\": 1}',1,'2025-09-13 22:48:10'),(6,'Goal Crusher','Achieve your first academic goal.',NULL,'GOAL',300,'UNCOMMON','{\"goals_achieved\": 1}',1,'2025-09-13 22:48:10'),(7,'A+ Student','Achieve a grade of 95% or higher.',NULL,'ACADEMIC',250,'UNCOMMON','{\"grade_threshold\": 95}',1,'2025-09-13 22:48:10'),(8,'Dean\'s List','Achieve a 3.5 GPA or higher.',NULL,'ACADEMIC',400,'RARE','{\"gpa_threshold\": 3.5}',1,'2025-09-13 22:48:10'),(9,'Perfect Scholar','Achieve a perfect 4.0 GPA.',NULL,'ACADEMIC',1000,'LEGENDARY','{\"gpa_threshold\": 4.0}',1,'2025-09-13 22:48:10'),(10,'Improvement Champion','Improve your grade by 10+ points in any course.',NULL,'IMPROVEMENT',300,'UNCOMMON','{\"grade_improvement\": 10}',1,'2025-09-13 22:48:10'),(11,'Consistency King','Maintain a 30-day login streak.',NULL,'CONSISTENCY',500,'RARE','{\"streak_days\": 30}',1,'2025-09-13 22:48:10'),(12,'Data Master','Export your first academic report.',NULL,'ACADEMIC',150,'COMMON','{\"exports_created\": 1}',1,'2025-09-13 22:48:10'),(13,'Calendar Sync Pro','Sync 10 assignments to your calendar.',NULL,'CONSISTENCY',200,'UNCOMMON','{\"calendar_syncs\": 10}',1,'2025-09-13 22:48:10'),(14,'Level Up Legend','Reach level 10.',NULL,'CONSISTENCY',750,'EPIC','{\"level_reached\": 10}',1,'2025-09-13 22:48:10'),(15,'Points Collector','Accumulate 5,000 total points.',NULL,'CONSISTENCY',500,'RARE','{\"total_points\": 5000}',1,'2025-09-13 22:48:10');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_analysis`
--

DROP TABLE IF EXISTS `ai_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_analysis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `analysis_type` enum('COURSE_ANALYSIS','ASSESSMENT_PREDICTION','GOAL_PROBABILITY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COURSE_ANALYSIS',
  `analysis_data` json NOT NULL COMMENT 'Complete AI analysis results',
  `ai_model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'gemini-2.0-flash-exp',
  `ai_confidence` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When this analysis expires (for cache invalidation)',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_user_course` (`user_id`,`course_id`),
  KEY `idx_analysis_type` (`analysis_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analysis`
--

LOCK TABLES `ai_analysis` WRITE;
/*!40000 ALTER TABLE `ai_analysis` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_assessment_predictions`
--

DROP TABLE IF EXISTS `ai_assessment_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_assessment_predictions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `assessment_id` bigint NOT NULL,
  `predicted_score` decimal(38,2) DEFAULT NULL,
  `predicted_percentage` decimal(38,2) DEFAULT NULL,
  `predicted_gpa` decimal(38,2) DEFAULT NULL,
  `confidence_level` enum('HIGH','MEDIUM','LOW') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `recommended_score` decimal(38,2) DEFAULT NULL,
  `recommended_percentage` decimal(38,2) DEFAULT NULL,
  `analysis_reasoning` text COLLATE utf8mb4_unicode_ci COMMENT 'AI explanation for the prediction',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assessment_prediction` (`assessment_id`,`user_id`),
  KEY `idx_user_course` (`user_id`,`course_id`),
  KEY `idx_assessment` (`assessment_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_assessment_predictions`
--

LOCK TABLES `ai_assessment_predictions` WRITE;
/*!40000 ALTER TABLE `ai_assessment_predictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_assessment_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alert_rules`
--

DROP TABLE IF EXISTS `alert_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert_rules` (
  `rule_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `trigger_type` enum('GRADE_BELOW_THRESHOLD','GOAL_AT_RISK','ASSIGNMENT_DUE','GPA_CHANGE','STREAK_BROKEN') NOT NULL,
  `trigger_conditions` json NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `delivery_method` enum('EMAIL','PUSH','IN_APP','ALL') DEFAULT 'ALL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_user_enabled` (`user_id`,`is_enabled`),
  KEY `idx_trigger_type` (`trigger_type`),
  CONSTRAINT `alert_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `alert_rules_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_rules`
--

LOCK TABLES `alert_rules` WRITE;
/*!40000 ALTER TABLE `alert_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `alert_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_categories`
--

DROP TABLE IF EXISTS `assessment_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_categories` (
  `order_sequence` int DEFAULT NULL,
  `weight_percentage` decimal(5,2) NOT NULL,
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,1,5,'2025-09-23 15:52:37.535242','Assignments'),(1,30.00,2,5,'2025-09-23 15:52:37.563835','Quizzes'),(1,40.00,3,5,'2025-09-23 15:52:37.585679','Exam'),(1,30.00,4,6,'2025-09-23 16:09:29.750866','Assignments'),(1,30.00,5,6,'2025-09-23 16:09:29.766106','Quizzes'),(1,40.00,6,6,'2025-09-23 16:09:29.778545','Exam'),(1,30.00,7,7,'2025-09-23 17:47:24.000637','Assignments'),(1,30.00,8,7,'2025-09-23 17:47:24.021131','Quizzes'),(1,40.00,9,7,'2025-09-23 17:47:24.036520','Exam'),(1,30.00,10,8,'2025-09-23 20:26:20.099655','Assignments'),(1,30.00,11,8,'2025-09-23 20:26:20.113926','Quizzes'),(1,40.00,12,8,'2025-09-23 20:26:20.129948','Exam'),(1,30.00,13,9,'2025-09-25 05:49:47.109276','Assignments'),(1,30.00,14,9,'2025-09-25 05:49:47.122833','Quizzes'),(1,40.00,15,9,'2025-09-25 05:49:47.135742','Exam');
/*!40000 ALTER TABLE `assessment_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `due_date` date DEFAULT NULL,
  `max_points` decimal(8,2) NOT NULL,
  `assessment_id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assessment_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('CANCELLED','COMPLETED','OVERDUE','UPCOMING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ai_predicted_score` decimal(10,2) DEFAULT NULL COMMENT 'AI predicted score',
  `ai_predicted_percentage` decimal(10,2) DEFAULT NULL COMMENT 'AI predicted percentage',
  `ai_confidence` enum('HIGH','MEDIUM','LOW') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI confidence level',
  `ai_recommended_score` decimal(10,2) DEFAULT NULL COMMENT 'AI recommended score to reach target',
  `ai_analysis_reasoning` text COLLATE utf8mb4_unicode_ci COMMENT 'AI explanation for prediction',
  `ai_analysis_updated_at` timestamp NULL DEFAULT NULL COMMENT 'When AI analysis was last updated',
  PRIMARY KEY (`assessment_id`),
  KEY `FK4kbcb2x7nlbys293dd0vjysdm` (`category_id`),
  KEY `idx_ai_predicted_score` (`ai_predicted_score`),
  KEY `idx_ai_confidence` (`ai_confidence`),
  KEY `idx_ai_analysis_updated` (`ai_analysis_updated_at`),
  CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-04',15.00,57,1,'2025-09-24 20:55:19.368557','2025-09-24 20:55:19.367556','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-24',15.00,58,2,'2025-09-24 20:55:29.974458','2025-09-24 20:55:29.974458','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-11',14.00,59,3,'2025-09-24 20:55:37.528093','2025-09-24 20:55:37.528093','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-03',15.00,60,7,'2025-09-24 20:55:58.286493','2025-09-24 20:55:58.286493','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-12',14.00,61,8,'2025-09-24 20:56:12.998103','2025-09-24 20:56:12.998103','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-19',15.00,62,9,'2025-09-24 20:56:22.844875','2025-09-24 20:56:22.844875','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-25',15.00,63,13,'2025-09-25 05:50:20.393935','2025-09-25 05:50:20.392934','Assignment 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-20',15.00,64,14,'2025-09-25 05:59:57.605236','2025-09-25 05:59:57.604235','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-25',15.00,65,4,'2025-09-25 06:03:31.845202','2025-09-25 06:03:31.845202','Assignment 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-25',15.00,66,14,'2025-09-25 07:44:05.834061','2025-09-25 07:44:05.833059','Quiz 2',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `event_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `assessment_id` bigint DEFAULT NULL,
  `google_calendar_event_id` varchar(500) DEFAULT NULL,
  `event_title` varchar(255) NOT NULL,
  `event_start` datetime NOT NULL,
  `event_end` datetime NOT NULL,
  `description` text,
  `is_synced` tinyint(1) DEFAULT '0',
  `sync_status` enum('PENDING','SYNCED','FAILED','DELETED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_synced_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `assessment_id` (`assessment_id`),
  KEY `idx_user_date` (`user_id`,`event_start`),
  KEY `idx_sync_status` (`sync_status`),
  KEY `idx_google_id` (`google_calendar_event_id`),
  CONSTRAINT `calendar_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `calendar_events_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `calculated_course_grade` decimal(5,2) DEFAULT NULL,
  `course_gpa` decimal(3,2) DEFAULT NULL,
  `credit_hours` int NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `course_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `academic_year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructor_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` enum('FIRST','SECOND','THIRD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_index` int DEFAULT NULL,
  `category_system` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grading_scale` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gpa_scale` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_points` int DEFAULT '100',
  `handle_missing` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`),
  CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (85.43,2.70,3,_binary '',5,'2025-09-23 15:52:37.285622','2025-09-24 20:55:40.323421',1,'2025','co11','Course 1',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(93.33,3.70,3,_binary '',6,'2025-09-23 16:09:29.713652','2025-09-25 06:03:34.253846',1,'2025','Co22','Course 2',NULL,'SECOND',0,'3-categories','percentage','4.0',100,'exclude'),(60.24,0.00,3,_binary '',7,'2025-09-23 17:47:23.937246','2025-09-25 06:00:58.810094',1,'2025','co333','Course 3',NULL,'SECOND',0,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',8,'2025-09-23 20:26:20.081481','2025-09-25 04:34:16.000000',1,'2025','co444','Course 4',NULL,'THIRD',0,'3-categories','percentage','4.0',100,'exclude'),(96.67,3.70,3,_binary '',9,'2025-09-25 05:49:47.055917','2025-09-25 06:00:01.138090',1,'2025','co555','Course five',NULL,'FIRST',1,'3-categories','percentage','4.0',100,'exclude');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_logs`
--

DROP TABLE IF EXISTS `export_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_logs` (
  `export_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `export_type` enum('PDF_REPORT','CSV_GRADES','JSON_BACKUP','TRANSCRIPT') NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(1000) DEFAULT NULL,
  `export_parameters` json DEFAULT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`export_id`),
  KEY `idx_user_type` (`user_id`,`export_type`),
  KEY `idx_status` (`status`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `export_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_logs`
--

LOCK TABLES `export_logs` WRITE;
/*!40000 ALTER TABLE `export_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `export_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `grade_date` date DEFAULT NULL,
  `is_extra_credit` bit(1) DEFAULT NULL,
  `percentage_score` decimal(5,2) DEFAULT NULL,
  `points_earned` decimal(8,2) DEFAULT NULL,
  `points_possible` decimal(8,2) DEFAULT NULL,
  `assessment_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `grade_id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `score_type` enum('PERCENTAGE','POINTS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `extra_credit_points` decimal(8,2) DEFAULT '0.00',
  PRIMARY KEY (`grade_id`),
  KEY `FKr3vxme485so9o2jlqhtbdu85x` (`assessment_id`),
  CONSTRAINT `FKr3vxme485so9o2jlqhtbdu85x` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-04',_binary '\0',93.33,14.00,15.00,57,'2025-09-24 20:55:19.369650',57,'2025-09-25 04:55:21.000000','','PERCENTAGE',NULL),('2025-09-24',_binary '\0',86.67,13.00,15.00,58,'2025-09-24 20:55:29.975459',58,'2025-09-25 04:55:32.000000','','PERCENTAGE',NULL),('2025-09-11',_binary '\0',78.57,11.00,14.00,59,'2025-09-24 20:55:37.530019',59,'2025-09-25 04:55:40.000000','','PERCENTAGE',NULL),('2025-09-03',_binary '\0',6.67,1.00,15.00,60,'2025-09-24 20:55:58.287494',60,'2025-09-25 14:00:58.000000','','PERCENTAGE',NULL),('2025-09-12',_binary '\0',78.57,11.00,14.00,61,'2025-09-24 20:56:12.999659',61,'2025-09-25 14:00:43.000000','','PERCENTAGE',NULL),('2025-09-19',_binary '\0',86.67,13.00,15.00,62,'2025-09-24 20:56:22.845876',62,'2025-09-25 14:00:35.000000','','PERCENTAGE',NULL),('2025-09-25',_binary '\0',100.00,15.00,15.00,63,'2025-09-25 05:50:20.395937',63,'2025-09-25 13:50:26.000000','','PERCENTAGE',NULL),('2025-09-20',_binary '\0',93.33,14.00,15.00,64,'2025-09-25 05:59:57.606494',64,'2025-09-25 14:00:00.000000','','PERCENTAGE',NULL),('2025-09-25',_binary '\0',93.33,14.00,15.00,65,'2025-09-25 06:03:31.846796',65,'2025-09-25 14:03:34.000000','','PERCENTAGE',NULL),('2025-09-25',_binary '\0',0.00,0.00,15.00,66,'2025-09-25 07:44:05.865088',66,'2025-09-25 07:44:05.865088','','POINTS',NULL);
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `notification_type` enum('GRADE_ALERT','GOAL_REMINDER','ACHIEVEMENT','PREDICTION_UPDATE','SYSTEM','ASSIGNMENT_DUE') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  `is_read` tinyint(1) DEFAULT '0',
  `action_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_user_unread` (`user_id`,`is_read`),
  KEY `idx_type_priority` (`notification_type`,`priority`),
  KEY `idx_created_date` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:53:15',NULL),(2,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:54:24',NULL),(3,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:04',NULL),(4,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:29',NULL),(5,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:50',NULL),(6,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:55',NULL),(7,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:56:01',NULL),(8,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:56:05',NULL),(9,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:58:00',NULL),(10,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 06:03:28',NULL),(11,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:28:32',NULL),(12,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:29:46',NULL),(13,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:37:54',NULL),(14,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:40:10',NULL),(15,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:46:24',NULL),(16,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:47:22',NULL),(17,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:47:36',NULL),(18,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:49:47',NULL),(19,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:22:43',NULL),(20,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:22:56',NULL),(21,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:23:18',NULL),(22,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:23:35',NULL),(23,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:46:47',NULL),(24,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:52:25',NULL),(25,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 13:09:02',NULL),(26,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 16:16:30',NULL),(27,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:30',NULL),(28,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:35',NULL),(29,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:45',NULL),(30,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:26:27',NULL),(31,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:28:19',NULL),(32,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:46:04',NULL),(33,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:47:58',NULL),(34,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:50:56',NULL),(35,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 21:19:36',NULL),(36,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:23:54',NULL),(37,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:24:25',NULL),(38,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:33:26',NULL),(39,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:33:36',NULL),(40,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:35:16',NULL),(41,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 15:40:57',NULL),(42,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 17:53:33',NULL),(43,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 17:53:40',NULL),(44,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 19:58:04',NULL),(45,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 19:58:12',NULL),(46,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:01:12',NULL),(47,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:02:24',NULL),(48,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:03:39',NULL),(49,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:06:00',NULL),(50,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:06:26',NULL),(51,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:07:44',NULL),(52,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:41:29',NULL),(53,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:41:55',NULL),(54,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:48:24',NULL),(55,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:10',NULL),(56,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:18',NULL),(57,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:27',NULL),(58,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:21',NULL),(59,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:32',NULL),(60,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:40',NULL),(61,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:56:00',NULL),(62,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:56:15',NULL),(63,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:56:25',NULL),(64,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-25 05:50:26',NULL),(65,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-25 06:00:01',NULL),(66,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-25 06:03:34',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendations`
--

DROP TABLE IF EXISTS `recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendations` (
  `recommendation_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `recommendation_type` enum('STUDY_STRATEGY','GRADE_IMPROVEMENT','TIME_MANAGEMENT','GOAL_ADJUSTMENT','AI_ANALYSIS','PREDICTED_GRADE','ASSESSMENT_RECOMMENDATION','GOAL_PROBABILITY','STATUS_UPDATE','STUDY_HABITS') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  `is_read` tinyint(1) DEFAULT '0',
  `is_dismissed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `ai_confidence` double DEFAULT NULL,
  `ai_generated` bit(1) DEFAULT NULL,
  `ai_model` varchar(100) DEFAULT NULL,
  `ai_prompt_hash` varchar(64) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`recommendation_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_user_type` (`user_id`,`recommendation_type`),
  KEY `idx_unread` (`user_id`,`is_read`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_ai_generated` (`ai_generated`),
  KEY `idx_ai_confidence` (`ai_confidence`),
  KEY `idx_ai_model` (`ai_model`),
  KEY `idx_created_ai` (`created_at`,`ai_generated`),
  CONSTRAINT `recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `recommendations_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendations`
--

LOCK TABLES `recommendations` WRITE;
/*!40000 ALTER TABLE `recommendations` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `user_achievement_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `achievement_id` int NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `earned_context` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`user_achievement_id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  KEY `idx_earned_date` (`earned_at`),
  KEY `idx_user_date` (`user_id`,`earned_at`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activity_log`
--

DROP TABLE IF EXISTS `user_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activity_log` (
  `activity_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `context` varchar(500) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  KEY `idx_user_activity` (`user_id`,`activity_type`,`created_at`),
  CONSTRAINT `user_activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_log`
--

LOCK TABLES `user_activity_log` WRITE;
/*!40000 ALTER TABLE `user_activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_analytics`
--

DROP TABLE IF EXISTS `user_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_analytics` (
  `analytics_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `analytics_date` date DEFAULT (curdate()),
  `current_grade` decimal(5,2) DEFAULT NULL,
  `grade_trend` decimal(5,2) DEFAULT NULL,
  `assignments_completed` int DEFAULT '0',
  `assignments_pending` int DEFAULT '0',
  `study_hours_logged` decimal(5,2) DEFAULT NULL,
  `performance_metrics` json DEFAULT NULL,
  `calculated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` date DEFAULT NULL,
  `semester` varchar(20) DEFAULT 'FIRST',
  PRIMARY KEY (`analytics_id`),
  KEY `idx_user_date` (`user_id`,`analytics_date`),
  KEY `idx_course_date` (`course_id`,`analytics_date`),
  KEY `idx_user_analytics_due_date` (`due_date`),
  CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_analytics_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (1,1,5,'2025-09-25',3.70,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 93.33, \"study_hours_logged\": 0.00}','2025-09-24 20:55:21','2025-09-04','FIRST'),(2,1,5,'2025-09-25',3.30,-0.40,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 90.00, \"study_hours_logged\": 0.00}','2025-09-24 20:55:32','2025-09-24','FIRST'),(3,1,5,'2025-09-25',2.70,-0.60,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 85.43, \"study_hours_logged\": 0.00}','2025-09-24 20:55:40','2025-09-11','FIRST'),(4,1,7,'2025-09-25',2.30,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 80.00, \"study_hours_logged\": 0.00}','2025-09-24 20:56:00','2025-09-03','SECOND'),(5,1,7,'2025-09-25',2.30,0.00,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 82.86, \"study_hours_logged\": 0.00}','2025-09-24 20:56:15','2025-09-12','SECOND'),(6,1,7,'2025-09-25',2.00,-0.30,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 79.05, \"study_hours_logged\": 0.00}','2025-09-24 20:56:25','2025-09-19','SECOND'),(7,1,9,'2025-09-25',4.00,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-25 05:50:26','2025-09-25','FIRST'),(8,1,9,'2025-09-25',3.70,-0.30,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 96.67, \"study_hours_logged\": 0.00}','2025-09-25 06:00:01','2025-09-20','FIRST'),(9,1,7,'2025-09-25',2.70,0.70,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 84.38, \"study_hours_logged\": 0.00}','2025-09-25 06:00:35','2025-09-19','SECOND'),(10,1,7,'2025-09-25',2.30,-0.40,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 82.24, \"study_hours_logged\": 0.00}','2025-09-25 06:00:43','2025-09-19','SECOND'),(11,1,7,'2025-09-25',0.00,-2.30,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 60.24, \"study_hours_logged\": 0.00}','2025-09-25 06:00:58','2025-09-19','SECOND'),(12,1,6,'2025-09-25',3.70,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 93.33, \"study_hours_logged\": 0.00}','2025-09-25 06:03:34','2025-09-25','SECOND');
/*!40000 ALTER TABLE `user_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `user_id` bigint NOT NULL,
  `total_points` int DEFAULT '0',
  `current_level` int DEFAULT '1',
  `points_to_next_level` int DEFAULT '100',
  `streak_days` int DEFAULT '0',
  `last_activity_date` date DEFAULT NULL,
  `semester_gpa` double DEFAULT NULL,
  `cummulative_gpa` decimal(3,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cumulative_gpa` double DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,240,3,60,0,'2025-09-25',3.2,0.00,'2025-09-25 08:52:04',2.02);
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `email_notifications_enabled` bit(1) DEFAULT NULL,
  `push_notifications_enabled` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `profile_picture_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_preference` enum('BOTH','MOBILE','WEB') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '',_binary '','2025-09-10 09:04:04.376763',NULL,'2025-09-10 09:04:04.376763',1,NULL,'pinpinramirez@gmail.com','analiza','ramirez',NULL,'$2a$10$RqbiMzmgXINLw1pRpCNSausQs8cW5kIAR9osrGIyjZaIZLRPWBg0S','WEB');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-25 16:59:22
