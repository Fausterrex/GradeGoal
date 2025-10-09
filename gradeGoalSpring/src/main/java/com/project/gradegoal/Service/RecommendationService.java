package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Repository.AIRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing recommendations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    
    private final AIRecommendationRepository recommendationRepository;
    private final ObjectMapper objectMapper; // For JSON processing
    
    /**
     * Save AI analysis as recommendations (update existing or create new)
     * Returns a map with the saved recommendation and whether it was an update
     */
    @Transactional
    public Map<String, Object> saveAIAnalysisAsRecommendation(Long userId, Long courseId, Map<String, Object> analysisData, 
                                                        String aiModel, Double confidence) {
        try {
            log.info("Saving AI analysis as recommendation for user: {}, course: {}", userId, courseId);
            
            // Check if there's an existing AI analysis for this user and course
            Optional<Recommendation> existingAnalysis = recommendationRepository
                .findByUserIdAndCourseIdAndRecommendationTypeAndAiGeneratedTrue(
                    userId, courseId, Recommendation.RecommendationType.AI_ANALYSIS);
            
            // Extract key information from analysis data
            String title = extractTitleFromAnalysis(analysisData);
            String content = extractContentFromAnalysis(analysisData);
            Recommendation.Priority priority = extractPriorityFromAnalysis(analysisData);
            
            Recommendation recommendation;
            
            if (existingAnalysis.isPresent()) {
                // Update existing AI analysis
                recommendation = existingAnalysis.get();
                log.info("Updating existing AI analysis recommendation with ID: {}", recommendation.getRecommendationId());
                
                // Update fields
                recommendation.setTitle(title);
                recommendation.setContent(content);
                recommendation.setPriority(priority);
                recommendation.setExpiresAt(LocalDateTime.now().plusDays(30)); // Extend expiration
                recommendation.setAiConfidence(confidence);
                recommendation.setAiModel(aiModel);
                recommendation.setAiPromptHash(generatePromptHash(analysisData));
                recommendation.setMetadata(createMetadata(analysisData));
                
                // Keep existing read/dismissed status and creation date
                
            } else {
                // Create new recommendation
                log.info("Creating new AI analysis recommendation");
                recommendation = new Recommendation();
                recommendation.setUserId(userId);
                recommendation.setCourseId(courseId);
                recommendation.setRecommendationType(Recommendation.RecommendationType.AI_ANALYSIS);
                recommendation.setTitle(title);
                recommendation.setContent(content);
                recommendation.setPriority(priority);
                recommendation.setIsRead(false);
                recommendation.setIsDismissed(false);
                recommendation.setCreatedAt(LocalDateTime.now());
                recommendation.setExpiresAt(LocalDateTime.now().plusDays(30)); // Expire in 30 days
                recommendation.setAiGenerated(true);
                recommendation.setAiConfidence(confidence);
                recommendation.setAiModel(aiModel);
                recommendation.setAiPromptHash(generatePromptHash(analysisData));
                recommendation.setMetadata(createMetadata(analysisData));
            }
            
            Recommendation saved = recommendationRepository.save(recommendation);
            boolean wasUpdate = existingAnalysis.isPresent();
            log.info("Successfully {} AI analysis recommendation with ID: {}", 
                wasUpdate ? "updated" : "saved", saved.getRecommendationId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("recommendation", saved);
            result.put("isUpdate", wasUpdate);
            return result;
            
        } catch (Exception e) {
            log.error("Error saving AI analysis as recommendation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save AI analysis as recommendation", e);
        }
    }
    
    /**
     * Get AI recommendations for a user
     */
    public List<Recommendation> getAIRecommendationsForUser(Long userId) {
        return recommendationRepository.findByUserIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(userId, null);
    }
    
    /**
     * Get AI recommendations for a specific course
     */
    public List<Recommendation> getAIRecommendationsForCourse(Long userId, Long courseId) {
        return recommendationRepository.findByUserIdAndCourseIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(userId, courseId, null);
    }
    
    /**
     * Mark recommendation as read
     */
    @Transactional
    public boolean markAsRead(Long recommendationId) {
        Optional<Recommendation> optional = recommendationRepository.findById(recommendationId);
        if (optional.isPresent()) {
            Recommendation recommendation = optional.get();
            recommendation.setIsRead(true);
            recommendationRepository.save(recommendation);
            return true;
        }
        return false;
    }
    
    /**
     * Dismiss recommendation
     */
    @Transactional
    public boolean dismissRecommendation(Long recommendationId) {
        Optional<Recommendation> optional = recommendationRepository.findById(recommendationId);
        if (optional.isPresent()) {
            Recommendation recommendation = optional.get();
            recommendation.setIsDismissed(true);
            recommendationRepository.save(recommendation);
            return true;
        }
        return false;
    }
    
    /**
     * Extract title from analysis data
     */
    private String extractTitleFromAnalysis(Map<String, Object> analysisData) {
        // Try to get title from topPriorityRecommendations
        if (analysisData.containsKey("topPriorityRecommendations")) {
            Object recommendations = analysisData.get("topPriorityRecommendations");
            if (recommendations instanceof List && !((List<?>) recommendations).isEmpty()) {
                Object firstRec = ((List<?>) recommendations).get(0);
                if (firstRec instanceof Map) {
                    Map<?, ?> recMap = (Map<?, ?>) firstRec;
                    Object title = recMap.get("title");
                    if (title != null) {
                        return title.toString();
                    }
                }
            }
        }
        
        // Fallback to status update
        if (analysisData.containsKey("statusUpdate")) {
            Object statusUpdate = analysisData.get("statusUpdate");
            if (statusUpdate instanceof Map) {
                Map<?, ?> statusMap = (Map<?, ?>) statusUpdate;
                Object currentStatus = statusMap.get("currentStatus");
                if (currentStatus != null) {
                    return "AI Analysis - " + currentStatus.toString();
                }
            }
        }
        
        return "AI Analysis - Course Insights";
    }
    
    /**
     * Extract content from analysis data
     */
    private String extractContentFromAnalysis(Map<String, Object> analysisData) {
        // Convert analysis data to JSON string for storage
        try {
            return objectMapper.writeValueAsString(analysisData);
        } catch (Exception e) {
            log.warn("Failed to serialize analysis data to JSON: {}", e.getMessage());
            return analysisData.toString();
        }
    }
    
    /**
     * Extract priority from analysis data
     */
    private Recommendation.Priority extractPriorityFromAnalysis(Map<String, Object> analysisData) {
        // Check status update for priority indication
        if (analysisData.containsKey("statusUpdate")) {
            Object statusUpdate = analysisData.get("statusUpdate");
            if (statusUpdate instanceof Map) {
                Map<?, ?> statusMap = (Map<?, ?>) statusUpdate;
                Object currentStatus = statusMap.get("currentStatus");
                if (currentStatus != null) {
                    String status = currentStatus.toString().toUpperCase();
                    if (status.contains("AT_RISK") || status.contains("URGENT")) {
                        return Recommendation.Priority.HIGH;
                    } else if (status.contains("ON_TRACK")) {
                        return Recommendation.Priority.MEDIUM;
                    } else if (status.contains("EXCELLING")) {
                        return Recommendation.Priority.LOW;
                    }
                }
            }
        }
        
        // Check target goal analysis
        if (analysisData.containsKey("targetGoalAnalysis")) {
            Object targetAnalysis = analysisData.get("targetGoalAnalysis");
            if (targetAnalysis instanceof Map) {
                Map<?, ?> targetMap = (Map<?, ?>) targetAnalysis;
                Object achievable = targetMap.get("achievable");
                if (achievable != null && !Boolean.parseBoolean(achievable.toString())) {
                    return Recommendation.Priority.HIGH;
                }
            }
        }
        
        return Recommendation.Priority.MEDIUM;
    }
    
    /**
     * Generate a simple hash for the prompt
     */
    private String generatePromptHash(Map<String, Object> analysisData) {
        // Create a simple hash based on key analysis components
        StringBuilder hashInput = new StringBuilder();
        hashInput.append(analysisData.getOrDefault("predictedFinalGrade", ""));
        hashInput.append(analysisData.getOrDefault("statusUpdate", ""));
        hashInput.append(analysisData.getOrDefault("targetGoalAnalysis", ""));
        
        return String.valueOf(hashInput.toString().hashCode());
    }
    
    /**
     * Create metadata from analysis data
     */
    private String createMetadata(Map<String, Object> analysisData) {
        try {
            Map<String, Object> metadata = Map.of(
                "analysisType", "AI_COURSE_ANALYSIS",
                "hasRecommendations", analysisData.containsKey("topPriorityRecommendations"),
                "hasPredictions", analysisData.containsKey("predictedFinalGrade"),
                "hasStatusUpdate", analysisData.containsKey("statusUpdate"),
                "hasGoalAnalysis", analysisData.containsKey("targetGoalAnalysis"),
                "createdAt", LocalDateTime.now().toString()
            );
            
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to create metadata: {}", e.getMessage());
            return "{\"analysisType\":\"AI_COURSE_ANALYSIS\"}";
        }
    }
}
