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
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Coming Soon', 
      'Google login will be available in a future update. Please use email and password for now.',
      [{ text: 'OK' }]
    );
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      'Coming Soon', 
      'Facebook login will be available in a future update. Please use email and password for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Login Card - Matching web app design */}
        <View style={styles.loginCard}>
          {/* Login Header - Matching web app */}
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>Log In</Text>
          </View>

          {/* Login Form Container */}
          <View style={styles.formContainer}>
            {/* Login Form */}
            <View style={styles.form}>
              {/* Email Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[commonStyles.input, styles.input]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email or Username"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[commonStyles.input, styles.input]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                />
              </View>

              {/* Forgot Password Link */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[commonStyles.primaryButton, styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={commonStyles.primaryButtonText}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                {/* Google Login Button */}
                <TouchableOpacity
                  style={[commonStyles.socialButton, styles.googleButton]}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Image
                    source={require('../../../assets/google.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Facebook Login Button */}
                <TouchableOpacity
                  style={[commonStyles.socialButton, styles.facebookButton]}
                  onPress={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <Image
                    source={require('../../../assets/facebook.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
                <Text style={styles.signUpLink}>Sign Up</Text>
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
  
  // Login Card - Matching web app design
  loginCard: {
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
  
  // Login Header - Matching web app purple header
  loginHeader: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  
  loginTitle: {
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
  
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 28,
  },
  
  input: {
    width: '100%',
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 999,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  
  forgotPasswordContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginBottom: 24,
  },
  
  forgotPasswordText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  loginButton: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
  },
  
  loginButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  
  dividerContainer: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  
  dividerText: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  
  googleButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  
  facebookButton: {
    backgroundColor: '#1877F2',
    borderWidth: 1,
    borderColor: '#1877F2',
  },
  
  socialIcon: {
    width: 24,
    height: 24,
  },
  
  signUpContainer: {
    alignItems: 'center',
  },
  
  signUpText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  
  signUpLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
