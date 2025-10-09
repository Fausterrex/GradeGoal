-- ========================================
-- ADD AI PREDICTION RATING COLUMN
-- ========================================
-- Migration script to add ai_prediction_rating column to courses table
-- This column stores user ratings (1-10) for AI predictions when completing courses

-- Add the new column to the courses table
ALTER TABLE courses 
ADD COLUMN ai_prediction_rating INT DEFAULT NULL;

-- Add a check constraint to ensure rating is between 1 and 10
ALTER TABLE courses 
ADD CONSTRAINT chk_ai_prediction_rating 
CHECK (ai_prediction_rating IS NULL OR (ai_prediction_rating >= 1 AND ai_prediction_rating <= 10));

-- Add a comment to document the column purpose
COMMENT ON COLUMN courses.ai_prediction_rating IS 'User rating (1-10) for AI predictions when completing course. NULL if not rated yet.';

-- Optional: Create an index for faster queries on rated courses
CREATE INDEX idx_courses_ai_prediction_rating ON courses(ai_prediction_rating) 
WHERE ai_prediction_rating IS NOT NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'ai_prediction_rating';
