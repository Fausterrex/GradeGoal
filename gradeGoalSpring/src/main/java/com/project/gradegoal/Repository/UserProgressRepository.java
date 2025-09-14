package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    
    /**
     * Find user progress by user ID
     * @param userId the user ID
     * @return UserProgress entity or null if not found
     */
    UserProgress findByUserId(Long userId);
    
    /**
     * Check if user progress exists for a given user ID
     * @param userId the user ID
     * @return true if exists, false otherwise
     */
    boolean existsByUserId(Long userId);

    // ========================================
    // DATABASE PROCEDURE CALLS
    // ========================================

    @Modifying
    @Query(value = "CALL AwardPoints(:userId, :points, :activityType)", nativeQuery = true)
    void awardPoints(@Param("userId") Long userId, @Param("points") Integer points, @Param("activityType") String activityType);

    @Modifying
    @Query(value = "CALL CheckUserAchievements(:userId)", nativeQuery = true)
    void checkUserAchievements(@Param("userId") Long userId);
}
