package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.gradeGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface gradeGoalRepository extends JpaRepository<gradeGoal, Long> {
    Optional<gradeGoal> findByUid(String uid);
    Optional<gradeGoal> findByEmail(String email);
}