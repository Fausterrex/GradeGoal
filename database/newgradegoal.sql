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
  `academic_year` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` enum('FIRST','SECOND','THIRD') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `FKdtcq2dk59cvthkf4whgwy2aa8` (`course_id`),
  KEY `FKmhnd6knfsmobeir1nu2fwt9o0` (`user_id`),
  CONSTRAINT `FKdtcq2dk59cvthkf4whgwy2aa8` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `FKmhnd6knfsmobeir1nu2fwt9o0` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_goals`
--

LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,100.00,12,'2025-09-14 15:17:10.738012',25,'2025-09-14 15:17:10.738012',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM',NULL,NULL),(NULL,_binary '\0',NULL,100.00,13,'2025-09-14 16:22:51.182359',27,'2025-09-14 16:22:51.182359',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,4,2,'2025-09-10 11:36:27.140441','Assignments'),(1,30.00,5,2,'2025-09-10 11:36:27.154967','Quizzes'),(1,40.00,6,2,'2025-09-10 11:36:27.167731','Seat Works'),(1,30.00,7,3,'2025-09-10 11:46:15.637090','Assignments'),(1,30.00,8,3,'2025-09-10 11:46:15.646644','Quizzes'),(1,40.00,9,3,'2025-09-10 11:46:15.655123','Exam'),(1,30.00,10,4,'2025-09-10 12:03:59.816304','Assignments'),(1,30.00,11,4,'2025-09-10 12:03:59.824957','Quizzes'),(1,40.00,12,4,'2025-09-10 12:03:59.833879','Exam'),(1,30.00,13,5,'2025-09-10 12:16:16.628981','Assignments'),(1,30.00,14,5,'2025-09-10 12:16:16.639023','Quizzes'),(1,40.00,15,5,'2025-09-10 12:16:16.647901','Exam'),(1,40.00,21,1,'2025-09-13 05:13:23.788362','Exam'),(1,30.00,22,1,'2025-09-13 05:13:23.814713','Laboratory Activity'),(1,30.00,23,1,'2025-09-13 05:16:59.174828','FFAaa'),(1,30.00,24,6,'2025-09-13 08:47:52.109769','Assignments'),(1,30.00,25,6,'2025-09-13 08:47:52.121780','Quizzes'),(1,40.00,26,6,'2025-09-13 08:47:52.134792','Exam'),(1,30.00,27,7,'2025-09-13 09:43:09.852123','Assignments'),(1,30.00,28,7,'2025-09-13 09:43:09.866136','Quizzes'),(1,40.00,29,7,'2025-09-13 09:43:09.884153','Exam'),(1,40.00,30,8,'2025-09-13 09:56:20.669925','Exam'),(1,60.00,31,8,'2025-09-13 09:56:20.682937','Laboratory Activity'),(1,30.00,32,9,'2025-09-13 11:46:44.110965','Assignments'),(1,30.00,33,9,'2025-09-13 11:46:44.122347','Quizzes'),(1,40.00,34,9,'2025-09-13 11:46:44.135359','Exam'),(1,30.00,35,10,'2025-09-13 17:50:11.582651','Assignments'),(1,30.00,36,10,'2025-09-13 17:50:11.596600','Quizzes'),(1,40.00,37,10,'2025-09-13 17:50:11.608630','Exam'),(1,30.00,38,11,'2025-09-13 21:19:31.885111','Assignments'),(1,30.00,39,11,'2025-09-13 21:19:31.898123','Quizzes'),(1,40.00,40,11,'2025-09-13 21:19:31.910134','Exam'),(1,30.00,41,12,'2025-09-13 21:31:22.892743','Assignments'),(1,30.00,42,12,'2025-09-13 21:31:22.906693','Quizzes'),(1,40.00,43,12,'2025-09-13 21:31:22.923704','Exam'),(1,30.00,44,13,'2025-09-14 16:22:38.040678','Assignments'),(1,30.00,45,13,'2025-09-14 16:22:38.053691','Quizzes'),(1,40.00,46,13,'2025-09-14 16:22:38.066703','Exam');
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
  PRIMARY KEY (`assessment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-10',25.00,5,13,'2025-09-10 12:16:28.070645','2025-09-10 12:16:32.765933','Assignment 1',NULL,'COMPLETED'),('2025-09-10',100.00,7,15,'2025-09-10 12:16:50.978999','2025-09-10 12:16:54.027997','Exam ',NULL,'COMPLETED'),('2025-09-11',15.00,16,4,'2025-09-11 12:20:08.802202','2025-09-11 12:20:12.452313','Assignment 1',NULL,'COMPLETED'),('2025-09-11',15.00,19,5,'2025-09-11 12:23:00.461899','2025-09-11 12:23:09.411164','Quiz 1',NULL,'COMPLETED'),('2025-09-11',15.00,20,6,'2025-09-11 12:23:17.316741','2025-09-11 12:23:22.395957','Exam ',NULL,'COMPLETED'),('2025-09-11',15.00,21,14,'2025-09-11 12:31:49.130924','2025-09-11 12:31:53.209301','Quiz ',NULL,'COMPLETED'),('2025-09-11',15.00,26,5,'2025-09-11 13:17:14.496019','2025-09-11 13:17:16.679971','Quiz 2',NULL,'COMPLETED'),('2025-09-13',15.00,39,21,'2025-09-13 05:16:44.746111','2025-09-13 06:17:39.915832','Exam 1',NULL,'COMPLETED'),('2025-09-13',15.00,41,23,'2025-09-13 05:55:00.599869','2025-09-13 06:21:50.081493','Ffaaa 1',NULL,'COMPLETED'),('2025-09-13',15.00,44,22,'2025-09-13 06:30:48.578848','2025-09-13 06:31:10.709639','Laboratory activity 2',NULL,'COMPLETED'),('2025-09-13',15.00,45,23,'2025-09-13 06:30:52.554574','2025-09-13 06:35:43.188496','Ffaaa 2',NULL,'COMPLETED'),('2025-09-13',15.00,46,21,'2025-09-13 06:37:27.021942','2025-09-13 07:55:52.559072','Exam 3',NULL,'COMPLETED'),('2025-09-13',15.00,48,23,'2025-09-13 06:37:34.680718','2025-09-13 07:56:14.142072','Ffaaa 3',NULL,'COMPLETED'),('2025-09-13',15.00,65,29,'2025-09-13 10:33:12.042367','2025-09-13 10:33:15.319748','Exam 1',NULL,'COMPLETED'),('2025-09-13',15.00,70,32,'2025-09-13 17:39:06.298355','2025-09-13 17:39:09.060750','Assignment 1',NULL,'COMPLETED'),('2025-09-13',15.00,71,25,'2025-09-13 17:49:03.387936','2025-09-13 17:49:05.420630','Quiz 1',NULL,'COMPLETED'),('2025-09-13',15.00,72,24,'2025-09-13 17:49:31.752906','2025-09-13 17:49:34.532639','Assignment 1',NULL,'COMPLETED'),('2025-09-13',15.00,73,35,'2025-09-13 17:50:15.476104','2025-09-13 17:50:17.850638','Assignment 1',NULL,'COMPLETED'),('2025-09-13',15.00,74,26,'2025-09-13 19:12:30.688685','2025-09-13 19:12:33.040663','Exam 1',NULL,'COMPLETED'),('2025-09-13',15.00,75,25,'2025-09-13 19:14:34.597648','2025-09-13 19:14:34.596647','Quiz 2',NULL,'OVERDUE'),('2025-09-13',15.00,76,38,'2025-09-13 21:21:14.402515','2025-09-13 21:21:16.886709','Assignment 1',NULL,'COMPLETED'),('2025-09-14',15.00,106,41,'2025-09-14 15:44:53.861233','2025-09-14 15:45:05.234664','Assignment 1',NULL,'COMPLETED'),('2025-09-14',15.00,107,42,'2025-09-14 15:44:56.311282','2025-09-14 15:45:09.694512','Quiz 1',NULL,'COMPLETED'),('2025-09-14',15.00,108,41,'2025-09-14 15:45:24.937991','2025-09-14 15:45:27.565446','Assignment 2',NULL,'COMPLETED'),('2025-09-30',100.00,109,43,'2025-09-14 15:46:13.688786','2025-09-14 16:14:32.210865','Exam 1',NULL,'COMPLETED'),('2025-09-14',25.00,110,42,'2025-09-14 15:46:17.467954','2025-09-14 15:46:20.129451','Quiz 2',NULL,'COMPLETED');
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
  `grading_scale` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gpa_scale` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_points` int DEFAULT '100',
  `handle_missing` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`),
  CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (85.00,2.70,3,_binary '',12,'2025-09-13 21:31:22.863663','2025-09-14 07:40:52.000000',1,'2025','1','Course 1',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',13,'2025-09-14 16:22:38.018659','2025-09-14 16:22:38.018659',1,'2025','CO102','Course Two',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude');
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
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-10',_binary '\0',100.00,25.00,25.00,5,'2025-09-10 12:16:28.072175',5,'2025-09-10 12:16:32.765933','','POINTS',NULL),('2025-09-10',_binary '\0',100.00,100.00,100.00,7,'2025-09-10 12:16:50.980509',7,'2025-09-10 12:16:54.027997','','POINTS',NULL),('2025-09-11',_binary '',100.00,15.00,15.00,16,'2025-09-11 12:20:08.803493',16,'2025-09-11 12:20:12.452313','','POINTS',15.00),('2025-09-11',_binary '',100.00,15.00,15.00,19,'2025-09-11 12:23:00.463900',19,'2025-09-11 12:23:09.411164','','POINTS',155.00),('2025-09-11',_binary '\0',100.00,15.00,15.00,20,'2025-09-11 12:23:17.318742',20,'2025-09-11 12:23:22.395957','','POINTS',NULL),('2025-09-11',_binary '',100.00,15.00,15.00,21,'2025-09-11 12:31:49.131926',21,'2025-09-11 12:31:53.209301','','POINTS',15.00),('2025-09-11',_binary '\0',100.00,15.00,15.00,26,'2025-09-11 13:17:14.498020',26,'2025-09-11 13:17:16.679971','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,39,'2025-09-13 05:16:44.751114',39,'2025-09-13 06:17:39.915832','','POINTS',NULL),('2025-09-13',_binary '\0',33.33,5.00,15.00,41,'2025-09-13 05:55:00.600870',41,'2025-09-13 06:21:50.081493','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,44,'2025-09-13 06:30:48.579848',44,'2025-09-13 06:31:10.709639','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,45,'2025-09-13 06:30:52.555574',45,'2025-09-13 06:35:43.188496','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,46,'2025-09-13 06:37:27.022943',46,'2025-09-13 07:55:52.559072','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,48,'2025-09-13 06:37:34.681719',48,'2025-09-13 07:56:14.142072','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,65,'2025-09-13 10:33:12.044369',65,'2025-09-13 10:33:15.319748','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,70,'2025-09-13 17:39:06.300358',70,'2025-09-13 17:39:09.060750','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,71,'2025-09-13 17:49:03.390939',71,'2025-09-13 17:49:05.420630','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,72,'2025-09-13 17:49:31.754907',72,'2025-09-13 17:49:34.532639','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,73,'2025-09-13 17:50:15.478107',73,'2025-09-13 17:50:17.850638','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,74,'2025-09-13 19:12:30.690685',74,'2025-09-13 19:12:33.040663','','POINTS',NULL),('2025-09-13',_binary '\0',0.00,0.00,15.00,75,'2025-09-13 19:14:34.598649',75,'2025-09-13 19:14:34.598649','','POINTS',NULL),('2025-09-13',_binary '\0',100.00,15.00,15.00,76,'2025-09-13 21:21:14.404517',76,'2025-09-13 21:21:16.886709','','POINTS',NULL),('2025-09-14',_binary '\0',100.00,15.00,15.00,106,'2025-09-14 15:44:53.864235',110,'2025-09-14 15:45:05.234664','','POINTS',NULL),('2025-09-14',_binary '\0',100.00,15.00,15.00,107,'2025-09-14 15:44:56.312283',111,'2025-09-14 15:45:09.694512','','POINTS',NULL),('2025-09-14',_binary '\0',33.33,5.00,15.00,108,'2025-09-14 15:45:24.939992',112,'2025-09-14 15:45:27.565446','','POINTS',NULL),('2025-09-30',_binary '\0',15.00,15.00,100.00,109,'2025-09-14 15:46:13.690787',113,'2025-09-14 16:14:32.210865','','POINTS',NULL),('2025-09-14',_binary '\0',52.00,13.00,25.00,110,'2025-09-14 15:46:17.470654',114,'2025-09-14 15:46:20.129451','','POINTS',NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
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
  PRIMARY KEY (`analytics_id`),
  KEY `idx_user_date` (`user_id`,`analytics_date`),
  KEY `idx_course_date` (`course_id`,`analytics_date`),
  CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_analytics_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (1,1,12,'2025-09-14',0.00,0.00,0,1,0.00,'{\"grade_trend\": 0, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 0}, \"time_management\": {\"most_productive_time\": \"unknown\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 0}, \"study_efficiency\": 0, \"category_performance\": {}, \"assignment_completion_rate\": 0}','2025-09-14 07:13:55'),(2,1,12,'2025-09-14',0.00,0.00,0,2,0.00,'{\"grade_trend\": 0, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 0}, \"time_management\": {\"most_productive_time\": \"unknown\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 0}, \"study_efficiency\": 0, \"category_performance\": {}, \"assignment_completion_rate\": 0}','2025-09-14 07:14:00'),(3,1,12,'2025-09-14',0.00,0.00,0,3,0.00,'{\"grade_trend\": 0, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 0}, \"time_management\": {\"most_productive_time\": \"unknown\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 0}, \"study_efficiency\": 0, \"category_performance\": {}, \"assignment_completion_rate\": 0}','2025-09-14 07:14:08'),(4,1,12,'2025-09-14',22.50,0.00,1,2,0.00,'{\"statistics\": {\"best\": 75, \"worst\": 75, \"average\": 75, \"total_assignments\": 3, \"standard_deviation\": 0, \"completed_assignments\": 1}, \"grade_trend\": 0, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 75}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 1}, \"study_efficiency\": 100, \"category_performance\": {\"Exam\": {\"count\": 0, \"weight\": 40, \"average\": 0}, \"Quizzes\": {\"count\": 0, \"weight\": 30, \"average\": 0}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 33.33333333333333}','2025-09-14 07:14:11'),(5,1,12,'2025-09-14',52.50,25.00,2,1,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 87.5, \"total_assignments\": 3, \"standard_deviation\": 12.5, \"completed_assignments\": 2}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 87.5}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 2}, \"study_efficiency\": 87.5, \"category_performance\": {\"Exam\": {\"count\": 0, \"weight\": 40, \"average\": 0}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 66.66666666666666}','2025-09-14 07:14:24'),(6,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:14:48'),(7,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:16:52'),(8,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:17:12'),(9,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:17:12'),(10,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:17:16'),(11,1,12,'2025-09-14',92.50,25.00,3,0,0.00,'{\"statistics\": {\"best\": 100, \"worst\": 75, \"average\": 91.66666666666669, \"total_assignments\": 3, \"standard_deviation\": 11.785113019775793, \"completed_assignments\": 3}, \"grade_trend\": 25, \"predictions\": {\"gpa_trend\": \"stable\", \"at_risk_categories\": [], \"final_grade_prediction\": 91.66666666666669}, \"time_management\": {\"most_productive_time\": \"evening\", \"avg_study_hours_per_day\": 0, \"study_sessions_completed\": 3}, \"study_efficiency\": 88.21488698022421, \"category_performance\": {\"Exam\": {\"count\": 1, \"weight\": 40, \"average\": 100}, \"Quizzes\": {\"count\": 1, \"weight\": 30, \"average\": 100}, \"Assignments\": {\"count\": 1, \"weight\": 30, \"average\": 75}}, \"assignment_completion_rate\": 100}','2025-09-14 07:17:16'),(12,1,12,'2025-09-14',52.00,0.00,3,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 52, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 3}',NULL),(13,1,12,'2025-09-14',52.00,0.00,3,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 52, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 3}',NULL),(14,1,12,'2025-09-14',2.70,0.00,4,0,0.00,NULL,'2025-09-14 15:37:52'),(15,1,12,'2025-09-14',48.25,0.00,4,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 48.25, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 4}',NULL),(16,1,12,'2025-09-14',2.70,0.00,4,0,0.00,NULL,'2025-09-14 15:37:57'),(17,1,12,'2025-09-14',50.20,0.00,4,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 50.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 4}',NULL),(18,1,12,'2025-09-14',50.20,0.00,4,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 50.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 4}',NULL),(19,1,12,'2025-09-14',52.00,0.00,3,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 52, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 3}',NULL),(20,1,12,'2025-09-14',47.50,0.00,2,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 47.5, \"completionRate\": 66.66666666666666, \"assignmentsPending\": 1, \"assignmentsCompleted\": 2}',NULL),(21,1,12,'2025-09-14',40.00,0.00,1,2,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 40, \"completionRate\": 33.33333333333333, \"assignmentsPending\": 2, \"assignmentsCompleted\": 1}',NULL),(22,1,12,'2025-09-14',0.00,0.00,0,3,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 0, \"completionRate\": 0, \"assignmentsPending\": 3, \"assignmentsCompleted\": 0}',NULL),(23,1,12,'2025-09-14',2.70,0.00,1,0,0.00,NULL,'2025-09-14 15:44:53'),(24,1,12,'2025-09-14',0.00,0.00,1,2,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 0, \"completionRate\": 33.33333333333333, \"assignmentsPending\": 2, \"assignmentsCompleted\": 1}',NULL),(25,1,12,'2025-09-14',2.70,0.00,2,0,0.00,NULL,'2025-09-14 15:44:56'),(26,1,12,'2025-09-14',0.00,0.00,2,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 0, \"completionRate\": 66.66666666666666, \"assignmentsPending\": 1, \"assignmentsCompleted\": 2}',NULL),(27,1,12,'2025-09-14',2.70,0.00,2,0,0.00,NULL,'2025-09-14 15:45:05'),(28,1,12,'2025-09-14',4.50,0.00,2,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 4.5, \"completionRate\": 66.66666666666666, \"assignmentsPending\": 1, \"assignmentsCompleted\": 2}',NULL),(29,1,12,'2025-09-14',2.70,0.00,2,0,0.00,NULL,'2025-09-14 15:45:09'),(30,1,12,'2025-09-14',9.00,0.00,2,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 9, \"completionRate\": 66.66666666666666, \"assignmentsPending\": 1, \"assignmentsCompleted\": 2}',NULL),(31,1,12,'2025-09-14',2.70,0.00,3,0,0.00,NULL,'2025-09-14 15:45:24'),(32,1,12,'2025-09-14',6.75,0.00,3,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 6.75, \"completionRate\": 75, \"assignmentsPending\": 1, \"assignmentsCompleted\": 3}',NULL),(33,1,12,'2025-09-14',2.70,0.00,3,0,0.00,NULL,'2025-09-14 15:45:27'),(34,1,12,'2025-09-14',7.50,0.00,3,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.5, \"completionRate\": 75, \"assignmentsPending\": 1, \"assignmentsCompleted\": 3}',NULL),(35,1,12,'2025-09-14',7.50,0.00,3,1,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.5, \"completionRate\": 75, \"assignmentsPending\": 1, \"assignmentsCompleted\": 3}',NULL),(36,1,12,'2025-09-14',2.70,0.00,4,0,0.00,NULL,'2025-09-14 15:46:13'),(37,1,12,'2025-09-14',7.50,0.00,4,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.5, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 4}',NULL),(38,1,12,'2025-09-14',2.70,0.00,5,0,0.00,NULL,'2025-09-14 15:46:17'),(39,1,12,'2025-09-14',5.25,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 5.25, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(40,1,12,'2025-09-14',2.70,0.00,5,0,0.00,NULL,'2025-09-14 15:46:20'),(41,1,12,'2025-09-14',7.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(42,1,12,'2025-09-14',7.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 0, \"currentGrade\": 7.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(43,1,12,'2025-09-14',7.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(44,1,12,'2025-09-14',7.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 7.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(45,1,12,'2025-09-15',2.70,-1.00,5,0,0.00,NULL,'2025-09-14 16:14:32'),(46,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(47,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(48,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(49,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(50,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 0, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL),(51,1,12,'2025-09-14',13.20,0.00,5,0,0.00,'{\"gradeTrend\": 0, \"targetGrade\": 4, \"currentGrade\": 13.2, \"completionRate\": 100, \"assignmentsPending\": 0, \"assignmentsCompleted\": 5}',NULL);
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
INSERT INTO `user_progress` VALUES (1,2,1,98,0,'2025-09-15',0,0.00,'2025-09-14 08:34:29',0);
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

-- Dump completed on 2025-09-15  0:36:35
