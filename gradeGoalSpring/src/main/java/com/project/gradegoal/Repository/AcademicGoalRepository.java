package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.AcademicGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AcademicGoalRepository extends JpaRepository<AcademicGoal, Long> {

    List<AcademicGoal> findByUserId(Long userId);

    List<AcademicGoal> findByUserIdAndGoalType(Long userId, AcademicGoal.GoalType goalType);

    List<AcademicGoal> findByUserIdAndCourseId(Long userId, Long courseId);

    List<AcademicGoal> findByUserIdAndIsAchieved(Long userId, Boolean isAchieved);

    List<AcademicGoal> findByUserIdAndPriority(Long userId, AcademicGoal.Priority priority);

    List<AcademicGoal> findByTargetDate(LocalDate targetDate);

    List<AcademicGoal> findByTargetDateBetween(LocalDate startDate, LocalDate endDate);

    List<AcademicGoal> findByTargetDateBefore(LocalDate targetDate);

    List<AcademicGoal> findByTargetDateAfter(LocalDate targetDate);

    AcademicGoal findByUserIdAndGoalTitle(Long userId, String goalTitle);

    boolean existsByUserIdAndGoalTitle(Long userId, String goalTitle);

    long countByUserId(Long userId);

    long countByUserIdAndIsAchieved(Long userId, Boolean isAchieved);

    long countByUserIdAndGoalType(Long userId, AcademicGoal.GoalType goalType);

    @Query("SELECT g FROM AcademicGoal g WHERE g.targetDate < :currentDate AND g.isAchieved = false")
    List<AcademicGoal> findOverdueGoals(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT g FROM AcademicGoal g WHERE g.targetDate BETWEEN :currentDate AND :futureDate AND g.isAchieved = false")
    List<AcademicGoal> findUpcomingGoals(@Param("currentDate") LocalDate currentDate, @Param("futureDate") LocalDate futureDate);

    @Query("SELECT g FROM AcademicGoal g WHERE g.userId = :userId AND g.targetValue > :threshold")
    List<AcademicGoal> findGoalsAboveThreshold(@Param("userId") Long userId, @Param("threshold") java.math.BigDecimal threshold);
}
