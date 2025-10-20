import React, { useState, useEffect, useMemo } from "react";
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Calendar,
  Star,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { 
  getAIAnalysis, 
  checkAIAnalysisExists,
  getAcademicGoalsByUserId,
  getUserProfile
} from "../../backend/api";
const AIRecommendations = ({ courses }) => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Priority order mapping
  const priorityOrder = {
    'HIGH': 1,
    'MEDIUM': 2,
    'LOW': 3
  };

  // Load AI recommendations from all courses
  const loadAIRecommendations = async () => {
    if (!currentUser) return;
    
    // If no courses, show empty state
    if (!courses.length) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const allRecommendations = [];
      
      // Get user profile to get userId
      const userProfile = await getUserProfile(currentUser.email);
      if (!userProfile) return;

      // Get all academic goals to understand course context
      const goals = await getAcademicGoalsByUserId(userProfile.userId);
      const goalsMap = {};
      goals.forEach(goal => {
        goalsMap[goal.courseId] = goal;
      });

      // Fetch AI analysis for each active course
      for (const course of courses) {
        if (course.isActive === false) continue;

        try {
          // Check if AI analysis exists for this course
          const existsResponse = await checkAIAnalysisExists(userProfile.userId, course.id || course.courseId);
          
          if (existsResponse.success && existsResponse.exists) {
            // Get the AI analysis
            const analysisResponse = await getAIAnalysis(userProfile.userId, course.id || course.courseId);
            
            if (analysisResponse.success && analysisResponse.hasAnalysis) {
              const analysis = analysisResponse.analysis;
              
              // Parse the analysis data
              let analysisData;
              try {
                analysisData = typeof analysis.analysisData === 'string' 
                  ? JSON.parse(analysis.analysisData) 
                  : analysis.analysisData;
              } catch (parseError) {
                console.warn(`Failed to parse analysis data for course ${course.id}:`, parseError);
                continue;
              }

              // Extract top priority recommendations
              if (analysisData.topPriorityRecommendations && Array.isArray(analysisData.topPriorityRecommendations)) {
                analysisData.topPriorityRecommendations.forEach((rec, index) => {
                  allRecommendations.push({
                    id: `rec-${course.id}-${index}`,
                    courseId: course.id || course.courseId,
                    courseName: course.name,
                    title: rec.title || `Recommendation ${index + 1}`,
                    description: rec.description || rec.content || 'AI-generated recommendation',
                    priority: rec.priority || 'MEDIUM',
                    category: rec.category || 'Course-Specific',
                    impact: rec.impact || 'Significant impact on academic performance',
                    actionButton: rec.actionButton || null,
                    createdAt: analysis.createdAt,
                    updatedAt: analysis.updatedAt,
                    confidence: analysis.aiConfidence || 0.85
                  });
                });
              }

              // Add focus indicators as recommendations if they need attention
              if (analysisData.focusIndicators) {
                Object.entries(analysisData.focusIndicators).forEach(([category, indicator]) => {
                  if (indicator.needsAttention && indicator.priority === 'HIGH') {
                    allRecommendations.push({
                      id: `focus-${course.id}-${category}`,
                      courseId: course.id || course.courseId,
                      courseName: course.name,
                      title: `Focus on ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                      description: indicator.reason || `This ${category} category needs immediate attention`,
                      priority: indicator.priority,
                      category: 'Course-Specific',
                      impact: `Improving ${category} performance will significantly impact your grade`,
                      actionButton: {
                        text: 'Review Materials',
                        action: 'REVIEW_MATERIALS',
                        enabled: true
                      },
                      createdAt: analysis.createdAt,
                      updatedAt: analysis.updatedAt,
                      confidence: analysis.aiConfidence || 0.85
                    });
                  }
                });
              }

              // Add empty categories as high priority recommendations
              if (analysisData.focusIndicators && analysisData.focusIndicators.emptyCategories) {
                analysisData.focusIndicators.emptyCategories.forEach((emptyCategory, index) => {
                  if (emptyCategory.needsAttention) {
                    allRecommendations.push({
                      id: `empty-${course.id}-${index}`,
                      courseId: course.id || course.courseId,
                      courseName: course.name,
                      title: `Add Assessments to ${emptyCategory.categoryName}`,
                      description: `This category represents ${emptyCategory.weight}% of your final grade but has no assessments. ${emptyCategory.recommendations ? emptyCategory.recommendations.join(' ') : 'Add assessments to complete your course structure.'}`,
                      priority: emptyCategory.priority || 'HIGH',
                      category: 'Empty Category',
                      impact: 'Will complete course structure and allow accurate grade calculation',
                      actionButton: {
                        text: 'Add Assessment',
                        action: 'ADD_ASSESSMENT',
                        enabled: true
                      },
                      createdAt: analysis.createdAt,
                      updatedAt: analysis.updatedAt,
                      confidence: analysis.aiConfidence || 0.85
                    });
                  }
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to load AI analysis for course ${course.id}:`, error);
        }
      }

      // Group recommendations by course and take top 2 per course
      const recommendationsByCourse = {};
      allRecommendations.forEach(rec => {
        if (!recommendationsByCourse[rec.courseId]) {
          recommendationsByCourse[rec.courseId] = [];
        }
        recommendationsByCourse[rec.courseId].push(rec);
      });

      // Sort each course's recommendations and take top 2
      const sortedRecommendations = [];
      Object.values(recommendationsByCourse).forEach(courseRecs => {
        const sortedCourseRecs = courseRecs
          .sort((a, b) => {
            // First sort by priority
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by update time (newer first)
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          })
          .slice(0, 2); // Take top 2 per course
        
        sortedRecommendations.push(...sortedCourseRecs);
      });

      setRecommendations(sortedRecommendations);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load recommendations on component mount and when courses change
  useEffect(() => {
    loadAIRecommendations();
  }, [currentUser, courses]);

  // Get priority icon and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { 
          icon: AlertTriangle, 
          color: 'text-red-600', 
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
      case 'MEDIUM':
        return { 
          icon: Target, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      case 'LOW':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      default:
        return { 
          icon: Lightbulb, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200'
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Course-Specific':
        return BookOpen;
      case 'Empty Category':
        return AlertTriangle;
      case 'General Academic':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  // Handle action button click
  const handleActionClick = (action, courseId, courseName) => {
    switch (action) {
      case 'ADD_ASSESSMENT':
        // Navigate to course details to add assessment
        window.location.href = `/course/${courseId}`;
        break;
      case 'REVIEW_MATERIALS':
        // Navigate to course details
        window.location.href = `/course/${courseId}`;
        break;
      case 'STUDY_SESSION':
        // Could open a study session modal or navigate to study tools
        console.log('Start study session for', courseName);
        break;
      default:
        console.log('Action clicked:', action, 'for course:', courseName);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            <p className="text-gray-600">
              Top {recommendations.length} most important actions to focus on
            </p>
          </div>
        </div>
        
        <button
          onClick={loadAIRecommendations}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No AI Recommendations Available
          </h3>
          <p className="text-gray-500">
            Generate AI analysis for your courses to get personalized recommendations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => {
            const PriorityIcon = getPriorityInfo(rec.priority).icon;
            const CategoryIcon = getCategoryIcon(rec.category);
            const priorityInfo = getPriorityInfo(rec.priority);
            
            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border-2 ${priorityInfo.borderColor} ${priorityInfo.bgColor} hover:shadow-md transition-all duration-200`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${priorityInfo.bgColor} border-2 ${priorityInfo.borderColor}`}>
                    <PriorityIcon className={`w-4 h-4 ${priorityInfo.color}`} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                    {rec.priority}
                  </span>
                </div>
                
                {/* Title */}
                <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {rec.title}
                </h4>
                
                {/* Course */}
                <div className="flex items-center space-x-1 text-base text-gray-500 mb-3">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="truncate">{rec.courseName}</span>
                </div>
                
                {/* Description */}
                <p className="text-base text-gray-700 mb-3 line-clamp-3 leading-relaxed">
                  {rec.description}
                </p>
                
                {/* Impact */}
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Impact:</span> {rec.impact}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {lastUpdated && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        )}
      </div>
    );
  };

export default AIRecommendations;
