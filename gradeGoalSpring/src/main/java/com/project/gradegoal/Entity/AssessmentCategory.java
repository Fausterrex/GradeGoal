package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assessment_categories")
public class AssessmentCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "weight_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal weightPercentage;

    @Column(name = "order_sequence")
    private Integer orderSequence = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Cascade relationship for category deletion
    @OneToMany(mappedBy = "categoryId", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnoreProperties("category")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Assessment> assessments;

    public AssessmentCategory() {
        this.createdAt = LocalDateTime.now();
    }

    public AssessmentCategory(Long courseId, String categoryName, BigDecimal weightPercentage) {
        this();
        this.courseId = courseId;
        this.categoryName = categoryName;
        this.weightPercentage = weightPercentage;
    }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getId() { return categoryId; }
    public void setId(Long id) { this.categoryId = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public BigDecimal getWeightPercentage() { return weightPercentage; }
    public void setWeightPercentage(BigDecimal weightPercentage) { this.weightPercentage = weightPercentage; }

    public Integer getOrderSequence() { return orderSequence; }
    public void setOrderSequence(Integer orderSequence) { this.orderSequence = orderSequence; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Getter and setter for assessments
    public List<Assessment> getAssessments() { return assessments; }
    public void setAssessments(List<Assessment> assessments) { this.assessments = assessments; }

    @Override
    public String toString() {
        return "AssessmentCategory{" +
                "categoryId=" + categoryId +
                ", categoryName='" + categoryName + '\'' +
                ", weightPercentage=" + weightPercentage +
                '}';
    }
}
