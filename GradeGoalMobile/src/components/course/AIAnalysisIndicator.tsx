import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface AIAnalysisIndicatorProps {
  course: any;
  grades: any[];
  categories: any[];
  targetGrade: number | null;
  currentGrade: number;
  activeSemesterTerm: string;
  onAnalysisComplete: (result: any) => void;
}

export const AIAnalysisIndicator: React.FC<AIAnalysisIndicatorProps> = ({
  course,
  grades,
  categories,
  targetGrade,
  currentGrade,
  activeSemesterTerm,
  onAnalysisComplete,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string | null>(null);

  const hasGrades = grades && grades.length > 0;
  const hasCategories = categories && categories.length > 0;

  const handleReAnalyze = async () => {
    if (!hasGrades || !hasCategories) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        recommendations: Math.floor(Math.random() * 5) + 3, // 3-7 recommendations
        analysisDate: new Date().toISOString(),
      };
      
      setLastAnalysisDate(result.analysisDate);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!hasGrades || !hasCategories) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🧠</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>AI Analysis Available</Text>
          <Text style={styles.description}>
            Update your AI analysis with latest course data and performance insights.
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, isAnalyzing && styles.buttonDisabled]}
          onPress={handleReAnalyze}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonIcon}>
            {isAnalyzing ? '⏳' : '🔄'}
          </Text>
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {lastAnalysisDate && (
        <View style={styles.lastAnalysisContainer}>
          <Text style={styles.lastAnalysisText}>
            Last analysis: {new Date(lastAnalysisDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    fontSize: 14,
    color: colors.text.white,
    fontWeight: '500',
  },
  lastAnalysisContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  lastAnalysisText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
