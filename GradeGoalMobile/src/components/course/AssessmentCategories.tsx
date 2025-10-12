import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../styles/colors';
import { AssessmentCategory } from './AssessmentCategory';
import { CourseService } from '../../services/courseService';

interface AssessmentCategoriesProps {
  categories: any[];
  grades: Record<number, any[]>;
  getCategoryAverage: (categoryId: number) => Promise<number | null>;
  onAddAssessment: (categoryId: number) => void;
  onAssessmentClick: (grade: any) => void;
  onEditScore: (grade: any) => void;
  onEditAssessment: (grade: any) => void;
  onDeleteAssessment: (gradeId: number, categoryId: number) => void;
  course: any;
  targetGrade?: number;
  activeSemesterTerm: string;
  isMidtermCompleted: boolean;
}

export const AssessmentCategories: React.FC<AssessmentCategoriesProps> = ({
  categories,
  grades,
  getCategoryAverage,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  course,
  targetGrade,
  activeSemesterTerm,
  isMidtermCompleted,
}) => {
  const [categoryAverages, setCategoryAverages] = useState<Record<number, number | null>>({});

  // Calculate category averages
  useEffect(() => {
    const loadCategoryAverages = async () => {
      if (!categories || categories.length === 0) return;
      
      const averages: Record<number, number | null> = {};
      for (const category of categories) {
        try {
          const average = await getCategoryAverage(category.id);
          averages[category.id] = average;
        } catch (error) {
          console.error('Error calculating category average:', error);
          averages[category.id] = null;
        }
      }
      setCategoryAverages(averages);
    };

    loadCategoryAverages();
  }, [categories, getCategoryAverage, activeSemesterTerm]);

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📁</Text>
        <Text style={styles.emptyStateTitle}>No Categories Found</Text>
        <Text style={styles.emptyStateText}>
          This course doesn't have any assessment categories yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const categoryGrades = grades[category.id] || [];
        let categoryAverage = categoryAverages[category.id] || null;
        
        // Fix category average calculation - only include completed assessments
        if (categoryAverage !== null && categoryGrades.length > 0) {
          const completedGrades = categoryGrades.filter((grade: any) => 
            grade.score !== null && grade.score !== undefined && grade.score > 0
          );
          
          if (completedGrades.length > 0) {
            // Calculate average from completed assessments only
            const completedAverage = completedGrades.reduce((sum: number, grade: any) => {
              let percentage = grade.percentage;
              if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
                percentage = (grade.score / grade.maxScore) * 100;
              }
              return sum + (percentage || 0);
            }, 0) / completedGrades.length;
            
            // Use the corrected average if it's different from the database calculation
            if (Math.abs(completedAverage - categoryAverage) > 1) {
              categoryAverage = completedAverage;
            }
          }
        }

        return (
          <AssessmentCategory
            key={category.id}
            category={category}
            categoryGrades={categoryGrades}
            categoryAverage={categoryAverage}
            onAddAssessment={onAddAssessment}
            onAssessmentClick={onAssessmentClick}
            onEditScore={onEditScore}
            onEditAssessment={onEditAssessment}
            onDeleteAssessment={onDeleteAssessment}
            course={course}
            allGrades={grades}
            allCategories={categories}
            targetGrade={targetGrade}
            activeSemesterTerm={activeSemesterTerm}
            isMidtermCompleted={isMidtermCompleted}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: colors.gray[300],
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
