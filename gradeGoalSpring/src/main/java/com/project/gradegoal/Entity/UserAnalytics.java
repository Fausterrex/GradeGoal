package com.project.gradegoal.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_analytics")
public class UserAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analytics_id")
    private Long analyticsId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "analytics_date")
    private LocalDate analyticsDate;

    @Column(name = "current_grade", precision = 5, scale = 2)
    private BigDecimal currentGrade;

    @Column(name = "grade_trend", precision = 5, scale = 2)
    private BigDecimal gradeTrend;

    @Column(name = "assignments_completed")
    private Integer assignmentsCompleted;

    @Column(name = "assignments_pending")
    private Integer assignmentsPending;

    @Column(name = "study_hours_logged", precision = 5, scale = 2)
    private BigDecimal studyHoursLogged;

    @Column(name = "performance_metrics", columnDefinition = "JSON")
    private String performanceMetrics;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    // Constructors
    public UserAnalytics() {}

    public UserAnalytics(Long userId, Long courseId, LocalDate analyticsDate, 
                        BigDecimal currentGrade, BigDecimal gradeTrend,
                        Integer assignmentsCompleted, Integer assignmentsPending,
                        BigDecimal studyHoursLogged, String performanceMetrics) {
        this.userId = userId;
        this.courseId = courseId;
        this.analyticsDate = analyticsDate;
        this.currentGrade = currentGrade;
        this.gradeTrend = gradeTrend;
        this.assignmentsCompleted = assignmentsCompleted;
        this.assignmentsPending = assignmentsPending;
        this.studyHoursLogged = studyHoursLogged;
        this.performanceMetrics = performanceMetrics;
        this.calculatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getAnalyticsId() {
        return analyticsId;
    }

    public void setAnalyticsId(Long analyticsId) {
        this.analyticsId = analyticsId;
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

    public LocalDate getAnalyticsDate() {
        return analyticsDate;
    }

    public void setAnalyticsDate(LocalDate analyticsDate) {
        this.analyticsDate = analyticsDate;
    }

    public BigDecimal getCurrentGrade() {
        return currentGrade;
    }

    public void setCurrentGrade(BigDecimal currentGrade) {
        this.currentGrade = currentGrade;
    }

    public BigDecimal getGradeTrend() {
        return gradeTrend;
    }

    public void setGradeTrend(BigDecimal gradeTrend) {
        this.gradeTrend = gradeTrend;
    }

    public Integer getAssignmentsCompleted() {
        return assignmentsCompleted;
    }

    public void setAssignmentsCompleted(Integer assignmentsCompleted) {
        this.assignmentsCompleted = assignmentsCompleted;
    }

    public Integer getAssignmentsPending() {
        return assignmentsPending;
    }

    public void setAssignmentsPending(Integer assignmentsPending) {
        this.assignmentsPending = assignmentsPending;
    }

    public BigDecimal getStudyHoursLogged() {
        return studyHoursLogged;
    }

    public void setStudyHoursLogged(BigDecimal studyHoursLogged) {
        this.studyHoursLogged = studyHoursLogged;
    }

    public String getPerformanceMetrics() {
        return performanceMetrics;
    }

    public void setPerformanceMetrics(String performanceMetrics) {
        this.performanceMetrics = performanceMetrics;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    @Override
    public String toString() {
        return "UserAnalytics{" +
                "analyticsId=" + analyticsId +
                ", userId=" + userId +
                ", courseId=" + courseId +
                ", analyticsDate=" + analyticsDate +
                ", currentGrade=" + currentGrade +
                ", gradeTrend=" + gradeTrend +
                ", assignmentsCompleted=" + assignmentsCompleted +
                ", assignmentsPending=" + assignmentsPending +
                ", studyHoursLogged=" + studyHoursLogged +
                ", calculatedAt=" + calculatedAt +
                '}';
    }
}