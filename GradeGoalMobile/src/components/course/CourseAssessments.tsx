import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors } from '../../styles/colors';
import { CourseService } from '../../services/courseService';
import { SemesterTermTabs } from './SemesterTermTabs';
import { AssessmentCategories } from './AssessmentCategories';
import { AddScoreModal } from '../modals/AddScoreModal';
import { EditScoreModal } from '../modals/EditScoreModal';
import { AssessmentModal } from '../modals/AssessmentModal';

interface CourseAssessmentsProps {
  course: any;
  userId?: number;
  onGradeUpdate?: () => void;
}

export const CourseAssessments: React.FC<CourseAssessmentsProps> = ({
  course,
  userId,
  onGradeUpdate,
}) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSemesterTerm, setActiveSemesterTerm] = useState<string>('MIDTERM');
  const [isMidtermCompleted, setIsMidtermCompleted] = useState<boolean>(false);
  const [showAddScoreModal, setShowAddScoreModal] = useState(false);
  const [showEditScoreModal, setShowEditScoreModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<any>(null);

  useEffect(() => {
    loadAssessmentData();
  }, [course?.id]);

  const loadAssessmentData = async () => {
    if (!course?.id) return;
    
    try {
      setLoading(true);
      const [gradesData, categoriesData] = await Promise.all([
        CourseService.getGradesByCourseId(course.id),
        CourseService.getCourseCategories(course.id),
      ]);
      
      setGrades(gradesData || []);
      setCategories(categoriesData || []);
      
      // Check if midterm is completed
      const midtermGrades = (gradesData || []).filter((grade: any) => 
        grade.semesterTerm === 'MIDTERM' && grade.score !== null && grade.score !== undefined
      );
      setIsMidtermCompleted(midtermGrades.length > 0);
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryAverage = async (categoryId: number) => {
    try {
      const categoryGrades = grades.filter((grade: any) => 
        grade.categoryId === categoryId && 
        grade.semesterTerm === activeSemesterTerm &&
        grade.score !== null && 
        grade.score !== undefined
      );
      
      if (categoryGrades.length === 0) {
        return null;
      }
      
      const totalScore = categoryGrades.reduce((sum: number, grade: any) => {
        const percentage = (grade.score / grade.maxScore) * 100;
        return sum + percentage;
      }, 0);
      
      return totalScore / categoryGrades.length;
    } catch (error) {
      console.error('Error calculating category average:', error);
      return null;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssessmentData();
    setRefreshing(false);
  };

  const handleSemesterTermChange = (term: string) => {
    setActiveSemesterTerm(term);
  };

  const handleMarkMidtermAsDone = async () => {
    try {
      setIsMidtermCompleted(true);
      Alert.alert('Success', 'Midterm has been marked as completed!');
    } catch (error) {
      console.error('Error marking midterm as done:', error);
      Alert.alert('Error', 'Failed to mark midterm as completed');
    }
  };

  const handleAddAssessment = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setShowAssessmentModal(true);
  };

  const handleAssessmentClick = (grade: any) => {
    setSelectedGrade(grade);
    setShowAddScoreModal(true);
  };

  const handleEditScore = (grade: any) => {
    setSelectedGrade(grade);
    setShowEditScoreModal(true);
  };

  const handleEditAssessment = (grade: any) => {
    setSelectedGrade(grade);
    setShowAssessmentModal(true);
  };

  const handleDeleteAssessment = async (gradeId: number, categoryId: number) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CourseService.deleteGrade(gradeId);
              await loadAssessmentData();
              onGradeUpdate?.();
            } catch (error) {
              console.error('Error deleting assessment:', error);
              Alert.alert('Error', 'Failed to delete assessment');
            }
          },
        },
      ]
    );
  };

  const handleModalClose = () => {
    setShowAddScoreModal(false);
    setShowEditScoreModal(false);
    setShowAssessmentModal(false);
    setSelectedGrade(null);
    setSelectedCategoryId(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    loadAssessmentData();
    onGradeUpdate?.();
  };

  // Group grades by category
  const gradesByCategory = categories.reduce((acc, category) => {
    acc[category.id] = grades.filter((grade: any) => 
      grade.categoryId === category.id && grade.semesterTerm === activeSemesterTerm
    );
    return acc;
  }, {} as Record<number, any[]>);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading assessments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Semester Term Tabs */}
        <SemesterTermTabs
          activeTerm={activeSemesterTerm}
          onTermChange={handleSemesterTermChange}
          isMidtermCompleted={isMidtermCompleted}
          onMarkMidtermAsDone={handleMarkMidtermAsDone}
          setConfirmationModal={setConfirmationModal}
          isCourseCompleted={course?.isCompleted}
        />

        {/* Assessment Categories */}
        <AssessmentCategories
          categories={categories}
          grades={gradesByCategory}
          getCategoryAverage={getCategoryAverage}
          onAddAssessment={handleAddAssessment}
          onAssessmentClick={handleAssessmentClick}
          onEditScore={handleEditScore}
          onEditAssessment={handleEditAssessment}
          onDeleteAssessment={handleDeleteAssessment}
          course={course}
          targetGrade={course?.targetGrade}
          activeSemesterTerm={activeSemesterTerm}
          isMidtermCompleted={isMidtermCompleted}
          isCourseCompleted={course?.isCompleted}
        />

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No assessment categories found</Text>
            <Text style={styles.emptyStateSubtext}>
              Add categories to organize your assessments
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AddScoreModal
        visible={showAddScoreModal}
        grade={selectedGrade}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      <EditScoreModal
        visible={showEditScoreModal}
        grade={selectedGrade}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      <AssessmentModal
        visible={showAssessmentModal}
        categoryId={selectedCategoryId}
        grade={selectedGrade}
        course={course}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Extra space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});