package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Repository.AIRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple Test Controller for basic database operations
 */
@RestController
@RequestMapping("/api/simple-test")
@CrossOrigin(origins = "http://localhost:5173")
public class SimpleTestController {

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    /**
     * Test creating a very basic recommendation
     */
    @PostMapping("/basic-recommendation")
    public ResponseEntity<Map<String, Object>> testBasicRecommendation() {
        try {
            Recommendation recommendation = new Recommendation();
            recommendation.setUserId(1L);
            recommendation.setCourseId(1L);
            recommendation.setRecommendationType(Recommendation.RecommendationType.STUDY_STRATEGY);
            recommendation.setTitle("Basic Test");
            recommendation.setContent("This is a basic test");
            recommendation.setPriority(Recommendation.Priority.MEDIUM);
            recommendation.setCreatedAt(LocalDateTime.now());
            
            // Don't set AI fields for now
            recommendation.setAiGenerated(false);
            
            Recommendation saved = aiRecommendationRepository.save(recommendation);
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("savedRecommendation", saved);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            error.put("stackTrace", e.getStackTrace());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Simple health check without database operations
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("message", "Spring Boot application is running");
        return ResponseEntity.ok(health);
    }
}
