// ========================================
// AI PREDICTION RATING MODAL COMPONENT
// ========================================
// Modal for rating AI predictions when completing a course
// Required rating (1-10) before course completion

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaRobot, FaCheckCircle, FaTimes } from "react-icons/fa";

const AIPredictionRatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  courseName,
  isLoading = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please rate the AI predictions before completing the course.");
      return;
    }
    onSubmit(rating);
  };

  const handleClose = () => {
    if (rating === 0) {
      alert("Rating is required to complete the course.");
      return;
    }
    onClose();
  };

  const getRatingDescription = (value) => {
    const descriptions = {
      1: "Not helpful at all",
      2: "Slightly helpful", 
      3: "Somewhat helpful",
      4: "Moderately helpful",
      5: "Fairly helpful",
      6: "Quite helpful",
      7: "Very helpful",
      8: "Extremely helpful",
      9: "Outstanding",
      10: "Perfect"
    };
    return descriptions[value] || "";
  };

  const getRatingColor = (value) => {
    if (value <= 3) return "text-red-500";
    if (value <= 6) return "text-yellow-500";
    if (value <= 8) return "text-blue-500";
    return "text-green-500";
  };

  if (!isOpen) return null;

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
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaRobot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Rate AI Predictions
                </h2>
                <p className="text-sm text-gray-600">
                  Course: {courseName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Rating Question */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              How helpful were the AI predictions and recommendations in achieving your goal?
            </p>
            
            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    rating >= value || hoveredRating >= value
                      ? "bg-yellow-100 text-yellow-500"
                      : "bg-gray-100 text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <FaStar className="w-6 h-6" />
                </button>
              ))}
            </div>

            {/* Rating Description */}
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className={`text-lg font-semibold ${getRatingColor(rating)}`}>
                  {rating}/10 - {getRatingDescription(rating)}
                </p>
              </motion.div>
            )}
          </div>

          {/* Rating Scale Guide */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Rating Guide:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">●</span>
                <span>1-3: Not helpful</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">●</span>
                <span>4-6: Somewhat helpful</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">●</span>
                <span>7-8: Very helpful</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">●</span>
                <span>9-10: Extremely helpful</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                rating === 0 || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  <span>Complete Course</span>
                </>
              )}
            </button>
          </div>

          {/* Required Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ⚠️ Rating is required to complete the course
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIPredictionRatingModal;
