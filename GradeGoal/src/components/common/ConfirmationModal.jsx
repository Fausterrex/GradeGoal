// ========================================
// CONFIRMATION MODAL COMPONENT
// ========================================
// Reusable confirmation modal for various actions throughout the system
// Supports different types: edit, delete, archive, warning, info, etc.

import React from "react";

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type = "edit", // edit, delete, archive, warning, info, custom
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showWarning = false,
  warningItems = [],
  showTip = false,
  tipMessage = "",
  customIcon = null,
  customHeaderColor = "bg-blue-600",
  customConfirmColor = "bg-blue-600",
  customConfirmHoverColor = "hover:bg-blue-700",
  isLoading = false,
  disabled = false,
}) {
  if (!isOpen) return null;

  // Default configurations for different modal types
  const getModalConfig = () => {
    switch (type) {
      case "delete":
        return {
          headerColor: "bg-red-600",
          confirmColor: "bg-red-600",
          confirmHoverColor: "hover:bg-red-700",
          confirmText: confirmText || "Delete Permanently",
          cancelText: cancelText || "Cancel",
          defaultIcon: <span className="text-red-600 text-lg">⚠️</span>,
          warningBgColor: "bg-red-50",
          warningBorderColor: "border-red-200",
          warningTextColor: "text-red-800",
          warningItemColor: "text-red-700",
        };
      case "archive":
        return {
          headerColor: "bg-orange-600",
          confirmColor: "bg-orange-600",
          confirmHoverColor: "hover:bg-orange-700",
          confirmText: confirmText || "Archive",
          cancelText: cancelText || "Cancel",
          defaultIcon: <span className="text-orange-600 text-lg">ℹ️</span>,
          warningBgColor: "bg-orange-50",
          warningBorderColor: "border-orange-200",
          warningTextColor: "text-orange-800",
          warningItemColor: "text-orange-700",
        };
      case "warning":
        return {
          headerColor: "bg-amber-600",
          confirmColor: "bg-amber-600",
          confirmHoverColor: "hover:bg-amber-700",
          confirmText: confirmText || "Continue Anyway",
          cancelText: cancelText || "Cancel",
          defaultIcon: <span className="text-amber-600 text-lg">⚠️</span>,
          warningBgColor: "bg-amber-50",
          warningBorderColor: "border-amber-200",
          warningTextColor: "text-amber-800",
          warningItemColor: "text-amber-700",
        };
      case "info":
        return {
          headerColor: "bg-blue-600",
          confirmColor: "bg-blue-600",
          confirmHoverColor: "hover:bg-blue-700",
          confirmText: confirmText || "OK",
          cancelText: cancelText || "Cancel",
          defaultIcon: <span className="text-blue-600 text-lg">ℹ️</span>,
          warningBgColor: "bg-blue-50",
          warningBorderColor: "border-blue-200",
          warningTextColor: "text-blue-800",
          warningItemColor: "text-blue-700",
        };
      default: // edit
        return {
          headerColor: "bg-green-600",
          confirmColor: "bg-green-600",
          confirmHoverColor: "hover:bg-green-700",
          confirmText: confirmText || "Confirm",
          cancelText: cancelText || "Cancel",
          defaultIcon: <span className="text-green-600 text-lg">✅</span>,
          warningBgColor: "bg-green-50",
          warningBorderColor: "border-green-200",
          warningTextColor: "text-green-800",
          warningItemColor: "text-green-700",
        };
    }
  };

  const config = getModalConfig();
  const headerColor = customHeaderColor || config.headerColor;
  const confirmColor = customConfirmColor || config.confirmColor;
  const confirmHoverColor = customConfirmHoverColor || config.confirmHoverColor;
  const icon = customIcon || config.defaultIcon;
  
  // Get border color for confirm button
  const getBorderColor = (bgColor) => {
    return bgColor.replace('bg-', 'border-');
  };

  // Get explicit button classes for each type
  const getButtonClasses = () => {
    const baseClasses = "flex-1 py-2 text-sm font-bold rounded-xl transition";
    const disabledClasses = "bg-gray-400 text-gray-200 cursor-not-allowed";
    
    if (disabled || isLoading) {
      return `${baseClasses} ${disabledClasses}`;
    }

    switch (type) {
      case "delete":
        return `${baseClasses} bg-red-600 border-2 border-red-600 text-white hover:bg-red-700`;
      case "archive":
        return `${baseClasses} bg-orange-600 border-2 border-orange-600 text-white hover:bg-orange-700`;
      case "warning":
        return `${baseClasses} bg-amber-600 border-2 border-amber-600 text-white hover:bg-amber-700`;
      case "info":
        return `${baseClasses} bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700`;
      default: // edit
        return `${baseClasses} bg-green-600 border-2 border-green-600 text-white hover:bg-green-700`;
    }
  };

  // Get explicit header classes for each type
  const getHeaderClasses = () => {
    switch (type) {
      case "delete":
        return "w-full rounded-t-2xl h-20 bg-red-600 flex items-center justify-center";
      case "archive":
        return "w-full rounded-t-2xl h-20 bg-orange-600 flex items-center justify-center";
      case "warning":
        return "w-full rounded-t-2xl h-20 bg-amber-600 flex items-center justify-center";
      case "info":
        return "w-full rounded-t-2xl h-20 bg-blue-600 flex items-center justify-center";
      default: // edit
        return "w-full rounded-t-2xl h-20 bg-green-600 flex items-center justify-center";
    }
  };



  const handleConfirm = () => {
    if (!disabled && !isLoading && onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!disabled && !isLoading && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 shadow">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-lg w-96 max-w-md mx-4 z-10">
        {/* Header */}
        <div className={getHeaderClasses()}>
          <p className="text-white text-2xl font-bold">
            {title}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Message */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Warning Section */}
          {showWarning && warningItems.length > 0 && (
            <div className={`${config.warningBgColor} border ${config.warningBorderColor} rounded-lg p-4 mb-4`}>
              <div className="flex items-start gap-3">
                {icon}
                <div>
                  <p className={`text-sm font-medium ${config.warningTextColor} mb-1`}>
                    {type === "delete" ? "⚠️ WARNING - This will permanently delete:" :
                     type === "archive" ? "What happens when you archive:" :
                     type === "warning" ? "Impact on existing data:" :
                     "Important information:"}
                  </p>
                  <ul className={`text-xs ${config.warningItemColor} space-y-1`}>
                    {warningItems.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tip Section */}
          {showTip && tipMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> {tipMessage}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handleConfirm}
              disabled={disabled || isLoading}
              className={getButtonClasses()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-lg">⟳</span>
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>

            <button
              onClick={handleClose}
              disabled={disabled || isLoading}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition ${
                disabled || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
