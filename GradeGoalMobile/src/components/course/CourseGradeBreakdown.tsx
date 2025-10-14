import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../styles/colors';

interface CourseGradeBreakdownProps {
  categories: any[];
  grades: any[];
  course: any;
  colorScheme: any;
  targetGrade: number | null;
  currentGrade: number;
  activeSemesterTerm: string;
  isMidtermCompleted: boolean;
}

export const CourseGradeBreakdown: React.FC<CourseGradeBreakdownProps> = ({
  categories = [],
  grades = [],
  course = {},
  colorScheme = {},
  targetGrade = null,
  currentGrade = 0,
  activeSemesterTerm = 'MIDTERM',
  isMidtermCompleted = false,
}) => {
  // Helper function to check if grade has valid score (matching web version)
  const hasValidScore = (grade: any) => {
    const isValid = grade && 
           grade.score !== null && 
           grade.score !== undefined && 
           grade.maxScore && 
           grade.maxScore > 0;
           // Note: Include grades with 0% scores to match web version behavior
    
    return isValid;
  };

  // Helper function to calculate assessment percentage (matching web version)
  const calculateAssessmentPercentage = (score: number, maxScore: number) => {
    if (!score || !maxScore || maxScore <= 0) return 0;
    return (score / maxScore) * 100;
  };

  // Helper function to get percentage from grade (check if grade already has percentageScore)
  const getGradePercentage = (grade: any) => {
    // If grade already has percentageScore, use it (matching web version)
    if (grade.percentageScore !== null && grade.percentageScore !== undefined) {
      return grade.percentageScore;
    }
    // Otherwise calculate it
    return calculateAssessmentPercentage(grade.score, grade.maxScore);
  };

  // Convert percentage to GPA using the same scale as database CalculateGPA function
  const convertPercentageToGPA = (percentage: number): number => {
    if (percentage >= 95.5) return 4.0;
    if (percentage >= 89.5) return 3.5;
    if (percentage >= 83.5) return 3.0;
    if (percentage >= 77.5) return 2.5;
    if (percentage >= 71.5) return 2.0;
    if (percentage >= 65.5) return 1.5;
    if (percentage >= 59.5) return 1.0;
    return 0.0; // Below 59.5% = 0.0 GPA
  };

  // Convert grades array to object structure (matching web version)
  const gradesByCategory = (() => {
    const gradesObj: any = {};
    if (grades && Array.isArray(grades)) {
      grades.forEach((grade: any) => {
        if (grade && grade.categoryId) {
          if (!gradesObj[grade.categoryId]) {
            gradesObj[grade.categoryId] = [];
          }
          gradesObj[grade.categoryId].push(grade);
        }
      });
    }
    return gradesObj;
  })();

  // Calculate likelihood analysis (matching web version logic)
  const calculateLikelihoodAnalysis = () => {
    // Handle targetGrade conversion - it might be a string like 'R', '1.00', etc.
    let targetGPA = null;
    if (targetGrade) {
      if (typeof targetGrade === 'string') {
        // If it's already a GPA string (like 'R', '1.00', '2.50'), use it directly
        if (targetGrade === 'R') {
          targetGPA = 0; // R grade = 0 GPA
        } else {
          targetGPA = parseFloat(targetGrade);
        }
      } else if (typeof targetGrade === 'number') {
        // If it's a number, it's already in GPA format (4.0 scale)
        targetGPA = targetGrade;
      }
    }
    
    // Get current GPA
    const currentGPA = (() => {
      const gpa = course?.courseGpa || currentGrade;
      if (typeof gpa === 'string' && gpa === 'R') {
        return 0; // R grade = 0 GPA
      } else {
        return parseFloat(gpa) || 0;
      }
    })();

    if (!targetGPA) {
      return {
        likelihood: 0,
        status: 'No Goal Set',
        description: 'Set a target GPA to calculate achievement likelihood',
        metrics: {
          currentGPA,
          targetGPA: 0,
          gpaGap: 0,
          completionRate: 0,
          remainingAssessments: 0,
          totalAssessments: 0
        }
      };
    }

    // Calculate completion rate
    let totalAssessments = 0;
    let completedAssessments = 0;
    categories.forEach(category => {
      const categoryGrades = gradesByCategory[category.id] || [];
      totalAssessments += categoryGrades.length;
      completedAssessments += categoryGrades.filter((grade: any) => hasValidScore(grade)).length;
    });

    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
    const remainingAssessments = totalAssessments - completedAssessments;
    const gpaGap = targetGPA - currentGPA;

    // Calculate likelihood based on current progress and gap (matching web version logic)
    let likelihood = 50; // Default
    let status = 'Unknown';
    let description = 'Goal achievement analysis in progress';

    if (currentGPA >= targetGPA) {
      likelihood = 100;
      status = 'Achieved';
      description = 'Goal already achieved!';
    } else if (completionRate >= 100) {
      likelihood = 0;
      status = 'Not Achievable';
      description = 'Course completed but goal not reached';
    } else if (gpaGap <= 0.5 && completionRate >= 75) {
      likelihood = 85;
      status = 'Very Likely';
      description = 'Strong progress toward goal';
    } else if (gpaGap <= 1.0 && completionRate >= 50) {
      likelihood = 65;
      status = 'Likely';
      description = 'Good progress toward goal';
    } else if (gpaGap <= 2.0 && completionRate >= 25) {
      likelihood = 40;
      status = 'Possible';
      description = 'Challenging but achievable';
    } else {
      likelihood = 20;
      status = 'Unlikely';
      description = 'Very challenging to achieve goal';
    }

    return {
      likelihood,
      status,
      description,
      metrics: {
        currentGPA,
        targetGPA,
        gpaGap,
        completionRate,
        remainingAssessments,
        totalAssessments
      }
    };
  };

  const calculateCategoryStats = () => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    
    return categories.map((category: any) => {
      if (!category || !category.id) {
        return null;
      }
      
      // Use gradesByCategory object structure (matching web version)
      const categoryGrades = gradesByCategory[category.id] || [];
      const weight = category.weightPercentage || category.weight || 0;
      
      let average = null;
      let totalAssessments = 0;
      let completedAssessments = 0;
      
      if (categoryGrades.length > 0) {
        const validGrades = categoryGrades.filter((grade: any) => hasValidScore(grade));
        completedAssessments = validGrades.length;
        totalAssessments = categoryGrades.length;
        
        if (validGrades.length > 0) {
          const totalPercentage = validGrades.reduce((sum: number, grade: any) => {
            const percentage = getGradePercentage(grade);
            return sum + (percentage || 0);
          }, 0);
          average = totalPercentage / validGrades.length;
        }
      }
      
      const contribution = average !== null && weight ? (average * weight) / 100 : 0;
      
      // Use database GPA conversion function instead of custom scale
      const gpa = average !== null ? convertPercentageToGPA(average) : 0;
      
      return {
        id: category.id,
        name: category.name || category.categoryName || 'Unknown',
        weight: weight || 0,
        average: average || 0,
        totalAssessments: totalAssessments || 0,
        completedAssessments: completedAssessments || 0,
        contribution: contribution || 0,
        gpa: gpa || 0,
        count: totalAssessments || 0,
        completed: completedAssessments || 0,
        pending: (totalAssessments || 0) - (completedAssessments || 0),
      };
    });
  };

  const categoryStats = calculateCategoryStats().filter(stat => stat !== null);
  
  // Calculate term-specific contributions (matching web version logic)
  const getTermContribution = (term: string) => {
    let termContribution = 0;
    let totalCategoryWeight = 0;
    
    
    categories.forEach((category: any) => {
      // Use gradesByCategory object structure (matching web version)
      const categoryGrades = gradesByCategory[category.id] || [];
      const termGrades = categoryGrades.filter((grade: any) => grade.semesterTerm === term);
      const completedTermGrades = termGrades.filter((grade: any) => hasValidScore(grade));
      
      
      
      // Each term gets 50% of each category's weight
      const termCategoryWeight = (category.weightPercentage || category.weight || 0) * 0.5;
      totalCategoryWeight += category.weightPercentage || category.weight || 0;
      
      if (completedTermGrades.length > 0) {
        // Calculate term average for this category (matching web version)
        const termAverage = completedTermGrades.reduce((sum: number, grade: any) => {
          const percentage = getGradePercentage(grade);
          return sum + (percentage || 0);
        }, 0) / completedTermGrades.length;
        
        // Calculate contribution based on 50% of category weight
        const categoryContribution = (termAverage * termCategoryWeight) / 100;
        termContribution += categoryContribution;
        
      }
    });
    
    const result = {
      contribution: termContribution,
      weight: totalCategoryWeight * 0.5, // Each term gets 50% of total weight
      percentage: totalCategoryWeight > 0 ? (termContribution / (totalCategoryWeight * 0.5)) * 100 : 0
    };
    
    
    return result;
  };

  // Calculate term-specific data
  const midtermData = getTermContribution('MIDTERM');
  const finalTermData = getTermContribution('FINAL_TERM');
  
  // Calculate overall contribution as sum of term contributions (matching web version)
  const totalContribution = midtermData.contribution + finalTermData.contribution;
  
  const totalWeight = categoryStats.reduce((sum: number, stat: any) => sum + (stat?.weight || 0), 0);

  // Fallback for when there's no data
  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Grade Breakdown</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No grade data available yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade Breakdown</Text>
      
      {/* Overall Performance Summary */}
      <View style={styles.overallSection}>
        <Text style={styles.sectionTitle}>Overall Performance Summary</Text>
        <View style={styles.overallCards}>
          <View style={[styles.overallCard, { backgroundColor: colors.orange?.[100] || '#FEF3C7' }]}>
            <Text style={styles.overallValue}>
              {totalContribution !== null && totalContribution !== undefined ? totalContribution.toFixed(2) : '0.00'}%
            </Text>
            <Text style={styles.overallLabel}>Weighted Average</Text>
          </View>
          <View style={[styles.overallCard, { backgroundColor: colors.purple?.[100] || '#FCE7F3' }]}>
            <Text style={styles.overallValue}>
              {(() => {
                const gpa = course?.courseGpa || currentGrade;
                if (typeof gpa === 'string' && gpa === 'R') return 'R';
                return parseFloat(gpa).toFixed(2);
              })()}
            </Text>
            <Text style={styles.overallLabel}>
              ({totalContribution !== null && totalContribution !== undefined ? totalContribution.toFixed(2) : '0.00'}%)
            </Text>
            <Text style={styles.overallSubLabel}>Overall GPA</Text>
          </View>
          <View style={[styles.overallCard, { backgroundColor: colors.red?.[100] || '#FEE2E2' }]}>
            <Text style={styles.overallValue}>{categories?.length || 0}</Text>
            <Text style={styles.overallLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Term Contributions */}
      <View style={styles.termSection}>
        <Text style={styles.sectionTitle}>Term Contributions</Text>
        <Text style={styles.termDescription}>Each term contributes 50% to the final grade</Text>
        <View style={styles.termCards}>
          <View style={[styles.termCard, { backgroundColor: colors.blue?.[100] || '#DBEAFE' }]}>
            <Text style={styles.termValue}>
              {midtermData.contribution !== null && midtermData.contribution !== undefined ? midtermData.contribution.toFixed(2) : '0.00'}%
            </Text>
            <Text style={styles.termWeight}>(50% of total weight)</Text>
            <Text style={styles.termName}>Midterm</Text>
            <View style={styles.termStatus}>
              <Text style={styles.termStatusIcon}>✓</Text>
              <Text style={styles.termStatusText}>Completed</Text>
            </View>
          </View>
          <View style={[styles.termCard, { backgroundColor: colors.green?.[100] || '#DCFCE7' }]}>
            <Text style={styles.termValue}>
              {finalTermData.contribution !== null && finalTermData.contribution !== undefined ? finalTermData.contribution.toFixed(2) : '0.00'}%
            </Text>
            <Text style={styles.termWeight}>(50% of total weight)</Text>
            <Text style={styles.termName}>Final Term</Text>
            <View style={styles.termStatus}>
              <Text style={styles.termStatusIcon}>❌</Text>
              <Text style={styles.termStatusText}>In Progress</Text>
            </View>
          </View>
        </View>
      </View>


      {/* Goal Achievement Likelihood */}
      {(() => {
        const likelihoodAnalysis = calculateLikelihoodAnalysis();
        const getStatusColor = (likelihood: number) => {
          if (likelihood >= 80) return colors.green?.[500] || '#22C55E';
          if (likelihood >= 60) return colors.blue?.[500] || '#3B82F6';
          if (likelihood >= 40) return colors.orange?.[500] || '#F97316';
          return colors.red?.[500] || '#EF4444';
        };
        
        return (
          <View style={styles.goalSection}>
            <Text style={styles.sectionTitle}>Goal Achievement Likelihood</Text>
            <Text style={styles.goalSubtitle}>{likelihoodAnalysis.description}</Text>
            <View style={styles.goalProgress}>
              <View style={[styles.goalCircle, { borderColor: getStatusColor(likelihoodAnalysis.likelihood) }]}>
                <Text style={styles.goalPercentage}>{likelihoodAnalysis.likelihood}%</Text>
                <Text style={styles.goalLabel}>{likelihoodAnalysis.status}</Text>
              </View>
            </View>
        
        {/* Key Metrics - Same as web version */}
        <View style={styles.keyMetricsContainer}>
          <View style={[styles.keyMetricCard, { backgroundColor: colors.blue?.[200] || '#DBEAFE', borderColor: colors.blue?.[500] || '#3B82F6' }]}>
            <Text style={styles.keyMetricIcon}>📈</Text>
            <Text style={styles.keyMetricTitle}>Current GPA</Text>
            <Text style={styles.keyMetricValue}>
              {typeof likelihoodAnalysis.metrics.currentGPA === 'string' ? likelihoodAnalysis.metrics.currentGPA : likelihoodAnalysis.metrics.currentGPA.toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.keyMetricCard, { backgroundColor: colors.green?.[200] || '#DCFCE7', borderColor: colors.green?.[500] || '#22C55E' }]}>
            <Text style={styles.keyMetricIcon}>🎯</Text>
            <Text style={styles.keyMetricTitle}>Target GPA</Text>
            <Text style={styles.keyMetricValue}>
              {typeof likelihoodAnalysis.metrics.targetGPA === 'string' ? likelihoodAnalysis.metrics.targetGPA : likelihoodAnalysis.metrics.targetGPA.toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.keyMetricCard, { backgroundColor: colors.orange?.[200] || '#FED7AA', borderColor: colors.orange?.[500] || '#F97316' }]}>
            <Text style={styles.keyMetricIcon}>📊</Text>
            <Text style={styles.keyMetricTitle}>Gap to Close</Text>
            <Text style={styles.keyMetricValue}>
              {Math.abs(typeof likelihoodAnalysis.metrics.gpaGap === 'string' ? parseFloat(likelihoodAnalysis.metrics.gpaGap) : likelihoodAnalysis.metrics.gpaGap).toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.keyMetricCard, { backgroundColor: colors.purple?.[200] || '#E9D5FF', borderColor: colors.purple?.[500] || '#8B5CF6' }]}>
            <Text style={styles.keyMetricIcon}>✔️</Text>
            <Text style={styles.keyMetricTitle}>Completion</Text>
            <Text style={styles.keyMetricValue}>
              {typeof likelihoodAnalysis.metrics.completionRate === 'string' ? likelihoodAnalysis.metrics.completionRate : likelihoodAnalysis.metrics.completionRate.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
        );
      })()}

      {/* Category Breakdown */}
        {categoryStats && categoryStats.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryStats.map((category: any) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name || category.categoryName}</Text>
                  <Text style={styles.categoryWeight}>Weight {category.weight}%</Text>
                </View>
                
                <View style={styles.categoryMetrics}>
                  <View style={[styles.metricCard, { backgroundColor: colors.orange?.[100] || '#FEF3C7' }]}>
                    <Text style={styles.metricValue}>
                      {category.average !== null && category.average !== undefined && typeof category.average === 'number' && !isNaN(category.average) 
                        ? category.average.toFixed(2) 
                        : '0.00'}%
                    </Text>
                    <Text style={styles.metricLabel}>Average</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.blue?.[100] || '#DBEAFE' }]}>
                    <Text style={styles.metricValue}>
                      {category.gpa !== null && category.gpa !== undefined ? category.gpa.toFixed(2) : '0.00'}
                    </Text>
                    <Text style={styles.metricLabel}>
                      ({category.average !== null && category.average !== undefined && typeof category.average === 'number' && !isNaN(category.average) 
                        ? category.average.toFixed(0) 
                        : '0'}%)
                    </Text>
                    <Text style={styles.metricSubLabel}>GPA</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.green?.[100] || '#DCFCE7' }]}>
                    <Text style={styles.metricValue}>{category.completed}</Text>
                    <Text style={styles.metricLabel}>Completed</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.red?.[100] || '#FEE2E2' }]}>
                    <Text style={styles.metricValue}>{category.pending}</Text>
                    <Text style={styles.metricLabel}>Pending</Text>
                  </View>
                </View>
              
                <View style={styles.completionSection}>
                  <Text style={styles.completionLabel}>Completion Progress</Text>
                  <View style={styles.completionBar}>
                    <View 
                      style={[
                        styles.completionFill, 
                        { 
                          width: `${category.count > 0 ? (category.completed / category.count) * 100 : 0}%`,
                          backgroundColor: colors.green?.[500] || '#10B981'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.completionPercentage}>
                    {category.count > 0 && category.completed !== null && category.completed !== undefined ? ((category.completed / category.count) * 100).toFixed(0) : '0'}%
                  </Text>
                </View>
              
                <View style={styles.contributionSection}>
                  <Text style={styles.contributionLabel}>Contribution to Course Grade</Text>
                  <Text style={styles.contributionSubLabel}>Based on weight and performance</Text>
                  <Text style={styles.contributionValue}>
                    {category.contribution !== null && category.contribution !== undefined ? category.contribution.toFixed(2) : '0.00'}% points
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  overallSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  overallCards: {
    flexDirection: 'row',
    gap: 8,
  },
  overallCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  overallValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  overallSubLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  termSection: {
    marginBottom: 16,
  },
  termDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  termCards: {
    flexDirection: 'row',
    gap: 8,
  },
  termCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  termValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  termWeight: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  termName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  termStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  termStatusIcon: {
    fontSize: 12,
  },
  termStatusText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  goalSection: {
    marginBottom: 16,
  },
  goalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  goalProgress: {
    alignItems: 'center',
  },
  goalCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    borderWidth: 4,
    borderColor: colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  goalLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  keyMetricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  keyMetricCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  keyMetricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  keyMetricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  keyMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  categoriesSection: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryWeight: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  categoryMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  metricSubLabel: {
    fontSize: 8,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  completionSection: {
    marginBottom: 12,
  },
  completionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  completionBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginBottom: 4,
  },
  completionFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: 3,
  },
  completionPercentage: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  contributionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 8,
  },
  contributionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  contributionSubLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  contributionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
