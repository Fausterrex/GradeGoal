package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_id")
    private Long gradeId;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "points_earned", precision = 8, scale = 2)
    private BigDecimal pointsEarned;

    @Column(name = "points_possible", precision = 8, scale = 2)
    private BigDecimal pointsPossible;

    @Column(name = "percentage_score", precision = 5, scale = 2)
    private BigDecimal percentageScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "score_type", nullable = false)
    private ScoreType scoreType;

    @Column(name = "grade_date")
    private LocalDate gradeDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_extra_credit")
    private Boolean isExtraCredit = false;

    @Column(name = "extra_credit_points", precision = 8, scale = 2)
    private BigDecimal extraCreditPoints;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", insertable = false, updatable = false)
    @JsonIgnoreProperties("grades")
    private Assessment assessment;

    public Grade() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.gradeDate = LocalDate.now();
    }

    public Grade(Long assessmentId, ScoreType scoreType) {
        this();
        this.assessmentId = assessmentId;
        this.scoreType = scoreType;
    }

    public Long getGradeId() { return gradeId; }
    public void setGradeId(Long gradeId) { this.gradeId = gradeId; }

    public Long getId() { return gradeId; }
    public void setId(Long id) { this.gradeId = id; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public BigDecimal getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(BigDecimal pointsEarned) { this.pointsEarned = pointsEarned; }

    public BigDecimal getPointsPossible() { return pointsPossible; }
    public void setPointsPossible(BigDecimal pointsPossible) { this.pointsPossible = pointsPossible; }

    public BigDecimal getPercentageScore() { return percentageScore; }
    public void setPercentageScore(BigDecimal percentageScore) { this.percentageScore = percentageScore; }

    public ScoreType getScoreType() { return scoreType; }
    public void setScoreType(ScoreType scoreType) { this.scoreType = scoreType; }

    public LocalDate getGradeDate() { return gradeDate; }
    public void setGradeDate(LocalDate gradeDate) { this.gradeDate = gradeDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getIsExtraCredit() { return isExtraCredit; }
    public void setIsExtraCredit(Boolean isExtraCredit) { this.isExtraCredit = isExtraCredit; }

    public BigDecimal getExtraCreditPoints() { return extraCreditPoints; }
    public void setExtraCreditPoints(BigDecimal extraCreditPoints) { this.extraCreditPoints = extraCreditPoints; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public Long getCategoryId() {
        return assessment != null ? assessment.getCategoryId() : null;
    }

    public void setCategoryId(Long categoryId) {

        if (assessment == null) {
            assessment = new Assessment();
        }
        assessment.setCategoryId(categoryId);
    }

    public AssessmentCategory getCategory() {

        return null;
    }

    public void setCategory(AssessmentCategory category) {

        if (assessment == null) {
            assessment = new Assessment();
        }
        if (category != null) {
            assessment.setCategoryId(category.getCategoryId());
        }
    }

    public String getName() {
        return assessment != null ? assessment.getAssessmentName() : null;
    }

    public void setName(String name) {
        if (assessment == null) {
            assessment = new Assessment();
        }
        assessment.setAssessmentName(name);
    }

    public BigDecimal getMaxScore() {
        return assessment != null ? assessment.getMaxPoints() : pointsPossible;
    }

    public void setMaxScore(BigDecimal maxScore) {
        if (assessment == null) {
            assessment = new Assessment();
        }
        assessment.setMaxPoints(maxScore);
        this.pointsPossible = maxScore;
    }

    public BigDecimal getScore() {
        return pointsEarned;
    }

    public void setScore(BigDecimal score) {
        this.pointsEarned = score;

        if (score != null && getMaxScore() != null && getMaxScore().compareTo(BigDecimal.ZERO) > 0) {
            this.percentageScore = score.divide(getMaxScore(), 4, java.math.RoundingMode.HALF_UP)
                                       .multiply(new BigDecimal("100"));
        }
    }

    public LocalDate getDate() {
        return gradeDate;
    }

    public void setDate(LocalDate date) {
        this.gradeDate = date;
    }

    public String getNote() {
        return notes;
    }

    public void setNote(String note) {
        this.notes = note;
    }

    public String getAssessmentType() {

        return "assignment";
    }

    public void setAssessmentType(String assessmentType) {

    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ScoreType {
        PERCENTAGE, POINTS
    }

    @Override
    public String toString() {
        return "Grade{" +
                "gradeId=" + gradeId +
                ", pointsEarned=" + pointsEarned +
                ", pointsPossible=" + pointsPossible +
                ", percentageScore=" + percentageScore +
                ", scoreType=" + scoreType +
                '}';
    }
}