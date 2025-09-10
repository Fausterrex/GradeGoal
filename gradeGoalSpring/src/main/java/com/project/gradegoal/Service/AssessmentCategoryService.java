package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import com.project.gradegoal.Repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class AssessmentCategoryService {

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private CourseRepository courseRepository;

    public AssessmentCategory createAssessmentCategory(AssessmentCategory assessmentCategory) {
        return assessmentCategoryRepository.save(assessmentCategory);
    }

    public AssessmentCategory createAssessmentCategoryForCourse(Long courseId, String categoryName, BigDecimal weightPercentage) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            AssessmentCategory category = new AssessmentCategory(courseId, categoryName, weightPercentage);
            return assessmentCategoryRepository.save(category);
        }
        throw new RuntimeException("Course not found with ID: " + courseId);
    }

    public Optional<AssessmentCategory> getAssessmentCategoryById(Long categoryId) {
        return assessmentCategoryRepository.findById(categoryId);
    }

    public List<AssessmentCategory> getAssessmentCategoriesByCourseId(Long courseId) {
        return assessmentCategoryRepository.findByCourseId(courseId);
    }

    public List<AssessmentCategory> getAssessmentCategoriesByCourseIdOrdered(Long courseId) {
        return assessmentCategoryRepository.findByCourseIdOrderByOrderSequence(courseId);
    }

    public AssessmentCategory getAssessmentCategoryByCourseIdAndName(Long courseId, String categoryName) {
        return assessmentCategoryRepository.findByCourseIdAndCategoryName(courseId, categoryName);
    }

    public boolean assessmentCategoryExists(Long courseId, String categoryName) {
        return assessmentCategoryRepository.existsByCourseIdAndCategoryName(courseId, categoryName);
    }

    public List<AssessmentCategory> getAssessmentCategoriesAboveWeight(Long courseId, BigDecimal weightPercentage) {
        return assessmentCategoryRepository.findByCourseIdAndWeightPercentageGreaterThan(courseId, weightPercentage);
    }

    public AssessmentCategory updateAssessmentCategory(AssessmentCategory assessmentCategory) {
        return assessmentCategoryRepository.save(assessmentCategory);
    }

    public AssessmentCategory updateAssessmentCategoryWeight(Long categoryId, BigDecimal weightPercentage) {
        Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            AssessmentCategory category = categoryOpt.get();
            category.setWeightPercentage(weightPercentage);
            return assessmentCategoryRepository.save(category);
        }
        throw new RuntimeException("Assessment category not found with ID: " + categoryId);
    }

    public AssessmentCategory updateAssessmentCategoryOrder(Long categoryId, Integer orderSequence) {
        Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            AssessmentCategory category = categoryOpt.get();
            category.setOrderSequence(orderSequence);
            return assessmentCategoryRepository.save(category);
        }
        throw new RuntimeException("Assessment category not found with ID: " + categoryId);
    }

    @Transactional
    public boolean deleteAssessmentCategory(Long categoryId) {
        try {
            if (assessmentCategoryRepository.existsById(categoryId)) {

                assessmentService.deleteAssessmentsByCategoryId(categoryId);

                assessmentCategoryRepository.deleteById(categoryId);
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            throw e;
        }
    }

    public int deleteCategoriesByCourseId(Long courseId) {
        List<AssessmentCategory> categories = assessmentCategoryRepository.findByCourseId(courseId);
        int deletedCount = categories.size();
        assessmentCategoryRepository.deleteByCourseId(courseId);
        return deletedCount;
    }

    public long countAssessmentCategoriesByCourseId(Long courseId) {
        return assessmentCategoryRepository.countByCourseId(courseId);
    }

    public BigDecimal getTotalWeightPercentageByCourseId(Long courseId) {
        BigDecimal total = assessmentCategoryRepository.getTotalWeightPercentageByCourseId(courseId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public boolean validateTotalWeightPercentage(Long courseId) {
        BigDecimal total = getTotalWeightPercentageByCourseId(courseId);
        return total.compareTo(new BigDecimal("100.00")) == 0;
    }
}
