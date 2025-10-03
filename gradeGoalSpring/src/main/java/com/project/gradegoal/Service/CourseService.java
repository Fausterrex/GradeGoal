package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private AcademicGoalRepository academicGoalRepository;

    @Autowired
    private AcademicGoalService academicGoalService;

    @Autowired
    private UserAnalyticsRepository userAnalyticsRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long courseId, Course courseData) {
        Optional<Course> existingCourseOpt = courseRepository.findById(courseId);
        if (!existingCourseOpt.isPresent()) {
            throw new RuntimeException("Course not found with ID: " + courseId);
        }

        Course existingCourse = existingCourseOpt.get();

        if (hasExistingGrades(courseId) && gradingScaleChanged(existingCourse, courseData)) {
            throw new RuntimeException("Cannot change grading scale when grades exist for this course");
        }

        existingCourse.setCourseName(courseData.getCourseName());
        existingCourse.setCourseCode(courseData.getCourseCode());
        existingCourse.setSemester(courseData.getSemester());
        existingCourse.setAcademicYear(courseData.getAcademicYear());
        existingCourse.setYearLevel(courseData.getYearLevel());
        existingCourse.setCreditHours(courseData.getCreditHours());
        // Target grades are now managed through the Academic Goals system
        existingCourse.setInstructorName(courseData.getInstructorName());
        existingCourse.setColorIndex(courseData.getColorIndex());

        if (!hasExistingGrades(courseId)) {
            existingCourse.setCategorySystem(courseData.getCategorySystem());
        }

        existingCourse.setUpdatedAt(java.time.LocalDateTime.now());

        Course savedCourse = courseRepository.save(existingCourse);
        return savedCourse;
    }

    private boolean hasExistingGrades(Long courseId) {

        List<AssessmentCategory> categories = assessmentCategoryRepository.findByCourseId(courseId);

        for (AssessmentCategory category : categories) {
            List<Grade> grades = gradeRepository.findGradesByCategoryId(category.getCategoryId());
            if (!grades.isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private boolean gradingScaleChanged(Course existingCourse, Course newCourseData) {
        String existingSystem = existingCourse.getCategorySystem();
        String newSystem = newCourseData.getCategorySystem();

        if (existingSystem == null && newSystem == null) {
            return false;
        }
        if (existingSystem == null || newSystem == null) {
            return true;
        }

        return !existingSystem.equals(newSystem);
    }

    public Optional<Course> getCourseById(Long courseId) {
        return courseRepository.findById(courseId);
    }

    public List<Course> getCoursesByUserId(Long userId) {
        return courseRepository.findByUserId(userId);
    }

    public List<Course> getActiveCoursesByUserId(Long userId) {
        return courseRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public List<Course> getCoursesByUserIdAndSemester(Long userId, Course.Semester semester) {
        return courseRepository.findByUserIdAndSemester(userId, semester);
    }

    public List<Course> getCoursesByUserIdAndAcademicYear(Long userId, String academicYear) {
        return courseRepository.findByUserIdAndAcademicYear(userId, academicYear);
    }

    public Course updateCourse(Course course) {
        return courseRepository.save(course);
    }

    /**
     * Delete a course and all its related data with cascading deletion
     * @param courseId Course ID to delete
     * @return true if deletion was successful, false otherwise
     */
    @Transactional
    public boolean deleteCourse(Long courseId) {
        if (courseRepository.existsById(courseId)) {
            logger.info("🗑️ Starting cascading deletion for course ID: {}", courseId);
            
            try {
                // 1. Delete AI Analysis for this course
                int aiAnalysisDeleted = aiAnalysisRepository.deleteByUserIdAndCourseId(
                    courseRepository.findById(courseId).get().getUserId(), 
                    courseId
                );
                logger.info("🤖 Deleted {} AI analysis records for course {}", aiAnalysisDeleted, courseId);
                
                // 2. Delete Academic Goals for this course
                int academicGoalsDeleted = academicGoalRepository.deleteByCourseId(courseId);
                logger.info("🎯 Deleted {} academic goals for course {}", academicGoalsDeleted, courseId);
                
                // 3. Delete User Achievements related to this course
                // Note: User achievements are not directly linked to courses, so we skip this
                
                // 4. Delete Notifications related to this course
                // Note: Notifications are not directly linked to courses, so we skip this
                
                // 5. Delete User Analytics for this course
                Long userId = courseRepository.findById(courseId).get().getUserId();
                List<com.project.gradegoal.Entity.UserAnalytics> analyticsToDelete = 
                    userAnalyticsRepository.findByUserIdAndCourseId(userId, courseId);
                userAnalyticsRepository.deleteAll(analyticsToDelete);
                logger.info("📊 Deleted {} user analytics records for course {}", analyticsToDelete.size(), courseId);
                
                // 6. Get all assessment categories for this course
                List<AssessmentCategory> categories = assessmentCategoryRepository.findByCourseId(courseId);
                logger.info("📁 Found {} assessment categories for course {}", categories.size(), courseId);
                
                // 7. For each category, delete assessments and their grades
                for (AssessmentCategory category : categories) {
                    // Get all assessments in this category
                    List<com.project.gradegoal.Entity.Assessment> assessments = 
                        assessmentRepository.findByCategoryId(category.getId());
                    logger.info("📝 Found {} assessments in category {}", assessments.size(), category.getId());
                    
                    // Delete grades for each assessment
                    for (com.project.gradegoal.Entity.Assessment assessment : assessments) {
                        List<Grade> grades = gradeRepository.findByAssessmentId(assessment.getAssessmentId());
                        gradeRepository.deleteAll(grades);
                        logger.info("🎓 Deleted {} grades for assessment {}", grades.size(), assessment.getAssessmentId());
                    }
                    
                    // Delete all assessments in this category
                    assessmentRepository.deleteAll(assessments);
                    logger.info("📝 Deleted {} assessments in category {}", assessments.size(), category.getId());
                }
                
                // 8. Delete all assessment categories for this course
                assessmentCategoryRepository.deleteAll(categories);
                logger.info("📁 Deleted {} assessment categories for course {}", categories.size(), courseId);
                
                // 9. Finally, delete the course itself
                courseRepository.deleteById(courseId);
                logger.info("✅ Successfully deleted course {} and all related data", courseId);
                
                return true;
            } catch (Exception e) {
                logger.error("❌ Error during cascading deletion for course {}", courseId, e);
                throw e; // Re-throw to trigger transaction rollback
            }
        }
        logger.warn("⚠️ Course {} not found, cannot delete", courseId);
        return false;
    }

    public Course completeCourse(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();

            // Only mark as completed - preserve existing grades
            course.setIsCompleted(true);

            Course savedCourse = courseRepository.save(course);

            // Evaluate academic goals when course is completed
            try {
                academicGoalService.evaluateGoalsOnCourseCompletion(courseId);
                logger.info("Academic goals evaluated for completed course: {}", courseId);
            } catch (Exception e) {
                logger.error("Error evaluating academic goals for course: {}", courseId, e);
                // Don't fail the course completion if goal evaluation fails
            }

            // Send course completion notifications
            try {
                // Get user information for notifications
                Optional<User> userOpt = userService.findById(course.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    String userEmail = user.getEmail();
                    String courseName = course.getCourseName();
                    // Use existing course GPA or default to 4.0 if not available
                    String finalGradeStr = course.getCourseGpa() != null && course.getCourseGpa().compareTo(BigDecimal.ZERO) > 0 
                        ? course.getCourseGpa().toPlainString() 
                        : "4.0";
                    String semester = course.getSemester() != null ? course.getSemester().toString() : "Current Semester";

                    logger.info("Sending course completion notifications for course: {} to user: {}", courseName, userEmail);

                    // Send email notification
                    try {
                        emailNotificationService.sendCourseCompletionNotification(userEmail, courseName, finalGradeStr, semester);
                        logger.info("Course completion email notification sent successfully to: {}", userEmail);
                    } catch (Exception e) {
                        logger.error("Failed to send course completion email notification to: {}", userEmail, e);
                    }

                    // Send push notification
                    try {
                        boolean pushSuccess = pushNotificationService.sendCourseCompletionNotification(userEmail, courseName, finalGradeStr, semester);
                        if (pushSuccess) {
                            logger.info("Course completion push notification sent successfully to: {}", userEmail);
                        } else {
                            logger.warn("Course completion push notification failed for user: {}", userEmail);
                        }
                    } catch (Exception e) {
                        logger.error("Failed to send course completion push notification to: {}", userEmail, e);
                    }
                } else {
                    logger.warn("User not found for course completion notification. Course ID: {}, User ID: {}", courseId, course.getUserId());
                }
            } catch (Exception e) {
                logger.error("Error sending course completion notifications for course: {}", courseId, e);
                // Don't fail the course completion if notifications fail
            }

            return savedCourse;
        }
        return null;
    }

    public Course archiveCourse(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setIsActive(false);
            return courseRepository.save(course);
        }
        return null;
    }

    public Course uncompleteCourse(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();

            // Only mark as not completed - preserve existing grades
            course.setIsCompleted(false);
            Course savedCourse = courseRepository.save(course);

            // Reactivate academic goals when course is marked as incomplete
            try {
                academicGoalService.reactivateGoalsOnCourseIncomplete(courseId);
                logger.info("Academic goals reactivated for incomplete course: {}", courseId);
            } catch (Exception e) {
                logger.error("Error reactivating academic goals for course: {}", courseId, e);
                // Don't fail the course uncomplete if goal reactivation fails
            }

            return savedCourse;
        }
        return null;
    }

    private BigDecimal calculateFinalCourseGrade(Long courseId) {

        List<AssessmentCategory> categories = assessmentCategoryRepository.findByCourseId(courseId);

        if (categories.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalWeightedGrade = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (AssessmentCategory category : categories) {

            List<Grade> categoryGrades = gradeRepository.findGradesByCategoryId(category.getCategoryId());

            if (!categoryGrades.isEmpty()) {

                BigDecimal categoryAverage = calculateCategoryAverage(categoryGrades);
                BigDecimal categoryWeight = category.getWeightPercentage();

                totalWeightedGrade = totalWeightedGrade.add(categoryAverage.multiply(categoryWeight));
                totalWeight = totalWeight.add(categoryWeight);
            }
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
            return totalWeightedGrade.divide(totalWeight, 2, BigDecimal.ROUND_HALF_UP);
        }

        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCategoryAverage(List<Grade> grades) {
        if (grades.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalScore = BigDecimal.ZERO;
        BigDecimal totalMaxScore = BigDecimal.ZERO;

        for (Grade grade : grades) {
            if (grade.getPointsEarned() != null && grade.getPointsPossible() != null) {

                BigDecimal earned = grade.getPointsEarned();
                if (grade.getIsExtraCredit() && grade.getExtraCreditPoints() != null) {
                    earned = earned.add(grade.getExtraCreditPoints());
                }

                totalScore = totalScore.add(earned);
                totalMaxScore = totalMaxScore.add(grade.getPointsPossible());
            }
        }

        if (totalMaxScore.compareTo(BigDecimal.ZERO) > 0) {
            return totalScore.divide(totalMaxScore, 4, BigDecimal.ROUND_HALF_UP)
                           .multiply(BigDecimal.valueOf(100));
        }

        return BigDecimal.ZERO;
    }

    // Target grades are now managed through the Academic Goals system
    // This method is no longer used

    public Course restoreCourse(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setIsActive(true);
            return courseRepository.save(course);
        }
        return null;
    }

    public boolean courseCodeExists(String courseCode, Long userId) {
        return courseRepository.existsByCourseCodeAndUserId(courseCode, userId);
    }

    public Optional<Course> getCourseByCodeAndUserId(String courseCode, Long userId) {
        return courseRepository.findByCourseCodeAndUserId(courseCode, userId);
    }

    // Target grades are now managed through the Academic Goals system
    // This method is no longer used

    public Course updateCalculatedGrade(Long courseId, BigDecimal calculatedGrade) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setCalculatedCourseGrade(calculatedGrade);
            return courseRepository.save(course);
        }
        return null;
    }

    public Course updateCourseGpa(Long courseId, BigDecimal courseGpa) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setCourseGpa(courseGpa);
            return courseRepository.save(course);
        }
        return null;
    }
    
    /**
     * Update both calculated grade and GPA in a single transaction
     */
    @Transactional
    public Course updateCalculatedGradeAndGpa(Long courseId, BigDecimal calculatedGrade, BigDecimal courseGpa) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            
            System.out.println("🔄 Updating course " + courseId + " - Grade: " + calculatedGrade + ", GPA: " + courseGpa);
            
            course.setCalculatedCourseGrade(calculatedGrade);
            course.setCourseGpa(courseGpa);
            course.setUpdatedAt(java.time.LocalDateTime.now());
            
            Course savedCourse = courseRepository.save(course);
            
            System.out.println("✅ Course updated - Stored Grade: " + savedCourse.getCalculatedCourseGrade() + 
                             ", Stored GPA: " + savedCourse.getCourseGpa());
            
            return savedCourse;
        }
        System.err.println("❌ Course not found with ID: " + courseId);
        return null;
    }

    public long getCourseCountByUserId(Long userId) {
        return courseRepository.countByUserId(userId);
    }

    public long getActiveCourseCountByUserId(Long userId) {
        return courseRepository.countByUserIdAndIsActiveTrue(userId);
    }

    public List<Course> getCoursesWithCalculatedGrades(Long userId) {
        return courseRepository.findCoursesWithCalculatedGrades(userId);
    }

    public AssessmentCategory addAssessmentCategory(Long courseId, String categoryName, BigDecimal weightPercentage) {
        AssessmentCategory category = new AssessmentCategory(courseId, categoryName, weightPercentage);
        return assessmentCategoryRepository.save(category);
    }

    public List<AssessmentCategory> getAssessmentCategories(Long courseId) {
        return assessmentCategoryRepository.findByCourseIdOrderByOrderSequence(courseId);
    }

    public List<Course> getCoursesByUid(String uid) {

        Optional<User> user = userService.findByEmail(uid);
        if (user.isPresent()) {
            return getCoursesByUserId(user.get().getUserId());
        }
        return new java.util.ArrayList<>();
    }

    public List<Course> getActiveCoursesByUid(String uid) {

        Optional<User> user = userService.findByEmail(uid);
        if (user.isPresent()) {
            return getActiveCoursesByUserId(user.get().getUserId());
        }
        return new java.util.ArrayList<>();
    }

    public List<Course> getArchivedCoursesByUid(String uid) {

        Optional<User> user = userService.findByEmail(uid);
        if (user.isPresent()) {
            return getCoursesByUserId(user.get().getUserId()).stream()
                .filter(course -> !course.getIsActive())
                .collect(java.util.stream.Collectors.toList());
        }
        return new java.util.ArrayList<>();
    }

    public Course unarchiveCourse(Long courseId) {
        return restoreCourse(courseId);
    }

    public List<AssessmentCategory> getCategoriesByCourseId(Long courseId) {
        return getAssessmentCategories(courseId);
    }

    public AssessmentCategory addCategoryToCourse(Long courseId, AssessmentCategory category) {
        category.setCourseId(courseId);
        return assessmentCategoryRepository.save(category);
    }

    @Deprecated
    public List<Course> getAllCourses() {

        return courseRepository.findAll();
    }
}