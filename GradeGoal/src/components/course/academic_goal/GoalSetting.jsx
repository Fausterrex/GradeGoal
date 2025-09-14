// ========================================
// GOAL SETTING COMPONENT
// ========================================
// This component manages academic goals and targets
// Now refactored to use smaller, focused components

import React, { useState, useEffect } from "react";
import { getUserProfile } from "../../../backend/api";
import ConfirmationModal from "../../common/ConfirmationModal";
import GoalHeader from "./GoalHeader";
import GoalFilter from "./GoalFilter";
import GoalCard from "./GoalCard";
import GoalModal from "./GoalModal";

const GoalSetting = ({ userEmail, courses = [], grades = {}, isCompact = false }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ========================================
  // EFFECTS
  // ========================================
  
  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userEmail) return;
      
      try {
        const userProfile = await getUserProfile(userEmail);
        setUser(userProfile);
    } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [userEmail]);

  // Load goals when user is available
  useEffect(() => {
    const loadGoals = async () => {
      if (!user?.userId) return;

      try {
        const response = await fetch(`http://localhost:8080/api/academic-goals/user/${user.userId}`);
        if (response.ok) {
          const goalsData = await response.json();
          setGoals(goalsData);
        } else {
          console.error('Failed to fetch goals from database');
        }
      } catch (error) {
        console.error('Error fetching goals from database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, [user?.userId]);

  // Filter goals when activeFilter or goals change
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(goals.filter(goal => goal.goalType === activeFilter));
    }
  }, [goals, activeFilter]);

  // Recalculate progress when grades change (debounced to prevent infinite loops)
  useEffect(() => {
    if (Object.keys(grades).length > 0 && goals.length > 0) {
      // Progress will be recalculated by individual GoalCard components
      // No need to trigger additional calculations here
    }
  }, [grades, courses, goals]);

  // ========================================
  // GOAL COUNT CALCULATION
  // ========================================
  const goalCounts = {
    all: goals.length,
    cumulative: goals.filter(goal => goal.goalType === 'CUMMULATIVE_GPA').length,
    semester: goals.filter(goal => goal.goalType === 'SEMESTER_GPA').length,
    course: goals.filter(goal => goal.goalType === 'COURSE_GRADE').length
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSubmitGoal = async (formData) => {
    if (!user?.userId) return;

    try {
      // Prepare goal data with proper validation
      const goalData = {
        userId: parseInt(user.userId),
        goalTitle: formData.goalType, // Backend expects 'goalTitle' not 'goalType'
        goalType: formData.goalType,
        targetValue: parseFloat(formData.targetValue),
        targetDate: formData.targetDate || null,
        description: formData.description || '',
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        status: 'active',
        priority: formData.priority || 'medium'
      };

      // Remove any undefined or null values that might cause validation errors
      Object.keys(goalData).forEach(key => {
        if (goalData[key] === undefined || goalData[key] === '') {
          delete goalData[key];
        }
      });

      const url = editingGoal 
        ? `http://localhost:8080/api/academic-goals/${editingGoal.goalId}`
        : 'http://localhost:8080/api/academic-goals';
      
      const method = editingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const updatedGoal = await response.json();
        
        if (editingGoal) {
          setGoals(prev => prev.map(goal => 
            goal.goalId === editingGoal.goalId ? updatedGoal : goal
          ));
        } else {
          setGoals(prev => [...prev, updatedGoal]);
        }
        
        return updatedGoal;
      } else {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to save goal: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving goal to database:', error);
      throw error;
    }
  };


  const handleDeleteGoal = (goal) => {
    setDeleteConfirm(goal);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    // Close modal immediately to prevent UI blocking
    const goalToDelete = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`http://localhost:8080/api/academic-goals/${goalToDelete.goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.goalId !== goalToDelete.goalId));
      } else {
        console.error('Failed to delete goal');
        alert('Failed to delete goal. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal. Please try again.');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
  return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading goals...</div>
                          </div>
                        );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <GoalHeader 
        onAddGoal={handleAddGoal}
        isCompact={isCompact}
      />

      {/* Filter */}
      <GoalFilter
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        goalCounts={goalCounts}
        isCompact={isCompact}
      />

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No goals found</div>
          <div className="text-gray-400 text-sm">
            {activeFilter === 'all' 
              ? 'Create your first academic goal to get started!'
              : 'No goals found for this category.'
            }
                      </div>
                    </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.goalId}
              goal={goal}
              courses={courses}
              grades={grades}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              isCompact={isCompact}
            />
          ))}
                    </div>
                  )}

      {/* Add/Edit Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitGoal}
        editingGoal={editingGoal}
        courses={courses}
        userEmail={userEmail}
        existingGoals={goals}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteConfirm?.goalTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        showWarning={true}
        warningItems={[
          "This goal will be permanently removed",
          "All progress tracking will be lost",
          "This action cannot be undone"
        ]}
      />
    </div>
  );
};

export default GoalSetting;
