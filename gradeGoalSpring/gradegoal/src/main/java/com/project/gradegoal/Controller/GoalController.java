package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Goal;
import com.project.gradegoal.Service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin("*")
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        Goal createdGoal = goalService.createGoal(goal);
        return ResponseEntity.ok(createdGoal);
    }

    @GetMapping("/user/{uid}")
    public ResponseEntity<List<Goal>> getGoalsByUid(@PathVariable String uid) {
        List<Goal> goals = goalService.getGoalsByUid(uid);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/user/{uid}/course/{courseId}")
    public ResponseEntity<List<Goal>> getGoalsByUidAndCourseId(@PathVariable String uid, @PathVariable String courseId) {
        List<Goal> goals = goalService.getGoalsByUidAndCourseId(uid, courseId);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/user/{uid}/status/{status}")
    public ResponseEntity<List<Goal>> getGoalsByUidAndStatus(@PathVariable String uid, @PathVariable String status) {
        List<Goal> goals = goalService.getGoalsByUidAndStatus(uid, status);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id) {
        return goalService.getGoalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        goal.setId(id);
        Goal updatedGoal = goalService.updateGoal(goal);
        return ResponseEntity.ok(updatedGoal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok().build();
    }
}
