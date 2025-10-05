package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing recommendations
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    /**
     * Save AI analysis as recommendation
     */
    @PostMapping("/save-ai-analysis")
    public ResponseEntity<Map<String, Object>> saveAIAnalysisAsRecommendation(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Map<String, Object> analysisData = (Map<String, Object>) request.get("analysisData");
            String aiModel = request.getOrDefault("aiModel", "gemini-2.0-flash-exp").toString();
            Double confidence = Double.valueOf(request.getOrDefault("confidence", "0.85").toString());
            
            Map<String, Object> result = recommendationService.saveAIAnalysisAsRecommendation(
                userId, courseId, analysisData, aiModel, confidence
            );
            
            Recommendation saved = (Recommendation) result.get("recommendation");
            boolean isUpdate = (Boolean) result.get("isUpdate");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendationId", saved.getRecommendationId());
            response.put("message", isUpdate ? "AI analysis updated successfully" : "AI analysis saved as recommendation successfully");
            response.put("isUpdate", isUpdate);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error saving AI analysis as recommendation: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get AI recommendations for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getAIRecommendationsForUser(@PathVariable Long userId) {
        try {
            List<Recommendation> recommendations = recommendationService.getAIRecommendationsForUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting AI recommendations for user {}: {}", userId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get AI recommendations for a specific course
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Map<String, Object>> getAIRecommendationsForCourse(
            @PathVariable Long userId, @PathVariable Long courseId) {
        try {
            List<Recommendation> recommendations = recommendationService.getAIRecommendationsForCourse(userId, courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting AI recommendations for user {} course {}: {}", userId, courseId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Mark recommendation as read
     */
    @PutMapping("/{recommendationId}/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long recommendationId) {
        try {
            boolean success = recommendationService.markAsRead(recommendationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Recommendation marked as read" : "Recommendation not found");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error marking recommendation {} as read: {}", recommendationId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Dismiss recommendation
     */
    @PutMapping("/{recommendationId}/dismiss")
    public ResponseEntity<Map<String, Object>> dismissRecommendation(@PathVariable Long recommendationId) {
        try {
            boolean success = recommendationService.dismissRecommendation(recommendationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Recommendation dismissed" : "Recommendation not found");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error dismissing recommendation {}: {}", recommendationId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
