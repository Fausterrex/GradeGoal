package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByCategory_Id(Long categoryId);
    @Query("SELECT g FROM Grade g JOIN FETCH g.category c WHERE c.course.id = :courseId")
    List<Grade> findByCategory_Course_Id(@Param("courseId") Long courseId);
}
