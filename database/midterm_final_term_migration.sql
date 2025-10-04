-- Migration script to add midterm and final term functionality
-- This script adds the necessary fields to support midterm and final term assessments

-- Add semester_term field to assessments table to distinguish midterm vs final term assessments
ALTER TABLE `assessments` 
ADD COLUMN `semester_term` ENUM('MIDTERM', 'FINAL_TERM') DEFAULT 'MIDTERM' COMMENT 'Whether this assessment belongs to midterm or final term';

-- Add index for semester_term for better query performance
ALTER TABLE `assessments` 
ADD INDEX `idx_semester_term` (`semester_term`);

-- Add is_midterm_completed field to courses table to track midterm completion status
ALTER TABLE `courses` 
ADD COLUMN `is_midterm_completed` BIT(1) DEFAULT b'0' COMMENT 'Whether the midterm period has been completed for this course';

-- Add index for is_midterm_completed for better query performance
ALTER TABLE `courses` 
ADD INDEX `idx_is_midterm_completed` (`is_midterm_completed`);

-- Update existing assessments to be MIDTERM by default
UPDATE `assessments` SET `semester_term` = 'MIDTERM' WHERE `semester_term` IS NULL;

-- Add semester_term field to grades table for consistency (optional, but good for tracking)
ALTER TABLE `grades` 
ADD COLUMN `semester_term` ENUM('MIDTERM', 'FINAL_TERM') DEFAULT 'MIDTERM' COMMENT 'Which semester term this grade belongs to';

-- Add index for semester_term in grades table
ALTER TABLE `grades` 
ADD INDEX `idx_grades_semester_term` (`semester_term`);

-- Update existing grades to be MIDTERM by default
UPDATE `grades` SET `semester_term` = 'MIDTERM' WHERE `semester_term` IS NULL;

-- Add semester_term field to user_analytics table for better analytics tracking
ALTER TABLE `user_analytics` 
ADD COLUMN `semester_term` ENUM('MIDTERM', 'FINAL_TERM') DEFAULT 'MIDTERM' COMMENT 'Which semester term this analytics record belongs to';

-- Add index for semester_term in user_analytics table
ALTER TABLE `user_analytics` 
ADD INDEX `idx_analytics_semester_term` (`semester_term`);

-- Update existing analytics to be MIDTERM by default
UPDATE `user_analytics` SET `semester_term` = 'MIDTERM' WHERE `semester_term` IS NULL;

-- Create a stored procedure to mark midterm as completed for a course
DELIMITER //
CREATE PROCEDURE MarkMidtermCompleted(IN course_id_param BIGINT)
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
END //
DELIMITER ;

-- Create a function to get current semester term for a course
DELIMITER //
CREATE FUNCTION GetCurrentSemesterTerm(course_id_param BIGINT) 
RETURNS ENUM('MIDTERM', 'FINAL_TERM')
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE midterm_completed BIT(1);
    
    SELECT is_midterm_completed INTO midterm_completed
    FROM courses 
    WHERE course_id = course_id_param;
    
    IF midterm_completed = b'1' THEN
        RETURN 'FINAL_TERM';
    ELSE
        RETURN 'MIDTERM';
    END IF;
END //
DELIMITER ;

-- Create a function to calculate category grade for a specific semester term
DELIMITER //
CREATE FUNCTION CalculateCategoryGradeByTerm(category_id_param BIGINT, semester_term_param ENUM('MIDTERM', 'FINAL_TERM')) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE category_grade DECIMAL(5,2) DEFAULT 0.00;
    DECLARE total_points_earned DECIMAL(8,2) DEFAULT 0.00;
    DECLARE total_points_possible DECIMAL(8,2) DEFAULT 0.00;
    DECLARE total_extra_credit DECIMAL(8,2) DEFAULT 0.00;
    
    -- Calculate total points for the specific semester term
    SELECT 
        COALESCE(SUM(g.points_earned), 0),
        COALESCE(SUM(g.points_possible), 0),
        COALESCE(SUM(g.extra_credit_points), 0)
    INTO total_points_earned, total_points_possible, total_extra_credit
    FROM assessments a
    INNER JOIN grades g ON a.assessment_id = g.assessment_id
    WHERE a.category_id = category_id_param 
    AND a.semester_term = semester_term_param
    AND g.points_earned IS NOT NULL;
    
    -- Calculate category grade with extra credit
    IF total_points_possible > 0 THEN
        SET category_grade = ((total_points_earned + total_extra_credit) / total_points_possible) * 100;
    END IF;
    
    RETURN ROUND(category_grade, 2);
END //
DELIMITER ;

-- Create a function to calculate course grade for a specific semester term
DELIMITER //
CREATE FUNCTION CalculateCourseGradeByTerm(course_id_param BIGINT, semester_term_param ENUM('MIDTERM', 'FINAL_TERM')) 
RETURNS DECIMAL(5,2)
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
    WHERE course_id = course_id_param;
    
    -- Calculate weighted grade using category weights for specific semester term
    IF handle_missing_setting = 'treat_as_zero' THEN
        -- Include all categories, treat empty categories as 0%
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGradeByTerm(ac.category_id, semester_term_param) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(ac.weight_percentage), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = course_id_param;
        
    ELSE
        -- Default behavior: exclude categories with no completed assessments for the specific term
        SELECT 
            COALESCE(SUM(
                (CalculateCategoryGradeByTerm(ac.category_id, semester_term_param) * ac.weight_percentage) / 100
            ), 0),
            COALESCE(SUM(
                CASE 
                    WHEN (SELECT COUNT(*) FROM assessments a 
                          INNER JOIN grades g ON a.assessment_id = g.assessment_id 
                          WHERE a.category_id = ac.category_id 
                          AND a.semester_term = semester_term_param
                          AND g.points_earned IS NOT NULL) > 0 
                    THEN ac.weight_percentage 
                    ELSE 0 
                END
            ), 0)
        INTO weighted_sum, total_weight
        FROM assessment_categories ac
        WHERE ac.course_id = course_id_param;
    END IF;
    
    -- Calculate final course grade for the specific term
    IF total_weight > 0 THEN
        SET course_grade = (weighted_sum * 100) / total_weight;
    END IF;
    
    RETURN ROUND(course_grade, 2);
END //
DELIMITER ;

-- Create a view to get assessments by semester term
CREATE VIEW `assessments_by_term` AS
SELECT 
    a.*,
    ac.course_id,
    c.is_midterm_completed,
    CASE 
        WHEN c.is_midterm_completed = b'1' THEN 'FINAL_TERM'
        ELSE 'MIDTERM'
    END as current_term
FROM assessments a
INNER JOIN assessment_categories ac ON a.category_id = ac.category_id
INNER JOIN courses c ON ac.course_id = c.course_id;

-- Add comments for documentation
ALTER TABLE `assessments` COMMENT = 'Assessment table with midterm/final term support';
ALTER TABLE `courses` COMMENT = 'Course table with midterm completion tracking';
ALTER TABLE `grades` COMMENT = 'Grades table with semester term tracking';
