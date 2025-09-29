-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: gradegoal
-- ------------------------------------------------------
-- Server version	8.0.43

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='';

USE `gradegoal`;

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
  KEY `FKmhnd6knfsmobeir1nu2fwt9o0` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_goals`
--

LOCK TABLES `academic_goals` WRITE;
/*!40000 ALTER TABLE `academic_goals` DISABLE KEYS */;
INSERT INTO `academic_goals` VALUES (NULL,_binary '\0',NULL,95.00,3,'2025-09-26 20:28:33.863897',2,'2025-09-26 20:28:33.863897',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,100.00,4,'2025-09-27 08:30:04.556793',3,'2025-09-27 08:30:04.556793',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,95.00,5,'2025-09-27 10:14:46.287448',4,'2025-09-27 10:14:46.287448',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,100.00,2,'2025-09-27 11:14:51.098017',5,'2025-09-27 11:14:51.098017',1,NULL,'COURSE_GRADE','COURSE_GRADE','MEDIUM','2025',NULL),(NULL,_binary '\0',NULL,100.00,NULL,'2025-09-27 11:39:53.173148',6,'2025-09-27 11:39:53.173148',1,NULL,'CUMMULATIVE_GPA','CUMMULATIVE_GPA','MEDIUM','2025',NULL);
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
INSERT INTO `ai_analysis` VALUES (1,1,3,'COURSE_ANALYSIS','{\"statusUpdate\": {\"currentStatus\": \"AT_RISK\", \"areasOfConcern\": [\"Low assignment scores\", \"Low quiz scores\", \"Empty exam category\"], \"keyAchievements\": [], \"progressSummary\": \"Your progress in Project Management is currently at risk due to low performance in assignments and quizzes. The absence of exams further compounds the risk. Immediate action is needed to improve your scores and fill the empty exam category.\"}, \"studyStrategy\": {\"tips\": [\"Prioritize understanding over memorization\", \"Break down large tasks into smaller, manageable chunks\", \"Take regular breaks to avoid burnout\"], \"focus\": \"Improving performance on assignments, quizzes, and preparing for exams, especially filling the exam category\", \"schedule\": \"Dedicate at least 2 hours daily for Project Management. Focus on reviewing past materials, practicing problems, and preparing for upcoming assessments.\"}, \"focusIndicators\": {\"exams\": {\"reason\": \"The exam category is empty and represents a significant portion of the final grade.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Quizzes have a low average score, indicating a need for improvement.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Assignments have a low average score, indicating a need for improvement.\", \"priority\": \"HIGH\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 40% of the final grade\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2-3 exams to this category\", \"Target scores: 90%+ on each exam\", \"Timeline: Add within the next 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"95%\"}, \"quizzes\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"90%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"weighted grade calculations\", \"remaining assessment weights\", \"max achievable grade vs target\"], \"analysis\": \"Achieving a target of 95% in Project Management is possible but requires significant improvement and strategic planning. Your current weighted grade is low due to poor performance in completed assignments and quizzes (0% average). The exam category is empty, meaning you have a chance to secure a high grade by performing well on the exams.  To reach 95%, you need near-perfect scores on all remaining quizzes, assignments, and especially the exams. If the exam category is weighted 40% then to get a final grade of 95% you would need to score approximately 95% on all exams.\", \"achievable\": true, \"confidence\": \"MEDIUM\", \"explanation\": \"Current weighted grade calculation: Assignments (0.30 * 0) + Quizzes (0.30 * 0) + Exams (0.40 * 0) = 0%.  If you achieve 100% on all remaining assessments: Assignments (0.30 * 100) + Quizzes (0.30 * 100) + Exams (0.40 * 100) = 100%.  This shows you can achieve 100% if you get perfect scores on all remaining work.  To reach the target of 95%, you need to average at least 88% on Assignments, 90% on Quizzes and 95% on Exams.\"}, \"predictedFinalGrade\": {\"gpa\": \"N/A\", \"confidence\": \"LOW\", \"percentage\": \"36%\", \"explanation\": \"Based on current scores and the weight of remaining assessments, the predicted final grade is 36%. The exam category is empty, and current assignment/quiz scores are low, significantly impacting the predicted grade.\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 4\", \"Target GPA: 3.7\", \"Gap: -0.30\", \"Max Achievable GPA: 4.00\", \"Current Grade: 100.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 3.7 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"4.00\"}, \"studyHabitRecommendations\": {\"dailyHabits\": [\"Review Project Management concepts daily\", \"Practice problems related to each topic\", \"Dedicate specific time slots for studying\"], \"timeManagement\": \"Allocate specific time blocks for Project Management study, ensuring consistent and focused effort.\", \"examPreparation\": [\"Create a study schedule leading up to the exam\", \"Practice with sample exam questions\", \"Review all course materials and notes\"], \"weeklyStrategies\": [\"Summarize weekly topics and create study guides\", \"Participate in online discussion forums\", \"Review previous assignments and quizzes to identify weak areas\"]}, \"topPriorityRecommendations\": [{\"title\": \"Improve Assignment Quality\", \"impact\": \"Increase assignment scores and overall grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Review feedback on completed assignments to identify areas for improvement. Focus on understanding the core concepts and applying them correctly. Redo past assignments if possible.\", \"actionButton\": {\"text\": \"Review Assignment Feedback\", \"action\": \"REVIEW_FEEDBACK\", \"enabled\": true}}, {\"title\": \"Improve Quiz Performance\", \"impact\": \"Increase quiz scores and overall grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Analyze past quiz results to identify knowledge gaps. Review relevant course materials and practice answering similar questions. Focus on time management during quizzes.\", \"actionButton\": {\"text\": \"Review Quiz Results\", \"action\": \"REVIEW_RESULTS\", \"enabled\": true}}, {\"title\": \"Add Assessments to Exam Category\", \"impact\": \"Will complete course structure and allow accurate grade calculation\", \"category\": \"EMPTY_CATEGORY\", \"priority\": \"HIGH\", \"description\": \"This category represents 40% of your final grade but currently has no assessments. Add at least 2 exams with target scores of 90%+ to significantly improve your final grade.\", \"actionButton\": {\"text\": \"Add Exam\", \"action\": \"ADD_ASSESSMENT\", \"enabled\": true}}, {\"title\": \"Prepare for Upcoming Assessments\", \"impact\": \"Improve scores on upcoming assessments\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Create a study plan for upcoming assignments and quizzes. Allocate specific time for studying and reviewing course materials. Practice answering sample questions and seek clarification on challenging topics.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"CREATE_PLAN\", \"enabled\": true}}, {\"title\": \"Seek Clarification and Support\", \"impact\": \"Improve understanding and performance\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"If you are struggling with any concepts, seek help from the instructor, teaching assistants, or classmates. Attend office hours or participate in online discussion forums to ask questions and clarify doubts.\", \"actionButton\": {\"text\": \"Contact Instructor\", \"action\": \"CONTACT_INSTRUCTOR\", \"enabled\": true}}], \"assessmentGradeRecommendations\": {\"exams\": {\"priority\": \"HIGH\", \"reasoning\": \"Since the exam category is currently empty, you should aim for very high scores (95%+) on all exams that are added. This will have a substantial positive impact on your final grade.\", \"recommendedScore\": \"95%\"}, \"quizzes\": {\"priority\": \"HIGH\", \"reasoning\": \"Target 90% or higher on all upcoming quizzes. These contribute significantly to your grade, and consistent high scores are crucial.\", \"recommendedScore\": \"90%\"}, \"assignments\": {\"priority\": \"HIGH\", \"reasoning\": \"Aim for at least 90% on upcoming assignments to improve your overall grade. Consistent high performance here can significantly boost your average.\", \"recommendedScore\": \"90%\"}}}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:11:29','2025-09-27 14:35:47','2025-10-27 14:11:29',0),(2,1,5,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"exam has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (80.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 3.7\", \"Gap: 0.40\"], \"analysis\": \"Target goal is achievable based on current performance\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 3.7\", \"Gap: 0.40\", \"Max Achievable GPA: 3.30\", \"Current Grade: 90.0%\"], \"confidence\": \"MEDIUM\", \"explanation\": \"Student needs 0.40 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"45%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:13:06','2025-09-27 14:34:12','2025-10-27 14:13:06',0),(3,1,4,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"Good performance in assignments (93.3%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.7\", \"Target GPA: 4\", \"Gap: 0.30\"], \"analysis\": \"Target goal is achievable based on current performance\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.7\", \"Target GPA: 4\", \"Gap: 0.30\", \"Max Achievable GPA: 4.00\", \"Current Grade: 93.3%\"], \"confidence\": \"LOW\", \"explanation\": \"Target GPA 4 is mathematically unreachable.\", \"probability\": \"0%\", \"bestPossibleGPA\": \"3.70\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:14:58','2025-09-27 14:23:18','2025-10-27 14:14:58',0),(4,1,4,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"assignments\": {\"reason\": \"Good performance in assignments (93.3%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 30% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"30%\", \"priority\": \"HIGH\", \"categoryName\": \"Quizzes\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}, {\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.7\", \"Target GPA: 4\", \"Gap: 0.30\"], \"analysis\": \"Target goal is achievable based on current performance\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.7\", \"Target GPA: 4\", \"Gap: 0.30\", \"Max Achievable GPA: 4.00\", \"Current Grade: 93.3%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"4.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:23:18','2025-09-27 14:23:18','2025-10-27 14:23:18',1),(5,1,5,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"exam has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (80.0%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"assignments\": {\"reason\": \"Good performance in assignments (86.7%) but consider adding more assessments to improve GPA.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\"], \"analysis\": \"Target goal may be challenging based on current performance\", \"achievable\": false, \"confidence\": \"MEDIUM\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 3.3\", \"Target GPA: 4\", \"Gap: 0.70\", \"Max Achievable GPA: 3.30\", \"Current Grade: 90.0%\"], \"confidence\": \"LOW\", \"explanation\": \"Student needs 0.70 GPA points to reach target. Probability adjusted based on realistic improvement potential.\", \"probability\": \"20%\", \"bestPossibleGPA\": \"3.30\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:34:12','2025-09-27 14:34:12','2025-10-27 14:34:12',1),(6,1,3,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"quizzes\": {\"reason\": \"Good performance in quizzes (100.0%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": [{\"reason\": \"This category has no assessments but represents 40% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.\", \"weight\": \"40%\", \"priority\": \"HIGH\", \"categoryName\": \"Exam\", \"needsAttention\": true, \"recommendations\": [\"Add 2 assessments to this category\", \"Target scores: 85%+ on each assessment\", \"Timeline: Add within 2 weeks\"]}]}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 4\", \"Target GPA: 4\", \"Gap: 0.00\"], \"analysis\": \"Target goal is achievable based on current performance\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 4\", \"Target GPA: 4\", \"Gap: 0.00\", \"Max Achievable GPA: 4.00\", \"Current Grade: 100.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"4.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:35:47','2025-09-27 14:37:29','2025-10-27 14:35:47',0),(7,1,3,'COURSE_ANALYSIS','{\"studyStrategy\": {\"tips\": [\"Active recall\", \"Spaced repetition\", \"Practice problems\"], \"focus\": \"Exam preparation\", \"schedule\": \"2-3 hours daily\"}, \"focusIndicators\": {\"exam\": {\"reason\": \"exam has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"quizzes\": {\"reason\": \"Good performance in quizzes (100.0%). Keep it up!\", \"priority\": \"LOW\", \"needsAttention\": false}, \"assignments\": {\"reason\": \"assignments has 1 assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.\", \"priority\": \"MEDIUM\", \"needsAttention\": true}, \"emptyCategories\": []}, \"scorePredictions\": {\"exams\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"80%\"}, \"quizzes\": {\"confidence\": \"HIGH\", \"neededScore\": \"90%\"}, \"assignments\": {\"confidence\": \"MEDIUM\", \"neededScore\": \"85%\"}}, \"targetGoalAnalysis\": {\"factors\": [\"Current GPA: 4\", \"Target GPA: 4\", \"Gap: 0.00\"], \"analysis\": \"Target goal is achievable based on current performance\", \"achievable\": true, \"confidence\": \"HIGH\", \"explanation\": \"Based on current performance and remaining assessments\"}, \"targetGoalProbability\": {\"factors\": [\"Current GPA: 4\", \"Target GPA: 4\", \"Gap: 0.00\", \"Max Achievable GPA: 4.00\", \"Current Grade: 100.0%\"], \"confidence\": \"HIGH\", \"explanation\": \"Target GPA 4 is already achieved.\", \"probability\": \"100%\", \"bestPossibleGPA\": \"4.00\"}, \"topPriorityRecommendations\": [{\"title\": \"Prepare for Upcoming Exams\", \"impact\": \"Critical for achieving target grade\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.\", \"actionButton\": {\"text\": \"Create Study Plan\", \"action\": \"ADD_STUDY_SESSION\", \"enabled\": true}}, {\"title\": \"Review Course Materials\", \"impact\": \"Essential preparation for success\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"HIGH\", \"description\": \"Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.\", \"actionButton\": {\"text\": \"Review Notes\", \"action\": \"REVIEW_NOTES\", \"enabled\": true}}, {\"title\": \"Practice Problem Solving\", \"impact\": \"Builds competency and confidence\", \"category\": \"COURSE_SPECIFIC\", \"priority\": \"MEDIUM\", \"description\": \"Work through practice problems and past examples to build confidence for upcoming assessments.\", \"actionButton\": {\"text\": \"Practice Problems\", \"action\": \"PRACTICE_PROBLEMS\", \"enabled\": true}}, {\"title\": \"Establish Study Schedule\", \"impact\": \"Ensures consistent preparation\", \"category\": \"GENERAL_ACADEMIC\", \"priority\": \"MEDIUM\", \"description\": \"Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.\", \"actionButton\": {\"text\": \"Set Schedule\", \"action\": \"SET_REMINDER\", \"enabled\": true}}]}','gemini-2.0-flash-exp',0.85,'2025-09-27 14:37:29','2025-09-27 14:37:29','2025-10-27 14:37:29',1);
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
  KEY `idx_trigger_type` (`trigger_type`)
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
INSERT INTO `assessment_categories` VALUES (1,30.00,4,2,'2025-09-26 10:30:15.246859','Assignments'),(1,30.00,5,2,'2025-09-26 10:30:15.258870','Quizzes'),(1,40.00,6,2,'2025-09-26 10:30:15.269880','Exam'),(1,30.00,7,3,'2025-09-26 20:26:25.788926','Assignments'),(1,30.00,8,3,'2025-09-26 20:26:25.809945','Quizzes'),(1,40.00,9,3,'2025-09-26 20:26:25.822958','Exam'),(1,30.00,10,4,'2025-09-27 08:29:40.485820','Assignments'),(1,30.00,11,4,'2025-09-27 08:29:40.500834','Quizzes'),(1,40.00,12,4,'2025-09-27 08:29:40.511844','Exam'),(1,30.00,13,5,'2025-09-27 10:09:14.458853','Assignments'),(1,30.00,14,5,'2025-09-27 10:09:14.473866','Quizzes'),(1,40.00,15,5,'2025-09-27 10:09:14.485877','Exam'),(1,30.00,16,6,'2025-09-27 11:30:21.390399','Assignments'),(1,30.00,17,6,'2025-09-27 11:30:21.403413','Quizzes'),(1,40.00,18,6,'2025-09-27 11:30:21.414422','Exam');
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
  KEY `idx_ai_analysis_updated` (`ai_analysis_updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('2025-09-05',15.00,15,4,'2025-09-27 10:03:41.390366','2025-09-27 10:03:41.389365','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-11',15.00,16,6,'2025-09-27 10:03:52.770368','2025-09-27 10:03:52.770368','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-19',15.00,17,4,'2025-09-27 10:04:05.871650','2025-09-27 10:04:05.871650','Assignment 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-05',15.00,23,13,'2025-09-27 10:12:01.099877','2025-09-27 10:12:01.099877','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-10',15.00,24,14,'2025-09-27 10:12:10.272688','2025-09-27 10:12:10.272688','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,27,15,'2025-09-27 10:58:42.092391','2025-09-27 10:58:42.092391','Exam 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-30',15.00,28,15,'2025-09-27 10:59:29.434910','2025-09-27 10:59:29.434910','Exam 2',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,29,7,'2025-09-27 11:17:19.946991','2025-09-27 11:17:19.946991','Assignment 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-18',15.00,30,5,'2025-09-27 11:26:38.202389','2025-09-27 11:26:38.202389','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,31,16,'2025-09-27 11:30:30.177023','2025-09-27 11:30:30.177023','Assignment 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',12.00,32,17,'2025-09-27 11:30:37.866539','2025-09-27 11:30:37.866539','Quiz 1',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',13.00,33,16,'2025-09-27 11:30:46.820329','2025-09-27 11:30:46.820329','Assignment 2',NULL,'UPCOMING',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,37,8,'2025-09-27 20:58:27.457380','2025-09-27 20:58:27.457380','Quiz 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-03',15.00,38,8,'2025-09-27 20:58:36.651511','2025-09-27 20:58:36.651511','Quiz 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-12',15.00,39,10,'2025-09-27 21:06:19.437807','2025-09-27 21:06:19.437807','Assignment 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,40,10,'2025-09-27 21:09:09.555601','2025-09-27 21:09:09.555601','Assignment 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,41,17,'2025-09-27 21:11:10.239395','2025-09-27 21:11:10.239395','Quiz 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-11',15.00,42,17,'2025-09-27 21:13:14.239385','2025-09-27 21:13:14.239385','Quiz 3',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-18',15.00,43,17,'2025-09-27 21:15:51.270198','2025-09-27 21:15:51.270198','Quiz 4',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-23',15.00,44,16,'2025-09-27 21:17:28.159429','2025-09-27 21:17:28.159429','Assignment 3',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-27',15.00,45,7,'2025-09-27 22:35:21.827230','2025-09-27 22:35:21.825228','Assignment 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-12',15.00,46,9,'2025-09-27 22:37:10.469460','2025-09-27 22:37:10.469460','Exam 1',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-28',15.00,47,8,'2025-09-28 21:21:02.323432','2025-09-28 21:21:02.319429','Quiz 3',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL),('2025-09-28',15.00,48,5,'2025-09-28 21:22:24.899428','2025-09-28 21:22:24.898428','Quiz 2',NULL,'OVERDUE',NULL,NULL,NULL,NULL,NULL,NULL);
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
  KEY `idx_google_id` (`google_calendar_event_id`)
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
  KEY `FK51k53m6m5gi9n91fnlxkxgpmv` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (92.38,3.30,3,_binary '',2,'2025-09-26 10:30:15.226841','2025-09-27 10:03:55.354866',1,'2025','CO1','Course 1',NULL,'FIRST',0,'3-categories','percentage','4.0',100,'exclude'),(100.00,4.00,3,_binary '',3,'2025-09-26 20:26:25.643795','2025-09-27 20:58:39.467974',1,'2025','PM1','Project Management',NULL,'FIRST',2,'3-categories','percentage','4.0',100,'exclude'),(93.33,3.70,3,_binary '',4,'2025-09-27 08:29:40.449788','2025-09-27 21:50:30.684871',1,'2025','SI1','System Integ',NULL,'SECOND',1,'3-categories','percentage','4.0',100,'exclude'),(90.00,3.30,3,_binary '',5,'2025-09-27 10:09:14.424822','2025-09-27 10:59:23.052390',1,'2025','c2','Course 2',NULL,'FIRST',2,'3-categories','percentage','4.0',100,'exclude'),(90.48,3.30,3,_binary '',6,'2025-09-27 11:30:21.372383','2025-09-27 11:30:49.572946',1,'2025','c3','Course 3',NULL,'FIRST',4,'3-categories','percentage','4.0',100,'exclude');
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
  KEY `idx_expires` (`expires_at`)
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
  KEY `FKr3vxme485so9o2jlqhtbdu85x` (`assessment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES ('2025-09-05',_binary '\0',100.00,15.00,15.00,15,'2025-09-27 10:03:41.403379',15,'2025-09-27 18:03:44.000000','','PERCENTAGE',NULL),('2025-09-11',_binary '\0',86.67,13.00,15.00,16,'2025-09-27 10:03:52.772372',16,'2025-09-27 18:03:55.000000','','PERCENTAGE',NULL),('2025-09-19',_binary '\0',0.00,0.00,15.00,17,'2025-09-27 10:04:05.873651',17,'2025-09-27 10:04:05.873651','','POINTS',NULL),('2025-09-05',_binary '\0',86.67,13.00,15.00,23,'2025-09-27 10:12:01.100876',23,'2025-09-27 18:12:03.000000','','PERCENTAGE',NULL),('2025-09-10',_binary '\0',80.00,12.00,15.00,24,'2025-09-27 10:12:10.273690',24,'2025-09-27 18:12:12.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',100.00,15.00,15.00,27,'2025-09-27 10:58:42.093392',27,'2025-09-27 18:59:22.000000','','PERCENTAGE',NULL),('2025-09-30',_binary '\0',0.00,0.00,15.00,28,'2025-09-27 10:59:29.435910',28,'2025-09-27 10:59:29.435910','','POINTS',NULL),('2025-09-27',_binary '\0',100.00,15.00,15.00,29,'2025-09-27 11:17:19.947992',29,'2025-09-27 19:18:02.000000','','PERCENTAGE',NULL),('2025-09-18',_binary '\0',0.00,0.00,15.00,30,'2025-09-27 11:26:38.204391',30,'2025-09-27 11:26:38.204391','','POINTS',NULL),('2025-09-27',_binary '\0',86.67,13.00,15.00,31,'2025-09-27 11:30:30.179025',31,'2025-09-27 19:30:32.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',91.67,11.00,12.00,32,'2025-09-27 11:30:37.867539',32,'2025-09-27 19:30:42.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',92.31,12.00,13.00,33,'2025-09-27 11:30:46.821330',33,'2025-09-27 19:30:49.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',100.00,15.00,15.00,37,'2025-09-27 20:58:27.458381',37,'2025-09-28 04:58:29.000000','','PERCENTAGE',NULL),('2025-09-03',_binary '\0',100.00,15.00,15.00,38,'2025-09-27 20:58:36.653512',38,'2025-09-28 04:58:39.000000','','PERCENTAGE',NULL),('2025-09-12',_binary '\0',100.00,15.00,15.00,39,'2025-09-27 21:06:19.438808',39,'2025-09-28 05:06:21.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',86.67,13.00,15.00,40,'2025-09-27 21:09:09.557601',40,'2025-09-28 05:09:11.000000','','PERCENTAGE',NULL),('2025-09-27',_binary '\0',0.00,0.00,15.00,41,'2025-09-27 21:11:10.240395',41,'2025-09-27 21:11:10.240395','','POINTS',NULL),('2025-09-11',_binary '\0',0.00,0.00,15.00,42,'2025-09-27 21:13:14.240385',42,'2025-09-27 21:13:14.240385','','POINTS',NULL),('2025-09-18',_binary '\0',0.00,0.00,15.00,43,'2025-09-27 21:15:51.271198',43,'2025-09-27 21:15:51.271198','','POINTS',NULL),('2025-09-23',_binary '\0',0.00,0.00,15.00,44,'2025-09-27 21:17:28.164433',44,'2025-09-27 21:17:28.164433','hehe','POINTS',NULL),('2025-09-27',_binary '\0',0.00,0.00,15.00,45,'2025-09-27 22:35:21.830233',45,'2025-09-27 22:35:21.830233','','POINTS',NULL),('2025-09-12',_binary '\0',0.00,0.00,15.00,46,'2025-09-27 22:37:10.470463',46,'2025-09-27 22:37:10.470463','','POINTS',NULL),('2025-09-28',_binary '\0',0.00,0.00,15.00,47,'2025-09-28 21:21:02.345452',47,'2025-09-28 21:21:02.344451','','POINTS',NULL),('2025-09-28',_binary '\0',0.00,0.00,15.00,48,'2025-09-28 21:22:24.900429',48,'2025-09-28 21:22:24.900429','','POINTS',NULL);
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
  KEY `idx_created_date` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (67,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 07:19:16',NULL),(68,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 08:21:18',NULL),(69,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 08:47:45',NULL),(70,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:03:44',NULL),(71,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:03:55',NULL),(72,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:09:56',NULL),(73,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:10:01',NULL),(74,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:10:06',NULL),(75,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:10:09',NULL),(76,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 2','HIGH',0,NULL,'2025-09-27 10:12:03',NULL),(77,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 10:12:12',NULL),(78,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 10:16:28',NULL),(79,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 10:59:23',NULL),(80,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:18:03',NULL),(81,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:30:32',NULL),(82,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:30:42',NULL),(83,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:30:49',NULL),(84,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:36:11',NULL),(85,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 11:36:27',NULL),(86,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 3','HIGH',0,NULL,'2025-09-27 20:58:30',NULL),(87,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 4','HIGH',0,NULL,'2025-09-27 20:58:39',NULL),(88,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 4','HIGH',0,NULL,'2025-09-27 21:06:21',NULL),(89,1,NULL,'ACHIEVEMENT','Level Up!','Congratulations! You reached Level 4','HIGH',0,NULL,'2025-09-27 21:09:11',NULL);
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
  KEY `idx_created_ai` (`created_at`,`ai_generated`)
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
  KEY `idx_user_date` (`user_id`,`earned_at`)
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
  KEY `idx_user_activity` (`user_id`,`activity_type`,`created_at`)
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
  KEY `idx_user_analytics_due_date` (`due_date`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_analytics`
--

LOCK TABLES `user_analytics` WRITE;
/*!40000 ALTER TABLE `user_analytics` DISABLE KEYS */;
INSERT INTO `user_analytics` VALUES (14,1,2,'2025-09-27',0.00,0.00,0,0,0.00,'{\"completion_rate\": 0.00, \"percentage_score\": 0.00, \"study_hours_logged\": 0.00}','2025-09-27 10:02:48','2025-10-04','FIRST'),(17,1,3,'2025-09-27',0.00,0.00,0,0,0.00,'{\"completion_rate\": 0.00, \"percentage_score\": 0.00, \"study_hours_logged\": 0.00}','2025-09-27 10:03:24','2025-10-04','FIRST'),(18,1,2,'2025-09-27',4.00,4.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 10:03:44','2025-09-05','FIRST'),(19,1,2,'2025-09-27',3.30,-0.70,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 92.38, \"study_hours_logged\": 0.00}','2025-09-27 10:03:55','2025-09-11','FIRST'),(28,1,5,'2025-09-27',0.00,0.00,0,0,0.00,'{\"completion_rate\": 0.00, \"percentage_score\": 0.00, \"study_hours_logged\": 0.00}','2025-09-27 10:11:54','2025-10-04','FIRST'),(29,1,5,'2025-09-27',2.70,2.70,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 86.67, \"study_hours_logged\": 0.00}','2025-09-27 10:12:03','2025-09-05','FIRST'),(30,1,5,'2025-09-27',2.70,0.00,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 83.34, \"study_hours_logged\": 0.00}','2025-09-27 10:12:12','2025-09-10','FIRST'),(31,1,5,'2025-09-27',2.30,-0.40,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 82.00, \"study_hours_logged\": 0.00}','2025-09-27 10:16:28','2025-09-27','FIRST'),(32,1,5,'2025-09-27',0.00,-2.30,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 63.34, \"study_hours_logged\": 0.00}','2025-09-27 10:58:32','2025-09-27','FIRST'),(33,1,5,'2025-09-27',2.70,2.70,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 83.34, \"study_hours_logged\": 0.00}','2025-09-27 10:58:39','2025-09-10','FIRST'),(34,1,5,'2025-09-27',3.30,0.60,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 90.00, \"study_hours_logged\": 0.00}','2025-09-27 10:59:22','2025-09-27','FIRST'),(35,1,3,'2025-09-27',4.00,4.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 11:18:02','2025-09-27','FIRST'),(36,1,6,'2025-09-27',2.70,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 86.67, \"study_hours_logged\": 0.00}','2025-09-27 11:30:32','2025-09-27','FIRST'),(37,1,6,'2025-09-27',3.00,0.30,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 89.17, \"study_hours_logged\": 0.00}','2025-09-27 11:30:42','2025-09-27','FIRST'),(38,1,6,'2025-09-27',3.30,0.30,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 90.48, \"study_hours_logged\": 0.00}','2025-09-27 11:30:49','2025-09-27','FIRST'),(39,1,4,'2025-09-27',4.00,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 11:36:11','2025-09-05','FIRST'),(40,1,4,'2025-09-27',3.70,-0.30,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 93.34, \"study_hours_logged\": 0.00}','2025-09-27 11:36:27','2025-09-12','FIRST'),(41,1,4,'2025-09-28',0.00,-3.70,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 37.14, \"study_hours_logged\": 0.00}','2025-09-27 19:42:19','2025-09-27','FIRST'),(42,1,4,'2025-09-28',0.00,0.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 0.00, \"study_hours_logged\": 0.00}','2025-09-27 19:42:21','2025-09-27','FIRST'),(43,1,4,'2025-09-28',0.00,0.00,0,0,0.00,'{\"completion_rate\": 0.00, \"percentage_score\": 0.00, \"study_hours_logged\": 0.00}','2025-09-27 19:42:23','2025-10-05','FIRST'),(44,1,3,'2025-09-28',4.00,0.00,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 20:58:29','2025-09-27','FIRST'),(45,1,3,'2025-09-28',4.00,0.00,3,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 20:58:39','2025-09-27','FIRST'),(46,1,4,'2025-09-28',4.00,4.00,1,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 100.00, \"study_hours_logged\": 0.00}','2025-09-27 21:06:21','2025-09-12','FIRST'),(47,1,4,'2025-09-28',3.70,-0.30,2,0,0.00,'{\"completion_rate\": 100.000000000, \"percentage_score\": 93.33, \"study_hours_logged\": 0.00}','2025-09-27 21:09:11','2025-09-27','FIRST');
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
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,320,4,80,0,'2025-09-28',3.48,0.00,'2025-09-28 21:59:54',3.52);
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
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary '',_binary '','2025-09-26 10:25:43.042745',NULL,'2025-09-26 10:25:43.042745',1,NULL,'pinpinramirez@gmail.com','analiza','ramirez',NULL,'$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB','USER'),(_binary '',_binary '','2025-09-29 00:00:00.000000',NULL,'2025-09-29 00:00:00.000000',2,NULL,'admin@gradegoal.com','Admin','User',NULL,'$2a$10$d00dBxfNRza1yQCeJj9oZudHXJ9W1/Twiatmq7YHIDsrBcKGYW58.','WEB','ADMIN');
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
-- Add Foreign Key Constraints After All Tables Are Created
ALTER TABLE `academic_goals` 
  ADD CONSTRAINT `FKdtcq2dk59cvthkf4whgwy2aa8` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  ADD CONSTRAINT `FKmhnd6knfsmobeir1nu2fwt9o0` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `alert_rules` 
  ADD CONSTRAINT `alert_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alert_rules_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `notifications` 
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `recommendations` 
  ADD CONSTRAINT `recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recommendations_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `user_analytics` 
  ADD CONSTRAINT `user_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_analytics_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `assessments` 
  ADD CONSTRAINT `FK4kbcb2x7nlbys293dd0vjysdm` FOREIGN KEY (`category_id`) REFERENCES `assessment_categories` (`category_id`);

ALTER TABLE `calendar_events` 
  ADD CONSTRAINT `calendar_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calendar_events_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`) ON DELETE CASCADE;

ALTER TABLE `courses` 
  ADD CONSTRAINT `FK51k53m6m5gi9n91fnlxkxgpmv` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `export_logs` 
  ADD CONSTRAINT `export_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `grades` 
  ADD CONSTRAINT `FKr3vxme485so9o2jlqhtbdu85x` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`);

ALTER TABLE `user_achievements` 
  ADD CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE;

ALTER TABLE `user_activity_log` 
  ADD CONSTRAINT `user_activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `user_progress` 
  ADD CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

