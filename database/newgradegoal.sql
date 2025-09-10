USE gradegoal;

-- Create users table first (no dependencies)
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

-- Insert users data
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '',_binary '','2025-09-10 09:04:04.376763',NULL,'2025-09-10 09:04:04.376763',1,NULL,'pinpinramirez@gmail.com','analiza','ramirez',NULL,'$2a$10$RqbiMzmgXINLw1pRpCNSausQs8cW5kIAR9osrGIyjZaIZLRPWBg0S','WEB');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- Create courses table (depends on users)
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
  `grading_scale` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
  `gpa_scale` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '4.0',
  `max_points` int DEFAULT '100',
  `handle_missing` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'exclude',
  PRIMARY KEY (`course_id`),
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`),
  CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Insert courses data
LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (0.00,0.00,6,_binary '',1,'2025-09-10 09:47:00.070123','2025-09-10 09:47:00.070123',1,'2025','CO101','Course One',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',2,'2025-09-10 11:36:27.120038','2025-09-10 11:37:28.665030',1,'2025','CO102','Course Two',NULL,'FIRST',1,'3-categories','percentage','4.0',100,'exclude'),(0.00,0.00,3,_binary '',5,'2025-09-10 12:16:16.618929','2025-09-10 12:16:16.618929',1,'2024','CO103','Course Three',NULL,'THIRD',4,'3-categories','percentage','4.0',100,'exclude');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

-- Create academic_goals table (depends on users and courses)
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
  PRIMARY KEY (`goal_id`),
  KEY `FKdtcq2dk59cvthkf4whgwy2aa8` (`course_id`),
  KEY `FKmhnd6knfsmobeir1nu2fwt9o0` (`user_id`),
  CONSTRAINT `FKdtcq2dk59cvthkf4whgwy2aa8` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `FKmhnd6knfsmobeir1nu2fwt9o0` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Insert academic_goals data
LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,100.00,NULL,'2025-09-10 10:36:23.631338',7,'2025-09-10 12:44:55.132921',1,NULL,'Target','SEMESTER_GPA','MEDIUM'),(NULL,_binary '\0','2025-09-30',100.00,1,'2025-09-10 11:31:40.900337',8,'2025-09-10 11:31:40.900337',1,'GALINGAN MO PA PLEASE!','Course One Target GPA','COURSE_GRADE','HIGH'),(NULL,_binary '\0','2025-09-12',85.00,2,'2025-09-10 11:38:02.644680',9,'2025-09-10 11:38:02.644680',1,NULL,'Course Two Target GPA','COURSE_GRADE','MEDIUM'),(NULL,_binary '\0','2026-06-20',100.00,NULL,'2025-09-10 11:39:53.744031',10,'2025-09-10 11:39:53.744031',1,NULL,'Target For Academic Year 2024-2025','CUMMULATIVE_GPA','HIGH');
/*!40000 ALTER TABLE `academic_goals` ENABLE KEYS */;
UNLOCK TABLES;

-- Create assessment_categories table (depends on courses)
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

-- Insert assessment_categories data
LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,1,1,'2025-09-10 09:47:00.162729','Assignments'),(1,30.00,2,1,'2025-09-10 09:47:00.178483','Quizzes'),(1,40.00,3,1,'2025-09-10 09:47:00.190504','Exam'),(1,30.00,4,2,'2025-09-10 11:36:27.140441','Assignments'),(1,30.00,5,2,'2025-09-10 11:36:27.154967','Quizzes'),(1,40.00,6,2,'2025-09-10 11:36:27.167731','Exam'),(1,30.00,7,3,'2025-09-10 11:46:15.637090','Assignments'),(1,30.00,8,3,'2025-09-10 11:46:15.646644','Quizzes'),(1,40.00,9,3,'2025-09-10 11:46:15.655123','Exam'),(1,30.00,10,4,'2025-09-10 12:03:59.816304','Assignments'),(1,30.00,11,4,'2025-09-10 12:03:59.824957','Quizzes'),(1,40.00,12,4,'2025-09-10 12:03:59.833879','Exam'),(1,30.00,13,5,'2025-09-10 12:16:16.628981','Assignments'),(1,30.00,14,5,'2025-09-10 12:16:16.639023','Quizzes'),(1,40.00,15,5,'2025-09-10 12:16:16.647901','Exam');
/*!40000 ALTER TABLE `assessment_categories` ENABLE KEYS */;
UNLOCK TABLES;

-- Create assessments table (depends on assessment_categories)
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Insert assessments data
LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-10',25.00,1,1,'2025-09-10 11:00:24.025921','2025-09-10 11:00:28.830611','Assignment 1',NULL,'COMPLETED'),('2025-09-10',20.00,2,2,'2025-09-10 11:00:42.140505','2025-09-10 11:00:46.897552','Quiz 1',NULL,'COMPLETED'),('2025-09-10',100.00,3,3,'2025-09-10 11:00:55.224529','2025-09-10 11:00:59.103373','Exam ',NULL,'COMPLETED'),('2025-09-10',25.00,4,4,'2025-09-10 11:37:04.234404','2025-09-10 11:37:07.675609','Assignment ',NULL,'COMPLETED'),('2025-09-10',25.00,5,13,'2025-09-10 12:16:28.070645','2025-09-10 12:16:32.765933','Assignment 1',NULL,'COMPLETED'),('2025-09-10',25.00,6,14,'2025-09-10 12:16:39.968092','2025-09-10 12:16:43.630219','Quiz 1',NULL,'COMPLETED'),('2025-09-10',100.00,7,15,'2025-09-10 12:16:50.978999','2025-09-10 12:16:54.027997','Exam ',NULL,'COMPLETED');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

-- Create grades table (depends on assessments)
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Insert grades data
LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-10',_binary '\0',100.00,25.00,25.00,1,'2025-09-10 11:00:24.037069',1,'2025-09-10 11:00:28.832632','','POINTS',NULL),('2025-09-10',_binary '\0',100.00,20.00,20.00,2,'2025-09-10 11:00:42.142507',2,'2025-09-10 11:00:46.898562','','POINTS',NULL),('2025-09-10',_binary '\0',65.00,65.00,100.00,3,'2025-09-10 11:00:55.225692',3,'2025-09-10 11:00:59.103373','','POINTS',NULL),('2025-09-10',_binary '\0',80.00,20.00,25.00,4,'2025-09-10 11:37:04.236421',4,'2025-09-10 11:37:07.675609','','POINTS',NULL),('2025-09-10',_binary '\0',100.00,25.00,25.00,5,'2025-09-10 12:16:28.072175',5,'2025-09-10 12:16:32.765933','','POINTS',NULL),('2025-09-10',_binary '\0',100.00,25.00,25.00,6,'2025-09-10 12:16:39.970626',6,'2025-09-10 12:16:43.630219','','POINTS',NULL),('2025-09-10',_binary '\0',100.00,100.00,100.00,7,'2025-09-10 12:16:50.980509',7,'2025-09-10 12:16:54.027997','','POINTS',NULL);
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

-- Session variables restored

-- Dump completed on 2025-09-10 22:45:19
