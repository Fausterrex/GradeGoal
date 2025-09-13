// ========================================
// COURSE DETAILS ADD SCORE MODAL COMPONENT
// ========================================
// Modal for adding scores to assessments

import React from "react";

function CourseDetailsAddScoreModal({
  isOpen,
  selectedGrade,
  colorScheme,
  scoreExtraCredit,
  setScoreExtraCredit,
  scoreExtraCreditPoints,
  setScoreExtraCreditPoints,
  onSubmit,
  onCancel
}) {
  if (!isOpen || !selectedGrade) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-white/20">
        {/* Modal Header */}
        <div className={`${colorScheme.primary} px-6 py-4`}>
          <h3 className="text-xl font-bold text-white text-center">
            Add Your Score
          </h3>
        </div>
        
        {/* Modal Form */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            <strong>{selectedGrade.name}</strong>
            <br />
            Maximum Score: {selectedGrade.maxScore}
          </p>

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Obtained
                </label>
                <input
                  type="number"
                  name="score"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  step="0.01"
                  min="0"
                  max={selectedGrade.maxScore}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="scoreExtraCredit"
                  checked={scoreExtraCredit}
                  onChange={(e) => {
                    setScoreExtraCredit(e.target.checked);
                    if (!e.target.checked) {
                      setScoreExtraCreditPoints("");
                    }
                  }}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="scoreExtraCredit"
                  className="text-sm text-gray-700"
                >
                  Extra Credit
                </label>
              </div>
              <p className="text-xs text-gray-500 -mt-2 mb-2">
                Check this if this score includes extra credit points
              </p>

              {scoreExtraCredit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Credit Points
                  </label>
                  <input
                    type="number"
                    value={scoreExtraCreditPoints}
                    onChange={(e) => setScoreExtraCreditPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    step="0.01"
                    min="0"
                    placeholder="Enter extra credit points"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the number of extra credit points to add to your score
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Score
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsAddScoreModal;
