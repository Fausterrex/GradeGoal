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
 * Debug Controller for troubleshooting database issues
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:5173")
public class DebugController {

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    /**
     * Test database connection and basic operations
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> testDatabase() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test if we can count records
            long count = aiRecommendationRepository.count();
            result.put("totalRecommendations", count);
            
            // Test if we can find all records
            var allRecommendations = aiRecommendationRepository.findAll();
            result.put("allRecommendations", allRecommendations);
            
            result.put("status", "success");
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
     * Test creating a simple recommendation with minimal fields
     */
    @PostMapping("/test-recommendation")
    public ResponseEntity<Map<String, Object>> testCreateRecommendation() {
        try {
            Recommendation recommendation = new Recommendation();
            recommendation.setUserId(1L);
            recommendation.setCourseId(1L);
            recommendation.setRecommendationType(Recommendation.RecommendationType.STUDY_STRATEGY);
            recommendation.setTitle("Debug Test");
            recommendation.setContent("This is a debug test");
            recommendation.setPriority(Recommendation.Priority.MEDIUM);
            recommendation.setCreatedAt(LocalDateTime.now());
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
}
