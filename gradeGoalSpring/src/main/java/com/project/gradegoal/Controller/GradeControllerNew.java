package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
public class GradeControllerNew {

    @Autowired
    private GradeService gradeService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Grade>> getGradesByCourseId(@PathVariable Long courseId) {
        try {
            List<Grade> grades = gradeService.getGradesByCourseId(courseId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Grade>> getGradesByCategoryId(@PathVariable Long categoryId) {
        try {
            List<Grade> grades = gradeService.getGradesByCategoryId(categoryId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<Grade> createGrade(@RequestBody Object gradeData) {
        try {

            if (hasField(gradeData, "name") && hasField(gradeData, "maxScore") && hasField(gradeData, "categoryId")) {

                Grade createdGrade = gradeService.createAssessmentAndGrade(gradeData, gradeData);
                return ResponseEntity.ok(createdGrade);
            } else {

                Grade grade = (Grade) gradeData;
                Grade createdGrade = gradeService.createGrade(grade);
                return ResponseEntity.ok(createdGrade);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    private boolean hasField(Object obj, String fieldName) {
        try {
            if (obj instanceof java.util.Map) {
                java.util.Map<String, Object> map = (java.util.Map<String, Object>) obj;
                return map.containsKey(fieldName);
            } else {

                obj.getClass().getMethod("get" + capitalize(fieldName));
                return true;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    @PutMapping("/{gradeId}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long gradeId, @RequestBody Object gradeData) {
        try {

            if (hasField(gradeData, "name") && hasField(gradeData, "maxScore") && hasField(gradeData, "categoryId")) {

                Grade updatedGrade = gradeService.updateGradeFromFrontend(gradeId, gradeData);
                return ResponseEntity.ok(updatedGrade);
            } else {

                Grade grade = (Grade) gradeData;
                grade.setGradeId(gradeId);
                Grade updatedGrade = gradeService.updateGrade(grade);
                return ResponseEntity.ok(updatedGrade);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{gradeId}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long gradeId) {
        try {
            gradeService.deleteGrade(gradeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

}
