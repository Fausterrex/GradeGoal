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

    List<Course> findByUserIdAndSemesterAndAcademicYear(Long userId, Course.Semester semester, String academicYear);

    List<Course> findByUserIdAndCreationYearLevel(Long userId, String creationYearLevel);

    @Query("SELECT DISTINCT c.creationYearLevel FROM Course c WHERE c.userId = :userId AND c.creationYearLevel IS NOT NULL ORDER BY c.creationYearLevel")
    List<String> findDistinctCreationYearLevelsByUserId(@Param("userId") Long userId);

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
    
    /**
     * Count all courses
     * @return total count of courses
     */
    long count();
    
    /**
     * Count active courses
     * @return count of active courses
     */
    long countByIsActiveTrue();

    // ========================================
    // DATABASE FUNCTION CALLS
    // ========================================

    @Query(value = "SELECT CalculateCourseGrade(:courseId, :semesterTerm)", nativeQuery = true)
    BigDecimal calculateCourseGrade(@Param("courseId") Long courseId, @Param("semesterTerm") String semesterTerm);

    @Query(value = "SELECT CalculateCategoryGrade(:categoryId, :semesterTerm)", nativeQuery = true)
    BigDecimal calculateCategoryGrade(@Param("categoryId") Long categoryId, @Param("semesterTerm") String semesterTerm);

    // Backward compatibility methods
    @Query(value = "SELECT CalculateCourseGradeOverall(:courseId)", nativeQuery = true)
    BigDecimal calculateCourseGradeOverall(@Param("courseId") Long courseId);

    @Query(value = "SELECT CalculateCategoryGradeOverall(:categoryId)", nativeQuery = true)
    BigDecimal calculateCategoryGradeOverall(@Param("categoryId") Long categoryId);

    @Query(value = "SELECT CalculateGPA(:percentage)", nativeQuery = true)
    BigDecimal calculateGPA(@Param("percentage") BigDecimal percentage);

    @Query(value = "SELECT CalculateCumulativeGPA(:userId)", nativeQuery = true)
    BigDecimal calculateCumulativeGPA(@Param("userId") Long userId);


    // ========================================
    // DATABASE PROCEDURE CALLS
    // ========================================

    // Note: These methods are now handled directly in the service layer using entityManager
    // to avoid ResultSet navigation issues with stored procedures

    @Modifying
    @Query(value = "CALL InitializeSampleAchievements()", nativeQuery = true)
    void initializeSampleAchievements();
}