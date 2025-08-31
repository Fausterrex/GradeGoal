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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Assignments',30,1,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(2,'Quizzes',20,1,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(3,'Midterm Exam',25,1,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(4,'Final Exam',25,1,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(5,'Assignments',25,2,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(6,'Quizzes',15,2,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(7,'Projects',30,2,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(8,'Final Exam',30,2,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(9,'First Term',30,3,'Sun Aug 31 16:52:24 GMT+08:00 2025','Sun Aug 31 16:52:24 GMT+08:00 2025'),(10,'Midterm',30,3,'Sun Aug 31 16:52:24 GMT+08:00 2025','Sun Aug 31 16:52:24 GMT+08:00 2025'),(11,'Final Term',40,3,'Sun Aug 31 16:52:24 GMT+08:00 2025','Sun Aug 31 16:52:24 GMT+08:00 2025');
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
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_course_name` (`name`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'test_user_123','SYSTEM INTEGRATION','percentage',100,'4.0','4-term','2025-08-31 16:49:46','2025-08-31 16:49:46'),(2,'test_user_123','DATABASE SYSTEM','percentage',100,'4.0','4-term','2025-08-31 16:49:46','2025-08-31 16:49:46'),(3,'2wv7qM7mcsMmRAbWPp7eRgrPTE42','Database','percentage',100,'4.0','3-term','Sun Aug 31 16:52:23 GMT+08:00 2025','Sun Aug 31 16:52:23 GMT+08:00 2025');
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
INSERT INTO `goals` VALUES (1,'test_user_123','SYSTEM INTEGRATION','Achieve A Grade','Maintain at least 90% in System Integration',90,'2024-05-01','active','2025-08-31 16:49:46','2025-08-31 16:49:46'),(2,'test_user_123','DATABASE SYSTEM','Maintain B+ Average','Keep grade above 87% in Database System',87,'2024-05-01','active','2025-08-31 16:49:46','2025-08-31 16:49:46');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,'Assignment 1',100,85,'2024-01-15','assignment',0,0,1,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(2,'Quiz 1',50,42,'2024-01-20','quiz',0,0,2,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(3,'Assignment 1',100,92,'2024-01-10','assignment',0,0,5,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(4,'Assignment 2',100,88,'2024-01-25','assignment',0,0,5,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(5,'Quiz 1',50,45,'2024-01-15','quiz',0,0,6,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(6,'Project 1',100,95,'2024-02-01','project',0,0,7,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(7,'Final Exam',100,89,'2024-02-15','exam',0,0,8,'2025-08-31 16:49:46','2025-08-31 16:49:46'),(8,'2',12,12,'2025-08-31','assignment',0,0,9,'Sun Aug 31 16:55:07 GMT+08:00 2025','Sun Aug 31 16:55:09 GMT+08:00 2025');
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

-- Dump completed on 2025-08-31 16:57:27
