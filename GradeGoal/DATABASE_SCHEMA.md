# Database Schema for GradeGoal Application

## Overview
This document describes the database schema for the GradeGoal application after removing localStorage and implementing proper database storage.

## Tables

### 1. users
Stores user authentication and profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| uid | VARCHAR(128) | NOT NULL, UNIQUE | Firebase UID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| display_name | VARCHAR(255) | NULL | User display name |

### 2. courses
Stores course information for each user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| uid | VARCHAR(128) | NOT NULL | User ID (foreign key to users.uid) |
| name | VARCHAR(255) | NOT NULL | Course name |
| grading_scale | VARCHAR(50) | NOT NULL | Grading scale (percentage, gpa, points) |
| max_points | DOUBLE | NOT NULL | Maximum possible points |
| gpa_scale | VARCHAR(10) | NULL | GPA scale (4.0, 5.0, etc.) |
| term_system | VARCHAR(20) | NULL | Term system (3-term, 4-term) |
| created_at | VARCHAR(50) | NOT NULL | Creation timestamp |
| updated_at | VARCHAR(50) | NOT NULL | Last update timestamp |

### 3. categories
Stores course categories with their weights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Category name |
| weight | DOUBLE | NOT NULL | Category weight percentage |
| course_id | BIGINT | NOT NULL | Course ID (foreign key to courses.id) |
| created_at | VARCHAR(50) | NOT NULL | Creation timestamp |
| updated_at | VARCHAR(50) | NOT NULL | Last update timestamp |

### 4. grades
Stores individual grade entries for assessments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Assessment name |
| max_score | DOUBLE | NOT NULL | Maximum possible score |
| score | DOUBLE | NULL | Actual score received |
| date | VARCHAR(20) | NOT NULL | Assessment date |
| assessment_type | VARCHAR(50) | NULL | Type (assignment, quiz, exam, etc.) |
| is_extra_credit | BOOLEAN | NOT NULL | Whether it's extra credit |
| extra_credit_points | DOUBLE | NOT NULL | Extra credit points |
| category_id | BIGINT | NOT NULL | Category ID (foreign key to categories.id) |
| created_at | VARCHAR(50) | NOT NULL | Creation timestamp |
| updated_at | VARCHAR(50) | NOT NULL | Last update timestamp |

### 5. goals
Stores user academic goals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| uid | VARCHAR(128) | NOT NULL | User ID (foreign key to users.uid) |
| course_id | VARCHAR(50) | NOT NULL | Course ID |
| name | VARCHAR(255) | NOT NULL | Goal name |
| description | TEXT | NOT NULL | Goal description |
| target_grade | DOUBLE | NOT NULL | Target grade percentage |
| target_date | VARCHAR(20) | NOT NULL | Target completion date |
| status | VARCHAR(20) | NOT NULL | Goal status (active, completed, failed) |
| created_at | VARCHAR(50) | NOT NULL | Creation timestamp |
| updated_at | VARCHAR(50) | NOT NULL | Last update timestamp |

## Relationships

- **users** → **courses**: One-to-Many (one user can have multiple courses)
- **courses** → **categories**: One-to-Many (one course can have multiple categories)
- **categories** → **grades**: One-to-Many (one category can have multiple grades)
- **users** → **goals**: One-to-Many (one user can have multiple goals)

## API Endpoints

### Courses
- `POST /api/courses` - Create a new course
- `GET /api/courses/user/{uid}` - Get courses for a user
- `GET /api/courses/{id}` - Get a specific course
- `PUT /api/courses/{id}` - Update a course
- `DELETE /api/courses/{id}` - Delete a course
- `POST /api/courses/{courseId}/categories` - Add category to course
- `GET /api/courses/{courseId}/categories` - Get categories for a course

### Grades
- `POST /api/grades` - Create a new grade
- `GET /api/grades/category/{categoryId}` - Get grades for a category
- `GET /api/grades/course/{courseId}` - Get grades for a course
- `GET /api/grades/{id}` - Get a specific grade
- `PUT /api/grades/{id}` - Update a grade
- `DELETE /api/grades/{id}` - Delete a grade
- `POST /api/grades/category/{categoryId}` - Add grade to category

### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals/user/{uid}` - Get goals for a user
- `GET /api/goals/user/{uid}/course/{courseId}` - Get goals for a user and course
- `GET /api/goals/user/{uid}/status/{status}` - Get goals by status
- `GET /api/goals/{id}` - Get a specific goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

## Migration Notes

1. **Remove localStorage**: All localStorage.getItem() and localStorage.setItem() calls have been removed
2. **API Integration**: Components now use fetch() calls to the Spring Boot backend
3. **Data Transformation**: Data is transformed between the frontend format and database format
4. **Error Handling**: Added proper error handling for API calls
5. **Loading States**: Components now handle async loading from the database

## Benefits of Database Storage

1. **Persistence**: Data persists across browser sessions and devices
2. **Multi-user**: Multiple users can access the same application
3. **Scalability**: Can handle larger amounts of data
4. **Security**: Better data security and access control
5. **Backup**: Data can be backed up and restored
6. **Analytics**: Can perform complex queries and analytics
7. **Integration**: Can integrate with other systems and services
