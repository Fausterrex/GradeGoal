package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Entity.UserAchievement;
import com.project.gradegoal.Entity.Achievement;
import com.project.gradegoal.Repository.UserProgressRepository;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.UserAchievementRepository;
import com.project.gradegoal.Repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class UserProgressService {
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    
    @Autowired
    private AchievementRepository achievementRepository;
    
    
    /**
     * Get user progress by user ID
     * @param userId the user ID
     * @return UserProgress entity
     * @throws RuntimeException if user not found or progress not found
     */
    public UserProgress getUserProgress(Long userId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        // Try to find existing progress
        UserProgress existingProgress = userProgressRepository.findByUserId(userId);
        
        if (existingProgress != null) {
            return existingProgress;
        }
        
        // Create new progress if not found
        UserProgress newProgress = new UserProgress(userId);
        newProgress.setLastActivityDate(LocalDate.now());
        return userProgressRepository.save(newProgress);
    }
    
    /**
     * Update user progress
     * @param userId the user ID
     * @param progressData the progress data to update
     * @return Updated UserProgress entity
     * @throws RuntimeException if user not found
     */
    public UserProgress updateUserProgress(Long userId, UserProgress progressData) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        
        // Find existing progress or create new one
        UserProgress existingProgress = userProgressRepository.findByUserId(userId);
        
        if (existingProgress != null) {
            // Update existing progress
            existingProgress.setTotalPoints(progressData.getTotalPoints());
            existingProgress.setCurrentLevel(progressData.getCurrentLevel());
            existingProgress.setPointsToNextLevel(progressData.getPointsToNextLevel());
            existingProgress.setStreakDays(progressData.getStreakDays());
            existingProgress.setLastActivityDate(progressData.getLastActivityDate());
            existingProgress.setSemesterGpa(progressData.getSemesterGpa());
            existingProgress.setCumulativeGpa(progressData.getCumulativeGpa());
            
            return userProgressRepository.save(existingProgress);
        } else {
            // Create new progress
            progressData.setUserId(userId);
            progressData.setLastActivityDate(LocalDate.now());
            return userProgressRepository.save(progressData);
        }
    }
    
    /**
     * Award points to user and check for level up
     * @param userId the user ID
     * @param points the points to award
     * @return Updated UserProgress entity
     */
    public UserProgress awardPoints(Long userId, Integer points) {
        UserProgress progress = getUserProgress(userId);
        
        // Update total points
        progress.setTotalPoints(progress.getTotalPoints() + points);
        
        // Check for level up
        boolean leveledUp = checkLevelUp(progress);
        
        // Update last activity date
        progress.setLastActivityDate(LocalDate.now());
        
        return userProgressRepository.save(progress);
    }
    
    /**
     * Award points to user and check for level up, returning level up status
     * @param userId the user ID
     * @param points the points to award
     * @return LevelUpResult containing progress and level up status
     */
    public LevelUpResult awardPointsWithLevelUpCheck(Long userId, Integer points) {
        UserProgress progress = getUserProgress(userId);
        
        // Update total points
        progress.setTotalPoints(progress.getTotalPoints() + points);
        
        // Check for level up
        boolean leveledUp = checkLevelUp(progress);
        
        // Update last activity date
        progress.setLastActivityDate(LocalDate.now());
        
        UserProgress savedProgress = userProgressRepository.save(progress);
        
        return new LevelUpResult(savedProgress, leveledUp);
    }
    
    /**
     * Update user GPA
     * @param userId the user ID
     * @param semesterGpa the semester GPA
     * @param cumulativeGpa the cumulative GPA
     * @return Updated UserProgress entity
     */
    public UserProgress updateUserGPA(Long userId, Double semesterGpa, Double cumulativeGpa) {
        UserProgress progress = getUserProgress(userId);
        
        progress.setSemesterGpa(semesterGpa);
        progress.setCumulativeGpa(cumulativeGpa);
        progress.setLastActivityDate(LocalDate.now());
        
        return userProgressRepository.save(progress);
    }
    
    /**
     * Check if user should level up and update accordingly
     * @param progress the user progress
     * @return true if user leveled up
     */
    private boolean checkLevelUp(UserProgress progress) {
        Integer totalPoints = progress.getTotalPoints();
        Integer currentLevel = progress.getCurrentLevel();
        
        // Calculate required points for next level using progressive formula
        Integer requiredPoints = calculatePointsRequiredForLevel(currentLevel + 1);
        
        if (totalPoints >= requiredPoints) {
            // Level up
            progress.setCurrentLevel(currentLevel + 1);
            progress.setPointsToNextLevel(calculatePointsRequiredForLevel(currentLevel + 2) - totalPoints);
            
            // Award bonus points for leveling up
            progress.setTotalPoints(totalPoints + 50);
            
            return true; // User leveled up
        } else {
            // Update points to next level
            progress.setPointsToNextLevel(requiredPoints - totalPoints);
            return false; // No level up
        }
    }
    
    /**
     * Calculate points required to reach a specific level using progressive formula
     * New formula: level * 100 + (level - 1) * 50 for level >= 0
     * This creates a more reasonable progression starting from level 0:
     * Level 0: 0 points (starting level)
     * Level 1: 100 points
     * Level 2: 250 points  
     * Level 3: 400 points
     * Level 4: 550 points
     * Level 5: 700 points
     * Level 10: 1,450 points
     * Level 20: 2,950 points
     * Level 50: 7,450 points
     * Level 100: 14,950 points
     * @param level the target level
     * @return points required to reach that level
     */
    public Integer calculatePointsRequiredForLevel(Integer level) {
        if (level <= 0) return 0;
        return level * 100 + (level - 1) * 50;
    }
    
    /**
     * Get user's recent achievements (limited to specified count)
     * @param userId User ID
     * @param limit Maximum number of achievements to return
     * @return List of recent achievements with details
     */
    public List<Map<String, Object>> getRecentAchievements(Long userId, Integer limit) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserIdOrderByEarnedAtDesc(userId);
        
        return userAchievements.stream()
            .limit(limit)
            .map(ua -> {
                Achievement achievement = achievementRepository.findById(ua.getAchievementId()).orElse(null);
                if (achievement != null) {
                    Map<String, Object> achievementData = new HashMap<>();
                    achievementData.put("userAchievementId", ua.getUserAchievementId());
                    achievementData.put("achievementId", achievement.getAchievementId());
                    achievementData.put("name", achievement.getAchievementName());
                    achievementData.put("description", achievement.getDescription());
                    achievementData.put("category", achievement.getCategory());
                    achievementData.put("rarity", achievement.getRarity());
                    achievementData.put("points", achievement.getPointsValue());
                    achievementData.put("earnedAt", ua.getEarnedAt());
                    achievementData.put("iconUrl", achievement.getIconUrl());
                    return achievementData;
                }
                return null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user rank title based on level
     * @param level the user's current level
     * @return rank title
     */
    public String getUserRankTitle(Integer level) {
        if (level == null || level < 0) return "Newcomer";
        
        if (level == 0) return "Newcomer";
        if (level >= 1 && level <= 4) return "Beginner Scholar";
        if (level >= 5 && level <= 9) return "Rising Scholar";
        if (level >= 10 && level <= 14) return "Dedicated Student";
        if (level >= 15 && level <= 19) return "Academic Achiever";
        if (level >= 20 && level <= 24) return "Honor Student";
        if (level >= 25 && level <= 29) return "Excellence Scholar";
        if (level >= 30 && level <= 34) return "Distinguished Scholar";
        if (level >= 35 && level <= 39) return "Elite Academic";
        if (level >= 40 && level <= 44) return "Master Scholar";
        if (level >= 45 && level <= 49) return "Academic Virtuoso";
        if (level >= 50 && level <= 59) return "GradeGoal Expert";
        if (level >= 60 && level <= 69) return "Academic Legend";
        if (level >= 70 && level <= 79) return "GradeGoal Master";
        if (level >= 80 && level <= 89) return "Academic Grandmaster";
        if (level >= 90 && level <= 99) return "GradeGoal Champion";
        if (level >= 100) return "Ultimate Scholar";
        
        return "Beginner Scholar";
    }
    
    /**
     * Create or get user progress (used when user is created)
     * @param userId the user ID
     * @return UserProgress entity
     */
    public UserProgress createUserProgress(Long userId) {
        if (userProgressRepository.existsByUserId(userId)) {
            return userProgressRepository.findByUserId(userId);
        }
        
        UserProgress newProgress = new UserProgress(userId);
        newProgress.setLastActivityDate(LocalDate.now());
        return userProgressRepository.save(newProgress);
    }
    
    /**
     * Result class for level up operations
     */
    public static class LevelUpResult {
        private final UserProgress progress;
        private final boolean leveledUp;
        
        public LevelUpResult(UserProgress progress, boolean leveledUp) {
            this.progress = progress;
            this.leveledUp = leveledUp;
        }
        
        public UserProgress getProgress() {
            return progress;
        }
        
        public boolean isLeveledUp() {
            return leveledUp;
        }
    }
}
