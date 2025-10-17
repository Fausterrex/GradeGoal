package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Repository.CourseRepository;
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
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private UserProgressService userProgressService;
    
    @Autowired
    private NotificationService notificationService;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Calculate course grade using database function for specific semester term
     * @param courseId Course ID
     * @param semesterTerm Semester term (MIDTERM or FINAL_TERM)
     * @return Calculated course grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCourseGrade(Long courseId, String semesterTerm) {
        try {
            // Call the database function CalculateCourseGrade with semester term
            BigDecimal result = courseRepository.calculateCourseGrade(courseId, semesterTerm);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate course grade using database function (backward compatibility)
     * @param courseId Course ID
     * @return Calculated course grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCourseGrade(Long courseId) {
        try {
            // Call the database function CalculateCourseGradeOverall for backward compatibility
            BigDecimal result = courseRepository.calculateCourseGradeOverall(courseId);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate category grade using database function for specific semester term
     * @param categoryId Category ID
     * @param semesterTerm Semester term (MIDTERM or FINAL_TERM)
     * @return Calculated category grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCategoryGrade(Long categoryId, String semesterTerm) {
        try {
            // Call the database function CalculateCategoryGrade with semester term
            BigDecimal result = courseRepository.calculateCategoryGrade(categoryId, semesterTerm);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Calculate category grade using database function (backward compatibility)
     * @param categoryId Category ID
     * @return Calculated category grade percentage
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCategoryGrade(Long categoryId) {
        try {
            // Call the database function CalculateCategoryGradeOverall for backward compatibility
            BigDecimal result = courseRepository.calculateCategoryGradeOverall(categoryId);
            return result != null ? result.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        } catch (Exception e) {
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
            
            // Get or create user progress
            UserProgress userProgress = userProgressRepository.findByUserId(userId);
            if (userProgress == null) {
                userProgress = new UserProgress(userId);
                userProgressRepository.save(userProgress);
            }

            // Initialize GPA values
            BigDecimal cumulativeGPA = BigDecimal.ZERO;
            BigDecimal semesterGPA = BigDecimal.ZERO;

            try {
                // Calculate cumulative GPA
                cumulativeGPA = calculateCumulativeGPA(userId);
            } catch (Exception e) {
                cumulativeGPA = BigDecimal.ZERO;
            }

            try {
                // Get user's current semester and academic year from their active courses
                List<Course> activeCourses = courseRepository.findByUserIdAndIsActiveTrue(userId);
                
                if (!activeCourses.isEmpty()) {
                    Course firstCourse = activeCourses.get(0);
                    String currentSemester = firstCourse.getSemester().toString();
                    String currentAcademicYear = firstCourse.getAcademicYear();
                    
                    // Calculate semester GPA
                    semesterGPA = calculateSemesterGPA(userId, currentSemester, currentAcademicYear);
                } else {
                }
            } catch (Exception e) {
                semesterGPA = BigDecimal.ZERO;
            }

            // Update user progress
            userProgress.setCumulativeGpa(cumulativeGPA.doubleValue());
            userProgress.setSemesterGpa(semesterGPA.doubleValue());
            
            UserProgress savedProgress = userProgressRepository.save(userProgress);
            
            return savedProgress;
            
        } catch (Exception e) {
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
            
            @SuppressWarnings("unchecked")
            List<Object> userResult = entityManager.createNativeQuery(userQuery)
                .setParameter(1, assessmentId)
                .getResultList();
            
            if (userResult.isEmpty()) {
                return "Error: User ID not found for the given assessment.";
            }
            
            Long userId = ((Number) userResult.get(0)).longValue();
            
            // Check if a grade already exists for this assessment
            String checkQuery = "SELECT grade_id FROM grades WHERE assessment_id = ?";
            @SuppressWarnings("unchecked")
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
                
                // Update assessment status to COMPLETED when grade is updated
                try {
                    String updateStatusQuery = "UPDATE assessments SET status = 'COMPLETED' WHERE assessment_id = ?";
                    entityManager.createNativeQuery(updateStatusQuery)
                        .setParameter(1, assessmentId)
                        .executeUpdate();
                } catch (Exception e) {
                    // Don't fail the entire operation if status update fails
                }
                
                // Get course ID for later course grades update (outside this transaction)
                Long courseId = getCourseIdFromAssessment(assessmentId);
                
                return "Grade updated successfully|" + (courseId != null ? courseId.toString() : "");
            } else {
                // Insert new grade
                String insertQuery = "INSERT INTO grades (assessment_id, points_earned, points_possible, " +
                                   "percentage_score, score_type, notes, is_extra_credit, extra_credit_points) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
                
                entityManager.createNativeQuery(insertQuery)
                    .setParameter(1, assessmentId)
                    .setParameter(2, pointsEarned)
                    .setParameter(3, pointsPossible)
                    .setParameter(4, percentageScore)
                    .setParameter(5, scoreType)
                    .setParameter(6, notes)
                    .setParameter(7, isExtraCredit)
                    .setParameter(8, extraCreditPoints)
                    .executeUpdate();
                
                // Update assessment status to COMPLETED when grade is added
                try {
                    String updateStatusQuery = "UPDATE assessments SET status = 'COMPLETED' WHERE assessment_id = ?";
                    entityManager.createNativeQuery(updateStatusQuery)
                        .setParameter(1, assessmentId)
                        .executeUpdate();
                } catch (Exception e) {
                    // Don't fail the entire operation if status update fails
                }
                
                // Award points for adding a new grade
                try {
                    awardPoints(userId, 10, "GRADE_ADDED");
                } catch (Exception e) {
                    // Don't fail the entire operation if point awarding fails
                }
                
                // Get course ID for later course grades update (outside this transaction)
                Long courseId = getCourseIdFromAssessment(assessmentId);
                
                return "Grade added successfully|" + (courseId != null ? courseId.toString() : "");
            }
        } catch (Exception e) {
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
            
            // Get the course to find the user ID
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (!courseOpt.isPresent()) {
                return;
            }
            
            Course course = courseOpt.get();
            Long userId = course.getUserId();
            
            if (userId == null) {
                return;
            }
            
            // Use our smart analytics logic instead of the stored procedure
            assessmentService.regenerateAnalyticsForCourse(userId, courseId);
            
        } catch (Exception e) {
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
        // Method intentionally left empty to prevent duplicate analytics
        // UpdateCourseGrades stored procedure already calls UpdateUserAnalytics
    }

    /**
     * Award points to user using UserProgressService (includes level-up notifications)
     * @param userId User ID
     * @param points Points to award
     * @param activityType Activity type
     */
    @Transactional
    public void awardPoints(Long userId, Integer points, String activityType) {
        try {
            // Use UserProgressService to award points and handle level-up notifications
            UserProgressService.LevelUpResult levelUpResult = userProgressService.awardPointsWithLevelUpCheck(userId, points);
            
            // If user leveled up, send level-up notification
            if (levelUpResult.isLeveledUp()) {
                Integer newLevel = levelUpResult.getProgress().getCurrentLevel();
                String rankTitle = userProgressService.getUserRankTitle(newLevel);
                notificationService.sendLevelUpNotification(userId, newLevel, rankTitle);
            }
            
        } catch (Exception e) {
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
                return savedCourse;
            } else {
                return null;
            }
        } catch (Exception e) {
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
                    
        } catch (Exception e) {
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
            return null;
        }
    }
    
        /**
         * Create analytics entry for grade update using stored procedure
         * NOTE: This method is deprecated - UpdateCourseGrades already calls UpdateUserAnalytics
         */
        @Deprecated
        public void createAnalyticsForGradeUpdate(Long userId, Long courseId) {
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
            throw new RuntimeException("Failed to check goal progress: " + e.getMessage());
        }
    }

    /**
     * Mark midterm as completed for a course
     * @param courseId Course ID
     */
    @Transactional
    public void markMidtermCompleted(Long courseId) {
        try {
            // Call the stored procedure to mark midterm as completed
            String procedureCall = "CALL MarkMidtermCompleted(?)";
            entityManager.createNativeQuery(procedureCall)
                    .setParameter(1, courseId)
                    .executeUpdate();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to mark midterm as completed: " + e.getMessage());
        }
    }

}
