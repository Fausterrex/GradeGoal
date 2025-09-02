package com.project.gradegoal.Controller;
import org.springframework.http.HttpStatus;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Category;
import com.project.gradegoal.Service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Course Controller
 * 
 * RESTful API controller for managing courses in the GradeGoal application.
 * This controller handles all HTTP requests related to course operations
 * including creation, retrieval, updates, deletion, and archiving.
 * 
 * Key Features:
 * - Course CRUD operations (Create, Read, Update, Delete)
 * - Course archiving and restoration
 * - Category management within courses
 * - User-specific course retrieval
 * - Comprehensive error handling and logging
 * 
 * API Endpoints:
 * - POST /api/courses - Create new course
 * - GET /api/courses/user/{uid} - Get user's courses
 * - GET /api/courses/{id} - Get specific course
 * - PUT /api/courses/{id} - Update course
 * - DELETE /api/courses/{id} - Delete course
 * - POST /api/courses/{id}/archive - Archive course
 * - POST /api/courses/{id}/unarchive - Restore archived course
 * - GET /api/courses/user/{uid}/active - Get active courses
 * - GET /api/courses/user/{uid}/archived - Get archived courses
 * - POST /api/courses/{courseId}/categories - Add category to course
 * - GET /api/courses/{courseId}/categories - Get course categories
 * 
 * @author GradeGoal Development Team
 * @version 1.0.0
 * @since 2024
 */
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CourseController {

    /**
     * Course service for business logic operations
     * Injected via constructor using Lombok's @RequiredArgsConstructor
     */
    private final CourseService courseService;

    /**
     * Create a new course
     * 
     * Handles POST requests to create new courses in the system.
     * Validates course data and delegates to the course service for creation.
     * 
     * @param course Course object containing all necessary course information
     * @return ResponseEntity with the created course or error message
     */
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        try {
            // Log the incoming data for debugging purposes
            System.out.println("Received course data: " + course);
            
            // Delegate course creation to the service layer
            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.ok(createdCourse);
        } catch (Exception e) {
            // Log the full error for debugging
            e.printStackTrace();
            System.err.println("Error creating course: " + e.getMessage());
            
            // Return appropriate error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating course: " + e.getMessage());
        }
    }

    /**
     * Get all courses for a specific user
     * 
     * Retrieves all courses belonging to the specified user.
     * Courses are returned in order of creation (newest first).
     * 
     * @param uid Firebase UID of the user
     * @return ResponseEntity containing list of courses
     */
    @GetMapping("/user/{uid}")
    public ResponseEntity<List<Course>> getCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }

    /**
     * Get a specific course by ID
     * 
     * Retrieves a single course using its unique identifier.
     * Returns 404 if the course is not found.
     * 
     * @param id Unique identifier of the course
     * @return ResponseEntity containing the course or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing course
     * 
     * Updates course information while preserving creation timestamp.
     * The course ID in the path must match the ID in the request body.
     * 
     * @param id Unique identifier of the course to update
     * @param course Updated course data
     * @return ResponseEntity containing the updated course
     */
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        course.setId(id);
        Course updatedCourse = courseService.updateCourse(course);
        return ResponseEntity.ok(updatedCourse);
    }

    /**
     * Delete a course permanently
     * 
     * Removes a course and all associated data from the system.
     * This action cannot be undone and will cascade to related entities.
     * 
     * @param id Unique identifier of the course to delete
     * @return ResponseEntity indicating success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Add a category to an existing course
     * 
     * Creates a new category within the specified course.
     * Categories define the grading structure and weights for the course.
     * 
     * @param courseId Unique identifier of the course
     * @param category Category data to add to the course
     * @return ResponseEntity containing the created category
     */
    @PostMapping("/{courseId}/categories")
    public ResponseEntity<Category> addCategoryToCourse(@PathVariable Long courseId, @RequestBody Category category) {
        Category createdCategory = courseService.addCategoryToCourse(courseId, category);
        return ResponseEntity.ok(createdCategory);
    }

    /**
     * Get all categories for a specific course
     * 
     * Retrieves all categories associated with the specified course.
     * Categories include their weights and associated grades.
     * 
     * @param courseId Unique identifier of the course
     * @return ResponseEntity containing list of categories
     */
    @GetMapping("/{courseId}/categories")
    public ResponseEntity<List<Category>> getCategoriesByCourseId(@PathVariable Long courseId) {
        List<Category> categories = courseService.getCategoriesByCourseId(courseId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Archive a course
     * 
     * Archives a course without permanent deletion.
     * Archived courses are hidden from the main view but can be restored later.
     * 
     * @param id Unique identifier of the course to archive
     * @return ResponseEntity containing the archived course or error
     */
    @PostMapping("/{id}/archive")
    public ResponseEntity<Course> archiveCourse(@PathVariable Long id) {
        try {
            Course archivedCourse = courseService.archiveCourse(id);
            return ResponseEntity.ok(archivedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Restore an archived course
     * 
     * Unarchives a previously archived course, making it visible again.
     * The course returns to active status with all data preserved.
     * 
     * @param id Unique identifier of the course to restore
     * @return ResponseEntity containing the restored course or error
     */
    @PostMapping("/{id}/unarchive")
    public ResponseEntity<Course> unarchiveCourse(@PathVariable Long id) {
        try {
            Course unarchivedCourse = courseService.unarchiveCourse(id);
            return ResponseEntity.ok(unarchivedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active courses for a specific user
     * 
     * Retrieves only non-archived courses for the specified user.
     * Used for the main dashboard display and active course management.
     * 
     * @param uid Firebase UID of the user
     * @return ResponseEntity containing list of active courses
     */
    @GetMapping("/user/{uid}/active")
    public ResponseEntity<List<Course>> getActiveCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getActiveCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }

    /**
     * Get archived courses for a specific user
     * 
     * Retrieves only archived courses for the specified user.
     * Used for archived course management and restoration.
     * 
     * @param uid Firebase UID of the user
     * @return ResponseEntity containing list of archived courses
     */
    @GetMapping("/user/{uid}/archived")
    public ResponseEntity<List<Course>> getArchivedCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getArchivedCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }
}
