package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Service.DatabaseCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

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
            if (request == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Request body is required");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate required fields
            if (request.get("assessmentId") == null || request.get("pointsEarned") == null || 
                request.get("pointsPossible") == null || request.get("percentageScore") == null) {
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

            String result = databaseCalculationService.addOrUpdateGrade(
                assessmentId, pointsEarned, pointsPossible, percentageScore,
                scoreType, notes, isExtraCredit
            );

            Map<String, Object> response = new HashMap<>();
            response.put("result", result);
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
     * Check user achievements using database procedure
     */
    @PostMapping("/user/{userId}/check-achievements")
    public ResponseEntity<Map<String, Object>> checkUserAchievements(@PathVariable Long userId) {
        try {
            databaseCalculationService.checkUserAchievements(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("message", "User achievements checked successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check user achievements: " + e.getMessage());
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
}
