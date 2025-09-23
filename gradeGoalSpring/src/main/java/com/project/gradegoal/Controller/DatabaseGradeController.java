package com.project.gradegoal.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling database grade calculation functions
 * Interfaces with MySQL stored procedures and functions
 */
@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*")
public class DatabaseGradeController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Calculate GPA from percentage using database function
     * Calls MySQL function: CalculateGPA(percentage)
     */
    @PostMapping("/calculate-gpa")
    public ResponseEntity<Map<String, Object>> calculateGPA(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            BigDecimal percentage = new BigDecimal(request.get("percentage").toString());
            
            BigDecimal gpa = jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ ? = call CalculateGPA(?) }");
                    cs.registerOutParameter(1, Types.DECIMAL);
                    cs.setBigDecimal(2, percentage);
                    return cs;
                },
                (CallableStatementCallback<BigDecimal>) cs -> {
                    cs.execute();
                    return cs.getBigDecimal(1);
                }
            );
            
            response.put("success", true);
            response.put("gpa", gpa);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("gpa", BigDecimal.ZERO);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Calculate cumulative GPA for a user using database function
     * Calls MySQL function: CalculateCumulativeGPA(user_id)
     */
    @PostMapping("/calculate-cumulative-gpa")
    public ResponseEntity<Map<String, Object>> calculateCumulativeGPA(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            
            BigDecimal cumulativeGPA = jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ ? = call CalculateCumulativeGPA(?) }");
                    cs.registerOutParameter(1, Types.DECIMAL);
                    cs.setLong(2, userId);
                    return cs;
                },
                (CallableStatementCallback<BigDecimal>) cs -> {
                    cs.execute();
                    return cs.getBigDecimal(1);
                }
            );
            
            response.put("success", true);
            response.put("cumulativeGPA", cumulativeGPA);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("cumulativeGPA", BigDecimal.ZERO);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Calculate course grade using database function
     * Calls MySQL function: CalculateCourseGrade(course_id)
     */
    @PostMapping("/calculate-course-grade")
    public ResponseEntity<Map<String, Object>> calculateCourseGrade(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long courseId = Long.valueOf(request.get("courseId").toString());
            
            BigDecimal courseGrade = jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ ? = call CalculateCourseGrade(?) }");
                    cs.registerOutParameter(1, Types.DECIMAL);
                    cs.setLong(2, courseId);
                    return cs;
                },
                (CallableStatementCallback<BigDecimal>) cs -> {
                    cs.execute();
                    return cs.getBigDecimal(1);
                }
            );
            
            response.put("success", true);
            response.put("courseGrade", courseGrade);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("courseGrade", BigDecimal.ZERO);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Calculate category grade using database function
     * Calls MySQL function: CalculateCategoryGrade(category_id)
     */
    @PostMapping("/calculate-category-grade")
    public ResponseEntity<Map<String, Object>> calculateCategoryGrade(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            
            BigDecimal categoryGrade = jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ ? = call CalculateCategoryGrade(?) }");
                    cs.registerOutParameter(1, Types.DECIMAL);
                    cs.setLong(2, categoryId);
                    return cs;
                },
                (CallableStatementCallback<BigDecimal>) cs -> {
                    cs.execute();
                    return cs.getBigDecimal(1);
                }
            );
            
            response.put("success", true);
            response.put("categoryGrade", categoryGrade);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("categoryGrade", BigDecimal.ZERO);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Add or update a grade using database stored procedure
     * Calls MySQL procedure: AddOrUpdateGrade(...)
     */
    @PostMapping("/add-or-update")
    public ResponseEntity<Map<String, Object>> addOrUpdateGrade(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long assessmentId = Long.valueOf(request.get("assessmentId").toString());
            BigDecimal pointsEarned = new BigDecimal(request.get("pointsEarned").toString());
            BigDecimal pointsPossible = new BigDecimal(request.get("pointsPossible").toString());
            BigDecimal percentageScore = new BigDecimal(request.get("percentageScore").toString());
            String scoreType = request.get("scoreType").toString();
            String notes = request.get("notes") != null ? request.get("notes").toString() : "";
            Boolean isExtraCredit = Boolean.valueOf(request.get("isExtraCredit").toString());
            
            Map<String, Object> result = jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ call AddOrUpdateGrade(?, ?, ?, ?, ?, ?, ?, ?, ?) }");
                    cs.setLong(1, assessmentId);
                    cs.setBigDecimal(2, pointsEarned);
                    cs.setBigDecimal(3, pointsPossible);
                    cs.setBigDecimal(4, percentageScore);
                    cs.setString(5, scoreType);
                    cs.setString(6, notes);
                    cs.setBoolean(7, isExtraCredit);
                    cs.registerOutParameter(8, Types.BIGINT);
                    cs.registerOutParameter(9, Types.VARCHAR);
                    return cs;
                },
                (CallableStatementCallback<Map<String, Object>>) cs -> {
                    cs.execute();
                    Map<String, Object> procResult = new HashMap<>();
                    procResult.put("gradeId", cs.getLong(8));
                    procResult.put("result", cs.getString(9));
                    return procResult;
                }
            );
            
            response.put("success", true);
            response.put("gradeId", result.get("gradeId"));
            response.put("result", result.get("result"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("result", "Failed to add/update grade");
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Update course grades using database stored procedure
     * Calls MySQL procedure: UpdateCourseGrades(course_id)
     */
    @PostMapping("/update-course-grades")
    public ResponseEntity<Map<String, Object>> updateCourseGrades(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long courseId = Long.valueOf(request.get("courseId").toString());
            
            jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ call UpdateCourseGrades(?) }");
                    cs.setLong(1, courseId);
                    return cs;
                },
                (CallableStatementCallback<Void>) cs -> {
                    cs.execute();
                    return null;
                }
            );
            
            response.put("success", true);
            response.put("message", "Course grades updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}

