package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "achievement_id")
    private Integer achievementId;
    
    @Column(name = "achievement_name", nullable = false, unique = true)
    private String achievementName;
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "icon_url")
    private String iconUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AchievementCategory category;
    
    @Column(name = "points_value", nullable = false)
    private Integer pointsValue = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rarity")
    private AchievementRarity rarity = AchievementRarity.COMMON;
    
    @Column(name = "unlock_criteria", columnDefinition = "JSON")
    private String unlockCriteria;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum AchievementCategory {
        ACADEMIC, CONSISTENCY, IMPROVEMENT, GOAL, SOCIAL
    }
    
    public enum AchievementRarity {
        COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
    }
}

