package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.Category;
import com.project.gradegoal.Repository.GradeRepository;
import com.project.gradegoal.Repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;
    private final CategoryRepository categoryRepository;

    public GradeService(GradeRepository gradeRepository, CategoryRepository categoryRepository) {
        this.gradeRepository = gradeRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Grade createGrade(Grade grade) {
        // Handle categoryId field from frontend
        if (grade.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(grade.getCategoryId());
            if (categoryOpt.isPresent()) {
                grade.setCategory(categoryOpt.get());
            } else {
                throw new RuntimeException("Category not found with ID: " + grade.getCategoryId());
            }
        }
        
        // Set timestamps before saving
        grade.setCreatedAt(new java.util.Date().toString());
        grade.setUpdatedAt(new java.util.Date().toString());
        return gradeRepository.save(grade);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByCategoryId(Long categoryId) {
        return gradeRepository.findByCategory_Id(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByCourseId(Long courseId) {
        return gradeRepository.findByCategory_Course_Id(courseId);
    }

    @Transactional(readOnly = true)
    public Optional<Grade> getGradeById(Long id) {
        return gradeRepository.findById(id);
    }

    @Transactional
    public Grade updateGrade(Grade grade) {
        // Get the existing grade to preserve createdAt and category
        Optional<Grade> existingGradeOpt = gradeRepository.findById(grade.getId());
        if (existingGradeOpt.isPresent()) {
            Grade existingGrade = existingGradeOpt.get();
            // Preserve the original createdAt value
            grade.setCreatedAt(existingGrade.getCreatedAt());
            
            // Handle category relationship
            if (grade.getCategoryId() != null) {
                // If a new category ID is provided, fetch and set the Category entity
                Optional<Category> categoryOpt = categoryRepository.findById(grade.getCategoryId());
                if (categoryOpt.isPresent()) {
                    grade.setCategory(categoryOpt.get());
                } else {
                    throw new RuntimeException("Category not found with ID: " + grade.getCategoryId());
                }
            } else {
                // Preserve the existing category relationship
                grade.setCategory(existingGrade.getCategory());
            }
        }
        grade.setUpdatedAt(new java.util.Date().toString());
        return gradeRepository.save(grade);
    }

    @Transactional
    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
    }

    @Transactional
    public Grade addGradeToCategory(Long categoryId, Grade grade) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            grade.setCategory(category);
            // Set timestamps before saving
            grade.setCreatedAt(new java.util.Date().toString());
            grade.setUpdatedAt(new java.util.Date().toString());
            return gradeRepository.save(grade);
        }
        throw new RuntimeException("Category not found");
    }
}
