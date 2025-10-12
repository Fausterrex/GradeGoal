import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';
import { AssessmentCard } from './AssessmentCard';

interface AssessmentCategoryProps {
  category: any;
  categoryGrades: any[];
  categoryAverage: number | null;
  onAddAssessment: (categoryId: number) => void;
  onAssessmentClick: (grade: any) => void;
  onEditScore: (grade: any) => void;
  onEditAssessment: (grade: any) => void;
  onDeleteAssessment: (gradeId: number, categoryId: number) => void;
  course: any;
  allGrades: Record<number, any[]>;
  allCategories: any[];
  targetGrade?: number;
  activeSemesterTerm: string;
  isMidtermCompleted: boolean;
}

export const AssessmentCategory: React.FC<AssessmentCategoryProps> = ({
  category,
  categoryGrades,
  categoryAverage,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  course,
  allGrades,
  allCategories,
  targetGrade,
  activeSemesterTerm,
  isMidtermCompleted,
}) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return colors.green[600];
    if (percentage >= 80) return colors.blue[600];
    if (percentage >= 70) return colors.yellow[600];
    if (percentage >= 60) return colors.orange[600];
    return colors.red[600];
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Fair';
    if (percentage >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return colors.green[500];
    if (percentage >= 80) return colors.blue[500];
    if (percentage >= 70) return colors.yellow[500];
    if (percentage >= 60) return colors.orange[500];
    return colors.red[500];
  };

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          {/* Category Title and Weight */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.categoryIcon}>
                  {(category.categoryName || category.name) ? (category.categoryName || category.name).charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <View style={styles.titleInfo}>
                <Text style={styles.categoryTitle}>{category.categoryName || category.name || 'Assessment Category'}</Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.weightText}>
                    Weight: {category.weightPercentage || category.weight}%
                  </Text>
                  <View style={styles.separator} />
                  <Text style={styles.assessmentCount}>
                    {categoryGrades.length} assessments
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Add Assessment Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              isMidtermCompleted && activeSemesterTerm === 'MIDTERM' && styles.disabledButton,
            ]}
            onPress={() => onAddAssessment(category.id)}
            disabled={isMidtermCompleted && activeSemesterTerm === 'MIDTERM'}
          >
            <Text style={[
              styles.addButtonText,
              isMidtermCompleted && activeSemesterTerm === 'MIDTERM' && styles.disabledButtonText,
            ]}>
              + Add Assessment
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Content */}
      <View style={styles.content}>
        {/* Category Average Display */}
        <View style={styles.averageSection}>
          <View style={styles.averageHeader}>
            <View style={styles.averageIconContainer}>
              <Text style={styles.averageIcon}>📊</Text>
            </View>
            <View style={styles.averageInfo}>
              <View style={styles.averageTitleRow}>
                <Text style={styles.averageLabel}>Category Average</Text>
                {categoryAverage !== null && !isNaN(categoryAverage) ? (
                  <Text style={[
                    styles.averagePercentage,
                    { color: getGradeColor(categoryAverage) }
                  ]}>
                    {categoryAverage.toFixed(2)}%
                  </Text>
                ) : (
                  <Text style={styles.averagePercentage}>--</Text>
                )}
              </View>
              <Text style={styles.averageSubLabel}>Performance Summary</Text>
            </View>
          </View>
          
          {categoryAverage !== null && !isNaN(categoryAverage) ? (
            <View style={styles.averageValue}>
              <View style={styles.averageRow}>
                <View style={[
                  styles.performanceIndicator,
                  { backgroundColor: getPerformanceColor(categoryAverage) }
                ]} />
                <Text style={styles.performanceText}>
                  {getPerformanceText(categoryAverage)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.averageValue}>
              <View style={styles.averageRow}>
                <View style={styles.noDataIndicator} />
                <Text style={styles.noDataSubtext}>No scores yet</Text>
              </View>
            </View>
          )}
        </View>

        {/* Assessments List */}
        <View style={styles.assessmentsList}>
          {categoryGrades.length > 0 ? (
            categoryGrades.map((grade) => (
              <AssessmentCard
                key={grade.id}
                grade={grade}
                course={course}
                onAssessmentClick={onAssessmentClick}
                onEditScore={onEditScore}
                onEditAssessment={onEditAssessment}
                onDeleteAssessment={onDeleteAssessment}
                userId={course?.userId}
                targetGrade={targetGrade}
                categoryName={category.categoryName || category.name || 'Unknown Category'}
                allGrades={allGrades}
                allCategories={allCategories}
              />
            ))
          ) : (
            <View style={styles.emptyAssessments}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <View style={styles.emptyIconBadge}>
                  <Text style={styles.emptyIconBadgeText}>+</Text>
                </View>
              </View>
              <Text style={styles.emptyTitle}>No Assessments Yet</Text>
              <Text style={styles.emptyText}>This category is waiting for assessments.</Text>
              <View style={styles.tipContainer}>
                <Text style={styles.tipText}>
                  💡 Tip: Add assessments to track your progress and get AI insights!
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
    maxWidth: '70%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 6,
    flexShrink: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  assessmentCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 90,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    padding: 16,
  },
  averageSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  averageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  averageIcon: {
    fontSize: 16,
  },
  averageInfo: {
    flex: 1,
  },
  averageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  averageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  averageSubLabel: {
    fontSize: 14,
    color: colors.gray[500],
  },
  averageValue: {
    alignItems: 'flex-end',
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  averagePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  performanceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  performanceText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  noDataText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[400],
    marginRight: 8,
  },
  noDataIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[300],
  },
  noDataSubtext: {
    fontSize: 12,
    color: colors.gray[500],
  },
  assessmentsList: {
    gap: 16,
  },
  emptyAssessments: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.gray[200],
  },
  emptyIconBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: colors.blue[500],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 12,
    textAlign: 'center',
  },
  tipContainer: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
    borderRadius: 8,
    padding: 12,
    maxWidth: 280,
  },
  tipText: {
    fontSize: 12,
    color: colors.blue[700],
    textAlign: 'center',
  },
});