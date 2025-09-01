package com.project.gradegoal.Controller;
import org.springframework.http.HttpStatus;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Category;
import com.project.gradegoal.Service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        try {
            // Log the incoming data
            System.out.println("Received course data: " + course);
            
            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.ok(createdCourse);
        } catch (Exception e) {
            // Log the full error
            e.printStackTrace();
            System.err.println("Error creating course: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating course: " + e.getMessage());
        }
    }

    @GetMapping("/user/{uid}")
    public ResponseEntity<List<Course>> getCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        course.setId(id);
        Course updatedCourse = courseService.updateCourse(course);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{courseId}/categories")
    public ResponseEntity<Category> addCategoryToCourse(@PathVariable Long courseId, @RequestBody Category category) {
        Category createdCategory = courseService.addCategoryToCourse(courseId, category);
        return ResponseEntity.ok(createdCategory);
    }

    @GetMapping("/{courseId}/categories")
    public ResponseEntity<List<Category>> getCategoriesByCourseId(@PathVariable Long courseId) {
        List<Category> categories = courseService.getCategoriesByCourseId(courseId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Course> archiveCourse(@PathVariable Long id) {
        try {
            Course archivedCourse = courseService.archiveCourse(id);
            return ResponseEntity.ok(archivedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/unarchive")
    public ResponseEntity<Course> unarchiveCourse(@PathVariable Long id) {
        try {
            Course unarchivedCourse = courseService.unarchiveCourse(id);
            return ResponseEntity.ok(unarchivedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{uid}/active")
    public ResponseEntity<List<Course>> getActiveCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getActiveCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/user/{uid}/archived")
    public ResponseEntity<List<Course>> getArchivedCoursesByUid(@PathVariable String uid) {
        List<Course> courses = courseService.getArchivedCoursesByUid(uid);
        return ResponseEntity.ok(courses);
    }
}
