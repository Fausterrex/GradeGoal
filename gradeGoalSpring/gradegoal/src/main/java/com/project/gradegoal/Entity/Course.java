package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String uid; // User ID who owns this course

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gradingScale; // percentage, gpa, points

    @Column(nullable = false)
    private Double maxPoints;

    @Column
    private String gpaScale; // 4.0, 5.0, etc.

    @Column
    private String termSystem; // 3-term, 4-term, etc.

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("course")
    private List<Category> categories;

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    // No-argument constructor (REQUIRED by JPA/Spring Boot)
    public Course() {}

    public Course(String uid, String name, String gradingScale, Double maxPoints, String gpaScale, String termSystem) {
        this.uid = uid;
        this.name = name;
        this.gradingScale = gradingScale;
        this.maxPoints = maxPoints;
        this.gpaScale = gpaScale;
        this.termSystem = termSystem;
        this.createdAt = new java.util.Date().toString();
        this.updatedAt = new java.util.Date().toString();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getGradingScale() { return gradingScale; }
    public void setGradingScale(String gradingScale) { this.gradingScale = gradingScale; }
    
    public Double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(Double maxPoints) { this.maxPoints = maxPoints; }
    
    public String getGpaScale() { return gpaScale; }
    public void setGpaScale(String gpaScale) { this.gpaScale = gpaScale; }
    
    public String getTermSystem() { return termSystem; }
    public void setTermSystem(String termSystem) { this.termSystem = termSystem; }
    
    public List<Category> getCategories() { return categories; }
    public void setCategories(List<Category> categories) { this.categories = categories; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
