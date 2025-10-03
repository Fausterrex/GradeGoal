package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.AcademicGoal;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Repository.AcademicGoalRepository;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicGoalService {

    private static final Logger logger = LoggerFactory.getLogger(AcademicGoalService.class);

    @Autowired
    private AcademicGoalRepository academicGoalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private PushNotificationService pushNotificationService;

    public AcademicGoal createAcademicGoal(AcademicGoal academicGoal) {
        return academicGoalRepository.save(academicGoal);
    }

    public AcademicGoal createAcademicGoalForUser(Long userId, AcademicGoal.GoalType goalType,
                                                 String goalTitle, BigDecimal targetValue, Long courseId,
                                                 LocalDate targetDate, String description, AcademicGoal.Priority priority,
                                                 Course.Semester semester, String academicYear) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            AcademicGoal goal = new AcademicGoal(userId, goalType, goalTitle, targetValue);
            if (courseId != null) {
                goal.setCourseId(courseId);
            }
            if (targetDate != null) {
                goal.setTargetDate(targetDate);
            }
            if (description != null && !description.trim().isEmpty()) {
                goal.setDescription(description);
            }
            if (priority != null) {
                goal.setPriority(priority);
            }
            if (semester != null) {
                goal.setSemester(semester);
            }
            if (academicYear != null && !academicYear.trim().isEmpty()) {
                goal.setAcademicYear(academicYear);
            }
            return academicGoalRepository.save(goal);
        }
        throw new RuntimeException("User not found with ID: " + userId);
    }

    public Optional<AcademicGoal> getAcademicGoalById(Long goalId) {
        return academicGoalRepository.findById(goalId);
    }

    public List<AcademicGoal> getAcademicGoalsByUserId(Long userId) {
        return academicGoalRepository.findByUserId(userId);
    }

    public List<AcademicGoal> getAcademicGoalsByCourse(Long userId, Long courseId) {
        return academicGoalRepository.findByUserIdAndCourseId(userId, courseId);
    }

    public List<AcademicGoal> getAcademicGoalsByUserIdAndType(Long userId, AcademicGoal.GoalType goalType) {
        return academicGoalRepository.findByUserIdAndGoalType(userId, goalType);
    }


    public List<AcademicGoal> getAcademicGoalsByUserIdAndAchievementStatus(Long userId, Boolean isAchieved) {
        return academicGoalRepository.findByUserIdAndIsAchieved(userId, isAchieved);
    }

    public List<AcademicGoal> getAcademicGoalsByUserIdAndPriority(Long userId, AcademicGoal.Priority priority) {
        return academicGoalRepository.findByUserIdAndPriority(userId, priority);
    }

    public List<AcademicGoal> getAcademicGoalsByTargetDate(LocalDate targetDate) {
        return academicGoalRepository.findByTargetDate(targetDate);
    }

    public List<AcademicGoal> getAcademicGoalsByTargetDateRange(LocalDate startDate, LocalDate endDate) {
        return academicGoalRepository.findByTargetDateBetween(startDate, endDate);
    }

    public List<AcademicGoal> getOverdueGoals() {
        return academicGoalRepository.findOverdueGoals(LocalDate.now());
    }

    public List<AcademicGoal> getUpcomingGoals(int daysAhead) {
        LocalDate currentDate = LocalDate.now();
        LocalDate futureDate = currentDate.plusDays(daysAhead);
        return academicGoalRepository.findUpcomingGoals(currentDate, futureDate);
    }

    public AcademicGoal getAcademicGoalByUserIdAndTitle(Long userId, String goalTitle) {
        return academicGoalRepository.findByUserIdAndGoalTitle(userId, goalTitle);
    }

    public boolean academicGoalExists(Long userId, String goalTitle) {
        return academicGoalRepository.existsByUserIdAndGoalTitle(userId, goalTitle);
    }

    public AcademicGoal updateAcademicGoal(AcademicGoal academicGoal) {
        return academicGoalRepository.save(academicGoal);
    }

    public AcademicGoal markGoalAsAchieved(Long goalId) {
        Optional<AcademicGoal> goalOpt = academicGoalRepository.findById(goalId);
        if (goalOpt.isPresent()) {
            AcademicGoal goal = goalOpt.get();
            
            // Check if course is completed (for course-specific goals)
            if (goal.getCourseId() != null) {
                Optional<Course> courseOpt = courseRepository.findById(goal.getCourseId());
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    if (!course.getIsCompleted()) {
                        throw new RuntimeException("Cannot mark goal as achieved: Course must be completed first");
                    }
                } else {
                    throw new RuntimeException("Course not found for goal");
                }
            }
            
            goal.setIsAchieved(true);
            goal.setAchievedDate(LocalDate.now());
            return academicGoalRepository.save(goal);
        }
        throw new RuntimeException("Academic goal not found with ID: " + goalId);
    }

    public AcademicGoal markGoalAsNotAchieved(Long goalId) {
        Optional<AcademicGoal> goalOpt = academicGoalRepository.findById(goalId);
        if (goalOpt.isPresent()) {
            AcademicGoal goal = goalOpt.get();
            goal.setIsAchieved(false);
            goal.setAchievedDate(null);
            return academicGoalRepository.save(goal);
        }
        throw new RuntimeException("Academic goal not found with ID: " + goalId);
    }

    public AcademicGoal updateGoalPriority(Long goalId, AcademicGoal.Priority priority) {
        Optional<AcademicGoal> goalOpt = academicGoalRepository.findById(goalId);
        if (goalOpt.isPresent()) {
            AcademicGoal goal = goalOpt.get();
            goal.setPriority(priority);
            return academicGoalRepository.save(goal);
        }
        throw new RuntimeException("Academic goal not found with ID: " + goalId);
    }

    public AcademicGoal updateGoalTargetValue(Long goalId, BigDecimal targetValue) {
        Optional<AcademicGoal> goalOpt = academicGoalRepository.findById(goalId);
        if (goalOpt.isPresent()) {
            AcademicGoal goal = goalOpt.get();
            goal.setTargetValue(targetValue);
            return academicGoalRepository.save(goal);
        }
        throw new RuntimeException("Academic goal not found with ID: " + goalId);
    }

    public boolean deleteAcademicGoal(Long goalId) {
        if (academicGoalRepository.existsById(goalId)) {
            academicGoalRepository.deleteById(goalId);
            return true;
        }
        return false;
    }

    public long countAcademicGoalsByUserId(Long userId) {
        return academicGoalRepository.countByUserId(userId);
    }

    public long countAcademicGoalsByUserIdAndAchievementStatus(Long userId, Boolean isAchieved) {
        return academicGoalRepository.countByUserIdAndIsAchieved(userId, isAchieved);
    }

    public long countAcademicGoalsByUserIdAndType(Long userId, AcademicGoal.GoalType goalType) {
        return academicGoalRepository.countByUserIdAndGoalType(userId, goalType);
    }

    public List<AcademicGoal> getGoalsAboveThreshold(Long userId, BigDecimal threshold) {
        return academicGoalRepository.findGoalsAboveThreshold(userId, threshold);
    }

    /**
     * Automatically evaluate and update achievements for course-specific goals when a course is completed
     * This method should be called when a course is marked as completed
     */
    public void evaluateGoalsOnCourseCompletion(Long courseId) {
        // Get all goals related to this course
        List<AcademicGoal> courseGoals = academicGoalRepository.findByCourseId(courseId);
        
        // Get the course to check its final grade
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (!courseOpt.isPresent()) {
            return;
        }
        
        Course course = courseOpt.get();
        
        for (AcademicGoal goal : courseGoals) {
            // Only evaluate COURSE_GRADE goals
            if (goal.getGoalType() == AcademicGoal.GoalType.COURSE_GRADE) {
                Boolean wasAchieved = goal.getIsAchieved();
                Boolean isNowAchieved = evaluateGoalAchievement(goal, course);
                
                // Update achievement status if it has changed
                if (wasAchieved != isNowAchieved) {
                    goal.setIsAchieved(isNowAchieved);
                    if (isNowAchieved) {
                        goal.setAchievedDate(LocalDate.now());
                        
                        // Send achievement notifications
                        sendGoalAchievementNotifications(goal, course);
                    } else {
                        goal.setAchievedDate(null);
                    }
                    academicGoalRepository.save(goal);
                }
            }
        }
    }
    
    /**
     * Evaluate whether a goal was achieved based on the course completion
     */
    private Boolean evaluateGoalAchievement(AcademicGoal goal, Course course) {
        if (goal.getGoalType() != AcademicGoal.GoalType.COURSE_GRADE || !course.getIsCompleted()) {
            return goal.getIsAchieved(); // Keep current status
        }
        
        // Compare target value (percentage) with course final grade (percentage)
        BigDecimal targetValue = goal.getTargetValue();
        BigDecimal courseGrade = course.getCalculatedCourseGrade();
        
        if (courseGrade == null || targetValue == null) {
            return false;
        }
        
        // Goal is achieved if course grade meets or exceeds target
        return courseGrade.compareTo(targetValue) >= 0;
    }
    
    /**
     * Get goals with active status (courses not yet completed)
     */
    public List<AcademicGoal> getActiveGoals(Long userId) {
        List<AcademicGoal> allGoals = academicGoalRepository.findByUserId(userId);
        
        return allGoals.stream()
            .filter(goal -> {
                // Goals are active if:
                // 1. They are not yet achieved AND
                // 2. Associated course is not completed (for course-specific goals) OR
                // 3. No course is associated (semester/cumulative goals are always active until achieved)
                
                return !goal.getIsAchieved() && 
                       (goal.getCourseId() == null || !isCourseCompleted(goal.getCourseId()));
            })
            .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Check if a course is completed
     */
    private boolean isCourseCompleted(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        return courseOpt.isPresent() && courseOpt.get().getIsCompleted();
    }
    
    /**
     * Reactivate academic goals when a course is marked as incomplete
     * This method should be called when a course is marked as incomplete
     */
    public void reactivateGoalsOnCourseIncomplete(Long courseId) {
        // Get all goals related to this course
        List<AcademicGoal> courseGoals = academicGoalRepository.findByCourseId(courseId);
        
        for (AcademicGoal goal : courseGoals) {
            // Only reactivate COURSE_GRADE goals that were previously achieved or not achieved
            if (goal.getGoalType() == AcademicGoal.GoalType.COURSE_GRADE) {
                Boolean wasAchieved = goal.getIsAchieved();
                
                // If goal was previously evaluated (achieved or not achieved), reactivate it
                if (wasAchieved != null) {
                    goal.setIsAchieved(null); // Reset to null (active state)
                    goal.setAchievedDate(null); // Clear achieved date
                    academicGoalRepository.save(goal);
                    
                    logger.info("Reactivated academic goal: {} for course: {}", 
                        goal.getGoalTitle(), courseId);
                }
            }
        }
    }
    
    /**
     * Send email and push notifications when a goal is achieved
     */
    private void sendGoalAchievementNotifications(AcademicGoal goal, Course course) {
        try {
            // Get user information for notifications
            Optional<User> userOpt = userRepository.findById(goal.getUserId());
            if (!userOpt.isPresent()) {
                return;
            }
            
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String goalTitle = goal.getGoalTitle();
            String goalType = goal.getGoalType().toString();
            String achievedValue = String.format("%.1f%%", course.getCalculatedCourseGrade());
            String courseName = course.getCourseName();
            String semester = course.getSemester().toString();
            
            // Send email notification
            try {
                emailNotificationService.sendGoalAchievementNotification(
                    userEmail, 
                    goalTitle, 
                    goalType, 
                    achievedValue, 
                    courseName, 
                    semester
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
            // Send push notification
            try {
                pushNotificationService.sendGoalAchievementNotification(
                    userEmail, 
                    goalTitle, 
                    goalType, 
                    achievedValue
                );
            } catch (Exception e) {
                // Log error but don't fail the operation
            }
            
        } catch (Exception e) {
            // Log error but don't fail the operation
        }
    }
}
