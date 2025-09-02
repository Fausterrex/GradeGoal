package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Category;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Course Service
 * 
 * Business logic layer for course management operations in the GradeGoal application.
 * This service handles all course-related business operations including creation,
 * updates, deletion, archiving, and category management.
 * 
 * Key Features:
 * - Course lifecycle management (create, read, update, delete)
 * - Course archiving and restoration
 * - Category management within courses
 * - Transactional data integrity
 * - Timestamp management and audit trails
 * 
 * Business Rules:
 * - Course creation automatically sets creation and update timestamps
 * - Course updates preserve original creation timestamp
 * - Course archiving sets archive timestamp and marks as archived
 * - Category addition validates course existence before creation
 * - All operations maintain referential integrity
 * 
 * @author GradeGoal Development Team
 * @version 1.0.0
 * @since 2024
 */
@Service
public class CourseService {

    /**
     * Repository for course data access operations
     * Handles all database interactions for course entities
     */
    private final CourseRepository courseRepository;
    
    /**
     * Repository for category data access operations
     * Handles all database interactions for category entities
     */
    private final CategoryRepository categoryRepository;

    /**
     * Constructor for dependency injection
     * 
     * Injects required repositories for data access operations.
     * Uses constructor injection for better testability and immutability.
     * 
     * @param courseRepository Repository for course operations
     * @param categoryRepository Repository for category operations
     */
    public CourseService(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Create a new course
     * 
     * Creates a new course in the system with automatic timestamp management.
     * Sets both creation and update timestamps to current time.
     * 
     * @param course Course object to create
     * @return Created course with generated ID and timestamps
     */
    @Transactional
    public Course createCourse(Course course) {
        // Set timestamps before saving
        course.setCreatedAt(new java.util.Date().toString());
        course.setUpdatedAt(new java.util.Date().toString());
        return courseRepository.save(course);
    }

    /**
     * Get all courses for a specific user
     * 
     * Retrieves all courses belonging to the specified user.
     * Courses are returned in descending order by creation date (newest first).
     * 
     * @param uid Firebase UID of the user
     * @return List of courses ordered by creation date
     */
    @Transactional(readOnly = true)
    public List<Course> getCoursesByUid(String uid) {
        return courseRepository.findByUidOrderByCreatedAtDesc(uid);
    }

    /**
     * Get a specific course by ID
     * 
     * Retrieves a single course using its unique identifier.
     * Returns an Optional to handle cases where the course doesn't exist.
     * 
     * @param id Unique identifier of the course
     * @return Optional containing the course if found, empty otherwise
     */
    @Transactional(readOnly = true)
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    /**
     * Update an existing course
     * 
     * Updates course information while preserving the original creation timestamp.
     * Automatically updates the modification timestamp.
     * 
     * @param course Course object with updated information
     * @return Updated course with preserved creation timestamp
     */
    @Transactional
    public Course updateCourse(Course course) {
        // Get the existing course to preserve createdAt
        Optional<Course> existingCourseOpt = courseRepository.findById(course.getId());
        if (existingCourseOpt.isPresent()) {
            Course existingCourse = existingCourseOpt.get();
            // Preserve the original createdAt value
            course.setCreatedAt(existingCourse.getCreatedAt());
        }
        course.setUpdatedAt(new java.util.Date().toString());
        return courseRepository.save(course);
    }

    /**
     * Delete a course permanently
     * 
     * Removes a course and all associated data from the system.
     * This operation cascades to related entities (categories, grades).
     * 
     * @param id Unique identifier of the course to delete
     */
    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    /**
     * Add a category to an existing course
     * 
     * Creates a new category within the specified course.
     * Validates that the course exists before creating the category.
     * Sets up proper relationships and timestamps.
     * 
     * @param courseId Unique identifier of the course
     * @param category Category object to add
     * @return Created category with proper relationships
     * @throws RuntimeException if the course is not found
     */
    @Transactional
    public Category addCategoryToCourse(Long courseId, Category category) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            category.setCourse(course);
            category.setCreatedAt(new java.util.Date().toString());
            category.setUpdatedAt(new java.util.Date().toString());
            return categoryRepository.save(category);
        }
        throw new RuntimeException("Course not found");
    }

    /**
     * Get all categories for a specific course
     * 
     * Retrieves all categories associated with the specified course.
     * Categories include their weights and associated grades.
     * 
     * @param courseId Unique identifier of the course
     * @return List of categories for the course
     */
    @Transactional(readOnly = true)
    public List<Category> getCategoriesByCourseId(Long courseId) {
        return categoryRepository.findByCourseId(courseId);
    }

    /**
     * Archive a course
     * 
     * Archives a course without permanent deletion.
     * Sets the archived flag and timestamp while preserving all data.
     * 
     * @param id Unique identifier of the course to archive
     * @return Archived course with updated status
     * @throws RuntimeException if the course is not found
     */
    @Transactional
    public Course archiveCourse(Long id) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setIsArchived(true);
            course.setArchivedAt(new java.util.Date().toString());
            course.setUpdatedAt(new java.util.Date().toString());
            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found");
    }

    /**
     * Restore an archived course
     * 
     * Unarchives a previously archived course, making it visible again.
     * Clears the archived flag and timestamp while preserving all data.
     * 
     * @param id Unique identifier of the course to restore
     * @return Restored course with updated status
     * @throws RuntimeException if the course is not found
     */
    @Transactional
    public Course unarchiveCourse(Long id) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            course.setIsArchived(false);
            course.setArchivedAt(null);
            course.setUpdatedAt(new java.util.Date().toString());
            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found");
    }

    /**
     * Get active courses for a specific user
     * 
     * Retrieves only non-archived courses for the specified user.
     * Used for the main dashboard display and active course management.
     * 
     * @param uid Firebase UID of the user
     * @return List of active courses ordered by creation date
     */
    @Transactional(readOnly = true)
    public List<Course> getActiveCoursesByUid(String uid) {
        return courseRepository.findByUidAndIsArchivedFalseOrderByCreatedAtDesc(uid);
    }

    /**
     * Get archived courses for a specific user
     * 
     * Retrieves only archived courses for the specified user.
     * Used for archived course management and restoration.
     * 
     * @param uid Firebase UID of the user
     * @return List of archived courses ordered by archive date
     */
    @Transactional(readOnly = true)
    public List<Course> getArchivedCoursesByUid(String uid) {
        return courseRepository.findByUidAndIsArchivedTrueOrderByArchivedAtDesc(uid);
    }
}