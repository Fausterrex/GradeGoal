// ========================================
// AI ANALYSIS INDICATOR COMPONENT
// ========================================
// Component that shows AI analysis status and provides analysis/re-analysis buttons
// Detects changes in assessments and category weights to determine if re-analysis is needed

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { generateAIRecommendations } from "../services/groqService";
import { checkAIAnalysisExists } from "../../../backend/api";
import { setAIAnalysisData } from "../services/aiAnalysisService";
import { 
  FaRobot, 
  FaSync, 
  FaSpinner, 
  FaExclamationTriangle,
  FaBrain
} from "react-icons/fa";
const AIAnalysisIndicator = ({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  activeSemesterTerm,
  onAnalysisComplete,
  courses = [], // Add courses prop for cumulative GPA semester counting
  isCourseCompleted = false // Add course completion status
}) => {
  
  const { currentUser } = useAuth();
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  // Create a hash of current course data to detect changes
  const currentDataHash = useMemo(() => {
    if (!course || !grades || !categories) return null;
    
    // Calculate total assessments from categories (consistent with totalAssessments calculation)
    const assessmentsCount = categories.reduce((count, cat) => {
      const categoryGrades = grades[cat.id] || [];
      return count + categoryGrades.length;
    }, 0);
    const categoriesData = categories?.map(cat => ({
      name: cat.name || cat.categoryName || 'Unknown',
      weight: cat.weight,
      assessments: cat.assessments?.length || 0
    })).sort((a, b) => (a.name || '').localeCompare(b.name || '')) || [];
    
    const targetData = {
      targetGrade: targetGrade?.targetValue || 0,
      goalType: targetGrade?.goalType || 'COURSE_GRADE'
    };
    
    return JSON.stringify({
      courseId: course.id,
      assessmentsCount,
      categoriesData,
      targetData,
      currentGrade: currentGrade || 0,
      activeSemesterTerm
    });
  }, [course, grades, categories, targetGrade, currentGrade, activeSemesterTerm]);

  // Check if analysis exists and detect changes
  useEffect(() => {
    const checkAnalysisStatus = async () => {
      if (!currentUser || !course) return;
      
      try {
        // Get user profile to get database user ID
        const { getUserProfile } = await import('../../../backend/api');
        const userProfile = await getUserProfile(currentUser.email);
        
        if (!userProfile?.userId) {
          console.warn('No user profile found for email:', currentUser.email);
          return;
        }
        
        // Check if analysis exists in database using database user ID
        const existsResponse = await checkAIAnalysisExists(userProfile.userId, course.id);
        const exists = existsResponse.success && existsResponse.exists;
        setHasExistingAnalysis(exists);
        
        // Always show the indicator (like Academic Goals cards)
        setShowIndicator(true);
      } catch (error) {
        console.error('Error checking analysis status:', error);
        setShowIndicator(true);
      }
    };

    checkAnalysisStatus();
  }, [currentUser, course, currentDataHash]);

  // Store data hash when analysis is completed
  const storeAnalysisHash = (courseId) => {
    localStorage.setItem(`ai-analysis-hash-${courseId}`, currentDataHash);
  };

  // Handle analysis button click
  const handleAnalysisClick = async () => {
    const startTime = performance.now();
    console.log('🚀 [AI INDICATOR DEBUG] Starting AI analysis click handler');
    console.log('🚀 [AI INDICATOR DEBUG] Timestamp:', new Date().toISOString());
    
    if (!currentUser || !course || isAnalyzing) {
      console.log('⚠️ [AI INDICATOR DEBUG] Analysis blocked - missing user/course or already analyzing');
      return;
    }
    
    setIsAnalyzing(true);
    console.log('🔄 [AI INDICATOR DEBUG] Set analyzing state to true');
    
    try {
      // Get user profile to get database user ID
      console.log('👤 [AI INDICATOR DEBUG] Getting user profile...');
      const profileStart = performance.now();
      const { getUserProfile } = await import('../../../backend/api');
      const userProfile = await getUserProfile(currentUser.email);
      console.log('👤 [AI INDICATOR DEBUG] User profile fetch took:', (performance.now() - profileStart).toFixed(2), 'ms');
      
      if (!userProfile?.userId) {
        console.error('❌ [AI INDICATOR DEBUG] No user profile found for email:', currentUser.email);
        return;
      }
      
      console.log('✅ [AI INDICATOR DEBUG] User profile found:', {
        userId: userProfile.userId,
        email: currentUser.email
      });
      
      // Include all available grades for comprehensive AI analysis
      console.log('📊 [AI INDICATOR DEBUG] Processing grades data...');
      const gradesStart = performance.now();
      const filteredGrades = {};
      if (grades) {
        Object.keys(grades).forEach(categoryId => {
          const categoryGrades = grades[categoryId] || [];
          // Analyze ALL available grades, not just MIDTERM
          filteredGrades[categoryId] = categoryGrades;
        });
        console.log('📊 [AI INDICATOR DEBUG] Grades processed:', {
          categoriesCount: Object.keys(filteredGrades).length,
          totalGrades: Object.values(filteredGrades).flat().length
        });
      } else {
        console.warn('⚠️ [AI INDICATOR DEBUG] No grades data available');
      }
      console.log('📊 [AI INDICATOR DEBUG] Grades processing took:', (performance.now() - gradesStart).toFixed(2), 'ms');

      // Get the latest course GPA directly from the database
      console.log('🎓 [AI INDICATOR DEBUG] Getting latest course data...');
      const courseDataStart = performance.now();
      const { getCourseById } = await import('../../../backend/api');
      const latestCourseData = await getCourseById(course.id);
      const latestGPA = latestCourseData?.courseGpa || currentGrade || 0;
      console.log('🎓 [AI INDICATOR DEBUG] Course data fetch took:', (performance.now() - courseDataStart).toFixed(2), 'ms');
      console.log('🎓 [AI INDICATOR DEBUG] Latest GPA:', latestGPA);
      
      // Prepare course data for AI analysis
      console.log('📋 [AI INDICATOR DEBUG] Preparing course data for AI analysis...');
      const courseData = {
        course: {
          ...course,
          userId: userProfile.userId // Use database user ID
        },
        grades: filteredGrades,
        categories: categories || [],
        currentGPA: latestGPA, // Use database GPA, not prop
        progress: calculateProgress(filteredGrades, categories),
        activeSemesterTerm: activeSemesterTerm // Use the actual active semester term
      };
      
      const goalData = {
        targetValue: targetGrade?.targetValue || 100,
        goalType: targetGrade?.goalType || 'COURSE_GRADE'
      };
      
      console.log('📋 [AI INDICATOR DEBUG] Course data prepared:', {
        courseId: courseData.course.id,
        userId: courseData.course.userId,
        currentGPA: courseData.currentGPA,
        progress: courseData.progress,
        activeSemesterTerm: courseData.activeSemesterTerm,
        categoriesCount: courseData.categories.length,
        gradesCount: Object.keys(courseData.grades).length
      });
      console.log('🎯 [AI INDICATOR DEBUG] Goal data prepared:', goalData);
      
      console.log('🤖 [AI INDICATOR DEBUG] Starting AI analysis for course:', course.courseName);
      
      // Clear cache to ensure fresh analysis with updated logic
      console.log('🗑️ [AI INDICATOR DEBUG] Clearing AI analysis cache...');
      const { clearAIAnalysisCache } = await import('../services/groqService');
      clearAIAnalysisCache(userProfile.userId, course.id);
      
      // Generate AI recommendations
      console.log('🚀 [AI INDICATOR DEBUG] Calling generateAIRecommendations...');
      const aiAnalysisStart = performance.now();
      const analysisResult = await generateAIRecommendations(
        courseData, 
        goalData, 
        'HIGH'
      );
      const aiAnalysisTime = performance.now() - aiAnalysisStart;
      console.log('⚡ [AI INDICATOR DEBUG] AI analysis took:', aiAnalysisTime.toFixed(2), 'ms');
      
      if (analysisResult) {
        console.log('✅ [AI INDICATOR DEBUG] AI analysis completed successfully');
        console.log('📊 [AI INDICATOR DEBUG] Analysis result:', {
          userId: analysisResult.userId,
          courseId: analysisResult.courseId,
          recommendationType: analysisResult.recommendationType,
          title: analysisResult.title,
          aiGenerated: analysisResult.aiGenerated,
          aiModel: analysisResult.aiModel
        });
        
        // Store the analysis data
        setAIAnalysisData(analysisResult);
        
        // Store the data hash to track changes
        storeAnalysisHash(course.id);
        
        // Clear any old cache to ensure fresh data
        const { clearAIAnalysisCache } = await import('../services/groqService');
        clearAIAnalysisCache(analysisResult.userId, analysisResult.courseId);
        
        // Update state
        setHasExistingAnalysis(true);
        // Keep showing the indicator (like Academic Goals cards)
        
        // Notify parent component
        if (onAnalysisComplete) {
          console.log('📢 [AI INDICATOR DEBUG] Notifying parent component of completion');
          onAnalysisComplete(analysisResult);
        }
        
      } else {
        console.warn('⚠️ [AI INDICATOR DEBUG] AI analysis returned no result');
      }
    } catch (error) {
      console.error('❌ [AI INDICATOR DEBUG] Error in AI analysis:', error);
      console.error('❌ [AI INDICATOR DEBUG] Error stack:', error.stack);
    } finally {
      setIsAnalyzing(false);
      console.log('🔄 [AI INDICATOR DEBUG] Set analyzing state to false');
      console.log('✅ [AI INDICATOR DEBUG] Total analysis handler time:', (performance.now() - startTime).toFixed(2), 'ms');
    }
  };

  // Calculate course progress
  const calculateProgress = (grades, categories) => {
    if (!grades || !categories || categories.length === 0) return 0;
    
    const totalWeight = categories.reduce((sum, cat) => sum + (cat.weight || 0), 0);
    const completedWeight = categories.reduce((sum, cat) => {
      // Handle grades as object where keys are category IDs
      const categoryGrades = grades[cat.id] || [];
      const completedInCategory = categoryGrades.filter(grade => 
        grade.score !== null && grade.score !== undefined && grade.score > 0
      ).length;
      const totalInCategory = Math.max(categoryGrades.length, 1);
      return sum + (cat.weight || 0) * (completedInCategory / totalInCategory);
    }, 0);
    
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  // Calculate total assessments count based on goal type
  let totalAssessments = 0;
  let hasEnoughAssessments = false;
  let isComingSoonGoal = false; // Flag for Semester GPA and Cumulative GPA goals
  
  if (targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA') {
    // For cumulative GPA goals - show "Coming Soon" message
    isComingSoonGoal = true;
    totalAssessments = 0;
    hasEnoughAssessments = false;
  } else if (targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'SEMESTER_GPA') {
    // For semester GPA goals - show "Coming Soon" message
    isComingSoonGoal = true;
    totalAssessments = 0;
    hasEnoughAssessments = false;
  } else {
    // For course goals, count individual assessments
    totalAssessments = categories.reduce((count, cat) => {
      const categoryGrades = grades[cat.id] || [];
      return count + categoryGrades.length;
    }, 0);
    hasEnoughAssessments = totalAssessments >= 2; // Need at least 2 assessments
  }
  
  // Check if goal is set - disable button if no goal
  // Handle both object format (from GoalCard) and number format (from Dashboard)
  const hasGoal = targetGrade && (
    (typeof targetGrade === 'object' && targetGrade.targetValue && targetGrade.targetValue > 0) ||
    (typeof targetGrade === 'number' && targetGrade > 0)
  );
  // Don't show indicator if no changes detected and analysis exists
  if (!showIndicator) {
    return null;
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 shadow-sm max-w-md w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaBrain className="w-6 h-6 text-purple-500" />
            </div>
             <div className="flex-1">
               <h3 className="text-lg font-semibold text-gray-900">
                 {!hasGoal || !hasEnoughAssessments
                   ? 'AI Analysis Requirements' 
                   : 'AI Analysis Available'
                 }
               </h3>
               <p className="text-sm text-gray-600 mt-1">
                 {isComingSoonGoal
                   ? targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA'
                     ? 'AI Analysis features for Cumulative GPA Goals are coming soon! Stay tuned for personalized insights and recommendations.'
                     : targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'SEMESTER_GPA'
                     ? 'AI Analysis features for Semester GPA Goals are coming soon! Stay tuned for personalized insights and recommendations.'
                     : 'AI Analysis features for this goal type are coming soon!'
                   : isCourseCompleted
                   ? 'Course has been completed. AI analysis is no longer available.'
                   : !hasGoal
                   ? 'Set a goal first to enable AI analysis.'
                   : !hasEnoughAssessments 
                     ? `You need at least 2 assessments to analyze student performance. Currently have ${totalAssessments} assessment${totalAssessments !== 1 ? 's' : ''}.`
                     : hasExistingAnalysis 
                       ? 'Update your AI analysis with latest course data and performance insights.'
                       : 'Get personalized AI insights and recommendations for your academic performance.'
                 }
               </p>
             </div>
          </div>
          
          <div className="flex-shrink-0">
             <button
               onClick={handleAnalysisClick}
               disabled={isAnalyzing || !hasEnoughAssessments || !hasGoal || isCourseCompleted || isComingSoonGoal}
               className={`
                 inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                 ${isAnalyzing || !hasEnoughAssessments || !hasGoal || isCourseCompleted || isComingSoonGoal
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                   : hasExistingAnalysis
                     ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                     : 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
                 }
               `}
             >
               {isComingSoonGoal ? (
                 <>
                   <FaRobot className="w-4 h-4 mr-2" />
                   Coming Soon
                 </>
               ) : isAnalyzing ? (
                 <>
                   <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                   Analyzing...
                 </>
               ) : isCourseCompleted ? (
                 <>
                   <FaRobot className="w-4 h-4 mr-2" />
                   Course Completed
                 </>
               ) : !hasEnoughAssessments || !hasGoal ? (
                 <>
                   <FaRobot className="w-4 h-4 mr-2" />
                   Get AI Analysis
                 </>
               ) : hasExistingAnalysis ? (
                 <>
                   <FaSync className="w-4 h-4 mr-2" />
                   Re-analyze
                 </>
               ) : (
                 <>
                   <FaRobot className="w-4 h-4 mr-2" />
                   Get AI Analysis
                 </>
               )}
             </button>
          </div>
        </div>
        
        {/* Coming Soon Indicator for Semester GPA and Cumulative GPA Goals */}
        {isComingSoonGoal && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              <FaRobot className="w-3 h-3 mr-1" />
              {targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA'
                ? 'AI Analysis for Cumulative GPA Goals coming soon!'
                : targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'SEMESTER_GPA'
                ? 'AI Analysis for Semester GPA Goals coming soon!'
                : 'AI Analysis for this goal type coming soon!'
              }
            </div>
          </div>
        )}
        
        {/* Goal Requirement Indicator */}
        {!hasGoal && !isComingSoonGoal && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              Set a goal first to enable AI analysis
            </div>
          </div>
        )}
        
        {/* Assessment Requirement Indicator */}
        {hasGoal && !hasEnoughAssessments && !isComingSoonGoal && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              Need at least 2 assessments for AI analysis (currently have {totalAssessments})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisIndicator;
