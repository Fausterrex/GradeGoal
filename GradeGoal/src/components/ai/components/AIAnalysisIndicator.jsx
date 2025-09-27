// ========================================
// AI ANALYSIS INDICATOR COMPONENT
// ========================================
// Component that shows AI analysis status and provides analysis/re-analysis buttons
// Detects changes in assessments and category weights to determine if re-analysis is needed

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { generateAIRecommendations } from '../services/geminiService';
import { checkAIAnalysisExists } from '../../../backend/api';
import { setAIAnalysisData } from '../services/aiAnalysisService';
import { 
  FaRobot, 
  FaSync, 
  FaSpinner, 
  FaExclamationTriangle,
  FaBrain
} from 'react-icons/fa';

const AIAnalysisIndicator = ({ 
  course, 
  grades, 
  categories, 
  targetGrade, 
  currentGrade,
  onAnalysisComplete,
  courses = [] // Add courses prop for cumulative GPA semester counting
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
      currentGrade: currentGrade || 0
    });
  }, [course, grades, categories, targetGrade, currentGrade]);

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
        console.log('🔍 [AIAnalysisIndicator] Analysis exists check:', {
          userId: userProfile.userId,
          courseId: course.id,
          existsResponse,
          hasAnalysis: exists
        });
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
    if (!currentUser || !course || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Get user profile to get database user ID
      const { getUserProfile } = await import('../../../backend/api');
      const userProfile = await getUserProfile(currentUser.email);
      
      if (!userProfile?.userId) {
        console.error('No user profile found for email:', currentUser.email);
        return;
      }
      
      // Prepare course data for AI analysis
      const courseData = {
        course: {
          ...course,
          userId: userProfile.userId // Use database user ID
        },
        grades: grades || [],
        categories: categories || [],
        currentGPA: currentGrade || 0,
        progress: calculateProgress(grades, categories)
      };
      
      const goalData = {
        targetValue: targetGrade?.targetValue || 100,
        goalType: targetGrade?.goalType || 'COURSE_GRADE'
      };
      
      console.log('🤖 Starting AI analysis for course:', course.courseName);
      
      // Clear cache to ensure fresh analysis with updated logic
      const { clearAIAnalysisCache } = await import('../services/geminiService');
      clearAIAnalysisCache(userProfile.userId, course.id);
      
      // Generate AI recommendations
      const analysisResult = await generateAIRecommendations(
        courseData, 
        goalData, 
        'HIGH'
      );
      
      if (analysisResult) {
        // Store the analysis data
        setAIAnalysisData(analysisResult);
        
        // Store the data hash to track changes
        storeAnalysisHash(course.id);
        
        // Update state
        setHasExistingAnalysis(true);
        // Keep showing the indicator (like Academic Goals cards)
        
        // Notify parent component
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisResult);
        }
        
        console.log('✅ AI analysis completed successfully');
      }
    } catch (error) {
      console.error('❌ Error during AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
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
  
  if (targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA') {
    // For cumulative GPA, count unique semesters with course data
    // Get all courses that have assessments
    const coursesWithAssessments = Object.keys(grades).filter(categoryId => {
      const categoryGrades = grades[categoryId] || [];
      return categoryGrades.some(grade => 
        grade.score !== null && grade.score !== undefined && grade.score > 0
      );
    });
    
    // Find unique semesters from courses with assessments
    const uniqueSemesters = new Set();
    coursesWithAssessments.forEach(categoryId => {
      // Find the course that corresponds to this category
      // For cumulative GPA, we need to get course data from the courses prop
      // The categoryId corresponds to courseId in the courses array
      const course = courses.find(c => c.id === parseInt(categoryId) || c.courseId === parseInt(categoryId));
      if (course && course.semester) {
        uniqueSemesters.add(course.semester);
      }
    });
    
    totalAssessments = uniqueSemesters.size;
    hasEnoughAssessments = uniqueSemesters.size >= 3; // Need at least 3 semesters with data
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
                   : hasExistingAnalysis 
                     ? 'AI Analysis Available' 
                     : 'AI Analysis Available'
                 }
               </h3>
               <p className="text-sm text-gray-600 mt-1">
                 {!hasGoal
                   ? 'Set a goal first to enable AI analysis.'
                   : !hasEnoughAssessments 
                     ? targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA'
                       ? `You need at least 3 semesters with course data for cumulative GPA analysis. Currently have ${totalAssessments} semester${totalAssessments !== 1 ? 's' : ''} with data.`
                       : `You need at least 2 assessments to analyze student performance. Currently have ${totalAssessments} assessment${totalAssessments !== 1 ? 's' : ''}.`
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
               disabled={isAnalyzing || !hasEnoughAssessments || !hasGoal}
               className={`
                 inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                 ${isAnalyzing || !hasEnoughAssessments || !hasGoal
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                   : hasExistingAnalysis
                     ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                     : 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
                 }
               `}
             >
               {isAnalyzing ? (
                 <>
                   <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                   Analyzing...
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
        
        {/* Goal Requirement Indicator */}
        {!hasGoal && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              Set a goal first to enable AI analysis
            </div>
          </div>
        )}
        
        {/* Assessment Requirement Indicator */}
        {hasGoal && !hasEnoughAssessments && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              {targetGrade && typeof targetGrade === 'object' && targetGrade.goalType === 'CUMMULATIVE_GPA' 
                ? `Need at least 3 semesters with course data for AI analysis (currently have ${totalAssessments})`
                : `Need at least 2 assessments for AI analysis (currently have ${totalAssessments})`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisIndicator;
