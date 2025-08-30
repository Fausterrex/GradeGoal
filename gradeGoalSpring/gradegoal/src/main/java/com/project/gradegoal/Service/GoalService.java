package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Goal;
import com.project.gradegoal.Repository.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    @Transactional
    public Goal createGoal(Goal goal) {
        goal.setUpdatedAt(new java.util.Date().toString());
        return goalRepository.save(goal);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoalsByUid(String uid) {
        return goalRepository.findByUid(uid);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoalsByUidAndCourseId(String uid, String courseId) {
        return goalRepository.findByUidAndCourseId(uid, courseId);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoalsByUidAndStatus(String uid, String status) {
        return goalRepository.findByUidAndStatus(uid, status);
    }

    @Transactional(readOnly = true)
    public Optional<Goal> getGoalById(Long id) {
        return goalRepository.findById(id);
    }

    @Transactional
    public Goal updateGoal(Goal goal) {
        goal.setUpdatedAt(new java.util.Date().toString());
        return goalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}
