import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";
import RightSidebar from "./RightSidebar";
import EditProfileModal from "./EditProfileModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { 
  getAdminDashboardData, 
  updateUserProfileAdmin, 
  updateUserAccountStatus,
  notifyAccountStatusChange 
} from "../../backend/api";

function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAccountStatusModal, setShowAccountStatusModal] = useState(false);
  const [pendingAccountChange, setPendingAccountChange] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Dashboard data with connected arrays
  const [dashboardData, setDashboardData] = useState({
    overall: { students: 0, courses: 0, completions: '0%' },
    recentActivity: [],
    historyRecords: [],
    students: {},
    courses: {}
  });

  // Add this function to handle profile updates
  const handleSaveProfileChanges = async (updatedData, studentId) => {
    try {
      if (studentId) {
        // Update student profile in database
        await updateUserProfileAdmin(studentId, updatedData);
        
        // Update local state
        setDashboardData(prev => ({
          ...prev,
          students: {
            ...prev.students,
            [studentId]: {
              ...prev.students[studentId],
              name: updatedData.name,
              email: updatedData.email,
              joinDate: updatedData.joinDate,
              lastLogin: updatedData.lastLogin
            }
          }
        }));
        
        alert('Student profile updated successfully!');
      } else {
        // Update admin profile (you can add admin state if needed)
        console.log('Admin profile updated:', updatedData);
        alert(`Admin profile updated to: ${updatedData.firstName} ${updatedData.lastName}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle account freeze/unfreeze - show confirmation modal first
  const handleAccountStatusChange = (userId, isActive) => {
    const student = dashboardData.students[userId];
    setPendingAccountChange({ userId, isActive, studentName: student?.name || 'Unknown User' });
    setShowAccountStatusModal(true);
  };

  // Confirm account status change
  const confirmAccountStatusChange = async () => {
    if (!pendingAccountChange) return;

    const { userId, isActive } = pendingAccountChange;
    
    try {
      await updateUserAccountStatus(userId, isActive);
      
      // Update local state
      setDashboardData(prev => ({
        ...prev,
        students: {
          ...prev.students,
          [userId]: {
            ...prev.students[userId],
            isActive: isActive
          }
        }
      }));
      
      const status = isActive ? 'unfrozen' : 'frozen';
      
      // Try to notify user about status change (optional)
      try {
        await notifyAccountStatusChange(userId, !isActive);
        setSuccessMessage(`Account ${status} successfully! User has been notified.`);
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
        setSuccessMessage(`Account ${status} successfully! (Notification could not be sent)`);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Failed to update account status. Please try again.');
    } finally {
      setShowAccountStatusModal(false);
      setPendingAccountChange(null);
    }
  };

  // Cancel account status change
  const cancelAccountStatusChange = () => {
    setShowAccountStatusModal(false);
    setPendingAccountChange(null);
  };

  // Close success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchToSignup = () => navigate('/signup');
  const switchToLogin = () => navigate('/login');

  // Toggle functions
  const toggleStudent = (studentId) => {
    setActiveStudent(activeStudent === studentId ? null : studentId);
  };

  const toggleCourse = (courseId) => {
    setActiveCourse(activeCourse === courseId ? null : courseId);
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveStudent(null);
    setActiveCourse(null);
    setExpandedSubjects({});
  };

  // Edit profile handlers
  const handleEditProfile = (student = null) => {
    setEditingStudent(student);
    setShowEditProfile(true);
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
    setEditingStudent(null);
  };

  // Initialize data from database
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
        alert('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getAdminDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#493f82]">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // Render main dashboard
  return (
    <div className="min-h-screen flex flex-col p-4 bg-[#493f82]">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 container mx-auto">
        <LeftSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
        />
        
        <MainContent
          activeSection={activeSection}
          dashboardData={dashboardData}
          activeStudent={activeStudent}
          activeCourse={activeCourse}
          expandedSubjects={expandedSubjects}
          onToggleStudent={toggleStudent}
          onToggleCourse={toggleCourse}
          onToggleSubject={toggleSubject}
          onEditProfile={handleEditProfile}
          onAccountStatusChange={handleAccountStatusChange}
        />
        
        <RightSidebar
          dashboardData={dashboardData}
          onLogout={handleLogout} 
        />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={closeEditProfile}
        studentData={editingStudent}
        isAdmin={!editingStudent} // If no student provided, it's admin profile
        onSaveChanges={handleSaveProfileChanges}
      />

      {/* Account Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAccountStatusModal}
        onClose={cancelAccountStatusChange}
        onConfirm={confirmAccountStatusChange}
        type={pendingAccountChange?.isActive ? "complete" : "warning"}
        title={pendingAccountChange?.isActive ? "Unfreeze Account" : "Freeze Account"}
        message={`Are you sure you want to ${pendingAccountChange?.isActive ? 'unfreeze' : 'freeze'} the account for ${pendingAccountChange?.studentName || 'this user'}?`}
        confirmText={pendingAccountChange?.isActive ? "Unfreeze Account" : "Freeze Account"}
        cancelText="Cancel"
        showWarning={true}
        warningItems={[
          pendingAccountChange?.isActive 
            ? "The user will be able to log in normally"
            : "The user will not be able to log in",
          pendingAccountChange?.isActive 
            ? "All account features will be restored"
            : "Account access will be restricted until unfrozen"
        ]}
        customIcon={pendingAccountChange?.isActive ? <span className="text-green-600 text-lg">🔓</span> : <span className="text-red-600 text-lg">🔒</span>}
        customHeaderColor={pendingAccountChange?.isActive ? "bg-green-600" : "bg-red-600"}
        customConfirmColor={pendingAccountChange?.isActive ? "bg-green-600" : "bg-red-600"}
        customConfirmHoverColor={pendingAccountChange?.isActive ? "hover:bg-green-700" : "hover:bg-red-700"}
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        onConfirm={closeSuccessModal}
        type="info"
        title="Success"
        message={successMessage}
        confirmText="OK"
        cancelText="Close"
        customIcon={<span className="text-green-600 text-lg">✅</span>}
        customHeaderColor="bg-green-600"
        customConfirmColor="bg-green-600"
        customConfirmHoverColor="hover:bg-green-700"
      />
    </div>
  );
}

export default AdminDashboard;
