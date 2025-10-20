-- Fix export_type column length in export_logs table
-- This script increases the column length to accommodate the ADMIN_OVERVIEW enum value

ALTER TABLE export_logs 
MODIFY COLUMN export_type VARCHAR(50) NOT NULL;

-- Update any existing ADMIN_SYSTEM_OVERVIEW records to use the new shorter enum value
UPDATE export_logs 
SET export_type = 'ADMIN_OVERVIEW' 
WHERE export_type = 'ADMIN_SYSTEM_OVERVIEW';

-- Verify the change
DESCRIBE export_logs;
