package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    
    @Id
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;
    
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 0;
    
    @Column(name = "points_to_next_level", nullable = false)
    private Integer pointsToNextLevel = 100;
    
    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;
    
    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;
    
    @Column(name = "semester_gpa")
    private Double semesterGpa = 0.00;
    
    @Column(name = "cumulative_gpa")
    private Double cumulativeGpa = 0.00;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @PrePersist
    @PreUpdate
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public UserProgress() {}
    
    public UserProgress(Long userId) {
        this.userId = userId;
        this.totalPoints = 0;
        this.currentLevel = 0;
        this.pointsToNextLevel = 100;
        this.streakDays = 0;
        this.semesterGpa = 0.00;
        this.cumulativeGpa = 0.00;
        this.lastActivityDate = LocalDate.now();
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Integer getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public Integer getCurrentLevel() {
        return currentLevel;
    }
    
    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }
    
    public Integer getPointsToNextLevel() {
        return pointsToNextLevel;
    }
    
    public void setPointsToNextLevel(Integer pointsToNextLevel) {
        this.pointsToNextLevel = pointsToNextLevel;
    }
    
    public Integer getStreakDays() {
        return streakDays;
    }
    
    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }
    
    public LocalDate getLastActivityDate() {
        return lastActivityDate;
    }
    
    public void setLastActivityDate(LocalDate lastActivityDate) {
        this.lastActivityDate = lastActivityDate;
    }
    
    public Double getSemesterGpa() {
        return semesterGpa;
    }
    
    public void setSemesterGpa(Double semesterGpa) {
        this.semesterGpa = semesterGpa;
    }
    
    public Double getCumulativeGpa() {
        return cumulativeGpa;
    }
    
    public void setCumulativeGpa(Double cumulativeGpa) {
        this.cumulativeGpa = cumulativeGpa;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
}
