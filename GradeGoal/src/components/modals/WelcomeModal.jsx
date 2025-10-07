// ========================================
// WELCOME MODAL COMPONENT
// ========================================
// Displays a welcome message and instructions for new users
// Clean design with minimal icons for better user experience

import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
function WelcomeModal({ isOpen, onClose, userName }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to GradeGoal!",
      content: `Hi ${userName || 'there'}! We're excited to help you track your academic progress. Let's walk through how to get started with GradeGoal step by step.`
    },
    {
      title: "Navigate to Courses",
      content: "Start by clicking the 'Courses' tab in the sidebar. This will show you all your courses. If you're new, you'll see an empty list ready for your first course."
    },
    {
      title: "Add Your First Course",
      content: "Click the 'Add Course' button to create a new course. You'll enter course details like name, code, credits, and target grade. You'll also set up assessment categories during this process - choose from templates or add custom categories like Assignments, Written Works, Seatworks, Laboratory, Exams, Quizzes, Projects, and more."
    },
    {
      title: "Add Assessments",
      content: "Click the 'Assessment' tab inside your course, then 'Add Assessment'. Set the maximum points, date when it will be taken, and assign it to a category. This creates individual tasks to track."
    },
    {
      title: "Enter Scores & Track Progress",
      content: "After adding assessments, you can enter your scores. GradeGoal will automatically calculate your current progress and show it in the dashboard. Monitor your progress toward your target grade!"
    },
    {
      title: "You're Ready to Succeed!",
      content: "That's it! You now know how to use GradeGoal effectively. Remember: Courses → Categories → Assessments → Scores → Progress tracking. Good luck with your studies!"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-md z-50 transition-opacity duration-200"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
              <div className="flex items-center mt-2">
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-sm opacity-90">
                  {currentStep + 1} of {steps.length}
                </span>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="min-h-[200px] flex items-center justify-center">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {steps[currentStep].content}
            </p>
          </div>

          {/* Step-specific content */}
          {currentStep === 1 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> The sidebar is your main navigation hub. You'll use it to switch between different sections of GradeGoal.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-800">
                <strong>Tip:</strong> The course creation form includes semester, year level, grading scale, GPA scale, course color, and category setup all in one place!
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-purple-800">
                <strong>Available Options:</strong> Use the 3-Category Template or add custom categories. You can also choose how to handle missing grades and set maximum points.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <p className="text-sm text-orange-800">
                <strong>Tip:</strong> Set realistic dates for your assessments. This helps GradeGoal track your progress timeline and upcoming deadlines.
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div className="mt-6 p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
              <p className="text-sm text-teal-800">
                <strong>Tip:</strong> The dashboard shows your overall progress across all courses. Check it regularly to stay on track with your goals!
              </p>
            </div>
          )}

          {currentStep === 6 && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={24} />
                <span className="font-semibold">Ready to start your academic journey!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeModal;
