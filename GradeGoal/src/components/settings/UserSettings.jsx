import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Mail, User, Save, CheckCircle, AlertCircle, Edit, Lock, LogOut, Camera, Eye, EyeOff } from 'lucide-react';
import { getUserProfile, updateUserPreferences, updateUserProfile, updateUserPassword } from '../../backend/api';

/**
 * User Settings Component
 * 
 * Allows users to manage their notification preferences and account settings.
 * Includes toggles for email and push notifications.
 */
const UserSettings = () => {
  const { currentUser, logout, updateCurrentUserWithData } = useAuth();
  const navigate = useNavigate();
  const { 
    isEnabled: pushNotificationsEnabled, 
    enablePushNotifications, 
    disablePushNotifications,
    isLoading: pushLoading,
    error: pushError 
  } = usePushNotifications();

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [error, setError] = useState(null);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    profilePictureUrl: ''
  });
  
  // Password editing states
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user preferences on component mount
  useEffect(() => {
    if (currentUser?.email) {
      loadUserPreferences();
    }
  }, [currentUser]);

  const loadUserPreferences = async () => {
    try {
      const user = await getUserProfile(currentUser.email);
      
      setEmailNotificationsEnabled(user.emailNotificationsEnabled ?? true);
      
      // Load profile data for editing
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePictureUrl: user.profilePictureUrl || currentUser.photoURL || ''
      });
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      // Set defaults if loading fails
      setEmailNotificationsEnabled(true);
    }
  };

  const handleEmailNotificationToggle = (enabled) => {
    setEmailNotificationsEnabled(enabled);
  };

  const handlePushNotificationToggle = async (enabled) => {
    if (enabled) {
      await enablePushNotifications();
    } else {
      await disablePushNotifications();
    }
    // Remove auto-save - user must click "Save Settings" button
  };

  const savePreferences = async () => {
    if (!currentUser?.email) return;

    setIsLoading(true);
    setError(null);
    setSaveStatus(null);

    try {
      await updateUserPreferences(currentUser.email, {
        emailNotificationsEnabled,
        pushNotificationsEnabled: pushNotificationsEnabled
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('Failed to save preferences. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePictureUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    setError(null);
    setSaveStatus(null);

    try {
      // Save notification preferences
      await updateUserPreferences(currentUser.email, {
        emailNotificationsEnabled,
        pushNotificationsEnabled: pushNotificationsEnabled
      });

           // Save profile changes if editing name or if profile picture changed
           const hasProfileChanges = isEditingProfile || 
             (profileData.profilePictureUrl !== (currentUser.photoURL || ''));
           
           if (hasProfileChanges) {
        
        await updateUserProfile(currentUser.email, {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          profilePictureUrl: profileData.profilePictureUrl
        });

        // Update current user context
        updateCurrentUserWithData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          displayName: `${profileData.firstName} ${profileData.lastName}`.trim(),
          photoURL: profileData.profilePictureUrl
        });

        if (isEditingProfile) {
          setIsEditingProfile(false);
        }
      }

      // Save password changes if editing
      if (isEditingPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        await updateUserPassword(currentUser.email, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });

        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditingPassword(false);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please log in to access settings</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
              <p className="text-gray-600">Manage your account preferences and notification settings</p>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            saveStatus === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {saveStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={`text-sm ${
              saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveStatus === 'success' 
                ? 'Settings saved successfully!' 
                : 'Failed to save settings. Please try again.'
              }
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>

            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profilePictureUrl ? (
                      <img 
                        src={profileData.profilePictureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture-input"
                    />
                    <label
                      htmlFor="profile-picture-input"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Change Photo</span>
                    </label>
                    {profileData.profilePictureUrl && (
                      <button
                        onClick={() => setProfileData(prev => ({ ...prev, profilePictureUrl: '' }))}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{currentUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                {!isEditingProfile ? (
                  <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                    <p className="text-gray-900">
                      {profileData.firstName && profileData.lastName 
                        ? `${profileData.firstName} ${profileData.lastName}`.trim()
                        : 'Name not set - Click Edit to add your name'}
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      <span>{profileData.firstName && profileData.lastName ? 'Edit' : 'Set Name'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileInputChange}
                          placeholder="First Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileInputChange}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Password
                </label>
                {!isEditingPassword ? (
                  <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">Update your password</p>
                      <p className="text-xs text-gray-500">Keep your account secure</p>
                    </div>
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Change</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Current Password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="New Password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm New Password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotificationsEnabled}
                    onChange={(e) => handleEmailNotificationToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-xs text-gray-500">Receive notifications in your browser</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotificationsEnabled}
                    onChange={(e) => handlePushNotificationToggle(e.target.checked)}
                    disabled={pushLoading}
                    className="sr-only peer disabled:cursor-not-allowed"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${pushLoading ? 'opacity-50' : ''}`}></div>
                </label>
              </div>

              {/* Push Notification Error */}
              {pushError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-800">{pushError}</p>
                </div>
              )}

              {/* Notification Types Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">You'll receive notifications for:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Grade alerts when you receive new scores</li>
                  <li>• Course completion notifications</li>
                  <li>• Assessment reminders</li>
                  <li>• Goal achievement alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-between items-center">
          {/* Logout Button - Bottom Left */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                handleLogout();
              }
            }}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>

          {/* Save Button - Bottom Right */}
          <button
            onClick={handleSaveAll}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default UserSettings;
