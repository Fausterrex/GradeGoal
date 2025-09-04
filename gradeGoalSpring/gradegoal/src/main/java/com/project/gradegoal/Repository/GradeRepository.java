package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByAssessmentId(Long assessmentId);

    List<Grade> findByAssessmentIdAndScoreType(Long assessmentId, Grade.ScoreType scoreType);

    List<Grade> findByGradeDate(LocalDate gradeDate);

    List<Grade> findByGradeDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT g FROM Grade g JOIN FETCH g.assessment WHERE g.gradeId = :gradeId")
    Optional<Grade> findByIdWithAssessment(@Param("gradeId") Long gradeId);

    List<Grade> findByScoreType(Grade.ScoreType scoreType);

    List<Grade> findByIsExtraCredit(Boolean isExtraCredit);

    Grade findTopByAssessmentIdOrderByGradeDateDesc(Long assessmentId);

    long countByAssessmentId(Long assessmentId);

    long countByScoreType(Grade.ScoreType scoreType);

    @Query("SELECT g FROM Grade g WHERE g.assessmentId = :assessmentId AND g.percentageScore > :threshold")
    List<Grade> findGradesAboveThreshold(@Param("assessmentId") Long assessmentId, @Param("threshold") java.math.BigDecimal threshold);

    @Query("SELECT AVG(g.percentageScore) FROM Grade g WHERE g.assessmentId = :assessmentId")
    java.math.BigDecimal getAverageGradeByAssessmentId(@Param("assessmentId") Long assessmentId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.assessment a WHERE a.categoryId = :categoryId")
    List<Grade> findGradesByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.assessment a WHERE a.categoryId IN (SELECT ac.categoryId FROM AssessmentCategory ac WHERE ac.courseId = :courseId)")
    List<Grade> findGradesByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT g FROM Grade g JOIN g.assessment a WHERE a.categoryId IN (SELECT ac.categoryId FROM AssessmentCategory ac WHERE ac.courseId IN (SELECT c.courseId FROM Course c WHERE c.userId = :userId))")
    List<Grade> findGradesByUserId(@Param("userId") Long userId);
}