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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
     * Calculate cumulative GPA for a user using database function
     * @param userId User ID
     * @return Calculated cumulative GPA
     */
    @Transactional(readOnly = true)
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
     * Calculate semester GPA using database function
     * @param userId User ID
     * @param semester Semester (FIRST, SECOND, THIRD)
     * @param academicYear Academic year
     * @return Calculated semester GPA
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateSemesterGPA(Long userId, String semester, String academicYear) {
        try {
            // First try the database function with collation handling
            try {
                String query = "SELECT CalculateSemesterGPA(?, CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci, CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci)";
                
                Object result = entityManager.createNativeQuery(query)
                        .setParameter(1, userId)
                        .setParameter(2, semester)
                        .setParameter(3, academicYear)
                        .getSingleResult();
                
                if (result != null) {
                    BigDecimal gpa = new BigDecimal(result.toString());
                    return gpa.setScale(2, RoundingMode.HALF_UP);
                }
            } catch (Exception e) {
                System.err.println("Database function failed, trying manual calculation: " + e.getMessage());
            }
            
            // Fallback: Calculate manually using JPA
            List<Course> courses = courseRepository.findByUserIdAndSemesterAndAcademicYear(userId, 
                Course.Semester.valueOf(semester), academicYear);
            
            if (courses.isEmpty()) {
                return BigDecimal.ZERO;
            }
            
            BigDecimal totalGradePoints = BigDecimal.ZERO;
            int totalCreditHours = 0;
            
            for (Course course : courses) {
                if (course.getCourseGpa() != null && course.getCreditHours() != null && course.getIsActive()) {
                    totalGradePoints = totalGradePoints.add(course.getCourseGpa().multiply(new BigDecimal(course.getCreditHours())));
                    totalCreditHours += course.getCreditHours();
                }
            }
            
            if (totalCreditHours > 0) {
                return totalGradePoints.divide(new BigDecimal(totalCreditHours), 2, RoundingMode.HALF_UP);
            }
            
            return BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error calculating semester GPA for user " + userId + ": " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Update user progress with accurate GPA values
     * @param userId User ID
     * @return Updated UserProgress entity
     */
    @Transactional
    public UserProgress updateUserProgressGPAs(Long userId) {
        try {
            System.out.println("🔄 [DatabaseCalculationService] Updating user progress GPAs for user: " + userId);
            
            // Get or create user progress
            UserProgress userProgress = userProgressRepository.findByUserId(userId);
            if (userProgress == null) {
                userProgress = new UserProgress(userId);
                userProgressRepository.save(userProgress);
                System.out.println("✅ [DatabaseCalculationService] Created new user progress for user: " + userId);
            }

            // Initialize GPA values
            BigDecimal cumulativeGPA = BigDecimal.ZERO;
            BigDecimal semesterGPA = BigDecimal.ZERO;

            try {
                // Calculate cumulative GPA
                cumulativeGPA = calculateCumulativeGPA(userId);
                System.out.println("📊 [DatabaseCalculationService] Calculated cumulative GPA: " + cumulativeGPA);
            } catch (Exception e) {
                System.err.println("⚠️ [DatabaseCalculationService] Error calculating cumulative GPA: " + e.getMessage());
                cumulativeGPA = BigDecimal.ZERO;
            }

            try {
                // Get user's current semester and academic year from their active courses
                List<Course> activeCourses = courseRepository.findByUserIdAndIsActiveTrue(userId);
                
                if (!activeCourses.isEmpty()) {
                    Course firstCourse = activeCourses.get(0);
                    String currentSemester = firstCourse.getSemester().toString();
                    String currentAcademicYear = firstCourse.getAcademicYear();
                    System.out.println("📅 [DatabaseCalculationService] Found current semester: " + currentSemester + ", academic year: " + currentAcademicYear);
                    
                    // Calculate semester GPA
                    semesterGPA = calculateSemesterGPA(userId, currentSemester, currentAcademicYear);
                    System.out.println("📊 [DatabaseCalculationService] Calculated semester GPA: " + semesterGPA);
                } else {
                    System.out.println("⚠️ [DatabaseCalculationService] No active courses found for user: " + userId);
                }
            } catch (Exception e) {
                System.err.println("⚠️ [DatabaseCalculationService] Error calculating semester GPA: " + e.getMessage());
                semesterGPA = BigDecimal.ZERO;
            }

            // Update user progress
            userProgress.setCumulativeGpa(cumulativeGPA.doubleValue());
            userProgress.setSemesterGpa(semesterGPA.doubleValue());
            
            UserProgress savedProgress = userProgressRepository.save(userProgress);
            System.out.println("✅ [DatabaseCalculationService] Updated user progress - Cumulative: " + cumulativeGPA + ", Semester: " + semesterGPA);
            
            return savedProgress;
            
        } catch (Exception e) {
            System.err.println("❌ [DatabaseCalculationService] Error updating user progress GPAs: " + e.getMessage());
            e.printStackTrace();
            return null;
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
                                   BigDecimal percentageScore, String scoreType, String notes, Boolean isExtraCredit,
                                   BigDecimal extraCreditPoints) {
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
                                   "score_type = ?, notes = ?, is_extra_credit = ?, extra_credit_points = ?, " +
                                   "updated_at = CURRENT_TIMESTAMP WHERE grade_id = ?";
                
                
                entityManager.createNativeQuery(updateQuery)
                    .setParameter(1, pointsEarned)
                    .setParameter(2, pointsPossible)
                    .setParameter(3, percentageScore)
                    .setParameter(4, scoreType)
                    .setParameter(5, notes)
                    .setParameter(6, isExtraCredit)
                    .setParameter(7, extraCreditPoints)
                    .setParameter(8, existingGrade.get(0))
                    .executeUpdate();
                
                // Get course ID for later course grades update (outside this transaction)
                Long courseId = getCourseIdFromAssessment(assessmentId);
                
                return "Grade updated successfully|" + (courseId != null ? courseId.toString() : "");
            } else {
                // Insert new grade
                String insertQuery = "INSERT INTO grades (assessment_id, points_earned, points_possible, " +
                                   "percentage_score, score_type, notes, is_extra_credit, extra_credit_points, user_id) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                
                entityManager.createNativeQuery(insertQuery)
                    .setParameter(1, assessmentId)
                    .setParameter(2, pointsEarned)
                    .setParameter(3, pointsPossible)
                    .setParameter(4, percentageScore)
                    .setParameter(5, scoreType)
                    .setParameter(6, notes)
                    .setParameter(7, isExtraCredit)
                    .setParameter(8, extraCreditPoints)
                    .setParameter(9, userId)
                    .executeUpdate();
                
                // Award points for adding a new grade
                try {
                    awardPoints(userId, 10, "GRADE_ADDED");
                    System.out.println("✅ Awarded 10 points to user " + userId + " for adding a grade");
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to award points for grade addition: " + e.getMessage());
                    // Don't fail the entire operation if point awarding fails
                }
                
                // Get course ID for later course grades update (outside this transaction)
                Long courseId = getCourseIdFromAssessment(assessmentId);
                
                return "Grade added successfully|" + (courseId != null ? courseId.toString() : "");
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
    @Transactional
    public void updateCourseGrades(Long courseId) {
        try {
            System.out.println("🔄 Calling UpdateCourseGrades for course: " + courseId);
            // Call the database procedure UpdateCourseGrades using entityManager
            entityManager.createNativeQuery("CALL UpdateCourseGrades(:courseId)")
                .setParameter("courseId", courseId)
                .executeUpdate();
            System.out.println("✅ UpdateCourseGrades completed successfully for course: " + courseId);
        } catch (Exception e) {
            System.err.println("❌ Error updating course grades for course " + courseId + ": " + e.getMessage());
            e.printStackTrace();
            // Don't rethrow the exception to avoid transaction rollback issues
        }
    }

    /**
     * Update user analytics using database procedure
     * NOTE: This method is deprecated - UpdateCourseGrades already calls UpdateUserAnalytics
     * @param userId User ID
     * @param courseId Course ID
     */
    @Deprecated
    public void updateUserAnalytics(Long userId, Long courseId) {
        System.out.println("⚠️ WARNING: updateUserAnalytics is deprecated. UpdateCourseGrades already handles analytics.");
        // Method intentionally left empty to prevent duplicate analytics
        // UpdateCourseGrades stored procedure already calls UpdateUserAnalytics
    }

    /**
     * Award points to user using database procedure
     * @param userId User ID
     * @param points Points to award
     * @param activityType Activity type
     */
    @Transactional
    public void awardPoints(Long userId, Integer points, String activityType) {
        try {
            // Call the database procedure AwardPoints using entityManager
            entityManager.createNativeQuery("CALL AwardPoints(:userId, :points, :activityType)")
                .setParameter("userId", userId)
                .setParameter("points", points)
                .setParameter("activityType", activityType)
                .executeUpdate();
        } catch (Exception e) {
            System.err.println("Error awarding points to user " + userId + ": " + e.getMessage());
        }
    }


    /**
     * Check grade alerts using database procedure
     * @param userId User ID
     */
    @Transactional
    public void checkGradeAlerts(Long userId) {
        try {
            // Call the database procedure CheckGradeAlerts using entityManager
            entityManager.createNativeQuery("CALL CheckGradeAlerts(:userId)")
                .setParameter("userId", userId)
                .executeUpdate();
        } catch (Exception e) {
            System.err.println("Error checking grade alerts for user " + userId + ": " + e.getMessage());
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
    
    /**
     * Update course handle missing setting using stored procedure
     * @param courseId Course ID
     * @param handleMissing Handle missing setting ("exclude" or "treat_as_zero")
     */
    @Transactional
    public void updateCourseHandleMissing(Long courseId, String handleMissing) {
        try {
            // Call the stored procedure to update handle missing setting
            entityManager.createNativeQuery("CALL UpdateCourseHandleMissing(?, ?)")
                    .setParameter(1, courseId)
                    .setParameter(2, handleMissing)
                    .executeUpdate();
                    
            System.out.println("Updated handle missing setting for course " + courseId + " to: " + handleMissing);
        } catch (Exception e) {
            System.err.println("Error updating course handle missing setting: " + e.getMessage());
            throw new RuntimeException("Failed to update handle missing setting", e);
        }
    }
    
    /**
     * Get course ID from assessment ID
     */
    private Long getCourseIdFromAssessment(Long assessmentId) {
        try {
            String query = "SELECT ac.course_id FROM assessments a " +
                          "INNER JOIN assessment_categories ac ON a.category_id = ac.category_id " +
                          "WHERE a.assessment_id = ?";
            
            Object result = entityManager.createNativeQuery(query)
                    .setParameter(1, assessmentId)
                    .getSingleResult();
            
            return ((Number) result).longValue();
        } catch (Exception e) {
            System.err.println("Error getting course ID from assessment: " + e.getMessage());
            return null;
        }
    }

    /**
     * Get user ID from course ID
     */
    public Long getUserIdFromCourse(Long courseId) {
        try {
            String query = "SELECT user_id FROM courses WHERE course_id = ?";
            
            Object result = entityManager.createNativeQuery(query)
                    .setParameter(1, courseId)
                    .getSingleResult();
            
            return ((Number) result).longValue();
        } catch (Exception e) {
            System.err.println("Error getting user ID from course: " + e.getMessage());
            return null;
        }
    }
    
        /**
         * Create analytics entry for grade update using stored procedure
         * NOTE: This method is deprecated - UpdateCourseGrades already calls UpdateUserAnalytics
         */
        @Deprecated
        public void createAnalyticsForGradeUpdate(Long userId, Long courseId) {
            System.out.println("⚠️ WARNING: createAnalyticsForGradeUpdate is deprecated. UpdateCourseGrades already handles analytics.");
            // Method intentionally left empty to prevent duplicate analytics
            // UpdateCourseGrades stored procedure already calls UpdateUserAnalytics
        }

        /**
         * Check goal progress and mark achievements using stored procedure
         */
        @Transactional
        public void checkGoalProgress(Long userId) {
            try {
                String procedureCall = "CALL CheckGoalProgress(?)";
                entityManager.createNativeQuery(procedureCall)
                        .setParameter(1, userId)
                        .executeUpdate();
            } catch (Exception e) {
                System.err.println("Error calling CheckGoalProgress stored procedure: " + e.getMessage());
            }
        }



}
