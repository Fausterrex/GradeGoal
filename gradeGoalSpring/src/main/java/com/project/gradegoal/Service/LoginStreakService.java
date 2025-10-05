package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.UserProgress;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class LoginStreakService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    /**
     * Update user login streak when user logs in
     * @param userId the user ID
     * @return Updated streak information
     */
    public StreakInfo updateLoginStreak(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        UserProgress userProgress = userProgressRepository.findByUserId(userId);
        if (userProgress == null) {
            // Create new user progress if it doesn't exist
            userProgress = new UserProgress(userId);
            userProgress.setLastActivityDate(LocalDate.now());
            userProgress.setStreakDays(1);
            userProgressRepository.save(userProgress);
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDate lastActivityDate = userProgress.getLastActivityDate();
        
        // Update last login timestamp
        user.setLastLoginAt(now);
        userRepository.save(user);
        
        int newStreakDays = calculateStreakDays(lastActivityDate, today, userProgress.getStreakDays());
        
        // Update user progress
        userProgress.setStreakDays(newStreakDays);
        userProgress.setLastActivityDate(today);
        userProgressRepository.save(userProgress);
        
        return new StreakInfo(newStreakDays, today, lastActivityDate);
    }
    
    /**
     * Calculate streak days based on last activity and current date
     * @param lastActivityDate the last activity date
     * @param today today's date
     * @param currentStreakDays current streak days
     * @return calculated streak days
     */
    private int calculateStreakDays(LocalDate lastActivityDate, LocalDate today, int currentStreakDays) {
        if (lastActivityDate == null) {
            // First login - start streak
            return 1;
        }
        
        long daysBetween = ChronoUnit.DAYS.between(lastActivityDate, today);
        
        if (daysBetween == 0) {
            // Same day login - maintain current streak
            return currentStreakDays;
        } else if (daysBetween == 1) {
            // Consecutive day login - increment streak
            return currentStreakDays + 1;
        } else {
            // Gap in login - reset streak to 1
            return 1;
        }
    }
    
    /**
     * Get current streak information for a user
     * @param userId the user ID
     * @return StreakInfo object
     */
    public StreakInfo getStreakInfo(Long userId) {
        UserProgress userProgress = userProgressRepository.findByUserId(userId);
        if (userProgress == null) {
            return new StreakInfo(0, null, null);
        }
        
        return new StreakInfo(
            userProgress.getStreakDays(),
            userProgress.getLastActivityDate(),
            userProgress.getLastActivityDate()
        );
    }
    
    /**
     * Inner class to hold streak information
     */
    public static class StreakInfo {
        private final int streakDays;
        private final LocalDate lastActivityDate;
        private final LocalDate previousActivityDate;
        
        public StreakInfo(int streakDays, LocalDate lastActivityDate, LocalDate previousActivityDate) {
            this.streakDays = streakDays;
            this.lastActivityDate = lastActivityDate;
            this.previousActivityDate = previousActivityDate;
        }
        
        public int getStreakDays() {
            return streakDays;
        }
        
        public LocalDate getLastActivityDate() {
            return lastActivityDate;
        }
        
        public LocalDate getPreviousActivityDate() {
            return previousActivityDate;
        }
        
        public boolean isStreakActive() {
            if (lastActivityDate == null) return false;
            LocalDate today = LocalDate.now();
            long daysBetween = ChronoUnit.DAYS.between(lastActivityDate, today);
            return daysBetween <= 1; // Streak is active if last login was today or yesterday
        }
    }
}
