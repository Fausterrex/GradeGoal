package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.AIAssessmentPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIAssessmentPredictionRepository extends JpaRepository<AIAssessmentPrediction, Long> {
    
    /**
     * Find AI prediction for a specific assessment
     */
    @Query("SELECT p FROM AIAssessmentPrediction p WHERE p.assessmentId = :assessmentId " +
           "AND p.userId = :userId AND p.isActive = true " +
           "AND (p.expiresAt IS NULL OR p.expiresAt > :now)")
    Optional<AIAssessmentPrediction> findActivePredictionByAssessment(
        @Param("assessmentId") Long assessmentId,
        @Param("userId") Long userId,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find all AI predictions for a course
     */
    @Query("SELECT p FROM AIAssessmentPrediction p WHERE p.courseId = :courseId " +
           "AND p.userId = :userId AND p.isActive = true " +
           "AND (p.expiresAt IS NULL OR p.expiresAt > :now) ORDER BY p.createdAt DESC")
    List<AIAssessmentPrediction> findActivePredictionsByCourse(
        @Param("courseId") Long courseId,
        @Param("userId") Long userId,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find all AI predictions for a user
     */
    @Query("SELECT p FROM AIAssessmentPrediction p WHERE p.userId = :userId AND p.isActive = true " +
           "AND (p.expiresAt IS NULL OR p.expiresAt > :now) ORDER BY p.createdAt DESC")
    List<AIAssessmentPrediction> findActivePredictionsByUser(
        @Param("userId") Long userId,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find expired predictions for cleanup
     */
    @Query("SELECT p FROM AIAssessmentPrediction p WHERE p.expiresAt IS NOT NULL AND p.expiresAt < :now AND p.isActive = true")
    List<AIAssessmentPrediction> findExpiredPredictions(@Param("now") LocalDateTime now);
    
    /**
     * Deactivate expired predictions
     */
    @Query("UPDATE AIAssessmentPrediction p SET p.isActive = false WHERE p.expiresAt IS NOT NULL AND p.expiresAt < :now")
    int deactivateExpiredPredictions(@Param("now") LocalDateTime now);
    
    /**
     * Check if prediction exists for assessment
     */
    @Query("SELECT COUNT(p) > 0 FROM AIAssessmentPrediction p WHERE p.assessmentId = :assessmentId " +
           "AND p.userId = :userId AND p.isActive = true " +
           "AND (p.expiresAt IS NULL OR p.expiresAt > :now)")
    boolean existsActivePrediction(@Param("assessmentId") Long assessmentId, @Param("userId") Long userId, @Param("now") LocalDateTime now);
}
