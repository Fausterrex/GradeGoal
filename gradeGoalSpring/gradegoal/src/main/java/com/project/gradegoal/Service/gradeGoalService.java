package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.gradeGoal;
import com.project.gradegoal.Repository.gradeGoalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class gradeGoalService {

    private final gradeGoalRepository repo;

    public gradeGoalService(gradeGoalRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public gradeGoal postGradeGoal(gradeGoal user) {
        return repo.findByUid(user.getUid())
                .map(existing -> {
                    existing.setEmail(user.getEmail());
                    existing.setDisplayName(user.getDisplayName());
                    return repo.save(existing);
                })
                .orElseGet(() -> repo.save(user));
    }

    @Transactional(readOnly = true)
    public gradeGoal findByUidOrThrow(String uid) {
        return repo.findByUid(uid).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}