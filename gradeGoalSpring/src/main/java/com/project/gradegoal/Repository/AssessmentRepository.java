package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByCategoryId(Long categoryId);

    List<Assessment> findByCategoryIdIn(List<Long> categoryIds);

    List<Assessment> findByCategoryIdAndStatus(Long categoryId, Assessment.AssessmentStatus status);

    List<Assessment> findByDueDate(LocalDate dueDate);

    List<Assessment> findByDueDateBefore(LocalDate dueDate);

    List<Assessment> findByDueDateAfter(LocalDate dueDate);

    List<Assessment> findByStatus(Assessment.AssessmentStatus status);

    Assessment findByCategoryIdAndAssessmentName(Long categoryId, String assessmentName);

    boolean existsByCategoryIdAndAssessmentName(Long categoryId, String assessmentName);

    long countByCategoryId(Long categoryId);

    long countByCategoryIdAndStatus(Long categoryId, Assessment.AssessmentStatus status);

    @Query("SELECT a FROM Assessment a WHERE a.dueDate < :currentDate AND a.status != 'COMPLETED' AND a.status != 'CANCELLED'")
    List<Assessment> findOverdueAssessments(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT a FROM Assessment a WHERE a.dueDate BETWEEN :currentDate AND :futureDate AND a.status = 'UPCOMING'")
    List<Assessment> findUpcomingAssessments(@Param("currentDate") LocalDate currentDate, @Param("futureDate") LocalDate futureDate);

    @Query("SELECT DISTINCT a FROM Assessment a LEFT JOIN FETCH a.grades WHERE a.categoryId = :categoryId AND SIZE(a.grades) > 0")
    List<Assessment> findAssessmentsWithGrades(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT a FROM Assessment a LEFT JOIN FETCH a.grades")
    List<Assessment> findAllWithGrades();

    @Query("SELECT a FROM Assessment a LEFT JOIN FETCH AssessmentCategory ac ON a.categoryId = ac.categoryId WHERE a.dueDate IS NOT NULL")
    List<Assessment> findAllWithCourseInfo();

    @Query("SELECT a FROM Assessment a " +
           "LEFT JOIN FETCH AssessmentCategory ac ON a.categoryId = ac.categoryId " +
           "LEFT JOIN FETCH Course c ON ac.courseId = c.courseId " +
           "WHERE c.userId = :userId AND a.dueDate IS NOT NULL")
    List<Assessment> findByUserId(@Param("userId") Long userId);

    void deleteByCategoryId(Long categoryId);
}
