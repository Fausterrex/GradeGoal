package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Course Entity
 * 
 * Represents a course in the GradeGoal application.
 * This entity stores all course-related information including grading scales,
 * categories, and user preferences. Each course belongs to a specific user
 * and contains multiple categories for grade organization.
 * 
 * Key Features:
 * - User ownership and access control
 * - Flexible grading scale support (percentage, GPA, points)
 * - Category-based grade organization
 * - Course archiving functionality
 * - Custom color schemes for UI display
 * - Target grade tracking
 * 
 * Database Relationships:
 * - Many-to-One with User (via uid)
 * - One-to-Many with Category (via categories)
 * - One-to-Many with Goal (via courseId in Goal entity)
 * 
 * @author GradeGoal Development Team
 * @version 1.0.0
 * @since 2024
 */
@Entity
@Table(name = "courses")
public class Course {
    
    /**
     * Unique identifier for the course
     * Auto-generated primary key
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User ID who owns this course
     * References the Firebase UID of the course owner
     */
    @Column(nullable = false)
    private String uid;

    /**
     * Human-readable name of the course
     * Example: "Introduction to Computer Science"
     */
    @Column(nullable = false)
    private String name;

    /**
     * Course code identifier
     * Example: "CS101", "MATH201", "ENG101"
     */
    @Column
    private String courseCode;

    /**
     * Grading scale used for this course
     * Supported values: "percentage", "gpa", "points"
     */
    @Column(nullable = false)
    private String gradingScale;

    /**
     * Maximum possible points for the course
     * Used for points-based grading calculations
     */
    @Column(nullable = false)
    private Double maxPoints;

    /**
     * GPA scale configuration
     * Examples: "4.0", "5.0", "inverted-4.0", "inverted-5.0"
     */
    @Column
    private String gpaScale;

    /**
     * Term system for the course
     * Examples: "3-term", "4-term", "semester"
     */
    @Column
    private String termSystem;

    /**
     * Target grade for the course
     * Can be percentage, GPA, or points depending on grading scale
     */
    @Column
    private String targetGrade;

    /**
     * Units for the course (e.g., 3 units)
     * Represents the course load or academic units
     */
    @Column
    private Integer units = 3;

    /**
     * Credit hours for the course (e.g., 3 credit hours)
     * Used for GPA calculations and academic credit tracking
     */
    @Column
    private Integer creditHours = 3;

    /**
     * Color index for course display
     * Range: 0-9, used for consistent color schemes in UI
     */
    @Column
    private Integer colorIndex;

    /**
     * Whether the course is archived
     * Archived courses are hidden from main view but preserved
     */
    @Column
    private Boolean isArchived = false;

    /**
     * Timestamp when the course was archived
     * Null if course is not archived
     */
    @Column
    private String archivedAt;

    /**
     * List of categories within this course
     * Each category has a weight and contains multiple grades
     */
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("course")
    private List<Category> categories;

    /**
     * Timestamp when the course was created
     * Automatically set on course creation
     */
    @Column(nullable = false)
    private String createdAt;

    /**
     * Timestamp when the course was last updated
     * Automatically updated on any modification
     */
    @Column(nullable = false)
    private String updatedAt;

    /**
     * Default constructor required by JPA
     * Initializes default values for required fields
     */
    public Course() {}

    /**
     * Parameterized constructor for course creation
     * 
     * @param uid User ID who owns the course
     * @param name Course name
     * @param courseCode Course code identifier
     * @param gradingScale Grading scale type
     * @param maxPoints Maximum points for the course
     * @param gpaScale GPA scale configuration
     * @param termSystem Term system type
     * @param targetGrade Target grade for the course
     * @param units Course units (default: 3)
     * @param creditHours Course credit hours (default: 3)
     * @param colorIndex Color index for UI display
     */
    public Course(String uid, String name, String courseCode, String gradingScale, Double maxPoints, String gpaScale, String termSystem, String targetGrade, Integer units, Integer creditHours, Integer colorIndex) {
        this.uid = uid;
        this.name = name;
        this.courseCode = courseCode;
        this.gradingScale = gradingScale;
        this.maxPoints = maxPoints;
        this.gpaScale = gpaScale;
        this.termSystem = termSystem;
        this.targetGrade = targetGrade;
        this.units = units != null ? units : 3;
        this.creditHours = creditHours != null ? creditHours : 3;
        this.colorIndex = colorIndex != null ? colorIndex : 0;
        this.createdAt = new java.util.Date().toString();
        this.updatedAt = new java.util.Date().toString();
    }

    // Getters and Setters with JavaDoc

    /**
     * Get the course ID
     * @return Unique identifier for the course
     */
    public Long getId() { return id; }
    
    /**
     * Set the course ID
     * @param id Unique identifier for the course
     */
    public void setId(Long id) { this.id = id; }
    
    /**
     * Get the user ID who owns this course
     * @return Firebase UID of the course owner
     */
    public String getUid() { return uid; }
    
    /**
     * Set the user ID who owns this course
     * @param uid Firebase UID of the course owner
     */
    public void setUid(String uid) { this.uid = uid; }
    
    /**
     * Get the course name
     * @return Human-readable name of the course
     */
    public String getName() { return name; }
    
    /**
     * Set the course name
     * @param name Human-readable name of the course
     */
    public void setName(String name) { this.name = name; }
    
    /**
     * Get the course code
     * @return Course code identifier (e.g., CS101)
     */
    public String getCourseCode() { return courseCode; }
    
    /**
     * Set the course code
     * @param courseCode Course code identifier
     */
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    
    /**
     * Get the grading scale
     * @return Grading scale type (percentage, gpa, points)
     */
    public String getGradingScale() { return gradingScale; }
    
    /**
     * Set the grading scale
     * @param gradingScale Grading scale type
     */
    public void setGradingScale(String gradingScale) { this.gradingScale = gradingScale; }
    
    /**
     * Get the maximum points
     * @return Maximum possible points for the course
     */
    public Double getMaxPoints() { return maxPoints; }
    
    /**
     * Set the maximum points
     * @param maxPoints Maximum possible points for the course
     */
    public void setMaxPoints(Double maxPoints) { this.maxPoints = maxPoints; }
    
    /**
     * Get the GPA scale
     * @return GPA scale configuration
     */
    public String getGpaScale() { return gpaScale; }
    
    /**
     * Set the GPA scale
     * @param gpaScale GPA scale configuration
     */
    public void setGpaScale(String gpaScale) { this.gpaScale = gpaScale; }
    
    /**
     * Get the term system
     * @return Term system type
     */
    public String getTermSystem() { return termSystem; }
    
    /**
     * Set the term system
     * @param termSystem Term system type
     */
    public void setTermSystem(String termSystem) { this.termSystem = termSystem; }
    
    /**
     * Get the target grade
     * @return Target grade for the course
     */
    public String getTargetGrade() { return targetGrade; }
    
    /**
     * Set the target grade
     * @param targetGrade Target grade for the course
     */
    public void setTargetGrade(String targetGrade) { this.targetGrade = targetGrade; }
    
    /**
     * Get the course units
     * @return Course units (default: 3)
     */
    public Integer getUnits() { return units; }
    
    /**
     * Set the course units
     * @param units Course units
     */
    public void setUnits(Integer units) { this.units = units; }
    
    /**
     * Get the course credit hours
     * @return Course credit hours (default: 3)
     */
    public Integer getCreditHours() { return creditHours; }
    
    /**
     * Set the course credit hours
     * @param creditHours Course credit hours
     */
    public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }
    
    /**
     * Get the color index
     * @return Color index for UI display (0-9)
     */
    public Integer getColorIndex() { return colorIndex; }
    
    /**
     * Set the color index
     * @param colorIndex Color index for UI display (0-9)
     */
    public void setColorIndex(Integer colorIndex) { this.colorIndex = colorIndex; }
    
    /**
     * Check if the course is archived
     * @return True if the course is archived, false otherwise
     */
    public Boolean getIsArchived() { return isArchived; }
    
    /**
     * Set the archived status
     * @param isArchived Whether the course is archived
     */
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }
    
    /**
     * Get the archived timestamp
     * @return Timestamp when the course was archived, or null if not archived
     */
    public String getArchivedAt() { return archivedAt; }
    
    /**
     * Set the archived timestamp
     * @param archivedAt Timestamp when the course was archived
     */
    public void setArchivedAt(String archivedAt) { this.archivedAt = archivedAt; }
    
    /**
     * Get the list of categories
     * @return List of categories within this course
     */
    public List<Category> getCategories() { return categories; }
    
    /**
     * Set the list of categories
     * @param categories List of categories within this course
     */
    public void setCategories(List<Category> categories) { this.categories = categories; }
    
    /**
     * Get the creation timestamp
     * @return Timestamp when the course was created
     */
    public String getCreatedAt() { return createdAt; }
    
    /**
     * Set the creation timestamp
     * @param createdAt Timestamp when the course was created
     */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    /**
     * Get the last update timestamp
     * @return Timestamp when the course was last updated
     */
    public String getUpdatedAt() { return updatedAt; }
    
    /**
     * Set the last update timestamp
     * @param updatedAt Timestamp when the course was last updated
     */
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
