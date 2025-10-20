// ========================================
// GOAL SETTING COMPONENT
// ========================================
// This component manages academic goals and targets
// Now refactored to use smaller, focused components

import React, { useState, useEffect } from "react";
import { getUserProfile } from "../../../backend/api";
import { auth } from "../../../backend/firebase";
import ConfirmationModal from "../../modals/ConfirmationModal";
import GoalHeader from "./GoalHeader";
import GoalFilter from "./GoalFilter";
import GoalCard from "./GoalCard";
import GoalModal from "../../modals/GoalModal";
import RealtimeNotificationService from "../../services/realtimeNotificationService";
import { useAchievements } from '../../services/useAchievements';
import { useYearLevel } from "../../context/YearLevelContext";
import { useAchievementNotifications } from "../../context/AchievementContext";
const GoalSetting = ({ userEmail, courses = [], grades = {}, isCompact = false }) => {
  const { filterDataByYearLevel, selectedYearLevel } = useYearLevel();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    goalType: '',
    status: '',
    semester: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Initialize achievements hook after user state is defined
  const { checkForAchievements } = useAchievements(user?.userId);
  const { showAchievementNotification } = useAchievementNotifications();
  

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
        // Get Firebase token for authentication
        const firebaseUser = auth.currentUser;
        let authToken = null;
        
        if (firebaseUser) {
          try {
            authToken = await firebaseUser.getIdToken();
          } catch (error) {
            console.error('Error getting Firebase token:', error);
          }
        }

        const headers = {
          "Content-Type": "application/json",
        };

        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const response = await fetch(`http://localhost:8080/api/academic-goals/user/${user.userId}`, {
          method: "GET",
          headers,
        });
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

  // Recalculate progress when grades change (debounced to prevent infinite loops)
  useEffect(() => {
    if (Object.keys(grades).length > 0 && goals.length > 0) {
      // Progress will be recalculated by individual GoalCard components
      // No need to trigger additional calculations here
      
        // Check for goal achievements (update database only, no email notification)
        goals.forEach(async (goal) => {
          
          if (goal.currentProgress && goal.targetValue) {
            const isAchieved = RealtimeNotificationService.isGoalAchieved(
              goal.currentProgress,
              goal.targetValue,
              goal.goalType
            );
            
            console.log('Goal achievement check:', {
              goalId: goal.goalId,
              goalTitle: goal.goalTitle,
              currentProgress: goal.currentProgress,
              targetValue: goal.targetValue,
              isAchieved: isAchieved,
              alreadyAchieved: goal.isAchieved,
              willUpdate: isAchieved && !goal.isAchieved
            });
            
            // Only update database if just achieved (not already marked as achieved in database)
            if (isAchieved && !goal.isAchieved) {
              try {
                // Update goal in database with proper fields
                const updateData = {
                  ...goal,
                  isAchieved: 1,
                  achievedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                  status: 'completed'
                };
                
                const response = await fetch(`http://localhost:8080/api/academic-goals/${goal.goalId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updateData)
                });
                
                if (response.ok) {
                  const updatedGoal = await response.json();
                  setGoals(prev => prev.map(g => g.goalId === goal.goalId ? updatedGoal : g));
                  
                  // Note: Achievement checking is handled by the backend when course is completed
                  // No need to check achievements here as this is just frontend progress calculation
                  } else {
                  }
              } catch (error) {
                }
            }
          } else {
          }
        });
    }
  }, [grades, courses, goals, userEmail]);

  // ========================================
  // GOAL COUNT CALCULATION
  // ========================================
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

  // Calculate semester counts
  semesters.forEach(semester => {
    goalCounts[`semester_${semester}`] = goals.filter(goal => {
      if (goal.courseId) {
        const course = courses.find(c => c.courseId === goal.courseId);
        return course && course.semester === semester;
      }
      return false;
    }).length;
  });

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
      // Get Firebase token for authentication
      const firebaseUser = auth.currentUser;
      let authToken = null;
      
      if (firebaseUser) {
        try {
          authToken = await firebaseUser.getIdToken();
        } catch (error) {
          console.error('Error getting Firebase token:', error);
        }
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Prepare goal data with proper validation
      const goalData = {
        userId: parseInt(user.userId),
        goalTitle: formData.goalTitle, // Use the actual goal title from the form
        goalType: formData.goalType,
        targetValue: parseFloat(formData.targetValue),
        targetDate: formData.targetDate || null,
        description: formData.description || '',
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        semester: formData.semester || null,
        academicYear: formData.academicYear || null,
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
        headers,
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
      // Get Firebase token for authentication
      const firebaseUser = auth.currentUser;
      let authToken = null;
      
      if (firebaseUser) {
        try {
          authToken = await firebaseUser.getIdToken();
        } catch (error) {
          console.error('Error getting Firebase token:', error);
        }
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`http://localhost:8080/api/academic-goals/${goalToDelete.goalId}`, {
        method: 'DELETE',
        headers,
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

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
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
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        goalCounts={goalCounts}
        courses={courses}
        isCompact={isCompact}
      />

      {/* Goals List - Responsive Grid Layout */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No goals found</div>
          <div className="text-gray-400 text-sm">
            {Object.values(activeFilters).every(filter => !filter)
              ? 'Create your first academic goal to get started!'
              : 'No goals found for the current filters.'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.goalId}
              goal={goal}
              courses={courses}
              grades={grades}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              isCompact={isCompact}
              allGoals={filteredGoals}
              isGridLayout={true}
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
