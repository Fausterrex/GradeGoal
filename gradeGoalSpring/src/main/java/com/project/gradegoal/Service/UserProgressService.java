package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Repository.UserProgressRepository;
import com.project.gradegoal.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class UserProgressService {
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
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
        checkLevelUp(progress);
        
        // Update last activity date
        progress.setLastActivityDate(LocalDate.now());
        
        return userProgressRepository.save(progress);
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
     */
    private void checkLevelUp(UserProgress progress) {
        Integer totalPoints = progress.getTotalPoints();
        Integer currentLevel = progress.getCurrentLevel();
        
        // Calculate required points for next level (simple formula: level * 100)
        Integer requiredPoints = currentLevel * 100;
        
        if (totalPoints >= requiredPoints) {
            // Level up
            progress.setCurrentLevel(currentLevel + 1);
            progress.setPointsToNextLevel((currentLevel + 1) * 100);
            
            // Award bonus points for leveling up
            progress.setTotalPoints(totalPoints + 50);
        } else {
            // Update points to next level
            progress.setPointsToNextLevel(requiredPoints - totalPoints);
        }
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
}
