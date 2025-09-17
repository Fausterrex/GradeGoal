// ========================================
// DASHBOARD COMPONENT
// ========================================
// Main dashboard layout that organizes all course detail components

import React from "react";
import UnifiedAnalytics from "./UnifiedAnalytics";
import UnifiedProgress from "./UnifiedProgress";
import UnifiedRecommendations from "./UnifiedRecommendations";
import UnifiedGradeBreakdown from "./UnifiedGradeBreakdown";
import UserProgress from "./UserProgress";
import GoalProgress from "./GoalProgress";



function Dashboard({
  course,
  grades,
  categories,
  targetGrade,
  currentGrade,
  colorScheme,
  userProgress,
  userAnalytics,
  onSetGoal = () => {} // Callback for setting goals
}) {
  return (
    <div className="space-y-8">
      {/* Top Row - Goal Progress and User Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <GoalProgress
          currentGrade={currentGrade}
          targetGrade={targetGrade}
          course={course}
          colorScheme={colorScheme}
          onSetGoal={onSetGoal}
        />
        <UserProgress 
          userProgress={userProgress}
          course={course}
        />
      </div>
  

      {/* Unified Analytics */}
      <UnifiedAnalytics
        userAnalytics={userAnalytics}
        course={course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
      />

      {/* Unified Progress */}
      <UnifiedProgress
        currentGrade={currentGrade}
        targetGrade={targetGrade}
        course={course}
        grades={grades}
        categories={categories}
        colorScheme={colorScheme}
      />

      {/* Unified Grade Breakdown */}
      <UnifiedGradeBreakdown
        categories={categories}
        grades={grades}
        course={course}
        colorScheme={colorScheme}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
      />

      {/* Unified Recommendations */}
      <UnifiedRecommendations
        course={course}
        grades={grades}
        categories={categories}
        targetGrade={targetGrade}
        currentGrade={currentGrade}
        userAnalytics={userAnalytics}
      />
    </div>
  );
}

export default Dashboard;
