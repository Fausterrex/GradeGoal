import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GradeService from '../services/gradeService';
import { 
  getGoalsByUidAndCourseId, 
  createGoal, 
  updateGoal, 
  deleteGoal 
} from '../backend/api';

function GoalSetting({ course, grades, onGoalUpdate }) {
  const { currentUser } = useAuth();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState({
    targetCGPA: '',
    targetGrade: '',
    studyHours: '',
    notes: ''
  });
  const [analysis, setAnalysis] = useState(null);

  // Load goals from database
  useEffect(() => {
    if (course && currentUser) {
      loadGoals();
    }
  }, [course, currentUser]);

  // Load goals from database
  const loadGoals = async () => {
    try {
      const goalsData = await getGoalsByUidAndCourseId(currentUser.uid, course.id);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!goal.targetGrade.trim()) {
      alert('Please enter a target grade');
      return;
    }

    // Analyze goal feasibility
    const feasibility = GradeService.analyzeGoalFeasibility(course, goal.targetGrade, grades);
    setAnalysis(feasibility);
    
    if (feasibility.success) {
      try {
        // Save goal to database
        const goalData = {
          uid: currentUser.uid,
          courseId: course.id,
          name: `Target Grade: ${goal.targetGrade}`,
          description: goal.notes || `Study ${goal.studyHours || 'regular'} hours per week to achieve ${goal.targetGrade}`,
          targetGrade: parseFloat(goal.targetGrade),
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          status: 'active'
        };

        await createGoal(goalData);
        
        // Reload goals from database
        await loadGoals();
        
        if (onGoalUpdate) onGoalUpdate(goals);
        
        // Reset form
        setGoal({
          targetCGPA: '',
          targetGrade: '',
          studyHours: '',
          notes: ''
        });
      } catch (error) {
        console.error('Failed to save goal:', error);
        alert('Failed to save goal. Please try again.');
      }
    }
  };

  const getFeasibilityColor = (feasibility) => {
    switch (feasibility) {
      case 'exceeded': return 'text-green-600';
      case 'achievable': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'challenging': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getFeasibilityIcon = (feasibility) => {
    switch (feasibility) {
      case 'exceeded': return '🎉';
      case 'achievable': return '✅';
      case 'moderate': return '⚠️';
      case 'challenging': return '🔥';
      default: return '❓';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Goal Setting for {course.name}</h2>
        <button
          onClick={() => setShowGoalForm(true)}
          className="bg-[#3B389f] text-white px-4 py-2 rounded-lg hover:bg-[#2d2a7a] transition-colors"
        >
          Set New Goal
        </button>
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Set Academic Goal</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Grade
                  </label>
                  <input
                    type="text"
                    value={goal.targetGrade}
                    onChange={(e) => setGoal({...goal, targetGrade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    placeholder={`e.g., ${course.gradingScale === 'percentage' ? '90%' : 
                                   course.gradingScale === 'gpa' ? '3.5' : '85/100'}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter target in {course.gradingScale} format
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Hours Available (per week)
                  </label>
                  <input
                    type="number"
                    value={goal.studyHours}
                    onChange={(e) => setGoal({...goal, studyHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    placeholder="e.g., 10"
                    min="1"
                    max="40"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={goal.notes}
                    onChange={(e) => setGoal({...goal, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    rows="3"
                    placeholder="Any specific strategies or notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalForm(false);
                    setAnalysis(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B389f] text-white rounded-md hover:bg-[#2d2a7a]"
                >
                  Analyze Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Analysis Results */}
      {analysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Goal Analysis Results</h3>
              <button
                onClick={() => setAnalysis(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            {analysis.success ? (
              <div className="space-y-4">
                <div className={`text-center p-4 rounded-lg border-2 ${
                  analysis.feasibility === 'exceeded' ? 'border-green-200 bg-green-50' :
                  analysis.feasibility === 'achievable' ? 'border-blue-200 bg-blue-50' :
                  analysis.feasibility === 'moderate' ? 'border-yellow-200 bg-yellow-50' :
                  'border-orange-200 bg-orange-50'
                }`}>
                  <div className="text-4xl mb-2">{getFeasibilityIcon(analysis.feasibility)}</div>
                  <h4 className={`text-lg font-semibold ${getFeasibilityColor(analysis.feasibility)}`}>
                    {analysis.feasibility.charAt(0).toUpperCase() + analysis.feasibility.slice(1)}
                  </h4>
                  <p className="text-gray-700 mt-2">{analysis.message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">Current Performance</h5>
                    <p className="text-2xl font-bold text-gray-600">{analysis.currentGrade}%</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">Target Grade</h5>
                    <p className="text-2xl font-bold text-[#3B389f]">{analysis.targetGrade}%</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Gap Analysis</h5>
                  <p className="text-lg text-gray-700">
                    You need to improve by <span className="font-semibold text-[#3B389f]">{analysis.difference}%</span> to reach your target.
                  </p>
                </div>
                
                {analysis.recommendations.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Recommendations</h5>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-blue-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setAnalysis(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowGoalForm(false);
                      setAnalysis(null);
                    }}
                    className="px-4 py-2 bg-[#3B389f] text-white rounded-md hover:bg-[#2d2a7a]"
                  >
                    Set Another Goal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="text-red-500 text-4xl mb-4">❌</div>
                <h4 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h4>
                <p className="text-gray-700 mb-4">{analysis.message}</p>
                <button
                  onClick={() => setAnalysis(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Goals */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Goals</h3>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No goals set yet. Set your first goal to get started!
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {goal.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Target Grade: {goal.targetGrade}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Description: {goal.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Target Date: {goal.targetDate}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Set on: {new Date(goal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      goal.status === 'completed' ? 'text-green-600' : 
                      goal.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GoalSetting;
