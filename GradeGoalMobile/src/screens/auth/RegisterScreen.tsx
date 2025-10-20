import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';

export const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Sign Up Card - Matching web app design */}
        <View style={styles.signUpCard}>
          {/* Sign Up Header - Matching web app purple header */}
          <View style={styles.signUpHeader}>
            <Text style={styles.signUpTitle}>Sign Up</Text>
          </View>

          {/* Sign Up Form Container */}
          <View style={styles.formContainer}>
            {/* Sign Up Form */}
            <View style={styles.form}>
              {/* First Name and Last Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    placeholder="First Name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    placeholder="Last Name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>

              {/* Email Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.fullWidthInput}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              {/* Password Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.fullWidthInput}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              {/* Confirm Password Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.fullWidthInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  placeholder="Confirm Password"
                  secureTextEntry
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[commonStyles.primaryButton, styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={commonStyles.primaryButtonText}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  
  // Sign Up Card - Matching web app design
  signUpCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    shadowColor: colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Sign Up Header - Matching web app purple header
  signUpHeader: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  
  signUpTitle: {
    color: colors.text.white,
    fontSize: 24,
    fontWeight: 'bold',
    margin: 0,
  },
  
  // Form Container
  formContainer: {
    padding: 32,
    alignItems: 'center',
  },
  
  form: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  // Name Row - First Name and Last Name side by side
  nameRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
    marginBottom: 28,
    gap: 12,
  },
  
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 28,
  },
  
  nameInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  
  nameInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 48,
  },
  
  fullWidthInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 48,
  },
  
  signUpButton: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
  },
  
  signUpButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  
  loginContainer: {
    alignItems: 'center',
  },
  
  loginText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  
  loginLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
