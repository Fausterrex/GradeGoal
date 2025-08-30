# GradeGoal - Dynamic Course Grade Calculation System

## Overview
GradeGoal is a React-based web application that provides dynamic course grade calculation using weighted categories. The system supports multiple grading scales and provides real-time grade calculations with support for extra credit and missing grade handling.

## Key Features

### 1. **Weighted Category Calculations**
- Each course can have multiple categories (e.g., Assignments, Quizzes, Exams, Final)
- Categories are assigned weights (e.g., Assignments: 30%, Quizzes: 20%, Exams: 50%)
- Final course grade is calculated as: `Σ(category_weight × category_average)`

### 2. **Flexible Grading Scales**
- **Percentage**: 0-100%
- **GPA**: Multiple scale options:
  - Standard 4.0 scale (1.0 = F, 4.0 = A)
  - Standard 5.0 scale (1.0 = F, 5.0 = A)
  - Inverted 4.0 scale (4.0 = F, 1.0 = A)
  - Inverted 5.0 scale (5.0 = F, 1.0 = A)
- **Points**: Custom point system with configurable maximum

### 3. **Term System Support**
- **2-Term System**: Midterm (40%) + Final Term (60%)
- **3-Term System**: First Term (30%) + Midterm (30%) + Final Term (40%)
- Automatic category templates based on selected term system
- Customizable weights for each term
- Support for different school grading periods

### 3. **Missing Grade Handling**
- **Exclude**: Missing grades are not included in calculations
- **Treat as Zero**: Missing grades are treated as 0%
- User preference can be set per course

### 4. **Extra Credit Support**
- Individual grades can be marked as extra credit
- Extra credit grades are included in category calculations
- Visual indicators for extra credit assignments

### 5. **Real-time Recalculation**
- Grades are recalculated immediately when added/modified
- Category averages update automatically
- Course overall grade updates in real-time

## How to Use

### **Add Course**
1. Navigate to the Main Dashboard
2. Click "Add Course" button
3. Fill in course details:
   - **Course Name**: Full name of the course
   - **Course Code**: Course identifier (e.g., CS101)
   - **Credit Hours**: Number of credit hours (default: 3)
   - **Semester**: Current or target semester
   - **Target Grade**: Your goal grade for the course
   - **Grading Scale**: Choose from Percentage, GPA, or Points
   - **Max Points**: Maximum points for the course (if using Points scale)
   - **Handle Missing Grades**: Choose to exclude or treat as zero
4. **Add Categories**: 
   - Click "Add Category" to add individual categories
   - Or click "Use Template" to quickly add common categories:
     - Attendance (10% weight)
     - Quiz (20% weight)
     - Midterm (35% weight)
     - Final (35% weight)
5. Click "Add Course" to save

### **Add Assessments**
1. Select a course from the dashboard
2. Click "Add Assessment" button
3. Fill in assessment details:
   - **Category**: Select the appropriate category
   - **Assessment Type**: Choose from Assignment, Quiz, Exam, Project, Participation, or Other
   - **Assessment Name**: Name of the specific assessment
   - **Maximum Score**: Maximum possible score for this assessment (e.g., 25)
   - **Date**: When this assessment should be taken
4. Click "Add Assessment" to save

### **Add Your Scores**
1. After creating an assessment, it will appear with a "Pending" status
2. Click on the assessment card to add your score
3. Enter the score you received
4. The system automatically calculates the percentage and updates the course grade

**Important**: The system now uses a two-step process: first create assessments (without scores), then add scores when you complete them. This allows you to plan your semester ahead of time.

### **Set Goals**
1. Select a course from the dashboard
2. Click on the "Goals" tab
3. Set your academic goals:
   - **Target Grade**: Your desired final grade
   - **Study Hours**: Weekly study time commitment
   - **Notes**: Additional goals or strategies
4. Click "Set Goal" to save
5. View feasibility analysis and recommendations

### **Monitor Progress**
1. **Overview Tab**: See all courses with current grades and progress
2. **Courses Tab**: Manage courses, add/edit categories, and view course details
3. **Grades Tab**: Input and manage individual grades for selected course
4. **Goals Tab**: Track academic goals and view feasibility analysis

## Technical Implementation

### **Data Models**

#### Course Object
```javascript
{
  id: "unique_id",
  name: "Course Name",
  code: "CS101",
  creditHours: 3,
  semester: "Fall 2024",
  targetGrade: "A",
  gradingScale: "percentage", // or "gpa", "points"
  maxPoints: 100,
  handleMissing: "exclude", // or "zero"
  termSystem: "3-term", // or "2-term"
  gpaScale: "4.0", // "4.0", "5.0", "inverted-4.0", "inverted-5.0"
  categories: [/* array of Category objects */]
}
```

#### Category Object
```javascript
{
  id: "unique_id",
  name: "Assignments",
  weight: 30, // percentage weight
  gradingScale: "percentage",
  grades: [/* array of Grade objects */]
}
```

#### Grade Object
```javascript
{
  id: "unique_id",
  categoryId: "category_id",
  name: "Assignment 1",
  score: 18, // Raw score obtained (null initially)
  maxScore: 25, // Maximum possible score
  assessmentType: "assignment", // or "quiz", "exam", "project", "participation", "other"
  date: "2024-09-15", // When assessment should be taken
  createdAt: "2024-09-15T10:00:00Z",
  updatedAt: "2024-09-15T10:00:00Z"
}
```

### **Core Calculation Functions**

#### Category Average
```javascript
function calculateCategoryAverage(grades, scale, maxPoints, handleMissing) {
  // Filter valid grades based on handleMissing preference
  // Convert each grade to percentage using score/maxScore
  // Return arithmetic mean of percentages
}
```

#### Course Grade
```javascript
function calculateCourseGrade(categories, gradingScale, maxPoints, handleMissing) {
  // For each category: category_weight × category_average
  // Sum all weighted averages
  // Return final course grade
}
```

#### Grade Conversion
```javascript
function convertGradeToPercentage(grade, scale, maxPoints) {
  // Always use score/maxScore to calculate percentage
  // Return percentage regardless of course grading scale
}

function convertPercentageToScale(percentage, scale, maxPoints) {
  // Convert percentage to desired output scale
  // Support all grading scales
}
```

### **Grade Service**
The `GradeService` class provides:
- Course impact calculations
- CGPA updates across all courses
- Goal feasibility analysis
- Grade input validation
- Study recommendations

## Edge Cases Handled

### **No Grades Yet**
- Categories show "No grades added yet"
- Course grade displays as 0%
- No calculation errors

### **All Categories Incomplete**
- System respects `handleMissing` preference
- Graceful handling of empty categories
- Clear visual indicators

### **Invalid Grade Input**
- Validation for score vs. maxScore
- Prevents score > maxScore
- Ensures positive numbers
- Required field validation

### **Extra Credit Handling**
- Extra credit grades are included in calculations
- Visual indicators for extra credit assignments
- No special weighting - treated as regular grades

## Future Enhancements

### **Planned Features**
- Firebase Firestore integration for data persistence
- User authentication and course sharing
- Grade trend analysis and charts
- Export functionality (PDF, CSV)
- Mobile app version

### **ML Service Integration** (Future)
- Predictive grade analysis
- Personalized study recommendations
- Performance trend predictions
- Goal feasibility scoring

## File Structure

```
src/
├── components/
│   ├── MainDashboard.jsx    # Main dashboard
│   ├── CourseManager.jsx        # Course management
│   ├── GradeEntry.jsx          # Grade input and management
│   └── GoalSetting.jsx         # Goal setting and analysis
├── utils/
│   └── gradeCalculations.js    # Core calculation utilities
├── services/
│   └── gradeService.js         # Business logic service
└── context/
    └── AuthContext.jsx         # Authentication context
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open browser to `http://localhost:5173`
   - Sign up or log in
   - Start adding courses and grades

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Notes
- Real-time calculations using efficient algorithms
- Local storage for immediate persistence
- Optimized React rendering with proper state management
- Responsive design for all screen sizes
