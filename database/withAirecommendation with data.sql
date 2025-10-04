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
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,97.00,7,'2025-10-04 19:44:09.612830',2,'2025-10-04 19:44:09.612830',1,NULL,'123asd GPA GOAL','COURSE_GRADE','MEDIUM','2025',NULL);
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
-- Table structure for table `ai_analysis`
--

DROP TABLE IF EXISTS `ai_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_analysis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `analysis_type` enum('COURSE_ANALYSIS','ASSESSMENT_PREDICTION','GOAL_PROBABILITY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COURSE_ANALYSIS',
  `analysis_data` json NOT NULL COMMENT 'Complete AI analysis results',
  `ai_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'gemini-2.0-flash-exp',
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analysis`
--

LOCK TABLES `ai_analysis` WRITE;
/*!40000 ALTER TABLE `ai_analysis` DISABLE KEYS */;
INSERT INTO `ai_analysis` VALUES (1,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 4.00\", \"Current Grade: 0.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"0.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 12:45:47','2025-10-04 12:54:08','2025-11-03 12:45:47',0),(2,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 4.00\", \"Current Grade: 0.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"0.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 12:54:08','2025-10-04 12:57:42','2025-11-03 12:54:08',0),(3,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"Good performance in exam (100.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 92.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Target GPA 4 is mathematically unreachable.\", \"probability\": \"0%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 12:57:42','2025-10-04 13:01:55','2025-11-03 12:57:42',0),(4,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"Good performance in exam (100.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 92.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Target GPA 4 is mathematically unreachable.\", \"probability\": \"0%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:01:55','2025-10-04 13:03:35','2025-11-03 13:01:55',0),(5,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"Good performance in exam (100.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 92.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Target GPA 4 is mathematically unreachable.\", \"probability\": \"0%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:03:35','2025-10-04 13:12:14','2025-11-03 13:03:35',0),(6,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 4.00\", \"Current Grade: 0.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"0.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:12:14','2025-10-04 13:15:52','2025-11-03 13:12:14',0),(7,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 4.00\", \"Current Grade: 0.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"0.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:15:52','2025-10-04 13:18:40','2025-11-03 13:15:52',0),(8,1,7,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"Good performance in exam (100.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 92.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Target GPA 4 is mathematically unreachable.\", \"probability\": \"0%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:18:40','2025-10-04 13:30:14','2025-11-03 13:18:40',0),(9,1,7,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"EXCELLING\", \"areasOfConcern\": [\"Target goal of 100% is not currently achievable\", \"Lack of clarity on final grade calculation weighting\"], \"keyAchievements\": [\"Excellent exam performance\", \"Consistent high scores on quizzes and assignments\"], \"progressSummary\": \"The student is performing very well in this course, with a current grade of 92%. All midterm assessments are completed and show a strong understanding of the material.\"}, \"studyStrategy\": {\"tips\": [\"Review lecture notes daily.\", \"Practice problems for 30 minutes each day.\", \"Summarize key concepts at the end of each study session.\"], \"focus\": \"Maintaining consistent performance and clarifying grade calculation.\", \"schedule\": \"Continue with your current study schedule, focusing on reviewing notes and practicing problems regularly.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"The exam has been completed with an excellent score.\", \"priority\": \"LOW\", \"needsAttention\": false}, \"quizzes\": {\"reason\": \"Quizzes have been completed with good scores.\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Assignments have been completed with good scores.\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"N/A\", \"neededScore\": \"N/A\"}, \"quizzes\": {\"confidence\": \"N/A\", \"neededScore\": \"N/A\"}, \"assignments\": {\"confidence\": \"N/A\", \"neededScore\": \"N/A\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target goal is 100%, but the current course grade is 92%. Because all assessments for the Midterm period are completed, and there are no upcoming assessments, it is not possible to reach the target goal of 100% without additional opportunities to improve the score. The current grade is calculated as follows: Assignments (14/15 + 12/15)/2 = 86.67%, Quizzes (12/15 + 14/15)/2 = 86.67%, Exam (15/15) = 100%. Weighted average is (0.3 * 86.67) + (0.3 * 86.67) + (0.4 * 100) = 90.67%. However the course grade is reported as 92% so the weighting or scoring is not fully understood. Assuming the 92% grade is correct, it is still below the 100% target and unachievable at this stage.\", \"achievable\": false, \"confidence\": \"HIGH\", \"explanation\": \"All assessments are completed. The current course grade is 92%, making a 100% target unachievable unless additional assessments are added.\"}, \"predictedFinalGrade\": {\"gpa\": \"3.3\", \"confidence\": \"HIGH\", \"percentage\": \"92%\", \"explanation\": \"Based on current midterm performance, the predicted final grade is 92%. No further assessments are scheduled, and the midterm assessments account for the full course grade.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 92.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Student needs 0.70 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"75%\", \"bestPossibleGPA\": \"53.30\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review notes from each lecture daily.\", \"Spend 30 minutes practicing problems related to the course material.\", \"Summarize key concepts at the end of each study session.\"], \"timeManagement\": \"Allocate specific time slots for studying this course each day to ensure consistent progress.\", \"examPreparation\": [\"Start reviewing exam material at least one week in advance.\", \"Create a study guide summarizing key concepts and formulas.\", \"Take practice exams under timed conditions.\"], \"weeklyStrategies\": [\"Dedicate 2-3 hours each week to review all course material.\", \"Complete practice quizzes or exams to assess understanding.\", \"Meet with a study group to discuss challenging topics.\"]}, \"topPriorityRecommendations\": [{\"title\": \"Maintain Consistent Study Habits\", \"impact\": \"Will ensure continued strong performance in the course.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"LOW\", \"description\": \"Continue your current study habits as they are clearly working. Consistency is key to retaining information and performing well on future assessments, if any are added.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Clarify Grade Calculation with Instructor\", \"impact\": \"Will provide clarity on how the final grade is calculated.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"The calculated weighted average of the assessments (90.67%) differs from the reported course grade (92%). Clarify the grade calculation method with the instructor to understand how the final grade is determined.\", \"actionButton\": {\"text\": \"Contact Instructor\", \"action\": \"CONTACT_INSTRUCTOR\", \"enabled\": true}}, {\"title\": \"Explore Opportunities for Extra Credit\", \"impact\": \"May provide a way to reach the target goal.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Since the target goal of 100% is currently unachievable, inquire with the instructor about opportunities for extra credit or additional assignments to potentially improve the final grade.\", \"actionButton\": {\"text\": \"Ask About Extra Credit\", \"action\": \"ASK_ABOUT_EXTRA_CREDIT\", \"enabled\": true}}, {\"title\": \"Review Exam Performance for Areas of Improvement\", \"impact\": \"Will solidify understanding and identify areas for potential improvement.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"LOW\", \"description\": \"Even with an excellent exam score, review your performance to identify any areas where you could have performed even better. This can help strengthen your understanding of the material.\", \"actionButton\": {\"text\": \"Review Exam\", \"action\": \"REVIEW_EXAM\", \"enabled\": true}}, {\"title\": \"Consider Alternative Grading Schemes\", \"impact\": \"Will allow for a better opportunity to achieve the target\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"LOW\", \"description\": \"If available, explore options to change the weighting of grades, or grading on the curve.\", \"actionButton\": {\"text\": \"Check Grading Schemes\", \"action\": \"CHECK_GRADING_SCHEMES\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"LOW\", \"reasoning\": \"The exam performance is excellent and contributes significantly to the overall grade. Continue with the same preparation and focus.\", \"recommendedScore\": \"Maintain current level\"}, \"quizzes\": {\"priority\": \"LOW\", \"reasoning\": \"The quizzes show a good understanding of the material. Continue to perform at this level to reinforce learning and ensure retention.\", \"recommendedScore\": \"Maintain current level\"}, \"assignments\": {\"priority\": \"LOW\", \"reasoning\": \"The assignments have contributed to a strong overall grade. Continue to maintain this level of performance, focusing on quality and completeness.\", \"recommendedScore\": \"Maintain current level\"}}}','gemini-2.0-flash-exp',0.85,'2025-10-04 13:30:14','2025-10-04 13:30:14','2025-11-03 13:30:14',1);
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
  `analysis_reasoning` text,
  `assessment_id` bigint NOT NULL,
  `confidence_level` enum('HIGH','LOW','MEDIUM') DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `predicted_gpa` decimal(38,2) DEFAULT NULL,
  `predicted_percentage` decimal(38,2) DEFAULT NULL,
  `predicted_score` decimal(38,2) DEFAULT NULL,
  `recommended_percentage` decimal(38,2) DEFAULT NULL,
  `recommended_score` decimal(38,2) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,7,3,'2025-10-03 09:34:31.993760','Assignments'),(1,30.00,8,3,'2025-10-03 09:34:32.013776','Quizzes'),(1,40.00,9,3,'2025-10-03 09:34:32.030791','Exam'),(1,30.00,16,7,'2025-10-04 19:43:45.572857','Assignments'),(1,30.00,17,7,'2025-10-04 19:43:45.588870','Quizzes'),(1,40.00,18,7,'2025-10-04 19:43:45.602287','Exam');
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
  `ai_confidence` enum('HIGH','MEDIUM','LOW') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI confidence level',
  `ai_recommended_score` decimal(10,2) DEFAULT NULL COMMENT 'AI recommended score to reach target',
  `ai_analysis_reasoning` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'AI explanation for prediction',
  `ai_analysis_updated_at` timestamp NULL DEFAULT NULL COMMENT 'When AI analysis was last updated',
  `semester_term` enum('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MIDTERM' COMMENT 'Whether this assessment belongs to midterm or final term',
  PRIMARY KEY (`assessment_id`),
  KEY `FK4kbcb2x7nlbys293dd0vjysdm` (`category_id`),
  KEY `idx_ai_predicted_score` (`ai_predicted_score`),
  KEY `idx_ai_confidence` (`ai_confidence`),
  KEY `idx_ai_analysis_updated` (`ai_analysis_updated_at`),
  KEY `idx_semester_term` (`semester_term`),
  CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-10-03',15.00,10,7,'2025-10-03 09:41:12.523620','2025-10-03 09:41:12.517616','Assignment 1',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-09-04',15.00,11,16,'2025-10-04 19:44:18.395855','2025-10-05 04:45:05.000000','Assignment 1',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-09-06',15.00,12,16,'2025-10-04 19:44:44.213636','2025-10-05 04:45:05.000000','Assignment 2',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-09-17',15.00,13,17,'2025-10-04 19:48:44.284430','2025-10-05 04:45:05.000000','Quiz 1',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-10-04',15.00,14,17,'2025-10-04 19:50:44.628111','2025-10-05 04:45:05.000000','Quiz 2',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-10-04',15.00,15,18,'2025-10-04 19:51:13.589889','2025-10-05 04:45:05.000000','Exam 1',NULL,'COMPLETED',NULL,NULL,NULL,NULL,NULL,NULL,'MIDTERM'),('2025-10-04',15.00,16,16,'2025-10-04 20:45:13.098692','2025-10-04 20:45:13.096691','Assignment 3',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL,'FINAL_TERM');
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
  PRIMARY KEY (`course_id`),
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`),
  KEY `idx_courses_year_level` (`year_level`),
  KEY `idx_is_midterm_completed` (`is_midterm_completed`),
  CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (92.00,3.30,3,_binary '',7,'2025-10-04 19:43:45.539824','2025-10-05 04:45:05.000000',1,'2025','123','123asd',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude',_binary '\0','1st year','1',_binary '');
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
  `semester_term` enum('MIDTERM','FINAL_TERM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MIDTERM' COMMENT 'Which semester term this grade belongs to',
  PRIMARY KEY (`grade_id`),
  KEY `FKr3vxme485so9o2jlqhtbdu85x` (`assessment_id`),
  KEY `idx_grades_semester_term` (`semester_term`),
  CONSTRAINT `FKr3vxme485so9o2jlqhtbdu85x` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-10-03',_binary '\0',100.00,15.00,15.00,10,'2025-10-03 09:41:12.536633',10,'2025-10-03 17:41:14.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-09-04',_binary '\0',93.33,14.00,15.00,11,'2025-10-04 19:44:18.402852',11,'2025-10-05 03:47:39.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-09-06',_binary '\0',80.00,12.00,15.00,12,'2025-10-04 19:44:44.220641',12,'2025-10-05 03:47:50.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-09-17',_binary '\0',80.00,12.00,15.00,13,'2025-10-04 19:48:44.290569',13,'2025-10-05 03:50:48.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-04',_binary '\0',93.33,14.00,15.00,14,'2025-10-04 19:50:44.633114',14,'2025-10-05 03:50:59.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-04',_binary '\0',100.00,15.00,15.00,15,'2025-10-04 19:51:13.594894',15,'2025-10-05 03:51:15.000000','','PERCENTAGE',NULL,'MIDTERM'),('2025-10-04',_binary '\0',0.00,0.00,15.00,16,'2025-10-04 20:45:13.109702',16,'2025-10-04 20:45:13.109702','','POINTS',NULL,'FINAL_TERM');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'First Steps\' - Welcome to GradeGoal! Complete your profile setup.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"CONSISTENCY\", \"achievementId\": 1, \"achievementName\": \"First Steps\"}','2025-10-02 06:27:39','2025-10-02 06:31:35'),(2,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'A+ Student\' - Achieve a grade of 95% or higher.','LOW',1,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 7, \"achievementName\": \"A+ Student\"}','2025-10-02 06:27:39','2025-10-02 06:31:35'),(3,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Perfect Score\' - Achieve 100% on any assessment.','LOW',1,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 41, \"achievementName\": \"Perfect Score\"}','2025-10-02 06:27:39','2025-10-02 06:31:35'),(4,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Goal Setter\' - Create your first academic goal.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"GOAL\", \"achievementId\": 5, \"achievementName\": \"Goal Setter\"}','2025-10-02 06:48:18','2025-10-02 16:58:35'),(5,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Academic Excellence\' - Achieve a 3.9+ GPA in any semester.','MEDIUM',1,'{\"points\": 35, \"rarity\": \"RARE\", \"category\": \"ACADEMIC\", \"achievementId\": 39, \"achievementName\": \"Academic Excellence\"}','2025-10-02 06:48:19','2025-10-02 16:58:35'),(6,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Grade Entry Rookie\' - Enter your first 5 grades.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 2, \"achievementName\": \"Grade Entry Rookie\"}','2025-10-02 06:49:30','2025-10-02 16:58:35'),(7,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'First Steps\' - Welcome to GradeGoal! Complete your profile setup.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"CONSISTENCY\", \"achievementId\": 1, \"achievementName\": \"First Steps\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(8,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Goal Setter\' - Create your first academic goal.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"GOAL\", \"achievementId\": 5, \"achievementName\": \"Goal Setter\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(9,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Goal Crusher\' - Achieve your first academic goal.','LOW',1,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"GOAL\", \"achievementId\": 6, \"achievementName\": \"Goal Crusher\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(10,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'A+ Student\' - Achieve a grade of 95% or higher.','LOW',1,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 7, \"achievementName\": \"A+ Student\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(11,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Academic Excellence\' - Achieve a 3.9+ GPA in any semester.','MEDIUM',1,'{\"points\": 35, \"rarity\": \"RARE\", \"category\": \"ACADEMIC\", \"achievementId\": 39, \"achievementName\": \"Academic Excellence\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(12,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Perfect Score\' - Achieve 100% on any assessment.','LOW',1,'{\"points\": 20, \"rarity\": \"UNCOMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 41, \"achievementName\": \"Perfect Score\"}','2025-10-02 06:55:22','2025-10-02 16:58:35'),(13,1,NULL,'ACHIEVEMENT','? Achievement Unlocked!','You earned \'Grade Entry Rookie\' - Enter your first 5 grades.','LOW',1,'{\"points\": 5, \"rarity\": \"COMMON\", \"category\": \"ACADEMIC\", \"achievementId\": 2, \"achievementName\": \"Grade Entry Rookie\"}','2025-10-04 11:51:16','2025-10-04 13:31:19');
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
  `earned_context` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_achievement_id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  KEY `idx_earned_date` (`earned_at`),
  KEY `idx_user_date` (`user_id`,`earned_at`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (1,1,1,'2025-10-02 06:55:22',NULL),(2,1,5,'2025-10-02 06:55:22',NULL),(3,1,6,'2025-10-02 06:55:22',NULL),(4,1,7,'2025-10-02 06:55:22',NULL),(5,1,39,'2025-10-02 06:55:22',NULL),(6,1,41,'2025-10-02 06:55:22',NULL),(7,1,2,'2025-10-04 11:51:16',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=848 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_log`
--

LOCK TABLES `user_activity_log` WRITE;
/*!40000 ALTER TABLE `user_activity_log` DISABLE KEYS */;
INSERT INTO `user_activity_log` VALUES (1,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:27'),(2,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:27'),(3,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:29'),(4,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:29'),(5,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:31'),(6,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:31'),(7,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:32'),(8,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 06:27:32'),(9,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:29:20'),(10,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:29:20'),(11,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:29:50'),(12,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:29:50'),(13,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:31:29'),(14,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:31:29'),(15,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:31:29'),(16,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:31:29'),(17,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:31:38'),(18,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:31:38'),(19,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:31:38'),(20,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:31:38'),(21,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(22,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(23,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(24,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(25,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(26,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(27,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(28,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(29,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(30,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(31,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(32,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(33,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(34,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(35,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(36,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(37,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(38,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(39,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(40,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(41,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(42,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(43,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(44,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(45,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:24'),(46,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:24'),(47,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:24'),(48,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:24'),(49,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(50,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(51,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(52,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:24'),(53,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(54,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(55,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(56,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(57,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(58,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(59,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:36'),(60,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(61,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(62,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(63,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(64,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(65,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(66,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(67,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:36'),(68,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:36'),(69,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(70,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(71,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(72,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(73,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(74,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(75,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:37'),(76,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(77,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(78,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(79,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(80,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(81,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(82,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(83,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:52:37'),(84,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:52:37'),(85,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(86,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(87,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(88,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(89,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(90,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(91,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:53:03'),(92,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(93,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(94,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(95,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(96,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(97,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(98,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(99,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:53:03'),(100,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:03'),(101,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(102,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(103,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(104,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(105,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(106,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(107,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:53:04'),(108,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(109,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(110,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 4\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(111,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 3\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(112,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(113,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Quiz 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(114,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 2\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(115,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:53:04'),(116,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:53:04'),(117,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:55:49'),(118,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(119,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(120,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:55:49'),(121,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(122,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(123,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:55:49'),(124,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(125,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(126,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 06:55:49'),(127,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(128,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 06:55:49'),(129,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:30'),(130,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:30'),(131,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:30'),(132,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:30'),(133,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:43'),(134,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:43'),(135,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:43'),(136,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:43'),(137,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:53'),(138,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:53'),(139,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:53'),(140,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:53'),(141,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:55'),(142,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:55'),(143,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:22:55'),(144,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:22:55'),(145,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:23:10'),(146,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:23:10'),(147,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:23:10'),(148,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:23:10'),(149,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:23:59'),(150,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:23:59'),(151,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:23:59'),(152,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:23:59'),(153,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:24:20'),(154,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:24:20'),(155,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:24:20'),(156,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:24:20'),(157,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:33:46'),(158,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:33:46'),(159,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:33:46'),(160,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:33:46'),(161,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:18'),(162,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:18'),(163,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:18'),(164,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:18'),(165,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:18'),(166,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:18'),(167,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:32'),(168,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:32'),(169,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:32'),(170,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:32'),(171,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:32'),(172,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:32'),(173,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(174,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:39'),(175,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(176,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(177,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:39'),(178,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(179,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(180,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:39'),(181,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(182,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(183,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:50:39'),(184,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:50:39'),(185,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:30'),(186,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:51:30'),(187,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:30'),(188,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:30'),(189,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:51:30'),(190,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:30'),(191,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:33'),(192,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:51:33'),(193,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:33'),(194,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:33'),(195,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:51:33'),(196,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:51:33'),(197,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:31'),(198,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:56:31'),(199,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:31'),(200,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:31'),(201,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:56:31'),(202,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:31'),(203,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:33'),(204,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:56:33'),(205,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:33'),(206,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:33'),(207,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 16:56:33'),(208,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 16:56:33'),(209,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:51'),(210,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:01:51'),(211,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:51'),(212,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:51'),(213,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:01:51'),(214,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:51'),(215,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:58'),(216,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:01:58'),(217,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:58'),(218,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:58'),(219,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:01:58'),(220,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:01:58'),(221,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:00'),(222,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:02:00'),(223,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:00'),(224,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:00'),(225,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:02:00'),(226,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:00'),(227,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:44'),(228,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:02:44'),(229,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:44'),(230,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:44'),(231,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:02:44'),(232,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:02:44'),(233,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:04'),(234,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:07:04'),(235,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:04'),(236,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:04'),(237,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:07:04'),(238,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:04'),(239,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:05'),(240,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:07:05'),(241,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:05'),(242,1,'goal_achievement','{\"title\":\"Goal Achieved!\",\"description\":\"Completed Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:05'),(243,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:07:05'),(244,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:07:05'),(245,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:23'),(246,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:23'),(247,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:23'),(248,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:23'),(249,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:23'),(250,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:23'),(251,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:23'),(252,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:23'),(253,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:31'),(254,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:31'),(255,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:31'),(256,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:31'),(257,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:31'),(258,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:31'),(259,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:18:31'),(260,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:18:31'),(261,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:19:33'),(262,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:19:33'),(263,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:19:33'),(264,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:19:33'),(265,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:19:33'),(266,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:19:33'),(267,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:19:34'),(268,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:19:34'),(269,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:19:34'),(270,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:19:34'),(271,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:19:34'),(272,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:19:34'),(273,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:24:17'),(274,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:24:17'),(275,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:24:17'),(276,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 17:24:17'),(277,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 17:24:17'),(278,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 17:24:17'),(279,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 18:11:43'),(280,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 18:11:43'),(281,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 18:11:43'),(282,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 18:11:43'),(283,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 18:11:43'),(284,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 18:11:43'),(285,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 19:18:00'),(286,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 19:18:00'),(287,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 19:18:00'),(288,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 19:18:00'),(289,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 19:18:00'),(290,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 19:18:00'),(291,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 19:43:05'),(292,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 19:43:05'),(293,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 19:43:05'),(294,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 19:43:05'),(295,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 19:43:05'),(296,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 19:43:05'),(297,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:20:36'),(298,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:20:36'),(299,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:20:36'),(300,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:20:37'),(301,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:20:37'),(302,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:20:37'),(303,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:20:37'),(304,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:20:37'),(305,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:20:37'),(306,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:20:37'),(307,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:20:37'),(308,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:20:37'),(309,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:22:43'),(310,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:22:43'),(311,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:22:43'),(312,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-02 23:22:43'),(313,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-02 23:22:43'),(314,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-02 23:22:43'),(315,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:15'),(316,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:15'),(317,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:15'),(318,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:15'),(319,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:15'),(320,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:15'),(321,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:56'),(322,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:56'),(323,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:56'),(324,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:56'),(325,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:56'),(326,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:56'),(327,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:59'),(328,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:59'),(329,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:59'),(330,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:24:59'),(331,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:24:59'),(332,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:24:59'),(333,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:25:35'),(334,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:25:35'),(335,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:25:35'),(336,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:25:35'),(337,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:25:35'),(338,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:25:35'),(339,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:27:18'),(340,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:27:18'),(341,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:27:18'),(342,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:27:18'),(343,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:27:18'),(344,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:27:18'),(345,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:28:06'),(346,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:28:06'),(347,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:28:06'),(348,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:28:06'),(349,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:28:06'),(350,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:28:06'),(351,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:28:28'),(352,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:28:28'),(353,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:28:28'),(354,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:34:39'),(355,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:34:39'),(356,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:34:39'),(357,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 00:34:39'),(358,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 00:34:39'),(359,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 00:34:39'),(360,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:22'),(361,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:22'),(362,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:22'),(363,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:23'),(364,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:23'),(365,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:23'),(366,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:29'),(367,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:29'),(368,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:29'),(369,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:29'),(370,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:29'),(371,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:29'),(372,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:53'),(373,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:53'),(374,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:53'),(375,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:08:53'),(376,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:08:53'),(377,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:08:53'),(378,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:09:01'),(379,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:09:01'),(380,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:09:01'),(381,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:09:01'),(382,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:09:01'),(383,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:09:01'),(384,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:09:03'),(385,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:09:03'),(386,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:09:03'),(387,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:09:03'),(388,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:09:03'),(389,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:09:03'),(390,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:10:30'),(391,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:10:30'),(392,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:10:30'),(393,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:10:30'),(394,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:10:30'),(395,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:10:30'),(396,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:12:22'),(397,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:12:22'),(398,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:12:22'),(399,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:12:22'),(400,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:12:22'),(401,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:12:22'),(402,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:12:26'),(403,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:12:26'),(404,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:12:26'),(405,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:12:26'),(406,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:12:26'),(407,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:12:26'),(408,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:25:40'),(409,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:25:40'),(410,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:25:40'),(411,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Quiz 1 in Project Management\",\"courseName\":\"Project Management\",\"score\":\"Upcoming\"}',NULL,'2025-10-03 01:25:40'),(412,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Project Management\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:25:40'),(413,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for Project Management GPA GOAL - 100%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-03 01:25:40'),(414,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:41:19'),(415,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:41:19'),(416,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:58:42'),(417,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 01:58:42'),(418,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:03:46'),(419,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:03:46'),(420,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:11:16'),(421,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:11:16'),(422,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:14:34'),(423,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:14:34'),(424,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:14:56'),(425,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:14:56'),(426,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:04'),(427,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:04'),(428,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:18'),(429,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:18'),(430,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:25'),(431,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:15:25'),(432,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:16:25'),(433,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:16:25'),(434,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:16:33'),(435,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:16:33'),(436,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:18:18'),(437,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:18:18'),(438,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:38'),(439,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:38'),(440,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:46'),(441,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:46'),(442,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:49'),(443,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:19:49'),(444,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:07'),(445,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:07'),(446,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:10'),(447,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:10'),(448,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:12'),(449,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:12'),(450,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:23'),(451,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:20:23'),(452,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:22:31'),(453,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:22:31'),(454,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:28'),(455,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:28'),(456,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:29'),(457,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:29'),(458,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:35'),(459,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:35'),(460,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:41'),(461,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:24:41'),(462,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:29:14'),(463,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:29:14'),(464,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:29:23'),(465,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:29:23'),(466,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:51:32'),(467,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:51:32'),(468,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:51:33'),(469,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:51:33'),(470,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:11'),(471,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:11'),(472,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:14'),(473,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:14'),(474,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:17'),(475,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:18'),(476,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:21'),(477,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:21'),(478,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:24'),(479,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:24'),(480,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:41'),(481,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:41'),(482,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:46'),(483,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:46'),(484,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:53'),(485,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:53'),(486,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:56'),(487,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:56'),(488,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:58'),(489,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:52:58'),(490,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:07'),(491,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:07'),(492,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:11'),(493,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:11'),(494,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:14'),(495,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:14'),(496,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:17'),(497,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:17'),(498,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:20'),(499,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:53:20'),(500,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:57:35'),(501,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:57:35'),(502,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:57:41'),(503,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 02:57:41'),(504,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 03:08:48'),(505,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 03:08:48'),(506,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 03:08:49'),(507,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assignment 1\",\"courseName\":\"Course 1\",\"score\":\"15/15\"}',NULL,'2025-10-03 03:08:49'),(508,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:01:43'),(509,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:01:43'),(510,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:01:43'),(511,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:01:43'),(512,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:01:43'),(513,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:01:43'),(514,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:01:43'),(515,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:01:43'),(516,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:01:43'),(517,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:01:43'),(518,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:01:43'),(519,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:01:43'),(520,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:04:56'),(521,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:56'),(522,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:56'),(523,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:56'),(524,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:56'),(525,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:04:56'),(526,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:04:56'),(527,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:56'),(528,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:56'),(529,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:56'),(530,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:56'),(531,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:04:56'),(532,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:04:57'),(533,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:57'),(534,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:57'),(535,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:57'),(536,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:57'),(537,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:04:57'),(538,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:04:57'),(539,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:57'),(540,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:57'),(541,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:04:57'),(542,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:04:57'),(543,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:04:57'),(544,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:05:08'),(545,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:08'),(546,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:08'),(547,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:08'),(548,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:08'),(549,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:05:08'),(550,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:05:08'),(551,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:08'),(552,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:08'),(553,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:08'),(554,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:08'),(555,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:05:08'),(556,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:05:53'),(557,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:53'),(558,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:05:53'),(559,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:53'),(560,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:53'),(561,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:53'),(562,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:53'),(563,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:53'),(564,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:05:53'),(565,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:05:53'),(566,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:05:53'),(567,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:05:53'),(568,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:10:09'),(569,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:09'),(570,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:09'),(571,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:09'),(572,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:09'),(573,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:10:09'),(574,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:10:09'),(575,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:09'),(576,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:09'),(577,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:09'),(578,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:09'),(579,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:10:09'),(580,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:10:13'),(581,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:13'),(582,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:13'),(583,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:13'),(584,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:13'),(585,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:10:13'),(586,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:10:13'),(587,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:13'),(588,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:13'),(589,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:10:13'),(590,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:10:13'),(591,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:10:13'),(592,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:11:53'),(593,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:53'),(594,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:53'),(595,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:53'),(596,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:53'),(597,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:11:53'),(598,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:11:53'),(599,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:53'),(600,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:53'),(601,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:53'),(602,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:53'),(603,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:11:53'),(604,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:11:54'),(605,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:54'),(606,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:54'),(607,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:54'),(608,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:11:54'),(609,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:54'),(610,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:54'),(611,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:11:54'),(612,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:54'),(613,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:11:54'),(614,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:11:54'),(615,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:11:54'),(616,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:44:52'),(617,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:44:52'),(618,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:52'),(619,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:52'),(620,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:52'),(621,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:52'),(622,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:52'),(623,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:52'),(624,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:52'),(625,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:52'),(626,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:44:52'),(627,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:44:52'),(628,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:44:57'),(629,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:57'),(630,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:57'),(631,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:57'),(632,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:57'),(633,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:44:57'),(634,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:44:57'),(635,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:57'),(636,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:57'),(637,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:44:57'),(638,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:44:57'),(639,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:44:57'),(640,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:45'),(641,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:45'),(642,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:45'),(643,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:45'),(644,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:45'),(645,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:45'),(646,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:45'),(647,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:45'),(648,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:45'),(649,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:45'),(650,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:45'),(651,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:45'),(652,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:45'),(653,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:45'),(654,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:45'),(655,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:45'),(656,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:48'),(657,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:48'),(658,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:48'),(659,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:48'),(660,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:48'),(661,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:48'),(662,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:48'),(663,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:48'),(664,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:48'),(665,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:48'),(666,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:48'),(667,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:48'),(668,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:48'),(669,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:48'),(670,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:48'),(671,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:48'),(672,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:50'),(673,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:50'),(674,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:50'),(675,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:50'),(676,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:50'),(677,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:50'),(678,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 12:48:50'),(679,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:50'),(680,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 12:48:50'),(681,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:50'),(682,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 12:48:50'),(683,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:50'),(684,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:50'),(685,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 12:48:50'),(686,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 12:48:50'),(687,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 12:48:50'),(688,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:20'),(689,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assessment in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:20'),(690,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assessment\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:20'),(691,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assessment\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:20'),(692,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assessment\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:20'),(693,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assessment\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:20'),(694,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assessment\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:20'),(695,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:20'),(696,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:20'),(697,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assessment in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:20'),(698,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Assessment\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:20'),(699,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assessment\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:20'),(700,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assessment\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:20'),(701,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assessment\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:20'),(702,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assessment\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:20'),(703,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:20'),(704,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:29'),(705,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:29'),(706,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:29'),(707,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:29'),(708,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:29'),(709,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:29'),(710,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:29'),(711,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:29'),(712,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:29'),(713,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:29'),(714,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:29'),(715,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:29'),(716,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:29'),(717,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:29'),(718,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:29'),(719,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:29'),(720,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:31'),(721,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:31'),(722,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:31'),(723,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:31'),(724,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:31'),(725,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:31'),(726,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:31'),(727,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:31'),(728,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:07:31'),(729,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:07:31'),(730,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:07:31'),(731,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:31'),(732,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:31'),(733,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:07:31'),(734,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:07:31'),(735,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:07:31'),(736,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:01'),(737,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:01'),(738,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:01'),(739,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:01'),(740,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:01'),(741,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(742,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:01'),(743,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(744,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(745,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(746,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(747,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(748,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(749,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(750,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:01'),(751,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:01'),(752,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:01'),(753,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:01'),(754,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:01'),(755,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:01'),(756,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(757,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:01'),(758,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(759,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:01'),(760,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(761,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(762,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(763,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(764,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:01'),(765,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:01'),(766,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:01'),(767,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:01'),(768,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:21'),(769,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:21'),(770,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:21'),(771,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:21'),(772,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:21'),(773,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:21'),(774,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:21'),(775,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:21'),(776,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:31:21'),(777,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:31:21'),(778,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:31:21'),(779,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:21'),(780,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:21'),(781,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:31:21'),(782,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:31:21'),(783,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:31:21'),(784,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:00'),(785,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:00'),(786,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:00'),(787,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:00'),(788,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:00'),(789,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:00'),(790,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:00'),(791,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:00'),(792,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:00'),(793,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:00'),(794,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:00'),(795,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:00'),(796,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:00'),(797,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:00'),(798,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:00'),(799,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:00'),(800,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:01'),(801,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:01'),(802,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:01'),(803,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(804,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(805,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(806,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(807,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:01'),(808,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:01'),(809,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:01'),(810,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:01'),(811,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(812,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(813,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(814,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(815,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:01'),(816,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:01'),(817,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:01'),(818,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:01'),(819,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(820,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(821,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(822,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(823,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:01'),(824,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:01'),(825,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:01'),(826,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:01'),(827,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(828,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(829,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:01'),(830,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:01'),(831,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:01'),(832,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:19'),(833,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:19'),(834,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:19'),(835,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:19'),(836,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:19'),(837,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:19'),(838,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:19'),(839,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:19'),(840,1,'ai_analysis','{\"title\":\"AI Analysis Generated\",\"description\":\"New AI insights and recommendations for 123asd\",\"courseName\":\"123asd\",\"analysisType\":\"COURSE_ANALYSIS\"}',NULL,'2025-10-04 13:32:19'),(841,1,'grade_entry','{\"title\":\"New Assessment Added\",\"description\":\"Upcoming Assignment 3 in 123asd\",\"courseName\":\"123asd\",\"score\":\"Upcoming\"}',NULL,'2025-10-04 13:32:19'),(842,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"100% in Exam 1\",\"courseName\":\"123asd\",\"score\":\"15/15\"}',NULL,'2025-10-04 13:32:19'),(843,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Quiz 2\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:19'),(844,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Quiz 1\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:19'),(845,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"80% in Assignment 2\",\"courseName\":\"123asd\",\"score\":\"12/15\"}',NULL,'2025-10-04 13:32:19'),(846,1,'grade_entry','{\"title\":\"Grade Added\",\"description\":\"93.33% in Assignment 1\",\"courseName\":\"123asd\",\"score\":\"14/15\"}',NULL,'2025-10-04 13:32:19'),(847,1,'goal_created','{\"title\":\"New Goal Set\",\"description\":\"Set target for 123asd GPA GOAL - 97%\",\"goalType\":\"COURSE_GRADE\"}',NULL,'2025-10-04 13:32:19');
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (37,1,3,'2025-10-03',4.00,0.00,1,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 100.0, \"study_hours_logged\": 0.0}','2025-10-03 01:41:15','2025-10-03','FIRST','MIDTERM'),(38,1,7,'2025-10-05',3.73,0.00,5,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 93.3, \"study_hours_logged\": 0.0}','2025-10-04 11:51:16','2025-09-04','FIRST','MIDTERM'),(39,1,7,'2025-10-05',3.20,0.00,5,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 80.0, \"study_hours_logged\": 0.0}','2025-10-04 11:51:16','2025-09-06','FIRST','MIDTERM'),(40,1,7,'2025-10-05',3.20,0.00,5,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 80.0, \"study_hours_logged\": 0.0}','2025-10-04 11:51:16','2025-09-17','FIRST','MIDTERM'),(41,1,7,'2025-10-05',3.73,0.00,5,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 93.3, \"study_hours_logged\": 0.0}','2025-10-04 11:51:16','2025-10-04','FIRST','MIDTERM'),(42,1,7,'2025-10-05',4.00,0.00,5,0,0.00,'{\"completion_rate\": 100.0, \"percentage_score\": 100.0, \"study_hours_logged\": 0.0}','2025-10-04 11:51:16','2025-10-04','FIRST','MIDTERM');
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
INSERT INTO `user_progress` VALUES (1,180,1,320,0,'2025-10-05',3.3,0.00,'2025-10-04 21:32:18',3.3);
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
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_preference` enum('BOTH','MOBILE','WEB') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_year_level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '\0',_binary '\0','2025-09-26 10:25:43.042745',NULL,'2025-10-03 11:00:38.759230',1,'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUSEhIVFRUVFRUXFRUXFRUVFRYVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFSsdFx0rKysrKy0tLS0rLSstLS0tLSstLS0tLTctNy0rLTc3LTctKy03LTctLSsrKysrKy0rK//AABEIAOEA4AMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EADkQAAIBAgMFBQcDBAEFAAAAAAABAgMRBCExBRJBUWEGE3GBkSIyQlKhsdEUwfAjM2Jy4QcVU6LC/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIxEBAQACAgICAgMBAAAAAAAAAAECEQMSITEEE0FRBWGRMv/aAAwDAQACEQMRAD8A8+3gTEP+pB9P3ZdvrmgbFS9qD8fujikd1o1SHTKI1FzRfh4b7tFrq+S5k2K3tZRwcqt1Hhq97dWfUAlhoyqRSaipNK7eSefH0Napj4UYuFP23L3272WVsjFcl8v1Y8NjOQsdQ7tuErXTtdaNc0/IrpP8m3hlDEUZxqKMZwzhLSWfNvXNaGXga7V1krrO60tyZcv+s8pqnw0rsKgV0qeeWd/udfsbY0aKVSslKo84weah1fNk55SHjNszAbCq1UpWVOHzzuk1/itZGp/2CivjnN87KEfJZv6mnOs5u8syyCMu1rTrpn0tjUvk+7CobHpfJH0QfCmERpD3T6xlPYtH/wAcfRFNTs/RekLdYtr/AINzuyxRDdLrHP1dntaP1AqlDmjqJ00wTEYZM1x5rPbDP40vmMKOHuWxwyCJ07Mibd9uf6pPwZRK5NljZTJk2tccTXHTIjkbXYTISJkJjonhVUB6rL6gNMzrXFwtx0FfoJdBfoJc0dHbFzzDILvBeEq2Ukst61/BXyI/oJc19SUMLJcUTlZYrCZSozk7jqL1sWunzRJRy0I2067DVVkVoIeGk+KNbYWzrPfecvh5Lr4ldpInrbR/Z7ZfdrvJr23pH5V16nQqblqV0cP1CKVNROS3ddEmosooNoUulwei0H0qbKkC6m+iCIt8kVKkxt1lgTdtaIjKXRFO4ySoXEDNrkUyp8n5cS50iqaJsMJiKNzMqwsa9YDrw3kVjlpnnhtmyIFkkQsabZGEOJj0EWyuTJyK2LZxCTKposkQaJtXGA0LdJibJ210r3RbpIQbGkHEqlEvaKp8StkVNXNnZ07fYyabNjAyUVnqFid+WzQTD4Yf2bvIx4Y6S92K9SGM2zN+y0vJsmYC5OgwkqatvPXQ1KWJp89Dz+GJk9L+pt4Oo9W+BfovLsqOJi8rDUqabuYuCxGd2zVw+I8w2PIitBKN/MIhSjuJ3WfDkweq1KLs+AA8U0mm8wHlqxw6aTutPqC4jC2MOttCSWT/AJzKqW2Gnq5eL1/AaLdjTq0wCcDVw2NjNZ2Xnf6lOKpJ6WZFx0qZbYWIgDB+LgAMrCozhDMcZmjNCTK2TkyEhVUVsgyZCRFWw7jNjiuQ2REJiHoEV1SwrqZlT2i3weibOBw29qY1Be0jocEslYrKojXweDgtVc14bHoyV91X55GbhbczboVope8vUiU6ysVsRR90x8VTcHmddLEwfxIy9rYXfjeOds8syqJWLSx1tGa+Dp1Z2ay8XYC2bhVF7zR0WHd+BDTYWdWpTftqy4P82BsXiE80zcqZqzV11MTE7Ogs1f1yHsM7vLvPMLw+yt8JoUUuX3NLDjiMgVLs+9dfNr7A9XCTh7reXA6ulK0eGhn1pX1HfSJPLnZ1XNNSykgOaNfG4ZapGTiFnoR6Oq0xMYRrKzQkVyJyK5MVOIkGSbIsn2thXGEMLTTZxhXEBkV2zZYWYejfIrFGSihUUXdhlOrXk7QW6vQ1tm7ChvKU83wXBdWdLhsLFaJLyHbExyeH2LWnb+o/KMn9Wzaw3ZSXx1J2suKjnx0ub8ZqPG5LvW8iT1QOG2FThZ3lLxnNr72LatNRyjllbVtWfRsKtZNgtTNXAaLDUUbGHgm0YdLEpOxqYbGrmEXpszwLS0MzE4WwfS2vlZpP+P8AJTWxCld8x+E7rAxWBm17MoJ/6v8AJlt4qm77kn/puy+mp1W4JwT1QtE5uHaWccqjt0nBx+oZR21Cazy6rOPrwNieCU1bJq6e7Jbyy66mPi+z9NXcYunLhKDy846MLClX1JXV07oycXT4iaqUV7XtR5rh4rgWT9pXIUzFITY0lZtcmRuaRFhSK5MlJlcgoiNxhDNk7UwUxNg/6qHzof8AVQ+depeqJlP2vHBniofMvUksTH5l6oNH2n7EQjdpGthI7qMfD1Fe6d7fdmvhM11FYW91vYGVkaUM1YzcErpeBpUCVRbTp52yyNHD4W/AFoRb8zoYxUIb2WuRWM2nK6c72irqluU4tNzu2/8AFWVl5v6GLXxyjHUq7T4verr/ABjZ9Ltv9zmduVW0lw4hryqeJse9sQcveNXC4/qcGkaGzsZuZN5cOg7iWOe3d0sf1L6e01fU4XF42UrRg31tr9ANKa+ZeqJkO5R69h8TFrJhFGm5Xtwz8med9ndrT3t2Tb6s7vZWNtUT6O/h/LAd9bXNOPAtjUUlZ2XU0sTRjJKcVZP+ZmViKNirNIl2oxWFTMmdDdurGsqj4u4JjEZ03NYuNpeIOwvak0rNtLOwDKXIuS6TTTlYrlMarG5Uo24jC25ByGbIbwjcMxrhH6WfL6ojGjz9Duxx7enn3x7VFkKTZbaPyofeNPp/aewzB3UUjcwNQxMLnFeBrYWSXkcXLNV28Xp0mElY1aLMbBzukaSqWV7mFbNWhPQJxuMco7qZkQqDuryHKTExOwKkpuXeqN3d5NsIw+waWW+5Ta5+zH0X5NGpVSV27JAE9pN+5klxfEZtXCbPpQ92nCK8F+4dUwlOStKnGS/1TOcjUT1k80uL4slRxsqU7KbVnl4AWnRYXZ8IK0KSiukLEsRhITVpQXpmAT2xOWSqO3MIhjJ895dcxpY+L7PyjLfpWlzjlGXlwZu9ncO1BynFqTVs8rIvo14z0yfysshWs7E/le/DZo1rQ3dfUzsZLMdVcmuYPUZdvhEnlRUB6xdVYJVlqjNbme0cf6b6NP8A9l+TmqeIlD3ZNLlqvQ6XtHP2H5fdHLuJ7HweOZYXced8vO45TQuO1ucfRltPHwl0fX8mPLJ9CLOnL4PHl/THH5mUb8isx6WIlDR5cmaWFxsJatRfJ6eTPO5fhZ4evLt4/lYZ/wBMTHYhNyUE91vJvUDhFlzkVuqehjxY4enBeS5FNCjTb6LmQdQJkt1JPlf1MOfP9NeLHa/DqySXA0qFuPEzKTyDsOzzuR2cbewTsaMqulkZWFeQRCpc57G454gaGKs7vTxBK90rmbVxTl7EE5SfBZ+o4BmPx7k9cloA0Kk5vdgr83ol4sMwmx7u9Z3/AME8vN8fI38IoxVoRSS4JDAPCbEqNZz5fDbrq2FVOytWelRN8NPya2GldZl1PEJPUY2xF2cxNNfC15r9gKtiJ03u1Iyi+eqfgzuaWKBMVThUTUo3TAtuZo4u/lobeHxneRv8S16mJj9kSotyhedPivij+ULZWK9rXJoDjpKdbgScgOE75lqd2SCnPkBzCKraAq88gDnO0UvZfijnkzf2nT34yss17Xio5v6XMCx738fro8n53/SEkUF8iuZ6enBEERkiaQnEVxV20z3TfMh3XUJIzOLLCOmZKFSzS6oNxcrz8MkDLVeKLZ6+Z5/PNXw6uG+F9IKhGwPSQZBZHJm6MGlg6mSDKKzz0sZeGnY041DCxvK1IQi1nmQp0oxvuRUbvO2V/EGpVizeJNetQnDS4A1ELpRzAD6aEo2JUEExo30RRIIugyO5YSAJuRzu1dluEu8oxuvigtV/lFcuh0bRFIWzZmA37e1Fxy4poLTC5yurPgCTWYyVYmZl4yp+9/2/cMxUrgOKjlcqC0Lh4XcukJX800cmll5HX4Oe7GvN/DRf1aX7nJNZHs/x09vL+ffSmRFoeWZNQPWebvSpIexbYYNJuTNaItFrRHdOLJ2xXRpSnJQgrt6Lw1bfBdQydC2jv1/BHBydqsYu0pQju9VGalOK8UvoW77lonlrlp4nmct3k7OLUhqaDaKB4RC6SOfKN8KspwDaWhTTgE0IGNbSp0gmnBsUaIRRokntZQgH0KfIqp0wmhOzEB+GhYIpVLOzBaMy52HDENXKpxHhNMebEIp3ht8UolYtGlOYPKZKYLUzHISuzbuB4yeduhoOyRk13vM1xibQ8qbdKrbjG31v/wDJzVV8D0DYtOO5U3uNlbwX/Jxm0sGqdWcVon7Pg1c9b+Pz94vN+dj6yBRgM2TkyO6eq8tWx90tsKxURazrDNF+4Luzz874d+IOcCe9J6ybtzbLXTHjTPOznl040XGITSQ1KndIIp0jGt8avhEIpEaUAmFMzuLbsvpIKpg9KATTIsOZL4hNFIogEQQtK2tpuxde5RCGYTTQaEpqcbMuiyKiWWDR7RkiqUC1sqqMWh2VVdAXdL6jK2ipCtCYl8AJQNCVO5VOnldmkibWFicbOM5KLslb1tmZuJqOTu3dsJrZylLm2Udzc9r43HjjNz28b5HLcrr8BdwluBPdEXTO2OO1Q4kWghwIOI9pDqkS7noHdyXYPAyq1I04W3pOy5Li2+iR5uecj0MZtlRw19E34K5qYDs1iavuYebyvdrdVnbO8rcz1PYGxaeGhuwjeWTlNp3k+eei6Gq958+GRxW+XRI81odh8Wkk4R1t/ci0s9X04l1bshiYKP8ATUr3yhJStbg9D0S1ThCWT5L8lsXP5Z+it6E2LmVjy2WzKkfepzjrrFrTUUaB62p5Z365c1yAa2wcPOz7qKsvh9lW1zUSLF/Y84jTsXwgdfiex9O94VZRvomoyXhztoQh2N9n+9d34Rsrcs/Inqf2RzUKZcoG4+ydVX3asXyumvqgiPZOpb+5G9uCyvf65C6K7xgQiWpHSQ7LK2dSWqzstL6W4B2F7N0Vm7yy4y665eXoHQfZHJpIshTb0Tfgm9dDtqGzaMc1TimuNs75/kMVktPTIf1n9rhlsivJXVKX0T9GxS7O4lq+4vDeVzvExQlwDpE/ZXnj2DXWtGel8kn9nqCVsM45Si4vqmvueo7w8oJ6pPxQ+onI8knTBcdG0JeDPWsRsyjU9+lF20y/Bl4zsdhqiatOPhN2vzzHjNUZZ7jxVYcTo2PUav8A06hb2a8/OMX4aGPj+wWIgrwcKluCvGXknl9T0uLnw1rbzOTiy36cG6PQhKkbGLwMoPdqQcWtU019Qd4c6pyS+nNcKzHTK+7NPuCruSpmjq9Xp7Fw0WrYel09hP766htHCwh7kIKysrQisuWSJSb6tL6rxt/LEb8Pq0eLuvX0IjOzWZbmCu9tVdctCanfhn5sR7ExXj4k4zySBqdRafQnFgYneXmTsuBRF8LFkGGiSVNckSjT8CIoyXENDSzux+7tmPTY75gZ+6QnRQ+8yyIqcQ7hC7hdfUuTExHpVGmkT3ESsMwMlEewkxXAFYVhXHECGsOIAqrUIyVpRTT1TSaMjE9lMJPN0Yp843j9jcEVMrPVTcZfccbiP+n9Bu8Z1IrldP7ow9p9gqsE5U5KpnlC1pbvi3Zux6cM0aY82c/LO8GF/DnFT8PQW7wtf7BUaZONBEK0C/TLVKz88n5MlCD5u93wtr+wbGlne2Y7pZANBY0rr3c1nnYnCL8AlUMhRp5AFEU76/zwLor1GiunEuivvkBoKX8sO0uRN25CjEAUcrFkfESiPbp5gEXHjctircSG6SUAohKVie8NEdslSSY5CJJMRlYVhxACEIQAhDDgCEIQAhCEAZT0LRCLQnAfiIQkpshEYQQ4kJaiEMzzFDUQgB5ExCAFEcQhU4cURCEcOSQhCM4hCAEIQgBhxCAEIQgBCEIA/9k=','pinpinramirez@gmail.com','Prince','Ramirez',NULL,'$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB','USER',NULL,NULL,'prince','1'),(_binary '',_binary '','2025-09-29 00:00:00.000000',NULL,'2025-09-29 00:00:00.000000',2,NULL,'admin@gradegoal.com','Admin','User',NULL,'$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB','ADMIN',NULL,NULL,NULL,'1'),(_binary '\0',_binary '\0','2025-10-01 16:00:21.442999',NULL,'2025-10-02 05:58:49.901739',3,'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUSEhIVFRUVFRUXFRUXFRUVFRYVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFSsdFx0rKysrKy0tLS0rLSstLS0tLSstLS0tLTctNy0rLTc3LTctKy03LTctLSsrKysrKy0rK//AABEIAOEA4AMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EADkQAAIBAgMFBQcDBAEFAAAAAAABAgMRBCExBRJBUWEGE3GBkSIyQlKhsdEUwfAjM2Jy4QcVU6LC/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIxEBAQACAgICAgMBAAAAAAAAAAECEQMSITEEE0FRBWGRMv/aAAwDAQACEQMRAD8A8+3gTEP+pB9P3ZdvrmgbFS9qD8fujikd1o1SHTKI1FzRfh4b7tFrq+S5k2K3tZRwcqt1Hhq97dWfUAlhoyqRSaipNK7eSefH0Napj4UYuFP23L3272WVsjFcl8v1Y8NjOQsdQ7tuErXTtdaNc0/IrpP8m3hlDEUZxqKMZwzhLSWfNvXNaGXga7V1krrO60tyZcv+s8pqnw0rsKgV0qeeWd/udfsbY0aKVSslKo84weah1fNk55SHjNszAbCq1UpWVOHzzuk1/itZGp/2CivjnN87KEfJZv6mnOs5u8syyCMu1rTrpn0tjUvk+7CobHpfJH0QfCmERpD3T6xlPYtH/wAcfRFNTs/RekLdYtr/AINzuyxRDdLrHP1dntaP1AqlDmjqJ00wTEYZM1x5rPbDP40vmMKOHuWxwyCJ07Mibd9uf6pPwZRK5NljZTJk2tccTXHTIjkbXYTISJkJjonhVUB6rL6gNMzrXFwtx0FfoJdBfoJc0dHbFzzDILvBeEq2Ukst61/BXyI/oJc19SUMLJcUTlZYrCZSozk7jqL1sWunzRJRy0I2067DVVkVoIeGk+KNbYWzrPfecvh5Lr4ldpInrbR/Z7ZfdrvJr23pH5V16nQqblqV0cP1CKVNROS3ddEmosooNoUulwei0H0qbKkC6m+iCIt8kVKkxt1lgTdtaIjKXRFO4ySoXEDNrkUyp8n5cS50iqaJsMJiKNzMqwsa9YDrw3kVjlpnnhtmyIFkkQsabZGEOJj0EWyuTJyK2LZxCTKposkQaJtXGA0LdJibJ210r3RbpIQbGkHEqlEvaKp8StkVNXNnZ07fYyabNjAyUVnqFid+WzQTD4Yf2bvIx4Y6S92K9SGM2zN+y0vJsmYC5OgwkqatvPXQ1KWJp89Dz+GJk9L+pt4Oo9W+BfovLsqOJi8rDUqabuYuCxGd2zVw+I8w2PIitBKN/MIhSjuJ3WfDkweq1KLs+AA8U0mm8wHlqxw6aTutPqC4jC2MOttCSWT/AJzKqW2Gnq5eL1/AaLdjTq0wCcDVw2NjNZ2Xnf6lOKpJ6WZFx0qZbYWIgDB+LgAMrCozhDMcZmjNCTK2TkyEhVUVsgyZCRFWw7jNjiuQ2REJiHoEV1SwrqZlT2i3weibOBw29qY1Be0jocEslYrKojXweDgtVc14bHoyV91X55GbhbczboVope8vUiU6ysVsRR90x8VTcHmddLEwfxIy9rYXfjeOds8syqJWLSx1tGa+Dp1Z2ay8XYC2bhVF7zR0WHd+BDTYWdWpTftqy4P82BsXiE80zcqZqzV11MTE7Ogs1f1yHsM7vLvPMLw+yt8JoUUuX3NLDjiMgVLs+9dfNr7A9XCTh7reXA6ulK0eGhn1pX1HfSJPLnZ1XNNSykgOaNfG4ZapGTiFnoR6Oq0xMYRrKzQkVyJyK5MVOIkGSbIsn2thXGEMLTTZxhXEBkV2zZYWYejfIrFGSihUUXdhlOrXk7QW6vQ1tm7ChvKU83wXBdWdLhsLFaJLyHbExyeH2LWnb+o/KMn9Wzaw3ZSXx1J2suKjnx0ub8ZqPG5LvW8iT1QOG2FThZ3lLxnNr72LatNRyjllbVtWfRsKtZNgtTNXAaLDUUbGHgm0YdLEpOxqYbGrmEXpszwLS0MzE4WwfS2vlZpP+P8AJTWxCld8x+E7rAxWBm17MoJ/6v8AJlt4qm77kn/puy+mp1W4JwT1QtE5uHaWccqjt0nBx+oZR21Cazy6rOPrwNieCU1bJq6e7Jbyy66mPi+z9NXcYunLhKDy846MLClX1JXV07oycXT4iaqUV7XtR5rh4rgWT9pXIUzFITY0lZtcmRuaRFhSK5MlJlcgoiNxhDNk7UwUxNg/6qHzof8AVQ+depeqJlP2vHBniofMvUksTH5l6oNH2n7EQjdpGthI7qMfD1Fe6d7fdmvhM11FYW91vYGVkaUM1YzcErpeBpUCVRbTp52yyNHD4W/AFoRb8zoYxUIb2WuRWM2nK6c72irqluU4tNzu2/8AFWVl5v6GLXxyjHUq7T4verr/ABjZ9Ltv9zmduVW0lw4hryqeJse9sQcveNXC4/qcGkaGzsZuZN5cOg7iWOe3d0sf1L6e01fU4XF42UrRg31tr9ANKa+ZeqJkO5R69h8TFrJhFGm5Xtwz8med9ndrT3t2Tb6s7vZWNtUT6O/h/LAd9bXNOPAtjUUlZ2XU0sTRjJKcVZP+ZmViKNirNIl2oxWFTMmdDdurGsqj4u4JjEZ03NYuNpeIOwvak0rNtLOwDKXIuS6TTTlYrlMarG5Uo24jC25ByGbIbwjcMxrhH6WfL6ojGjz9Duxx7enn3x7VFkKTZbaPyofeNPp/aewzB3UUjcwNQxMLnFeBrYWSXkcXLNV28Xp0mElY1aLMbBzukaSqWV7mFbNWhPQJxuMco7qZkQqDuryHKTExOwKkpuXeqN3d5NsIw+waWW+5Ta5+zH0X5NGpVSV27JAE9pN+5klxfEZtXCbPpQ92nCK8F+4dUwlOStKnGS/1TOcjUT1k80uL4slRxsqU7KbVnl4AWnRYXZ8IK0KSiukLEsRhITVpQXpmAT2xOWSqO3MIhjJ895dcxpY+L7PyjLfpWlzjlGXlwZu9ncO1BynFqTVs8rIvo14z0yfysshWs7E/le/DZo1rQ3dfUzsZLMdVcmuYPUZdvhEnlRUB6xdVYJVlqjNbme0cf6b6NP8A9l+TmqeIlD3ZNLlqvQ6XtHP2H5fdHLuJ7HweOZYXced8vO45TQuO1ucfRltPHwl0fX8mPLJ9CLOnL4PHl/THH5mUb8isx6WIlDR5cmaWFxsJatRfJ6eTPO5fhZ4evLt4/lYZ/wBMTHYhNyUE91vJvUDhFlzkVuqehjxY4enBeS5FNCjTb6LmQdQJkt1JPlf1MOfP9NeLHa/DqySXA0qFuPEzKTyDsOzzuR2cbewTsaMqulkZWFeQRCpc57G454gaGKs7vTxBK90rmbVxTl7EE5SfBZ+o4BmPx7k9cloA0Kk5vdgr83ol4sMwmx7u9Z3/AME8vN8fI38IoxVoRSS4JDAPCbEqNZz5fDbrq2FVOytWelRN8NPya2GldZl1PEJPUY2xF2cxNNfC15r9gKtiJ03u1Iyi+eqfgzuaWKBMVThUTUo3TAtuZo4u/lobeHxneRv8S16mJj9kSotyhedPivij+ULZWK9rXJoDjpKdbgScgOE75lqd2SCnPkBzCKraAq88gDnO0UvZfijnkzf2nT34yss17Xio5v6XMCx738fro8n53/SEkUF8iuZ6enBEERkiaQnEVxV20z3TfMh3XUJIzOLLCOmZKFSzS6oNxcrz8MkDLVeKLZ6+Z5/PNXw6uG+F9IKhGwPSQZBZHJm6MGlg6mSDKKzz0sZeGnY041DCxvK1IQi1nmQp0oxvuRUbvO2V/EGpVizeJNetQnDS4A1ELpRzAD6aEo2JUEExo30RRIIugyO5YSAJuRzu1dluEu8oxuvigtV/lFcuh0bRFIWzZmA37e1Fxy4poLTC5yurPgCTWYyVYmZl4yp+9/2/cMxUrgOKjlcqC0Lh4XcukJX800cmll5HX4Oe7GvN/DRf1aX7nJNZHs/x09vL+ffSmRFoeWZNQPWebvSpIexbYYNJuTNaItFrRHdOLJ2xXRpSnJQgrt6Lw1bfBdQydC2jv1/BHBydqsYu0pQju9VGalOK8UvoW77lonlrlp4nmct3k7OLUhqaDaKB4RC6SOfKN8KspwDaWhTTgE0IGNbSp0gmnBsUaIRRokntZQgH0KfIqp0wmhOzEB+GhYIpVLOzBaMy52HDENXKpxHhNMebEIp3ht8UolYtGlOYPKZKYLUzHISuzbuB4yeduhoOyRk13vM1xibQ8qbdKrbjG31v/wDJzVV8D0DYtOO5U3uNlbwX/Jxm0sGqdWcVon7Pg1c9b+Pz94vN+dj6yBRgM2TkyO6eq8tWx90tsKxURazrDNF+4Luzz874d+IOcCe9J6ybtzbLXTHjTPOznl040XGITSQ1KndIIp0jGt8avhEIpEaUAmFMzuLbsvpIKpg9KATTIsOZL4hNFIogEQQtK2tpuxde5RCGYTTQaEpqcbMuiyKiWWDR7RkiqUC1sqqMWh2VVdAXdL6jK2ipCtCYl8AJQNCVO5VOnldmkibWFicbOM5KLslb1tmZuJqOTu3dsJrZylLm2Udzc9r43HjjNz28b5HLcrr8BdwluBPdEXTO2OO1Q4kWghwIOI9pDqkS7noHdyXYPAyq1I04W3pOy5Li2+iR5uecj0MZtlRw19E34K5qYDs1iavuYebyvdrdVnbO8rcz1PYGxaeGhuwjeWTlNp3k+eei6Gq958+GRxW+XRI81odh8Wkk4R1t/ci0s9X04l1bshiYKP8ATUr3yhJStbg9D0S1ThCWT5L8lsXP5Z+it6E2LmVjy2WzKkfepzjrrFrTUUaB62p5Z365c1yAa2wcPOz7qKsvh9lW1zUSLF/Y84jTsXwgdfiex9O94VZRvomoyXhztoQh2N9n+9d34Rsrcs/Inqf2RzUKZcoG4+ydVX3asXyumvqgiPZOpb+5G9uCyvf65C6K7xgQiWpHSQ7LK2dSWqzstL6W4B2F7N0Vm7yy4y665eXoHQfZHJpIshTb0Tfgm9dDtqGzaMc1TimuNs75/kMVktPTIf1n9rhlsivJXVKX0T9GxS7O4lq+4vDeVzvExQlwDpE/ZXnj2DXWtGel8kn9nqCVsM45Si4vqmvueo7w8oJ6pPxQ+onI8knTBcdG0JeDPWsRsyjU9+lF20y/Bl4zsdhqiatOPhN2vzzHjNUZZ7jxVYcTo2PUav8A06hb2a8/OMX4aGPj+wWIgrwcKluCvGXknl9T0uLnw1rbzOTiy36cG6PQhKkbGLwMoPdqQcWtU019Qd4c6pyS+nNcKzHTK+7NPuCruSpmjq9Xp7Fw0WrYel09hP766htHCwh7kIKysrQisuWSJSb6tL6rxt/LEb8Pq0eLuvX0IjOzWZbmCu9tVdctCanfhn5sR7ExXj4k4zySBqdRafQnFgYneXmTsuBRF8LFkGGiSVNckSjT8CIoyXENDSzux+7tmPTY75gZ+6QnRQ+8yyIqcQ7hC7hdfUuTExHpVGmkT3ESsMwMlEewkxXAFYVhXHECGsOIAqrUIyVpRTT1TSaMjE9lMJPN0Yp843j9jcEVMrPVTcZfccbiP+n9Bu8Z1IrldP7ow9p9gqsE5U5KpnlC1pbvi3Zux6cM0aY82c/LO8GF/DnFT8PQW7wtf7BUaZONBEK0C/TLVKz88n5MlCD5u93wtr+wbGlne2Y7pZANBY0rr3c1nnYnCL8AlUMhRp5AFEU76/zwLor1GiunEuivvkBoKX8sO0uRN25CjEAUcrFkfESiPbp5gEXHjctircSG6SUAohKVie8NEdslSSY5CJJMRlYVhxACEIQAhDDgCEIQAhCEAZT0LRCLQnAfiIQkpshEYQQ4kJaiEMzzFDUQgB5ExCAFEcQhU4cURCEcOSQhCM4hCAEIQgBhxCAEIQgBCEIA/9k=','princeramirez87@yahoo.com','Harvey','Ramirez',NULL,NULL,NULL,'USER','c5mrm50mMtOnstM_KYVISE:APA91bF4NpjNh-9jOV6hTVPAFRci4xAhfTaQzlIUqj-h1CbHG6y1p89OUrJPc4W5l9iCTTmJJob7UxWaIub1Yi4xYAwDMn912i-5iJfogjNkXznoUoBsyp4',_binary '','princeramirez87@yahoo.com','1'),(_binary '\0',_binary '\0','2025-10-01 22:34:46.985216',NULL,'2025-10-02 06:13:46.585660',4,NULL,'andycuenca1017@gmail.com','andres','ramirez',NULL,NULL,NULL,'USER',NULL,_binary '','andycuenca1017@gmail.com','1');
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
    DECLARE total_weight DECIMAL(5,2) DEFAULT 0.00;
    DECLARE weighted_sum DECIMAL(8,4) DEFAULT 0.00;
    DECLARE handle_missing_setting VARCHAR(255) DEFAULT 'exclude';
    
    -- Get the handle_missing setting for this course
    SELECT handle_missing 
    INTO handle_missing_setting
    FROM courses 
    WHERE course_id = p_course_id;
    
    -- Calculate weighted grade using category weights (all terms combined)
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all categories, treat empty categories as 0%
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGradeOverall(ac.category_id) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(ac.weight_percentage), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = p_course_id;
        
    ELSE
        -- Default behavior: exclude categories with no completed assessments
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGradeOverall(ac.category_id) * ac.weight_percentage) / 100
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
    
    -- Calculate final course grade (all terms combined)
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

-- Dump completed on 2025-10-05  5:35:21
