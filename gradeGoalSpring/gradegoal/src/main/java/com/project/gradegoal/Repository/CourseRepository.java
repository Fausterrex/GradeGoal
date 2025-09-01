package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByUid(String uid);
    List<Course> findByUidOrderByCreatedAtDesc(String uid);
    List<Course> findByUidAndIsArchivedFalseOrderByCreatedAtDesc(String uid);
    List<Course> findByUidAndIsArchivedTrueOrderByArchivedAtDesc(String uid);
}
