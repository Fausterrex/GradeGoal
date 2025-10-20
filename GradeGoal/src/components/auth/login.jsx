// ========================================
// LOGIN COMPONENT
// ========================================
// This component handles user authentication including email/password login
// and social media authentication (Google, Facebook). It validates user input,
// manages authentication state, and redirects users after successful login.

import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../backend/firebase";
import { loginUser, googleSignIn, facebookSignIn, getUserProfile, getUserProfileByUsername, updateUserLoginStreak } from "../../backend/api";
function Login() {
  const emailOrUsernameRef = useRef();
  const passwordRef = useRef();
  const { updateCurrentUserWithData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState("");


  // Handles form submission for email/username login
  // Validates input, authenticates with Firebase, and redirects to dashboard
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInputError("");

    const emailOrUsername = (emailOrUsernameRef.current.value || "").trim();
    if (!emailOrUsername) {
      setInputError("Please enter your email or username.");
      return;
    }

    if (passwordRef.current.value.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    try {
      setError("");
      setInputError("");
      setSuccess("");
      setLoading(true);

      const password = passwordRef.current.value;
      
      // Determine if input is email or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);
      
      let firebaseEmail;
      if (isEmail) {
        firebaseEmail = emailOrUsername;
      } else {
        // For username login, we need to get the email first
        const userProfile = await getUserProfileByUsername(emailOrUsername);
        setLoading(true);
        if (!userProfile) {
          setInputError("Username not found.");
          setLoading(false);
          return;
        }
        firebaseEmail = userProfile.email;
      }
      
      const cred = await signInWithEmailAndPassword(auth, firebaseEmail, password);
      const firebaseUser = cred.user;
      const userDataFromDB = await loginUser(firebaseUser.email);

      // Get user profile to determine role and check account status
      const userProfile = await getUserProfile(firebaseUser.email);

      // Check if account is frozen
      if (userProfile && userProfile.isActive === false) {
        setError("Your account has been frozen by an administrator. Please contact support for assistance.");
        setLoading(false);
        return;
      }

      const userData = {
        userId: userProfile?.userId || null, // Include userId
        email: firebaseUser.email,
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        displayName: userProfile?.firstName && userProfile?.lastName 
          ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
          : userDataFromDB?.displayName || firebaseUser.email,
        role: userProfile?.role || 'USER',
        isActive: userProfile?.isActive !== false, // Default to true if not specified
      };

      updateCurrentUserWithData(userData);
      setSuccess("Logged in successfully!");
      
      // Update login streak after successful login (optional)
      if (userData.userId) {
        try {
          await updateUserLoginStreak(userData.userId);
        } catch (error) {
          // Don't fail the login if streak update fails
          console.warn('Failed to update login streak:', error);
        }
      }
      
      setTimeout(() => {
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please check your email/username and password, or create a new account if you don't have one.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please check your email or create a new account.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again or reset your password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password must be at least 6 characters long.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else if (error.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else if (error.code === "auth/operation-not-allowed") {
        setError("Email/password authentication is not enabled. Please contact support.");
      } else {
        setError("Login failed. Please check your credentials or create a new account if you don't have one.");
      }
    }
    setLoading(false);
  }

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const displayName = firebaseUser.displayName || firebaseUser.email;
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData = {
        email: firebaseUser.email,
        firstName: firstName,
        lastName: lastName,
        profilePictureUrl: firebaseUser.photoURL || null,
      };

      await googleSignIn(userData);
      
      // Get user profile to determine role for Google sign-in
      try {
        const userProfile = await getUserProfile(firebaseUser.email);
        userData.role = userProfile?.role || 'USER';
        userData.userId = userProfile?.userId || null; // Include userId
      } catch (error) {
        // Default to USER role if profile fetch fails
        userData.role = 'USER';
        userData.userId = null;
      }
      
      updateCurrentUserWithData(userData);

      setSuccess("Logged in with Google successfully!");
      
      // Update login streak after successful Google login
      if (userData.userId) {
        try {
          await updateUserLoginStreak(userData.userId);
        } catch (error) {

          // Don't fail the login if streak update fails
        }
      }
      
      setTimeout(() => {
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (error) {
      setError("Failed to log in with Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const result = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = result.user;

      const displayName = firebaseUser.displayName || firebaseUser.email;
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData = {
        email: firebaseUser.email,
        firstName: firstName,
        lastName: lastName,
        profilePictureUrl: firebaseUser.photoURL || null,
      };

      await facebookSignIn(userData);
      
      // Get user profile to determine role for Facebook sign-in
      try {
        const userProfile = await getUserProfile(firebaseUser.email);
        userData.role = userProfile?.role || 'USER';
        userData.userId = userProfile?.userId || null; // Include userId
      } catch (error) {
        // Default to USER role if profile fetch fails
        userData.role = 'USER';
        userData.userId = null;
      }
      
      updateCurrentUserWithData(userData);

      setSuccess("Logged in with Facebook successfully!");
      
      // Update login streak after successful Facebook login
      if (userData.userId) {
        try {
          await updateUserLoginStreak(userData.userId);
        } catch (error) {

          // Don't fail the login if streak update fails
        }
      }
      
      setTimeout(() => {
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (error) {
      setError("Failed to log in with Facebook: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] flex justify-center items-center px-4">
      {/* ========================================
                LOGIN PAGE CONTAINER
                ======================================== */}
      {/* ========================================
                LOGIN CARD
                ======================================== */}
      <div className="w-full max-w-md border-0 rounded-2xl shadow-2xl bg-white">
        {/* ========================================
                    LOGIN HEADER
                    ======================================== */}
        <div className="bg-[#3B389f] border-0 rounded-t-2xl p-6 text-center">
          <h2 className="text-white text-2xl font-bold m-0">Log In</h2>
        </div>

        {/* ========================================
                    LOGIN FORM CONTAINER
                    ======================================== */}
        <div className="p-8 flex flex-col items-center">
          {/* ========================================
                        ERROR AND SUCCESS MESSAGES
                        ======================================== */}
          {error && (
            <div className="w-full mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                  {error.includes("No account found") && (
                    <p className="mt-2 text-xs text-red-600">
                      Don't have an account? <Link to="/signup" className="underline font-medium">Create one here</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {success && (
            <div className="w-full mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* ========================================
                        LOGIN FORM
                        ======================================== */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center mb-6"
          >
            {/* ========================================
                            EMAIL INPUT FIELD
                            ======================================== */}
            <div className="mb-7 w-full max-w-sm">
              <div className="relative flex items-center">
                <input
                  type="text"
                  ref={emailOrUsernameRef}
                  required
                  placeholder="Email or Username"
                  className={`w-full pl-10 pr-10 py-3 border rounded-full text-base transition-all duration-200 focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none ${
                    inputError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-[#3B389f]"
                  }`}
                />
                {inputError && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-sm">
                    {inputError}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================
                            PASSWORD INPUT FIELD
                            ======================================== */}
            <div className="mb-4 w-full max-w-sm">
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full text-base transition-all duration-200 focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 text-gray-500 text-lg cursor-pointer z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* ========================================
                            FORGOT PASSWORD LINK
                            ======================================== */}
            <div className="text-center mb-6 w-full">
              <Link
                to="/forgot-password"
                className="text-gray-500 text-sm font-medium transition-colors duration-200 hover:text-[#2d2a7a] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* ========================================
                            LOGIN BUTTON
                            ======================================== */}
            <button
              disabled={loading}
              className="w-full max-w-sm bg-[#3B389f] border-0 rounded-full py-3.5 text-base font-semibold text-white transition-all duration-300 mb-6 hover:bg-[#2d2a7a] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:transform-none flex justify-center items-center"
              type="submit"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>

            {/* ========================================
                            DIVIDER
                            ======================================== */}
            <div className="relative text-center mb-3 w-full">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
              <span className="bg-white px-4 text-gray-500 text-sm relative z-10">
                or
              </span>
            </div>

            {/* ========================================
                            SOCIAL LOGIN BUTTONS
                            ======================================== */}
            <div className="flex items-center justify-center mt-3">
              {/* ========================================
                                GOOGLE LOGIN BUTTON
                                ======================================== */}
              <button
                type="button"
                className="bg-white text-gray-700 w-12 h-12 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-all duration-200 cursor-pointer"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img
                  src="/src/drawables/googlelogo.png"
                  alt="Google"
                  className="w-6 h-6"
                />
              </button>

              {/* ========================================
                                FACEBOOK LOGIN BUTTON
                                ======================================== */}
              <button
                className="bg-white text-gray-700 w-12 h-12 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center mx-3 transition-all duration-200 cursor-pointer"
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                <img
                  src="/src/drawables/facebook.png"
                  alt="Facebook"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </form>

          {/* ========================================
                        SIGN UP LINK
                        ======================================== */}
          <div className="text-center text-gray-500 text-sm">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#3B389f] underline font-semibold transition-colors duration-200 hover:text-[#2d2a7a]"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
