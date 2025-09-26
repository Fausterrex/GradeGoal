package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_assessment_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIAssessmentPrediction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;
    
    @Column(name = "predicted_score")
    private BigDecimal predictedScore;
    
    @Column(name = "predicted_percentage")
    private BigDecimal predictedPercentage;
    
    @Column(name = "predicted_gpa")
    private BigDecimal predictedGpa;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level")
    private ConfidenceLevel confidenceLevel = ConfidenceLevel.MEDIUM;
    
    @Column(name = "recommended_score")
    private BigDecimal recommendedScore;
    
    @Column(name = "recommended_percentage")
    private BigDecimal recommendedPercentage;
    
    @Column(name = "analysis_reasoning", columnDefinition = "TEXT")
    private String analysisReasoning;
    
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
    
    public enum ConfidenceLevel {
        HIGH, MEDIUM, LOW
    }
}
