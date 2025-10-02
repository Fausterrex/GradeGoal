package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.AIAnalysis;
import com.project.gradegoal.Entity.AIAssessmentPrediction;
import com.project.gradegoal.Service.AIAnalysisPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai-analysis")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AIAnalysisController {
    
    private final AIAnalysisPersistenceService aiAnalysisPersistenceService;
    
    /**
     * Save AI analysis to database
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveAIAnalysis(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long courseId = Long.valueOf(request.get("courseId").toString());
            String analysisData = request.get("analysisData").toString();
            String analysisType = request.getOrDefault("analysisType", "COURSE_ANALYSIS").toString();
            String aiModel = request.getOrDefault("aiModel", "gemini-2.0-flash-exp").toString();
            Double confidence = Double.valueOf(request.getOrDefault("confidence", "0.85").toString());
            
            AIAnalysis.AnalysisType type = AIAnalysis.AnalysisType.valueOf(analysisType);
            AIAnalysis saved = aiAnalysisPersistenceService.saveAIAnalysis(
                userId, courseId, analysisData, type, aiModel, confidence
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("analysisId", saved.getId());
            response.put("message", "AI analysis saved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error saving AI analysis", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get AI analysis from database
     */
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> getAIAnalysis(@PathVariable Long courseId, @PathVariable Long userId) {
        try {
            Optional<AIAnalysis> analysis;
            
            // Handle special case for semester-level analysis (courseId = 0)
            if (courseId == 0) {
                // For semester-level analysis, get the most recent analysis for the user
                analysis = aiAnalysisPersistenceService.getLatestAIAnalysisForUser(userId);
            } else {
                analysis = aiAnalysisPersistenceService.getAIAnalysis(userId, courseId);
            }
            
            Map<String, Object> response = new HashMap<>();
            if (analysis.isPresent()) {
                response.put("success", true);
                response.put("analysis", analysis.get());
                response.put("hasAnalysis", true);
            } else {
                response.put("success", true);
                response.put("hasAnalysis", false);
                response.put("message", "No AI analysis found");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving AI analysis for course {} user {}", courseId, userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Save AI assessment prediction
     */
    @PostMapping("/assessment-prediction/save")
    public ResponseEntity<Map<String, Object>> saveAssessmentPrediction(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Long assessmentId = Long.valueOf(request.get("assessmentId").toString());
            
            Double predictedScore = request.get("predictedScore") != null ? 
                Double.valueOf(request.get("predictedScore").toString()) : null;
            Double predictedPercentage = request.get("predictedPercentage") != null ? 
                Double.valueOf(request.get("predictedPercentage").toString()) : null;
            Double predictedGpa = request.get("predictedGpa") != null ? 
                Double.valueOf(request.get("predictedGpa").toString()) : null;
            
            String confidenceLevelStr = request.getOrDefault("confidenceLevel", "MEDIUM").toString();
            AIAssessmentPrediction.ConfidenceLevel confidenceLevel = 
                AIAssessmentPrediction.ConfidenceLevel.valueOf(confidenceLevelStr);
            
            Double recommendedScore = request.get("recommendedScore") != null ? 
                Double.valueOf(request.get("recommendedScore").toString()) : null;
            Double recommendedPercentage = request.get("recommendedPercentage") != null ? 
                Double.valueOf(request.get("recommendedPercentage").toString()) : null;
            
            String analysisReasoning = request.get("analysisReasoning") != null ? 
                request.get("analysisReasoning").toString() : null;
            
            AIAssessmentPrediction saved = aiAnalysisPersistenceService.saveAssessmentPrediction(
                userId, courseId, assessmentId, predictedScore, predictedPercentage, predictedGpa,
                confidenceLevel, recommendedScore, recommendedPercentage, analysisReasoning
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("predictionId", saved.getId());
            response.put("message", "AI assessment prediction saved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error saving AI assessment prediction", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get AI assessment predictions for a course
     */
    @GetMapping("/course/{courseId}/user/{userId}/predictions")
    public ResponseEntity<Map<String, Object>> getAssessmentPredictions(@PathVariable Long courseId, @PathVariable Long userId) {
        try {
            List<AIAssessmentPrediction> predictions = aiAnalysisPersistenceService.getAssessmentPredictions(userId, courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("predictions", predictions);
            response.put("count", predictions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving AI assessment predictions for course {} user {}", courseId, userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get AI assessment prediction for specific assessment
     */
    @GetMapping("/assessment/{assessmentId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> getAssessmentPrediction(@PathVariable Long assessmentId, @PathVariable Long userId) {
        try {
            Optional<AIAssessmentPrediction> prediction = aiAnalysisPersistenceService.getAssessmentPrediction(userId, assessmentId);
            
            Map<String, Object> response = new HashMap<>();
            if (prediction.isPresent()) {
                response.put("success", true);
                response.put("prediction", prediction.get());
                response.put("hasPrediction", true);
            } else {
                response.put("success", true);
                response.put("hasPrediction", false);
                response.put("message", "No AI prediction found for this assessment");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving AI assessment prediction for assessment {} user {}", assessmentId, userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Check if AI analysis exists
     */
    @GetMapping("/course/{courseId}/user/{userId}/exists")
    public ResponseEntity<Map<String, Object>> checkAnalysisExists(@PathVariable Long courseId, @PathVariable Long userId) {
        try {
            // Handle special case for semester-level analysis (courseId = 0)
            boolean exists;
            if (courseId == 0) {
                // For semester-level analysis, check if user has any active analysis
                exists = aiAnalysisPersistenceService.hasValidAnalysisForUser(userId);
            } else {
                exists = aiAnalysisPersistenceService.hasValidAnalysis(userId, courseId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("exists", exists);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking AI analysis existence for course {} user {}", courseId, userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Clean up expired analysis
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupExpiredAnalysis() {
        try {
            aiAnalysisPersistenceService.cleanupExpiredAnalysis();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Expired AI analysis cleaned up successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error cleaning up expired AI analysis", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
