package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester", nullable = false)
    private Semester semester;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "credit_hours", nullable = false)
    private Integer creditHours = 3;

    @Column(name = "target_grade", precision = 5, scale = 2)
    private BigDecimal targetGrade = new BigDecimal("93.00");

    @Column(name = "calculated_course_grade", precision = 5, scale = 2)
    private BigDecimal calculatedCourseGrade = new BigDecimal("0.00");

    @Column(name = "course_gpa", precision = 3, scale = 2)
    private BigDecimal courseGpa = new BigDecimal("0.00");

    @Column(name = "instructor_name")
    private String instructorName;

    @Column(name = "color_index")
    private Integer colorIndex = 0;

    @Column(name = "category_system")
    private String categorySystem = "3-categories";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("course")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<AcademicGoal> academicGoals;

    public Course() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Course(Long userId, String courseCode, String courseName, Semester semester, String academicYear) {
        this();
        this.userId = userId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.semester = semester;
        this.academicYear = academicYear;
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUid() { return userId; }
    public void setUid(Long uid) { this.userId = uid; }

    public Long getId() { return courseId; }
    public void setId(Long id) { this.courseId = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getName() { return courseName; }
    public void setName(String name) { this.courseName = name; }

    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getCreditHours() { return creditHours; }
    public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }

    public BigDecimal getTargetGrade() { return targetGrade; }
    public void setTargetGrade(BigDecimal targetGrade) { this.targetGrade = targetGrade; }

    public BigDecimal getCalculatedCourseGrade() { return calculatedCourseGrade; }
    public void setCalculatedCourseGrade(BigDecimal calculatedCourseGrade) { this.calculatedCourseGrade = calculatedCourseGrade; }

    public BigDecimal getCourseGpa() { return courseGpa; }
    public void setCourseGpa(BigDecimal courseGpa) { this.courseGpa = courseGpa; }

    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

    public Integer getColorIndex() { return colorIndex; }
    public void setColorIndex(Integer colorIndex) { this.colorIndex = colorIndex; }

    public String getCategorySystem() { return categorySystem; }
    public void setCategorySystem(String categorySystem) { this.categorySystem = categorySystem; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<AcademicGoal> getAcademicGoals() { return academicGoals; }
    public void setAcademicGoals(List<AcademicGoal> academicGoals) { this.academicGoals = academicGoals; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Semester {
        FIRST, SECOND, THIRD
    }

    @Override
    public String toString() {
        return "Course{" +
                "courseId=" + courseId +
                ", courseCode='" + courseCode + '\'' +
                ", courseName='" + courseName + '\'' +
                ", semester=" + semester +
                ", academicYear='" + academicYear + '\'' +
                '}';
    }
}