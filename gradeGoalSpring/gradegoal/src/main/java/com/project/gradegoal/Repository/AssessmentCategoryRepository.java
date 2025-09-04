package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.AssessmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentCategoryRepository extends JpaRepository<AssessmentCategory, Long> {

    List<AssessmentCategory> findByCourseId(Long courseId);

    List<AssessmentCategory> findByCourseIdOrderByOrderSequence(Long courseId);

    AssessmentCategory findByCourseIdAndCategoryName(Long courseId, String categoryName);

    boolean existsByCourseIdAndCategoryName(Long courseId, String categoryName);

    List<AssessmentCategory> findByCourseIdAndWeightPercentageGreaterThan(Long courseId, java.math.BigDecimal weightPercentage);

    long countByCourseId(Long courseId);

    void deleteByCourseId(Long courseId);

    @Query("SELECT SUM(c.weightPercentage) FROM AssessmentCategory c WHERE c.courseId = :courseId")
    java.math.BigDecimal getTotalWeightPercentageByCourseId(@Param("courseId") Long courseId);

}
