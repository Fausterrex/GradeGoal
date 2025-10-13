package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    
    List<UserAchievement> findByUserId(Long userId);
    
    List<UserAchievement> findByUserIdOrderByEarnedAtDesc(Long userId);
    
    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Integer achievementId);
    
    boolean existsByUserIdAndAchievementId(Long userId, Integer achievementId);
    
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.userId = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * Count total achievements unlocked by all users
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua")
    long countTotalUnlocked();
    
    /**
     * Count achievements by rarity
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua JOIN Achievement a ON ua.achievementId = a.achievementId WHERE a.rarity = :rarity")
    long countByRarity(@Param("rarity") com.project.gradegoal.Entity.Achievement.AchievementRarity rarity);
    
    /**
     * Count unique users who have earned at least one achievement of a specific rarity
     */
    @Query("SELECT COUNT(DISTINCT ua.userId) FROM UserAchievement ua JOIN Achievement a ON ua.achievementId = a.achievementId WHERE a.rarity = :rarity")
    long countUniqueUsersByRarity(@Param("rarity") com.project.gradegoal.Entity.Achievement.AchievementRarity rarity);
    
    /**
     * Get achievement progress for a specific achievement
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.achievementId = :achievementId")
    long countByAchievementId(@Param("achievementId") Integer achievementId);
    
    /**
     * Count total unique users who have earned any achievement
     */
    @Query("SELECT COUNT(DISTINCT ua.userId) FROM UserAchievement ua")
    long countUniqueUsersWithAchievements();
}

