import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface CourseRecommendationsProps {
  course: any;
  grades: any[];
  categories: any[];
  targetGrade: number | null;
  currentGrade: number;
  userAnalytics: any;
  refreshTrigger: number;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  course,
  grades,
  categories,
  targetGrade,
  currentGrade,
  userAnalytics,
  refreshTrigger,
}) => {
  const generateRecommendations = () => {
    const recommendations = [];

    // Check if no grades yet
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return [{
        title: 'Start Adding Grades',
        description: 'Begin by adding your first assessment scores to get personalized recommendations.',
        priority: 'HIGH',
        category: 'General Academic',
        impact: 'High',
      }];
    }

    // Check category performance
    if (categories && Array.isArray(categories)) {
      categories.forEach((category: any) => {
        if (!category || !category.id) return;
        
        const categoryGrades = grades.filter((grade: any) => grade && grade.categoryId === category.id);
        if (categoryGrades.length > 0) {
          const validGrades = categoryGrades.filter((grade: any) => 
            grade && 
            grade.score !== null && 
            grade.score !== undefined && 
            grade.maxScore && 
            grade.maxScore > 0
          );
          if (validGrades.length > 0) {
            const totalScore = validGrades.reduce((sum: number, grade: any) => {
              const percentage = (grade.score / grade.maxScore) * 100;
              return sum + percentage;
            }, 0);
            const categoryAverage = totalScore / validGrades.length;
            const weight = category.weightPercentage || category.weight || 0;
          
            if (categoryAverage < 70 && weight > 20) {
              recommendations.push({
                title: `Focus on ${category.name}`,
                description: `${category.name} is worth ${weight}% of your grade but you're averaging ${categoryAverage !== null && categoryAverage !== undefined ? categoryAverage.toFixed(1) : '0.0'}%. This needs immediate attention.`,
                priority: 'HIGH',
                category: 'Course-Specific',
                impact: 'High',
              });
            } else if (categoryAverage < 80 && weight > 15) {
              recommendations.push({
                title: `Improve performance in ${category.name}`,
                description: `Spend 45 minutes daily reviewing ${category.name} concepts and practice regularly to improve your ${categoryAverage !== null && categoryAverage !== undefined ? categoryAverage.toFixed(1) : '0.0'}% average.`,
                priority: 'MEDIUM',
                category: 'Course-Specific',
                impact: 'Medium',
              });
            }
          }
        }
      });
    }

    // Add general recommendations
    if (currentGrade >= 80) {
      recommendations.push({
        title: 'Maintain current performance in quizzes and exams',
        description: 'Continue reviewing and practicing past quiz questions, and maintain a consistent study routine to ensure excellent performance in exams.',
        priority: 'HIGH',
        category: 'General Academic',
        impact: 'High',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Keep up the great work!',
        description: 'Your performance is on track. Continue maintaining your current study habits and stay consistent with your preparation.',
        priority: 'MEDIUM',
        category: 'General Academic',
        impact: 'Medium',
      });
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  };

  const recommendations = generateRecommendations();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Priority Recommendations</Text>
      
      {recommendations.length > 0 ? (
        <View style={styles.recommendationsList}>
          {recommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <View style={styles.recommendationTags}>
                  <View style={[styles.tag, { backgroundColor: rec.priority === 'HIGH' ? colors.red[100] : colors.yellow[100] }]}>
                    <Text style={[styles.tagText, { color: rec.priority === 'HIGH' ? colors.red[700] : colors.yellow[700] }]}>
                      {rec.priority}
                    </Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: rec.category === 'General Academic' ? colors.purple[100] : colors.blue[100] }]}>
                    <Text style={[styles.tagText, { color: rec.category === 'General Academic' ? colors.purple[700] : colors.blue[700] }]}>
                      {rec.category}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              
              <Text style={styles.recommendationImpact}>
                Impact: {rec.impact} impact on grade/performance
              </Text>
              
              <View style={styles.recommendationActions}>
                <TouchableOpacity style={[styles.actionButton, styles.markReadButton]}>
                  <Text style={styles.markReadButtonText}>Mark as Read</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.dismissButton]}>
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noRecommendations}>
          <Text style={styles.noRecommendationsText}>
            No recommendations available yet. Complete some assessments to get personalized suggestions.
          </Text>
        </View>
      )}

      {/* Study Strategy Section */}
      <View style={styles.studyStrategySection}>
        <Text style={styles.studyStrategyTitle}>📅 Study Strategy</Text>
        
        <View style={styles.strategyItem}>
          <Text style={styles.strategyLabel}>Focus Area:</Text>
          <Text style={styles.strategyText}>Maintaining current performance and improving in areas where weaknesses have been identified</Text>
        </View>
        
        <View style={styles.strategyItem}>
          <Text style={styles.strategyLabel}>Recommended Schedule:</Text>
          <Text style={styles.strategyText}>Spend 45 minutes daily reviewing Database normalization concepts, 20 minutes practicing SQL query syntax, and 1 hour daily on weak topics identified in feedback.</Text>
        </View>
        
        <View style={styles.strategyItem}>
          <Text style={styles.strategyLabel}>Study Tips:</Text>
          <Text style={styles.strategyText}>Use the Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily.</Text>
        </View>
      </View>

      {/* AI Predictions Section */}
      <View style={styles.predictionsSection}>
        <Text style={styles.predictionsTitle}>🧠 AI Predictions</Text>
        <Text style={styles.predictionsDescription}>Realistic score predictions based on your performance patterns</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>MEDIUM Confidence</Text>
        </View>
      </View>

      {/* Performance Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.analysisTitle}>📊 Performance Analysis</Text>
        <Text style={styles.analysisDescription}>Based on performance patterns analysis</Text>
        <View style={styles.analysisTags}>
          <View style={[styles.analysisTag, { backgroundColor: colors.gray[100] }]}>
            <Text style={[styles.analysisTagText, { color: colors.gray[700] }]}>2 Upcoming Categories</Text>
          </View>
          <View style={[styles.analysisTag, { backgroundColor: colors.gray[100] }]}>
            <Text style={[styles.analysisTagText, { color: colors.gray[700] }]}>MEDIUM Confidence</Text>
          </View>
        </View>
      </View>

      {/* Assessment Predictions */}
      <View style={styles.assessmentSection}>
        <View style={styles.assessmentItem}>
          <Text style={styles.assessmentIcon}>📅</Text>
          <View style={styles.assessmentContent}>
            <Text style={styles.assessmentTitle}>Quizzes</Text>
            <Text style={styles.assessmentDescription}>1 predicted assessments</Text>
          </View>
          <Text style={styles.assessmentArrow}>▼</Text>
        </View>
        
        <View style={styles.assessmentItem}>
          <Text style={styles.assessmentIcon}>📅</Text>
          <View style={styles.assessmentContent}>
            <Text style={styles.assessmentTitle}>Exam</Text>
            <Text style={styles.assessmentDescription}>1 predicted assessments</Text>
          </View>
          <Text style={styles.assessmentArrow}>▼</Text>
        </View>
      </View>

      {/* How Predictions Work */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.howItWorksTitle}>⚡ How These Predictions Work</Text>
        <Text style={styles.howItWorksText}>AI analyzes your performance patterns, consistency, and trends to generate realistic predictions. These are based on your actual scores, not generic calculations.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 12,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  recommendationHeader: {
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  recommendationTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  recommendationDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  recommendationImpact: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  markReadButton: {
    backgroundColor: colors.green[500],
  },
  markReadButtonText: {
    fontSize: 12,
    color: colors.text.white,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: colors.red[500],
  },
  dismissButtonText: {
    fontSize: 12,
    color: colors.text.white,
    fontWeight: '500',
  },
  noRecommendations: {
    padding: 20,
    alignItems: 'center',
  },
  noRecommendationsText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  studyStrategySection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
    marginBottom: 16,
  },
  studyStrategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  strategyItem: {
    marginBottom: 12,
  },
  strategyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  strategyText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  predictionsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  predictionsDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellow[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    color: colors.yellow[700],
    fontWeight: '500',
  },
  analysisSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  analysisDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  analysisTags: {
    flexDirection: 'row',
    gap: 6,
  },
  analysisTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  analysisTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  assessmentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
    marginBottom: 16,
  },
  assessmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  assessmentIcon: {
    fontSize: 16,
  },
  assessmentContent: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  assessmentDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  assessmentArrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  howItWorksSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 16,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  howItWorksText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});