package com.project.gradegoal.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
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
    private final Environment environment;
    
    /**
     * Save AI analysis as recommendation
     */
    @PostMapping("/save-ai-analysis")
    public ResponseEntity<Map<String, Object>> saveAIAnalysisAsRecommendation(@RequestBody Map<String, Object> request) {
        try {
            log.info("Received AI analysis save request: {}", request.keySet());
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Long courseId = Long.valueOf(request.get("courseId").toString());
            
            // Handle analysisData - it could be a Map or a String
            Map<String, Object> analysisData;
            Object analysisDataObj = request.get("analysisData");
            if (analysisDataObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> tempAnalysisData = (Map<String, Object>) analysisDataObj;
                analysisData = tempAnalysisData;
                log.info("Analysis data received as Map with {} keys", analysisData.size());
            } else if (analysisDataObj instanceof String) {
                // Parse JSON string to Map
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> tempAnalysisData = objectMapper.readValue((String) analysisDataObj, Map.class);
                    analysisData = tempAnalysisData;
                    log.info("Analysis data parsed from JSON string with {} keys", analysisData.size());
                } catch (Exception e) {
                    log.error("Failed to parse analysis data JSON string: {}", e.getMessage());
                    throw new IllegalArgumentException("Invalid analysis data format: " + e.getMessage());
                }
            } else {
                log.error("Analysis data is neither Map nor String: {}", analysisDataObj.getClass());
                throw new IllegalArgumentException("Analysis data must be a Map or JSON string");
            }
            
            String aiModel = request.getOrDefault("aiModel", 
                environment.getProperty("ai.model", "llama-3.1-8b-instant")).toString();
            Double confidence = Double.valueOf(request.getOrDefault("confidence", "0.7").toString());
            
            log.info("Processing AI analysis for user: {}, course: {}, model: {}, confidence: {}", 
                    userId, courseId, aiModel, confidence);
            
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
            log.error("Request data: userId={}, courseId={}, analysisData type={}", 
                    request.get("userId"), request.get("courseId"), 
                    request.get("analysisData") != null ? request.get("analysisData").getClass().getSimpleName() : "null");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());
            
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
     * Get AI analysis for a specific course
     */
    @GetMapping("/user/{userId}/course/{courseId}/ai-analysis")
    public ResponseEntity<Map<String, Object>> getAIAnalysisForCourse(
            @PathVariable Long userId, @PathVariable Long courseId) {
        try {
            List<Recommendation> recommendations = recommendationService.getAIRecommendationsForCourse(userId, courseId);
            
            // Filter for AI_ANALYSIS type recommendations
            List<Recommendation> aiAnalysisRecommendations = recommendations.stream()
                .filter(rec -> rec.getRecommendationType() == Recommendation.RecommendationType.AI_ANALYSIS)
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", aiAnalysisRecommendations);
            response.put("count", aiAnalysisRecommendations.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting AI analysis for user {} course {}: {}", userId, courseId, e.getMessage(), e);
            
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
