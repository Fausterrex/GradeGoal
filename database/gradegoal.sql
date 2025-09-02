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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` double NOT NULL,
  `course_id` bigint NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_category_name` (`name`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (87,'Assignments',30,29,'Tue Sep 02 06:12:03 GMT+08:00 2025','Tue Sep 02 06:12:03 GMT+08:00 2025'),(88,'Quizzes',30,29,'Tue Sep 02 06:12:03 GMT+08:00 2025','Tue Sep 02 06:12:03 GMT+08:00 2025'),(89,'Exam',40,29,'Tue Sep 02 06:12:03 GMT+08:00 2025','Tue Sep 02 06:12:03 GMT+08:00 2025'),(90,'Assignments',30,30,'Tue Sep 02 07:39:52 GMT+08:00 2025','Tue Sep 02 07:39:52 GMT+08:00 2025'),(91,'Quizzes',30,30,'Tue Sep 02 07:39:52 GMT+08:00 2025','Tue Sep 02 07:39:52 GMT+08:00 2025'),(92,'Exam',40,30,'Tue Sep 02 07:39:52 GMT+08:00 2025','Tue Sep 02 07:39:52 GMT+08:00 2025'),(93,'Assignments',30,31,'Tue Sep 02 07:49:36 GMT+08:00 2025','Tue Sep 02 07:49:36 GMT+08:00 2025'),(94,'Quizzes',30,31,'Tue Sep 02 07:49:36 GMT+08:00 2025','Tue Sep 02 07:49:36 GMT+08:00 2025'),(95,'Exam',40,31,'Tue Sep 02 07:49:36 GMT+08:00 2025','Tue Sep 02 07:49:36 GMT+08:00 2025'),(96,'Assignments',30,32,'Tue Sep 02 08:08:25 GMT+08:00 2025','Tue Sep 02 08:08:25 GMT+08:00 2025'),(97,'Quizzes',30,32,'Tue Sep 02 08:08:25 GMT+08:00 2025','Tue Sep 02 08:08:25 GMT+08:00 2025'),(98,'Exam',40,32,'Tue Sep 02 08:08:25 GMT+08:00 2025','Tue Sep 02 08:08:25 GMT+08:00 2025');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grading_scale` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_points` double NOT NULL,
  `gpa_scale` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `term_system` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_index` int DEFAULT '0',
  `target_grade` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archived_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_archived` bit(1) DEFAULT NULL,
  `units` int DEFAULT '3' COMMENT 'Course units (e.g., 3 units)',
  `credit_hours` int DEFAULT '3' COMMENT 'Course credit hours (e.g., 3 credit hours)',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_course_name` (`name`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (29,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','Course Two','percentage',100,'4.0','3-term','Tue Sep 02 06:12:03 GMT+08:00 2025','Tue Sep 02 07:35:06 GMT+08:00 2025',0,'95','CO102','Tue Sep 02 07:35:06 GMT+08:00 2025',_binary '',3,6),(30,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','Course One','percentage',100,'4.0','3-term','Tue Sep 02 07:39:52 GMT+08:00 2025','Tue Sep 02 07:39:52 GMT+08:00 2025',0,'95','CO101',NULL,_binary '\0',3,3),(31,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','Course Three','percentage',100,'4.0','3-term','Tue Sep 02 07:49:36 GMT+08:00 2025','Tue Sep 02 07:49:36 GMT+08:00 2025',2,'','CT103',NULL,_binary '\0',3,3),(32,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','Course Four','percentage',100,'4.0','3-term','Tue Sep 02 08:08:25 GMT+08:00 2025','Tue Sep 02 08:08:25 GMT+08:00 2025',4,'95','CF104',NULL,_binary '\0',3,3);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_grade` double NOT NULL,
  `target_date` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_score` double NOT NULL,
  `score` double DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_extra_credit` tinyint(1) NOT NULL DEFAULT '0',
  `extra_credit_points` double NOT NULL DEFAULT '0',
  `category_id` bigint NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_assessment_type` (`assessment_type`),
  KEY `idx_score` (`score`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (49,'Assignment 1',15,15,'2025-09-01','assignment',0,0,87,'Tue Sep 02 06:13:25 GMT+08:00 2025','Tue Sep 02 07:34:32 GMT+08:00 2025'),(50,'Quiz',14,13,'2025-09-01','quiz',0,0,88,'Tue Sep 02 07:34:39 GMT+08:00 2025','Tue Sep 02 07:34:41 GMT+08:00 2025'),(51,'Quiz',100,50,'2025-09-01','exam',0,0,89,'Tue Sep 02 07:34:49 GMT+08:00 2025','Tue Sep 02 07:34:54 GMT+08:00 2025'),(52,'Assignment',15,13,'2025-09-01','assignment',0,0,90,'Tue Sep 02 07:40:00 GMT+08:00 2025','Tue Sep 02 07:40:07 GMT+08:00 2025'),(53,'Quiz',15,11,'2025-09-01','quiz',0,0,91,'Tue Sep 02 07:40:04 GMT+08:00 2025','Tue Sep 02 07:40:09 GMT+08:00 2025'),(54,'Exam',100,80,'2025-09-01','exam',0,0,92,'Tue Sep 02 07:40:16 GMT+08:00 2025','Tue Sep 02 07:40:21 GMT+08:00 2025'),(55,'Assignment 1',15,1,'2025-09-02','assignment',0,0,96,'Tue Sep 02 08:08:40 GMT+08:00 2025','Tue Sep 02 08:09:01 GMT+08:00 2025'),(56,'Quiz 1',15,1,'2025-09-02','quiz',0,0,97,'Tue Sep 02 08:08:45 GMT+08:00 2025','Tue Sep 02 08:09:05 GMT+08:00 2025'),(57,'Exam 1',150,1,'2025-09-02','exam',0,0,98,'Tue Sep 02 08:08:56 GMT+08:00 2025','Tue Sep 02 08:08:59 GMT+08:00 2025');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_uid` (`uid`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test_user_123','test@example.com','Test User'),(2,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','pinpinramirez@gmail.com','analiza ramirez');
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

-- Dump completed on 2025-09-02  8:11:57
