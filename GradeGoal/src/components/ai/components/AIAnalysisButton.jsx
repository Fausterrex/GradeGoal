// ========================================
// AI ANALYSIS BUTTON COMPONENT
// ========================================
// Button to trigger AI analysis for a specific course goal

import React, { useState, useEffect } from 'react';
import { Brain, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AIAnalysisButton = ({ 
  course, 
  goal, 
  grades, 
  categories, 
  onAnalysisComplete,
  disabled = false 
}) => {
  const { currentUser } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);
  const [checkingAnalysis, setCheckingAnalysis] = useState(true);

  // Check if AI analysis already exists for this course
  useEffect(() => {
    const checkExistingAnalysis = async () => {
      if (!currentUser?.uid || !course?.id) {
        setCheckingAnalysis(false);
        return;
      }

      try {
        // Import the check function dynamically
        const { checkAIAnalysisExists } = await import('../services/geminiService');
        
        // Get user profile to get database user ID
        const { getUserProfile } = await import('../../../backend/api');
        const userProfile = await getUserProfile(currentUser.email);
        
        if (userProfile?.userId && course?.id) {
          const exists = await checkAIAnalysisExists(userProfile.userId, course.id);
          setHasExistingAnalysis(exists);
        } else {
          console.warn('Unable to check AI analysis - missing user profile or course ID:', {
            userProfileExists: !!userProfile,
            courseIdExists: !!course?.id,
            userId: userProfile?.userId
          });
          setHasExistingAnalysis(false);
        }
      } catch (error) {
        console.error('Error checking existing AI analysis:', error);
        // Don't show the error to user, just assume no existing analysis
        setHasExistingAnalysis(false);
      } finally {
        setCheckingAnalysis(false);
      }
    };

    checkExistingAnalysis();
  }, [currentUser?.uid, course?.id]);

  const handleAnalysis = async () => {
    if (isAnalyzing || disabled) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Import the Gemini service dynamically to avoid circular dependencies
      const { generateAIRecommendations, saveAIRecommendations } = await import('../services/geminiService');
      
      // Prepare course data for AI analysis
      const courseData = {
        course,
        grades,
        categories,
        currentGPA: course.courseGpa || 0,
        progress: course.progress || 0
      };

      // Debug: Log course-specific data being sent to AI
      console.log('🤖 AI Analysis - Course-Specific Data:', {
        courseName: course?.courseName,
        courseId: course?.id,
        gradesCount: Array.isArray(grades) ? grades.length : Object.keys(grades).length,
        categoriesCount: categories?.length || 0,
        currentGPA: course.courseGpa,
        progress: course.progress,
        isReanalysis: hasExistingAnalysis
      });

      // Prepare goal data
      const goalData = {
        targetValue: goal.targetValue,
        goalType: goal.goalType,
        priority: goal.priority || 'MEDIUM'
      };

      // Generate AI recommendations
      const recommendations = await generateAIRecommendations(courseData, goalData, goal.priority);
      
      // Save to database
      const savedRecommendations = await saveAIRecommendations(recommendations);
      
      // Update the existing analysis status
      setHasExistingAnalysis(true);
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(savedRecommendations);
      }

    } catch (error) {
      console.error('AI Analysis failed:', error);
      setError('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getButtonText = () => {
    if (checkingAnalysis) return 'Checking...';
    if (isAnalyzing) return hasExistingAnalysis ? 'Re-analyzing...' : 'Analyzing...';
    if (error) return 'Retry Analysis';
    return hasExistingAnalysis ? 'Re-analyze' : 'Get AI Analysis';
  };

  const getButtonIcon = () => {
    if (checkingAnalysis) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isAnalyzing) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <Brain className="w-4 h-4" />;
    return hasExistingAnalysis ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />;
  };

  const getButtonStyle = () => {
    if (checkingAnalysis || isAnalyzing) {
      return 'bg-purple-100 text-purple-700 border-purple-200 cursor-not-allowed';
    }
    if (error) {
      return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
    }
    if (hasExistingAnalysis) {
      return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl';
    }
    return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl';
  };

  return (
    <div className="space-y-2 text-center">
      <div className="flex justify-center">
        <button
          onClick={handleAnalysis}
          disabled={disabled || isAnalyzing || checkingAnalysis}
          className={`
            inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 transform hover:scale-105 active:scale-95
            border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            ${getButtonStyle()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 text-center">
          {error}
        </div>
      )}

      {!error && !isAnalyzing && !checkingAnalysis && (
        <div className="text-xs text-gray-500 text-center mx-auto max-w-xs">
          {hasExistingAnalysis 
            ? "Update your AI analysis with latest course data and performance insights."
            : "Get personalized AI insights for your academic performance and goal achievement."
          }
        </div>
      )}

      {checkingAnalysis && (
        <div className="text-xs text-blue-600 text-center mx-auto max-w-xs">
          Checking for existing AI analysis...
        </div>
      )}

      {isAnalyzing && (
        <div className="text-xs text-purple-600 text-center mx-auto max-w-xs">
          {hasExistingAnalysis
            ? "AI is updating your analysis with latest course data..."
            : "AI is analyzing your course data and generating personalized recommendations..."
          }
        </div>
      )}
    </div>
  );
};

export default AIAnalysisButton;
