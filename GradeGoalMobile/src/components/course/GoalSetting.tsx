import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { GoalHeader } from './GoalHeader';
import { GoalFilter } from './GoalFilter';
import { GoalCard } from './GoalCard';
import { AddGoalModal } from '../modals/AddGoalModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { getGoalsByUserId, createGoal, updateGoal, deleteGoal, validateGoalData } from '../../services/goalsService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';

interface GoalSettingProps {
  userEmail: string;
  courses?: any[];
  grades?: any;
  isCompact?: boolean;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({
  userEmail,
  courses = [],
  grades = {},
  isCompact = false
}) => {
  // State management
  const [goals, setGoals] = useState<any[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    goalType: '',
    status: '',
    semester: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const { currentUser } = useAuth();

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userEmail) return;
      
      try {
        // Get user profile from the backend using the email
        const { DashboardService } = await import('../../services/dashboardService');
        const userProfile = await DashboardService.getUserProfile(userEmail);
        setUser(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback: try to get user ID from currentUser context
        if (currentUser?.userId) {
          setUser({ userId: currentUser.userId, email: userEmail });
        }
      }
    };

    loadUserProfile();
  }, [userEmail, currentUser]);

  // Load goals when user is available
  useEffect(() => {
    const loadGoals = async () => {
      if (!user?.userId) return;

      try {
        const goalsData = await getGoalsByUserId(user.userId);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
        Alert.alert('Error', 'Failed to load goals. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, [user?.userId]);

  // Filter goals when activeFilters or goals change
  useEffect(() => {
    let filtered = goals;
    
    // Apply goal type filter
    if (activeFilters.goalType && activeFilters.goalType !== 'all') {
      filtered = filtered.filter(goal => goal.goalType === activeFilters.goalType);
    }
    
    // Apply status filter
    if (activeFilters.status) {
      if (activeFilters.status === 'active') {
        // Active goals: not achieved AND course not completed (for course-specific goals)
        filtered = filtered.filter(goal => {
          if (goal.isAchieved === true) return false; // Already achieved
          
          // For course-specific goals, check if course is completed
          if (goal.courseId) {
            const course = courses.find(c => c.courseId === goal.courseId);
            return course && course.isCompleted !== true;
          }
          
          // Non-course goals (semester/cumulative) are active until achieved
          return true;
        });
      } else if (activeFilters.status === 'achieved') {
        filtered = filtered.filter(goal => goal.isAchieved === true);
      } else if (activeFilters.status === 'not_achieved') {
        // Not achieved goals: includes active goals + completed courses where goal wasn't achieved
        filtered = filtered.filter(goal => {
          if (goal.isAchieved === true) return false; // Already achieved
          
          // If course is completed and goal wasn't achieved, this counts as "not achieved"
          if (goal.courseId) {
            const course = courses.find(c => c.courseId === goal.courseId);
            return course && course.isCompleted === true;
          }
          
          return false; // Non-course goals without achievement status don't count as "not achieved"
        });
      }
    }
    
    // Apply semester filter
    if (activeFilters.semester) {
      filtered = filtered.filter(goal => {
        if (goal.courseId) {
          const course = courses.find(c => c.courseId === goal.courseId);
          return course && course.semester === activeFilters.semester;
        }
        return false; // Non-course goals don't have semester
      });
    }
    
    setFilteredGoals(filtered);
  }, [goals, activeFilters, courses]);

  // Goal count calculation
  const goalCounts = {
    all: goals.length,
    cumulative: goals.filter(goal => goal.goalType === 'CUMMULATIVE_GPA').length,
    semester: goals.filter(goal => goal.goalType === 'SEMESTER_GPA').length,
    course: goals.filter(goal => goal.goalType === 'COURSE_GRADE').length,
    active: goals.filter(goal => {
      if (goal.isAchieved === true) return false; // Already achieved
      
      // For course-specific goals, check if course is completed
      if (goal.courseId) {
        const course = courses.find(c => c.courseId === goal.courseId);
        return course && course.isCompleted !== true;
      }
      
      // Non-course goals (semester/cumulative) are active until achieved
      return true;
    }).length,
    achieved: goals.filter(goal => goal.isAchieved === true).length,
    notAchieved: goals.filter(goal => {
      if (goal.isAchieved === true) return false; // Already achieved
      
      // If course is completed and goal wasn't achieved, this counts as "not achieved"
      if (goal.courseId) {
        const course = courses.find(c => c.courseId === goal.courseId);
        return course && course.isCompleted === true;
      }
      
      return false; // Non-course goals without achievement status don't count as "not achieved"
    }).length
  };

  // Add semester counts
  const semesters = [...new Set(courses.map(course => course.semester).filter(Boolean))];
  semesters.forEach(semester => {
    goalCounts[`semester_${semester}`] = goals.filter(goal => {
      if (goal.courseId) {
        const course = courses.find(c => c.courseId === goal.courseId);
        return course && course.semester === semester;
      }
      return false;
    }).length;
  });

  // Event handlers
  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSubmitGoal = async (formData: any) => {
    if (!user?.userId) return;

    try {
      // Validate goal data
      const validation = validateGoalData(formData);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      // Prepare goal data
      const goalData = {
        userId: user.userId,
        goalTitle: formData.goalTitle,
        goalType: formData.goalType,
        targetValue: parseFloat(formData.targetValue),
        targetDate: formData.targetDate || null,
        description: formData.description || '',
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        semester: formData.semester || null,
        academicYear: formData.academicYear || null,
        priority: formData.priority || 'MEDIUM'
      };

      let updatedGoal;
      if (editingGoal) {
        updatedGoal = await updateGoal(editingGoal.goalId, goalData);
        setGoals(prev => prev.map(goal => 
          goal.goalId === editingGoal.goalId ? updatedGoal : goal
        ));
      } else {
        updatedGoal = await createGoal(goalData);
        setGoals(prev => [...prev, updatedGoal]);
      }

      setIsModalOpen(false);
      setEditingGoal(null);
      
      Alert.alert(
        'Success', 
        editingGoal ? 'Goal updated successfully!' : 'Goal created successfully!'
      );
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goal: any) => {
    setDeleteConfirm(goal);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const goalToDelete = deleteConfirm;
    setDeleteConfirm(null);

    try {
      await deleteGoal(goalToDelete.goalId);
      setGoals(prev => prev.filter(goal => goal.goalId !== goalToDelete.goalId));
      Alert.alert('Success', 'Goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal. Please try again.');
    }
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };


  const renderGoalCard = ({ item }: { item: any }) => (
    <GoalCard
      goal={item}
      courses={courses}
      grades={grades}
      onEdit={handleEditGoal}
      onDelete={handleDeleteGoal}
      isCompact={isCompact}
      allGoals={filteredGoals}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No goals found</Text>
      <Text style={styles.emptyStateText}>
        {Object.values(activeFilters).every(filter => !filter)
          ? 'Create your first academic goal to get started!'
          : 'No goals found for the current filters.'
        }
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <GoalHeader 
        onAddGoal={handleAddGoal}
        isCompact={isCompact}
      />

      {/* Filter */}
      <GoalFilter
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        goalCounts={goalCounts}
        courses={courses}
        isCompact={isCompact}
      />

      {/* Goals List */}
      <FlatList
        data={filteredGoals}
        renderItem={renderGoalCard}
        keyExtractor={(item) => item.goalId.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredGoals.length === 0 ? styles.emptyListContainer : undefined}
      />

      {/* Add/Edit Goal Modal */}
      <AddGoalModal
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitGoal}
        editingGoal={editingGoal}
        courses={courses}
        userEmail={userEmail}
        existingGoals={goals}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteConfirm?.goalTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
