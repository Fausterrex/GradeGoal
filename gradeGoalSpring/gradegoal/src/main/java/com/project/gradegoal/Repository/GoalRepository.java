package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUid(String uid);
    List<Goal> findByUidAndCourseId(String uid, String courseId);
    List<Goal> findByUidAndStatus(String uid, String status);
}
