package com.project.gradegoal.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class ReportController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/courses/grouped")
    public Map<String, Object> getGroupedData(@RequestParam Long userId) {
        String sql = """
                    SELECT u.user_id, u.first_name, u.last_name, u.email,
                           c.course_id, c.course_name, c.semester, c.academic_year,
                           c.calculated_course_grade, c.course_gpa,
                           g.goal_id, g.goal_title, g.priority, g.target_value, g.goal_type,
                           ac.category_id, ac.category_name,
                           a.assessment_id, a.assessment_name, a.status,
                           gr.grade_id, gr.points_earned, gr.points_possible, gr.percentage_score
                    FROM users u
                    JOIN courses c ON c.user_id = u.user_id
                    LEFT JOIN academic_goals g ON g.course_id = c.course_id AND g.user_id = u.user_id
                    LEFT JOIN assessment_categories ac ON ac.course_id = c.course_id
                    LEFT JOIN assessments a ON a.category_id = ac.category_id
                    LEFT JOIN grades gr ON gr.assessment_id = a.assessment_id
                    WHERE u.user_id = ?
                    ORDER BY c.course_id, g.goal_id, ac.category_id, a.assessment_id
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);

        Map<Long, Map<String, Object>> courseMap = new LinkedHashMap<>();

        for (Map<String, Object> row : rows) {
            Long courseId = ((Number) row.get("course_id")).longValue();

            courseMap.putIfAbsent(courseId, new HashMap<>(Map.of(
                    "courseId", courseId,
                    "courseName", row.get("course_name"),
                    "semester", row.get("semester"),
                    "academicYear", row.get("academic_year"),
                    "calculatedGrade", row.get("calculated_course_grade"),
                    "currentGpa", row.get("course_gpa"),
                    "goals", new LinkedHashMap<Long, Map<String, Object>>()
            )));

            Map<String, Object> course = courseMap.get(courseId);
            @SuppressWarnings("unchecked")
            Map<Long, Map<String, Object>> goals = (Map<Long, Map<String, Object>>) course.get("goals");

            if (row.get("goal_id") != null) {
                Long goalId = ((Number) row.get("goal_id")).longValue();
                goals.putIfAbsent(goalId, new HashMap<>(Map.of(
                        "goalId", goalId,
                        "goalTitle", row.get("goal_title"),
                        "priority", row.get("priority"),
                        "targetValue", row.get("target_value"),
                        "goalType", row.get("goal_type"),
                        "categories", new LinkedHashMap<Long, Map<String, Object>>()
                )));

                Map<String, Object> goal = goals.get(goalId);

                // Progress
                Double calcGrade = row.get("calculated_course_grade") != null ? ((Number) row.get("calculated_course_grade")).doubleValue() : null;
                Double target = row.get("target_value") != null ? ((Number) row.get("target_value")).doubleValue() : null;
                if (calcGrade != null && target != null) {
                    double progress = Math.min(100, (calcGrade / target) * 100);
                    goal.put("progress", progress);
                }

                // GPA values
                goal.put("currentGpa", row.get("course_gpa"));
                goal.put("targetGpa", row.get("target_value"));

                @SuppressWarnings("unchecked")
                Map<Long, Map<String, Object>> categories = (Map<Long, Map<String, Object>>) goal.get("categories");

                if (row.get("category_id") != null) {
                    Long catId = ((Number) row.get("category_id")).longValue();
                    categories.putIfAbsent(catId, new HashMap<>(Map.of(
                            "categoryId", catId,
                            "categoryName", row.get("category_name"),
                            "assessments", new ArrayList<Map<String, Object>>()
                    )));

                    Map<String, Object> category = categories.get(catId);
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> assessments = (List<Map<String, Object>>) category.get("assessments");

                    if (row.get("assessment_id") != null) {
                        Map<String, Object> assessment = new HashMap<>();
                        assessment.put("assessmentId", row.get("assessment_id"));
                        assessment.put("assessmentName", row.get("assessment_name"));
                        assessment.put("status", row.get("status"));
                        assessment.put("pointsEarned", row.get("points_earned"));
                        assessment.put("pointsPossible", row.get("points_possible"));
                        assessment.put("percentageScore", row.get("percentage_score"));

                        assessments.add(assessment);
                    }
                }
            }
        }

        return Map.of("courses", new ArrayList<>(courseMap.values()));
    }
}
