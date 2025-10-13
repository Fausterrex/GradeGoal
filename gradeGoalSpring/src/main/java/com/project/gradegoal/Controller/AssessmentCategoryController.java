package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Service.AssessmentCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessment-categories")
@CrossOrigin(origins = "*")
public class AssessmentCategoryController {

    @Autowired
    private AssessmentCategoryService assessmentCategoryService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssessmentCategory>> getCategoriesByCourseId(@PathVariable Long courseId) {
        try {
            List<AssessmentCategory> categories = assessmentCategoryService.getAssessmentCategoriesByCourseId(courseId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<AssessmentCategory> getCategoryById(@PathVariable Long categoryId) {
        try {
            Optional<AssessmentCategory> categoryOpt = assessmentCategoryService.getAssessmentCategoryById(categoryId);
            if (categoryOpt.isPresent()) {
                return ResponseEntity.ok(categoryOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<AssessmentCategory> createCategory(@RequestBody AssessmentCategory categoryData) {
        try {
            AssessmentCategory createdCategory = assessmentCategoryService.createAssessmentCategory(categoryData);
            return ResponseEntity.ok(createdCategory);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<AssessmentCategory> updateCategory(@PathVariable Long categoryId, @RequestBody java.util.Map<String, Object> categoryData) {
        try {

            Optional<AssessmentCategory> existingCategoryOpt = assessmentCategoryService.getAssessmentCategoryById(categoryId);
            if (!existingCategoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            AssessmentCategory existingCategory = existingCategoryOpt.get();

            if (categoryData.containsKey("categoryName")) {
                existingCategory.setCategoryName((String) categoryData.get("categoryName"));
            }
            if (categoryData.containsKey("weightPercentage")) {
                Object weightObj = categoryData.get("weightPercentage");
                if (weightObj != null) {
                    existingCategory.setWeightPercentage(new java.math.BigDecimal(weightObj.toString()));
                }
            }

            AssessmentCategory updatedCategory = assessmentCategoryService.updateAssessmentCategory(existingCategory);
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        try {
            boolean deleted = assessmentCategoryService.deleteAssessmentCategory(categoryId);
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
