package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.project.gradegoal.Repository.CategoryRepository;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
@CrossOrigin("*")
public class GradeController {

    private final GradeService gradeService;
    private final CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<Grade> createGrade(@RequestBody Grade grade) {
        // If categoryId is provided, fetch the Category entity and set it
        if (grade.getCategoryId() != null) {
            var category = categoryRepository.findById(grade.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + grade.getCategoryId()));
            grade.setCategory(category);
        }
        
        Grade createdGrade = gradeService.createGrade(grade);
        return ResponseEntity.ok(createdGrade);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Grade>> getGradesByCategoryId(@PathVariable Long categoryId) {
        List<Grade> grades = gradeService.getGradesByCategoryId(categoryId);
        
        // Set the categoryId transient field for each grade so frontend can access it
        grades.forEach(grade -> {
            if (grade.getCategory() != null) {
                grade.setCategoryId(grade.getCategory().getId());
            }
        });
        
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Grade>> getGradesByCourseId(@PathVariable Long courseId) {
        List<Grade> grades = gradeService.getGradesByCourseId(courseId);
        
        // Set the categoryId transient field for each grade so frontend can access it
        grades.forEach(grade -> {
            if (grade.getCategory() != null) {
                grade.setCategoryId(grade.getCategory().getId());
            }
        });
        
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Grade> getGradeById(@PathVariable Long id) {
        return gradeService.getGradeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade grade) {
        grade.setId(id);
        
        // If categoryId is provided, fetch the Category entity and set it
        if (grade.getCategoryId() != null) {
            var category = categoryRepository.findById(grade.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + grade.getCategoryId()));
            grade.setCategory(category);
        }
        
        Grade updatedGrade = gradeService.updateGrade(grade);
        return ResponseEntity.ok(updatedGrade);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/category/{categoryId}")
    public ResponseEntity<Grade> addGradeToCategory(@PathVariable Long categoryId, @RequestBody Grade grade) {
        Grade createdGrade = gradeService.addGradeToCategory(categoryId, grade);
        return ResponseEntity.ok(createdGrade);
    }
}
