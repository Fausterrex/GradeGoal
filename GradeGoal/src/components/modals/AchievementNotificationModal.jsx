// ========================================
// ACHIEVEMENT NOTIFICATION MODAL COMPONENT
// ========================================
// Simple achievement modal with blurred backdrop and minimal animation

import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
const AchievementNotificationModal = ({ 
  isOpen, 
  onClose, 
  achievement, 
  isLevelUp = false,
  newLevel = null,
  levelUpRewards = null 
}) => {

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen, onClose]);

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
        <div className="relative max-w-sm w-full bg-white rounded-lg shadow-lg transform transition-all duration-200 scale-100">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {isLevelUp ? (
              <>
                {/* Level Up */}
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Level Up!
                </h2>
                <p className="text-gray-600 mb-4">
                  Congratulations! You've reached Level {newLevel}!
                </p>
                {levelUpRewards && levelUpRewards.pointsEarned && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      🎯 +{levelUpRewards.pointsEarned} Points Earned
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Achievement */}
                <div className="text-4xl mb-3">🏆</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Achievement Unlocked!
                </h2>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {achievement?.achievementName}
                </h3>
                <p className="text-gray-600 mb-4">
                  {achievement?.description}
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    🎯 +{achievement?.pointsValue || 0} Points
                  </p>
                </div>
              </>
            )}

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Great!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementNotificationModal;
