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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_goals`
--

LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,95.50,1,'2025-10-20 06:48:43.504591',1,'2025-10-20 06:48:43.504591',2,NULL,'Database GPA GOAL','COURSE_GRADE','MEDIUM','2025',NULL);
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
  `icon_url` varchar(255) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'First Steps','Welcome to GradeGoal! Complete your profile setup.',NULL,'CONSISTENCY',5,'COMMON','{\"action\": \"profile_complete\"}',1,'2025-09-13 22:48:10'),(2,'Grade Entry Rookie','Enter your first 5 grades.',NULL,'ACADEMIC',5,'COMMON','{\"grades_entered\": 5}',1,'2025-09-13 22:48:10'),(3,'Streak Starter','Maintain a 3-day login streak.',NULL,'CONSISTENCY',5,'COMMON','{\"streak_days\": 3}',1,'2025-09-13 22:48:10'),(4,'Week Warrior','Maintain a 7-day login streak.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"streak_days\": 7}',1,'2025-09-13 22:48:10'),(5,'Goal Setter','Create your first academic goal.',NULL,'GOAL',5,'COMMON','{\"goals_created\": 1}',1,'2025-09-13 22:48:10'),(6,'Goal Crusher','Achieve your first academic goal.',NULL,'GOAL',20,'UNCOMMON','{\"goals_achieved\": 1}',1,'2025-09-13 22:48:10'),(7,'A+ Student','Achieve a grade of 95% or higher.',NULL,'ACADEMIC',20,'UNCOMMON','{\"grade_threshold\": 95}',1,'2025-09-13 22:48:10'),(8,'Dean\'s List','Achieve your semester goal with a 3.5+ GPA target.',NULL,'ACADEMIC',35,'RARE','{\"goal_type\": \"GPA\", \"target_value\": 3.5, \"semester_goal_achieved\": true}',1,'2025-09-13 22:48:10'),(9,'Perfect Scholar','Achieve your semester goal with a perfect 4.0 GPA target.',NULL,'ACADEMIC',90,'LEGENDARY','{\"goal_type\": \"GPA\", \"target_value\": 4.0, \"semester_goal_achieved\": true}',1,'2025-09-13 22:48:10'),(10,'Improvement Champion','Improve your grade by 10+ points in any course.',NULL,'IMPROVEMENT',20,'UNCOMMON','{\"grade_improvement\": 10}',1,'2025-09-13 22:48:10'),(11,'Consistency King','Maintain a 30-day login streak.',NULL,'CONSISTENCY',35,'RARE','{\"streak_days\": 30}',1,'2025-09-13 22:48:10'),(12,'Data Master','Export your first academic report.',NULL,'ACADEMIC',5,'COMMON','{\"exports_created\": 1}',1,'2025-09-13 22:48:10'),(13,'Calendar Sync Pro','Sync 10 assignments to your calendar.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"calendar_syncs\": 10}',1,'2025-09-13 22:48:10'),(14,'Level Up Legend','Reach level 10.',NULL,'CONSISTENCY',50,'EPIC','{\"level_reached\": 10}',1,'2025-09-13 22:48:10'),(15,'Points Collector','Accumulate 5,000 total points.',NULL,'CONSISTENCY',35,'RARE','{\"total_points\": 5000}',1,'2025-09-13 22:48:10'),(17,'Level 5','Reach level 5 and unlock new possibilities!',NULL,'CONSISTENCY',5,'COMMON','{\"level_reached\": 5}',1,'2025-10-01 13:28:56'),(18,'Level 10','Reach level 10 - you\'re getting the hang of this!',NULL,'CONSISTENCY',5,'COMMON','{\"level_reached\": 10}',1,'2025-10-01 13:28:56'),(19,'Level 15','Reach level 15 - consistency is key!',NULL,'CONSISTENCY',5,'COMMON','{\"level_reached\": 15}',1,'2025-10-01 13:28:56'),(20,'Level 20','Reach level 20 - quarter of the way to mastery!',NULL,'CONSISTENCY',10,'UNCOMMON','{\"level_reached\": 20}',1,'2025-10-01 13:28:56'),(21,'Level 25','Reach level 25 - you\'re a dedicated student!',NULL,'CONSISTENCY',10,'UNCOMMON','{\"level_reached\": 25}',1,'2025-10-01 13:28:56'),(22,'Level 30','Reach level 30 - halfway to legendary status!',NULL,'CONSISTENCY',10,'UNCOMMON','{\"level_reached\": 30}',1,'2025-10-01 13:28:56'),(23,'Level 35','Reach level 35 - your dedication shows!',NULL,'CONSISTENCY',10,'UNCOMMON','{\"level_reached\": 35}',1,'2025-10-01 13:28:56'),(24,'Level 40','Reach level 40 - academic excellence in progress!',NULL,'CONSISTENCY',20,'RARE','{\"level_reached\": 40}',1,'2025-10-01 13:28:56'),(25,'Level 45','Reach level 45 - almost at the top tier!',NULL,'CONSISTENCY',20,'RARE','{\"level_reached\": 45}',1,'2025-10-01 13:28:56'),(26,'Level 50','Reach level 50 - you\'re a GradeGoal veteran!',NULL,'CONSISTENCY',20,'RARE','{\"level_reached\": 50}',1,'2025-10-01 13:28:56'),(27,'Level 55','Reach level 55 - exceptional dedication!',NULL,'CONSISTENCY',20,'RARE','{\"level_reached\": 55}',1,'2025-10-01 13:28:56'),(28,'Level 60','Reach level 60 - academic mastery approaches!',NULL,'CONSISTENCY',50,'EPIC','{\"level_reached\": 60}',1,'2025-10-01 13:28:56'),(29,'Level 65','Reach level 65 - you\'re in elite territory!',NULL,'CONSISTENCY',50,'EPIC','{\"level_reached\": 65}',1,'2025-10-01 13:28:56'),(30,'Level 70','Reach level 70 - legendary status awaits!',NULL,'CONSISTENCY',50,'EPIC','{\"level_reached\": 70}',1,'2025-10-01 13:28:56'),(31,'Level 75','Reach level 75 - you\'re a GradeGoal legend!',NULL,'CONSISTENCY',50,'EPIC','{\"level_reached\": 75}',1,'2025-10-01 13:28:56'),(32,'Level 80','Reach level 80 - among the greatest students!',NULL,'CONSISTENCY',100,'LEGENDARY','{\"level_reached\": 80}',1,'2025-10-01 13:28:56'),(33,'Level 85','Reach level 85 - academic excellence personified!',NULL,'CONSISTENCY',100,'LEGENDARY','{\"level_reached\": 85}',1,'2025-10-01 13:28:56'),(34,'Level 90','Reach level 90 - you\'re a GradeGoal master!',NULL,'CONSISTENCY',100,'LEGENDARY','{\"level_reached\": 90}',1,'2025-10-01 13:28:56'),(35,'Level 95','Reach level 95 - almost at the pinnacle!',NULL,'CONSISTENCY',100,'LEGENDARY','{\"level_reached\": 95}',1,'2025-10-01 13:28:56'),(36,'Level 100','Reach level 100 - the ultimate GradeGoal champion!',NULL,'CONSISTENCY',100,'LEGENDARY','{\"level_reached\": 100}',1,'2025-10-01 13:28:56'),(37,'Straight A Student','Achieve all A grades in a semester.',NULL,'ACADEMIC',35,'RARE','{\"all_grades_a\": true, \"semester_complete\": true}',1,'2025-10-01 13:28:56'),(38,'Honor Roll','Maintain a 3.7+ GPA for 2 consecutive semesters.',NULL,'ACADEMIC',35,'RARE','{\"semesters_count\": 2, \"consecutive_semester_gpa\": 3.7}',1,'2025-10-01 13:28:56'),(39,'Academic Excellence','Achieve a 3.9+ GPA in any semester.',NULL,'ACADEMIC',35,'RARE','{\"semester_gpa_threshold\": 3.9}',1,'2025-10-01 13:28:56'),(40,'Grade Improvement Master','Improve your GPA by 0.5+ points in a semester.',NULL,'IMPROVEMENT',25,'UNCOMMON','{\"gpa_improvement\": 0.5}',1,'2025-10-01 13:28:56'),(41,'Perfect Score','Achieve 100% on any assessment.',NULL,'ACADEMIC',20,'UNCOMMON','{\"perfect_score\": true}',1,'2025-10-01 13:28:56'),(42,'Consistent Performer','Achieve 90%+ on 10 consecutive assessments.',NULL,'ACADEMIC',35,'RARE','{\"score_threshold\": 90, \"consecutive_high_scores\": 10}',1,'2025-10-01 13:28:56'),(43,'Comeback Kid','Improve a failing grade to a passing grade.',NULL,'IMPROVEMENT',5,'COMMON','{\"grade_recovery\": true}',1,'2025-10-01 13:28:56'),(44,'Academic Streak','Maintain 85%+ average for 5 consecutive assessments.',NULL,'ACADEMIC',20,'UNCOMMON','{\"average_threshold\": 85, \"consecutive_assessments\": 5}',1,'2025-10-01 13:28:56'),(45,'Course Master','Complete a course with 95%+ average.',NULL,'ACADEMIC',35,'RARE','{\"course_average\": 95, \"course_completion\": true}',1,'2025-10-01 13:28:56'),(46,'Subject Specialist','Complete 5 courses in the same subject area.',NULL,'ACADEMIC',35,'RARE','{\"courses_same_subject\": 5}',1,'2025-10-01 13:28:56'),(47,'Semester Warrior','Complete 6+ courses in a single semester.',NULL,'ACADEMIC',65,'EPIC','{\"courses_per_semester\": 6}',1,'2025-10-01 13:28:56'),(48,'Early Bird','Complete all assignments 2+ days before due date.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"days_ahead\": 2, \"early_submissions\": true}',1,'2025-10-01 13:28:56'),(49,'Assessment Ace','Score 90%+ on 20 different assessments.',NULL,'ACADEMIC',35,'RARE','{\"score_threshold\": 90, \"high_score_assessments\": 20}',1,'2025-10-01 13:28:56'),(50,'Quiz Master','Score 95%+ on 15 quizzes.',NULL,'ACADEMIC',20,'UNCOMMON','{\"quiz_scores\": 15, \"score_threshold\": 95}',1,'2025-10-01 13:28:56'),(51,'Exam Expert','Score 90%+ on 10 exams.',NULL,'ACADEMIC',35,'RARE','{\"exam_scores\": 10, \"score_threshold\": 90}',1,'2025-10-01 13:28:56'),(52,'Project Pro','Score 95%+ on 5 major projects.',NULL,'ACADEMIC',35,'RARE','{\"project_scores\": 5, \"score_threshold\": 95}',1,'2025-10-01 13:28:56'),(53,'Homework Hero','Complete 50 homework assignments with 90%+ average.',NULL,'CONSISTENCY',25,'UNCOMMON','{\"homework_count\": 50, \"average_threshold\": 90}',1,'2025-10-01 13:28:56'),(54,'Goal Master','Set and achieve 10 academic goals.',NULL,'GOAL',35,'RARE','{\"goals_achieved\": 10}',1,'2025-10-01 13:28:56'),(55,'Goal Strategist','Set 20 different academic goals.',NULL,'GOAL',25,'UNCOMMON','{\"goals_created\": 20}',1,'2025-10-01 13:28:56'),(56,'Goal Achiever','Achieve 5 goals in a single semester.',NULL,'GOAL',35,'RARE','{\"semester_goals_achieved\": 5}',1,'2025-10-01 13:28:56'),(57,'Long-term Planner','Set a goal with a target date 6+ months away.',NULL,'GOAL',5,'COMMON','{\"months_ahead\": 6, \"long_term_goal\": true}',1,'2025-10-01 13:28:56'),(58,'Goal Streak','Achieve goals for 3 consecutive semesters.',NULL,'GOAL',65,'EPIC','{\"consecutive_semester_goals\": 3}',1,'2025-10-01 13:28:56'),(59,'Ambitious Achiever','Set a goal with 90%+ target value.',NULL,'GOAL',20,'UNCOMMON','{\"ambitious_goal\": true, \"target_threshold\": 90}',1,'2025-10-01 13:28:56'),(60,'Realistic Planner','Achieve 80%+ of your set goals.',NULL,'GOAL',35,'RARE','{\"goal_success_rate\": 80}',1,'2025-10-01 13:28:56'),(61,'Goal Revisionist','Update and improve 5 existing goals.',NULL,'GOAL',20,'UNCOMMON','{\"goals_updated\": 5}',1,'2025-10-01 13:28:56'),(62,'Month Master','Maintain a 30-day login streak.',NULL,'CONSISTENCY',35,'RARE','{\"streak_days\": 30}',1,'2025-10-01 13:28:57'),(63,'Quarter Champion','Maintain a 90-day login streak.',NULL,'CONSISTENCY',65,'EPIC','{\"streak_days\": 90}',1,'2025-10-01 13:28:57'),(64,'Year Warrior','Maintain a 365-day login streak.',NULL,'CONSISTENCY',110,'LEGENDARY','{\"streak_days\": 365}',1,'2025-10-01 13:28:57'),(65,'Daily Dedication','Log in for 100 days (not necessarily consecutive).',NULL,'CONSISTENCY',25,'UNCOMMON','{\"total_login_days\": 100}',1,'2025-10-01 13:28:57'),(66,'Weekend Warrior','Log in on 20 weekends.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"weekend_logins\": 20}',1,'2025-10-01 13:28:57'),(67,'Early Riser','Log in before 8 AM for 30 days.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"early_logins\": 30}',1,'2025-10-01 13:28:57'),(68,'Night Owl','Log in after 10 PM for 30 days.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"late_logins\": 30}',1,'2025-10-01 13:28:57'),(69,'Data Entry Expert','Enter grades for 100 days.',NULL,'CONSISTENCY',25,'UNCOMMON','{\"grade_entry_days\": 100}',1,'2025-10-01 13:28:57'),(70,'Calendar Consistency','Sync assignments for 50 days.',NULL,'CONSISTENCY',20,'UNCOMMON','{\"calendar_sync_days\": 50}',1,'2025-10-01 13:28:57'),(71,'Report Regular','Generate reports for 12 months.',NULL,'CONSISTENCY',35,'RARE','{\"monthly_reports\": 12}',1,'2025-10-01 13:28:57'),(72,'Profile Perfectionist','Update your profile 10 times.',NULL,'CONSISTENCY',5,'COMMON','{\"profile_updates\": 10}',1,'2025-10-01 13:28:57'),(73,'Rising Star','Improve your semester GPA by 0.3+ points.',NULL,'IMPROVEMENT',20,'UNCOMMON','{\"semester_gpa_improvement\": 0.3}',1,'2025-10-01 13:28:57'),(74,'Academic Phoenix','Improve your cumulative GPA by 0.5+ points.',NULL,'IMPROVEMENT',35,'RARE','{\"cumulative_gpa_improvement\": 0.5}',1,'2025-10-01 13:28:57'),(75,'Grade Grinder','Improve 5 different course grades by 10+ points.',NULL,'IMPROVEMENT',35,'RARE','{\"courses_improved\": 5, \"improvement_threshold\": 10}',1,'2025-10-01 13:28:57'),(76,'Consistent Improver','Improve grades in 3 consecutive semesters.',NULL,'IMPROVEMENT',65,'EPIC','{\"consecutive_semester_improvement\": 3}',1,'2025-10-01 13:28:57'),(77,'Turnaround Specialist','Improve a D grade to an A grade.',NULL,'IMPROVEMENT',35,'RARE','{\"grade_turnaround\": \"D_to_A\"}',1,'2025-10-01 13:28:57'),(78,'Steady Climber','Improve your average by 5+ points over 10 assessments.',NULL,'IMPROVEMENT',20,'UNCOMMON','{\"assessment_count\": 10, \"assessment_improvement\": 5}',1,'2025-10-01 13:28:57'),(79,'Late Bloomer','Achieve your best semester in your final year.',NULL,'IMPROVEMENT',35,'RARE','{\"final_year_best\": true}',1,'2025-10-01 13:28:57'),(80,'Progress Tracker','Track improvement in 10 different courses.',NULL,'IMPROVEMENT',25,'UNCOMMON','{\"courses_tracked\": 10}',1,'2025-10-01 13:28:57'),(81,'Sharing Scholar','Share your academic progress 10 times.',NULL,'SOCIAL',5,'COMMON','{\"progress_shares\": 10}',1,'2025-10-01 13:28:57'),(82,'Mentor Material','Help 5 other students with academic advice.',NULL,'SOCIAL',25,'UNCOMMON','{\"students_helped\": 5}',1,'2025-10-01 13:28:57'),(83,'Study Buddy','Collaborate on 3 group projects.',NULL,'SOCIAL',20,'UNCOMMON','{\"group_projects\": 3}',1,'2025-10-01 13:28:57'),(84,'Academic Influencer','Have your study tips shared 20 times.',NULL,'SOCIAL',35,'RARE','{\"tips_shared\": 20}',1,'2025-10-01 13:28:57'),(85,'Community Builder','Participate in 10 academic discussions.',NULL,'SOCIAL',20,'UNCOMMON','{\"discussions_participated\": 10}',1,'2025-10-01 13:28:57'),(86,'Century Scholar','Accumulate 10,000 total points.',NULL,'CONSISTENCY',65,'EPIC','{\"total_points\": 10000}',1,'2025-10-01 13:28:57'),(87,'Mega Points','Accumulate 25,000 total points.',NULL,'CONSISTENCY',90,'LEGENDARY','{\"total_points\": 25000}',1,'2025-10-01 13:28:57'),(88,'Ultimate Points','Accumulate 50,000 total points.',NULL,'CONSISTENCY',110,'LEGENDARY','{\"total_points\": 50000}',1,'2025-10-01 13:28:57'),(89,'GradeGoal Veteran','Use GradeGoal for 2+ years.',NULL,'CONSISTENCY',65,'EPIC','{\"years_active\": 2}',1,'2025-10-01 13:28:57'),(90,'GradeGoal Legend','Use GradeGoal for 5+ years.',NULL,'CONSISTENCY',110,'LEGENDARY','{\"years_active\": 5}',1,'2025-10-01 13:28:57'),(91,'All Categories Master','Earn achievements in all 5 categories.',NULL,'CONSISTENCY',90,'LEGENDARY','{\"all_categories\": true}',1,'2025-10-01 13:28:57'),(92,'Achievement Hunter','Earn 50 different achievements.',NULL,'CONSISTENCY',65,'EPIC','{\"achievements_earned\": 50}',1,'2025-10-01 13:28:57'),(93,'Ultimate Achiever','Earn 100 different achievements.',NULL,'CONSISTENCY',110,'LEGENDARY','{\"achievements_earned\": 100}',1,'2025-10-01 13:28:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,1,1,'2025-10-20 06:45:55.750977','Assignments'),(1,30.00,2,1,'2025-10-20 06:45:55.768870','Quizzes'),(1,40.00,3,1,'2025-10-20 06:45:55.780884','Exam');
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
  `semester_term` enum('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MIDTERM' COMMENT 'Whether this assessment belongs to midterm or final term',
  PRIMARY KEY (`assessment_id`),
  KEY `FK4kbcb2x7nlbys293dd0vjysdm` (`category_id`),
  KEY `idx_semester_term` (`semester_term`),
  CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-10-01',15.00,1,1,'2025-10-20 06:48:54.100677','2025-10-20 14:57:45.000000','Assignment 1',NULL,'COMPLETED','MIDTERM'),('2025-10-09',25.00,2,2,'2025-10-20 06:49:10.938861','2025-10-20 14:57:45.000000','Quiz 1',NULL,'COMPLETED','MIDTERM'),('2025-10-15',15.00,3,2,'2025-10-20 06:49:23.296190','2025-10-20 14:57:45.000000','Quiz 2',NULL,'COMPLETED','MIDTERM'),('2025-10-31',100.00,4,3,'2025-10-20 06:49:36.625721','2025-10-20 14:57:45.000000','Exam 1',NULL,'COMPLETED','MIDTERM'),('2025-10-23',25.00,5,2,'2025-10-20 06:49:52.637709','2025-10-20 14:57:45.000000','Quiz 3',NULL,'COMPLETED','MIDTERM'),('2025-10-20',15.00,6,1,'2025-10-20 07:38:44.855614','2025-10-20 07:38:44.852612','Assignment 2',NULL,'COMPLETED','FINAL_TERM'),('2025-10-22',25.00,7,2,'2025-10-20 12:09:03.550771','2025-10-20 12:09:03.549771','Quiz 4',NULL,'COMPLETED','FINAL_TERM'),('2025-10-20',15.00,8,2,'2025-10-20 12:09:16.445585','2025-10-20 12:09:16.445585','Quiz 5',NULL,'COMPLETED','FINAL_TERM'),('2025-10-29',100.00,9,3,'2025-10-20 12:09:28.349512','2025-10-20 12:09:28.349512','Exam 2',NULL,'UPCOMING','FINAL_TERM');
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
  `event_title` varchar(255) NOT NULL,
  `event_start` datetime NOT NULL,
  `event_end` datetime NOT NULL,
  `event_date` datetime(6) NOT NULL,
  `description` text,
  `reminder_enabled` bit(1) NOT NULL DEFAULT b'1',
  `reminder_days` int NOT NULL DEFAULT '1',
  `event_type` varchar(50) NOT NULL DEFAULT 'CUSTOM_EVENT',
  `is_notified` bit(1) NOT NULL DEFAULT b'0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `idx_user_date` (`user_id`,`event_start`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_reminder_enabled` (`reminder_enabled`),
  KEY `idx_is_notified` (`is_notified`),
  KEY `calendar_events_ibfk_2` (`assessment_id`),
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
  `is_completed` bit(1) DEFAULT b'0' COMMENT 'Whether the course has been manually marked as complete',
  `year_level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creation_year_level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_midterm_completed` bit(1) DEFAULT b'0' COMMENT 'Whether the midterm period has been completed for this course',
  `ai_prediction_rating` int DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`),
  KEY `idx_courses_year_level` (`year_level`),
  KEY `idx_is_midterm_completed` (`is_midterm_completed`),
  CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `chk_ai_prediction_rating` CHECK (((`ai_prediction_rating` is null) or ((`ai_prediction_rating` >= 1) and (`ai_prediction_rating` <= 10))))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (70.53,1.50,3,_binary '',1,'2025-10-20 06:45:55.728821','2025-10-20 12:09:22.262660',2,'2025','DB1','Database',NULL,'FIRST',1,'3-categories','percentage','4.0',100,'exclude',_binary '\0','1st year','1',_binary '',NULL);
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
  `export_type` enum('ADMIN_OVERVIEW','CSV_GRADES','JSON_BACKUP','PDF_REPORT','TRANSCRIPT') NOT NULL,
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
  `semester_term` enum('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MIDTERM' COMMENT 'Which semester term this grade belongs to',
  PRIMARY KEY (`grade_id`),
  KEY `FKr3vxme485so9o2jlqhtbdu85x` (`assessment_id`),
  KEY `idx_grades_semester_term` (`semester_term`),
  CONSTRAINT `FKr3vxme485so9o2jlqhtbdu85x` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-10-01',_binary '\0',100.00,15.00,15.00,1,'2025-10-20 06:48:54.113198',1,'2025-10-20 14:48:57.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-09',_binary '\0',72.00,18.00,25.00,2,'2025-10-20 06:49:10.945403',2,'2025-10-20 14:49:15.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-15',_binary '\0',93.33,14.00,15.00,3,'2025-10-20 06:49:23.302195',3,'2025-10-20 14:49:26.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-31',_binary '\0',87.00,87.00,100.00,4,'2025-10-20 06:49:36.631726',4,'2025-10-20 14:50:03.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-23',_binary '\0',80.00,20.00,25.00,5,'2025-10-20 06:49:52.643622',5,'2025-10-20 14:49:56.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-20',_binary '\0',86.67,13.00,15.00,6,'2025-10-20 07:38:44.871320',6,'2025-10-20 20:04:42.000000','','PERCENTAGE',0.00,'FINAL_TERM'),('2025-10-22',_binary '\0',92.00,23.00,25.00,7,'2025-10-20 12:09:03.556778',7,'2025-10-20 20:09:08.000000','','PERCENTAGE',NULL,'FINAL_TERM'),('2025-10-20',_binary '\0',80.00,12.00,15.00,8,'2025-10-20 12:09:16.450592',8,'2025-10-20 20:09:21.000000','','PERCENTAGE',NULL,'FINAL_TERM'),('2025-10-29',_binary '\0',0.00,0.00,100.00,9,'2025-10-20 12:09:28.353516',9,'2025-10-20 12:09:28.352514','','POINTS',NULL,'FINAL_TERM');
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
  `notification_type` enum('GRADE_ALERT','GOAL_REMINDER','ACHIEVEMENT','PREDICTION_UPDATE','SYSTEM','ASSIGNMENT_DUE','CUSTOM_EVENT') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'First Steps\' - Welcome to GradeGoal! Complete your profile setup.','LOW',0,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"CONSISTENCY\", \"achievementId\": 1, \"achievementName\": \"First Steps\"}','2025-10-19 22:48:58',NULL),(2,2,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Goal Setter\' - Create your first academic goal.','LOW',0,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"GOAL\", \"achievementId\": 5, \"achievementName\": \"Goal Setter\"}','2025-10-19 22:48:58',NULL),(3,2,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'A+ Student\' - Achieve a grade of 95% or higher.','LOW',0,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 7, \"achievementName\": \"A+ Student\"}','2025-10-19 22:48:58',NULL),(4,2,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Perfect Score\' - Achieve 100% on any assessment.','LOW',0,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 41, \"achievementName\": \"Perfect Score\"}','2025-10-19 22:48:58',NULL),(5,2,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Grade Entry Rookie\' - Enter your first 5 grades.','LOW',0,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 2, \"achievementName\": \"Grade Entry Rookie\"}','2025-10-19 22:49:56',NULL),(6,2,NULL,'ACHIEVEMENT','? Level Up!','Congratulations! You reached Level 1 - Beginner Scholar','HIGH',0,'{\"type\": \"level_up\", \"level\": 1, \"rankTitle\": \"Beginner Scholar\"}','2025-10-19 22:50:03',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendations`
--

LOCK TABLES `recommendations` WRITE;
/*!40000 ALTER TABLE `recommendations` DISABLE KEYS */;
INSERT INTO `recommendations` VALUES (1,2,1,'AI_ANALYSIS','Prepare for the final Exam by reviewing and practicing key concepts','{\"courseId\":1,\"userId\":2,\"recommendationType\":\"AI_ANALYSIS\",\"title\":\"AI Analysis for Database\",\"content\":\"{\\\"predictedFinalGrade\\\":{\\\"percentage\\\":\\\"92%\\\",\\\"gpa\\\":\\\"2.8\\\",\\\"confidence\\\":\\\"HIGH\\\",\\\"explanation\\\":\\\"Based on current midterm performance, it is likely that the student will achieve a final grade of 92% or higher, given their consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam.\\\"},\\\"assessmentGradeRecommendations\\\":{\\\"Assignments\\\":{\\\"recommendedScore\\\":\\\"90%\\\",\\\"reasoning\\\":\\\"To achieve a high score in Assignments, focus on reviewing and practicing key concepts, such as Database normalization and SQL query syntax.\\\",\\\"priority\\\":\\\"MEDIUM\\\"},\\\"Quizzes\\\":{\\\"recommendedScore\\\":\\\"95%\\\",\\\"reasoning\\\":\\\"To perform well in Quizzes, focus on practicing past quiz questions and reviewing key concepts, such as SQL JOIN operations and indexing.\\\",\\\"priority\\\":\\\"HIGH\\\"},\\\"Exam\\\":{\\\"recommendedScore\\\":\\\"98%\\\",\\\"reasoning\\\":\\\"To achieve a high score in the Exam, focus on reviewing and practicing key concepts, such as Database design and optimization.\\\",\\\"priority\\\":\\\"HIGH\\\"}},\\\"targetGoalAnalysis\\\":{\\\"achievable\\\":true,\\\"analysis\\\":\\\"Based on the current weighted grade, the target goal of achieving 100% is achievable, given the student\'s consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam. However, to achieve the target goal, the student needs to perform well in all remaining assessments, particularly the final Exam.\\\",\\\"factors\\\":[\\\"weighted grade calculations\\\",\\\"remaining assessment weights\\\",\\\"max achievable grade vs target\\\"],\\\"confidence\\\":\\\"HIGH\\\",\\\"explanation\\\":\\\"To achieve the target goal, the student needs to achieve a minimum score of 90% in Assignments, 95% in Quizzes, and 98% in the Exam, and maintain a high level of performance in all remaining assessments.\\\"},\\\"statusUpdate\\\":{\\\"currentStatus\\\":\\\"ON_TRACK\\\",\\\"progressSummary\\\":\\\"The student is currently on track to achieve the target goal, given their consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam.\\\",\\\"keyAchievements\\\":[\\\"Achieved 90% in Assignment 2\\\",\\\"Achieved 95% in Quiz 2\\\"],\\\"areasOfConcern\\\":[\\\"Needs to perform well in the final Exam to achieve the target goal\\\"]},\\\"studyHabitRecommendations\\\":{\\\"dailyHabits\\\":[\\\"Spend 45 minutes daily reviewing Database normalization concepts using Chapter 8 exercises\\\",\\\"Create flashcards for SQL query syntax and practice 20 minutes before each quiz\\\"],\\\"weeklyStrategies\\\":[\\\"Schedule 2-hour study sessions on weekends focusing on weak areas identified in Assignment 3\\\",\\\"Use Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily\\\"],\\\"examPreparation\\\":[\\\"Prepare for upcoming Quiz 6 by reviewing Chapters 9-10 for 45 minutes daily\\\",\\\"Consider tutoring classmates in Database concepts to reinforce mastery\\\"],\\\"timeManagement\\\":\\\"Prioritize study sessions and focus on weak areas to achieve high scores in all assessments.\\\"},\\\"focusIndicators\\\":{\\\"Assignments\\\":{\\\"needsAttention\\\":false,\\\"reason\\\":\\\"The student has consistently performed well in Assignments, achieving a high score in Assignment 2.\\\",\\\"priority\\\":\\\"LOW\\\"},\\\"Quizzes\\\":{\\\"needsAttention\\\":false,\\\"reason\\\":\\\"The student has consistently performed well in Quizzes, achieving a high score in Quiz 2.\\\",\\\"priority\\\":\\\"LOW\\\"},\\\"Exam\\\":{\\\"needsAttention\\\":true,\\\"reason\\\":\\\"The student needs to perform well in the final Exam to achieve the target goal.\\\",\\\"priority\\\":\\\"HIGH\\\"}},\\\"scorePredictions\\\":{\\\"Assignments\\\":{\\\"neededScore\\\":\\\"90%\\\",\\\"confidence\\\":\\\"HIGH\\\"},\\\"Quizzes\\\":{\\\"neededScore\\\":\\\"95%\\\",\\\"confidence\\\":\\\"HIGH\\\"},\\\"Exam\\\":{\\\"neededScore\\\":\\\"98%\\\",\\\"confidence\\\":\\\"HIGH\\\"}},\\\"topPriorityRecommendations\\\":[{\\\"title\\\":\\\"Prepare for the final Exam by reviewing and practicing key concepts\\\",\\\"description\\\":\\\"To perform well in the final Exam, focus on reviewing and practicing key concepts, such as Database design and optimization.\\\",\\\"priority\\\":\\\"HIGH\\\",\\\"category\\\":\\\"COURSE_SPECIFIC\\\",\\\"impact\\\":\\\"High impact on achieving the target goal\\\"},{\\\"title\\\":\\\"Focus on weak areas identified in Assignment 3\\\",\\\"description\\\":\\\"To improve performance in Assignments, focus on weak areas identified in Assignment 3, such as Database normalization and SQL query syntax.\\\",\\\"priority\\\":\\\"MEDIUM\\\",\\\"category\\\":\\\"COURSE_SPECIFIC\\\",\\\"impact\\\":\\\"Medium impact on improving performance in Assignments\\\"},{\\\"title\\\":\\\"Maintain a high level of performance in all remaining assessments\\\",\\\"description\\\":\\\"To achieve the target goal, the student needs to maintain a high level of performance in all remaining assessments, particularly the final Exam.\\\",\\\"priority\\\":\\\"HIGH\\\",\\\"category\\\":\\\"COURSE_SPECIFIC\\\",\\\"impact\\\":\\\"High impact on achieving the target goal\\\"},{\\\"title\\\":\\\"Use time management strategies to prioritize study sessions\\\",\\\"description\\\":\\\"To achieve high scores in all assessments, prioritize study sessions and focus on weak areas to achieve high scores.\\\",\\\"priority\\\":\\\"MEDIUM\\\",\\\"category\\\":\\\"GENERAL_ACADEMIC\\\",\\\"impact\\\":\\\"Medium impact on improving performance in all assessments\\\"}],\\\"studyStrategy\\\":{\\\"focus\\\":\\\"Reviewing and practicing key concepts in Database design and optimization\\\",\\\"schedule\\\":\\\"Spend 45 minutes daily reviewing Database normalization concepts using Chapter 8 exercises, and 20 minutes before each quiz, create flashcards for SQL query syntax.\\\",\\\"tips\\\":[\\\"Use Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily\\\",\\\"Prioritize study sessions and focus on weak areas to achieve high scores.\\\"]},\\\"targetGoalProbability\\\":{\\\"probability\\\":\\\"80%\\\",\\\"factors\\\":[\\\"Current GPA: 1.5\\\",\\\"Target GPA: 4\\\",\\\"Gap: 2.50\\\",\\\"Max Achievable GPA: 3.50\\\",\\\"Current Grade: 87.84%\\\"],\\\"confidence\\\":\\\"HIGH\\\",\\\"bestPossibleGPA\\\":\\\"3.50\\\",\\\"explanation\\\":\\\"Student needs 2.50 GPA points to reach target. Probability adjusted based on realistic improvement potential.\\\"}}\",\"priority\":\"MEDIUM\",\"aiGenerated\":true,\"generatedAt\":\"2025-10-20T12:10:42.714Z\",\"predictedFinalGrade\":{\"percentage\":\"92%\",\"gpa\":\"2.8\",\"confidence\":\"HIGH\",\"explanation\":\"Based on current midterm performance, it is likely that the student will achieve a final grade of 92% or higher, given their consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam.\"},\"assessmentGradeRecommendations\":{\"Assignments\":{\"recommendedScore\":\"90%\",\"reasoning\":\"To achieve a high score in Assignments, focus on reviewing and practicing key concepts, such as Database normalization and SQL query syntax.\",\"priority\":\"MEDIUM\"},\"Quizzes\":{\"recommendedScore\":\"95%\",\"reasoning\":\"To perform well in Quizzes, focus on practicing past quiz questions and reviewing key concepts, such as SQL JOIN operations and indexing.\",\"priority\":\"HIGH\"},\"Exam\":{\"recommendedScore\":\"98%\",\"reasoning\":\"To achieve a high score in the Exam, focus on reviewing and practicing key concepts, such as Database design and optimization.\",\"priority\":\"HIGH\"}},\"targetGoalAnalysis\":{\"achievable\":true,\"analysis\":\"Based on the current weighted grade, the target goal of achieving 100% is achievable, given the student\'s consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam. However, to achieve the target goal, the student needs to perform well in all remaining assessments, particularly the final Exam.\",\"factors\":[\"weighted grade calculations\",\"remaining assessment weights\",\"max achievable grade vs target\"],\"confidence\":\"HIGH\",\"explanation\":\"To achieve the target goal, the student needs to achieve a minimum score of 90% in Assignments, 95% in Quizzes, and 98% in the Exam, and maintain a high level of performance in all remaining assessments.\"},\"statusUpdate\":{\"currentStatus\":\"ON_TRACK\",\"progressSummary\":\"The student is currently on track to achieve the target goal, given their consistent performance in Assignments and Quizzes, and their ability to perform well in the Exam.\",\"keyAchievements\":[\"Achieved 90% in Assignment 2\",\"Achieved 95% in Quiz 2\"],\"areasOfConcern\":[\"Needs to perform well in the final Exam to achieve the target goal\"]},\"studyHabitRecommendations\":{\"dailyHabits\":[\"Spend 45 minutes daily reviewing Database normalization concepts using Chapter 8 exercises\",\"Create flashcards for SQL query syntax and practice 20 minutes before each quiz\"],\"weeklyStrategies\":[\"Schedule 2-hour study sessions on weekends focusing on weak areas identified in Assignment 3\",\"Use Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily\"],\"examPreparation\":[\"Prepare for upcoming Quiz 6 by reviewing Chapters 9-10 for 45 minutes daily\",\"Consider tutoring classmates in Database concepts to reinforce mastery\"],\"timeManagement\":\"Prioritize study sessions and focus on weak areas to achieve high scores in all assessments.\"},\"focusIndicators\":{\"Assignments\":{\"needsAttention\":false,\"reason\":\"The student has consistently performed well in Assignments, achieving a high score in Assignment 2.\",\"priority\":\"LOW\"},\"Quizzes\":{\"needsAttention\":false,\"reason\":\"The student has consistently performed well in Quizzes, achieving a high score in Quiz 2.\",\"priority\":\"LOW\"},\"Exam\":{\"needsAttention\":true,\"reason\":\"The student needs to perform well in the final Exam to achieve the target goal.\",\"priority\":\"HIGH\"}},\"scorePredictions\":{\"Assignments\":{\"neededScore\":\"90%\",\"confidence\":\"HIGH\"},\"Quizzes\":{\"neededScore\":\"95%\",\"confidence\":\"HIGH\"},\"Exam\":{\"neededScore\":\"98%\",\"confidence\":\"HIGH\"}},\"topPriorityRecommendations\":[{\"title\":\"Prepare for the final Exam by reviewing and practicing key concepts\",\"description\":\"To perform well in the final Exam, focus on reviewing and practicing key concepts, such as Database design and optimization.\",\"priority\":\"HIGH\",\"category\":\"COURSE_SPECIFIC\",\"impact\":\"High impact on achieving the target goal\"},{\"title\":\"Focus on weak areas identified in Assignment 3\",\"description\":\"To improve performance in Assignments, focus on weak areas identified in Assignment 3, such as Database normalization and SQL query syntax.\",\"priority\":\"MEDIUM\",\"category\":\"COURSE_SPECIFIC\",\"impact\":\"Medium impact on improving performance in Assignments\"},{\"title\":\"Maintain a high level of performance in all remaining assessments\",\"description\":\"To achieve the target goal, the student needs to maintain a high level of performance in all remaining assessments, particularly the final Exam.\",\"priority\":\"HIGH\",\"category\":\"COURSE_SPECIFIC\",\"impact\":\"High impact on achieving the target goal\"},{\"title\":\"Use time management strategies to prioritize study sessions\",\"description\":\"To achieve high scores in all assessments, prioritize study sessions and focus on weak areas to achieve high scores.\",\"priority\":\"MEDIUM\",\"category\":\"GENERAL_ACADEMIC\",\"impact\":\"Medium impact on improving performance in all assessments\"}],\"studyStrategy\":{\"focus\":\"Reviewing and practicing key concepts in Database design and optimization\",\"schedule\":\"Spend 45 minutes daily reviewing Database normalization concepts using Chapter 8 exercises, and 20 minutes before each quiz, create flashcards for SQL query syntax.\",\"tips\":[\"Use Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily\",\"Prioritize study sessions and focus on weak areas to achieve high scores.\"]},\"targetGoalProbability\":{\"probability\":\"80%\",\"factors\":[\"Current GPA: 1.5\",\"Target GPA: 4\",\"Gap: 2.50\",\"Max Achievable GPA: 3.50\",\"Current Grade: 87.84%\"],\"confidence\":\"HIGH\",\"bestPossibleGPA\":\"3.50\",\"explanation\":\"Student needs 2.50 GPA points to reach target. Probability adjusted based on realistic improvement potential.\"}}','MEDIUM',0,0,'2025-10-19 23:38:26','2025-11-19 04:10:43',0.76,_binary '','llama-3.1-8b-instant','1926644858','{\"createdAt\": \"2025-10-20T20:10:42.733024800\", \"analysisType\": \"AI_COURSE_ANALYSIS\", \"hasPredictions\": true, \"hasGoalAnalysis\": true, \"hasStatusUpdate\": true, \"hasRecommendations\": true}');
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
  `earned_context` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_achievement_id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  KEY `idx_earned_date` (`earned_at`),
  KEY `idx_user_date` (`user_id`,`earned_at`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (1,2,1,'2025-10-19 22:48:58',NULL),(2,2,5,'2025-10-19 22:48:58',NULL),(3,2,7,'2025-10-19 22:48:58',NULL),(4,2,41,'2025-10-19 22:48:58',NULL),(5,2,2,'2025-10-19 22:49:56',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_log`
--

LOCK TABLES `user_activity_log` WRITE;
/*!40000 ALTER TABLE `user_activity_log` DISABLE KEYS */;
INSERT INTO `user_activity_log` VALUES (1,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:18'),(2,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:18'),(3,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:18'),(4,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:18'),(5,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:18'),(6,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:18'),(7,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:18'),(8,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:18'),(9,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:18'),(10,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:18'),(11,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:18'),(12,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:18'),(13,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:18'),(14,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:18'),(15,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:18'),(16,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:18'),(17,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:18'),(18,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:18'),(19,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:18'),(20,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:18'),(21,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:18'),(22,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:18'),(23,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:22'),(24,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:22'),(25,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:22'),(26,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:22'),(27,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:22'),(28,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:22'),(29,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:22'),(30,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:22'),(31,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:22'),(32,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:22'),(33,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:22'),(34,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:22'),(35,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:22'),(36,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:22'),(37,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:22'),(38,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:22'),(39,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:22'),(40,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:22'),(41,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:22'),(42,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:22'),(43,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:22'),(44,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:22'),(45,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:22'),(46,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:22'),(47,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:22'),(48,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:22'),(49,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:22'),(50,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:22'),(51,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:22'),(52,2,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Exam 2 in Database\",\"courseName\":\"Database\",\"score\":\"Upcoming\"}',NULL,'2025-10-20 04:13:22'),(53,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:22'),(54,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:22'),(55,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 5\",\"courseName\":\"Database\",\"score\":\"12/15\"}',NULL,'2025-10-20 04:13:22'),(56,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:22'),(57,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"92% in Quiz 4\",\"courseName\":\"Database\",\"score\":\"23/25\"}',NULL,'2025-10-20 04:13:22'),(58,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"86.67% in Assignment 2\",\"courseName\":\"Database\",\"score\":\"13/15\"}',NULL,'2025-10-20 04:13:22'),(59,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:22'),(60,2,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for Database\",\"courseName\":\"Database\"}',NULL,'2025-10-20 04:13:22'),(61,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 3\",\"courseName\":\"Database\",\"score\":\"20/25\"}',NULL,'2025-10-20 04:13:22'),(62,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"87% in Exam 1\",\"courseName\":\"Database\",\"score\":\"87/100\"}',NULL,'2025-10-20 04:13:22'),(63,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"Database\",\"score\":\"14/15\"}',NULL,'2025-10-20 04:13:22'),(64,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"72% in Quiz 1\",\"courseName\":\"Database\",\"score\":\"18/25\"}',NULL,'2025-10-20 04:13:22'),(65,2,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Database\",\"score\":\"15/15\"}',NULL,'2025-10-20 04:13:22'),(66,2,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Database GPA GOAL - 95.5%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-20 04:13:22');
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
  `semester_term` enum('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MIDTERM' COMMENT 'Which semester term this analytics record belongs to',
  PRIMARY KEY (`analytics_id`),
  KEY `idx_user_date` (`user_id`,`analytics_date`),
  KEY `idx_course_date` (`course_id`,`analytics_date`),
  KEY `idx_user_analytics_due_date` (`due_date`),
  KEY `idx_analytics_semester_term` (`semester_term`),
  CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_analytics_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (1,2,1,'2025-10-20',4.00,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 100.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-01','FIRST','MIDTERM'),(2,2,1,'2025-10-20',2.88,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 72.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-09','FIRST','MIDTERM'),(3,2,1,'2025-10-20',3.73,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 93.3, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-15','FIRST','MIDTERM'),(4,2,1,'2025-10-20',3.48,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 87.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-31','FIRST','MIDTERM'),(5,2,1,'2025-10-20',3.20,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 80.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-23','FIRST','MIDTERM'),(6,2,1,'2025-10-20',3.47,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 86.7, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-20','FIRST','MIDTERM'),(7,2,1,'2025-10-20',3.68,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 92.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-22','FIRST','MIDTERM'),(8,2,1,'2025-10-20',3.20,0.00,8,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 80.0, \"study_hours_logged\": 0.0}','2025-10-20 04:09:22','2025-10-20','FIRST','MIDTERM');
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
INSERT INTO `user_progress` VALUES (2,185,1,65,1,'2025-10-20',1.5,0.00,'2025-10-20 12:13:22',1.5),(3,0,0,100,1,'2025-10-20',0,0.00,'2025-10-20 06:31:07',0),(11,0,0,100,1,'2025-10-20',0,0.00,'2025-10-19 21:08:00',0);
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
  `profile_picture_url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_preference` enum('BOTH','MOBILE','WEB') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_year_level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firebase_uid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK4yiq7pdiwjw8inhg1xy83nabx` (`firebase_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '',_binary '','2025-09-29 00:00:00.000000','2025-10-19 20:51:48.351261','2025-10-19 20:51:48.360268',1,NULL,'admin@gradegoal.com','Admin','User','$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB','ADMIN',NULL,NULL,NULL,'1',NULL),(_binary '\0',_binary '\0','2025-10-20 05:40:18.351480','2025-10-20 12:10:30.466059','2025-10-20 12:10:30.467054',2,NULL,'pinpinramirez@gmail.com','Prince','Ramirez',NULL,NULL,'USER',NULL,_binary '','prince','1','Y7y9YmHpDYdd4jHj1Gtve09rSGy1'),(_binary '\0',NULL,'2025-10-20 05:58:09.568653','2025-10-20 05:58:10.591115','2025-10-20 05:58:20.634237',3,NULL,'chillathome00@gmail.com','GradeGoal','User',NULL,NULL,'USER',NULL,_binary '','chillathome00@gmail.com','1','OVYuYEN6VdVlLhyWrmPyiTH55hs2');
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
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCategoryGrade`(p_category_id BIGINT, p_semester_term ENUM('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci) RETURNS decimal(5,2)
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
    
    -- Calculate based on handle_missing setting for the specific semester term
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all assessments for the specific term, treat missing as 0 points earned
        SELECT 
            COALESCE(SUM(COALESCE(g.points_earned, 0)), 0),
            COALESCE(SUM(a.max_points), 0),
            COALESCE(SUM(COALESCE(g.extra_credit_points, 0)), 0)
        INTO total_points_earned, total_points_possible, total_extra_credit
        FROM assessments a
        LEFT JOIN grades g ON a.assessment_id = g.assessment_id
        WHERE a.category_id = p_category_id 
        AND a.semester_term = p_semester_term;
        
    ELSE
        -- Default behavior: exclude missing assessments for the specific term, include extra credit
        SELECT 
            COALESCE(SUM(g.points_earned), 0),
            COALESCE(SUM(a.max_points), 0),
            COALESCE(SUM(COALESCE(g.extra_credit_points, 0)), 0)
        INTO total_points_earned, total_points_possible, total_extra_credit
        FROM grades g
        INNER JOIN assessments a ON g.assessment_id = a.assessment_id
        WHERE a.category_id = p_category_id 
        AND a.semester_term = p_semester_term
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
/*!50003 DROP FUNCTION IF EXISTS `CalculateCategoryGradeOverall` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCategoryGradeOverall`(p_category_id BIGINT) RETURNS decimal(5,2)
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
    
    -- Calculate based on handle_missing setting (all terms combined)
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
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCourseGrade`(p_course_id BIGINT, p_semester_term ENUM('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci) RETURNS decimal(5,2)
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
    
    -- Calculate weighted grade using category weights for specific semester term
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all categories, treat empty categories as 0%
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id, p_semester_term) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(ac.weight_percentage), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
    ELSE
        -- Default behavior: exclude categories with no completed assessments for the specific term
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id, p_semester_term) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(
                CASE 
                    WHEN (SELECT COUNT(*) FROM assessments a 
                          INNER JOIN grades g ON a.assessment_id = g.assessment_id 
                          WHERE a.category_id = ac.category_id 
                          AND a.semester_term = p_semester_term
                          AND g.points_earned IS NOT NULL) > 0 
                    THEN ac.weight_percentage 
                    ELSE 0 
                END
            ), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
    END IF;
    
    -- Calculate final course grade for the specific term
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
/*!50003 DROP FUNCTION IF EXISTS `CalculateCourseGradeOverall` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateCourseGradeOverall`(p_course_id BIGINT) RETURNS decimal(5,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE course_grade DECIMAL(5,2) DEFAULT 0.00;
    DECLARE midterm_contribution DECIMAL(8,4) DEFAULT 0.00;
    DECLARE final_term_contribution DECIMAL(8,4) DEFAULT 0.00;
    DECLARE total_category_weight DECIMAL(5,2) DEFAULT 0.00;
    DECLARE handle_missing_setting VARCHAR(255) DEFAULT 'exclude';
    
    -- Get the handle_missing setting for this course
    SELECT handle_missing 
    INTO handle_missing_setting
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Get total category weight
    SELECT COALESCE(SUM(weight_percentage), 0)
    INTO total_category_weight
    FROM assessment_categories ac
    WHERE ac.course_id = p_course_id;
    
    -- Calculate MIDTERM contribution (50% of each category's weight)
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all categories, treat empty categories as 0%
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id, 'MIDTERM') * ac.weight_percentage * 0.5) / 100
            ), 0)
        INTO midterm_contribution
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
        -- Calculate FINAL_TERM contribution (50% of each category's weight)
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGrade(ac.category_id, 'FINAL_TERM') * ac.weight_percentage * 0.5) / 100
            ), 0)
        INTO final_term_contribution
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
    ELSE
        -- Default behavior: exclude categories with no completed assessments for each term
        -- Calculate MIDTERM contribution (50% of each category's weight)
        SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN (SELECT COUNT(*) FROM assessments a 
                          INNER JOIN grades g ON a.assessment_id = g.assessment_id 
                          WHERE a.category_id = ac.category_id 
                          AND a.semester_term = 'MIDTERM'
                          AND g.points_earned IS NOT NULL) > 0 
                    THEN (CalculateCategoryGrade(ac.category_id, 'MIDTERM') * ac.weight_percentage * 0.5) / 100
                    ELSE 0 
                END
            ), 0)
        INTO midterm_contribution
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
        -- Calculate FINAL_TERM contribution (50% of each category's weight)
        SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN (SELECT COUNT(*) FROM assessments a 
                          INNER JOIN grades g ON a.assessment_id = g.assessment_id 
                          WHERE a.category_id = ac.category_id 
                          AND a.semester_term = 'FINAL_TERM'
                          AND g.points_earned IS NOT NULL) > 0 
                    THEN (CalculateCategoryGrade(ac.category_id, 'FINAL_TERM') * ac.weight_percentage * 0.5) / 100
                    ELSE 0 
                END
            ), 0)
        INTO final_term_contribution
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
    END IF;
    
    -- Calculate final course grade as sum of term contributions
    SET course_grade = midterm_contribution + final_term_contribution;
    
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
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateGPA`(p_percentage DECIMAL(5,2)) RETURNS varchar(10) CHARSET utf8mb4
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE gpa VARCHAR(10) DEFAULT 'R';
    
    -- Custom GPA scale conversion based on provided table
    IF p_percentage >= 95.5 THEN SET gpa = '4.00';
    ELSEIF p_percentage >= 89.5 THEN SET gpa = '3.50';
    ELSEIF p_percentage >= 83.5 THEN SET gpa = '3.00';
    ELSEIF p_percentage >= 77.5 THEN SET gpa = '2.50';
    ELSEIF p_percentage >= 71.5 THEN SET gpa = '2.00';
    ELSEIF p_percentage >= 65.5 THEN SET gpa = '1.50';
    ELSEIF p_percentage >= 59.5 THEN SET gpa = '1.00';
    ELSE SET gpa = 'R'; -- Below 59.5 = R (Remedial/Fail)
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
    IN p_semester_term ENUM('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
                semester_term = p_semester_term,
                updated_at = CURRENT_TIMESTAMP
            WHERE grade_id = existing_grade_id;
            
            SET p_grade_id = existing_grade_id;
            SET p_result = 'Grade updated successfully';
        ELSE
            -- Insert new grade with user_id, extra_credit_points, and semester_term
            INSERT INTO grades (
                assessment_id, points_earned, points_possible, 
                percentage_score, score_type, notes, is_extra_credit, 
                extra_credit_points, user_id, semester_term
            ) VALUES (
                p_assessment_id, p_points_earned, p_points_possible,
                p_percentage_score, p_score_type, p_notes, p_is_extra_credit, 
                p_extra_credit_points, v_user_id, p_semester_term
            );
            
            SET p_grade_id = LAST_INSERT_ID();
            SET p_result = 'Grade added successfully';
        END IF;
        
        -- Update course grade after grade change (only if we have a valid course_id)
        -- Note: UpdateCourseGrades already calls UpdateUserAnalytics, so no duplicate call needed
        IF v_course_id IS NOT NULL THEN
            CALL UpdateCourseGrades(v_course_id, p_semester_term);
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
    IN p_reason VARCHAR(255)
)
BEGIN
    DECLARE current_points INT DEFAULT 0;
    DECLARE current_level INT DEFAULT 1;
    DECLARE new_level INT;
    DECLARE points_for_next_level INT;
    
    -- Get current progress
    SELECT total_points, current_level 
    INTO current_points, current_level
    FROM user_progress
    WHERE user_id = p_user_id;
    
    -- Initialize user progress if not exists
    IF current_points IS NULL THEN
        INSERT INTO user_progress (user_id, total_points, current_level, points_to_next_level, last_activity_date)
        VALUES (p_user_id, 0, 1, 100, CURDATE());
        SET current_points = 0;
        SET current_level = 1;
    END IF;
    
    -- Add points
    SET current_points = current_points + p_points;
    
    -- Calculate new level using the progressive formula: (level - 1) * 500 + (level - 2) * 250
    SET new_level = 1;
    SET points_for_next_level = 0;
    
    WHILE current_points >= (new_level * 500 + (new_level - 1) * 250) DO
        SET new_level = new_level + 1;
    END WHILE;
    
    -- Calculate points needed for next level
    SET points_for_next_level = (new_level * 500 + (new_level - 1) * 250) - current_points;
    
    -- Update user progress
    UPDATE user_progress 
    SET total_points = current_points,
        current_level = new_level,
        points_to_next_level = points_for_next_level,
        last_activity_date = CURDATE()
    WHERE user_id = p_user_id;
    
    -- REMOVED: Old level-up notification creation
    -- The Java achievement system (AchievementService) now handles level achievements
    -- which creates proper notifications via NotificationService
    
    -- Check for new achievements (this will trigger level-based achievements in Java)
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
/*!50003 DROP PROCEDURE IF EXISTS `CleanupExpiredAIAnalysis` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CleanupExpiredAIAnalysis`()
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
/*!50003 DROP PROCEDURE IF EXISTS `MarkMidtermCompleted` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `MarkMidtermCompleted`(IN course_id_param BIGINT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Mark midterm as completed for the course
    UPDATE `courses` 
    SET `is_midterm_completed` = b'1', `updated_at` = NOW()
    WHERE `course_id` = course_id_param;
    
    -- Update all midterm assessments to COMPLETED status if they have grades
    UPDATE `assessments` a
    INNER JOIN `grades` g ON a.assessment_id = g.assessment_id
    SET a.status = 'COMPLETED', a.updated_at = NOW()
    WHERE a.category_id IN (
        SELECT category_id FROM assessment_categories WHERE course_id = course_id_param
    ) AND a.semester_term = 'MIDTERM';
    
    COMMIT;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateCourseGrades`(IN p_course_id BIGINT, IN p_semester_term ENUM('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)
BEGIN
    DECLARE calculated_grade DECIMAL(5,2);
    DECLARE calculated_gpa DECIMAL(3,2);
    DECLARE course_user_id BIGINT;
    
    -- Get the user_id for the course
    SELECT user_id INTO course_user_id
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Calculate the current course grade for the specific semester term
    SET calculated_grade = CalculateCourseGrade(p_course_id, p_semester_term);
    SET calculated_gpa = CalculateGPA(calculated_grade);
    
    -- Update the course record
    UPDATE courses SET
        calculated_course_grade = calculated_grade,
        course_gpa = calculated_gpa,
        updated_at = CURRENT_TIMESTAMP
    WHERE course_id = p_course_id;
    
    -- Update user analytics with 3 parameters (user_id, course_id, semester_term)
    CALL UpdateUserAnalytics(course_user_id, p_course_id, p_semester_term);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateCourseGradesOverall` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateCourseGradesOverall`(IN p_course_id BIGINT)
BEGIN
    DECLARE calculated_grade DECIMAL(5,2);
    DECLARE calculated_gpa DECIMAL(3,2);
    DECLARE course_user_id BIGINT;
    
    -- Get the user_id for the course
    SELECT user_id INTO course_user_id
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Calculate the current course grade (all terms combined)
    SET calculated_grade = CalculateCourseGradeOverall(p_course_id);
    SET calculated_gpa = CalculateGPA(calculated_grade);
    
    -- Update the course record
    UPDATE courses SET
        calculated_course_grade = calculated_grade,
        course_gpa = calculated_gpa,
        updated_at = CURRENT_TIMESTAMP
    WHERE course_id = p_course_id;
    
    -- Update user analytics with 2 parameters (user_id, course_id) - overall analytics
    CALL UpdateUserAnalyticsOverall(course_user_id, p_course_id);
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
    IN p_course_id BIGINT,
    IN p_semester_term ENUM('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE current_calculated_grade DECIMAL(5,2);
    DECLARE current_gpa DECIMAL(3,2);
    DECLARE previous_grade_trend DECIMAL(3,2);
    DECLARE course_semester VARCHAR(20);
    DECLARE course_due_date DATE;
    DECLARE total_assignments_completed INT DEFAULT 0;
    DECLARE total_assignments_pending INT DEFAULT 0;
    DECLARE total_study_hours DECIMAL(5,2) DEFAULT 0.00;

    -- Get the semester from the courses table
    SELECT semester INTO course_semester FROM courses WHERE course_id = p_course_id;

    -- Get the latest calculated course grade (percentage) for the specific semester term
    SET current_calculated_grade = CalculateCourseGrade(p_course_id, p_semester_term);

    -- Convert percentage to GPA
    SET current_gpa = CalculateGPA(current_calculated_grade);

    -- CRITICAL FIX: Use the actual earliest upcoming assessment due date for the specific term
    SELECT a.due_date INTO course_due_date
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    WHERE ac.course_id = p_course_id
    AND a.semester_term = p_semester_term
    AND a.due_date >= CURDATE()
    ORDER BY a.due_date ASC
    LIMIT 1;

    -- If no future assessments for this term, get the most recent due date for this term
    IF course_due_date IS NULL THEN
        SELECT a.due_date INTO course_due_date
        FROM assessments a
        JOIN assessment_categories ac ON a.category_id = ac.category_id
        WHERE ac.course_id = p_course_id
        AND a.semester_term = p_semester_term
        ORDER BY a.due_date DESC
        LIMIT 1;
    END IF;

    -- Only use fallback if absolutely no assessments exist for this term
    IF course_due_date IS NULL THEN
        SET course_due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    END IF;

    -- Calculate assignments completed and pending for the specific semester term
    SELECT
        COUNT(CASE WHEN g.percentage_score IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN g.percentage_score IS NULL THEN 1 END)
    INTO total_assignments_completed, total_assignments_pending
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    LEFT JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE ac.course_id = p_course_id
    AND a.semester_term = p_semester_term;

    -- Get previous grade trend for comparison (for the same semester term)
    SELECT current_grade INTO previous_grade_trend
    FROM user_analytics
    WHERE user_id = p_user_id AND course_id = p_course_id AND semester_term = p_semester_term
    ORDER BY analytics_date DESC, calculated_at DESC
    LIMIT 1;

    -- Insert a new analytics entry with semester_term
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
        semester,
        semester_term
    ) VALUES (
        p_user_id,
        p_course_id,
        CURDATE(),
        current_gpa,
        COALESCE(current_gpa - previous_grade_trend, 0.00),
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
            'percentage_score', current_calculated_grade,
            'semester_term', p_semester_term
        ),
        NOW(),
        course_due_date, -- This should now be the actual assessment due date for the specific term
        COALESCE(course_semester, 'FIRST'),
        p_semester_term
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateUserAnalyticsOverall` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateUserAnalyticsOverall`(
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
    DECLARE total_study_hours DECIMAL(5,2) DEFAULT 0.00;

    -- Get the semester from the courses table
    SELECT semester INTO course_semester FROM courses WHERE course_id = p_course_id;

    -- Get the latest calculated course grade (percentage) - all terms combined
    SET current_calculated_grade = CalculateCourseGradeOverall(p_course_id);

    -- Convert percentage to GPA
    SET current_gpa = CalculateGPA(current_calculated_grade);

    -- CRITICAL FIX: Use the actual earliest upcoming assessment due date (all terms)
    SELECT a.due_date INTO course_due_date
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    WHERE ac.course_id = p_course_id
    AND a.due_date >= CURDATE()
    ORDER BY a.due_date ASC
    LIMIT 1;

    -- If no future assessments, get the most recent due date
    IF course_due_date IS NULL THEN
        SELECT a.due_date INTO course_due_date
        FROM assessments a
        JOIN assessment_categories ac ON a.category_id = ac.category_id
        WHERE ac.course_id = p_course_id
        ORDER BY a.due_date DESC
        LIMIT 1;
    END IF;

    -- Only use fallback if absolutely no assessments exist
    IF course_due_date IS NULL THEN
        SET course_due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    END IF;

    -- Calculate assignments completed and pending (all terms combined)
    SELECT
        COUNT(CASE WHEN g.percentage_score IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN g.percentage_score IS NULL THEN 1 END)
    INTO total_assignments_completed, total_assignments_pending
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    LEFT JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE ac.course_id = p_course_id;

    -- Get previous grade trend for comparison (overall)
    SELECT current_grade INTO previous_grade_trend
    FROM user_analytics
    WHERE user_id = p_user_id AND course_id = p_course_id
    ORDER BY analytics_date DESC, calculated_at DESC
    LIMIT 1;

    -- Insert a new analytics entry (overall)
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
        semester,
        semester_term
    ) VALUES (
        p_user_id,
        p_course_id,
        CURDATE(),
        current_gpa,
        COALESCE(current_gpa - previous_grade_trend, 0.00),
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
            'percentage_score', current_calculated_grade,
            'semester_term', 'OVERALL'
        ),
        NOW(),
        course_due_date, -- This should now be the actual assessment due date
        COALESCE(course_semester, 'FIRST'),
        'MIDTERM' -- Default to MIDTERM for backward compatibility
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

-- Dump completed on 2025-10-20 20:18:44
