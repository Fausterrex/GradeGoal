package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Service.AIRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI Recommendation Controller
 * Handles AI-generated recommendations and analysis
 */
@RestController
@RequestMapping("/api/ai-recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class AIRecommendationController {

    @Autowired
    private AIRecommendationService aiRecommendationService;

    /**
     * Get AI recommendations for a user
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Recommendation>> getUserAIRecommendations(
            @PathVariable Long userId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Recommendation> recommendations = aiRecommendationService.getAIRecommendations(userId, courseId, limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI recommendations for a specific course
     */
    @GetMapping("/{userId}/{courseId}")
    public ResponseEntity<List<Recommendation>> getCourseAIRecommendations(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<Recommendation> recommendations = aiRecommendationService.getAIRecommendations(userId, courseId, limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Save AI recommendations
     */
    @PostMapping
    public ResponseEntity<Recommendation> saveAIRecommendation(@RequestBody Recommendation recommendation) {
        try {
            Recommendation saved = aiRecommendationService.saveAIRecommendation(recommendation);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Mark AI recommendation as read
     */
    @PutMapping("/{recommendationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long recommendationId,
            @RequestParam Long userId) {
        try {
            boolean success = aiRecommendationService.markAsRead(recommendationId, userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Dismiss AI recommendation
     */
    @PutMapping("/{recommendationId}/dismiss")
    public ResponseEntity<Map<String, Object>> dismissRecommendation(
            @PathVariable Long recommendationId,
            @RequestParam Long userId) {
        try {
            boolean success = aiRecommendationService.dismissRecommendation(recommendationId, userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI recommendation statistics
     */
    @GetMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getAIRecommendationStats(
            @PathVariable Long userId,
            @RequestParam(required = false) Long courseId) {
        try {
            Map<String, Object> stats = aiRecommendationService.getAIRecommendationStats(userId, courseId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate AI analysis for a course
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateAIAnalysis(@RequestBody Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Long courseId = Long.valueOf(requestData.get("courseId").toString());
            String priorityLevel = requestData.get("priorityLevel").toString();
            
            Map<String, Object> analysis = aiRecommendationService.generateAIAnalysis(userId, courseId, priorityLevel);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up expired AI recommendations
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupExpiredRecommendations() {
        try {
            int deletedCount = aiRecommendationService.cleanupExpiredRecommendations();
            return ResponseEntity.ok(Map.of("deletedCount", deletedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
