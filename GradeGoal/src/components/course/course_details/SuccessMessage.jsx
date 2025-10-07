// ========================================
// SUCCESS MESSAGE COMPONENT
// ========================================
// Displays success messages for various operations

import React from "react";
function SuccessMessage({ successMessage }) {
  if (!successMessage) return null;

  return (
    <div className="max-w-xl mx-auto px-6 py-4">
      <div className="w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✅</span>
          {successMessage}
        </div>
      </div>
    </div>
  );
}

export default SuccessMessage;
