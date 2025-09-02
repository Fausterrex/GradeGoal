-- Migration: Add units and creditHours fields to courses table
-- Date: 2024
-- Description: Adds units and creditHours fields to support both academic units and credit hours for courses

-- Add units field (represents course load/academic units)
ALTER TABLE courses ADD COLUMN units INT DEFAULT 3 COMMENT 'Course units (e.g., 3 units)';

-- Add creditHours field (used for GPA calculations and academic credit tracking)
ALTER TABLE courses ADD COLUMN credit_hours INT DEFAULT 3 COMMENT 'Course credit hours (e.g., 3 credit hours)';

-- Update existing courses to have default values
UPDATE courses SET units = 3, credit_hours = 3 WHERE units IS NULL OR credit_hours IS NULL;

-- Add constraints to ensure valid values
ALTER TABLE courses ADD CONSTRAINT chk_units_range CHECK (units >= 1 AND units <= 6);
ALTER TABLE courses ADD CONSTRAINT chk_credit_hours_range CHECK (credit_hours >= 1 AND credit_hours <= 6);

-- Add indexes for better query performance
CREATE INDEX idx_courses_units ON courses(units);
CREATE INDEX idx_courses_credit_hours ON courses(credit_hours);

-- Verify the changes
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'gradegoal' 
    AND TABLE_NAME = 'courses' 
    AND COLUMN_NAME IN ('units', 'credit_hours')
ORDER BY COLUMN_NAME;
