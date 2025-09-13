// ========================================
// GOAL HEADER COMPONENT
// ========================================
// This component displays the header section with title and add goal button

import React from "react";
import { FaPlus, FaSync } from "react-icons/fa";

const GoalHeader = ({ onAddGoal, onRefresh, isCompact = false }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className={`font-bold text-gray-800 ${isCompact ? 'text-lg' : 'text-2xl'}`}>
        Academic Goals
      </h2>
      {!isCompact && (
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
              title="Refresh Goals Data"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          )}
          <button
            onClick={onAddGoal}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalHeader;
