import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGraduationCap, FaCheckCircle, FaArrowRight, FaTimes } from "react-icons/fa";

const SemesterTransitionModal = ({ 
  isOpen, 
  onClose, 
  onProceed, 
  onStay,
  progressionData,
  isLoading = false 
}) => {
  if (!isOpen || !progressionData) return null;

  const { fromSemester, toSemester, completedCourses, nextSemesterCourses } = progressionData;

  const getSemesterLabel = (semester) => {
    switch (semester) {
      case 'FIRST': return '1st Semester';
      case 'SECOND': return '2nd Semester';
      case 'THIRD': return '3rd Semester';
      default: return semester;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FaGraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Semester Completed! 🎉
                </h2>
                <p className="text-sm text-gray-600">
                  Ready for the next semester?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Progress Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">
                  {getSemesterLabel(fromSemester)} Completed
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {completedCourses} courses
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-4 my-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">
                    {getSemesterLabel(fromSemester).split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              
              <FaArrowRight className="w-4 h-4 text-gray-400" />
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {getSemesterLabel(toSemester).split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Next</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold text-blue-600">{nextSemesterCourses}</span> courses ready for {getSemesterLabel(toSemester)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onStay}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Stay in {getSemesterLabel(fromSemester)}
            </button>
            <button
              onClick={onProceed}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Transitioning...</span>
                </>
              ) : (
                <>
                  <span>Continue to {getSemesterLabel(toSemester)}</span>
                  <FaArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Info Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 You can always change your semester view later in settings
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SemesterTransitionModal;
