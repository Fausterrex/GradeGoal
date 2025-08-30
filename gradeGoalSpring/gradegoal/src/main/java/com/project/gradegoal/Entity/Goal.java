package com.project.gradegoal.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "goals")
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String uid; // User ID who owns this goal

    @Column(nullable = false)
    private String courseId; // Course ID this goal belongs to

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double targetGrade; // Target grade as percentage

    @Column(nullable = false)
    private String targetDate;

    @Column(nullable = false)
    private String status; // active, completed, failed

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    // No-argument constructor (REQUIRED by JPA/Spring Boot)
    public Goal() {}

    public Goal(String uid, String courseId, String name, String description, Double targetGrade, String targetDate, String status) {
        this.uid = uid;
        this.courseId = courseId;
        this.name = name;
        this.description = description;
        this.targetGrade = targetGrade;
        this.targetDate = targetDate;
        this.status = status;
        this.createdAt = new java.util.Date().toString();
        this.updatedAt = new java.util.Date().toString();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getTargetGrade() { return targetGrade; }
    public void setTargetGrade(Double targetGrade) { this.targetGrade = targetGrade; }
    
    public String getTargetDate() { return targetDate; }
    public void setTargetDate(String targetDate) { this.targetDate = targetDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
