package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.AssessmentCategory;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Service.CourseService;
import com.project.gradegoal.Service.AssessmentCategoryService;
import com.project.gradegoal.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
public class CourseControllerNew {

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssessmentCategoryService assessmentCategoryService;

    @Autowired
    private UserService userService;

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long courseId) {
        try {
            Optional<Course> course = courseService.getCourseById(courseId);
            if (course.isPresent()) {
                return ResponseEntity.ok(course.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Course>> getCoursesByUid(@PathVariable String email) {
        try {

            Optional<User> user = userService.findByEmail(email);
            if (user.isPresent()) {
                List<Course> courses = courseService.getCoursesByUserId(user.get().getUserId());
                return ResponseEntity.ok(courses);
            } else {

                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/id/{userId}")
    public ResponseEntity<List<Course>> getCoursesByUserId(@PathVariable Long userId) {
        try {
            List<Course> courses = courseService.getCoursesByUserId(userId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Object courseData) {
        try {
            Course course = new Course();

            if (courseData instanceof java.util.Map) {
                java.util.Map<String, Object> data = (java.util.Map<String, Object>) courseData;

                Long userId = null;
                if (data.containsKey("userId")) {
                    userId = Long.valueOf(data.get("userId").toString());
                } else if (data.containsKey("email")) {
                    String email = data.get("email").toString();
                    Optional<User> user = userService.findByEmail(email);
                    if (user.isPresent()) {
                        userId = user.get().getUserId();
                    } else {
                        return ResponseEntity.status(400).body(null);
                    }
                } else {
                    return ResponseEntity.status(400).body(null);
                }

                course.setUserId(userId);
                course.setCourseName(data.get("name") != null ? data.get("name").toString() : "");
                course.setCourseCode(data.get("courseCode") != null ? data.get("courseCode").toString() : "");

                String creditHoursStr = data.get("creditHours") != null ? data.get("creditHours").toString().trim() : "";
                if (creditHoursStr.isEmpty() || creditHoursStr.equals("null")) {
                    course.setCreditHours(3);
                } else {
                    try {
                        course.setCreditHours(Integer.valueOf(creditHoursStr));
                    } catch (NumberFormatException e) {
                        course.setCreditHours(3);
                    }
                }

                String targetGradeStr = data.get("targetGrade") != null ? data.get("targetGrade").toString().trim() : "";
                if (targetGradeStr.isEmpty() || targetGradeStr.equals("null")) {
                    course.setTargetGrade(new java.math.BigDecimal("93.00"));
                } else {
                    try {
                        course.setTargetGrade(new java.math.BigDecimal(targetGradeStr));
                    } catch (NumberFormatException e) {
                        course.setTargetGrade(new java.math.BigDecimal("93.00"));
                    }
                }

                course.setSemester(Course.Semester.FIRST);
                course.setAcademicYear("2024");

            } else if (courseData instanceof Course) {
                course = (Course) courseData;
            } else {
                return ResponseEntity.status(400).body(null);
            }

            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.ok(createdCourse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long courseId, @RequestBody Object courseData) {
        try {

            Optional<Course> existingCourseOpt = courseService.getCourseById(courseId);
            if (!existingCourseOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Course existingCourse = existingCourseOpt.get();

            if (courseData instanceof java.util.Map) {
                java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) courseData;

                if (dataMap.containsKey("name")) {
                    existingCourse.setName((String) dataMap.get("name"));
                } else if (dataMap.containsKey("courseName")) {
                    existingCourse.setCourseName((String) dataMap.get("courseName"));
                }

                if (dataMap.containsKey("courseCode")) {
                    existingCourse.setCourseCode((String) dataMap.get("courseCode"));
                }
                if (dataMap.containsKey("creditHours")) {
                    existingCourse.setCreditHours(((Number) dataMap.get("creditHours")).intValue());
                }
                if (dataMap.containsKey("targetGrade")) {
                    Object targetGrade = dataMap.get("targetGrade");
                    if (targetGrade != null) {
                        existingCourse.setTargetGrade(new java.math.BigDecimal(targetGrade.toString()));
                    }
                }
                if (dataMap.containsKey("colorIndex")) {
                    existingCourse.setColorIndex(((Number) dataMap.get("colorIndex")).intValue());
                }
                if (dataMap.containsKey("semester")) {
                    String semesterStr = (String) dataMap.get("semester");
                    if (semesterStr != null) {
                        try {
                            existingCourse.setSemester(Course.Semester.valueOf(semesterStr.toUpperCase()));
                        } catch (IllegalArgumentException e) {

                        }
                    }
                }
                if (dataMap.containsKey("academicYear")) {
                    existingCourse.setAcademicYear((String) dataMap.get("academicYear"));
                }
                if (dataMap.containsKey("categorySystem")) {
                    existingCourse.setCategorySystem((String) dataMap.get("categorySystem"));
                }
                if (dataMap.containsKey("instructorName")) {
                    existingCourse.setInstructorName((String) dataMap.get("instructorName"));
                }
            }

            Course updatedCourse = courseService.updateCourse(courseId, existingCourse);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{courseId}/categories")
    public ResponseEntity<AssessmentCategory> addCategoryToCourse(@PathVariable Long courseId, @RequestBody AssessmentCategory categoryData) {
        try {
            categoryData.setCourseId(courseId);
            AssessmentCategory createdCategory = assessmentCategoryService.createAssessmentCategory(categoryData);
            return ResponseEntity.ok(createdCategory);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{courseId}/categories")
    public ResponseEntity<List<AssessmentCategory>> getCategoriesByCourseId(@PathVariable Long courseId) {
        try {
            List<AssessmentCategory> categories = assessmentCategoryService.getAssessmentCategoriesByCourseId(courseId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{courseId}/complete")
    public ResponseEntity<Course> completeCourse(@PathVariable Long courseId) {
        try {
            Course completedCourse = courseService.completeCourse(courseId);
            if (completedCourse != null) {
                return ResponseEntity.ok(completedCourse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{courseId}/uncomplete")
    public ResponseEntity<Course> uncompleteCourse(@PathVariable Long courseId) {
        try {
            Course uncompletedCourse = courseService.uncompleteCourse(courseId);
            if (uncompletedCourse != null) {
                return ResponseEntity.ok(uncompletedCourse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{courseId}/archive")
    public ResponseEntity<Course> archiveCourse(@PathVariable Long courseId) {
        try {
            Course archivedCourse = courseService.archiveCourse(courseId);
            if (archivedCourse != null) {
                return ResponseEntity.ok(archivedCourse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{courseId}/unarchive")
    public ResponseEntity<Course> unarchiveCourse(@PathVariable Long courseId) {
        try {
            Course unarchivedCourse = courseService.unarchiveCourse(courseId);
            if (unarchivedCourse != null) {
                return ResponseEntity.ok(unarchivedCourse);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
