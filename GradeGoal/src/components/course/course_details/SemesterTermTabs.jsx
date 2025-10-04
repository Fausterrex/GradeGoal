// ========================================
// SEMESTER TERM TABS COMPONENT
// ========================================
// Component that displays Midterm and Final Term tabs

import React from "react";

function SemesterTermTabs({ 
  activeTerm, 
  onTermChange, 
  isMidtermCompleted, 
  colorScheme,
  setConfirmationModal
}) {
  const handleTermChange = (term) => {
    // Only allow switching to final term if midterm is completed
    if (term === 'FINAL_TERM' && !isMidtermCompleted) {
      return; // Don't allow switching to final term if midterm is not completed
    }
    onTermChange(term);
  };

  return (
    <div className="mb-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => handleTermChange('MIDTERM')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTerm === 'MIDTERM'
              ? `${colorScheme.primary} text-white shadow-sm`
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Midterm</span>
            {isMidtermCompleted && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                ✓ Done
              </span>
            )}
          </div>
        </button>
        
        <button
          onClick={() => handleTermChange('FINAL_TERM')}
          disabled={!isMidtermCompleted}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTerm === 'FINAL_TERM'
              ? `${colorScheme.primary} text-white shadow-sm`
              : !isMidtermCompleted
              ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Final Term</span>
            {!isMidtermCompleted && (
              <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full">
                Locked
              </span>
            )}
          </div>
        </button>
      </div>
      
      {/* Mark Midterm as Done Button */}
      {activeTerm === 'MIDTERM' && !isMidtermCompleted && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setConfirmationModal({
                isOpen: true,
                type: "confirm",
                title: "Mark Midterm as Done",
                message: "Are you sure you want to mark midterm as completed? This will unlock the Final Term tab.",
                confirmText: "Mark as Done",
                cancelText: "Cancel",
                showWarning: true,
                warningItems: [
                  "This action will unlock the Final Term tab",
                  "You won't be able to add more midterm assessments",
                  "Make sure all midterm assessments are completed"
                ],
                showTip: true,
                tipMessage: "You can still edit existing midterm assessments after marking as done.",
                onConfirm: () => {
                  // This will be handled by the parent component
                  if (window.markMidtermAsDone) {
                    window.markMidtermAsDone();
                  }
                  setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                },
                onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
              });
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-600 hover:border-green-700 cursor-pointer"
          >
            Mark Midterm as Done
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Click this when you've completed all midterm assessments
          </p>
        </div>
      )}
    </div>
  );
}

export default SemesterTermTabs;
