import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../../styles/colors';
import { UserService } from '../../services/userService';

interface ProfileEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  initialData: {
    firstName: string;
    lastName: string;
    username: string;
    profilePictureUrl: string;
    currentYearLevel: string;
  };
  userEmail: string;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialData,
  userEmail,
}) => {
  const [profileData, setProfileData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState({
    isValid: true,
    message: '',
    isChecking: false,
  });

  useEffect(() => {
    if (isVisible) {
      setProfileData(initialData);
    }
  }, [isVisible, initialData]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'username') {
      validateUsername(value);
    }
  };

  const validateUsername = async (username: string) => {
    if (!username) {
      setUsernameValidation({
        isValid: true,
        message: '',
        isChecking: false,
      });
      return;
    }

    // Basic validation
    if (username.length < 3) {
      setUsernameValidation({
        isValid: false,
        message: 'Username must be at least 3 characters long',
        isChecking: false,
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameValidation({
        isValid: false,
        message: 'Username can only contain letters, numbers, and underscores',
        isChecking: false,
      });
      return;
    }

    setUsernameValidation({
      isValid: true,
      message: '',
      isChecking: true,
    });

    try {
      const isAvailable = await UserService.checkUsernameAvailability(username);
      
      if (isAvailable) {
        setUsernameValidation({
          isValid: true,
          message: '',
          isChecking: false,
        });
      } else {
        setUsernameValidation({
          isValid: false,
          message: 'Username is already taken',
          isChecking: false,
        });
      }
    } catch (error) {
      console.error('Username validation error:', error);
      setUsernameValidation({
        isValid: false,
        message: 'Failed to check username availability',
        isChecking: false,
      });
    }
  };

  const handleSave = async () => {
    
    if (!usernameValidation.isValid && profileData.username) {
      Alert.alert('Invalid Username', usernameValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      await UserService.updateUserProfile(userEmail, profileData);
      onSave(profileData);
      onClose();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('❌ [ProfileEditModal] Failed to update profile:', error);
      console.error('❌ [ProfileEditModal] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <ScrollView style={styles.formContainer}>
            {/* Profile Picture */}
            <View style={styles.section}>
              <Text style={styles.label}>Profile Picture</Text>
              <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture}>
                  {profileData.profilePictureUrl ? (
                    <Image
                      source={{ uri: profileData.profilePictureUrl }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Text style={styles.profilePlaceholder}>👤</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.changePhotoButton}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* First Name */}
            <View style={styles.section}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Enter first name"
              />
            </View>

            {/* Last Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Enter last name"
              />
            </View>

            {/* Username */}
            <View style={styles.section}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  profileData.username && !usernameValidation.isValid && styles.inputError,
                  profileData.username && usernameValidation.isValid && styles.inputSuccess,
                ]}
                value={profileData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Enter username"
              />
              
              {profileData.username && (
                <View style={styles.validationContainer}>
                  {usernameValidation.isChecking && (
                    <Text style={styles.validationText}>Checking availability...</Text>
                  )}
                  {!usernameValidation.isChecking && usernameValidation.message && (
                    <Text style={[
                      styles.validationText,
                      usernameValidation.isValid ? styles.validationSuccess : styles.validationError
                    ]}>
                      {usernameValidation.message}
                    </Text>
                  )}
                  {!usernameValidation.isChecking && !usernameValidation.message && usernameValidation.isValid && (
                    <Text style={[styles.validationText, styles.validationSuccess]}>
                      Username is available
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Year Level */}
            <View style={styles.section}>
              <Text style={styles.label}>Academic Year Level</Text>
              <View style={styles.yearLevelContainer}>
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      profileData.currentYearLevel === year && styles.yearButtonSelected,
                    ]}
                    onPress={() => handleInputChange('currentYearLevel', year)}
                  >
                    <Text style={[
                      styles.yearButtonText,
                      profileData.currentYearLevel === year && styles.yearButtonTextSelected,
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: '70%',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  inputError: {
    borderColor: colors.red[500],
    backgroundColor: colors.red[50],
  },
  inputSuccess: {
    borderColor: colors.green[500],
    backgroundColor: colors.green[50],
  },
  validationContainer: {
    marginTop: 5,
  },
  validationText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  validationError: {
    color: colors.red[500],
  },
  validationSuccess: {
    color: colors.green[500],
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePlaceholder: {
    fontSize: 32,
    color: colors.gray[400],
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.blue[100],
    borderRadius: 8,
  },
  changePhotoText: {
    color: colors.blue[600],
    fontSize: 14,
    fontWeight: '600',
  },
  yearLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  yearButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  yearButtonTextSelected: {
    color: colors.background.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
