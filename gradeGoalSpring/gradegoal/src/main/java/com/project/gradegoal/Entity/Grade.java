package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "grades")
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double maxScore;

    @Column
    private Double score; // Can be null if score not yet entered

    @Column(nullable = false)
    private String date;

    @Column
    private String assessmentType; // assignment, quiz, exam, project, participation, other

    @Column(nullable = false)
    private Boolean isExtraCredit;

    @Column(nullable = false)
    private Double extraCreditPoints;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    @Transient // This field is not persisted to the database
    private Long categoryId;

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    // No-argument constructor (REQUIRED by JPA/Spring Boot)
    public Grade() {}

    public Grade(String name, Double maxScore, Double score, String date, String assessmentType, 
                 Boolean isExtraCredit, Double extraCreditPoints, Category category) {
        this.name = name;
        this.maxScore = maxScore;
        this.score = score;
        this.date = date;
        this.assessmentType = assessmentType;
        this.isExtraCredit = isExtraCredit;
        this.extraCreditPoints = extraCreditPoints;
        this.category = category;
        this.createdAt = new java.util.Date().toString();
        this.updatedAt = new java.util.Date().toString();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
    
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    
    public Boolean getIsExtraCredit() { return isExtraCredit; }
    public void setIsExtraCredit(Boolean isExtraCredit) { this.isExtraCredit = isExtraCredit; }
    
    public Double getExtraCreditPoints() { return extraCreditPoints; }
    public void setExtraCreditPoints(Double extraCreditPoints) { this.extraCreditPoints = extraCreditPoints; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
