package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.UserAnalytics;
import com.project.gradegoal.Service.DatabaseCalculationService;
import com.project.gradegoal.Service.CourseService;
import com.project.gradegoal.Repository.UserAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for database-backed grade calculations
 * This replaces frontend JavaScript calculations with robust database calculations
 */
@RestController
@RequestMapping("/api/database-calculations")
@CrossOrigin(origins = "http://localhost:5173")
public class DatabaseCalculationController {

    @Autowired
    private DatabaseCalculationService databaseCalculationService;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private UserAnalyticsRepository userAnalyticsRepository;

    /**
     * Calculate course grade using database function
     */
    @GetMapping("/course/{courseId}/grade")
    public ResponseEntity<Map<String, Object>> calculateCourseGrade(@PathVariable Long courseId) {
        try {
            BigDecimal courseGrade = databaseCalculationService.calculateCourseGrade(courseId);
            BigDecimal gpa = databaseCalculationService.calculateGPA(courseGrade);
            
            Map<String, Object> response = new HashMap<>();
            response.put("courseId", courseId);
            response.put("courseGrade", courseGrade);
            response.put("gpa", gpa);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate course grade: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calculate course GPA using database function
     */
    @GetMapping("/course/{courseId}/gpa")
    public ResponseEntity<Map<String, Object>> calculateCourseGPA(@PathVariable Long courseId) {
        try {
            BigDecimal courseGrade = databaseCalculationService.calculateCourseGrade(courseId);
            BigDecimal gpa = databaseCalculationService.calculateGPA(courseGrade);
            
            Map<String, Object> response = new HashMap<>();
            response.put("courseId", courseId);
            response.put("courseGPA", gpa);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate course GPA: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calculate category grade using database function
     */
    @GetMapping("/category/{categoryId}/grade")
    public ResponseEntity<Map<String, Object>> calculateCategoryGrade(@PathVariable Long categoryId) {
        try {
            BigDecimal categoryGrade = databaseCalculationService.calculateCategoryGrade(categoryId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("categoryId", categoryId);
            response.put("categoryGrade", categoryGrade);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate category grade: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calculate GPA from percentage
     */
    @PostMapping("/gpa/calculate")
    public ResponseEntity<Map<String, Object>> calculateGPA(@RequestBody Map<String, Object> request) {
        try {
            if (request == null || request.get("percentage") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Percentage value is required");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            BigDecimal percentage = new BigDecimal(request.get("percentage").toString());
            BigDecimal gpa = databaseCalculationService.calculateGPA(percentage);
            
            Map<String, Object> response = new HashMap<>();
            response.put("percentage", percentage);
            response.put("gpa", gpa);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate GPA: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calculate cumulative GPA for user
     */
    @GetMapping("/user/{userId}/cumulative-gpa")
    public ResponseEntity<Map<String, Object>> calculateCumulativeGPA(@PathVariable Long userId) {
        try {
            BigDecimal cumulativeGPA = databaseCalculationService.calculateCumulativeGPA(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("cumulativeGPA", cumulativeGPA);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate cumulative GPA: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Add or update grade using database procedure
     */

    @PostMapping("/grade/add-update")
    public ResponseEntity<Map<String, Object>> addOrUpdateGrade(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🔍 Received grade data: " + request);
            
            if (request == null) {
                System.err.println("❌ Request body is null");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Request body is required");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate required fields
            if (request.get("assessmentId") == null || request.get("pointsEarned") == null || 
                request.get("pointsPossible") == null || request.get("percentageScore") == null) {
                System.err.println("❌ Missing required fields - assessmentId: " + request.get("assessmentId") + 
                                 ", pointsEarned: " + request.get("pointsEarned") + 
                                 ", pointsPossible: " + request.get("pointsPossible") + 
                                 ", percentageScore: " + request.get("percentageScore"));
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Required fields: assessmentId, pointsEarned, pointsPossible, percentageScore");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Long assessmentId = Long.valueOf(request.get("assessmentId").toString());
            BigDecimal pointsEarned = new BigDecimal(request.get("pointsEarned").toString());
            BigDecimal pointsPossible = new BigDecimal(request.get("pointsPossible").toString());
            BigDecimal percentageScore = new BigDecimal(request.get("percentageScore").toString());
            String scoreType = request.get("scoreType") != null ? request.get("scoreType").toString() : "PERCENTAGE";
            String notes = request.get("notes") != null ? request.get("notes").toString() : "";
            Boolean isExtraCredit = request.get("isExtraCredit") != null ? Boolean.valueOf(request.get("isExtraCredit").toString()) : false;
            BigDecimal extraCreditPoints = request.get("extraCreditPoints") != null ? 
                new BigDecimal(request.get("extraCreditPoints").toString()) : null;


            String result = databaseCalculationService.addOrUpdateGrade(
                assessmentId, pointsEarned, pointsPossible, percentageScore,
                scoreType, notes, isExtraCredit, extraCreditPoints
            );

            // Check if result contains course ID for analytics update
            System.out.println("🔍 Grade add/update result: " + result);
            String[] resultParts = result.split("\\|");
            String message = resultParts[0];
            Long courseId = null;
            
            if (resultParts.length > 1 && !resultParts[1].isEmpty()) {
                try {
                    courseId = Long.valueOf(resultParts[1]);
                    System.out.println("🎯 Extracted course ID: " + courseId);
                    // Update course grades in a separate transaction to avoid rollback issues
                    databaseCalculationService.updateCourseGrades(courseId);
                    System.out.println("✅ Course grades updated for course " + courseId);
                    
                    // Update user progress GPAs after course grades are updated
                    try {
                        // Get the user ID from the course
                        Long userId = databaseCalculationService.getUserIdFromCourse(courseId);
                        if (userId != null) {
                            databaseCalculationService.updateUserProgressGPAs(userId);
                            System.out.println("✅ User progress GPAs updated for user " + userId);
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to update user progress GPAs: " + e.getMessage());
                        // Don't fail the entire operation if GPA update fails
                    }
                } catch (NumberFormatException e) {
                    System.err.println("❌ Failed to parse course ID from result: " + result);
                    e.printStackTrace();
                }
            } else {
                System.err.println("❌ No course ID found in result: " + result);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("result", message);
            response.put("courseId", courseId);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to add/update grade: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Update course grades using database procedure
     */
    @PostMapping("/course/{courseId}/update-grades")
    public ResponseEntity<Map<String, Object>> updateCourseGrades(@PathVariable Long courseId) {
        try {
            databaseCalculationService.updateCourseGrades(courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("courseId", courseId);
            response.put("message", "Course grades updated successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update course grades: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Award points to user using database procedure
     */
    @PostMapping("/user/{userId}/award-points")
    public ResponseEntity<Map<String, Object>> awardPoints(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            if (request == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Request body is required");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate required fields
            if (request.get("points") == null || request.get("activityType") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Required fields: points, activityType");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Integer points = Integer.valueOf(request.get("points").toString());
            String activityType = request.get("activityType").toString();

            databaseCalculationService.awardPoints(userId, points, activityType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("points", points);
            response.put("activityType", activityType);
            response.put("message", "Points awarded successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to award points: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Check goal progress using database procedure
     */
    @PostMapping("/user/{userId}/check-goal-progress")
    public ResponseEntity<Map<String, Object>> checkGoalProgress(@PathVariable Long userId) {
        try {
            databaseCalculationService.checkGoalProgress(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("message", "Goal progress checked successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check goal progress: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Check grade alerts using database procedure
     */
    @PostMapping("/user/{userId}/check-grade-alerts")
    public ResponseEntity<Map<String, Object>> checkGradeAlerts(@PathVariable Long userId) {
        try {
            databaseCalculationService.checkGradeAlerts(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("message", "Grade alerts checked successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check grade alerts: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    /**
     * Update all course grades for a user
     */
    @PostMapping("/user/{userId}/update-all-course-grades")
    public ResponseEntity<Map<String, Object>> updateAllUserCourseGrades(@PathVariable Long userId) {
        try {
            databaseCalculationService.updateAllUserCourseGrades(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("message", "All course grades updated successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update all course grades: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get course with updated calculations
     */
    @GetMapping("/course/{courseId}/with-calculations")
    public ResponseEntity<Map<String, Object>> getCourseWithCalculations(@PathVariable Long courseId) {
        try {
            Course course = databaseCalculationService.getCourseWithCalculations(courseId);
            
            if (course != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("course", course);
                response.put("success", true);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Course not found");
                errorResponse.put("success", false);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get course with calculations: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Initialize sample achievements
     */
    @PostMapping("/achievements/initialize")
    public ResponseEntity<Map<String, Object>> initializeSampleAchievements() {
        try {
            databaseCalculationService.initializeSampleAchievements();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample achievements initialized successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to initialize sample achievements: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Calculate and save course grade and GPA to database
     */
    @PostMapping("/course/{courseId}/calculate-and-save")
    public ResponseEntity<Map<String, Object>> calculateAndSaveCourseGrade(@PathVariable Long courseId) {
        try {
            System.out.println("🔢 Starting calculation and save for course ID: " + courseId);
            
            // Calculate the course grade using database function
            BigDecimal courseGrade = databaseCalculationService.calculateCourseGrade(courseId);
            BigDecimal gpa = databaseCalculationService.calculateGPA(courseGrade);
            
            System.out.println("📊 Calculated values - Grade: " + courseGrade + "%, GPA: " + gpa);
            
            // Save the calculated values to the courses table in a single transaction
            Course updatedCourse = courseService.updateCalculatedGradeAndGpa(courseId, courseGrade, gpa);
            
            System.out.println("💾 Save result: " + (updatedCourse != null ? "SUCCESS" : "FAILED"));
            
            // Verify the values were actually saved by reading them back
            Optional<Course> verificationCourse = courseService.getCourseById(courseId);
            if (verificationCourse.isPresent()) {
                Course course = verificationCourse.get();
                System.out.println("✅ Verification - Stored Grade: " + course.getCalculatedCourseGrade() + 
                                 ", Stored GPA: " + course.getCourseGpa());
                                 
            // Check for goal achievements after GPA update
            // Note: Analytics are already updated by UpdateCourseGrades stored procedure
            try {
                Long userId = course.getUserId();
                if (userId != null) {
                    databaseCalculationService.checkGoalProgress(userId);
                    System.out.println("🎯 Goal progress checked for user " + userId);
                }
            } catch (Exception goalError) {
                System.err.println("Failed to check goal progress after course calculation: " + goalError.getMessage());
            }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("courseId", courseId);
            response.put("courseGrade", courseGrade);
            response.put("gpa", gpa);
            response.put("message", "Course grade and GPA calculated and saved successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in calculateAndSaveCourseGrade: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate and save course grade: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Update course handle missing setting and recalculate grades
     */
    @PostMapping("/course/{courseId}/handle-missing")
    public ResponseEntity<Map<String, Object>> updateHandleMissingSetting(
            @PathVariable Long courseId, 
            @RequestBody Map<String, Object> request) {
        try {
            if (request == null || request.get("handleMissing") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "handleMissing setting is required");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            String handleMissing = request.get("handleMissing").toString();
            
            // Validate the setting value
            if (!handleMissing.equals("exclude") && !handleMissing.equals("treat_as_zero")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "handleMissing must be 'exclude' or 'treat_as_zero'");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Update the course setting using stored procedure
            databaseCalculationService.updateCourseHandleMissing(courseId, handleMissing);
            
            // Get the updated course grade
            BigDecimal courseGrade = databaseCalculationService.calculateCourseGrade(courseId);
            BigDecimal gpa = databaseCalculationService.calculateGPA(courseGrade);
            
            Map<String, Object> response = new HashMap<>();
            response.put("courseId", courseId);
            response.put("handleMissing", handleMissing);
            response.put("courseGrade", courseGrade);
            response.put("gpa", gpa);
            response.put("message", "Handle missing setting updated and grades recalculated successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update handle missing setting: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Debug endpoint to test database functions and storage
     */
    @GetMapping("/course/{courseId}/debug")
    public ResponseEntity<Map<String, Object>> debugCourseCalculations(@PathVariable Long courseId) {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Test database function calls
            BigDecimal courseGrade = databaseCalculationService.calculateCourseGrade(courseId);
            BigDecimal gpa = databaseCalculationService.calculateGPA(courseGrade);
            
            // Get current stored values
            Optional<Course> courseOpt = courseService.getCourseById(courseId);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                debugInfo.put("currentStoredGrade", course.getCalculatedCourseGrade());
                debugInfo.put("currentStoredGPA", course.getCourseGpa());
                debugInfo.put("handleMissing", course.getHandleMissing());
                debugInfo.put("courseName", course.getCourseName());
            }
            
            debugInfo.put("calculatedGrade", courseGrade);
            debugInfo.put("calculatedGPA", gpa);
            debugInfo.put("courseId", courseId);
            debugInfo.put("success", true);
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Debug failed: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get user analytics for a specific course
     * Returns all analytics records for the user and course, ordered by date
     * Supports optional semester filtering
     */
    @GetMapping("/user/{userId}/analytics/{courseId}")
    public ResponseEntity<?> getUserAnalytics(
            @PathVariable Long userId, 
            @PathVariable Long courseId,
            @RequestParam(required = false) String semester) {
        try {
            System.out.println("🔍 [DatabaseCalculationController] Fetching analytics for user: " + userId + ", course: " + courseId + ", semester: " + semester);
            
            List<UserAnalytics> analyticsList;
            
            if (semester != null && !semester.isEmpty()) {
                // Filter by semester if provided
                analyticsList = userAnalyticsRepository.findByUserIdAndCourseIdAndSemesterOrderByAnalyticsDateDesc(userId, courseId, semester);
                System.out.println("📊 [DatabaseCalculationController] Found " + analyticsList.size() + " analytics records for semester: " + semester);
            } else {
                // Get all analytics records for this user and course, ordered by date
                analyticsList = userAnalyticsRepository.findByUserIdAndCourseIdOrderByAnalyticsDateDesc(userId, courseId);
                System.out.println("📊 [DatabaseCalculationController] Found " + analyticsList.size() + " analytics records");
            }
            
            if (analyticsList.isEmpty()) {
                System.out.println("⚠️ [DatabaseCalculationController] No analytics found, triggering recalculation");
                
                // Try to trigger analytics recalculation by updating course grades
                try {
                    System.out.println("🔄 [DatabaseCalculationController] Triggering analytics recalculation for course: " + courseId);
                    databaseCalculationService.updateCourseGrades(courseId);
                    
                    // Fetch analytics again after recalculation
                    if (semester != null && !semester.isEmpty()) {
                        analyticsList = userAnalyticsRepository.findByUserIdAndCourseIdAndSemesterOrderByAnalyticsDateDesc(userId, courseId, semester);
                    } else {
                        analyticsList = userAnalyticsRepository.findByUserIdAndCourseIdOrderByAnalyticsDateDesc(userId, courseId);
                    }
                    
                    System.out.println("📊 [DatabaseCalculationController] After recalculation, found " + analyticsList.size() + " analytics records");
                } catch (Exception e) {
                    System.err.println("⚠️ [DatabaseCalculationController] Failed to trigger analytics recalculation: " + e.getMessage());
                }
                
                // Return whatever we have (empty or recalculated)
                return ResponseEntity.ok(analyticsList);
            }
            
            // Log the analytics data for debugging
            analyticsList.forEach(analytics -> {
                System.out.println("📊 [DatabaseCalculationController] Analytics: " + 
                    "id=" + analytics.getAnalyticsId() + 
                    ", date=" + analytics.getAnalyticsDate() + 
                    ", current_grade=" + analytics.getCurrentGrade() + 
                    ", grade_trend=" + analytics.getGradeTrend() + 
                    ", assignments_completed=" + analytics.getAssignmentsCompleted() +
                    ", semester=" + analytics.getSemester());
            });
            
            return ResponseEntity.ok(analyticsList);
            
        } catch (Exception e) {
            System.err.println("❌ [DatabaseCalculationController] Error fetching analytics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch analytics: " + e.getMessage());
        }
    }
}
