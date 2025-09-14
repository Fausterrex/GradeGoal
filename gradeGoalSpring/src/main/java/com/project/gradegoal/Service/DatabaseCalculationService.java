package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.GradeRepository;
import com.project.gradegoal.Repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

/**
 * Service for database-backed grade calculations using stored procedures and functions
 * This replaces JavaScript calculations with more robust database calculations
 */
@Service
public class DatabaseCalculationService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Calculate course grade using database function
     * @param courseId Course ID
     * @return Calculated course grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCourseGrade(Long courseId) {
        try {
            // Call the database function CalculateCourseGrade
            BigDecimal result = courseRepository.calculateCourseGrade(courseId);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error calculating course grade for course " + courseId + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate category grade using database function
     * @param categoryId Category ID
     * @return Calculated category grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCategoryGrade(Long categoryId) {
        try {
            // Call the database function CalculateCategoryGrade
            BigDecimal result = courseRepository.calculateCategoryGrade(categoryId);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error calculating category grade for category " + categoryId + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate GPA from percentage using database function
     * @param percentage Grade percentage
     * @return Calculated GPA
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateGPA(BigDecimal percentage) {
        try {
            // Call the database function CalculateGPA
            BigDecimal result = courseRepository.calculateGPA(percentage);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error calculating GPA for percentage " + percentage + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate cumulative GPA using database function
     * @param userId User ID
     * @return Calculated cumulative GPA
     */
    @Transactional
    public BigDecimal calculateCumulativeGPA(Long userId) {
        try {
            // Call the database function CalculateCumulativeGPA
            BigDecimal result = courseRepository.calculateCumulativeGPA(userId);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error calculating cumulative GPA for user " + userId + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Add or update grade using database procedure
     * @param assessmentId Assessment ID
     * @param pointsEarned Points earned
     * @param pointsPossible Points possible
     * @param percentageScore Percentage score
     * @param scoreType Score type (PERCENTAGE or POINTS)
     * @param notes Notes
     * @param isExtraCredit Is extra credit
     * @return Result message
     */
    @Transactional
    public String addOrUpdateGrade(Long assessmentId, BigDecimal pointsEarned, BigDecimal pointsPossible,
                                   BigDecimal percentageScore, String scoreType, String notes, Boolean isExtraCredit) {
        try {
            // Get the user_id associated with the assessment
            String userQuery = "SELECT c.user_id FROM courses c " +
                              "INNER JOIN assessment_categories ac ON c.course_id = ac.course_id " +
                              "INNER JOIN assessments a ON ac.category_id = a.category_id " +
                              "WHERE a.assessment_id = ?";
            
            List<Object> userResult = entityManager.createNativeQuery(userQuery)
                .setParameter(1, assessmentId)
                .getResultList();
            
            if (userResult.isEmpty()) {
                return "Error: User ID not found for the given assessment.";
            }
            
            Long userId = ((Number) userResult.get(0)).longValue();
            
            // Check if a grade already exists for this assessment
            String checkQuery = "SELECT grade_id FROM grades WHERE assessment_id = ?";
            List<Object> existingGrade = entityManager.createNativeQuery(checkQuery)
                .setParameter(1, assessmentId)
                .getResultList();
            
            if (!existingGrade.isEmpty()) {
                // Update existing grade
                String updateQuery = "UPDATE grades SET " +
                                   "points_earned = ?, points_possible = ?, percentage_score = ?, " +
                                   "score_type = ?, notes = ?, is_extra_credit = ?, updated_at = CURRENT_TIMESTAMP " +
                                   "WHERE grade_id = ?";
                
                entityManager.createNativeQuery(updateQuery)
                    .setParameter(1, pointsEarned)
                    .setParameter(2, pointsPossible)
                    .setParameter(3, percentageScore)
                    .setParameter(4, scoreType)
                    .setParameter(5, notes)
                    .setParameter(6, isExtraCredit)
                    .setParameter(7, existingGrade.get(0))
                    .executeUpdate();
                
                return "Grade updated successfully";
            } else {
                // Insert new grade
                String insertQuery = "INSERT INTO grades (assessment_id, points_earned, points_possible, " +
                                   "percentage_score, score_type, notes, is_extra_credit, user_id) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
                entityManager.createNativeQuery(insertQuery)
                    .setParameter(1, assessmentId)
                    .setParameter(2, pointsEarned)
                    .setParameter(3, pointsPossible)
                    .setParameter(4, percentageScore)
                    .setParameter(5, scoreType)
                    .setParameter(6, notes)
                    .setParameter(7, isExtraCredit)
                    .setParameter(8, userId)
                    .executeUpdate();
                
                return "Grade added successfully";
            }
        } catch (Exception e) {
            System.err.println("Error adding/updating grade for assessment " + assessmentId + ": " + e.getMessage());
            return "Error: " + e.getMessage();
        }
    }

    /**
     * Update course grades using database procedure
     * @param courseId Course ID
     */
    public void updateCourseGrades(Long courseId) {
        try {
            // Call the database procedure UpdateCourseGrades
            courseRepository.updateCourseGrades(courseId);
        } catch (Exception e) {
            System.err.println("Error updating course grades for course " + courseId + ": " + e.getMessage());
            // Don't rethrow the exception to avoid transaction rollback issues
        }
    }

    /**
     * Update user analytics using database procedure
     * @param userId User ID
     * @param courseId Course ID
     */
    public void updateUserAnalytics(Long userId, Long courseId) {
        try {
            // Call the database procedure UpdateUserAnalytics
            courseRepository.updateUserAnalytics(userId, courseId);
        } catch (Exception e) {
            System.err.println("Error updating user analytics for user " + userId + " course " + courseId + ": " + e.getMessage());
        }
    }

    /**
     * Award points to user using database procedure
     * @param userId User ID
     * @param points Points to award
     * @param activityType Activity type
     */
    public void awardPoints(Long userId, Integer points, String activityType) {
        try {
            // Call the database procedure AwardPoints
            userProgressRepository.awardPoints(userId, points, activityType);
        } catch (Exception e) {
            System.err.println("Error awarding points to user " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Check goal progress using database procedure
     * @param userId User ID
     */
    public void checkGoalProgress(Long userId) {
        try {
            // Call the database procedure CheckGoalProgress
            courseRepository.checkGoalProgress(userId);
        } catch (Exception e) {
            System.err.println("Error checking goal progress for user " + userId + ": " + e.getMessage());
            // Don't rethrow the exception to avoid transaction rollback issues
        }
    }

    /**
     * Check grade alerts using database procedure
     * @param userId User ID
     */
    public void checkGradeAlerts(Long userId) {
        try {
            // Call the database procedure CheckGradeAlerts
            courseRepository.checkGradeAlerts(userId);
        } catch (Exception e) {
            System.err.println("Error checking grade alerts for user " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Check user achievements using database procedure
     * @param userId User ID
     */
    public void checkUserAchievements(Long userId) {
        try {
            // Call the database procedure CheckUserAchievements
            userProgressRepository.checkUserAchievements(userId);
        } catch (Exception e) {
            System.err.println("Error checking user achievements for user " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Initialize sample achievements using database procedure
     */
    public void initializeSampleAchievements() {
        try {
            // Call the database procedure InitializeSampleAchievements
            courseRepository.initializeSampleAchievements();
        } catch (Exception e) {
            System.err.println("Error initializing sample achievements: " + e.getMessage());
        }
    }

    /**
     * Update all course grades for a user
     * @param userId User ID
     */
    public void updateAllUserCourseGrades(Long userId) {
        try {
            List<Course> userCourses = courseRepository.findByUserIdAndIsActiveTrue(userId);
            for (Course course : userCourses) {
                updateCourseGrades(course.getCourseId());
            }
            
            // Update cumulative GPA after updating all courses
            calculateCumulativeGPA(userId);
        } catch (Exception e) {
            System.err.println("Error updating all course grades for user " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Get comprehensive grade calculation for a course
     * @param courseId Course ID
     * @return Course with updated calculations
     */
    public Course getCourseWithCalculations(Long courseId) {
        try {
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                
                // Calculate and update course grade
                BigDecimal calculatedGrade = calculateCourseGrade(courseId);
                BigDecimal calculatedGPA = calculateGPA(calculatedGrade);
                
                course.setCalculatedCourseGrade(calculatedGrade);
                course.setCourseGpa(calculatedGPA);
                
                // Save updated course
                Course savedCourse = courseRepository.save(course);
                System.out.println("Course with calculations: " + savedCourse.getCourseName() + " - Grade: " + calculatedGrade + " - GPA: " + calculatedGPA);
                return savedCourse;
            } else {
                System.err.println("Course not found with ID: " + courseId);
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error getting course with calculations for course " + courseId + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
