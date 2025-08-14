package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.gradeGoal;
import com.project.gradegoal.Service.gradeGoalService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin("*")
public class gradeGoalController {

    private final gradeGoalService gradeGoalService;

    // Signup or upsert
    @PostMapping("/gradeGoal")
    public gradeGoal postGradeGoal(@RequestBody gradeGoal gradeGoal) {
        return gradeGoalService.postGradeGoal(gradeGoal);
    }

    // Login by uid (simple fetch)
    @GetMapping("/gradeGoal/{uid}")
    public ResponseEntity<?> getByUid(@PathVariable String uid) {
        try {
            return ResponseEntity.ok(gradeGoalService.findByUidOrThrow(uid));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}