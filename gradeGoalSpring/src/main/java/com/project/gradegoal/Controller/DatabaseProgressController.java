package com.project.gradegoal.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;

import java.sql.CallableStatement;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling database progress and achievement functions
 * Interfaces with MySQL stored procedures for user progress tracking
 */
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class DatabaseProgressController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Award points to user using database stored procedure
     * Calls MySQL procedure: AwardPoints(user_id, points, activity_type)
     */
    @PostMapping("/award-points")
    public ResponseEntity<Map<String, Object>> awardPoints(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Integer points = Integer.valueOf(request.get("points").toString());
            String activityType = request.get("activityType").toString();
            
            jdbcTemplate.execute(
                (CallableStatementCreator) con -> {
                    CallableStatement cs = con.prepareCall("{ call AwardPoints(?, ?, ?) }");
                    cs.setLong(1, userId);
                    cs.setInt(2, points);
                    cs.setString(3, activityType);
                    return cs;
                },
                (CallableStatementCallback<Void>) cs -> {
                    cs.execute();
                    return null;
                }
            );
            
            response.put("success", true);
            response.put("message", "Points awarded successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}

