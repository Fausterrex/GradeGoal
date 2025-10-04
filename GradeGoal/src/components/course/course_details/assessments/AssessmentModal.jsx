// ========================================
// ASSESSMENT MODAL COMPONENT
// ========================================
// Modal for adding and editing assessments

import React from "react";

function AssessmentModal({
  isOpen,
  editingGrade,
  newGrade,
  setNewGrade,
  categories,
  colorScheme,
  onSubmit,
  onCancel,
  activeSemesterTerm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-white/20">
        {/* Modal Header */}
        <div className={`${colorScheme.primary} px-6 py-4`}>
          <h3 className="text-xl font-bold text-white text-center">
            {editingGrade ? "Edit Assessment" : "Add New Assessment"}
          </h3>
        </div>

        {/* Modal Form */}
        <div className="p-6">
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              {/* Category Selection - Show dropdown only if no category is pre-selected */}
              {!newGrade.categoryId ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newGrade.categoryId}
                    onChange={(e) =>
                      setNewGrade({ ...newGrade, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories &&
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                /* Show pre-selected category as embedded field */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 font-medium">
                    {categories.find(cat => cat.id === newGrade.categoryId)?.name || 'Selected Category'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Category is embedded from the selected category section
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester Term
                </label>
                <select
                  value={newGrade.semesterTerm || activeSemesterTerm}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, semesterTerm: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                >
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL_TERM">Final Term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={newGrade.name}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Auto-generated based on category"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name will auto-generate based on category (e.g., "Quiz 1", "Assignment 2"), or customize as needed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Score
                </label>
                <input
                  type="number"
                  value={newGrade.maxScore}
                  onChange={(e) =>
                    setNewGrade({
                      ...newGrade,
                      maxScore: parseFloat(e.target.value) || "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  step="0.01"
                  min="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the maximum possible score for this assessment
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div>
                  <input
                    type="date"
                    value={newGrade.date}
                    onChange={(e) =>
                      setNewGrade({ ...newGrade, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  When this assessment is due
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={newGrade.note}
                  onChange={(e) =>
                    setNewGrade({ ...newGrade, note: e.target.value })
                  }
                  placeholder="Add any additional notes about this assessment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional notes or instructions for this assessment
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${colorScheme.primary} text-white rounded-md hover:opacity-90 transition-all duration-200`}
              >
                {editingGrade ? "Update Assessment" : "Add Assessment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssessmentModal;
