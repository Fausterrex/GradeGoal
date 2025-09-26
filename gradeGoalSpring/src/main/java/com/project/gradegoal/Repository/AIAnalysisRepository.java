package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    
    /**
     * Find active AI analysis for a specific user and course
     */
    @Query("SELECT a FROM AIAnalysis a WHERE a.userId = :userId AND a.courseId = :courseId " +
           "AND a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :now) " +
           "ORDER BY a.createdAt DESC")
    Optional<AIAnalysis> findActiveAnalysisByUserAndCourse(
        @Param("userId") Long userId, 
        @Param("courseId") Long courseId,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find all active AI analysis for a user
     */
    @Query("SELECT a FROM AIAnalysis a WHERE a.userId = :userId AND a.isActive = true " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<AIAnalysis> findActiveAnalysisByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    /**
     * Find AI analysis by type for a specific course
     */
    @Query("SELECT a FROM AIAnalysis a WHERE a.userId = :userId AND a.courseId = :courseId " +
           "AND a.analysisType = :analysisType AND a.isActive = true " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.createdAt DESC")
    List<AIAnalysis> findActiveAnalysisByType(
        @Param("userId") Long userId, 
        @Param("courseId") Long courseId,
        @Param("analysisType") AIAnalysis.AnalysisType analysisType,
        @Param("now") LocalDateTime now
    );
    
    /**
     * Find expired AI analysis for cleanup
     */
    @Query("SELECT a FROM AIAnalysis a WHERE a.expiresAt IS NOT NULL AND a.expiresAt < :now AND a.isActive = true")
    List<AIAnalysis> findExpiredAnalysis(@Param("now") LocalDateTime now);
    
    /**
     * Deactivate expired analysis
     */
    @Query("UPDATE AIAnalysis a SET a.isActive = false WHERE a.expiresAt IS NOT NULL AND a.expiresAt < :now")
    int deactivateExpiredAnalysis(@Param("now") LocalDateTime now);
    
    /**
     * Check if analysis exists and is still valid
     */
    @Query("SELECT COUNT(a) > 0 FROM AIAnalysis a WHERE a.userId = :userId AND a.courseId = :courseId " +
           "AND a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :now)")
    boolean existsActiveAnalysis(@Param("userId") Long userId, @Param("courseId") Long courseId, @Param("now") LocalDateTime now);
}
