package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.AIAnalysis;
import com.project.gradegoal.Entity.AIAssessmentPrediction;
import com.project.gradegoal.Repository.AIAnalysisRepository;
import com.project.gradegoal.Repository.AIAssessmentPredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisPersistenceService {
    
    private final AIAnalysisRepository aiAnalysisRepository;
    private final AIAssessmentPredictionRepository aiAssessmentPredictionRepository;
    
    /**
     * Save AI analysis to database
     */
    @Transactional
    public AIAnalysis saveAIAnalysis(Long userId, Long courseId, String analysisData, 
                                   AIAnalysis.AnalysisType analysisType, String aiModel, Double confidence) {
        try {
            // Check if analysis already exists and deactivate it
            Optional<AIAnalysis> existingAnalysis = aiAnalysisRepository.findActiveAnalysisByUserAndCourse(
                userId, courseId, LocalDateTime.now()
            );
            
            if (existingAnalysis.isPresent()) {
                AIAnalysis existing = existingAnalysis.get();
                existing.setIsActive(false);
                aiAnalysisRepository.save(existing);
            }
            
            // Create new analysis
            AIAnalysis newAnalysis = new AIAnalysis();
            newAnalysis.setUserId(userId);
            newAnalysis.setCourseId(courseId);
            newAnalysis.setAnalysisType(analysisType);
            newAnalysis.setAnalysisData(analysisData);
            newAnalysis.setAiModel(aiModel);
            newAnalysis.setAiConfidence(confidence);
            newAnalysis.setExpiresAt(LocalDateTime.now().plusDays(30)); // 30 days cache
            newAnalysis.setIsActive(true);
            
            AIAnalysis saved = aiAnalysisRepository.save(newAnalysis);
            log.info("Saved AI analysis for user {} course {} with type {}", userId, courseId, analysisType);
            return saved;
            
        } catch (Exception e) {
            log.error("Error saving AI analysis for user {} course {}", userId, courseId, e);
            throw new RuntimeException("Failed to save AI analysis", e);
        }
    }
    
    /**
     * Get AI analysis from database
     */
    public Optional<AIAnalysis> getAIAnalysis(Long userId, Long courseId) {
        try {
            return aiAnalysisRepository.findActiveAnalysisByUserAndCourse(userId, courseId, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error retrieving AI analysis for user {} course {}", userId, courseId, e);
            return Optional.empty();
        }
    }
    
    /**
     * Save AI assessment prediction
     */
    @Transactional
    public AIAssessmentPrediction saveAssessmentPrediction(Long userId, Long courseId, Long assessmentId,
                                                         Double predictedScore, Double predictedPercentage, Double predictedGpa,
                                                         AIAssessmentPrediction.ConfidenceLevel confidenceLevel,
                                                         Double recommendedScore, Double recommendedPercentage,
                                                         String analysisReasoning) {
        try {
            // Check if prediction already exists and deactivate it
            Optional<AIAssessmentPrediction> existingPrediction = aiAssessmentPredictionRepository.findActivePredictionByAssessment(
                assessmentId, userId, LocalDateTime.now()
            );
            
            if (existingPrediction.isPresent()) {
                AIAssessmentPrediction existing = existingPrediction.get();
                existing.setIsActive(false);
                aiAssessmentPredictionRepository.save(existing);
            }
            
            // Create new prediction
            AIAssessmentPrediction newPrediction = new AIAssessmentPrediction();
            newPrediction.setUserId(userId);
            newPrediction.setCourseId(courseId);
            newPrediction.setAssessmentId(assessmentId);
            newPrediction.setPredictedScore(predictedScore != null ? BigDecimal.valueOf(predictedScore) : null);
            newPrediction.setPredictedPercentage(predictedPercentage != null ? BigDecimal.valueOf(predictedPercentage) : null);
            newPrediction.setPredictedGpa(predictedGpa != null ? BigDecimal.valueOf(predictedGpa) : null);
            newPrediction.setConfidenceLevel(confidenceLevel);
            newPrediction.setRecommendedScore(recommendedScore != null ? BigDecimal.valueOf(recommendedScore) : null);
            newPrediction.setRecommendedPercentage(recommendedPercentage != null ? BigDecimal.valueOf(recommendedPercentage) : null);
            newPrediction.setAnalysisReasoning(analysisReasoning);
            newPrediction.setExpiresAt(LocalDateTime.now().plusHours(2)); // 2 hour cache for predictions
            newPrediction.setIsActive(true);
            
            AIAssessmentPrediction saved = aiAssessmentPredictionRepository.save(newPrediction);
            log.info("Saved AI assessment prediction for user {} assessment {}", userId, assessmentId);
            return saved;
            
        } catch (Exception e) {
            log.error("Error saving AI assessment prediction for user {} assessment {}", userId, assessmentId, e);
            throw new RuntimeException("Failed to save AI assessment prediction", e);
        }
    }
    
    /**
     * Get AI assessment predictions for a course
     */
    public List<AIAssessmentPrediction> getAssessmentPredictions(Long userId, Long courseId) {
        try {
            return aiAssessmentPredictionRepository.findActivePredictionsByCourse(courseId, userId, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error retrieving AI assessment predictions for user {} course {}", userId, courseId, e);
            return List.of();
        }
    }
    
    /**
     * Get AI assessment prediction for specific assessment
     */
    public Optional<AIAssessmentPrediction> getAssessmentPrediction(Long userId, Long assessmentId) {
        try {
            return aiAssessmentPredictionRepository.findActivePredictionByAssessment(assessmentId, userId, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error retrieving AI assessment prediction for user {} assessment {}", userId, assessmentId, e);
            return Optional.empty();
        }
    }
    
    /**
     * Clean up expired analysis and predictions
     */
    @Transactional
    public void cleanupExpiredAnalysis() {
        try {
            int expiredAnalysis = aiAnalysisRepository.deactivateExpiredAnalysis(LocalDateTime.now());
            int expiredPredictions = aiAssessmentPredictionRepository.deactivateExpiredPredictions(LocalDateTime.now());
            log.info("Cleaned up {} expired AI analysis and {} expired predictions", expiredAnalysis, expiredPredictions);
        } catch (Exception e) {
            log.error("Error cleaning up expired AI analysis", e);
        }
    }
    
    /**
     * Check if analysis exists and is valid
     */
    public boolean hasValidAnalysis(Long userId, Long courseId) {
        try {
            return aiAnalysisRepository.existsActiveAnalysis(userId, courseId, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error checking AI analysis validity for user {} course {}", userId, courseId, e);
            return false;
        }
    }
}
