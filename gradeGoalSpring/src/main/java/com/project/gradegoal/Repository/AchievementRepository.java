package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Integer> {
    
    List<Achievement> findByIsActiveTrue();
    
    List<Achievement> findByCategory(Achievement.AchievementCategory category);
    
    Optional<Achievement> findByAchievementName(String achievementName);
}

