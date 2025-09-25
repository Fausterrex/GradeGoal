package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Service.DatabaseCalculationService;
import com.project.gradegoal.Service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-progress")
@CrossOrigin(origins = "*")
public class UserProgressController {

    @Autowired
    private UserProgressService userProgressService;

    @Autowired
    private DatabaseCalculationService databaseCalculationService;

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Get user progress by user ID
     * @param userId User ID
     * @return UserProgress entity
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProgress(@PathVariable Long userId) {
        try {
            UserProgress userProgress = userProgressService.getUserProgress(userId);
            if (userProgress != null) {
                return ResponseEntity.ok(userProgress);
            } else {
                return ResponseEntity.status(404).body("User progress not found");
            }
        } catch (Exception e) {
            System.err.println("Error fetching user progress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to fetch user progress");
        }
    }

    /**
     * Update user progress with accurate GPA values
     * @param userId User ID
     * @return Updated UserProgress entity
     */
    @PostMapping("/{userId}/update-gpas")
    public ResponseEntity<?> updateUserProgressGPAs(@PathVariable Long userId) {
        try {
            System.out.println("🔄 [UserProgressController] Updating GPAs for user: " + userId);
            UserProgress updatedProgress = databaseCalculationService.updateUserProgressGPAs(userId);
            
            if (updatedProgress != null) {
                System.out.println("✅ [UserProgressController] Successfully updated user progress");
                return ResponseEntity.ok(updatedProgress);
            } else {
                System.out.println("❌ [UserProgressController] Failed to update user progress");
                return ResponseEntity.status(500).body("Failed to update user progress");
            }
        } catch (Exception e) {
            System.err.println("❌ [UserProgressController] Error updating user progress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to update user progress: " + e.getMessage());
        }
    }

    /**
     * Get or create user progress with accurate GPA values
     * @param userId User ID
     * @return UserProgress entity with updated GPAs
     */
    @GetMapping("/{userId}/with-gpas")
    public ResponseEntity<?> getUserProgressWithGPAs(@PathVariable Long userId) {
        try {
            System.out.println("🔄 [UserProgressController] Getting user progress with GPAs for user: " + userId);
            
            // First try to get existing user progress
            UserProgress existingProgress = userProgressService.getUserProgress(userId);
            
            if (existingProgress == null) {
                System.out.println("⚠️ [UserProgressController] No existing user progress found, creating new one");
                existingProgress = new UserProgress(userId);
                existingProgress.setSemesterGpa(0.0);
                existingProgress.setCumulativeGpa(0.0);
                existingProgress = userProgressService.updateUserProgress(userId, existingProgress);
            }
            
            // Try to update the GPAs, but don't fail if it doesn't work
            try {
                UserProgress updatedProgress = databaseCalculationService.updateUserProgressGPAs(userId);
                if (updatedProgress != null) {
                    System.out.println("✅ [UserProgressController] Successfully updated GPAs");
                    return ResponseEntity.ok(updatedProgress);
                } else {
                    System.out.println("⚠️ [UserProgressController] GPA update failed, returning existing progress");
                    return ResponseEntity.ok(existingProgress);
                }
            } catch (Exception e) {
                System.err.println("⚠️ [UserProgressController] Error updating GPAs, returning existing progress: " + e.getMessage());
                return ResponseEntity.ok(existingProgress);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [UserProgressController] Error getting user progress with GPAs: " + e.getMessage());
            e.printStackTrace();
            
            // Return a default user progress if everything fails
            UserProgress defaultProgress = new UserProgress(userId);
            defaultProgress.setSemesterGpa(0.0);
            defaultProgress.setCumulativeGpa(0.0);
            defaultProgress.setCurrentLevel(1);
            defaultProgress.setTotalPoints(0);
            defaultProgress.setStreakDays(0);
            
            return ResponseEntity.ok(defaultProgress);
        }
    }

    /**
     * Get semester-specific GPA for a user
     * @param userId User ID
     * @param semester Semester (FIRST, SECOND, THIRD, SUMMER)
     * @param academicYear Academic year (optional, defaults to 2025)
     * @return Semester GPA
     */
    @GetMapping("/{userId}/semester-gpa")
    public ResponseEntity<?> getSemesterGPA(
            @PathVariable Long userId,
            @RequestParam String semester,
            @RequestParam(required = false, defaultValue = "2025") String academicYear) {
        try {
            System.out.println("🔄 [UserProgressController] Getting semester GPA for user: " + userId + ", semester: " + semester + ", year: " + academicYear);
            
            // Calculate semester GPA for the specific semester
            BigDecimal semesterGPA = databaseCalculationService.calculateSemesterGPA(userId, semester, academicYear);
            
            System.out.println("📊 [UserProgressController] Calculated " + semester + " semester GPA: " + semesterGPA);
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("semester", semester);
            result.put("academicYear", academicYear);
            result.put("semesterGPA", semesterGPA.doubleValue());
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ [UserProgressController] Error getting semester GPA: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", e.getMessage());
            errorResult.put("success", false);
            
            return ResponseEntity.status(500).body(errorResult);
        }
    }

    /**
     * Get all semester GPAs for a user
     * @param userId User ID
     * @param academicYear Academic year (optional, defaults to 2025)
     * @return All semester GPAs
     */
    @GetMapping("/{userId}/all-semester-gpas")
    public ResponseEntity<?> getAllSemesterGPAs(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "2025") String academicYear) {
        try {
            System.out.println("🔄 [UserProgressController] Getting all semester GPAs for user: " + userId + ", year: " + academicYear);
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("academicYear", academicYear);
            
            // Calculate GPA for each semester
            String[] semesters = {"FIRST", "SECOND", "THIRD", "SUMMER"};
            Map<String, Double> semesterGPAs = new HashMap<>();
            
            for (String semester : semesters) {
                try {
                    BigDecimal gpa = databaseCalculationService.calculateSemesterGPA(userId, semester, academicYear);
                    semesterGPAs.put(semester, gpa.doubleValue());
                    System.out.println("📊 [UserProgressController] " + semester + " semester GPA: " + gpa);
                } catch (Exception e) {
                    System.err.println("⚠️ [UserProgressController] Error calculating " + semester + " semester GPA: " + e.getMessage());
                    semesterGPAs.put(semester, 0.0);
                }
            }
            
            result.put("semesterGPAs", semesterGPAs);
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ [UserProgressController] Error getting all semester GPAs: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", e.getMessage());
            errorResult.put("success", false);
            
            return ResponseEntity.status(500).body(errorResult);
        }
    }

    /**
     * Test endpoint to check database functions
     * @param userId User ID
     * @return Test results
     */
    @GetMapping("/{userId}/test")
    public ResponseEntity<?> testDatabaseFunctions(@PathVariable Long userId) {
        try {
            System.out.println("🧪 [UserProgressController] Testing database functions for user: " + userId);
            
            // Test cumulative GPA calculation
            BigDecimal cumulativeGPA = databaseCalculationService.calculateCumulativeGPA(userId);
            System.out.println("📊 [UserProgressController] Cumulative GPA: " + cumulativeGPA);
            
            // Test semester GPA calculation (using default values)
            BigDecimal semesterGPA = databaseCalculationService.calculateSemesterGPA(userId, "FIRST", "2025");
            System.out.println("📊 [UserProgressController] Semester GPA: " + semesterGPA);
            
            // Get active courses
            List<Course> activeCourses = courseRepository.findByUserIdAndIsActiveTrue(userId);
            System.out.println("📚 [UserProgressController] Active courses count: " + activeCourses.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", userId);
            result.put("cumulativeGPA", cumulativeGPA);
            result.put("semesterGPA", semesterGPA);
            result.put("activeCoursesCount", activeCourses.size());
            result.put("success", true);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ [UserProgressController] Error testing database functions: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", e.getMessage());
            errorResult.put("success", false);
            
            return ResponseEntity.status(500).body(errorResult);
        }
    }
}
