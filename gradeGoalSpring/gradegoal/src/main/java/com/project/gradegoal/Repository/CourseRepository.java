package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Course Repository
 * 
 * Data access layer for Course entities in the GradeGoal application.
 * This repository extends JpaRepository to provide standard CRUD operations
 * and includes custom query methods for specific business requirements.
 * 
 * Key Features:
 * - Standard CRUD operations inherited from JpaRepository
 * - Custom query methods for user-specific course retrieval
 * - Support for course archiving and status filtering
 * - Automatic query generation from method names
 * - Transactional data access with Spring Data JPA
 * 
 * Custom Query Methods:
 * - findByUid: Find all courses for a specific user
 * - findByUidOrderByCreatedAtDesc: Find user's courses ordered by creation date
 * - findByUidAndIsArchivedFalseOrderByCreatedAtDesc: Find active courses for user
 * - findByUidAndIsArchivedTrueOrderByArchivedAtDesc: Find archived courses for user
 * 
 * @author GradeGoal Development Team
 * @version 1.0.0
 * @since 2024
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    /**
     * Find all courses for a specific user
     * 
     * Retrieves all courses belonging to the specified user.
     * Returns courses in no specific order.
     * 
     * @param uid Firebase UID of the user
     * @return List of courses belonging to the user
     */
    List<Course> findByUid(String uid);
    
    /**
     * Find all courses for a specific user ordered by creation date
     * 
     * Retrieves all courses belonging to the specified user.
     * Courses are returned in descending order by creation date (newest first).
     * 
     * @param uid Firebase UID of the user
     * @return List of courses ordered by creation date (newest first)
     */
    List<Course> findByUidOrderByCreatedAtDesc(String uid);
    
    /**
     * Find active courses for a specific user ordered by creation date
     * 
     * Retrieves only non-archived courses belonging to the specified user.
     * Courses are returned in descending order by creation date (newest first).
     * Used for main dashboard display and active course management.
     * 
     * @param uid Firebase UID of the user
     * @return List of active courses ordered by creation date (newest first)
     */
    List<Course> findByUidAndIsArchivedFalseOrderByCreatedAtDesc(String uid);
    
    /**
     * Find archived courses for a specific user ordered by archive date
     * 
     * Retrieves only archived courses belonging to the specified user.
     * Courses are returned in descending order by archive date (most recently archived first).
     * Used for archived course management and restoration.
     * 
     * @param uid Firebase UID of the user
     * @return List of archived courses ordered by archive date (most recent first)
     */
    List<Course> findByUidAndIsArchivedTrueOrderByArchivedAtDesc(String uid);
}
