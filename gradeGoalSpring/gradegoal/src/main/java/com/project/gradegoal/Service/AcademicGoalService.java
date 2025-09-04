package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.AcademicGoal;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Repository.AcademicGoalRepository;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicGoalService {

    @Autowired
    private AcademicGoalRepository academicGoalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public AcademicGoal createAcademicGoal(AcademicGoal academicGoal) {
        return academicGoalRepository.save(academicGoal);
    }

    public AcademicGoal createAcademicGoalForUser(Long userId, AcademicGoal.GoalType goalType,
                                                 String goalTitle, BigDecimal targetValue, Long courseId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            AcademicGoal goal = new AcademicGoal(userId, goalType, goalTitle, targetValue);
            if (courseId != null) {
                goal.setCourseId(courseId);
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

    public List<AcademicGoal> getAcademicGoalsByUserIdAndType(Long userId, AcademicGoal.GoalType goalType) {
        return academicGoalRepository.findByUserIdAndGoalType(userId, goalType);
    }

    public List<AcademicGoal> getAcademicGoalsByUserIdAndCourseId(Long userId, Long courseId) {
        return academicGoalRepository.findByUserIdAndCourseId(userId, courseId);
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
}
