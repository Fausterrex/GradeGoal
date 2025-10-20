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
import { firebaseAuthService } from '../../services/firebaseAuthService';
import { checkAIAnalysisExists, getAIAnalysis } from '../../services/aiAnalysisService';

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
      
      // If no courses, show empty state
      if (!courses || courses.length === 0) {
        setRecommendations([]);
        setLastUpdated(new Date());
        return;
      }

      // Fetch real AI recommendations from backend for each course (same source as web)
      const allRecommendations: Recommendation[] = [];
      
      // Use authenticated user's id
      const currentUser = firebaseAuthService.getCurrentUserSync();
      const userId = currentUser?.userId;

      for (const course of courses) {
        try {
          const courseId = course.courseId || course.id;
          if (!userId || !courseId) { continue; }

          // First, check if analysis exists for this course
          const existsRes = await checkAIAnalysisExists(Number(userId), Number(courseId));
          if (!existsRes.success || !existsRes.exists) { continue; }

          // Get the AI analysis record (matches web service)
          const analysisRes = await getAIAnalysis(Number(userId), Number(courseId));
          if (!analysisRes.success || !analysisRes.hasAnalysis || !analysisRes.analysis) { continue; }

          const analysis = analysisRes.analysis;

          // Parse content into object
          let analysisData: any = analysis.analysisData;
          
          // First parse if string
          if (typeof analysisData === 'string') {
            try { analysisData = JSON.parse(analysisData); } catch { analysisData = null; }
          }
          if (!analysisData) { continue; }
          
          // Backend sometimes wraps the actual analysis in a 'content' field that's also stringified
          // Check if we have a 'content' field that needs parsing
          if (analysisData?.content && typeof analysisData.content === 'string') {
            try {
              const innerContent = JSON.parse(analysisData.content);
              // If the inner content has the fields we need, use it instead
              if (innerContent.topPriorityRecommendations || innerContent.studyStrategy || innerContent.focusIndicators) {
                analysisData = innerContent;
              }
            } catch (e) {
              console.warn('⚠️ [DASHBOARD DEBUG] Failed to parse inner content:', e);
            }
          }


          // 1) Top priority recommendations array
          if (Array.isArray(analysisData.topPriorityRecommendations)) {
            analysisData.topPriorityRecommendations.forEach((rec: any, index: number) => {
              const recommendation: Recommendation = {
                id: `rec-${courseId}-${index}`,
                title: rec.title || `Recommendation ${index + 1}`,
                description: rec.description || rec.content || 'AI-generated recommendation',
                priority: (rec.priority as 'HIGH'|'MEDIUM'|'LOW') || 'MEDIUM',
                category: rec.category || 'Course-Specific',
                impact: rec.impact || 'Significant impact on academic performance',
                courseName: course.courseName || course.name,
                createdAt: analysis.updatedAt || analysis.createdAt || new Date().toISOString(),
              };
              allRecommendations.push(recommendation);
            });
          }

          // 2) Focus indicators needing attention (HIGH priority only like web)
          if (analysisData.focusIndicators) {
            Object.entries(analysisData.focusIndicators).forEach(([category, indicator]: any) => {
              if (indicator?.needsAttention && indicator?.priority === 'HIGH') {
                // Use categoryName from indicator if available, otherwise use the key
                const catName = (indicator.categoryName || category || '').toString();
                const prettyName = catName
                  ? catName.charAt(0).toUpperCase() + catName.slice(1)
                  : 'This Area';
                
                const recommendation: Recommendation = {
                  id: `focus-${courseId}-${category}`,
                  title: `Focus on ${prettyName}`,
                  description: indicator.reason || `This ${catName || 'area'} needs immediate attention`,
                  priority: 'HIGH',
                  category: 'Course-Specific',
                  impact: `Improving ${catName || 'this area'} performance will significantly impact your grade`,
                  courseName: course.courseName || course.name,
                  createdAt: analysis.updatedAt || analysis.createdAt || new Date().toISOString(),
                };
                allRecommendations.push(recommendation);
              }
            });
          }

          // 3) Empty categories flagged by analysis
          if (analysisData.focusIndicators && Array.isArray(analysisData.focusIndicators.emptyCategories)) {
            analysisData.focusIndicators.emptyCategories.forEach((emptyCat: any, index: number) => {
              if (emptyCat?.needsAttention) {
            const recommendation: Recommendation = {
                  id: `empty-${courseId}-${index}`,
                  title: `Add Assessments to ${emptyCat.categoryName}`,
                  description: `This category represents ${emptyCat.weight}% of your final grade but has no assessments. ${emptyCat.recommendations ? emptyCat.recommendations.join(' ') : 'Add assessments to complete your course structure.'}`,
                  priority: (emptyCat.priority as 'HIGH'|'MEDIUM'|'LOW') || 'HIGH',
                  category: 'Empty Category',
                  impact: 'Will complete course structure and allow accurate grade calculation',
                  courseName: course.courseName || course.name,
                  createdAt: analysis.updatedAt || analysis.createdAt || new Date().toISOString(),
            };
            allRecommendations.push(recommendation);
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch AI analysis for course ${course.courseName || course.name}:`, error);
        }
      }

      // If no AI recommendations found, show helpful message
      if (allRecommendations.length === 0) {
        const emptyRecommendation: Recommendation = {
          id: 'empty-1',
          title: 'Start adding courses and grades',
          description: 'Add your courses and enter some grades to get personalized AI recommendations for improving your academic performance.',
          priority: 'MEDIUM',
          category: 'Getting Started',
          impact: 'AI recommendations will appear once you have course data',
          courseName: 'Getting Started',
          createdAt: new Date().toISOString(),
        };
        allRecommendations.push(emptyRecommendation);
      }

      // Group by course and sort like web: priority HIGH first, then by updatedAt desc, take top 2 per course
      const priorityOrder: Record<'HIGH'|'MEDIUM'|'LOW', number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      const byCourse: Record<string, Recommendation[]> = {};
      for (const rec of allRecommendations) {
        const key = rec.courseName || 'course';
        if (!byCourse[key]) byCourse[key] = [];
        byCourse[key].push(rec);
      }
      const sorted: Recommendation[] = [];
      Object.values(byCourse).forEach((recs) => {
        const s = recs.sort((a, b) => {
          const pdiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (pdiff !== 0) return pdiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 2);
        sorted.push(...s);
      });

      setRecommendations(sorted);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Token retrieval no longer needed here; apiClient attaches Firebase token

  // Helper functions to extract data from AI analysis content
  const extractRecommendationTitle = (content: string): string => {
    // Extract title from AI analysis content
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.includes('recommendation') || line.includes('focus') || line.includes('improve'));
    return titleLine ? titleLine.replace(/[#*-]/g, '').trim() : 'AI Recommendation';
  };

  const extractRecommendationDescription = (content: string): string => {
    // Extract description from AI analysis content
    const lines = content.split('\n');
    const descriptionLines = lines.filter(line => 
      line.length > 20 && 
      !line.includes('recommendation') && 
      !line.includes('priority') &&
      !line.includes('impact')
    );
    return descriptionLines.slice(0, 2).join(' ').substring(0, 150) + '...';
  };

  const extractPriority = (content: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (content.toLowerCase().includes('high') || content.toLowerCase().includes('critical')) return 'HIGH';
    if (content.toLowerCase().includes('medium') || content.toLowerCase().includes('moderate')) return 'MEDIUM';
    return 'LOW';
  };

  const extractImpact = (content: string): string => {
    if (content.toLowerCase().includes('significant') || content.toLowerCase().includes('major')) {
      return 'High impact on grade/performance';
    }
    if (content.toLowerCase().includes('moderate') || content.toLowerCase().includes('some')) {
      return 'Moderate impact on grade/performance';
    }
    return 'Expected impact on grade/performance';
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

  // Show empty state if no recommendations
  if (recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Text style={styles.headerIcon}>💡</Text>
              <Text style={styles.title}>AI Recommendations</Text>
            </View>
            <Text style={styles.subtitle}>Personalized recommendations based on your academic data</Text>
          </View>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No recommendations yet</Text>
          <Text style={styles.emptyDescription}>
            Add courses and enter some grades to get personalized AI recommendations for improving your academic performance.
          </Text>
        </View>
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
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
