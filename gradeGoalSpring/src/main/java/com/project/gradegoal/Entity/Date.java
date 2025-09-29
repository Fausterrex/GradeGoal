package com.project.gradegoal.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "assessments", schema = "gradegoal")
public class Date {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assessmentId;  // column: assessment_id

    @Column(name = "assessment_name")
    private String assessmentName;

    @Column(name = "due_date")
    private LocalDate dueDate;

    // getters & setters
    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public String getAssessmentName() { return assessmentName; }
    public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
