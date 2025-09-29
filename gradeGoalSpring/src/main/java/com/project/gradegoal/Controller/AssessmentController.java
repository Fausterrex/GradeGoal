package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {
        try {
            List<Assessment> assessments = assessmentService.getAllAssessmentsWithCourseInfo();
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<Assessment> getAssessmentById(@PathVariable Long assessmentId) {
        try {
            Optional<Assessment> assessmentOpt = assessmentService.getAssessmentById(assessmentId);
            if (assessmentOpt.isPresent()) {
                return ResponseEntity.ok(assessmentOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByCategoryId(@PathVariable Long categoryId) {
        try {
            List<Assessment> assessments = assessmentService.getAssessmentsByCategoryId(categoryId);
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<Assessment> createAssessment(@RequestBody Assessment assessment) {
        try {
            Assessment createdAssessment = assessmentService.createAssessment(assessment);
            return ResponseEntity.ok(createdAssessment);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<Assessment> updateAssessment(@PathVariable Long assessmentId, @RequestBody Assessment assessment) {
        try {
            assessment.setAssessmentId(assessmentId);
            Assessment updatedAssessment = assessmentService.updateAssessment(assessment);
            return ResponseEntity.ok(updatedAssessment);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{assessmentId}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long assessmentId) {
        try {
            boolean deleted = assessmentService.deleteAssessment(assessmentId);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
