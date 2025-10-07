import { useState } from "react";
const RightSidebar = ({ dashboardData, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="sticky top-4 space-y-6">
        {/* Sign Out Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <button
            onClick={handleLogoutClick}
            className="w-full text-center p-4 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-300"
          >
            <div className="text-lg font-medium">🚪 Sign out</div>
            <div className="text-sm text-gray-500 mt-1">Click to sign out from admin account</div>
          </button>
        </div>

        {/* History/Records */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-2">History/Records</h3>
          <div className="max-h-64 overflow-y-auto space-y-2.5">
            {dashboardData.historyRecords.map((record, index) => (
              <div
                key={record.record_id || `record-${index}`}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
              >
                <div className="text-gray-800 font-medium">{record.type}</div>
                <div className="text-gray-500 text-sm">{record.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Sign Out</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to sign out?</p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;