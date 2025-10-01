package com.project.gradegoal.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.gradegoal.Entity.*;
import com.project.gradegoal.Repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AchievementService {
    
    private static final Logger logger = LoggerFactory.getLogger(AchievementService.class);
    
    @Autowired
    private AchievementRepository achievementRepository;
    
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private GradeRepository gradeRepository;
    
    @Autowired
    private AcademicGoalRepository academicGoalRepository;
    
    @Autowired
    private UserActivityLogRepository userActivityLogRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserProgressService userProgressService;
    
    @Autowired
    private UserRepository userRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Check all achievements for a user and award any newly unlocked ones
     * @param userId the user ID
     */
    @Transactional
    public List<Achievement> checkAndAwardAchievements(Long userId) {
        logger.info("Checking achievements for user: {}", userId);
        
        List<Achievement> activeAchievements = achievementRepository.findByIsActiveTrue();
        List<Achievement> newlyUnlocked = new ArrayList<>();
        
        for (Achievement achievement : activeAchievements) {
            // Skip if user already has this achievement
            if (userAchievementRepository.existsByUserIdAndAchievementId(userId, achievement.getAchievementId())) {
                continue;
            }
            
            // Check if criteria is met
            if (checkAchievementCriteria(userId, achievement)) {
                awardAchievement(userId, achievement);
                newlyUnlocked.add(achievement);
            }
        }
        
        return newlyUnlocked;
    }
    
    /**
     * Check if a specific achievement criteria is met
     * @param userId the user ID
     * @param achievement the achievement to check
     * @return true if criteria is met
     */
    public boolean checkAchievementCriteria(Long userId, Achievement achievement) {
        try {
            Map<String, Object> criteria = objectMapper.readValue(
                achievement.getUnlockCriteria(), 
                new TypeReference<Map<String, Object>>() {}
            );
            
            return evaluateCriteria(userId, criteria, achievement.getCategory());
            
        } catch (Exception e) {
            logger.error("Error checking achievement criteria for: {}", achievement.getAchievementName(), e);
            return false;
        }
    }
    
    /**
     * Evaluate achievement criteria based on type
     */
    private boolean evaluateCriteria(Long userId, Map<String, Object> criteria, Achievement.AchievementCategory category) {
        
        // Level-based criteria
        if (criteria.containsKey("level_reached")) {
            return checkLevelReached(userId, getIntValue(criteria.get("level_reached")));
        }
        
        // Total points criteria
        if (criteria.containsKey("total_points")) {
            return checkTotalPoints(userId, getIntValue(criteria.get("total_points")));
        }
        
        // Streak days criteria
        if (criteria.containsKey("streak_days")) {
            return checkStreakDays(userId, getIntValue(criteria.get("streak_days")));
        }
        
        // Goals created criteria
        if (criteria.containsKey("goals_created")) {
            return checkGoalsCreated(userId, getIntValue(criteria.get("goals_created")));
        }
        
        // Goals achieved criteria
        if (criteria.containsKey("goals_achieved")) {
            return checkGoalsAchieved(userId, getIntValue(criteria.get("goals_achieved")));
        }
        
        // Semester goal achieved criteria
        if (criteria.containsKey("semester_goal_achieved")) {
            return checkSemesterGoalAchieved(userId, criteria);
        }
        
        // Grade threshold criteria
        if (criteria.containsKey("grade_threshold")) {
            return checkGradeThreshold(userId, getDoubleValue(criteria.get("grade_threshold")));
        }
        
        // GPA threshold criteria
        if (criteria.containsKey("gpa_threshold")) {
            return checkGPAThreshold(userId, getDoubleValue(criteria.get("gpa_threshold")));
        }
        
        // Semester GPA threshold criteria
        if (criteria.containsKey("semester_gpa_threshold")) {
            return checkSemesterGPAThreshold(userId, getDoubleValue(criteria.get("semester_gpa_threshold")));
        }
        
        // Grade improvement criteria
        if (criteria.containsKey("grade_improvement")) {
            return checkGradeImprovement(userId, getDoubleValue(criteria.get("grade_improvement")));
        }
        
        // GPA improvement criteria
        if (criteria.containsKey("gpa_improvement") || criteria.containsKey("semester_gpa_improvement")) {
            double improvementNeeded = getDoubleValue(criteria.getOrDefault("gpa_improvement", 
                criteria.getOrDefault("semester_gpa_improvement", 0.0)));
            return checkGPAImprovement(userId, improvementNeeded);
        }
        
        // Grades entered criteria
        if (criteria.containsKey("grades_entered")) {
            return checkGradesEntered(userId, getIntValue(criteria.get("grades_entered")));
        }
        
        // Profile complete criteria
        if (criteria.containsKey("action") && "profile_complete".equals(criteria.get("action"))) {
            return checkProfileComplete(userId);
        }
        
        // Perfect score criteria
        if (criteria.containsKey("perfect_score")) {
            return checkPerfectScore(userId);
        }
        
        // Activity-based criteria
        if (criteria.containsKey("total_login_days")) {
            return checkTotalLoginDays(userId, getIntValue(criteria.get("total_login_days")));
        }
        
        // Years active criteria
        if (criteria.containsKey("years_active")) {
            return checkYearsActive(userId, getIntValue(criteria.get("years_active")));
        }
        
        // All categories mastery
        if (criteria.containsKey("all_categories")) {
            return checkAllCategoriesMastery(userId);
        }
        
        // Achievement count criteria
        if (criteria.containsKey("achievements_earned")) {
            return checkAchievementsEarned(userId, getIntValue(criteria.get("achievements_earned")));
        }
        
        return false;
    }
    
    // Criteria checking methods
    
    private boolean checkLevelReached(Long userId, int requiredLevel) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        return progress != null && progress.getCurrentLevel() >= requiredLevel;
    }
    
    private boolean checkTotalPoints(Long userId, int requiredPoints) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        return progress != null && progress.getTotalPoints() >= requiredPoints;
    }
    
    private boolean checkStreakDays(Long userId, int requiredStreak) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        return progress != null && progress.getStreakDays() >= requiredStreak;
    }
    
    private boolean checkGoalsCreated(Long userId, int requiredCount) {
        long count = academicGoalRepository.countByUserId(userId);
        return count >= requiredCount;
    }
    
    private boolean checkGoalsAchieved(Long userId, int requiredCount) {
        long count = academicGoalRepository.countByUserIdAndIsAchieved(userId, true);
        return count >= requiredCount;
    }
    
    private boolean checkSemesterGoalAchieved(Long userId, Map<String, Object> criteria) {
        // Check if user has achieved a semester goal with specific GPA target
        Double targetValue = getDoubleValue(criteria.getOrDefault("target_value", 0.0));
        
        List<AcademicGoal> achievedGoals = academicGoalRepository
            .findByUserIdAndIsAchievedOrderByAchievedDateDesc(userId, true);
        
        for (AcademicGoal goal : achievedGoals) {
            if (goal.getTargetValue() != null && 
                goal.getTargetValue().doubleValue() >= targetValue &&
                goal.getCourseId() == null) { // Semester goal (not course-specific)
                return true;
            }
        }
        
        return false;
    }
    
    private boolean checkGradeThreshold(Long userId, double threshold) {
        List<Grade> grades = gradeRepository.findByUserIdOrderByDateDesc(userId);
        return grades.stream()
            .anyMatch(grade -> grade.getPercentageScore() != null && 
                              grade.getPercentageScore().doubleValue() >= threshold);
    }
    
    private boolean checkGPAThreshold(Long userId, double threshold) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        return progress != null && progress.getCumulativeGpa() != null && 
               progress.getCumulativeGpa() >= threshold;
    }
    
    private boolean checkSemesterGPAThreshold(Long userId, double threshold) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        return progress != null && progress.getSemesterGpa() != null && 
               progress.getSemesterGpa() >= threshold;
    }
    
    private boolean checkGradeImprovement(Long userId, double improvementNeeded) {
        List<Grade> grades = gradeRepository.findByUserIdOrderByDateDesc(userId);
        
        if (grades.size() < 2) return false;
        
        for (int i = 0; i < grades.size() - 1; i++) {
            Grade newer = grades.get(i);
            Grade older = grades.get(i + 1);
            
            if (newer.getAssessmentId().equals(older.getAssessmentId()) &&
                newer.getPercentageScore() != null && older.getPercentageScore() != null) {
                double improvement = newer.getPercentageScore().doubleValue() - older.getPercentageScore().doubleValue();
                if (improvement >= improvementNeeded) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    private boolean checkGPAImprovement(Long userId, double improvementNeeded) {
        UserProgress progress = userProgressRepository.findByUserId(userId);
        if (progress == null) return false;
        
        // This would need historical GPA tracking - simplified for now
        // Check if current semester GPA is higher than cumulative by threshold
        if (progress.getSemesterGpa() != null && progress.getCumulativeGpa() != null) {
            double improvement = progress.getSemesterGpa() - progress.getCumulativeGpa();
            return improvement >= improvementNeeded;
        }
        
        return false;
    }
    
    private boolean checkGradesEntered(Long userId, int requiredCount) {
        long count = gradeRepository.countByUserId(userId);
        return count >= requiredCount;
    }
    
    private boolean checkProfileComplete(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        
        User user = userOpt.get();
        return user.getEmail() != null && !user.getEmail().isEmpty() &&
               user.getFirstName() != null && !user.getFirstName().isEmpty() &&
               user.getLastName() != null && !user.getLastName().isEmpty();
    }
    
    private boolean checkPerfectScore(Long userId) {
        List<Grade> grades = gradeRepository.findByUserIdOrderByDateDesc(userId);
        return grades.stream()
            .anyMatch(grade -> grade.getPercentageScore() != null && 
                              grade.getPercentageScore().doubleValue() >= 100.0);
    }
    
    private boolean checkTotalLoginDays(Long userId, int requiredDays) {
        // This would need login tracking - simplified for now
        long activityCount = userActivityLogRepository.countByUserId(userId);
        return activityCount >= requiredDays;
    }
    
    private boolean checkYearsActive(Long userId, int requiredYears) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        
        LocalDateTime createdAt = userOpt.get().getCreatedAt();
        if (createdAt == null) return false;
        
        long yearsSinceCreation = ChronoUnit.YEARS.between(createdAt, LocalDateTime.now());
        return yearsSinceCreation >= requiredYears;
    }
    
    private boolean checkAllCategoriesMastery(Long userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        Set<Achievement.AchievementCategory> earnedCategories = new HashSet<>();
        
        for (UserAchievement ua : userAchievements) {
            Optional<Achievement> achOpt = achievementRepository.findById(ua.getAchievementId());
            achOpt.ifPresent(achievement -> earnedCategories.add(achievement.getCategory()));
        }
        
        return earnedCategories.size() >= Achievement.AchievementCategory.values().length;
    }
    
    private boolean checkAchievementsEarned(Long userId, int requiredCount) {
        long count = userAchievementRepository.countByUserId(userId);
        return count >= requiredCount;
    }
    
    /**
     * Award an achievement to a user
     */
    @Transactional
    public void awardAchievement(Long userId, Achievement achievement) {
        // Create user achievement record
        UserAchievement userAchievement = new UserAchievement();
        userAchievement.setUserId(userId);
        userAchievement.setAchievementId(achievement.getAchievementId());
        userAchievement.setEarnedAt(LocalDateTime.now());
        userAchievementRepository.save(userAchievement);
        
        // Award points to user and check for level up
        UserProgressService.LevelUpResult levelUpResult = userProgressService.awardPointsWithLevelUpCheck(userId, achievement.getPointsValue());
        
        // If user leveled up, check for additional achievements
        if (levelUpResult.isLeveledUp()) {
            logger.info("User {} leveled up to level {} after earning achievement '{}'", 
                userId, levelUpResult.getProgress().getCurrentLevel(), achievement.getAchievementName());
            
            // Check for level-based achievements
            try {
                List<Achievement> newAchievements = checkAndAwardAchievements(userId);
                if (!newAchievements.isEmpty()) {
                    logger.info("User {} earned {} additional achievements after leveling up", userId, newAchievements.size());
                }
            } catch (Exception e) {
                logger.error("Error checking achievements after level up for user {}", userId, e);
            }
        }
        
        // Send notifications based on rarity
        notificationService.sendAchievementNotification(userId, achievement);
        
        logger.info("Awarded achievement '{}' to user {}", achievement.getAchievementName(), userId);
    }
    
    /**
     * Get all achievements for a user
     */
    public List<Map<String, Object>> getUserAchievements(Long userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        
        return userAchievements.stream().map(ua -> {
            Map<String, Object> achievementData = new HashMap<>();
            Optional<Achievement> achOpt = achievementRepository.findById(ua.getAchievementId());
            
            achOpt.ifPresent(achievement -> {
                achievementData.put("achievementId", achievement.getAchievementId());
                achievementData.put("name", achievement.getAchievementName());
                achievementData.put("description", achievement.getDescription());
                achievementData.put("category", achievement.getCategory());
                achievementData.put("rarity", achievement.getRarity());
                achievementData.put("points", achievement.getPointsValue());
                achievementData.put("earnedAt", ua.getEarnedAt());
            });
            
            return achievementData;
        }).collect(Collectors.toList());
    }
    
    /**
     * Get all available achievements (locked and unlocked)
     */
    public List<Map<String, Object>> getAllAchievementsWithProgress(Long userId) {
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();
        Set<Integer> earnedIds = userAchievementRepository.findByUserId(userId)
            .stream()
            .map(UserAchievement::getAchievementId)
            .collect(Collectors.toSet());
        
        return allAchievements.stream().map(achievement -> {
            Map<String, Object> data = new HashMap<>();
            data.put("achievementId", achievement.getAchievementId());
            data.put("name", achievement.getAchievementName());
            data.put("description", achievement.getDescription());
            data.put("category", achievement.getCategory());
            data.put("rarity", achievement.getRarity());
            data.put("points", achievement.getPointsValue());
            data.put("unlocked", earnedIds.contains(achievement.getAchievementId()));
            
            return data;
        }).collect(Collectors.toList());
    }
    
    // Helper methods
    
    private int getIntValue(Object value) {
        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof String) {
            return Integer.parseInt((String) value);
        }
        return 0;
    }
    
    private double getDoubleValue(Object value) {
        if (value instanceof Double) {
            return (Double) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        } else if (value instanceof String) {
            return Double.parseDouble((String) value);
        }
        return 0.0;
    }
}

