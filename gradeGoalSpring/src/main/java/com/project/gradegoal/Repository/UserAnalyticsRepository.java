package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.UserAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAnalyticsRepository extends JpaRepository<UserAnalytics, Long> {

    /**
     * Find all analytics entries for a user
     * @param userId User ID
     * @return List of analytics entries
     */
    List<UserAnalytics> findByUserId(Long userId);

    /**
     * Find the latest analytics entry for a user
     * @param userId User ID
     * @return Latest analytics entry
     */
    @Query("SELECT ua FROM UserAnalytics ua WHERE ua.userId = :userId ORDER BY ua.analyticsDate DESC, ua.calculatedAt DESC")
    UserAnalytics findLatestByUserId(@Param("userId") Long userId);

    /**
     * Find analytics entries for a specific user and course
     * @param userId User ID
     * @param courseId Course ID
     * @return List of analytics entries
     */
    List<UserAnalytics> findByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * Find analytics entries for a specific user and date
     * @param userId User ID
     * @param analyticsDate Analytics date
     * @return List of analytics entries
     */
    List<UserAnalytics> findByUserIdAndAnalyticsDate(Long userId, LocalDate analyticsDate);

    /**
     * Find analytics entry for a specific user, course, and date
     * @param userId User ID
     * @param courseId Course ID
     * @param analyticsDate Analytics date
     * @return Analytics entry
     */
    UserAnalytics findByUserIdAndCourseIdAndAnalyticsDate(Long userId, Long courseId, LocalDate analyticsDate);

    /**
     * Find all analytics entries for a specific course
     * @param courseId Course ID
     * @return List of analytics entries
     */
    List<UserAnalytics> findByCourseId(Long courseId);

    /**
     * Find the latest analytics entry for a specific user and course
     * @param userId User ID
     * @param courseId Course ID
     * @return Latest analytics entry
     */
    @Query("SELECT ua FROM UserAnalytics ua WHERE ua.userId = :userId AND ua.courseId = :courseId ORDER BY ua.analyticsDate DESC, ua.calculatedAt DESC")
    Optional<UserAnalytics> findLatestByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

    /**
     * Find the latest overall analytics entry for a user (courseId = null)
     * @param userId User ID
     * @return Latest overall analytics entry
     */
    @Query("SELECT ua FROM UserAnalytics ua WHERE ua.userId = :userId AND ua.courseId IS NULL ORDER BY ua.analyticsDate DESC, ua.calculatedAt DESC")
    Optional<UserAnalytics> findLatestByUserIdAndCourseIdIsNull(@Param("userId") Long userId);

    /**
     * Find all analytics entries for a user ordered by date
     * @param userId User ID
     * @return List of analytics entries
     */
    @Query("SELECT ua FROM UserAnalytics ua WHERE ua.userId = :userId ORDER BY ua.analyticsDate DESC, ua.calculatedAt DESC")
    List<UserAnalytics> findByUserIdOrderByAnalyticsDateDesc(@Param("userId") Long userId);

    /**
     * Find all analytics entries for a specific user and course ordered by date
     * @param userId User ID
     * @param courseId Course ID
     * @return List of analytics entries ordered by date descending
     */
    @Query("SELECT ua FROM UserAnalytics ua WHERE ua.userId = :userId AND ua.courseId = :courseId ORDER BY ua.analyticsDate DESC, ua.calculatedAt DESC")
    List<UserAnalytics> findByUserIdAndCourseIdOrderByAnalyticsDateDesc(@Param("userId") Long userId, @Param("courseId") Long courseId);
}