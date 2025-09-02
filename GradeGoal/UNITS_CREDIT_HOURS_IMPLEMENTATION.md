# Units and Credit Hours Implementation

## Overview

This document describes the implementation of separate `units` and `creditHours` fields in the GradeGoal application to properly distinguish between academic units and credit hours for GPA calculations.

## Problem Statement

Previously, the application had a single "Units" field that was confusingly storing data in a `creditHours` property. This caused confusion because:

1. **Units** typically represent course load or academic units (e.g., 3 units)
2. **Credit Hours** are specifically used for GPA calculations and academic credit tracking
3. The single field was serving both purposes, leading to unclear data representation

## Solution

Implemented separate fields for both concepts:

- **`units`**: Represents course load or academic units
- **`creditHours`**: Used specifically for GPA calculations and academic credit tracking

## Implementation Details

### 1. Backend Changes

#### Course Entity Updates
- Added `units` field (Integer, default: 3)
- Added `creditHours` field (Integer, default: 3)
- Updated constructor to accept both parameters
- Added getters and setters for both fields
- Added proper JavaDoc documentation

#### Database Migration
- Created `add_units_and_credit_hours.sql` migration script
- Adds both fields with appropriate constraints
- Sets default values for existing courses
- Adds validation constraints (1-6 range)
- Creates indexes for better query performance

### 2. Frontend Changes

#### AddCourse Component Updates
- Updated form state to include both `units` and `creditHours`
- Added separate form fields for both values
- Updated form submission to send both fields to backend
- Added helpful descriptions for each field
- Maintained backward compatibility with existing data

#### CourseManager Component Updates
- Added display of both units and credit hours in course cards
- Shows units and credits as small badges below course name
- Provides clear visual distinction between the two values

### 3. Database Schema Updates

#### Courses Table
```sql
-- New fields added
units INT DEFAULT 3 COMMENT 'Course units (e.g., 3 units)'
credit_hours INT DEFAULT 3 COMMENT 'Course credit hours (e.g., 3 credit hours)'

-- Constraints added
CONSTRAINT chk_units_range CHECK (units >= 1 AND units <= 6)
CONSTRAINT chk_credit_hours_range CHECK (credit_hours >= 1 AND credit_hours <= 6)

-- Indexes for performance
CREATE INDEX idx_courses_units ON courses(units);
CREATE INDEX idx_courses_credit_hours ON courses(credit_hours);
```

## Field Definitions

### Units Field
- **Purpose**: Represents course load or academic units
- **Type**: Integer
- **Range**: 1-6
- **Default**: 3
- **Usage**: Display purposes, course categorization
- **Example**: A course might be "3 units" indicating its academic weight

### Credit Hours Field
- **Purpose**: Reserved for future AI recommendation features and advanced analytics
- **Type**: Integer
- **Range**: 1-6
- **Default**: 3
- **Usage**: Future AI integration, smart recommendations, advanced reporting
- **Example**: A course with "3 credit hours" will be used for AI-powered course suggestions calculations

## Migration Process

### 1. Database Migration
```bash
# Run the migration script
mysql -u gradegoal_user -p gradegoal < database/add_units_and_credit_hours.sql
```

### 2. Application Deployment
- Deploy updated backend with new entity fields
- Deploy updated frontend with new form fields
- Existing courses will automatically get default values (3 units, 3 credit hours)

### 3. Data Verification
```sql
-- Verify the new fields were added
SELECT id, name, units, credit_hours FROM courses LIMIT 10;

-- Check for any courses with NULL values
SELECT id, name FROM courses WHERE units IS NULL OR credit_hours IS NULL;
```

## User Experience

### Form Interface
- **Units Field**: Clear label with description "Course load or academic units"
- **Credit Hours Field**: Clear label with description "Used for GPA calculations and academic credit"
- **Helpful Placeholders**: Both fields show "e.g., 3" as examples
- **Validation**: Both fields accept values 1-6 with appropriate error messages

### Display Interface
- **Course Cards**: Show both values as small badges
- **Course Details**: Display both values in course information
- **GPA Calculations**: Use units for accurate GPA computation
- **Future Features**: Credit hours reserved for AI recommendations

## Benefits

### 1. Clarity
- Clear distinction between academic units and credit hours
- Eliminates confusion about what the single field represented
- Better alignment with academic terminology

### 2. Accuracy
- Proper GPA calculations using units (current application needs)
- Accurate academic credit tracking for current features
- Better representation of course load

### 3. Flexibility
- Different values for units vs. credit hours if needed
- Support for various academic systems
- Future extensibility for different grading systems

### 4. Compliance
- Better alignment with academic standards
- Proper credit hour tracking for transcripts
- Support for institutional requirements

## Future Enhancements

### 1. Academic System Support
- Different unit systems (quarter vs. semester)
- International academic standards
- Custom unit calculations

### 2. Advanced GPA Features
- Weighted GPA calculations using units
- Unit-based progress tracking
- Academic standing calculations
- AI-powered recommendations using credit hours

### 3. Reporting and Analytics
- Unit completion tracking
- Academic progress reports
- Institutional compliance reporting

### 4. AI Integration (Future)
- Smart course recommendations using credit hours
- Predictive grade analysis
- Personalized study suggestions
- Course difficulty assessment

## Testing

### 1. Backend Testing
- Entity creation with both fields
- Validation of field ranges
- Database constraint testing
- API endpoint testing

### 2. Frontend Testing
- Form submission with both fields
- Display of both values in course cards
- Edit functionality for both fields
- Validation and error handling

### 3. Integration Testing
- End-to-end course creation flow
- Data persistence verification
- API response validation
- Database state verification

## Conclusion

The implementation of separate `units` and `creditHours` fields provides a more accurate and clear representation of course information in the GradeGoal application. This change:

1. **Eliminates confusion** about what the single field represented
2. **Improves accuracy** of GPA calculations using units (current application needs)
3. **Enhances user experience** with clear field labels and descriptions
4. **Provides flexibility** for different academic systems and requirements
5. **Maintains backward compatibility** with existing data
6. **Prepares for future AI integration** using credit hours for smart recommendations

The implementation follows best practices for database design, includes proper validation and constraints, and provides a clear migration path for existing data.
