package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import com.project.gradegoal.Repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserService userService;

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
        existingCourse.setCreditHours(courseData.getCreditHours());
        existingCourse.setTargetGrade(courseData.getTargetGrade());
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

    public boolean deleteCourse(Long courseId) {
        if (courseRepository.existsById(courseId)) {
            courseRepository.deleteById(courseId);
            return true;
        }
        return false;
    }

    public Course completeCourse(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();

            BigDecimal finalGrade = calculateFinalCourseGrade(courseId);
            BigDecimal finalGPA = convertGradeToGPA(finalGrade, course.getTargetGrade());

            course.setCalculatedCourseGrade(finalGrade);
            course.setCourseGpa(finalGPA);

            return courseRepository.save(course);
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

            course.setCalculatedCourseGrade(BigDecimal.ZERO);
            course.setCourseGpa(BigDecimal.ZERO);
            return courseRepository.save(course);
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

    private BigDecimal convertGradeToGPA(BigDecimal grade, BigDecimal targetGrade) {

        if (grade.compareTo(targetGrade) >= 0) {
            return new BigDecimal("4.00");
        }

        BigDecimal ratio = grade.divide(targetGrade, 4, BigDecimal.ROUND_HALF_UP);
        return ratio.multiply(new BigDecimal("4.00")).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

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

    public Course updateTargetGrade(Long courseId, BigDecimal targetGrade) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setTargetGrade(targetGrade);
            return courseRepository.save(course);
        }
        return null;
    }

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