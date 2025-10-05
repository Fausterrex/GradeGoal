package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.UserAnalytics;
import com.project.gradegoal.Repository.AssessmentRepository;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.UserAnalyticsRepository;
import com.project.gradegoal.Repository.GradeRepository;
import com.project.gradegoal.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserAnalyticsRepository userAnalyticsRepository;
    
    @Autowired
    private GradeRepository gradesRepository;
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    @Autowired
    private UserRepository userRepository;
    
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
        AssessmentCategory category = assessmentCategoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Assessment category not found with ID: " + categoryId));
        
        assessment.setCategoryId(categoryId);
        Assessment savedAssessment = assessmentRepository.save(assessment);
        
        // Send notification for newly created assessment
        sendAssessmentCreatedNotifications(savedAssessment, category);
        
        return savedAssessment;
    }
    
    /**
     * Get all assessments
     * @return List of all assessments
     */
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }
    
    /**
     * Get all assessments with course information for calendar
     * @return List of assessments with course details
     */
    public List<Assessment> getAllAssessmentsWithCourseInfo() {
        // Use custom query to fetch assessments with grades eagerly
        List<Assessment> assessments = assessmentRepository.findAllWithGrades();
        return assessments.stream()
            .filter(assessment -> assessment.getDueDate() != null) // Only include assessments with due dates
            .map(assessment -> {
                Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(assessment.getCategoryId());
                if (categoryOpt.isPresent()) {
                    AssessmentCategory category = categoryOpt.get();
                    Optional<Course> courseOpt = courseRepository.findById(category.getCourseId());
                    if (courseOpt.isPresent()) {
                        Course course = courseOpt.get();
                        assessment.setCourseName(course.getCourseName());
                        assessment.setCategoryName(category.getCategoryName());
                    }
                }
                
                // Check if assessment has scores and mark as COMPLETED
                // Only mark as COMPLETED if this specific assessment has grades with actual scores
                if (assessment.getGrades() != null && !assessment.getGrades().isEmpty()) {
                    // Check if any of the grades have actual scores (not null and not 0.00)
                    boolean hasActualScores = assessment.getGrades().stream()
                        .anyMatch(grade -> grade.getScore() != null && grade.getScore().compareTo(BigDecimal.ZERO) > 0);
                    
                    if (hasActualScores) {
                        assessment.setStatus(Assessment.AssessmentStatus.COMPLETED);
                    }
                }
                
                return assessment;
            })
            .collect(Collectors.toList());
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
     * Get assessments by user ID with course information
     * @param userId User's ID
     * @return List of assessments for the specified user with course details
     */
    public List<Assessment> getAssessmentsByUserId(Long userId) {
        List<Assessment> assessments = assessmentRepository.findByUserId(userId);
        
        // Enrich assessments with course and category information
        return assessments.stream()
            .filter(assessment -> assessment.getDueDate() != null) // Only include assessments with due dates
            .map(assessment -> {
                Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(assessment.getCategoryId());
                if (categoryOpt.isPresent()) {
                    AssessmentCategory category = categoryOpt.get();
                    Optional<Course> courseOpt = courseRepository.findById(category.getCourseId());
                    if (courseOpt.isPresent()) {
                        Course course = courseOpt.get();
                        assessment.setCourseName(course.getCourseName());
                        assessment.setCategoryName(category.getCategoryName());
                    }
                }
                
                // Check if assessment has scores and mark as COMPLETED
                if (assessment.getGrades() != null && !assessment.getGrades().isEmpty()) {
                    boolean hasActualScores = assessment.getGrades().stream()
                        .anyMatch(grade -> grade.getScore() != null && grade.getScore().compareTo(BigDecimal.ZERO) > 0);
                    
                    if (hasActualScores) {
                        assessment.setStatus(Assessment.AssessmentStatus.COMPLETED);
                    }
                }
                
                return assessment;
            })
            .collect(Collectors.toList());
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
     * Delete assessment by ID and clean up related user analytics
     * @param assessmentId Assessment's ID
     * @return true if deletion was successful, false otherwise
     */
    @Transactional
    public boolean deleteAssessment(Long assessmentId) {
        if (assessmentRepository.existsById(assessmentId)) {
            // Get assessment details before deletion for analytics cleanup
            Optional<Assessment> assessmentOpt = assessmentRepository.findById(assessmentId);
            if (assessmentOpt.isPresent()) {
                Assessment assessment = assessmentOpt.get();
                
                // Get course information for analytics cleanup
                Optional<AssessmentCategory> categoryOpt = assessmentCategoryRepository.findById(assessment.getCategoryId());
                if (categoryOpt.isPresent()) {
                    AssessmentCategory category = categoryOpt.get();
                    Long courseId = category.getCourseId();
                    
                    // Get user information for analytics cleanup
                    Optional<Course> courseOpt = courseRepository.findById(courseId);
                    if (courseOpt.isPresent()) {
                        Course course = courseOpt.get();
                        Long userId = course.getUserId();
                        
                        // Clean up user analytics records for this course
                        cleanupUserAnalyticsForAssessment(userId, courseId);
                    }
                }
            }
            
            // Delete the assessment
            assessmentRepository.deleteById(assessmentId);
            return true;
        }
        return false;
    }
    
    /**
     * Clean up user analytics records when an assessment is deleted
     * This method removes analytics records that may have been affected by the deleted assessment
     * @param userId User ID
     * @param courseId Course ID
     */
    private void cleanupUserAnalyticsForAssessment(Long userId, Long courseId) {
        try {
            // Find all analytics records for this user and course
            List<UserAnalytics> analyticsRecords = userAnalyticsRepository.findByUserIdAndCourseId(userId, courseId);
            System.out.println("🔍 Found " + analyticsRecords.size() + " analytics records for User: " + userId + ", Course: " + courseId);
            
            // Delete all analytics records for this course to force recalculation
            int deletedCount = 0;
            for (UserAnalytics analytics : analyticsRecords) {
                System.out.println("🔍 Analytics record - Completed: " + analytics.getAssignmentsCompleted() + 
                                 ", Pending: " + analytics.getAssignmentsPending() + 
                                 ", Current Grade: " + analytics.getCurrentGrade() + 
                                 ", Date: " + analytics.getAnalyticsDate());
                
                userAnalyticsRepository.delete(analytics);
                deletedCount++;
                System.out.println("🗑️ Deleted analytics record with ID: " + analytics.getAnalyticsId());
            }
            
            System.out.println("✅ Cleaned up " + deletedCount + " user analytics records for assessment deletion - User: " + userId + ", Course: " + courseId);
            
            // Immediately regenerate analytics for all remaining assessments
            try {
                System.out.println("🔄 Regenerating analytics for remaining assessments...");
                regenerateAnalyticsForCourse(userId, courseId);
                System.out.println("✅ Analytics regeneration completed");
            } catch (Exception e) {
                System.err.println("⚠️ Failed to regenerate analytics: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to cleanup user analytics for assessment deletion: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - assessment deletion should still proceed
        }
    }
    
    /**
     * Regenerate analytics records for all assessments in a course
     * This creates one analytics record per assessment to support the trajectory chart
     * It updates existing records instead of creating duplicates
     * IMPORTANT: Only creates analytics for assessments that have actual scores (grades)
     */
    public void regenerateAnalyticsForCourse(Long userId, Long courseId) {
        try {
            // Get all assessment categories for this course
            List<AssessmentCategory> categories = assessmentCategoryRepository.findByCourseId(courseId);
            List<Long> categoryIds = categories.stream()
                .map(category -> category.getCategoryId())
                .collect(Collectors.toList());
            
            // Get all assessments for these categories
            List<Assessment> assessments = assessmentRepository.findByCategoryIdIn(categoryIds);
            
            System.out.println("🔍 Found " + assessments.size() + " assessments for course " + courseId);
            
            // Filter assessments to only include those with actual scores (grades)
            List<Assessment> assessmentsWithScores = assessments.stream()
                .filter(assessment -> {
                    List<Grade> grades = gradesRepository.findByAssessmentId(assessment.getAssessmentId());
                    // Only include assessments that have grades with actual scores (not null and > 0)
                    return grades.stream().anyMatch(grade -> 
                        grade.getPointsEarned() != null && grade.getPointsEarned().compareTo(BigDecimal.ZERO) > 0
                    );
                })
                .collect(Collectors.toList());
            
            System.out.println("🔍 Found " + assessmentsWithScores.size() + " assessments with scores for course " + courseId);
            
            // If no assessments have scores, don't create any analytics records
            if (assessmentsWithScores.isEmpty()) {
                System.out.println("📊 No assessments with scores found - skipping analytics creation");
                return;
            }
            
            // Get existing analytics for this course
            List<UserAnalytics> existingAnalytics = userAnalyticsRepository.findByUserIdAndCourseId(userId, courseId);
            System.out.println("🔍 Found " + existingAnalytics.size() + " existing analytics records");
            
            // Get the course to get semester info
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (!courseOpt.isPresent()) {
                System.err.println("⚠️ Course not found: " + courseId);
                return;
            }
            
            Course course = courseOpt.get();
            
            // Calculate current course grade for overall analytics
            BigDecimal currentCourseGrade = course.getCalculatedCourseGrade();
            BigDecimal currentGPA = currentCourseGrade != null ? 
                currentCourseGrade.divide(BigDecimal.valueOf(25.0), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO; // Convert percentage to GPA
            
            // Count completed and pending assignments (only those with scores)
            long completedCount = assessmentsWithScores.stream()
                .mapToLong(assessment -> gradesRepository.findByAssessmentId(assessment.getAssessmentId()).size())
                .sum();
            long totalAssessments = assessmentsWithScores.size();
            long pendingCount = totalAssessments - completedCount;
            
            // Check if we should update existing analytics or create new ones
            if (existingAnalytics.isEmpty()) {
                // No existing analytics - create one record per assessment
                System.out.println("📊 No existing analytics found - creating new records for each assessment");
                
                for (Assessment assessment : assessmentsWithScores) {
                    try {
                        UserAnalytics analytics = createAnalyticsRecord(userId, courseId, course, assessment, currentGPA, completedCount, pendingCount);
                        userAnalyticsRepository.save(analytics);
                        BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
                        System.out.println("✅ Created analytics record for assessment: " + assessment.getAssessmentName() + 
                                         " (Due: " + assessment.getDueDate() + ", GPA: " + assessmentGPA + ")");
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to create analytics for assessment " + assessment.getAssessmentName() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } else {
                // Update existing analytics instead of creating new ones
                System.out.println("📊 Updating existing analytics records instead of creating duplicates");
                
                // Check if we need to adjust the number of analytics records
                int targetAnalyticsCount = assessmentsWithScores.size();
                int currentAnalyticsCount = existingAnalytics.size();
                
                System.out.println("📊 Target analytics count: " + targetAnalyticsCount + ", Current analytics count: " + currentAnalyticsCount);
                
                if (currentAnalyticsCount > targetAnalyticsCount) {
                    // We have more analytics records than assessments - delete excess ones
                    System.out.println("📊 Deleting " + (currentAnalyticsCount - targetAnalyticsCount) + " excess analytics records");
                    
                    // Sort by calculatedAt descending and delete the oldest ones
                    existingAnalytics.sort((a, b) -> b.getCalculatedAt().compareTo(a.getCalculatedAt()));
                    
                    for (int i = targetAnalyticsCount; i < currentAnalyticsCount; i++) {
                        UserAnalytics analyticsToDelete = existingAnalytics.get(i);
                        userAnalyticsRepository.delete(analyticsToDelete);
                        System.out.println("🗑️ Deleted excess analytics record with ID: " + analyticsToDelete.getAnalyticsId());
                    }
                    
                    // Update the remaining analytics records
                    for (int i = 0; i < targetAnalyticsCount; i++) {
                        UserAnalytics analytics = existingAnalytics.get(i);
                        Assessment assessment = assessmentsWithScores.get(i);
                        
                        // Calculate GPA for this specific assessment
                        BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
                        BigDecimal assessmentGrade = calculateAssessmentGrade(assessment);
                        
                        // Update the analytics record
                        analytics.setCurrentGrade(assessmentGPA);
                        analytics.setAssignmentsCompleted((int) completedCount);
                        analytics.setAssignmentsPending((int) pendingCount);
                        analytics.setCalculatedAt(java.time.LocalDateTime.now());
                        analytics.setDueDate(assessment.getDueDate());
                        
                        // Update performance metrics using assessment's grade
                        String performanceMetrics = String.format(
                            "{\"completion_rate\": %.1f, \"percentage_score\": %.1f, \"study_hours_logged\": 0.0}",
                            totalAssessments > 0 ? (completedCount * 100.0 / totalAssessments) : 0.0,
                            assessmentGrade != null ? assessmentGrade.doubleValue() : 0.0
                        );
                        analytics.setPerformanceMetrics(performanceMetrics);
                        
                        userAnalyticsRepository.save(analytics);
                        System.out.println("✅ Updated analytics record for assessment: " + assessment.getAssessmentName() + " (GPA: " + assessmentGPA + ")");
                    }
                    
                } else if (currentAnalyticsCount < targetAnalyticsCount) {
                    // We have fewer analytics records than assessments - create additional ones
                    System.out.println("📊 Creating " + (targetAnalyticsCount - currentAnalyticsCount) + " additional analytics records");
                    
                    // Update existing analytics records first
                    for (int i = 0; i < currentAnalyticsCount; i++) {
                        UserAnalytics analytics = existingAnalytics.get(i);
                        Assessment assessment = assessmentsWithScores.get(i);
                        
                        // Calculate GPA for this specific assessment
                        BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
                        BigDecimal assessmentGrade = calculateAssessmentGrade(assessment);
                        
                        // Update the analytics record
                        analytics.setCurrentGrade(assessmentGPA);
                        analytics.setAssignmentsCompleted((int) completedCount);
                        analytics.setAssignmentsPending((int) pendingCount);
                        analytics.setCalculatedAt(java.time.LocalDateTime.now());
                        analytics.setDueDate(assessment.getDueDate());
                        
                        // Update performance metrics using assessment's grade
                        String performanceMetrics = String.format(
                            "{\"completion_rate\": %.1f, \"percentage_score\": %.1f, \"study_hours_logged\": 0.0}",
                            totalAssessments > 0 ? (completedCount * 100.0 / totalAssessments) : 0.0,
                            assessmentGrade != null ? assessmentGrade.doubleValue() : 0.0
                        );
                        analytics.setPerformanceMetrics(performanceMetrics);
                        
                        userAnalyticsRepository.save(analytics);
                        System.out.println("✅ Updated analytics record for assessment: " + assessment.getAssessmentName() + " (GPA: " + assessmentGPA + ")");
                    }
                    
                    // Create additional analytics records for new assessments
                    for (int i = currentAnalyticsCount; i < targetAnalyticsCount; i++) {
                        Assessment assessment = assessmentsWithScores.get(i);
                        try {
                            UserAnalytics analytics = createAnalyticsRecord(userId, courseId, course, assessment, currentGPA, completedCount, pendingCount);
                            userAnalyticsRepository.save(analytics);
                            BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
                            System.out.println("✅ Created additional analytics record for assessment: " + assessment.getAssessmentName() + " (GPA: " + assessmentGPA + ")");
                        } catch (Exception e) {
                            System.err.println("⚠️ Failed to create additional analytics for assessment " + assessment.getAssessmentName() + ": " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                    
                } else {
                    // Perfect match - just update existing analytics records
                    System.out.println("📊 Perfect match - updating existing analytics records");
                    
                    for (int i = 0; i < currentAnalyticsCount; i++) {
                        UserAnalytics analytics = existingAnalytics.get(i);
                        Assessment assessment = assessmentsWithScores.get(i);
                        
                        // Calculate GPA for this specific assessment
                        BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
                        BigDecimal assessmentGrade = calculateAssessmentGrade(assessment);
                        
                        // Update the analytics record
                        analytics.setCurrentGrade(assessmentGPA);
                        analytics.setAssignmentsCompleted((int) completedCount);
                        analytics.setAssignmentsPending((int) pendingCount);
                        analytics.setCalculatedAt(java.time.LocalDateTime.now());
                        analytics.setDueDate(assessment.getDueDate());
                        
                        // Update performance metrics using assessment's grade
                        String performanceMetrics = String.format(
                            "{\"completion_rate\": %.1f, \"percentage_score\": %.1f, \"study_hours_logged\": 0.0}",
                            totalAssessments > 0 ? (completedCount * 100.0 / totalAssessments) : 0.0,
                            assessmentGrade != null ? assessmentGrade.doubleValue() : 0.0
                        );
                        analytics.setPerformanceMetrics(performanceMetrics);
                        
                        userAnalyticsRepository.save(analytics);
                        System.out.println("✅ Updated analytics record for assessment: " + assessment.getAssessmentName() + " (GPA: " + assessmentGPA + ")");
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to regenerate analytics for course: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Helper method to create a new analytics record
     */
    private UserAnalytics createAnalyticsRecord(Long userId, Long courseId, Course course, Assessment assessment, 
                                               BigDecimal currentGPA, long completedCount, long pendingCount) {
        UserAnalytics analytics = new UserAnalytics();
        analytics.setUserId(userId);
        analytics.setCourseId(courseId);
        analytics.setAnalyticsDate(java.time.LocalDate.now());
        
        // Calculate GPA for this specific assessment
        BigDecimal assessmentGPA = calculateAssessmentGPA(assessment);
        analytics.setCurrentGrade(assessmentGPA);
        
        analytics.setGradeTrend(BigDecimal.ZERO); // Will be calculated properly in future iterations
        analytics.setAssignmentsCompleted((int) completedCount);
        analytics.setAssignmentsPending((int) pendingCount);
        analytics.setStudyHoursLogged(BigDecimal.ZERO);
        analytics.setCalculatedAt(java.time.LocalDateTime.now());
        analytics.setDueDate(assessment.getDueDate());
        analytics.setSemester(course.getSemester().toString());
        
        // Create performance metrics JSON using the assessment's grade
        BigDecimal assessmentGrade = calculateAssessmentGrade(assessment);
        String performanceMetrics = String.format(
            "{\"completion_rate\": %.1f, \"percentage_score\": %.1f, \"study_hours_logged\": 0.0}",
            completedCount > 0 ? (completedCount * 100.0 / (completedCount + pendingCount)) : 0.0,
            assessmentGrade != null ? assessmentGrade.doubleValue() : 0.0
        );
        analytics.setPerformanceMetrics(performanceMetrics);
        
        return analytics;
    }
    
    /**
     * Calculate GPA for a specific assessment based on its grades
     */
    private BigDecimal calculateAssessmentGPA(Assessment assessment) {
        try {
            List<Grade> grades = gradesRepository.findByAssessmentId(assessment.getAssessmentId());
            if (grades.isEmpty()) {
                return BigDecimal.ZERO;
            }
            
            // Calculate average percentage score for this assessment
            double totalPercentage = grades.stream()
                .mapToDouble(grade -> grade.getPercentageScore().doubleValue())
                .average()
                .orElse(0.0);
            
            // Convert percentage to GPA (assuming 4.0 scale where 100% = 4.0)
            return BigDecimal.valueOf(totalPercentage / 25.0).setScale(2, RoundingMode.HALF_UP);
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to calculate assessment GPA: " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }
    
    /**
     * Calculate percentage grade for a specific assessment
     */
    private BigDecimal calculateAssessmentGrade(Assessment assessment) {
        try {
            List<Grade> grades = gradesRepository.findByAssessmentId(assessment.getAssessmentId());
            if (grades.isEmpty()) {
                return BigDecimal.ZERO;
            }
            
            // Calculate average percentage score for this assessment
            double averagePercentage = grades.stream()
                .mapToDouble(grade -> grade.getPercentageScore().doubleValue())
                .average()
                .orElse(0.0);
            
            return BigDecimal.valueOf(averagePercentage).setScale(1, RoundingMode.HALF_UP);
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to calculate assessment grade: " + e.getMessage());
            return BigDecimal.ZERO;
        }
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
    
    /**
     * Send email and push notifications when an assessment is created
     */
    private void sendAssessmentCreatedNotifications(Assessment assessment, AssessmentCategory category) {
        try {
            // Get course and user information
            Optional<Course> courseOpt = courseRepository.findById(category.getCourseId());
            if (!courseOpt.isPresent()) {
                return;
            }
            
            Course course = courseOpt.get();
            Optional<User> userOpt = userRepository.findById(course.getUserId());
            if (!userOpt.isPresent()) {
                return;
            }
            
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String assessmentName = assessment.getAssessmentName();
            String courseName = course.getCourseName();
            String dueDate = assessment.getDueDate() != null ? assessment.getDueDate().toString() : "TBA";
            String assessmentType = getAssessmentTypeFromName(assessmentName);
            String semester = course.getSemester().toString();
            String yearLevel = course.getYearLevel();
            
            // Send email notification
            try {
                emailNotificationService.sendAssessmentCreatedNotification(
                    userEmail,
                    assessmentName,
                    assessmentType,
                    courseName,
                    dueDate,
                    semester,
                    yearLevel
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
            // Send push notification
            try {
                pushNotificationService.sendAssessmentCreatedNotification(
                    userEmail,
                    assessmentName,
                    assessmentType,
                    courseName,
                    dueDate
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
        } catch (Exception e) {
            // Log error but don't fail the operation
        }
    }
    
    /**
     * Determine assessment type from assessment name
     */
    private String getAssessmentTypeFromName(String assessmentName) {
        if (assessmentName == null) return "Assessment";
        
        String name = assessmentName.toLowerCase();
        if (name.contains("quiz")) return "Quiz";
        if (name.contains("exam") || name.contains("midterm") || name.contains("final")) return "Assessment";
        if (name.contains("assignment") || name.contains("project")) return "Assignment";
        if (name.contains("lab") || name.contains("practical")) return "Laboratory";
        if (name.contains("presentation")) return "Presentation";
        
        return "Assessment";
    }
}
