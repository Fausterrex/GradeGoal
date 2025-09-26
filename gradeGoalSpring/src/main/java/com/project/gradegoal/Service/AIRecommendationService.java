package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Recommendation;
import com.project.gradegoal.Repository.AIRecommendationRepository;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.GradeRepository;
import com.project.gradegoal.Repository.AssessmentRepository;
import com.project.gradegoal.Repository.AssessmentCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Recommendation Service
 * Handles AI-generated recommendations and analysis
 */
@Service
@Transactional
public class AIRecommendationService {

    @Autowired
    private AIRecommendationRepository aiRecommendationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;

    /**
     * Get AI recommendations for a user
     */
    public List<Recommendation> getAIRecommendations(Long userId, Long courseId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        if (courseId != null) {
            return aiRecommendationRepository.findByUserIdAndCourseIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(userId, courseId, pageable);
        } else {
            return aiRecommendationRepository.findByUserIdAndAiGeneratedTrueOrderByPriorityDescCreatedAtDesc(userId, pageable);
        }
    }

    /**
     * Save AI recommendation
     */
    public Recommendation saveAIRecommendation(Recommendation recommendation) {
        // Set AI-specific fields
        recommendation.setAiGenerated(true);
        recommendation.setCreatedAt(LocalDateTime.now());
        
        // Set default expiration (30 days from now)
        if (recommendation.getExpiresAt() == null) {
            recommendation.setExpiresAt(LocalDateTime.now().plus(30, ChronoUnit.DAYS));
        }

        return aiRecommendationRepository.save(recommendation);
    }

    /**
     * Mark recommendation as read
     */
    public boolean markAsRead(Long recommendationId, Long userId) {
        try {
            Optional<Recommendation> recommendation = aiRecommendationRepository.findById(recommendationId);
            if (recommendation.isPresent() && recommendation.get().getUserId().equals(userId)) {
                recommendation.get().setIsRead(true);
                aiRecommendationRepository.save(recommendation.get());
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Dismiss recommendation
     */
    public boolean dismissRecommendation(Long recommendationId, Long userId) {
        try {
            Optional<Recommendation> recommendation = aiRecommendationRepository.findById(recommendationId);
            if (recommendation.isPresent() && recommendation.get().getUserId().equals(userId)) {
                recommendation.get().setIsDismissed(true);
                aiRecommendationRepository.save(recommendation.get());
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get AI recommendation statistics
     */
    public Map<String, Object> getAIRecommendationStats(Long userId, Long courseId) {
        List<Recommendation> recommendations;
        
        if (courseId != null) {
            recommendations = aiRecommendationRepository.findByUserIdAndCourseIdAndAiGeneratedTrue(userId, courseId);
        } else {
            recommendations = aiRecommendationRepository.findByUserIdAndAiGeneratedTrue(userId);
        }

        // Filter out dismissed recommendations
        recommendations = recommendations.stream()
                .filter(rec -> !rec.getIsDismissed())
                .collect(Collectors.toList());

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecommendations", recommendations.size());
        stats.put("unreadCount", recommendations.stream().mapToInt(rec -> rec.getIsRead() ? 0 : 1).sum());
        stats.put("highPriorityCount", recommendations.stream().mapToInt(rec -> "HIGH".equals(rec.getPriority()) ? 1 : 0).sum());
        stats.put("recentCount", recommendations.stream().mapToInt(rec -> rec.getCreatedAt().isAfter(sevenDaysAgo) ? 1 : 0).sum());
        
        // Calculate average confidence
        double avgConfidence = recommendations.stream()
                .filter(rec -> rec.getAiConfidence() != null)
                .mapToDouble(Recommendation::getAiConfidence)
                .average()
                .orElse(0.0);
        stats.put("avgConfidence", avgConfidence);

        return stats;
    }

    /**
     * Generate AI analysis for a course
     * This is a placeholder - in a real implementation, you would integrate with Gemini AI
     */
    public Map<String, Object> generateAIAnalysis(Long userId, Long courseId, String priorityLevel) {
        try {
            // Get course data
            var course = courseRepository.findById(courseId);
            if (course.isEmpty()) {
                throw new RuntimeException("Course not found");
            }

            // Get grades for the course
            var grades = gradeRepository.findAll(); // We'll filter by course later
            
            // Get assessment categories
            var categories = assessmentCategoryRepository.findByCourseId(courseId);

            // This is where you would integrate with Gemini AI
            // For now, we'll create a mock analysis
            Map<String, Object> analysis = createMockAIAnalysis(course.get(), grades, categories, priorityLevel);

            // Save the analysis as a recommendation
            Recommendation recommendation = new Recommendation();
            recommendation.setUserId(userId);
            recommendation.setCourseId(courseId);
            recommendation.setRecommendationType(Recommendation.RecommendationType.AI_ANALYSIS);
            recommendation.setTitle("AI Analysis for " + course.get().getCourseName());
            recommendation.setContent(analysis.toString());
            recommendation.setPriority(Recommendation.Priority.valueOf(priorityLevel));
            recommendation.setAiGenerated(true);
            recommendation.setAiConfidence(0.85);
            recommendation.setAiModel("gemini-1.5-flash");
            recommendation.setCreatedAt(LocalDateTime.now());
            recommendation.setExpiresAt(LocalDateTime.now().plus(30, ChronoUnit.DAYS));

            aiRecommendationRepository.save(recommendation);

            return analysis;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI analysis: " + e.getMessage());
        }
    }

    /**
     * Clean up expired AI recommendations
     */
    public int cleanupExpiredRecommendations() {
        LocalDateTime now = LocalDateTime.now();
        List<Recommendation> expired = aiRecommendationRepository.findByAiGeneratedTrueAndExpiresAtBefore(now);
        
        aiRecommendationRepository.deleteAll(expired);
        return expired.size();
    }

    /**
     * Create mock AI analysis (replace with actual Gemini AI integration)
     */
    private Map<String, Object> createMockAIAnalysis(Object course, List<?> grades, List<?> categories, String priorityLevel) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Mock predicted final grade
        Map<String, Object> predictedFinalGrade = new HashMap<>();
        predictedFinalGrade.put("percentage", "85.5");
        predictedFinalGrade.put("gpa", "3.2");
        predictedFinalGrade.put("confidence", "MEDIUM");
        predictedFinalGrade.put("reasoning", "Based on current performance trends and remaining assessments");
        analysis.put("predictedFinalGrade", predictedFinalGrade);

        // Mock assessment recommendations
        List<Map<String, Object>> assessmentRecommendations = new ArrayList<>();
        Map<String, Object> rec1 = new HashMap<>();
        rec1.put("category", "Assignments");
        rec1.put("recommendedGrade", "90%");
        rec1.put("reasoning", "Focus on detailed analysis and thorough research");
        rec1.put("priority", "HIGH");
        assessmentRecommendations.add(rec1);
        analysis.put("assessmentRecommendations", assessmentRecommendations);

        // Mock target goal probability
        Map<String, Object> targetGoalProbability = new HashMap<>();
        targetGoalProbability.put("achievable", true);
        targetGoalProbability.put("probability", "75%");
        targetGoalProbability.put("requiredGrades", "Maintain 85%+ on remaining assessments");
        targetGoalProbability.put("recommendations", "Focus on consistent study habits and time management");
        analysis.put("targetGoalProbability", targetGoalProbability);

        // Mock status update
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("currentStatus", "On track");
        statusUpdate.put("trend", "improving");
        statusUpdate.put("keyInsights", Arrays.asList(
            "Strong performance in assignments",
            "Need to improve exam preparation",
            "Consistent study schedule recommended"
        ));
        analysis.put("statusUpdate", statusUpdate);

        // Mock study habits
        List<Map<String, Object>> studyHabits = new ArrayList<>();
        Map<String, Object> habit1 = new HashMap<>();
        habit1.put("habit", "Daily review of lecture notes");
        habit1.put("reasoning", "Helps reinforce learning and identify knowledge gaps");
        habit1.put("priority", "HIGH");
        studyHabits.add(habit1);
        analysis.put("studyHabits", studyHabits);

        return analysis;
    }
}
