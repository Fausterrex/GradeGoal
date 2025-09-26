package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Recommendation Entity
 * Represents AI-generated and system recommendations for users
 */
@Entity
@Table(name = "recommendations")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommendation_id")
    private Long recommendationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id")
    private Long courseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false)
    private RecommendationType recommendationType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority = Priority.MEDIUM;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_dismissed")
    private Boolean isDismissed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // AI-specific fields
    @Column(name = "ai_generated")
    private Boolean aiGenerated = false;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "ai_model", length = 100)
    private String aiModel;

    @Column(name = "ai_prompt_hash", length = 64)
    private String aiPromptHash;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    // Constructors
    public Recommendation() {}

    public Recommendation(Long userId, Long courseId, RecommendationType recommendationType, 
                         String title, String content, Priority priority) {
        this.userId = userId;
        this.courseId = courseId;
        this.recommendationType = recommendationType;
        this.title = title;
        this.content = content;
        this.priority = priority;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Long recommendationId) {
        this.recommendationId = recommendationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public RecommendationType getRecommendationType() {
        return recommendationType;
    }

    public void setRecommendationType(RecommendationType recommendationType) {
        this.recommendationType = recommendationType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getIsDismissed() {
        return isDismissed;
    }

    public void setIsDismissed(Boolean isDismissed) {
        this.isDismissed = isDismissed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getAiGenerated() {
        return aiGenerated;
    }

    public void setAiGenerated(Boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }

    public Double getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public String getAiModel() {
        return aiModel;
    }

    public void setAiModel(String aiModel) {
        this.aiModel = aiModel;
    }

    public String getAiPromptHash() {
        return aiPromptHash;
    }

    public void setAiPromptHash(String aiPromptHash) {
        this.aiPromptHash = aiPromptHash;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    // Enums
    public enum RecommendationType {
        STUDY_STRATEGY,
        GRADE_IMPROVEMENT,
        TIME_MANAGEMENT,
        GOAL_ADJUSTMENT,
        AI_ANALYSIS,
        PREDICTED_GRADE,
        ASSESSMENT_RECOMMENDATION,
        GOAL_PROBABILITY,
        STATUS_UPDATE,
        STUDY_HABITS
    }

    public enum Priority {
        HIGH,
        MEDIUM,
        LOW
    }

    @Override
    public String toString() {
        return "Recommendation{" +
                "recommendationId=" + recommendationId +
                ", userId=" + userId +
                ", courseId=" + courseId +
                ", recommendationType=" + recommendationType +
                ", title='" + title + '\'' +
                ", priority=" + priority +
                ", aiGenerated=" + aiGenerated +
                '}';
    }
}
