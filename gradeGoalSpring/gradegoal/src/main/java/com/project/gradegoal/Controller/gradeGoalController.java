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

    @PostMapping("/gradeGoal")
    public gradeGoal postGradeGoal(@RequestBody gradeGoal gradeGoal) {
        return gradeGoalService.postGradeGoal(gradeGoal);
    }

    @GetMapping("/gradeGoal/{uid}")
    public ResponseEntity<?> getByUid(@PathVariable String uid) {
        try {
            return ResponseEntity.ok(gradeGoalService.findByUidOrThrow(uid));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PostMapping("/gradeGoal/google-signin")
    public ResponseEntity<?> googleSignIn(@RequestBody gradeGoal userData) {
        try {
            gradeGoal user = gradeGoalService.findOrCreateUser(userData);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Google sign-in failed: " + e.getMessage());
        }
    }

    @PostMapping("/gradeGoal/facebook-signin")
    public ResponseEntity<?> facebookSignIn(@RequestBody gradeGoal userData) {
        try {
            gradeGoal user = gradeGoalService.findOrCreateUser(userData);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Facebook sign-in failed: " + e.getMessage());
        }
    }
}