import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { UserService } from '../../services/userService';
import { ProfileEditModal } from '../../components/modals/ProfileEditModal';
import { PasswordChangeModal } from '../../components/modals/PasswordChangeModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';

export const SettingsScreen: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    profilePictureUrl: '',
    currentYearLevel: '1',
  });
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (currentUser?.email) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser?.email) return;

    try {
      setIsLoading(true);
      const user = await UserService.getUserProfile(currentUser.email) as any;
      
      setEmailNotificationsEnabled(user?.emailNotificationsEnabled ?? true);
      
      const newProfileData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '',
        profilePictureUrl: user?.profilePictureUrl || '',
        currentYearLevel: user?.currentYearLevel || '1',
      };
      
      setProfileData(newProfileData);
    } catch (error) {
      console.error('❌ [SettingsScreen] Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUserData();
    setIsRefreshing(false);
  };

  const handleEmailNotificationToggle = (enabled: boolean) => {
    setEmailNotificationsEnabled(enabled);
  };



  const handleSaveSettings = async () => {
    if (!currentUser?.email) return;

    setIsLoading(true);
    try {
      await UserService.updateUserPreferences(currentUser.email, {
        emailNotificationsEnabled,
      });

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = (newProfileData: any) => {
    setProfileData(newProfileData);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const handleSaveConfirm = () => {
    setShowSaveModal(false);
    handleSaveSettings();
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.noUserContainer}>
            <Text style={styles.noUserTitle}>Please log in to access settings</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* User Profile Card */}
          <View style={styles.userInfoCard}>
            <View style={styles.profilePictureContainer}>
              {profileData.profilePictureUrl ? (
                <View style={styles.profilePicture}>
                  <Text style={styles.profilePictureText}>
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </Text>
                </View>
              ) : (
                <View style={styles.profilePicture}>
                  <Text style={styles.profilePicturePlaceholder}>👤</Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>
              {profileData.firstName && profileData.lastName
                ? `${profileData.firstName} ${profileData.lastName}`
                : 'User Name'}
            </Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
            <Text style={styles.userDetails}>
              {profileData.currentYearLevel} • USER
            </Text>
          </View>

          {/* Settings Options */}
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowProfileModal(true)}
            >
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>👤</Text>
                <Text style={styles.settingText}>Profile Settings</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>🔒</Text>
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingText}>Email Notifications</Text>
                  <Text style={styles.settingSubtext}>Receive notifications via email</Text>
                </View>
              </View>
              <Switch
                value={emailNotificationsEnabled}
                onValueChange={handleEmailNotificationToggle}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={emailNotificationsEnabled ? colors.background.primary : colors.gray[100]}
              />
            </View>



            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>🛡️</Text>
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowSaveModal(true)}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Modals */}
      <ProfileEditModal
        isVisible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleProfileSave}
        initialData={profileData}
        userEmail={currentUser.email}
      />

      <PasswordChangeModal
        isVisible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={currentUser.email}
      />

      <ConfirmationModal
        isVisible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveConfirm}
        type="edit"
        title="Save Settings"
        message="Are you sure you want to save your settings? This will update your notification preferences."
        confirmText="Save Changes"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isVisible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        type="delete"
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        showWarning={true}
        warningItems={[
          "You will be signed out of your account",
          "Any unsaved changes will be lost",
          "You'll need to sign in again to continue"
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noUserTitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  userInfoCard: {
    backgroundColor: colors.background.primary,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePictureContainer: {
    marginBottom: 12,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profilePicturePlaceholder: {
    fontSize: 32,
    color: colors.gray[400],
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  settingsCard: {
    backgroundColor: colors.background.primary,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.text.tertiary,
  },
  actionButtonsContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.red[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
