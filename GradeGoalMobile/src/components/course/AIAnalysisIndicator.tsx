import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  const hasGrades = grades && grades.length > 0;
  const hasCategories = categories && categories.length > 0;

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
            Advanced AI analysis and personalized recommendations are available in the web version.
          </Text>
        </View>
        
        <View style={styles.webIndicator}>
          <Text style={styles.webIcon}>🌐</Text>
          <Text style={styles.webText}>Web Only</Text>
        </View>
      </View>
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
  webIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[100],
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  webIcon: {
    fontSize: 14,
  },
  webText: {
    fontSize: 12,
    color: colors.blue[600],
    fontWeight: '500',
  },
});

