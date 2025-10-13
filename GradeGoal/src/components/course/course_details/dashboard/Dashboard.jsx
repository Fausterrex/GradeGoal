// ========================================
// DASHBOARD COMPONENT
// ========================================
// Main dashboard layout that organizes all course detail components

import React, { useState } from "react";
import UnifiedAnalytics from "./UnifiedAnalytics";
import UnifiedProgress from "./UnifiedProgress";
import UnifiedRecommendations from "./UnifiedRecommendations";
import UnifiedGradeBreakdown from "./UnifiedGradeBreakdown";
import UserProgress from "./UserProgress";
import GoalProgress from "./GoalProgress";
import AIAnalysisIndicator from "../../../ai/components/AIAnalysisIndicator";
function Dashboard({
  course,
  grades,
  categories,
  targetGrade,
  currentGrade,
  colorScheme,
  userProgress,
  userAnalytics,
  userId,
  activeSemesterTerm,
  isMidtermCompleted,
  isCourseCompleted = false,
  onSetGoal = () => {} // Callback for setting goals
}) {
  const [aiAnalysisRefreshTrigger, setAiAnalysisRefreshTrigger] = useState(0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <div className="w-full px-4 lg:px-6 py-8">
        
        {/* Course Completion Indicator */}
        {isCourseCompleted && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">
                  Course Completed
                </h3>
                <p className="text-sm text-green-700">
                  This course has been completed. Assessment modifications are disabled to preserve academic records.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Analysis Indicator */}
        <AIAnalysisIndicator
          course={course}
          grades={grades}
          categories={categories}
          targetGrade={targetGrade}
          currentGrade={currentGrade}
          activeSemesterTerm={activeSemesterTerm}
          isCourseCompleted={isCourseCompleted}
          onAnalysisComplete={(result) => {
            console.log('AI Analysis completed:', result);
            // Trigger refresh of AI recommendations
            setAiAnalysisRefreshTrigger(prev => prev + 1);
          }}
        />
        
        {/* Two-Row Layout - Top: Sidebar + Main Content, Bottom: Full-Width Grade Breakdown */}
        <div className="space-y-8">
          
          {/* Top Row - Main Dashboard Content */}
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Sidebar - Goal & User Progress */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Goal Progress - Enhanced */}
              <div className="transform hover:scale-[1.02] transition-transform duration-300">
                <GoalProgress
                  currentGrade={currentGrade}
                  targetGrade={targetGrade}
                  course={course}
                  colorScheme={colorScheme}
                  grades={grades}
                  categories={categories}
                  onSetGoal={onSetGoal}
                  isCompact={true}
                />
              </div>
              
              {/* User Progress - Enhanced */}
              <div className="transform hover:scale-[1.02] transition-transform duration-300">
                <UserProgress 
                  userProgress={userProgress}
                  course={course}
                  userId={userId}
                />
              </div>
            </div>

            {/* Right Content - Analytics & Progress */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Analytics Section - Elevated */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:shadow-xl transition-all duration-300">
                <UnifiedAnalytics
                  userAnalytics={userAnalytics}
                  course={course}
                  grades={grades}
                  categories={categories}
                  targetGrade={targetGrade}
                  currentGrade={currentGrade}
                />
              </div>

              {/* Progress Chart - Elevated */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:shadow-xl transition-all duration-300">
                <UnifiedProgress
                  currentGrade={currentGrade}
                  targetGrade={targetGrade}
                  course={course}
                  grades={grades}
                  categories={categories}
                  colorScheme={colorScheme}
                  userAnalytics={userAnalytics}
                  isMidtermCompleted={isMidtermCompleted}
                  activeSemesterTerm={activeSemesterTerm}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row - Full Width Layout for Grade Breakdown & AI */}
          <div className="grid grid-cols-12 gap-8">
            
            {/* Grade Breakdown - Full Space, No Compression! */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:shadow-xl transition-all duration-300 p-6">
                <UnifiedGradeBreakdown
                  categories={categories}
                  grades={grades}
                  course={course}
                  colorScheme={colorScheme}
                  targetGrade={targetGrade}
                  currentGrade={currentGrade}
                  activeSemesterTerm={activeSemesterTerm}
                  isMidtermCompleted={isMidtermCompleted}
                />
              </div>
            </div>

            {/* AI Recommendations - Dedicated Space */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-6 transform hover:shadow-xl transition-all duration-300 h-full">
                <UnifiedRecommendations
                  course={course}
                  grades={grades}
                  categories={categories}
                  targetGrade={targetGrade}
                  currentGrade={currentGrade}
                  userAnalytics={userAnalytics}
                  refreshTrigger={aiAnalysisRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
