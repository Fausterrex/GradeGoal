package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Category;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public CourseService(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Course createCourse(Course course) {
        // Set timestamps before saving
        course.setCreatedAt(new java.util.Date().toString());
        course.setUpdatedAt(new java.util.Date().toString());
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<Course> getCoursesByUid(String uid) {
        return courseRepository.findByUidOrderByCreatedAtDesc(uid);
    }

    @Transactional(readOnly = true)
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

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

    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

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

    @Transactional(readOnly = true)
    public List<Category> getCategoriesByCourseId(Long courseId) {
        return categoryRepository.findByCourseId(courseId);
    }
}