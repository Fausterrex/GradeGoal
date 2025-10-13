package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Grade;
import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.GradeRepository;
import com.project.gradegoal.Repository.AssessmentRepository;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;

    @Transactional
    public Grade createGrade(Long assessmentId, Grade grade) {
        Optional<Assessment> assessmentOpt = assessmentRepository.findById(assessmentId);
        if (assessmentOpt.isPresent()) {
            Assessment assessment = assessmentOpt.get();
            grade.setAssessmentId(assessmentId);
            grade.setAssessment(assessment);
            Grade savedGrade = gradeRepository.save(grade);
            
            // Analytics are automatically handled by UpdateCourseGrades stored procedure
            // No need to call updateUserAnalytics separately
            
            return savedGrade;
        }
        throw new RuntimeException("Assessment not found with ID: " + assessmentId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByAssessmentId(Long assessmentId) {
        return gradeRepository.findByAssessmentId(assessmentId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByCategoryId(Long categoryId) {
        return gradeRepository.findGradesByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByCourseId(Long courseId) {
        return gradeRepository.findGradesByCourseId(courseId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByUserId(Long userId) {
        return gradeRepository.findGradesByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Grade> getGradeById(Long gradeId) {
        return gradeRepository.findById(gradeId);
    }

    @Transactional
    public Grade updateGrade(Grade grade) {
        Grade savedGrade = gradeRepository.save(grade);
        
        // Analytics are automatically handled by UpdateCourseGrades stored procedure
        // No need to call updateUserAnalytics separately
        
        return savedGrade;
    }

    @Transactional
    public Grade updateGradeFromFrontend(Long gradeId, Object gradeData) {
        try {

            Optional<Grade> existingGradeOpt = gradeRepository.findByIdWithAssessment(gradeId);
            if (!existingGradeOpt.isPresent()) {
                throw new RuntimeException("Grade not found with ID: " + gradeId);
            }

            Grade existingGrade = existingGradeOpt.get();

            String name = getMapValue(gradeData, "name", String.class);
            Double maxScore = getMapValue(gradeData, "maxScore", Double.class);
            Double score = getMapValue(gradeData, "score", Double.class);
            String date = getMapValue(gradeData, "date", String.class);
            String notes = getMapValue(gradeData, "note", String.class);
            Boolean isExtraCredit = getMapValue(gradeData, "isExtraCredit", Boolean.class);
            Double extraCreditPoints = getMapValue(gradeData, "extraCreditPoints", Double.class);

            if (score != null) {
                existingGrade.setPointsEarned(BigDecimal.valueOf(score));
                if (maxScore != null && maxScore > 0) {
                    existingGrade.setPercentageScore(BigDecimal.valueOf((score / maxScore) * 100));
                }
            }

            if (maxScore != null) {
                existingGrade.setPointsPossible(BigDecimal.valueOf(maxScore));
            }

            if (date != null) {
                existingGrade.setGradeDate(java.time.LocalDate.parse(date));
            }

            if (notes != null) {
                existingGrade.setNotes(notes);
            }

            if (isExtraCredit != null) {
                existingGrade.setIsExtraCredit(isExtraCredit);
            }

            if (extraCreditPoints != null) {
                existingGrade.setExtraCreditPoints(BigDecimal.valueOf(extraCreditPoints));
                if (isExtraCredit == null) {
                    existingGrade.setIsExtraCredit(extraCreditPoints > 0);
                }
            }

            if (existingGrade.getAssessment() != null) {
                if (name != null) {
                    existingGrade.getAssessment().setAssessmentName(name);
                }
                if (maxScore != null) {
                    existingGrade.getAssessment().setMaxPoints(BigDecimal.valueOf(maxScore));
                }
                if (date != null) {
                    existingGrade.getAssessment().setDueDate(java.time.LocalDate.parse(date));
                }
                existingGrade.getAssessment().setUpdatedAt(LocalDateTime.now());

                assessmentRepository.save(existingGrade.getAssessment());
            }

            existingGrade.setUpdatedAt(LocalDateTime.now());

            Grade savedGrade = gradeRepository.save(existingGrade);
            
            // Analytics will be created after course GPA calculation in the frontend flow

            if (existingGrade.getAssessment() != null) {
                boolean hasScore = savedGrade.getPointsEarned() != null &&
                                 savedGrade.getPointsEarned().compareTo(BigDecimal.ZERO) > 0;
                Assessment.AssessmentStatus newStatus = determineAssessmentStatus(
                    existingGrade.getAssessment().getDueDate(),
                    hasScore
                );

                existingGrade.getAssessment().setStatus(newStatus);
                existingGrade.getAssessment().setUpdatedAt(LocalDateTime.now());
                assessmentRepository.save(existingGrade.getAssessment());
            }

            // Analytics are automatically handled by UpdateCourseGrades stored procedure
            // No need to call updateUserAnalytics separately

            return savedGrade;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update grade from frontend: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean deleteGrade(Long gradeId) {
        if (gradeRepository.existsById(gradeId)) {
            Optional<Grade> gradeOpt = gradeRepository.findById(gradeId);
            if (gradeOpt.isPresent()) {
                Grade grade = gradeOpt.get();
                Long assessmentId = grade.getAssessmentId();
                
                gradeRepository.deleteById(gradeId);
                
                List<Grade> remainingGrades = gradeRepository.findByAssessmentId(assessmentId);
                if (remainingGrades.isEmpty()) {
                    // No more grades for this assessment - update status based on due date
                    try {
                        Optional<Assessment> assessmentOpt = assessmentService.getAssessmentById(assessmentId);
                        if (assessmentOpt.isPresent()) {
                            Assessment assessment = assessmentOpt.get();
                            LocalDate dueDate = assessment.getDueDate();
                            LocalDate today = LocalDate.now();
                            
                            String newStatus = (dueDate != null && dueDate.isBefore(today)) ? "OVERDUE" : "UPCOMING";
                            
                            // Update assessment status
                            assessment.setStatus(Assessment.AssessmentStatus.valueOf(newStatus));
                            assessmentService.updateAssessment(assessment);
                            
                            System.out.println("✅ Updated assessment " + assessmentId + " status to " + newStatus + " after grade deletion");
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to update assessment status after grade deletion: " + e.getMessage());
                        // Don't fail the entire operation if status update fails
                    }
                }
                
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Grade getLatestGradeForAssessment(Long assessmentId) {
        return gradeRepository.findTopByAssessmentIdOrderByGradeDateDesc(assessmentId);
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal getAverageGradeForAssessment(Long assessmentId) {
        return gradeRepository.getAverageGradeByAssessmentId(assessmentId);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesAboveThreshold(Long assessmentId, java.math.BigDecimal threshold) {
        return gradeRepository.findGradesAboveThreshold(assessmentId, threshold);
    }

    @Transactional(readOnly = true)
    public long countGradesByAssessmentId(Long assessmentId) {
        return gradeRepository.countByAssessmentId(assessmentId);
    }

    @Transactional(readOnly = true)
    public long countGradesByScoreType(Grade.ScoreType scoreType) {
        return gradeRepository.countByScoreType(scoreType);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByDate(java.time.LocalDate gradeDate) {
        return gradeRepository.findByGradeDate(gradeDate);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        return gradeRepository.findByGradeDateBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByScoreType(Grade.ScoreType scoreType) {
        return gradeRepository.findByScoreType(scoreType);
    }

    @Transactional(readOnly = true)
    public List<Grade> getGradesByExtraCreditStatus(Boolean isExtraCredit) {
        return gradeRepository.findByIsExtraCredit(isExtraCredit);
    }

    @Transactional
    public Grade createGrade(Grade grade) {

        return gradeRepository.save(grade);
    }

    @Deprecated
    @Transactional
    public Grade addGradeToCategory(Long categoryId, Grade grade) {

        throw new UnsupportedOperationException("This method is deprecated. Use createAssessmentAndGrade instead.");
    }

    @Transactional
    public Grade createAssessmentAndGrade(Object assessmentData, Object gradeData) {
        try {

            String name = getMapValue(assessmentData, "name", String.class);
            Double maxScore = getMapValue(assessmentData, "maxScore", Double.class);
            Long categoryId = getMapValue(assessmentData, "categoryId", Long.class);
            String date = getMapValue(assessmentData, "date", String.class);
            String semesterTerm = getMapValue(assessmentData, "semesterTerm", String.class);

            Double score = getMapValue(gradeData, "score", Double.class);
            String notes = getMapValue(gradeData, "note", String.class);
            Boolean isExtraCredit = getMapValue(gradeData, "isExtraCredit", Boolean.class);
            Double extraCreditPoints = getMapValue(gradeData, "extraCreditPoints", Double.class);

            if (categoryId == null) {
                throw new RuntimeException("categoryId is required but was null");
            }

            Optional<AssessmentCategory> category = assessmentCategoryRepository.findById(categoryId);
            if (!category.isPresent()) {
                throw new RuntimeException("AssessmentCategory with ID " + categoryId + " not found");
            }

            Assessment assessment = new Assessment();
            assessment.setAssessmentName(name);
            assessment.setMaxPoints(maxScore != null ? BigDecimal.valueOf(maxScore) : BigDecimal.ZERO);
            assessment.setCategoryId(categoryId);
            assessment.setSemesterTerm(semesterTerm != null ? Assessment.SemesterTerm.valueOf(semesterTerm) : Assessment.SemesterTerm.MIDTERM);

            if (date != null && !date.trim().isEmpty()) {
                try {
                    assessment.setDueDate(java.time.LocalDate.parse(date));
                } catch (Exception e) {

                }
            }

            assessment.setStatus(determineAssessmentStatus(assessment.getDueDate(), false));
            assessment.setCreatedAt(LocalDateTime.now());

            Assessment savedAssessment = assessmentRepository.save(assessment);
            
            // Send notification for newly created assessment
            sendAssessmentCreatedNotifications(savedAssessment, category.get());

            Grade grade = new Grade();
            grade.setAssessmentId(savedAssessment.getAssessmentId());
            grade.setAssessment(savedAssessment);
            grade.setScoreType(Grade.ScoreType.POINTS);
            grade.setPointsPossible(maxScore != null ? BigDecimal.valueOf(maxScore) : BigDecimal.ZERO);
            grade.setPointsEarned(score != null ? BigDecimal.valueOf(score) : null);
            grade.setPercentageScore(score != null && maxScore != null && maxScore > 0 ?
                BigDecimal.valueOf((score / maxScore) * 100) : BigDecimal.ZERO);
            grade.setNotes(notes);
            grade.setGradeDate(date != null ? java.time.LocalDate.parse(date) : java.time.LocalDate.now());
            grade.setCreatedAt(LocalDateTime.now());

            grade.setName(name);
            grade.setMaxScore(maxScore != null ? BigDecimal.valueOf(maxScore) : BigDecimal.ZERO);
            grade.setScore(score != null ? BigDecimal.valueOf(score) : BigDecimal.ZERO);
            grade.setDate(date != null ? java.time.LocalDate.parse(date) : java.time.LocalDate.now());
            grade.setNote(notes);
            grade.setIsExtraCredit(isExtraCredit != null ? isExtraCredit : false);
            grade.setExtraCreditPoints(extraCreditPoints != null ? BigDecimal.valueOf(extraCreditPoints) : null);
            grade.setSemesterTerm(semesterTerm != null ? Grade.SemesterTerm.valueOf(semesterTerm) : Grade.SemesterTerm.MIDTERM);

            Grade savedGrade = gradeRepository.save(grade);
            
            // Analytics are automatically handled by UpdateCourseGrades stored procedure
            // No need to call updateUserAnalytics separately
            
            return savedGrade;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create assessment and grade: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T getMapValue(Object obj, String field, Class<T> type) {
        try {
            if (obj instanceof java.util.Map) {
                java.util.Map<String, Object> map = (java.util.Map<String, Object>) obj;
                Object value = map.get(field);
                if (value == null) {
                    return null;
                }
                if (type.isAssignableFrom(value.getClass())) {
                    return (T) value;
                }

                if (type == Long.class && value instanceof Number) {
                    return (T) Long.valueOf(((Number) value).longValue());
                }
                if (type == Double.class && value instanceof Number) {
                    return (T) Double.valueOf(((Number) value).doubleValue());
                }
                if (type == Integer.class && value instanceof Number) {
                    return (T) Integer.valueOf(((Number) value).intValue());
                }

                if (type == String.class) {
                    return (T) value.toString();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }


    private Assessment.AssessmentStatus determineAssessmentStatus(LocalDate dueDate, boolean hasScore) {

        if (hasScore) {
            return Assessment.AssessmentStatus.COMPLETED;
        }

        if (dueDate == null) {
            return Assessment.AssessmentStatus.UPCOMING;
        }

        LocalDate today = LocalDate.now();

        if (dueDate.isBefore(today)) {
            return Assessment.AssessmentStatus.OVERDUE;
        } else if (dueDate.isEqual(today)) {
            return Assessment.AssessmentStatus.UPCOMING;
        } else {
            return Assessment.AssessmentStatus.UPCOMING;
        }
    }
    
    
    
    /**
     * Send email and push notifications when an assessment is created
     */
    private void sendAssessmentCreatedNotifications(Assessment assessment, AssessmentCategory category) {
        try {
            // Get course and user information
            Optional<Course> courseOpt = courseRepository.findById(category.getCourseId());
            if (!courseOpt.isPresent()) {
                return;
            }
            
            Course course = courseOpt.get();
            Optional<User> userOpt = userRepository.findById(course.getUserId());
            if (!userOpt.isPresent()) {
                return;
            }
            
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String assessmentName = assessment.getAssessmentName();
            String courseName = course.getCourseName();
            String dueDate = assessment.getDueDate() != null ? assessment.getDueDate().toString() : "TBA";
            String assessmentType = getAssessmentTypeFromName(assessmentName);
            String semester = course.getSemester().toString();
            String yearLevel = course.getYearLevel();
            
            // Send email notification
            try {
                emailNotificationService.sendAssessmentCreatedNotification(
                    userEmail,
                    assessmentName,
                    assessmentType,
                    courseName,
                    dueDate,
                    semester,
                    yearLevel
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
            // Send push notification
            try {
                pushNotificationService.sendAssessmentCreatedNotification(
                    userEmail,
                    assessmentName,
                    assessmentType,
                    courseName,
                    dueDate
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
        } catch (Exception e) {
            // Log error but don't fail the operation
        }
    }
    
    /**
     * Determine assessment type from assessment name
     */
    private String getAssessmentTypeFromName(String assessmentName) {
        if (assessmentName == null) return "Assessment";
        
        String name = assessmentName.toLowerCase();
        if (name.contains("quiz")) return "Quiz";
        if (name.contains("exam") || name.contains("midterm") || name.contains("final")) return "Exam";
        if (name.contains("assignment") || name.contains("project")) return "Assignment";
        if (name.contains("lab") || name.contains("practical")) return "Laboratory";
        if (name.contains("presentation")) return "Presentation";
        
        return "Assessment";
    }

}
