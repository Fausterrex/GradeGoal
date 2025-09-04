package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Repository.AssessmentRepository;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Assessment Service
 * 
 * Service class for assessment-related business logic and operations.
 * Handles assessment creation, management, and data operations.
 */
@Service
public class AssessmentService {
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;
    
    /**
     * Create a new assessment
     * @param assessment Assessment object to create
     * @return Created assessment object
     */
    public Assessment createAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }
    
    /**
     * Create assessment within a category
     * @param categoryId Category's ID
     * @param assessment Assessment object to create
     * @return Created assessment object
     */
    public Assessment createAssessmentInCategory(Long categoryId, Assessment assessment) {
        Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            assessment.setCategoryId(categoryId);
            return assessmentRepository.save(assessment);
        }
        throw new RuntimeException("Assessment category not found with ID: " + categoryId);
    }
    
    /**
     * Get assessment by ID
     * @param assessmentId Assessment's ID
     * @return Optional containing assessment if found
     */
    public Optional<Assessment> getAssessmentById(Long assessmentId) {
        return assessmentRepository.findById(assessmentId);
    }
    
    /**
     * Get assessments by category ID
     * @param categoryId Category's ID
     * @return List of assessments in the category
     */
    public List<Assessment> getAssessmentsByCategoryId(Long categoryId) {
        return assessmentRepository.findByCategoryId(categoryId);
    }
    
    /**
     * Get assessments by category ID and status
     * @param categoryId Category's ID
     * @param status Assessment status
     * @return List of assessments with the specified status
     */
    public List<Assessment> getAssessmentsByCategoryIdAndStatus(Long categoryId, Assessment.AssessmentStatus status) {
        return assessmentRepository.findByCategoryIdAndStatus(categoryId, status);
    }
    
    /**
     * Get assessments by due date
     * @param dueDate Due date
     * @return List of assessments due on the specified date
     */
    public List<Assessment> getAssessmentsByDueDate(LocalDate dueDate) {
        return assessmentRepository.findByDueDate(dueDate);
    }
    
    /**
     * Get assessments by status
     * @param status Assessment status
     * @return List of assessments with the specified status
     */
    public List<Assessment> getAssessmentsByStatus(Assessment.AssessmentStatus status) {
        return assessmentRepository.findByStatus(status);
    }
    
    /**
     * Get overdue assessments
     * @return List of overdue assessments
     */
    public List<Assessment> getOverdueAssessments() {
        return assessmentRepository.findOverdueAssessments(LocalDate.now());
    }
    
    /**
     * Get upcoming assessments
     * @param daysAhead Number of days ahead to look for upcoming assessments
     * @return List of upcoming assessments
     */
    public List<Assessment> getUpcomingAssessments(int daysAhead) {
        LocalDate currentDate = LocalDate.now();
        LocalDate futureDate = currentDate.plusDays(daysAhead);
        return assessmentRepository.findUpcomingAssessments(currentDate, futureDate);
    }
    
    /**
     * Update assessment
     * @param assessment Assessment object to update
     * @return Updated assessment object
     */
    public Assessment updateAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }
    
    /**
     * Update assessment status
     * @param assessmentId Assessment's ID
     * @param status New status
     * @return Updated assessment object
     */
    public Assessment updateAssessmentStatus(Long assessmentId, Assessment.AssessmentStatus status) {
        Optional<Assessment> assessmentOpt = assessmentRepository.findById(assessmentId);
        if (assessmentOpt.isPresent()) {
            Assessment assessment = assessmentOpt.get();
            assessment.setStatus(status);
            return assessmentRepository.save(assessment);
        }
        throw new RuntimeException("Assessment not found with ID: " + assessmentId);
    }
    
    /**
     * Delete assessment by ID
     * @param assessmentId Assessment's ID
     * @return true if deletion was successful, false otherwise
     */
    public boolean deleteAssessment(Long assessmentId) {
        if (assessmentRepository.existsById(assessmentId)) {
            assessmentRepository.deleteById(assessmentId);
            return true;
        }
        return false;
    }
    
    /**
     * Get assessment by category ID and assessment name
     * @param categoryId Category's ID
     * @param assessmentName Assessment name
     * @return Assessment if found
     */
    public Assessment getAssessmentByCategoryIdAndName(Long categoryId, String assessmentName) {
        return assessmentRepository.findByCategoryIdAndAssessmentName(categoryId, assessmentName);
    }
    
    /**
     * Check if assessment exists by category ID and assessment name
     * @param categoryId Category's ID
     * @param assessmentName Assessment name
     * @return true if assessment exists, false otherwise
     */
    public boolean assessmentExists(Long categoryId, String assessmentName) {
        return assessmentRepository.existsByCategoryIdAndAssessmentName(categoryId, assessmentName);
    }
    
    /**
     * Count assessments by category ID
     * @param categoryId Category's ID
     * @return Number of assessments in the category
     */
    public long countAssessmentsByCategoryId(Long categoryId) {
        return assessmentRepository.countByCategoryId(categoryId);
    }
    
    /**
     * Count assessments by category ID and status
     * @param categoryId Category's ID
     * @param status Assessment status
     * @return Number of assessments with the specified status
     */
    public long countAssessmentsByCategoryIdAndStatus(Long categoryId, Assessment.AssessmentStatus status) {
        return assessmentRepository.countByCategoryIdAndStatus(categoryId, status);
    }
    
    /**
     * Get assessments with grades
     * @param categoryId Category's ID
     * @return List of assessments that have grades
     */
    public List<Assessment> getAssessmentsWithGrades(Long categoryId) {
        return assessmentRepository.findAssessmentsWithGrades(categoryId);
    }
    
    /**
     * Delete all assessments by category ID
     * @param categoryId Category's ID
     */
    @Transactional
    public void deleteAssessmentsByCategoryId(Long categoryId) {
        assessmentRepository.deleteByCategoryId(categoryId);
    }
}
