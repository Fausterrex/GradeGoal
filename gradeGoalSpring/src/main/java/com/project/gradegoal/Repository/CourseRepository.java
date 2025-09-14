package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByUserId(Long userId);

    List<Course> findByUserIdAndIsActiveTrue(Long userId);

    List<Course> findByUserIdAndSemester(Long userId, Course.Semester semester);

    List<Course> findByUserIdAndAcademicYear(Long userId, String academicYear);

    Optional<Course> findByCourseCodeAndUserId(String courseCode, Long userId);

    boolean existsByCourseCodeAndUserId(String courseCode, Long userId);

    List<Course> findByInstructorName(String instructorName);

    // Target grades are now managed through the Academic Goals system
    // This method is no longer used

    long countByUserId(Long userId);

    long countByUserIdAndIsActiveTrue(Long userId);

    @Query("SELECT c FROM Course c WHERE c.userId = :userId AND c.calculatedCourseGrade > 0")
    List<Course> findCoursesWithCalculatedGrades(@Param("userId") Long userId);

    List<Course> findByIsActiveTrue();

    List<Course> findByIsActiveFalse();

    // ========================================
    // DATABASE FUNCTION CALLS
    // ========================================

    @Query(value = "SELECT CalculateCourseGrade(:courseId)", nativeQuery = true)
    BigDecimal calculateCourseGrade(@Param("courseId") Long courseId);

    @Query(value = "SELECT CalculateCategoryGrade(:categoryId)", nativeQuery = true)
    BigDecimal calculateCategoryGrade(@Param("categoryId") Long categoryId);

    @Query(value = "SELECT CalculateGPA(:percentage)", nativeQuery = true)
    BigDecimal calculateGPA(@Param("percentage") BigDecimal percentage);

    @Query(value = "SELECT CalculateCumulativeGPA(:userId)", nativeQuery = true)
    BigDecimal calculateCumulativeGPA(@Param("userId") Long userId);

    // ========================================
    // DATABASE PROCEDURE CALLS
    // ========================================

    @Modifying
    @Query(value = "CALL UpdateCourseGrades(:courseId)", nativeQuery = true)
    void updateCourseGrades(@Param("courseId") Long courseId);

    @Modifying
    @Query(value = "CALL UpdateUserAnalytics(:userId, :courseId)", nativeQuery = true)
    void updateUserAnalytics(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Modifying
    @Query(value = "CALL CheckGoalProgress(:userId)", nativeQuery = true)
    void checkGoalProgress(@Param("userId") Long userId);

    @Modifying
    @Query(value = "CALL CheckGradeAlerts(:userId)", nativeQuery = true)
    void checkGradeAlerts(@Param("userId") Long userId);

    @Modifying
    @Query(value = "CALL InitializeSampleAchievements()", nativeQuery = true)
    void initializeSampleAchievements();
}