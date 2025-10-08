// ========================================
// SUCCESS MODAL COMPONENT
// ========================================
// Reusable success modal for displaying successful operations
// Features: Success message, auto-close, customizable content

import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

function SuccessModal({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully.",
  autoCloseDelay = 3000,
  showCloseButton = true,
  customIcon = null,
  customHeaderColor = "bg-green-600",
  customIconColor = "text-green-600",
  onAutoClose = null,
}) {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        if (onAutoClose) {
          onAutoClose();
        } else {
          onClose();
        }
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onAutoClose, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const icon = customIcon || (
    <CheckCircle className={`w-16 h-16 ${customIconColor} mx-auto mb-4`} />
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-lg w-96 max-w-md mx-4 z-10">
        {/* Header */}
        <div className={`w-full rounded-t-2xl h-20 ${customHeaderColor} flex items-center justify-center relative`}>
          <p className="text-white text-2xl font-bold">
            {title}
          </p>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Success Icon */}
          {icon}

          {/* Success Message */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Auto-close indicator */}
          {autoCloseDelay > 0 && (
            <div className="text-xs text-gray-500">
              This dialog will close automatically in {Math.ceil(autoCloseDelay / 1000)} seconds
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;

