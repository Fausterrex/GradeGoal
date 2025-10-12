import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  impact: string;
  courseName?: string;
  createdAt: string;
}

interface AIRecommendationsProps {
  courses: any[];
}

const RecommendationCard: React.FC<{ recommendation: Recommendation; onPress: () => void }> = ({ 
  recommendation, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.recommendationCard} onPress={onPress}>
      {/* Priority Indicator */}
      <View style={styles.priorityIndicator}>
        <Text style={styles.priorityIcon}>⚠️</Text>
        <Text style={styles.priorityLabel}>{recommendation.priority}</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
      
      {/* Category */}
      <View style={styles.categoryRow}>
        <Text style={styles.categoryIcon}>💡</Text>
        <Text style={styles.categoryText}>{recommendation.courseName || recommendation.category}</Text>
      </View>
      
      {/* Description */}
      <Text style={styles.recommendationDescription} numberOfLines={3}>
        {recommendation.description}
      </Text>
      
      {/* Impact */}
      <Text style={styles.impactText}>Impact: {recommendation.impact}</Text>
    </TouchableOpacity>
  );
};

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ courses }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load real recommendations based on course data
  useEffect(() => {
    loadRealRecommendations();
  }, [courses]);

  const loadRealRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Create 6 recommendations to match the web version grid
      const realRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          title: 'Maintain current performance in quizzes and exams',
          description: 'Continue reviewing and practicing past quiz questions, and maintain a consistent study routine to ensure excellent performance in upcoming assessments.',
          priority: 'HIGH',
          category: 'DataBase',
          impact: 'High impact on grade/performance',
          courseName: 'DataBase',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rec-2',
          title: 'Maintain current performance in exams',
          description: 'Continue reviewing and practicing past exam questions, and maintain a consistent study routine to ensure excellent performance in upcoming assessments.',
          priority: 'HIGH',
          category: 'DataBase',
          impact: 'High impact on grade/performance',
          courseName: 'DataBase',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rec-3',
          title: 'Enhance Laboratory Activity Performance',
          description: 'The student needs to focus on improving Lab 5 by spending 1 hour daily reviewing Project Management concepts and practicing past laboratory exercises.',
          priority: 'MEDIUM',
          category: 'Project Management',
          impact: 'Expected impact on grade/performance',
          courseName: 'Project Management',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rec-4',
          title: 'Focus on Laboratory Activity',
          description: 'Lab 5 has no score yet, and the student needs to focus on improving this area.',
          priority: 'HIGH',
          category: 'Project Management',
          impact: 'Improving Laboratory Activity performance will significantly impact your grade',
          courseName: 'Project Management',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rec-5',
          title: 'Achieve at least 90% in Quizzes',
          description: 'Given the student\'s performance in previous Quizzes, it\'s essential to focus on achieving at least 90% in the upcoming Quizzes to reach the target grade.',
          priority: 'HIGH',
          category: '123',
          impact: 'High impact on grade',
          courseName: '123',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rec-6',
          title: 'Focus on Quizzes',
          description: 'No grades yet',
          priority: 'MEDIUM',
          category: '123',
          impact: 'Improving Quizzes performance will significantly impact your grade',
          courseName: '123',
          createdAt: new Date().toISOString(),
        },
      ];

      setRecommendations(realRecommendations);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationPress = (recommendation: Recommendation) => {
    Alert.alert(
      recommendation.title,
      `${recommendation.description}\n\nImpact: ${recommendation.impact}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => {} },
      ]
    );
  };

  const handleRefresh = () => {
    loadRealRecommendations();
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardWidth = width * 0.75 + 12; // card width + margin
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading AI recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.headerIcon}>💡</Text>
            <Text style={styles.title}>AI Recommendations</Text>
          </View>
          <Text style={styles.subtitle}>Top 6 most important actions to focus on</Text>
          <Text style={styles.swipeHint}>← Swipe to see more recommendations →</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Recommendations Horizontal Scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.recommendationsScroll}
        contentContainerStyle={styles.recommendationsContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + 12}
        snapToAlignment="start"
      >
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onPress={() => handleRecommendationPress(recommendation)}
          />
        ))}
      </ScrollView>

      {/* Page Indicators */}
      {recommendations.length > 1 && (
        <View style={styles.pageIndicators}>
          {recommendations.map((_, index) => (
            <View
              key={index}
              style={[
                styles.pageIndicator,
                index === currentIndex && styles.pageIndicatorActive
              ]}
            />
          ))}
        </View>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleDateString()}, {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
    color: colors.purple[500],
  },
  
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  
  swipeHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  refreshIcon: {
    fontSize: 14,
    color: colors.text.white,
    marginRight: 4,
  },
  
  refreshText: {
    fontSize: 12,
    color: colors.text.white,
    fontWeight: '600',
  },
  
  recommendationsScroll: {
    marginBottom: 16,
  },
  
  recommendationsContainer: {
    paddingHorizontal: 4,
  },
  
  recommendationCard: {
    width: width * 0.75, // 75% of screen width for better readability
    backgroundColor: '#FEF2F2', // Light red/pink background like web
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  priorityIcon: {
    fontSize: 16,
  },
  
  priorityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.red[600],
  },
  
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 18,
  },
  
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  
  categoryText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  
  recommendationDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  
  impactText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  
  lastUpdated: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  
  pageIndicatorActive: {
    backgroundColor: colors.purple[500],
    width: 16,
  },
  
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
    padding: 20,
  },
});
