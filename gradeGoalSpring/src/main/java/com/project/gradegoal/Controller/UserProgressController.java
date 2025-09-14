package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-progress")
@CrossOrigin(origins = "*")
public class UserProgressController {
    
    @Autowired
    private UserProgressService userProgressService;
    
    /**
     * Get user progress by user ID
     * GET /api/user-progress/{userId}
     * @param userId the user ID
     * @return UserProgress entity
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProgress> getUserProgress(@PathVariable Long userId) {
        try {
            UserProgress progress = userProgressService.getUserProgress(userId);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update user progress
     * PUT /api/user-progress/{userId}
     * @param userId the user ID
     * @param progressData the progress data to update
     * @return Updated UserProgress entity
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserProgress> updateUserProgress(
            @PathVariable Long userId, 
            @RequestBody UserProgress progressData) {
        try {
            UserProgress updatedProgress = userProgressService.updateUserProgress(userId, progressData);
            return ResponseEntity.ok(updatedProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Award points to user
     * POST /api/user-progress/{userId}/award-points
     * @param userId the user ID
     * @param points the points to award
     * @return Updated UserProgress entity
     */
    @PostMapping("/{userId}/award-points")
    public ResponseEntity<UserProgress> awardPoints(
            @PathVariable Long userId, 
            @RequestBody Integer points) {
        try {
            UserProgress updatedProgress = userProgressService.awardPoints(userId, points);
            return ResponseEntity.ok(updatedProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update user GPA
     * PUT /api/user-progress/{userId}/gpa
     * @param userId the user ID
     * @param gpaData the GPA data (semesterGpa, cumulativeGpa)
     * @return Updated UserProgress entity
     */
    @PutMapping("/{userId}/gpa")
    public ResponseEntity<UserProgress> updateUserGPA(
            @PathVariable Long userId, 
            @RequestBody GPAUpdateRequest gpaData) {
        try {
            UserProgress updatedProgress = userProgressService.updateUserGPA(
                userId, 
                gpaData.getSemesterGpa(), 
                gpaData.getCumulativeGpa()
            );
            return ResponseEntity.ok(updatedProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create user progress (when user is created)
     * POST /api/user-progress/{userId}
     * @param userId the user ID
     * @return Created UserProgress entity
     */
    @PostMapping("/{userId}")
    public ResponseEntity<UserProgress> createUserProgress(@PathVariable Long userId) {
        try {
            UserProgress progress = userProgressService.createUserProgress(userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Inner class for GPA update request
     */
    public static class GPAUpdateRequest {
        private Double semesterGpa;
        private Double cumulativeGpa;
        
        // Constructors
        public GPAUpdateRequest() {}
        
        public GPAUpdateRequest(Double semesterGpa, Double cumulativeGpa) {
            this.semesterGpa = semesterGpa;
            this.cumulativeGpa = cumulativeGpa;
        }
        
        // Getters and Setters
        public Double getSemesterGpa() {
            return semesterGpa;
        }
        
        public void setSemesterGpa(Double semesterGpa) {
            this.semesterGpa = semesterGpa;
        }
        
        public Double getCumulativeGpa() {
            return cumulativeGpa;
        }
        
        public void setCumulativeGpa(Double cumulativeGpa) {
            this.cumulativeGpa = cumulativeGpa;
        }
    }
}
