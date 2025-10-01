package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAchievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_achievement_id")
    private Long userAchievementId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "achievement_id", nullable = false)
    private Integer achievementId;
    
    @Column(name = "earned_at")
    private LocalDateTime earnedAt = LocalDateTime.now();
    
    @Column(name = "earned_context")
    private String earnedContext;
}

