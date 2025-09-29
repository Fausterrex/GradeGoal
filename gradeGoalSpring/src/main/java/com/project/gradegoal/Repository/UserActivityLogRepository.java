package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {

    /**
     * Find all activities for a specific user
     */
    List<UserActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find activities for a user within a date range
     */
    @Query("SELECT ual FROM UserActivityLog ual WHERE ual.userId = :userId AND ual.createdAt BETWEEN :startDate AND :endDate ORDER BY ual.createdAt DESC")
    List<UserActivityLog> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Find activities by type for a specific user
     */
    List<UserActivityLog> findByUserIdAndActivityTypeOrderByCreatedAtDesc(Long userId, String activityType);

    /**
     * Find recent activities for a user (last N days)
     */
    @Query("SELECT ual FROM UserActivityLog ual WHERE ual.userId = :userId AND ual.createdAt >= :since ORDER BY ual.createdAt DESC")
    List<UserActivityLog> findRecentActivitiesByUserId(@Param("userId") Long userId, 
                                                       @Param("since") LocalDateTime since);

    /**
     * Count activities by type for a user
     */
    @Query("SELECT COUNT(ual) FROM UserActivityLog ual WHERE ual.userId = :userId AND ual.activityType = :activityType")
    Long countByUserIdAndActivityType(@Param("userId") Long userId, @Param("activityType") String activityType);
}

