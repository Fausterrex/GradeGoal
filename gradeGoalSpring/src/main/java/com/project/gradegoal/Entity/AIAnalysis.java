package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_type", nullable = false)
    private AnalysisType analysisType = AnalysisType.COURSE_ANALYSIS;
    
    @Column(name = "analysis_data", columnDefinition = "JSON", nullable = false)
    private String analysisData;
    
    @Column(name = "ai_model", length = 100)
    private String aiModel = "gemini-2.0-flash-exp";
    
    @Column(name = "ai_confidence")
    private Double aiConfidence = 0.85;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    public enum AnalysisType {
        COURSE_ANALYSIS,
        ASSESSMENT_PREDICTION,
        GOAL_PROBABILITY
    }
}
