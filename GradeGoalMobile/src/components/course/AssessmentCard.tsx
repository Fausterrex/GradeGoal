import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface AssessmentCardProps {
  grade: any;
  course: any;
  onAssessmentClick: (grade: any) => void;
  onEditScore: (grade: any) => void;
  onEditAssessment: (grade: any) => void;
  onDeleteAssessment: (gradeId: number, categoryId: number) => void;
  userId?: number;
  targetGrade?: number;
  categoryName?: string;
  allGrades?: Record<number, any[]>;
  allCategories?: any[];
  isCourseCompleted?: boolean;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  grade,
  course,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  userId,
  targetGrade,
  categoryName,
  allGrades,
  allCategories,
  isCourseCompleted = false,
}) => {
  const [gpa, setGpa] = useState('0.00');

  const hasScore =
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== '' &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score)) &&
    parseFloat(grade.score) > 0;

  const percentage = hasScore ? ((parseFloat(grade.score) / parseFloat(grade.maxScore)) * 100) : null;

  // Calculate GPA when percentage changes
  useEffect(() => {
    if (percentage !== null) {
      const calculatedGpa = percentage >= 97 ? 4.0 : 
                           percentage >= 93 ? 3.7 : 
                           percentage >= 90 ? 3.3 : 
                           percentage >= 87 ? 3.0 : 
                           percentage >= 83 ? 2.7 : 
                           percentage >= 80 ? 2.3 : 
                           percentage >= 77 ? 2.0 : 
                           percentage >= 73 ? 1.7 : 
                           percentage >= 70 ? 1.3 : 
                           percentage >= 67 ? 1.0 : 
                           percentage >= 63 ? 0.7 : 
                           percentage >= 60 ? 0.3 : 0.0;
      setGpa(calculatedGpa.toFixed(2));
    } else {
      setGpa('0.00');
    }
  }, [percentage]);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return colors.green[600];
    if (percentage >= 80) return colors.blue[600];
    if (percentage >= 70) return colors.yellow[600];
    if (percentage >= 60) return colors.orange[600];
    return colors.red[600];
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return {
          backgroundColor: colors.green[100],
          color: colors.green[800],
          borderColor: colors.green[200],
        };
      case 'UPCOMING':
        return {
          backgroundColor: colors.blue[100],
          color: colors.blue[800],
          borderColor: colors.blue[200],
        };
      case 'OVERDUE':
        return {
          backgroundColor: colors.red[100],
          color: colors.red[800],
          borderColor: colors.red[200],
        };
      case 'CANCELLED':
        return {
          backgroundColor: colors.gray[100],
          color: colors.gray[800],
          borderColor: colors.gray[200],
        };
      default:
        return {
          backgroundColor: colors.yellow[100],
          color: colors.yellow[800],
          borderColor: colors.yellow[200],
        };
    }
  };

  const determineAssessmentStatus = (grade: any) => {
    if (hasScore) {
      return 'COMPLETED';
    }

    if (!grade.date) {
      return 'UPCOMING';
    }

    const today = new Date();
    const dueDate = new Date(grade.date);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return 'OVERDUE';
    } else {
      return 'UPCOMING';
    }
  };

  const status = determineAssessmentStatus(grade);
  const statusColors = getStatusColor(status);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        hasScore ? styles.completedContainer : styles.pendingContainer,
      ]}
      onPress={() => {
        if (!hasScore) {
          onAssessmentClick(grade);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Assessment Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: hasScore ? colors.green[500] : colors.blue[500] }
        ]}>
          <Text style={styles.icon}>📝</Text>
        </View>

        {/* Assessment Details */}
        <View style={styles.details}>
          {/* Assessment Title and Status */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {grade.name}
            </Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: statusColors.backgroundColor,
                borderColor: statusColors.borderColor,
              }
            ]}>
              <Text style={[styles.statusText, { color: statusColors.color }]}>
                {status}
              </Text>
            </View>
            {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
              <View style={styles.extraCreditBadge}>
                <Text style={styles.extraCreditText}>EXTRA CREDIT</Text>
              </View>
            )}
          </View>
          
          {/* Assessment Score and Date */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreContainer}>
              {hasScore ? (
                <Text style={[
                  styles.scoreText,
                  { color: getGradeColor(percentage!) }
                ]}>
                  {grade.score}/{grade.maxScore} ({percentage!.toFixed(2)}% | {gpa} GPA)
                  {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
                    <Text style={styles.extraCreditScore}> (+{grade.extraCreditPoints})</Text>
                  )}
                </Text>
              ) : (
                <Text style={styles.maxScoreText}>
                  Max Score: <Text style={styles.maxScoreValue}>{grade.maxScore}</Text>
                  {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
                    <Text style={styles.extraCreditScore}> +{grade.extraCreditPoints}</Text>
                  )}
                </Text>
              )}
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>Due: {grade.date}</Text>
            </View>
          </View>

          {/* Assessment Note */}
          {grade.note && grade.note.trim() !== '' && (
            <View style={styles.noteContainer}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteIcon}>📝</Text>
                <Text style={styles.noteLabel}>Note</Text>
              </View>
              <Text style={styles.noteText}>
                {grade.note}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!hasScore ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton, isCourseCompleted && styles.disabledButton]}
            onPress={isCourseCompleted ? undefined : (e) => {
              e.stopPropagation();
              onAssessmentClick(grade);
            }}
            disabled={isCourseCompleted}
          >
            <Text style={[styles.actionButtonText, isCourseCompleted && styles.disabledButtonText]}>
              Add Score
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton, isCourseCompleted && styles.disabledButton]}
            onPress={isCourseCompleted ? undefined : (e) => {
              e.stopPropagation();
              onEditScore(grade);
            }}
            disabled={isCourseCompleted}
          >
            <Text style={[styles.actionButtonText, isCourseCompleted && styles.disabledButtonText]}>
              Edit Score
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.editAssessmentButton, isCourseCompleted && styles.disabledButton]}
          onPress={isCourseCompleted ? undefined : (e) => {
            e.stopPropagation();
            onEditAssessment(grade);
          }}
          disabled={isCourseCompleted}
        >
          <Text style={[styles.actionButtonText, isCourseCompleted && styles.disabledButtonText]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, isCourseCompleted && styles.disabledButton]}
          onPress={isCourseCompleted ? undefined : (e) => {
            e.stopPropagation();
            onDeleteAssessment(grade.id, grade.categoryId);
          }}
          disabled={isCourseCompleted}
        >
          <Text style={[styles.actionButtonText, isCourseCompleted && styles.disabledButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    marginBottom: 20,
    minHeight: 120,
  },
  completedContainer: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[200],
  },
  pendingContainer: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addButton: {
    backgroundColor: colors.green[600],
  },
  editButton: {
    backgroundColor: colors.blue[600],
  },
  editAssessmentButton: {
    backgroundColor: colors.gray[600],
  },
  deleteButton: {
    backgroundColor: colors.red[600],
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  extraCreditBadge: {
    backgroundColor: colors.yellow[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.yellow[200],
  },
  extraCreditText: {
    color: colors.yellow[800],
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  maxScoreText: {
    fontSize: 18,
    fontWeight: '500',
  },
  maxScoreValue: {
    color: colors.gray[800],
  },
  extraCreditScore: {
    color: colors.green[600],
    fontWeight: '500',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteIcon: {
    fontSize: 12,
    color: colors.blue[600],
    marginRight: 4,
  },
  noteLabel: {
    fontSize: 12,
    color: colors.blue[800],
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: colors.blue[700],
    lineHeight: 16,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.gray[200],
  },
  disabledButtonText: {
    opacity: 0.7,
  },
});