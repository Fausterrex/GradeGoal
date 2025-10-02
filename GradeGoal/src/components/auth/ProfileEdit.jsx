// ========================================
// PROFILE EDIT COMPONENT
// ========================================
// This component handles user profile editing including personal information
// updates and password changes. It provides a modal interface for users to
// modify their account details and security settings.

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from "../../backend/api";
import {
  FaTimes,
  FaUser,
  FaLock,
  FaCamera,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  updatePassword as updateFirebasePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getAuth,
} from "firebase/auth";

const ProfileEdit = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserWithData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePictureUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserProfile();
    }
  }, [isOpen, currentUser]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Use email to get user profile since the API uses email-based lookup
      const profile = await getUserProfile(currentUser.email);

      setUserData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || currentUser.email || "",
        profilePictureUrl:
          profile.profilePictureUrl || currentUser.photoURL || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          profilePictureUrl: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await updateUserProfile(currentUser.email, {
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      // Update the current user context
      updateCurrentUserWithData({
        userId: currentUser?.userId, // Preserve userId
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        photoURL: userData.profilePictureUrl,
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }

      if (!passwordData.currentPassword) {
        setError("Current password is required");
        return;
      }

      console.log("Updating Firebase password for user:", currentUser.email);
      console.log("Current password entered:", passwordData.currentPassword);
      console.log("New password:", passwordData.newPassword);

      // Get the Firebase auth instance and current user
      const auth = getAuth();
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("No user is currently signed in");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password in Firebase Auth
      await updateFirebasePassword(firebaseUser, passwordData.newPassword);

      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        setError(
          "The current password you entered is incorrect. Please check your password and try again."
        );
      } else if (error.code === "auth/weak-password") {
        setError(
          "The new password is too weak. Please choose a stronger password."
        );
      } else if (error.code === "auth/requires-recent-login") {
        setError(
          "For security reasons, please log out and log back in before changing your password."
        );
      } else {
        setError(error.message || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* ========================================
          PROFILE EDIT MODAL OVERLAY
          ======================================== */}
      {/* ========================================
          PROFILE EDIT MODAL CONTAINER
          ======================================== */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ========================================
            MODAL HEADER
            ======================================== */}
        <div className="bg-gradient-to-r from-[#8168C5] to-[#3E325F] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <FaUser className="text-[#8168C5] text-lg" />
              </div>
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* ========================================
            MODAL CONTENT
            ======================================== */}
        <div className="p-6">
          {/* ========================================
              ERROR AND SUCCESS MESSAGES
              ======================================== */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* ========================================
              PROFILE PICTURE SECTION
              ======================================== */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              {/* ========================================
                  PROFILE PICTURE DISPLAY
                  ======================================== */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {userData.profilePictureUrl ? (
                  <img
                    src={userData.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-2xl" />
                )}
              </div>
              {/* ========================================
                  PROFILE PICTURE UPLOAD
                  ======================================== */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-picture"
                />
                <label
                  htmlFor="profile-picture"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white rounded-lg hover:from-[#6D4FC2] hover:to-[#2E2150] transition-all duration-300 cursor-pointer"
                >
                  <FaCamera className="mr-2" />
                  Change Photo
                </label>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white rounded-lg hover:from-[#6D4FC2] hover:to-[#2E2150] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center px-6 py-2 border border-[#8168C5] text-[#8168C5] rounded-lg hover:bg-[#8168C5] hover:text-white transition-all duration-300"
              >
                <FaLock className="mr-2" />
                Change Password
              </button>
            </div>
          </form>

          {/* Password Section */}
          {showPasswordSection && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Change Password
              </h3>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white rounded-lg hover:from-[#6D4FC2] hover:to-[#2E2150] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
