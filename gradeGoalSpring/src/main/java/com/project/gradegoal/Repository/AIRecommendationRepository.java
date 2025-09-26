package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Recommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI Recommendation Repository
 * Handles database operations for AI-generated recommendations
 */
@Repository
public interface AIRecommendationRepository extends JpaRepository<Recommendation, Long> {

    /**
     * Find AI recommendations by user ID (with limit)
     */
    @Query("SELECT r FROM Recommendation r WHERE r.userId = :userId AND r.aiGenerated = true ORDER BY " +
           "CASE r.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END, r.createdAt DESC")
    List<Recommendation> findByUserIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find AI recommendations by user ID and course ID (with limit)
     */
    @Query("SELECT r FROM Recommendation r WHERE r.userId = :userId AND r.courseId = :courseId AND r.aiGenerated = true ORDER BY " +
           "CASE r.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END, r.createdAt DESC")
    List<Recommendation> findByUserIdAndCourseIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(
            @Param("userId") Long userId, 
            @Param("courseId") Long courseId, 
            Pageable pageable);

    /**
     * Find all AI recommendations for a user
     */
    List<Recommendation> findByUserIdAndAiGeneratedTrue(Long userId);

    /**
     * Find all AI recommendations for a user and course
     */
    List<Recommendation> findByUserIdAndCourseIdAndAiGeneratedTrue(Long userId, Long courseId);

    /**
     * Find expired AI recommendations
     */
    List<Recommendation> findByAiGeneratedTrueAndExpiresAtBefore(LocalDateTime now);

    /**
     * Count unread AI recommendations for a user
     */
    @Query("SELECT COUNT(r) FROM Recommendation r WHERE r.userId = :userId AND r.aiGenerated = true AND r.isRead = false AND r.isDismissed = false")
    long countUnreadAIRecommendations(@Param("userId") Long userId);

    /**
     * Count unread AI recommendations for a user and course
     */
    @Query("SELECT COUNT(r) FROM Recommendation r WHERE r.userId = :userId AND r.courseId = :courseId AND r.aiGenerated = true AND r.isRead = false AND r.isDismissed = false")
    long countUnreadAIRecommendationsByCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);

    /**
     * Find AI recommendations by type
     */
    List<Recommendation> findByUserIdAndRecommendationTypeAndAiGeneratedTrueOrderByCreatedAtDesc(
            Long userId, String recommendationType);

    /**
     * Find AI recommendations by priority
     */
    List<Recommendation> findByUserIdAndPriorityAndAiGeneratedTrueOrderByCreatedAtDesc(
            Long userId, String priority);

    /**
     * Find recent AI recommendations (last 7 days)
     */
    @Query("SELECT r FROM Recommendation r WHERE r.userId = :userId AND r.aiGenerated = true AND r.createdAt >= :sevenDaysAgo ORDER BY r.createdAt DESC")
    List<Recommendation> findRecentAIRecommendations(@Param("userId") Long userId, @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    /**
     * Find AI recommendations by confidence level
     */
    @Query("SELECT r FROM Recommendation r WHERE r.userId = :userId AND r.aiGenerated = true AND r.aiConfidence >= :minConfidence ORDER BY r.aiConfidence DESC")
    List<Recommendation> findByUserIdAndAiConfidenceGreaterThanEqualOrderByAiConfidenceDesc(
            @Param("userId") Long userId, @Param("minConfidence") Double minConfidence);

    /**
     * Find AI recommendations by model
     */
    List<Recommendation> findByUserIdAndAiModelAndAiGeneratedTrueOrderByCreatedAtDesc(
            Long userId, String aiModel);

    /**
     * Get AI recommendation statistics for a user
     */
    @Query("SELECT " +
           "COUNT(r) as total, " +
           "SUM(CASE WHEN r.isRead = false THEN 1 ELSE 0 END) as unread, " +
           "SUM(CASE WHEN r.priority = 'HIGH' THEN 1 ELSE 0 END) as highPriority, " +
           "SUM(CASE WHEN r.createdAt >= :sevenDaysAgo THEN 1 ELSE 0 END) as recent, " +
           "AVG(r.aiConfidence) as avgConfidence " +
           "FROM Recommendation r " +
           "WHERE r.userId = :userId AND r.aiGenerated = true AND r.isDismissed = false")
    Object[] getAIRecommendationStats(@Param("userId") Long userId, @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    /**
     * Get AI recommendation statistics for a user and course
     */
    @Query("SELECT " +
           "COUNT(r) as total, " +
           "SUM(CASE WHEN r.isRead = false THEN 1 ELSE 0 END) as unread, " +
           "SUM(CASE WHEN r.priority = 'HIGH' THEN 1 ELSE 0 END) as highPriority, " +
           "SUM(CASE WHEN r.createdAt >= :sevenDaysAgo THEN 1 ELSE 0 END) as recent, " +
           "AVG(r.aiConfidence) as avgConfidence " +
           "FROM Recommendation r " +
           "WHERE r.userId = :userId AND r.courseId = :courseId AND r.aiGenerated = true AND r.isDismissed = false")
    Object[] getAIRecommendationStatsByCourse(@Param("userId") Long userId, @Param("courseId") Long courseId, @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    /**
     * Delete expired AI recommendations
     */
    @Query("DELETE FROM Recommendation r WHERE r.aiGenerated = true AND r.expiresAt < :now")
    int deleteExpiredAIRecommendations(@Param("now") LocalDateTime now);
}
