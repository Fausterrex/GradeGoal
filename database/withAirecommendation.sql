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
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,100.00,2,'2025-09-26 10:32:23.580904',1,'2025-09-26 10:32:23.580904',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,95.00,3,'2025-09-26 20:28:33.863897',2,'2025-09-26 20:28:33.863897',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analysis`
--

LOCK TABLES `ai_analysis` WRITE;
/*!40000 ALTER TABLE `ai_analysis` DISABLE KEYS */;
INSERT INTO `ai_analysis` VALUES (1,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Low current GPA\", \"High target grade requiring significant improvement\"], \"keyAchievements\": [\"Completed all assignments and quizzes\"], \"progressSummary\": \"The student is currently at risk of not achieving the target grade in Course 1. Performance on Exam 1 will be critical.\"}, \"studyStrategy\": {\"tips\": [\"Prioritize key concepts\", \"Practice with past exams\", \"Get enough sleep before the exam\"], \"focus\": \"Exam 1 preparation\", \"schedule\": \"Daily review of lecture notes, weekly practice problems, and dedicated exam preparation sessions\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"Exam 1 accounts for 40% of the final grade and is the only remaining assessment. Performance here is crucial.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"All quizzes completed. Analyze past performance to identify knowledge gaps.\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"All assignments completed. Focus on applying feedback to future work in other courses.\", \"priority\": \"LOW\", \"needsAttention\": false}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"LOW\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"N/A\"}, \"assignments\": {\"confidence\": \"HIGH\", \"neededScore\": \"N/A\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target goal of 100% is potentially achievable, but requires a near-perfect score on the upcoming Exam 1. The current weighted grade is 76.67%. To achieve 100%, the Exam 1 score must be very high. Let x = exam score. Final Grade = (0.3 * Assignments) + (0.3 * Quizzes) + (0.4 * Exam).  Since assignments and quizzes are already completed we can calculate their contributions: (0.3 * 15/15) + (0.3 * 8/15) = 0.3 + 0.16 = 0.46  We also know that the current grade is 76.67.  So, we can set up the following equation: (0.3 * 15/15) + (0.3 * 8/15) + (0.4 * x/15) = 0.7667  Which becomes: 0.3 + 0.16 + (0.4 * x/15) = 0.7667  0.46 + (0.4 * x/15) = 0.7667  0.4 * x/15 = 0.3067  0.4 * x = 4.6005  x = 11.50125  Therefore, to maintain the current grade, the exam score has to be roughly 11.50125 out of 15.  To achieve a 100% the score on Exam 1 needs to be 15/15. Final Grade = (0.3 * 15/15) + (0.3 * 8/15) + (0.4 * 15/15) = 0.3 + 0.16 + 0.4 = 0.867  So, the final grade would be 86.7% if a perfect score is achieved on Exam 1.  Since the assignments and quizzes do not have grades, the current grade is inaccurate.  Therefore, the target goal is unlikely to be achieved.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Current grade is 76.67%. Achieving a 100% requires a perfect score on Exam 1, which may not be realistic. The maximum achievable grade is 86.7% with a perfect exam score. The minimum score required on Exam 1 to achieve the target is 15/15.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"HIGH\", \"percentage\": \"76.67%\", \"explanation\": \"Currently, the final grade is 76.67%. Since all assessments are marked as complete with no grades for the categories, the system is reporting the current grade as the final grade. This will change as more assessments are graded.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review Course 1 notes for 30 minutes\", \"Complete practice problems related to Exam 1 topics\", \"Summarize key concepts from each lecture\"], \"timeManagement\": \"Allocate specific time slots for Course 1 study each day, prioritizing Exam 1 preparation. Use a planner or calendar to stay organized.\", \"examPreparation\": [\"Create a detailed study plan for Exam 1\", \"Practice with past exams or sample questions\", \"Get enough sleep and eat a healthy meal before the exam\"], \"weeklyStrategies\": [\"Dedicate 2 hours each week to Exam 1 preparation\", \"Review all quizzes and assignments to identify weak areas\", \"Attend tutoring sessions or office hours for Course 1\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Exam 1\", \"impact\": \"Significant impact on final grade due to exam weight (40%)\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Develop a comprehensive study plan for Exam 1. Focus on reviewing all lecture notes, completing practice problems, and understanding key concepts. Prioritize areas where you struggled on previous quizzes and assignments.\", \"actionButton\": {\"text\": \"Create Study Schedule\", \"action\": \"CREATE_SCHEDULE\", \"enabled\": true}}, {\"title\": \"Review Completed Assessments\", \"impact\": \"Improved understanding of course material and better performance on Exam 1\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Carefully review your completed assignments and quizzes in Course 1. Identify areas where you struggled and understand the correct solutions. Use this knowledge to improve your understanding of the material and avoid repeating mistakes on Exam 1.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Improve Time Management\", \"impact\": \"Increased productivity and reduced stress\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Allocate specific time slots for studying Course 1 and preparing for Exam 1. Use a planner or calendar to stay organized and avoid procrastination. Break down large tasks into smaller, more manageable steps.\", \"actionButton\": {\"text\": \"Add Study Session\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Seek Assistance When Needed\", \"impact\": \"Improved understanding of course material and increased confidence\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Don\'t hesitate to seek help from the professor, teaching assistants, or classmates if you are struggling with the material. Attend office hours, participate in study groups, or utilize online resources. Addressing your questions and concerns promptly can prevent further difficulties.\", \"actionButton\": {\"text\": \"Find a Tutor\", \"action\": \"FIND_TUTOR\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"Exam 1 is weighted at 40% of the final grade. Achieving a high score is crucial to significantly improve the final grade. Aim for mastery of the material.\", \"recommendedScore\": \"95%\"}, \"quizzes\": {\"priority\": \"LOW\", \"reasoning\": \"All quizzes are completed. Analyze past performance to identify knowledge gaps.\", \"recommendedScore\": \"N/A\"}, \"assignments\": {\"priority\": \"LOW\", \"reasoning\": \"All assignments are completed. Focus on applying feedback to future work in other courses, even if there are no further assignments in this course.\", \"recommendedScore\": \"N/A\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:24:17','2025-09-26 13:29:44','2025-09-26 14:24:17',0),(2,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Low quiz score\", \"Upcoming exam is crucial\"], \"keyAchievements\": [\"Completed assignments and quizzes\"], \"progressSummary\": \"Current course grade is 76.67%. Requires significant improvement on the upcoming Exam 1 to achieve the target of 100%.\"}, \"studyStrategy\": {\"tips\": [\"Prioritize topics based on their weight in the exam.\", \"Use active recall techniques to test your understanding.\", \"Seek help from the professor or teaching assistant if you are struggling with any concepts.\"], \"focus\": \"Exam 1 preparation and review of Quiz 1 material.\", \"schedule\": \"Dedicate at least 2 hours per day to Course 1, focusing on exam preparation and reviewing Quiz 1 material.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"The upcoming exam has a significant weight (40%) and requires thorough preparation.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quiz 1 score was low (53.33%). Review quiz material.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Assignments are complete.\", \"priority\": \"LOW\", \"needsAttention\": false}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"LOW\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"N/A\"}, \"assignments\": {\"confidence\": \"HIGH\", \"neededScore\": \"N/A\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target grade of 100% is theoretically achievable but requires a perfect score on the final exam.  Current weighted grade is calculated as follows: Assignment 1 (15/15) contributes (30% * (15/15)) = 30%. Quiz 1 (8/15) contributes (30% * (8/15)) = 16%. Therefore, the current weighted grade is 30% + 16% = 46%. To reach 100%, the exam (40% weight) needs to contribute an additional 54%. This translates to needing to score 100% (15/15) on exam 1.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Weighted grade: Assignments (30% * 1.0) + Quizzes (30% * (8/15)) + Exam (40% * (score/15)).  Minimum score required on Exam 1: 15/15.  Achievability depends entirely on the student\'s performance on Exam 1.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"MEDIUM\", \"percentage\": \"79.33%\", \"explanation\": \"Based on current scores (Assignment 1: 100%, Quiz 1: 53.33%) and assuming average performance (76.67%) on the upcoming exam. This is a preliminary estimate as the exam is a large portion of the final grade.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review lecture notes daily\", \"Complete practice problems related to the exam topics\", \"Allocate specific study time for Course 1\"], \"timeManagement\": \"Prioritize studying for Course 1, especially the exam material. Break down study sessions into smaller, manageable chunks to avoid burnout.\", \"examPreparation\": [\"Create a study schedule and stick to it\", \"Review all course materials, including lecture notes, readings, and assignments\", \"Focus on understanding the underlying concepts rather than memorizing facts\"], \"weeklyStrategies\": [\"Attend office hours to clarify any doubts\", \"Form a study group to discuss concepts and practice problems\", \"Take practice exams under timed conditions\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Exam 1\", \"impact\": \"Significant impact on final grade, potentially achieving target goal.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Exam 1 accounts for 40% of your grade and requires a perfect score to reach your target. Create a study plan immediately.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"CREATE_STUDY_PLAN\", \"enabled\": true}}, {\"title\": \"Review Quiz 1 Material\", \"impact\": \"Improved understanding of concepts will benefit exam performance.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Your score on Quiz 1 was low (53.33%). Identify the topics you struggled with and review the relevant material.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Exam Questions\", \"impact\": \"Increased confidence and improved exam performance.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Find practice exam questions related to the exam topics. This will help you get familiar with the exam format and identify areas where you need more practice.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Time Management\", \"impact\": \"Improved focus and reduced stress.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Allocate sufficient time for studying Course 1, especially for Exam 1 preparation. Break down study sessions into smaller, manageable chunks.\", \"actionButton\": {\"text\": \"Add Study Session\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"A perfect score on the final exam is necessary to reach the target goal of 100%. Focus on thorough preparation.\", \"recommendedScore\": \"100%\"}, \"quizzes\": {\"priority\": \"LOW\", \"reasoning\": \"All quizzes are completed. Review completed quizzes for areas of improvement for future courses.\", \"recommendedScore\": \"N/A\"}, \"assignments\": {\"priority\": \"LOW\", \"reasoning\": \"All assignments are completed. Review completed assignments for areas of improvement for future courses.\", \"recommendedScore\": \"N/A\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:29:44','2025-09-26 13:38:08','2025-09-26 14:29:44',0),(3,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Need to score high on Assignments, Quizzes, and Exams\"], \"keyAchievements\": [\"Completed Assignment 1\", \"Completed Quiz 1\"], \"progressSummary\": \"The student is currently at risk of not achieving their target grade of 100% in Course 1. While the current course grade is 76.67%, it\'s based on non-weighted components. Weighted grade percentage is 0%.\"}, \"studyStrategy\": {\"tips\": [\"Prioritize key concepts.\", \"Use flashcards for memorization.\", \"Take practice exams under timed conditions.\"], \"focus\": \"Exam Preparation\", \"schedule\": \"Daily: 2 hours reviewing notes and practice problems. Weekly: 4 hours dedicated to exam-style questions and review.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"Exams are worth 40% of the final grade. Prepare thoroughly for Exam 1 by reviewing all course material and practicing exam-style questions.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quizzes are worth 30% of the final grade and 100% is needed to reach the target. Review course material regularly and practice answering quiz-style questions.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Assignments are worth 30% of the final grade and 100% is needed to reach the target. Focus on understanding the assignment requirements and submitting high-quality work.\", \"priority\": \"HIGH\", \"needsAttention\": true}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"assignments\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The student currently has a 76.67% in the course. To achieve a 100% target, near-perfect scores are needed on all upcoming assessments.  First, we must calculate the weighted percentage for the completed assessments.  Assignment 1 is worth 0% of the final grade, and Quiz 1 is worth 0% of the final grade.  Therefore, the current weighted grade percentage is 0%.  This means that the current 76.67% is based on assessments that are not weighted.  To achieve the target of 100%, the student needs to score 100% on the assignments, quizzes, and exams.  Given the Exam is worth 40% of the final grade, the student needs to prepare well for Exam 1.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"The target is achievable but requires significant effort and near-perfect performance on all remaining assessments. Exam 1 is worth 40% of the overall grade, so the student must achieve a high score. The student must also achieve 100% on both assignments and quizzes to reach the goal.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"HIGH\", \"percentage\": \"76.67%\", \"explanation\": \"Since no graded assessments within the weighted categories (Assignments, Quizzes, Exam) are recorded, the current course grade is the predicted final grade.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review notes from previous lectures for at least 30 minutes.\", \"Solve practice problems related to the course material.\", \"Summarize key concepts in your own words.\"], \"timeManagement\": \"Allocate specific time slots for studying Course 1 each day and stick to the schedule.\", \"examPreparation\": [\"Create a detailed study schedule.\", \"Review all course material thoroughly.\", \"Take practice exams under timed conditions.\"], \"weeklyStrategies\": [\"Attend office hours to clarify doubts.\", \"Form a study group with classmates to discuss challenging topics.\", \"Complete all assigned readings and exercises on time.\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare Diligently for Exam 1\", \"impact\": \"Significant impact on final grade due to the high weight of the exam.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Exam 1 is worth 40% of the final grade. Dedicate significant time to reviewing course material, practicing problems, and understanding key concepts. Create a study schedule and stick to it.\", \"actionButton\": {\"text\": \"Create Study Schedule\", \"action\": \"SCHEDULE_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Maximize Scores on Assignments and Quizzes\", \"impact\": \"Significant impact on final grade due to the combined weight of assignments and quizzes.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Aim for 100% on all assignments and quizzes. Even small point deductions can make it difficult to reach the 100% target. Understand the assignment requirements and quiz topics thoroughly.\", \"actionButton\": {\"text\": \"Review Assignment Rubrics\", \"action\": \"REVIEW_ASSESSMENT_RUBRIC\", \"enabled\": true}}, {\"title\": \"Improve Time Management Skills\", \"impact\": \"Improved efficiency and reduced stress.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Effective time management is crucial for success in this course. Allocate specific time slots for studying Course 1 each day and stick to the schedule. Prioritize tasks and avoid procrastination.\", \"actionButton\": {\"text\": \"Set Study Reminders\", \"action\": \"SET_STUDY_REMINDERS\", \"enabled\": true}}, {\"title\": \"Actively Participate in Class\", \"impact\": \"Increased comprehension and engagement with course material.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Engage in class discussions, ask questions, and seek clarification on unclear topics. Active participation can enhance understanding and improve retention.\", \"actionButton\": {\"text\": \"Review Lecture Notes\", \"action\": \"REVIEW_LECTURE_NOTES\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and achieve the 100% target. Focus on thorough preparation for Exam 1.\", \"recommendedScore\": \"100%\"}, \"quizzes\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade. Even a slight decrease will make the target harder to achieve.\", \"recommendedScore\": \"100%\"}, \"assignments\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade. Even a slight decrease will make the target harder to achieve.\", \"recommendedScore\": \"100%\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:38:08','2025-09-26 13:39:34','2025-09-26 14:38:08',0),(4,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Low quiz score\", \"Need to improve performance in all assessment categories\", \"Upcoming exam requires thorough preparation\"], \"keyAchievements\": [\"Completed initial assignment and quiz\"], \"progressSummary\": \"Currently, the student\'s course grade is 76.67% and GPA is 1.7. While the course progress is 66.67%, there are completed assignments and quizzes, but the grades for these were not factored into the initial course grade. The student is at risk of not achieving the target grade of 100% unless performance significantly improves in upcoming assessments.\"}, \"studyStrategy\": {\"tips\": [\"Prioritize key concepts\", \"Practice problems under timed conditions\", \"Seek help when needed\"], \"focus\": \"Exam preparation and quiz score improvement\", \"schedule\": \"Allocate 2 hours daily for exam review, 1 hour for quiz review, and 30 minutes for assignment preparation.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"Need to get perfect scores on all exams.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Need to drastically improve the score on quizzes.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Need to get perfect scores on all future assignments.\", \"priority\": \"HIGH\", \"needsAttention\": true}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"assignments\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target of 100% in Course 1 is theoretically achievable, but requires perfect scores on all remaining assessments. The current weighted grade is based solely on the starting grade (76.67%). Achieving 100% requires significant improvement in all assessment categories. Achieving a 100% target means that your final grade needs to be equivalent to a 100% percentage. Therefore, you must score 100/15 on Exam 1.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Current Weighted Grade: 76.67%. Max Achievable Grade: If you score 100% on all remaining assessments (Assignments: 30%, Quizzes: 30%, Exam: 40%), the final grade becomes 76.67% + (0.30 * 100) + (0.30 * 100) + (0.40 * 100) = 76.67% + 30% + 30% + 40% = 176.67%. This is not possible, so the maximum achievable grade is 100%. A perfect score on Exam 1 is 15/15. With 15/15 on Exam 1, your final grade will be 76.67 + ((15/15)/100) * 40 = 76.67 + 40 = 116.67, which is impossible. Therefore you need to score 100/15 on Exam 1 to achieve your target.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"HIGH\", \"percentage\": \"76.67%\", \"explanation\": \"Since no graded assessments have been weighted into the final grade yet, the final grade is currently the same as the starting course grade. The predicted final grade remains at 76.67% unless upcoming assessments are completed.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review course materials for 30 minutes each day\", \"Practice problems related to the upcoming exam topics\", \"Summarize key concepts from each lecture\"], \"timeManagement\": \"Use a planner or calendar to schedule study time and prioritize tasks. Break down large assignments into smaller, manageable steps.\", \"examPreparation\": [\"Create a detailed study schedule\", \"Review all lecture notes and assigned readings\", \"Complete practice exams under timed conditions\"], \"weeklyStrategies\": [\"Dedicate a specific time each week to review all course material\", \"Complete practice quizzes and assignments\", \"Meet with a study group to discuss challenging topics\"]}, \"topPriorityRecommendations\": [{\"title\": \"Exam 1 Preparation Plan\", \"impact\": \"Significant improvement in exam score, leading to a higher overall grade.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Develop a structured study plan for Exam 1, focusing on key concepts and practice problems. Dedicate specific time slots each day for focused study sessions.\", \"actionButton\": {\"text\": \"Create Study Schedule\", \"action\": \"CREATE_SCHEDULE\", \"enabled\": true}}, {\"title\": \"Improve Quiz Performance\", \"impact\": \"Improved understanding of course material and higher quiz scores.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Analyze the previous quiz to identify areas of weakness. Review relevant course material and practice similar problems. Seek help from the professor or a tutor if needed.\", \"actionButton\": {\"text\": \"Review Quiz\", \"action\": \"REVIEW_QUIZ\", \"enabled\": true}}, {\"title\": \"Time Management Strategies\", \"impact\": \"Reduced stress and improved academic performance.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Implement effective time management techniques to balance coursework with other commitments. Use a planner or calendar to schedule study time and prioritize tasks.\", \"actionButton\": {\"text\": \"Add Study Session\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Active Learning Techniques\", \"impact\": \"Deeper understanding of course material and improved test performance.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Engage in active learning strategies, such as summarizing key concepts, teaching the material to someone else, and working through practice problems. This will help solidify your understanding and improve retention.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"A high exam score is critical for achieving the target grade, given the exam\'s high weight. Thorough preparation is essential.\", \"recommendedScore\": \"100%\"}, \"quizzes\": {\"priority\": \"HIGH\", \"reasoning\": \"Aim for perfect quiz scores to significantly improve the overall grade and reach the target. Given the initial quiz score, improvement here is crucial.\", \"recommendedScore\": \"100%\"}, \"assignments\": {\"priority\": \"HIGH\", \"reasoning\": \"Maximizing the assignment grade is important to offset lower quiz scores and aim for the target grade. Aim to perfect all future assignments.\", \"recommendedScore\": \"100%\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:39:34','2025-09-26 13:42:39','2025-09-26 14:39:34',0),(5,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Quiz 1 score needs improvement\", \"Upcoming Exam 1 needs dedicated preparation\"], \"keyAchievements\": [\"Completion of Assignment 1 with a perfect score.\", \"Completion of Quiz 1.\"], \"progressSummary\": \"Currently at 76.67%, indicating potential struggles, especially if the current course grade is manually input. Focus on improving performance on upcoming assessments is critical.\"}, \"studyStrategy\": {\"tips\": [\"Review lecture notes and textbook chapters.\", \"Practice with sample exam questions.\", \"Collaborate with classmates for peer learning.\"], \"focus\": \"Exam Preparation and Quiz Review\", \"schedule\": \"Dedicate 2 hours daily for Course 1, with 1 hour for reviewing past material and 1 hour for exam preparation.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"Exam 1 is upcoming and carries significant weight.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quiz 1 score was below expectations.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Assignment 1 was completed with a perfect score.\", \"priority\": \"LOW\", \"needsAttention\": false}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"100%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"100%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target goal of 100% is achievable, but it requires perfect scores on all remaining weighted assessments (Assignments, Quizzes, and Exams). Current weighted grade is 0%, given that average for each category is \'No grades yet\'. Achieving 100% on all assessments will pull the final grade up significantly. It is extremely important to note that the progress is at 66% but the individual scores are not yet available for each category. The grade might be based on manual input.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Current weighted grade = 0% (assuming no grades have been assigned yet). Maximum possible grade = (1.0 * 0.3) + (1.0 * 0.3) + (1.0 * 0.4) = 1.0 = 100%. To reach 100%, you need to ace every remaining assessment. Since there are two graded assessments: Assignment 1 (15/15) and Quiz 1 (8/15), the weights need to be re-calculated. With Assignment 1, your grade is 100% which contributes 100% * 0.3 = 30% towards the final grade. With Quiz 1, your grade is 53.33% which contributes 53.33 * 0.3 = 16%. The total grade is now 46%. It is still possible to reach the target of 100%.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"HIGH\", \"percentage\": \"76.67%\", \"explanation\": \"Since no weighted grades have been assigned yet, the predicted final grade is the same as the current course grade. The current grade is likely based on manual input as no graded assessment results are available.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review lecture notes daily.\", \"Dedicate specific time slots for Course 1.\", \"Practice problems related to the course material.\"], \"timeManagement\": \"Allocate specific time slots for each subject, prioritizing Course 1 due to the target goal.\", \"examPreparation\": [\"Create a detailed study schedule.\", \"Review past quizzes and assignments.\", \"Practice with sample exam questions.\"], \"weeklyStrategies\": [\"Attend office hours for clarification.\", \"Form a study group for collaborative learning.\", \"Review all material covered in the week.\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare Thoroughly for Exam 1\", \"impact\": \"Significant impact on final grade due to the exam\'s high weight.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Exam 1 is worth 40% of your final grade. Create a detailed study plan, review all course materials, and practice with sample questions. Focus on understanding the core concepts and their application.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"CREATE_STUDY_PLAN\", \"enabled\": true}}, {\"title\": \"Review and Improve Quiz 1 Performance\", \"impact\": \"Improved understanding of key concepts and better performance on future assessments.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Analyze your mistakes on Quiz 1. Identify the areas where you struggled and review the relevant course material. Do practice problems on those topics to solidify your understanding.\", \"actionButton\": {\"text\": \"Review Quiz 1\", \"action\": \"REVIEW_QUIZ\", \"enabled\": true}}, {\"title\": \"Implement Effective Time Management Strategies\", \"impact\": \"Increased study time and improved focus, leading to better understanding and performance.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Allocate specific time slots for studying Course 1, especially for exam preparation. Minimize distractions and create a dedicated study environment. Use time management techniques like the Pomodoro Technique to stay focused and productive.\", \"actionButton\": {\"text\": \"Set Study Schedule\", \"action\": \"SET_SCHEDULE\", \"enabled\": true}}, {\"title\": \"Actively Participate in Class and Seek Clarification\", \"impact\": \"Improved understanding of course material and enhanced learning experience.\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Engage actively in class discussions, ask questions when you don\'t understand something, and attend office hours to get personalized help from the instructor. Clarifying doubts promptly will prevent misunderstandings and improve your learning.\", \"actionButton\": {\"text\": \"Find Office Hours\", \"action\": \"FIND_OFFICE_HOURS\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and reach the target. Exam performance has a significant weight (40%), so excellent preparation is crucial.\", \"recommendedScore\": \"100%\"}, \"quizzes\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and reach the target. Since the average is currently \'No grades yet\', aim for perfect scores on any future quizzes.\", \"recommendedScore\": \"100%\"}, \"assignments\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and reach the target. Since the average is currently \'No grades yet\', aim for perfect scores on any future assignments.\", \"recommendedScore\": \"100%\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:42:39','2025-09-26 14:00:29','2025-09-26 14:42:39',0),(6,1,3,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Dependence on the upcoming exam for a significant portion of the final grade\", \"Need to improve performance on quizzes and assignments based on review of completed work\"], \"keyAchievements\": [\"Completed Assignment 1 with a good score (13/15)\", \"Completed Quiz 1 with a reasonable score (11/15)\"], \"progressSummary\": \"Currently at 80% course grade, but weighted grade is 48%. The upcoming exam is crucial for determining the final grade and achieving the target.\"}, \"studyStrategy\": {\"tips\": [\"Use active recall techniques to test your understanding of concepts.\", \"Create mind maps to visualize relationships between different project management topics.\", \"Seek help from the instructor or classmates if you are struggling with any concepts.\"], \"focus\": \"Exam 1 preparation, focusing on understanding and applying project management concepts.\", \"schedule\": \"Allocate at least 2 hours each day for focused study, with longer sessions on weekends. Break down study sessions into smaller chunks to avoid burnout.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"The exam constitutes a significant portion (40%) of the final grade and has not yet been taken.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quizzes are complete.\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"Assignments are complete.\", \"priority\": \"LOW\", \"needsAttention\": false}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"N/A\", \"neededScore\": \"N/A\"}, \"assignments\": {\"confidence\": \"N/A\", \"neededScore\": \"N/A\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"Achieving the target of 95% is possible but requires a perfect score on the upcoming exam. The current weighted grade is approximately 60% (Assignment 1: (13/15) * 0.30 = 0.26, Quiz 1: (11/15) * 0.30 = 0.22. Exam is still upcoming: 0.0; Course Grade is .80, but course grade is not the weighted average of assignments, quizzes, and exams). The weighted current grade is the sum of the weighted completed assessments, which is 0.48 + 0.0 = 0.48, or 48%.  If the exam is scored at 100% (25/25), the final grade will be 48% + (1.0 * 0.4) = 88%. A score of 100% is needed on the exam in order to achieve 95%.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Current weighted grade: 48%. Assignment weight: 30%. Quiz weight: 30%. Exam weight: 40%. To achieve 95%, the exam needs to get above perfect.\"}, \"predictedFinalGrade\": {\"gpa\": \"N/A\", \"confidence\": \"LOW\", \"percentage\": \"75.67%\", \"explanation\": \"Based on the completed assignments and quiz, and assuming 0/25 on the upcoming exam, the predicted final grade is 75.67%.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 2.3\", \"Target GPA: 3.7\", \"Gap: 1.40\", \"Max Achievable GPA: 3.00\", \"Current Grade: 80.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 1.40 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"32%\", \"bestPossibleGPA\": \"3.00\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review project management concepts for 30 minutes daily\", \"Practice solving project management problems\", \"Summarize key concepts from textbooks and lecture notes\"], \"timeManagement\": \"Prioritize studying for the Project Management exam due to its high weight. Allocate specific time slots each day for focused study.\", \"examPreparation\": [\"Create a detailed study schedule for the exam\", \"Review all lecture notes, textbook chapters, and completed assignments/quizzes\", \"Practice with sample exam questions and past exams (if available)\"], \"weeklyStrategies\": [\"Dedicate 2-3 hours per week to in-depth review of project management topics\", \"Participate in online forums or study groups to discuss concepts\", \"Create flashcards for key terms and definitions\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare Thoroughly for Exam 1\", \"impact\": \"Significantly improve the final grade and increase the likelihood of reaching the target goal.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Given the high weight (40%) of Exam 1, dedicate significant time to studying all course materials. Focus on key concepts, problem-solving techniques, and project management methodologies.\", \"actionButton\": {\"text\": \"Create Exam Study Plan\", \"action\": \"CREATE_STUDY_PLAN\", \"enabled\": true}}, {\"title\": \"Review Past Assignments and Quizzes\", \"impact\": \"Improve overall understanding of course concepts and potentially identify areas to focus on during exam preparation.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Analyze your performance on Assignment 1 and Quiz 1 to identify areas where you can improve your understanding of project management principles. Pay attention to the feedback provided and focus on correcting any mistakes.\", \"actionButton\": {\"text\": \"Review Graded Work\", \"action\": \"REVIEW_GRADES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Improve your ability to apply project management concepts to real-world scenarios, which will be beneficial for the exam.\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Project management often involves practical problem-solving. Find practice problems related to project scheduling, resource allocation, and risk management. Work through these problems to solidify your understanding and improve your problem-solving skills.\", \"actionButton\": {\"text\": \"Find Practice Problems\", \"action\": \"FIND_PRACTICE_PROBLEMS\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"The upcoming Exam 1 carries significant weight (40%). Aim for a perfect score to significantly improve the final grade and reach the target.\", \"recommendedScore\": \"25/25 (100%)\"}, \"quizzes\": {\"priority\": \"LOW\", \"reasoning\": \"Quizzes are complete. Review Quiz 1 (11/15) to identify areas for improvement in understanding project management concepts.\", \"recommendedScore\": \"N/A\"}, \"assignments\": {\"priority\": \"LOW\", \"reasoning\": \"Assignments are complete. Review feedback from Assignment 1 (13/15) to improve future project-related work.\", \"recommendedScore\": \"N/A\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 13:46:51','2025-09-26 13:46:51','2025-09-26 14:46:51',1),(7,1,2,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Quiz 1 score needs improvement\", \"Upcoming Exam 1 requires thorough preparation\"], \"keyAchievements\": [\"Completion of Assignment 1 with a perfect score\", \"Completion of Quiz 1\"], \"progressSummary\": \"Current course grade of 76.67% is below target of 100%. Improvement is needed in upcoming assessments.\"}, \"studyStrategy\": {\"tips\": [\"Use flashcards to memorize key concepts and formulas.\", \"Practice solving problems from the textbook and online resources.\", \"Attend office hours or study groups to clarify any doubts.\"], \"focus\": \"Exam 1 Preparation and Quiz 1 Review\", \"schedule\": \"Dedicate 2-3 hours daily to Course 1, focusing on exam preparation and reviewing Quiz 1 material. Break down study sessions into smaller chunks with short breaks in between.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"Exam 1 is upcoming and carries significant weight. Thorough preparation is crucial.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quiz 1 score was low. Review the material covered and practice more problems.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Assignment 1 was completed successfully. Focus on maintaining high quality in future assignments.\", \"priority\": \"LOW\", \"needsAttention\": false}}, \"scorePredictions\": {\"exams\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}, \"assignments\": {\"confidence\": \"HIGH\", \"neededScore\": \"100%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"The target goal of 100% is potentially achievable, but requires perfect scores on all remaining assessments. Current weighted grade is 76.67%. With perfect scores on assignments, quizzes, and exams, the maximum possible grade is 100%.\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Current weighted grade: 76.67%. Assignments weight: 30%, Quizzes weight: 30%, Exams weight: 40%. To reach 100%, a score of 100% is needed in all remaining categories. Currently, the final grade is calculated as: (0.3 * Assignment average) + (0.3 * Quiz average) + (0.4 * Exam average). Given that the current course grade is 76.67% after completing Assignment 1 and Quiz 1, it is possible to attain a final grade of 100% by attaining full marks in all remaining evaluations.\"}, \"predictedFinalGrade\": {\"gpa\": \"1.7\", \"confidence\": \"HIGH\", \"percentage\": \"76.67%\", \"explanation\": \"Since no grades have been received for any of the weighted categories (Assignments, Quizzes, Exams), the predicted final grade is the current course grade.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 1.7\", \"Target GPA: 4\", \"Gap: 2.30\", \"Max Achievable GPA: 2.70\", \"Current Grade: 76.7%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 2.30 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"22%\", \"bestPossibleGPA\": \"2.70\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review notes from previous lectures/readings.\", \"Dedicate specific time slots for studying Course 1.\", \"Practice problems or review questions daily.\"], \"timeManagement\": \"Allocate specific blocks of time each day for studying Course 1, prioritizing topics with which you struggle.\", \"examPreparation\": [\"Create a detailed study plan leading up to Exam 1.\", \"Review all lecture notes, readings, and assignments.\", \"Complete practice exams to simulate the exam environment.\"], \"weeklyStrategies\": [\"Summarize key concepts from each week\'s material.\", \"Complete practice quizzes or assignments to test understanding.\", \"Attend office hours or study groups to clarify any confusing topics.\"]}, \"topPriorityRecommendations\": [{\"title\": \"Prepare Thoroughly for Exam 1\", \"impact\": \"Significant impact on final grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Exam 1 is worth 40% of your final grade. Create a detailed study plan, review all materials, and complete practice questions. Focus on areas where you struggled on Quiz 1.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"CREATE_STUDY_PLAN\", \"enabled\": true}}, {\"title\": \"Review Quiz 1 Material\", \"impact\": \"Improved understanding of key concepts\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Analyze your mistakes on Quiz 1 to identify areas of weakness. Rework the problems and seek help from the instructor or classmates if needed. This will improve your understanding of the concepts tested on the exam.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Utilize Time Management Techniques\", \"impact\": \"Increased productivity and reduced stress\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Allocate specific time slots for studying Course 1 each day. Prioritize tasks based on their importance and difficulty. Avoid procrastination by breaking down large tasks into smaller, manageable steps.\", \"actionButton\": {\"text\": \"Add Study Session\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Maintain Consistent Study Habits\", \"impact\": \"Improved retention and understanding\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Develop a consistent study routine to reinforce learning and improve retention. Review notes regularly, complete practice problems, and seek help when needed. Consistency is key to success in Course 1.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"The exam is a high-stakes assessment (40% of the final grade). A high score is crucial to reach the target goal.\", \"recommendedScore\": \"100%\"}, \"quizzes\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and compensate for lower Quiz 1 score.\", \"recommendedScore\": \"100%\"}, \"assignments\": {\"priority\": \"HIGH\", \"reasoning\": \"To maximize the potential final grade and compensate for lower Quiz 1 score.\", \"recommendedScore\": \"100%\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-26 14:00:29','2025-09-26 14:00:29','2025-09-26 15:00:29',1);
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
  `confidence_level` enum('HIGH','MEDIUM','LOW') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `recommended_score` decimal(38,2) DEFAULT NULL,
  `recommended_percentage` decimal(38,2) DEFAULT NULL,
  `analysis_reasoning` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'AI explanation for the prediction',
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_categories`
--

LOCK TABLES `assessment_categories` WRITE;
/*!40000 ALTER TABLE `assessment_categories` DISABLE KEYS */;
INSERT INTO `assessment_categories` VALUES (1,30.00,4,2,'2025-09-26 10:30:15.246859','Assignments'),(1,30.00,5,2,'2025-09-26 10:30:15.258870','Quizzes'),(1,40.00,6,2,'2025-09-26 10:30:15.269880','Exam'),(1,30.00,7,3,'2025-09-26 20:26:25.788926','Assignments'),(1,30.00,8,3,'2025-09-26 20:26:25.809945','Quizzes'),(1,40.00,9,3,'2025-09-26 20:26:25.822958','Exam');
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
  PRIMARY KEY (`assessment_id`),
  KEY `FK4kbcb2x7nlbys293dd0vjysdm` (`category_id`),
  KEY `idx_ai_predicted_score` (`ai_predicted_score`),
  KEY `idx_ai_confidence` (`ai_confidence`),
  KEY `idx_ai_analysis_updated` (`ai_analysis_updated_at`),
  CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-04',15.00,6,4,'2025-09-26 16:09:16.168215','2025-09-26 16:09:20.562179','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-10',15.00,7,5,'2025-09-26 16:09:30.058737','2025-09-26 16:09:30.058737','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-26',15.00,8,6,'2025-09-26 16:12:32.975577','2025-09-26 16:12:32.974576','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-04',15.00,9,7,'2025-09-26 20:26:32.706797','2025-09-26 20:26:32.698789','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-26',15.00,10,8,'2025-09-26 20:27:41.813546','2025-09-26 20:27:41.813546','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-26',25.00,11,9,'2025-09-26 20:27:57.477816','2025-09-26 20:27:57.477816','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (76.67,1.70,3,_binary '',2,'2025-09-26 10:30:15.226841','2025-09-26 16:09:34.531760',1,'2025','CO1','Course 1',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(80.00,2.30,3,_binary '',3,'2025-09-26 20:26:25.643795','2025-09-26 20:27:44.450953',1,'2025','PM1','Project Management',NULL,'FIRST',2,'3-categories','percentage','4.0',100,'exclude');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-04',_binary '\0',100.00,15.00,15.00,6,'2025-09-26 16:09:16.170217',6,'2025-09-27 00:09:23.000000','','PERCENTAGE',NULL),('2025-09-10',_binary '\0',53.33,8.00,15.00,7,'2025-09-26 16:09:30.059737',7,'2025-09-27 00:09:34.000000','','PERCENTAGE',NULL),('2025-09-26',_binary '\0',0.00,0.00,15.00,8,'2025-09-26 16:12:32.976577',8,'2025-09-26 16:12:32.976577','','POINTS',NULL),('2025-09-04',_binary '\0',86.67,13.00,15.00,9,'2025-09-26 20:26:32.709799',9,'2025-09-27 04:27:18.000000','','PERCENTAGE',NULL),('2025-09-26',_binary '\0',73.33,11.00,15.00,10,'2025-09-26 20:27:41.815897',10,'2025-09-27 04:27:44.000000','','PERCENTAGE',NULL),('2025-09-26',_binary '\0',0.00,0.00,25.00,11,'2025-09-26 20:27:57.479818',11,'2025-09-26 20:27:57.479818','','POINTS',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (1,1,2,'2025-09-27',4.00,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-26 16:09:23','2025-09-04','FIRST'),(2,1,2,'2025-09-27',1.70,-2.30,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 76.67, \"study_hours_logged\": 0.00}','2025-09-26 16:09:34','2025-09-10','FIRST'),(3,1,3,'2025-09-27',2.70,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 86.67, \"study_hours_logged\": 0.00}','2025-09-26 20:27:18','2025-09-04','FIRST'),(4,1,3,'2025-09-27',2.30,-0.40,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 80.00, \"study_hours_logged\": 0.00}','2025-09-26 20:27:44','2025-09-26','FIRST');
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
INSERT INTO `user_progress` VALUES (1,80,1,20,0,'2025-09-27',2,0.00,'2025-09-26 22:01:08',2);
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
INSERT INTO `users` VALUES (_binary '',_binary '','2025-09-26 10:25:43.042745',NULL,'2025-09-26 10:25:43.042745',1,NULL,'pinpinramirez@gmail.com','analiza','ramirez',NULL,'$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB');
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
    DECLARE total_study_hours DECIMAL(5,2) DEFAULT 0.00;

    -- Get the semester from the courses table
    SELECT semester INTO course_semester FROM courses WHERE course_id = p_course_id;

    -- Get the latest calculated course grade (percentage)
    SELECT calculated_course_grade INTO current_calculated_grade
    FROM courses
    WHERE course_id = p_course_id;

    -- Convert percentage to GPA
    SET current_gpa = CalculateGPA(current_calculated_grade);

    -- CRITICAL FIX: Use the actual earliest upcoming assessment due date
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

    -- Calculate assignments completed and pending
    SELECT
        COUNT(CASE WHEN g.percentage_score IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN g.percentage_score IS NULL THEN 1 END)
    INTO total_assignments_completed, total_assignments_pending
    FROM assessments a
    JOIN assessment_categories ac ON a.category_id = ac.category_id
    LEFT JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE ac.course_id = p_course_id;

    -- Get previous grade trend for comparison
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
            'percentage_score', current_calculated_grade
        ),
        NOW(),
        course_due_date, -- This should now be the actual assessment due date
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

-- Dump completed on 2025-09-27  6:01:26
