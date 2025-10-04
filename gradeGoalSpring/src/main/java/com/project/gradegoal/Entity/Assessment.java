package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long assessmentId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "assessment_name", nullable = false)
    private String assessmentName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_points", precision = 8, scale = 2, nullable = false)
    private BigDecimal maxPoints;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AssessmentStatus status = AssessmentStatus.UPCOMING;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester_term")
    private SemesterTerm semesterTerm = SemesterTerm.MIDTERM;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("assessment")
    private List<Grade> grades;

    // Transient fields for calendar display
    @Transient
    private String courseName;
    
    @Transient
    private String categoryName;

    public Assessment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Assessment(Long categoryId, String assessmentName, BigDecimal maxPoints) {
        this();
        this.categoryId = categoryId;
        this.assessmentName = assessmentName;
        this.maxPoints = maxPoints;
    }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getAssessmentName() { return assessmentName; }
    public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getMaxPoints() { return maxPoints; }
    public void setMaxPoints(BigDecimal maxPoints) { this.maxPoints = maxPoints; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public AssessmentStatus getStatus() { return status; }
    public void setStatus(AssessmentStatus status) { this.status = status; }

    public SemesterTerm getSemesterTerm() { return semesterTerm; }
    public void setSemesterTerm(SemesterTerm semesterTerm) { this.semesterTerm = semesterTerm; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Grade> getGrades() { return grades; }
    public void setGrades(List<Grade> grades) { this.grades = grades; }

    // Getters and setters for transient fields
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum AssessmentStatus {
        UPCOMING, COMPLETED, OVERDUE, CANCELLED
    }

    public enum SemesterTerm {
        MIDTERM, FINAL_TERM
    }

    @Override
    public String toString() {
        return "Assessment{" +
                "assessmentId=" + assessmentId +
                ", assessmentName='" + assessmentName + '\'' +
                ", maxPoints=" + maxPoints +
                ", status=" + status +
                '}';
    }
}
