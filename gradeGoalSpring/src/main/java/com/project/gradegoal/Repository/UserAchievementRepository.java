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
}

