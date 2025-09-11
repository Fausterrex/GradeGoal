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
          defaultIcon: (
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
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
          defaultIcon: (
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
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
          defaultIcon: (
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
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
          defaultIcon: (
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
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
          defaultIcon: (
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
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
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
