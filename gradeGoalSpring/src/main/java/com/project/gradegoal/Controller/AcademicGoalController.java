package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.AcademicGoal;
import com.project.gradegoal.Service.AcademicGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/academic-goals")
@CrossOrigin(origins = "*")
public class AcademicGoalController {

    @Autowired
    private AcademicGoalService academicGoalService;

    @PostMapping
    public ResponseEntity<AcademicGoal> createAcademicGoal(@RequestBody AcademicGoal academicGoal) {
        try {
            AcademicGoal createdGoal = academicGoalService.createAcademicGoal(academicGoal);
            return ResponseEntity.ok(createdGoal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<AcademicGoal> createAcademicGoalForUser(
            @PathVariable Long userId,
            @RequestBody CreateGoalRequest request) {
        try {
            AcademicGoal createdGoal = academicGoalService.createAcademicGoalForUser(
                userId, 
                request.getGoalType(), 
                request.getGoalTitle(), 
                request.getTargetValue(), 
                request.getCourseId(),
                request.getTargetDate(),
                request.getDescription(),
                request.getPriority()
            );
            return ResponseEntity.ok(createdGoal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AcademicGoal>> getAcademicGoalsByUserId(@PathVariable Long userId) {
        try {
            List<AcademicGoal> goals = academicGoalService.getAcademicGoalsByUserId(userId);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<AcademicGoal>> getAcademicGoalsByCourse(@PathVariable Long userId, @PathVariable Long courseId) {
        try {
            List<AcademicGoal> goals = academicGoalService.getAcademicGoalsByCourse(userId, courseId);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/{userId}/type/{goalType}")
    public ResponseEntity<List<AcademicGoal>> getAcademicGoalsByUserIdAndType(
            @PathVariable Long userId, 
            @PathVariable AcademicGoal.GoalType goalType) {
        try {
            List<AcademicGoal> goals = academicGoalService.getAcademicGoalsByUserIdAndType(userId, goalType);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/{goalId}")
    public ResponseEntity<AcademicGoal> getAcademicGoalById(@PathVariable Long goalId) {
        try {
            Optional<AcademicGoal> goalOpt = academicGoalService.getAcademicGoalById(goalId);
            if (goalOpt.isPresent()) {
                return ResponseEntity.ok(goalOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<AcademicGoal> updateAcademicGoal(@PathVariable Long goalId, @RequestBody UpdateGoalRequest request) {
        try {
            // Get the existing goal
            Optional<AcademicGoal> existingGoalOpt = academicGoalService.getAcademicGoalById(goalId);
            if (!existingGoalOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            AcademicGoal existingGoal = existingGoalOpt.get();
            
            // Update the fields
            existingGoal.setGoalTitle(request.getGoalTitle());
            existingGoal.setGoalType(request.getGoalType());
            existingGoal.setTargetValue(request.getTargetValue());
            existingGoal.setCourseId(request.getCourseId());
            existingGoal.setTargetDate(request.getTargetDate());
            existingGoal.setDescription(request.getDescription());
            existingGoal.setPriority(request.getPriority());

            AcademicGoal updatedGoal = academicGoalService.updateAcademicGoal(existingGoal);
            return ResponseEntity.ok(updatedGoal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{goalId}/achieve")
    public ResponseEntity<AcademicGoal> markGoalAsAchieved(@PathVariable Long goalId) {
        try {
            AcademicGoal goal = academicGoalService.markGoalAsAchieved(goalId);
            return ResponseEntity.ok(goal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{goalId}/unachieve")
    public ResponseEntity<AcademicGoal> markGoalAsNotAchieved(@PathVariable Long goalId) {
        try {
            AcademicGoal goal = academicGoalService.markGoalAsNotAchieved(goalId);
            return ResponseEntity.ok(goal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{goalId}/priority")
    public ResponseEntity<AcademicGoal> updateGoalPriority(
            @PathVariable Long goalId, 
            @RequestBody UpdatePriorityRequest request) {
        try {
            AcademicGoal goal = academicGoalService.updateGoalPriority(goalId, request.getPriority());
            return ResponseEntity.ok(goal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Boolean> deleteAcademicGoal(@PathVariable Long goalId) {
        try {
            boolean deleted = academicGoalService.deleteAcademicGoal(goalId);
            return ResponseEntity.ok(deleted);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(false);
        }
    }

    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<List<AcademicGoal>> getOverdueGoals(@PathVariable Long userId) {
        try {
            List<AcademicGoal> goals = academicGoalService.getOverdueGoals();
            // Filter by user ID
            goals = goals.stream()
                .filter(goal -> goal.getUserId().equals(userId))
                .toList();
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<AcademicGoal>> getUpcomingGoals(
            @PathVariable Long userId, 
            @RequestParam(defaultValue = "7") int daysAhead) {
        try {
            List<AcademicGoal> goals = academicGoalService.getUpcomingGoals(daysAhead);
            // Filter by user ID
            goals = goals.stream()
                .filter(goal -> goal.getUserId().equals(userId))
                .toList();
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Request DTOs
    public static class CreateGoalRequest {
        private AcademicGoal.GoalType goalType;
        private String goalTitle;
        private BigDecimal targetValue;
        private Long courseId;
        private LocalDate targetDate;
        private String description;
        private AcademicGoal.Priority priority;

        // Getters and setters
        public AcademicGoal.GoalType getGoalType() { return goalType; }
        public void setGoalType(AcademicGoal.GoalType goalType) { this.goalType = goalType; }

        public String getGoalTitle() { return goalTitle; }
        public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

        public BigDecimal getTargetValue() { return targetValue; }
        public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public AcademicGoal.Priority getPriority() { return priority; }
        public void setPriority(AcademicGoal.Priority priority) { this.priority = priority; }
    }

    public static class UpdatePriorityRequest {
        private AcademicGoal.Priority priority;

        public AcademicGoal.Priority getPriority() { return priority; }
        public void setPriority(AcademicGoal.Priority priority) { this.priority = priority; }
    }

    public static class UpdateGoalRequest {
        private String goalTitle;
        private AcademicGoal.GoalType goalType;
        private BigDecimal targetValue;
        private Long courseId;
        private LocalDate targetDate;
        private String description;
        private AcademicGoal.Priority priority;

        // Getters and setters
        public String getGoalTitle() { return goalTitle; }
        public void setGoalTitle(String goalTitle) { this.goalTitle = goalTitle; }

        public AcademicGoal.GoalType getGoalType() { return goalType; }
        public void setGoalType(AcademicGoal.GoalType goalType) { this.goalType = goalType; }

        public BigDecimal getTargetValue() { return targetValue; }
        public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public AcademicGoal.Priority getPriority() { return priority; }
        public void setPriority(AcademicGoal.Priority priority) { this.priority = priority; }
    }
}
