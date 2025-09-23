package com.project.gradegoal.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;

import java.sql.CallableStatement;
import java.sql.Types;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling database analytics-related functions
 * Interfaces with MySQL stored procedures for user analytics
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class DatabaseAnalyticsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Update user analytics using database stored procedure
     * Calls MySQL procedure: UpdateUserAnalytics(user_id, course_id)
     */
    @PostMapping("/update-user-analytics")
    public ResponseEntity<Map<String, Object>> updateUserAnalytics(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long courseId = request.get("courseId") != null ? 
                Long.valueOf(request.get("courseId").toString()) : null;
            
            jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ call UpdateUserAnalytics(?, ?) }");
                    cs.setLong(1, userId);
                    if (courseId != null) {
                        cs.setLong(2, courseId);
                    } else {
                        cs.setNull(2, Types.BIGINT);
                    }
                    return cs;
                },
                (CallableStatementCallback<Void>) cs -> {
                    cs.execute();
                    return null;
                }
            );
            
            response.put("success", true);
            response.put("message", "User analytics updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}

