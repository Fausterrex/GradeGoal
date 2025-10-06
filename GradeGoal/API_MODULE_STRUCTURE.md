# API Module Structure Documentation

## Overview
The API has been reorganized into separate modules for better maintainability and organization. All existing functionality remains the same, but the code is now split into logical modules.

## Module Structure

### 📁 `/src/backend/`

#### 1. **`userManagementAPI.js`** - User Operations
- **Authentication**: `registerUser`, `loginUser`, `googleSignIn`, `facebookSignIn`
- **Profile Management**: `getUserProfile`, `updateUserProfile`, `updateUserPassword`
- **User Utilities**: `checkUsernameAvailability`, `getUserLoginStreak`, `updateUserPreferences`

#### 2. **`courseManagementAPI.js`** - Course Operations
- **Course CRUD**: `createCourse`, `getCourseById`, `updateCourse`, `deleteCourse`
- **Course Archiving**: `archiveCourse`, `unarchiveCourse`
- **Course Queries**: `getCoursesByUserId`, `getCoursesByUid`, `getActiveCoursesByUid`, `getArchivedCoursesByUid`
- **Assessment Categories**: `getAssessmentCategoriesByCourseId`, `addCategoryToCourse`, `createAssessmentCategory`, `updateAssessmentCategory`, `deleteAssessmentCategory`

#### 3. **`gradeManagementAPI.js`** - Grade Operations
- **Grade CRUD**: `createGrade`, `getGradesByCategoryId`, `getGradesByCourseId`, `updateGrade`, `deleteGrade`
- **Grade Calculations**: `calculateCourseGrade`, `calculateCourseGPA`, `calculateCategoryGrade`
- **Advanced Calculations**: `addOrUpdateGradeWithCalculation`, `calculateAndSaveCourseGrade`, `updateCourseGrades`
- **Debugging**: `debugCourseCalculations`

#### 4. **`achievementAPI.js`** - Achievement & Progress Operations
- **Achievements**: `getRecentAchievements`, `checkAchievements`, `getUserAchievements`, `getAllAchievementsWithProgress`
- **Notifications**: `getNotifications`, `getUnreadNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`
- **Academic Goals**: `createAcademicGoal`, `getAcademicGoalsByUserId`, `getAcademicGoalsByCourse`
- **User Activity**: `logUserActivity`, `logUserActivities`, `getRecentUserActivities`, `getUserActivityStats`
- **Progress Tracking**: `awardPoints`, `checkGoalProgress`, `checkGradeAlerts`

#### 5. **`aiAnalysisAPI.js`** - AI Operations
- **AI Recommendations**: `saveAIAnalysis`, `getAIRecommendations`, `getAIRecommendationsForCourse`
- **Recommendation Management**: `markRecommendationAsRead`, `dismissRecommendation`
- **AI Predictions**: `saveAIAssessmentPrediction`, `getAIAssessmentPredictions`
- **Legacy Functions**: `getAIAnalysis`, `checkAIAnalysisExists` (deprecated)

#### 6. **`api.js`** - Main Module (Re-exports everything)
- Imports and re-exports all functions from the above modules
- Maintains backward compatibility
- Includes legacy functions for old code

## Usage Examples

### ✅ **Existing Code Still Works**
```javascript
// This still works exactly the same
import { createCourse, getCourseById } from '../backend/api';

const course = await createCourse(courseData);
const courseDetails = await getCourseById(courseId);
```

### ✅ **New Modular Imports (Optional)**
```javascript
// You can now import directly from specific modules
import { createCourse, getCourseById } from '../backend/courseManagementAPI';
import { getUserProfile, updateUserProfile } from '../backend/userManagementAPI';
```

### ✅ **Mixed Imports**
```javascript
// Mix and match as needed
import { createCourse } from '../backend/courseManagementAPI';
import { getUserProfile } from '../backend/api'; // Still works
```

## Benefits

### 🎯 **Better Organization**
- Related functions are grouped together
- Easier to find specific functionality
- Clear separation of concerns

### 🔧 **Easier Maintenance**
- Smaller files are easier to work with
- Changes to one module don't affect others
- Better code review process

### 📦 **Selective Imports**
- Import only what you need
- Smaller bundle sizes (if using tree-shaking)
- Better IDE autocomplete

### 🔄 **Backward Compatibility**
- All existing code continues to work
- No breaking changes
- Gradual migration possible

## Migration Guide

### **No Action Required** ✅
- All existing imports continue to work
- All function signatures remain the same
- No code changes needed

### **Optional Improvements** 🚀
- Import directly from specific modules for better organization
- Use more specific imports to reduce bundle size
- Take advantage of better IDE support

## File Structure
```
src/backend/
├── api.js                    # Main module (re-exports everything)
├── userManagementAPI.js      # User operations
├── courseManagementAPI.js    # Course operations
├── gradeManagementAPI.js     # Grade operations
├── achievementAPI.js         # Achievement & progress operations
└── aiAnalysisAPI.js          # AI operations
```

## Testing
- ✅ Build test passed successfully
- ✅ All functions properly exported
- ✅ No linting errors
- ✅ Backward compatibility maintained

The new structure provides better organization while maintaining full backward compatibility! 🎉
