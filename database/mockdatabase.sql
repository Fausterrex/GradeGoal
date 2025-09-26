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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_goals`
--

LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,1,5,'2025-09-23 15:52:37.535242','Assignments'),(1,30.00,2,5,'2025-09-23 15:52:37.563835','Quizzes'),(1,40.00,3,5,'2025-09-23 15:52:37.585679','Exam'),(1,30.00,4,6,'2025-09-23 16:09:29.750866','Assignments'),(1,30.00,5,6,'2025-09-23 16:09:29.766106','Quizzes'),(1,40.00,6,6,'2025-09-23 16:09:29.778545','Exam'),(1,30.00,7,7,'2025-09-23 17:47:24.000637','Assignments'),(1,30.00,8,7,'2025-09-23 17:47:24.021131','Quizzes'),(1,40.00,9,7,'2025-09-23 17:47:24.036520','Exam'),(1,30.00,10,8,'2025-09-23 20:26:20.099655','Assignments'),(1,30.00,11,8,'2025-09-23 20:26:20.113926','Quizzes'),(1,40.00,12,8,'2025-09-23 20:26:20.129948','Exam');
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
  PRIMARY KEY (`assessment_id`),
  KEY `FK4kbcb2x7nlbys293dd0vjysdm` (`category_id`),
  CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-04',15.00,57,1,'2025-09-24 20:55:19.368557','2025-09-24 20:55:19.367556','Assignment 1',NULL,'OVERDUE'),('2025-09-24',15.00,58,2,'2025-09-24 20:55:29.974458','2025-09-24 20:55:29.974458','Quiz 1',NULL,'OVERDUE'),('2025-09-11',14.00,59,3,'2025-09-24 20:55:37.528093','2025-09-24 20:55:37.528093','Exam 1',NULL,'OVERDUE'),('2025-09-03',15.00,60,7,'2025-09-24 20:55:58.286493','2025-09-24 20:55:58.286493','Assignment 1',NULL,'OVERDUE'),('2025-09-12',14.00,61,8,'2025-09-24 20:56:12.998103','2025-09-24 20:56:12.998103','Quiz 1',NULL,'OVERDUE'),('2025-09-19',15.00,62,9,'2025-09-24 20:56:22.844875','2025-09-24 20:56:22.844875','Exam 1',NULL,'OVERDUE');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (85.43,2.70,3,_binary '',5,'2025-09-23 15:52:37.285622','2025-09-24 20:55:40.323421',1,'2025','co11','Course 1',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',6,'2025-09-23 16:09:29.713652','2025-09-25 04:08:25.000000',1,'2025','Co22','Course 2',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(79.05,2.00,3,_binary '',7,'2025-09-23 17:47:23.937246','2025-09-24 20:56:25.876337',1,'2025','co333','Course 3',NULL,'SECOND',0,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',8,'2025-09-23 20:26:20.081481','2025-09-25 04:34:16.000000',1,'2025','co444','Course 4',NULL,'THIRD',0,'3-categories','percentage','4.0',100,'exclude');
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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-04',_binary '\0',93.33,14.00,15.00,57,'2025-09-24 20:55:19.369650',57,'2025-09-25 04:55:21.000000','','PERCENTAGE',NULL),('2025-09-24',_binary '\0',86.67,13.00,15.00,58,'2025-09-24 20:55:29.975459',58,'2025-09-25 04:55:32.000000','','PERCENTAGE',NULL),('2025-09-11',_binary '\0',78.57,11.00,14.00,59,'2025-09-24 20:55:37.530019',59,'2025-09-25 04:55:40.000000','','PERCENTAGE',NULL),('2025-09-03',_binary '\0',80.00,12.00,15.00,60,'2025-09-24 20:55:58.287494',60,'2025-09-25 04:56:00.000000','','PERCENTAGE',NULL),('2025-09-12',_binary '\0',85.71,12.00,14.00,61,'2025-09-24 20:56:12.999659',61,'2025-09-25 04:56:15.000000','','PERCENTAGE',NULL),('2025-09-19',_binary '\0',73.33,11.00,15.00,62,'2025-09-24 20:56:22.845876',62,'2025-09-25 04:56:25.000000','','PERCENTAGE',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:53:15',NULL),(2,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:54:24',NULL),(3,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:04',NULL),(4,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:29',NULL),(5,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:50',NULL),(6,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:55:55',NULL),(7,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:56:01',NULL),(8,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:56:05',NULL),(9,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 05:58:00',NULL),(10,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 06:03:28',NULL),(11,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:28:32',NULL),(12,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:29:46',NULL),(13,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:37:54',NULL),(14,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:40:10',NULL),(15,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:46:24',NULL),(16,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:47:22',NULL),(17,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:47:36',NULL),(18,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 09:49:47',NULL),(19,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:22:43',NULL),(20,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:22:56',NULL),(21,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:23:18',NULL),(22,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:23:35',NULL),(23,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:46:47',NULL),(24,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 10:52:25',NULL),(25,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 13:09:02',NULL),(26,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 16:16:30',NULL),(27,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:30',NULL),(28,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:35',NULL),(29,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 17:47:45',NULL),(30,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:26:27',NULL),(31,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:28:19',NULL),(32,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:46:04',NULL),(33,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:47:58',NULL),(34,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 20:50:56',NULL),(35,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-23 21:19:36',NULL),(36,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:23:54',NULL),(37,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:24:25',NULL),(38,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:33:26',NULL),(39,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:33:36',NULL),(40,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-23 21:35:16',NULL),(41,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 15:40:57',NULL),(42,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 17:53:33',NULL),(43,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 17:53:40',NULL),(44,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 19:58:04',NULL),(45,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 19:58:12',NULL),(46,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:01:12',NULL),(47,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:02:24',NULL),(48,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:03:39',NULL),(49,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:06:00',NULL),(50,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:06:26',NULL),(51,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:07:44',NULL),(52,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:41:29',NULL),(53,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:41:55',NULL),(54,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:48:24',NULL),(55,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:10',NULL),(56,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:18',NULL),(57,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:50:27',NULL),(58,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:21',NULL),(59,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:32',NULL),(60,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:55:40',NULL),(61,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-24 20:56:00',NULL),(62,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:56:15',NULL),(63,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-24 20:56:25',NULL);
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
  `recommendation_type` enum('STUDY_STRATEGY','GRADE_IMPROVEMENT','TIME_MANAGEMENT','GOAL_ADJUSTMENT') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  `is_read` tinyint(1) DEFAULT '0',
  `is_dismissed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`recommendation_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_user_type` (`user_id`,`recommendation_type`),
  KEY `idx_unread` (`user_id`,`is_read`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `recommendations_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (1,1,5,'2025-09-25',3.70,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 93.33, \"study_hours_logged\": 0.00}','2025-09-24 20:55:21','2025-09-04','FIRST'),(2,1,5,'2025-09-25',3.30,-0.40,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 90.00, \"study_hours_logged\": 0.00}','2025-09-24 20:55:32','2025-09-24','FIRST'),(3,1,5,'2025-09-25',2.70,-0.60,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 85.43, \"study_hours_logged\": 0.00}','2025-09-24 20:55:40','2025-09-11','FIRST'),(4,1,7,'2025-09-25',2.30,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 80.00, \"study_hours_logged\": 0.00}','2025-09-24 20:56:00','2025-09-03','SECOND'),(5,1,7,'2025-09-25',2.30,0.00,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 82.86, \"study_hours_logged\": 0.00}','2025-09-24 20:56:15','2025-09-12','SECOND'),(6,1,7,'2025-09-25',2.00,-0.30,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 79.05, \"study_hours_logged\": 0.00}','2025-09-24 20:56:25','2025-09-19','SECOND');
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
INSERT INTO `user_progress` VALUES (1,210,3,90,0,'2025-09-25',1.35,0.00,'2025-09-24 20:56:49',1.18);
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

--
-- Dumping routines for database 'gradegoal'
--
/*!50003 DROP FUNCTION IF EXISTS `CalculateCategoryGrade` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCategoryGrade`(p_category_id BIGINT) RETURNS decimal(5,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE category_grade DECIMAL(5,2) DEFAULT 0.00;
    DECLARE total_points_earned DECIMAL(10,2) DEFAULT 0.00;
    DECLARE total_points_possible DECIMAL(10,2) DEFAULT 0.00;
    DECLARE total_extra_credit DECIMAL(10,2) DEFAULT 0.00;
    DECLARE handle_missing_setting VARCHAR(255) DEFAULT 'exclude';
    
    -- Get the handle_missing setting for this course
    SELECT c.handle_missing 
    INTO handle_missing_setting
    FROM courses c
    INNER JOIN assessment_categories ac ON c.course_id = ac.course_id
    WHERE ac.category_id = p_category_id
    LIMIT 1;
    
    -- Calculate based on handle_missing setting
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all assessments, treat missing as 0 points earned
        SELECT 
            COALESCE(SUM(COALESCE(g.points_earned, 0)), 0),
            COALESCE(SUM(a.max_points), 0),
            COALESCE(SUM(COALESCE(g.extra_credit_points, 0)), 0)
        INTO total_points_earned, total_points_possible, total_extra_credit
        FROM assessments a
        LEFT JOIN grades g ON a.assessment_id = g.assessment_id
        WHERE a.category_id = p_category_id;
        
    ELSE
        -- Default behavior: exclude missing assessments, include extra credit
        SELECT 
            COALESCE(SUM(g.points_earned), 0),
            COALESCE(SUM(a.max_points), 0),
            COALESCE(SUM(COALESCE(g.extra_credit_points, 0)), 0)
        INTO total_points_earned, total_points_possible, total_extra_credit
        FROM grades g
        INNER JOIN assessments a ON g.assessment_id = a.assessment_id
        WHERE a.category_id = p_category_id 
        AND g.points_earned IS NOT NULL;
    END IF;
    
    -- Calculate percentage including extra credit
    -- Extra credit points are added to both earned and possible points to boost the percentage
    IF total_points_possible > 0 THEN
        SET category_grade = ((total_points_earned + total_extra_credit) / total_points_possible) * 100;
        -- Cap at 100% if no extra credit, or allow over 100% with extra credit
        -- IF total_extra_credit = 0 AND category_grade > 100 THEN
        --     SET category_grade = 100.00;
        -- END IF;
    END IF;
    
    RETURN ROUND(category_grade, 2);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalculateCourseGrade` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCourseGrade`(p_course_id BIGINT) RETURNS decimal(5,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE course_grade DECIMAL(5,2) DEFAULT 0.00;
    DECLARE total_weight DECIMAL(5,2) DEFAULT 0.00;
    DECLARE weighted_sum DECIMAL(8,4) DEFAULT 0.00;
    DECLARE handle_missing_setting VARCHAR(255) DEFAULT 'exclude';
    
    -- Get the handle_missing setting for this course
    SELECT handle_missing 
    INTO handle_missing_setting
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Calculate weighted grade using category weights
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all categories, treat empty categories as 0%
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(ac.weight_percentage), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
    ELSE
        -- Default behavior: exclude categories with no completed assessments
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(
                CASE 
                    WHEN (SELECT COUNT(*) FROM assessments a 
                          INNER JOIN grades g ON a.assessment_id = g.assessment_id 
                          WHERE a.category_id = ac.category_id 
                          AND g.points_earned IS NOT NULL) > 0 
                    THEN ac.weight_percentage 
                    ELSE 0 
                END
            ), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
    END IF;
    
    -- Calculate final course grade
    IF total_weight > 0 THEN
        SET course_grade = (weighted_sum * 100) / total_weight;
    END IF;
    
    RETURN ROUND(course_grade, 2);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalculateCumulativeGPA` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCumulativeGPA`(p_user_id BIGINT) RETURNS decimal(3,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE total_grade_points DECIMAL(10,2) DEFAULT 0.00;
    DECLARE total_credit_hours INT DEFAULT 0;
    DECLARE cumulative_gpa DECIMAL(3,2) DEFAULT 0.00;

    -- Sum grade points (GPA * credit_hours) and total credit hours
    SELECT 
        COALESCE(SUM(c.course_gpa * c.credit_hours), 0),
        COALESCE(SUM(c.credit_hours), 0)
    INTO total_grade_points, total_credit_hours
    FROM courses c
    WHERE c.user_id = p_user_id
      AND c.course_gpa IS NOT NULL;

    -- Compute cumulative GPA
    IF total_credit_hours > 0 THEN
        SET cumulative_gpa = total_grade_points / total_credit_hours;
    END IF;

    -- Optionally update user_progress table
    UPDATE user_progress
    SET cumulative_gpa = cumulative_gpa,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    RETURN ROUND(cumulative_gpa, 2);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalculateGPA` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateGPA`(p_percentage DECIMAL(5,2)) RETURNS decimal(3,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE gpa DECIMAL(3,2) DEFAULT 0.00;
    
    -- Standard 4.0 GPA scale conversion
    IF p_percentage >= 97 THEN SET gpa = 4.00;
    ELSEIF p_percentage >= 93 THEN SET gpa = 3.70;
    ELSEIF p_percentage >= 90 THEN SET gpa = 3.30;
    ELSEIF p_percentage >= 87 THEN SET gpa = 3.00;
    ELSEIF p_percentage >= 83 THEN SET gpa = 2.70;
    ELSEIF p_percentage >= 80 THEN SET gpa = 2.30;
    ELSEIF p_percentage >= 77 THEN SET gpa = 2.00;
    ELSEIF p_percentage >= 73 THEN SET gpa = 1.70;
    ELSEIF p_percentage >= 70 THEN SET gpa = 1.30;
    ELSEIF p_percentage >= 67 THEN SET gpa = 1.00;
    ELSEIF p_percentage >= 65 THEN SET gpa = 0.70;
    ELSE SET gpa = 0.00;
    END IF;
    
    RETURN gpa;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalculateSemesterGPA` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateSemesterGPA`(
    p_user_id BIGINT, 
    p_semester VARCHAR(20), 
    p_academic_year VARCHAR(255)
) RETURNS decimal(3,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE total_grade_points DECIMAL(10,2) DEFAULT 0.00;
    DECLARE total_credit_hours INT DEFAULT 0;
    DECLARE semester_gpa DECIMAL(3,2) DEFAULT 0.00;

    -- Sum grade points (GPA * credit_hours) and total credit hours for specific semester
    -- Use COLLATE to handle collation mismatch
    SELECT 
        COALESCE(SUM(c.course_gpa * c.credit_hours), 0),
        COALESCE(SUM(c.credit_hours), 0)
    INTO total_grade_points, total_credit_hours
    FROM courses c
    WHERE c.user_id = p_user_id
      AND c.semester COLLATE utf8mb4_unicode_ci = p_semester COLLATE utf8mb4_unicode_ci
      AND c.academic_year COLLATE utf8mb4_unicode_ci = p_academic_year COLLATE utf8mb4_unicode_ci
      AND c.course_gpa IS NOT NULL
      AND c.is_active = 1;

    -- Compute semester GPA
    IF total_credit_hours > 0 THEN
        SET semester_gpa = total_grade_points / total_credit_hours;
    END IF;

    RETURN ROUND(semester_gpa, 2);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AddOrUpdateGrade` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddOrUpdateGrade`(
    IN p_assessment_id BIGINT,
    IN p_points_earned DECIMAL(8,2),
    IN p_points_possible DECIMAL(8,2),
    IN p_percentage_score DECIMAL(5,2),
    IN p_score_type ENUM('PERCENTAGE','POINTS'),
    IN p_notes TEXT,
    IN p_is_extra_credit BOOLEAN,
    IN p_extra_credit_points DECIMAL(8,2),
    OUT p_grade_id BIGINT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE existing_grade_id BIGINT DEFAULT NULL;
    DECLARE v_user_id BIGINT DEFAULT NULL;
    DECLARE v_course_id BIGINT DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR: Failed to add/update grade';
        SET p_grade_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Get the user_id and course_id for this assessment
    SELECT c.user_id, c.course_id 
    INTO v_user_id, v_course_id
    FROM courses c 
    INNER JOIN assessment_categories ac ON c.course_id = ac.course_id
    INNER JOIN assessments a ON ac.category_id = a.category_id
    WHERE a.assessment_id = p_assessment_id
    LIMIT 1;
    
    -- Check if user_id was found
    IF v_user_id IS NULL THEN
        SET p_result = 'ERROR: Assessment not found or no associated user';
        SET p_grade_id = NULL;
        ROLLBACK;
    ELSE
        -- Check if grade already exists for this assessment
        SELECT grade_id 
        INTO existing_grade_id
        FROM grades 
        WHERE assessment_id = p_assessment_id 
        LIMIT 1;
        
        IF existing_grade_id IS NOT NULL THEN
            -- Update existing grade
            UPDATE grades SET
                points_earned = p_points_earned,
                points_possible = p_points_possible,
                percentage_score = p_percentage_score,
                score_type = p_score_type,
                notes = p_notes,
                is_extra_credit = p_is_extra_credit,
                extra_credit_points = p_extra_credit_points,
                updated_at = CURRENT_TIMESTAMP
            WHERE grade_id = existing_grade_id;
            
            SET p_grade_id = existing_grade_id;
            SET p_result = 'Grade updated successfully';
        ELSE
            -- Insert new grade with user_id and extra_credit_points
            INSERT INTO grades (
                assessment_id, points_earned, points_possible, 
                percentage_score, score_type, notes, is_extra_credit, 
                extra_credit_points, user_id
            ) VALUES (
                p_assessment_id, p_points_earned, p_points_possible,
                p_percentage_score, p_score_type, p_notes, p_is_extra_credit, 
                p_extra_credit_points, v_user_id
            );
            
            SET p_grade_id = LAST_INSERT_ID();
            SET p_result = 'Grade added successfully';
        END IF;
        
        -- Update course grade after grade change (only if we have a valid course_id)
        -- Note: UpdateCourseGrades already calls UpdateUserAnalytics, so no duplicate call needed
        IF v_course_id IS NOT NULL THEN
            CALL UpdateCourseGrades(v_course_id);
        END IF;
        
        -- Check goal progress after analytics are updated
        IF v_user_id IS NOT NULL THEN
            CALL CheckGoalProgress(v_user_id);
        END IF;
        
        COMMIT;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AwardPoints` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AwardPoints`(
    IN p_user_id BIGINT,
    IN p_points INT,
    IN p_activity_type VARCHAR(100)
)
BEGIN
    DECLARE current_level INT DEFAULT 1;
    DECLARE current_points INT DEFAULT 0;
    DECLARE points_to_next INT DEFAULT 100;
    DECLARE new_level INT;
    
    -- Get current progress
    SELECT current_level, total_points, points_to_next_level
    INTO current_level, current_points, points_to_next
    FROM user_progress
    WHERE user_id = p_user_id;
    
    -- Add points
    SET current_points = current_points + p_points;
    
    -- Calculate new level
    SET new_level = FLOOR(current_points / 100) + 1;
    
    -- Update user progress
    INSERT INTO user_progress (
        user_id, total_points, current_level, points_to_next_level,
        last_activity_date, updated_at
    ) VALUES (
        p_user_id, current_points, new_level, 
        (new_level * 100) - current_points,
        CURDATE(), CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        total_points = VALUES(total_points),
        current_level = VALUES(current_level),
        points_to_next_level = VALUES(points_to_next_level),
        last_activity_date = VALUES(last_activity_date),
        updated_at = VALUES(updated_at);
    
    -- Check for level up
    IF new_level > current_level THEN
        INSERT INTO notifications (
            user_id, notification_type, title, message, priority
        ) VALUES (
            p_user_id, 'ACHIEVEMENT', 'Level Up!',
            CONCAT('Congratulations! You reached Level ', new_level), 'HIGH'
        );
    END IF;
    
    -- Check for new achievements
    CALL CheckUserAchievements(p_user_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CheckGoalProgress` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CheckGoalProgress`(IN p_user_id BIGINT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE goal_id BIGINT;
    DECLARE course_id BIGINT;
    DECLARE goal_type VARCHAR(50);
    DECLARE target_value DECIMAL(5,2);
    DECLARE current_value DECIMAL(5,2);
    DECLARE is_achieved BOOLEAN DEFAULT FALSE;
    
    DECLARE goal_cursor CURSOR FOR
        SELECT g.goal_id, g.course_id, g.goal_type, g.target_value, g.is_achieved
        FROM academic_goals g
        WHERE g.user_id = p_user_id AND g.is_achieved = FALSE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN goal_cursor;
    
    goal_loop: LOOP
        FETCH goal_cursor INTO goal_id, course_id, goal_type, target_value, is_achieved;
        
        IF done THEN
            LEAVE goal_loop;
        END IF;
        
        SET current_value = 0.00;
        
        -- Get current value based on goal type
        CASE goal_type
            WHEN 'COURSE_GRADE' THEN
                -- Use course_gpa directly from courses table (already in GPA format 0-4.0)
                -- FIX: Add LIMIT 1 to prevent multiple rows error
                SELECT COALESCE(course_gpa, 0.00) INTO current_value
                FROM courses 
                WHERE course_id = course_id AND user_id = p_user_id
                LIMIT 1;
                
            WHEN 'SEMESTER_GPA' THEN
                -- FIX: Add LIMIT 1 to prevent multiple rows error
                SELECT COALESCE(semester_gpa, 0.00) INTO current_value
                FROM user_progress
                WHERE user_id = p_user_id
                LIMIT 1;
                
            WHEN 'CUMMULATIVE_GPA' THEN
                -- FIX: Add LIMIT 1 to prevent multiple rows error
                SELECT COALESCE(cumulative_gpa, 0.00) INTO current_value
                FROM user_progress
                WHERE user_id = p_user_id
                LIMIT 1;
        END CASE;
        
        -- Check if goal is achieved (both values should be in same format now)
        IF current_value >= target_value THEN
            UPDATE academic_goals SET
                is_achieved = TRUE,
                achieved_date = CURDATE(),
                updated_at = CURRENT_TIMESTAMP
            WHERE goal_id = goal_id;
            
            -- Create achievement notification
            INSERT INTO notifications (
                user_id, course_id, notification_type, title, message, priority
            ) VALUES (
                p_user_id, course_id, 'ACHIEVEMENT',
                'Goal Achieved!',
                CONCAT('Congratulations! You have achieved your goal: ', 
                       (SELECT goal_title FROM academic_goals WHERE goal_id = goal_id)),
                'HIGH'
            );
        END IF;
    END LOOP;
    
    CLOSE goal_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CheckGradeAlerts` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CheckGradeAlerts`(IN p_user_id BIGINT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE rule_id BIGINT;
    DECLARE course_id BIGINT;
    DECLARE trigger_conditions JSON;
    DECLARE threshold_grade DECIMAL(5,2);
    DECLARE current_grade DECIMAL(5,2);
    
    DECLARE alert_cursor CURSOR FOR
        SELECT ar.rule_id, ar.course_id, ar.trigger_conditions
        FROM alert_rules ar
        WHERE ar.user_id = p_user_id 
        AND ar.trigger_type = 'GRADE_BELOW_THRESHOLD'
        AND ar.is_enabled = TRUE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN alert_cursor;
    
    alert_loop: LOOP
        FETCH alert_cursor INTO rule_id, course_id, trigger_conditions;
        
        IF done THEN
            LEAVE alert_loop;
        END IF;
        
        -- Extract threshold from JSON
        SET threshold_grade = JSON_UNQUOTE(JSON_EXTRACT(trigger_conditions, '$.threshold'));
        SET current_grade = CalculateCourseGrade(course_id);
        
        -- Check if alert should be triggered
        IF current_grade < threshold_grade THEN
            -- Check if we haven't sent this alert recently (last 24 hours)
            IF NOT EXISTS (
                SELECT 1 FROM notifications
                WHERE user_id = p_user_id 
                AND course_id = course_id
                AND notification_type = 'GRADE_ALERT'
                AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ) THEN
                INSERT INTO notifications (
                    user_id, course_id, notification_type, title, message, priority
                ) VALUES (
                    p_user_id, course_id, 'GRADE_ALERT',
                    'Grade Alert',
                    CONCAT('Your current grade (', ROUND(current_grade, 1), 
                           '%) is below your threshold of ', ROUND(threshold_grade, 1), '%'),
                    'HIGH'
                );
            END IF;
        END IF;
    END LOOP;
    
    CLOSE alert_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CheckUserAchievements` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CheckUserAchievements`(IN p_user_id BIGINT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE achievement_id INT;
    DECLARE achievement_name VARCHAR(255);
    DECLARE unlock_criteria JSON;
    DECLARE required_gpa DECIMAL(5,2);
    DECLARE current_gpa DECIMAL(3,2);

    DECLARE achievement_cursor CURSOR FOR
        SELECT a.achievement_id, a.achievement_name, a.unlock_criteria
        FROM achievements a
        WHERE a.is_active = TRUE
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua
            WHERE ua.user_id = p_user_id 
            AND ua.achievement_id = a.achievement_id
        );

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN achievement_cursor;

    achievement_loop: LOOP
        FETCH achievement_cursor INTO achievement_id, achievement_name, unlock_criteria;

        IF done THEN
            LEAVE achievement_loop;
        END IF;

        -- Check if achievement type is GPA_THRESHOLD
        IF JSON_UNQUOTE(JSON_EXTRACT(unlock_criteria, '$.type')) = 'GPA_THRESHOLD' THEN
            SET required_gpa = CAST(JSON_UNQUOTE(JSON_EXTRACT(unlock_criteria, '$.threshold')) AS DECIMAL(5,2));

            SELECT cumulative_gpa INTO current_gpa
            FROM user_progress
            WHERE user_id = p_user_id;

            IF current_gpa >= required_gpa THEN
                INSERT INTO user_achievements (user_id, achievement_id, earned_context)
                VALUES (p_user_id, achievement_id, 
                        CONCAT('Achieved ', required_gpa, ' GPA'));

                INSERT INTO notifications (
                    user_id, notification_type, title, message, priority
                ) VALUES (
                    p_user_id, 'ACHIEVEMENT', 'Achievement Unlocked!',
                    CONCAT('You earned: ', achievement_name), 'HIGH'
                );
            END IF;
        END IF;
    END LOOP;

    CLOSE achievement_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CreateAnalyticsForSecondSemester` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CreateAnalyticsForSecondSemester`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE course_id_var BIGINT;
    DECLARE user_id_var BIGINT;
    
    DECLARE course_cursor CURSOR FOR 
        SELECT course_id, user_id 
        FROM courses 
        WHERE semester = 'SECOND' AND is_active = 1;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN course_cursor;
    
    read_loop: LOOP
        FETCH course_cursor INTO course_id_var, user_id_var;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Call UpdateUserAnalytics for each SECOND semester course
        CALL UpdateUserAnalytics(user_id_var, course_id_var, 'SECOND');
        
    END LOOP;
    
    CLOSE course_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InitializeMissingAnalytics` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InitializeMissingAnalytics`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id BIGINT;
    DECLARE v_course_id BIGINT;
    DECLARE v_course_name VARCHAR(255);
    
    DECLARE course_cursor CURSOR FOR
        SELECT c.user_id, c.course_id, c.course_name
        FROM courses c
        WHERE c.is_active = 1
        AND NOT EXISTS (
            SELECT 1 FROM user_analytics ua 
            WHERE ua.user_id = c.user_id 
            AND ua.course_id = c.course_id
            AND ua.analytics_date = CURDATE()
        );
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN course_cursor;
    
    course_loop: LOOP
        FETCH course_cursor INTO v_user_id, v_course_id, v_course_name;
        
        IF done THEN
            LEAVE course_loop;
        END IF;
        
        -- Create analytics for this course
        CALL UpdateUserAnalytics(v_user_id, v_course_id);
        
    END LOOP;
    
    CLOSE course_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InitializeSampleAchievements` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InitializeSampleAchievements`()
BEGIN
    -- Insert sample achievements
    INSERT INTO achievements (
        achievement_name, description, category, points_value, rarity, unlock_criteria
    ) VALUES
    ('First Steps', 'Welcome to GradeGoal! Complete your profile setup.', 'CONSISTENCY', 50, 'COMMON', '{"action": "profile_complete"}'),
    ('Grade Entry Rookie', 'Enter your first 5 grades.', 'ACADEMIC', 100, 'COMMON', '{"grades_entered": 5}'),
    ('Streak Starter', 'Maintain a 3-day login streak.', 'CONSISTENCY', 75, 'COMMON', '{"streak_days": 3}'),
    ('Week Warrior', 'Maintain a 7-day login streak.', 'CONSISTENCY', 200, 'UNCOMMON', '{"streak_days": 7}'),
    ('Goal Setter', 'Create your first academic goal.', 'GOAL', 100, 'COMMON', '{"goals_created": 1}'),
    ('Goal Crusher', 'Achieve your first academic goal.', 'GOAL', 300, 'UNCOMMON', '{"goals_achieved": 1}'),
    ('A+ Student', 'Achieve a grade of 95% or higher.', 'ACADEMIC', 250, 'UNCOMMON', '{"grade_threshold": 95}'),
    ('Dean''s List', 'Achieve a 3.5 GPA or higher.', 'ACADEMIC', 400, 'RARE', '{"gpa_threshold": 3.5}'),
    ('Perfect Scholar', 'Achieve a perfect 4.0 GPA.', 'ACADEMIC', 1000, 'LEGENDARY', '{"gpa_threshold": 4.0}'),
    ('Improvement Champion', 'Improve your grade by 10+ points in any course.', 'IMPROVEMENT', 300, 'UNCOMMON', '{"grade_improvement": 10}'),
    ('Consistency King', 'Maintain a 30-day login streak.', 'CONSISTENCY', 500, 'RARE', '{"streak_days": 30}'),
    ('Data Master', 'Export your first academic report.', 'ACADEMIC', 150, 'COMMON', '{"exports_created": 1}'),
    ('Calendar Sync Pro', 'Sync 10 assignments to your calendar.', 'CONSISTENCY', 200, 'UNCOMMON', '{"calendar_syncs": 10}'),
    ('Level Up Legend', 'Reach level 10.', 'CONSISTENCY', 750, 'EPIC', '{"level_reached": 10}'),
    ('Points Collector', 'Accumulate 5,000 total points.', 'CONSISTENCY', 500, 'RARE', '{"total_points": 5000}')
    ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        points_value = VALUES(points_value),
        unlock_criteria = VALUES(unlock_criteria);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateCourseGrades` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateCourseGrades`(IN p_course_id BIGINT)
BEGIN
    DECLARE calculated_grade DECIMAL(5,2);
    DECLARE calculated_gpa DECIMAL(3,2);
    DECLARE course_user_id BIGINT;
    
    -- Get the user_id for the course
    SELECT user_id INTO course_user_id
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Calculate the current course grade
    SET calculated_grade = CalculateCourseGrade(p_course_id);
    SET calculated_gpa = CalculateGPA(calculated_grade);
    
    -- Update the course record
    UPDATE courses SET
        calculated_course_grade = calculated_grade,
        course_gpa = calculated_gpa,
        updated_at = CURRENT_TIMESTAMP
    WHERE course_id = p_course_id;
    
    -- Update user analytics with 2 parameters (user_id, course_id)
    CALL UpdateUserAnalytics(course_user_id, p_course_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateUserAnalytics` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateUserAnalytics`(
    IN p_user_id BIGINT,
    IN p_course_id BIGINT
)
BEGIN
    DECLARE current_calculated_grade DECIMAL(5,2);
    DECLARE current_gpa DECIMAL(3,2);
    DECLARE previous_grade_trend DECIMAL(3,2);
    DECLARE course_semester VARCHAR(20);
    DECLARE course_due_date DATE;
    DECLARE total_assignments_completed INT DEFAULT 0;
    DECLARE total_assignments_pending INT DEFAULT 0;
    DECLARE total_study_hours DECIMAL(5,2) DEFAULT 0.00; -- Hardcoded as study_hours table doesn't exist

    -- Get the semester from the courses table
    SELECT semester INTO course_semester FROM courses WHERE course_id = p_course_id;

    -- Get the latest calculated course grade (percentage)
    SELECT calculated_course_grade INTO current_calculated_grade
    FROM courses
    WHERE course_id = p_course_id;

    -- Convert percentage to GPA
    SET current_gpa = CalculateGPA(current_calculated_grade);

    -- Get the due_date of the MOST RECENTLY GRADED assessment (not the latest due date)
    -- This ensures each analytics record has a unique due date based on when grades were added
    SELECT a.due_date INTO course_due_date
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE ac.course_id = p_course_id
    ORDER BY g.created_at DESC, g.updated_at DESC
    LIMIT 1;

    -- If no graded assessment found, use current date as fallback
    IF course_due_date IS NULL THEN
        SET course_due_date = CURDATE();
    END IF;

    -- Calculate assignments completed and pending
    SELECT
        COUNT(CASE WHEN g.percentage_score IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN g.percentage_score IS NULL THEN 1 END)
    INTO total_assignments_completed, total_assignments_pending
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    LEFT JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE ac.course_id = p_course_id;

    -- Get previous grade trend for comparison (latest analytics record for this course)
    SELECT current_grade INTO previous_grade_trend
    FROM user_analytics
    WHERE user_id = p_user_id AND course_id = p_course_id
    ORDER BY analytics_date DESC, calculated_at DESC
    LIMIT 1;

    -- Insert a new analytics entry
    INSERT INTO user_analytics (
        user_id,
        course_id,
        analytics_date,
        current_grade,
        grade_trend,
        assignments_completed,
        assignments_pending,
        study_hours_logged,
        performance_metrics,
        calculated_at,
        due_date,
        semester
    ) VALUES (
        p_user_id,
        p_course_id,
        CURDATE(),
        current_gpa, -- Store GPA here
        COALESCE(current_gpa - previous_grade_trend, 0.00), -- Calculate trend based on GPA
        total_assignments_completed,
        total_assignments_pending,
        total_study_hours,
        JSON_OBJECT(
            'completion_rate', CASE 
                WHEN (total_assignments_completed + total_assignments_pending) > 0 
                THEN (total_assignments_completed / (total_assignments_completed + total_assignments_pending)) * 100
                ELSE 0.00
            END,
            'study_hours_logged', total_study_hours,
            'percentage_score', current_calculated_grade -- Keep percentage here for reference
        ),
        NOW(),
        course_due_date, -- Use actual assessment due date
        COALESCE(course_semester, 'FIRST')
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-25  4:57:39
