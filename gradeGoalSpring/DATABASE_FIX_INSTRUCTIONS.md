# Database Fix Instructions for Export Type Column

## Problem
The `export_logs` table has a column `export_type` that is too small to store the enum value `ADMIN_SYSTEM_OVERVIEW` (22 characters). This causes a "Data truncated for column 'export_type'" error.

## Solution
We have two options to fix this:

### Option 1: Update Database Column Length (Recommended)
Run the following SQL commands in your MySQL database:

```sql
-- Increase the column length
ALTER TABLE export_logs 
MODIFY COLUMN export_type VARCHAR(50) NOT NULL;

-- Update any existing records
UPDATE export_logs 
SET export_type = 'ADMIN_OVERVIEW' 
WHERE export_type = 'ADMIN_SYSTEM_OVERVIEW';
```

### Option 2: Use Shorter Enum Value (Already Implemented)
The code has been updated to use `ADMIN_OVERVIEW` instead of `ADMIN_SYSTEM_OVERVIEW` to fit within the existing column length.

## Files Modified
1. `ExportLog.java` - Updated enum value and added column length specification
2. `AdminController.java` - Updated to use new enum value
3. `fix_export_type_column.sql` - SQL script to fix the database

## How to Apply the Fix

### If you have MySQL command line access:
```bash
mysql -u root -p gradegoal < fix_export_type_column.sql
```

### If you're using a MySQL GUI tool (like phpMyAdmin, MySQL Workbench, etc.):
1. Connect to your database
2. Run the SQL commands from `fix_export_type_column.sql`

### If you're using XAMPP/WAMP:
1. Open phpMyAdmin
2. Select your `gradegoal` database
3. Go to SQL tab
4. Run the commands from `fix_export_type_column.sql`

## Verification
After applying the fix, you can verify it worked by:
1. Restarting the Spring Boot application
2. Trying to export the system overview report again
3. The error should no longer occur

## Note
The application will now use `ADMIN_OVERVIEW` as the export type for system overview reports, which is shorter and fits within the database column constraints.
