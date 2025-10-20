// ========================================
// USER MANAGEMENT API
// ========================================
// Centralized API functions for user-related operations
// Handles authentication, profile management, and user data

import { auth } from "./firebase";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get Firebase authentication headers
 * @returns {Promise<Object>} Headers with Firebase token
 */
async function getAuthHeaders() {
  const firebaseUser = auth.currentUser;
  let authToken = null;
  
  if (firebaseUser) {
    try {
      authToken = await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }
  }

  const headers = {
    "Content-Type": "application/json",
  };

  // Add Firebase token to headers if available
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

// ========================================
// USER AUTHENTICATION
// ========================================

/**
 * Register a new user with Firebase UID
 * @param {Object} userPayload - User registration data
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userPayload) {
  // Get the current Firebase user to get the UID
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error("No Firebase user found. Please ensure you're authenticated.");
  }

  // Handle both new format and legacy format
  let newFormat;

  if (userPayload.firstName && userPayload.lastName) {
    // New format - direct mapping to User entity
    newFormat = {
      firebaseUid: firebaseUser.uid,
      email: userPayload.email,
      firstName: userPayload.firstName,
      lastName: userPayload.lastName,
    };
  } else {
    // Legacy format - convert displayName to firstName/lastName
    newFormat = {
      firebaseUid: firebaseUser.uid,
      email: userPayload.email,
      firstName: userPayload.displayName
        ? userPayload.displayName.split(" ")[0]
        : "",
      lastName: userPayload.displayName
        ? userPayload.displayName.split(" ").slice(1).join(" ")
        : "",
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/users/register-firebase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newFormat),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Signup failed with status ${response.status}`);
  }
  
  return response.json().catch(() => ({}));
}

/**
 * Login user by email (Firebase authentication)
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
export async function loginUser(email) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Login failed with status ${response.status}`);
  }
  
  return response.json().catch(() => ({}));
}

/**
 * Google Sign-In
 * @param {Object} userData - Google user data
 * @returns {Promise<Object>} Sign-in response
 */
export async function googleSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Google sign-in failed with status ${response.status}`
    );
  }
  
  return response.json().catch(() => ({}));
}

/**
 * Facebook Sign-In
 * @param {Object} userData - Facebook user data
 * @returns {Promise<Object>} Sign-in response
 */
export async function facebookSignIn(userData) {
  // Use the same endpoint as Google sign-in since both are OAuth providers
  const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Facebook sign-in failed with status ${response.status}`
    );
  }
  
  return response.json().catch(() => ({}));
}

// ========================================
// USER PROFILE MANAGEMENT
// ========================================

/**
 * Get user profile by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(email) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    // Handle both JSON and text error responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user profile");
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch user profile");
    }
  }

  return response.json();
}

/**
 * Get user profile by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export async function getUserProfileByUsername(username) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/username/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // User not found
    }
    throw new Error("Failed to fetch user profile by username");
  }

  return response.json();
}

/**
 * Update user profile
 * @param {string} email - User email
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export async function updateUserProfile(email, profileData) {
  const headers = await getAuthHeaders();

  // First get the user by email to get the user ID
  const user = await getUserProfile(email);

  const response = await fetch(
    `${API_BASE_URL}/api/users/${user.userId}/profile`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        profilePictureUrl: profileData.profilePictureUrl || null,
        currentYearLevel: profileData.currentYearLevel || "1",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }

  return response.json();
}

/**
 * Update user password
 * @param {string} email - User email
 * @param {Object} passwordData - Password data
 * @returns {Promise<Object>} Update response
 */
export async function updateUserPassword(email, passwordData) {
  try {
    const headers = await getAuthHeaders();

    // First get the user by email to get the user ID
    const user = await getUserProfile(email);
    console.log("User found:", user);
    console.log("Password data:", passwordData);

    const response = await fetch(
      `${API_BASE_URL}/api/users/${user.userId}/password`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(passwordData),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers.get("content-type"));

    if (!response.ok) {
      // Handle both JSON and text responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      } else {
        const errorText = await response.text();
        console.log("Error text:", errorText);
        throw new Error(errorText || "Failed to update password");
      }
    }

    // Handle both JSON and text responses for success
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      const text = await response.text();
      return { message: text };
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Update user preferences
 * @param {string} email - User email
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} Update response
 */
export async function updateUserPreferences(email, preferences) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}/preferences`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(preferences),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to update user preferences with status ${response.status}`);
  }
  
  return response.json();
}

// ========================================
// USER UTILITIES
// ========================================

/**
 * Check username availability
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if available
 */
export async function checkUsernameAvailability(username) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/username/${encodeURIComponent(username)}/available`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check username availability");
  }

  const data = await response.json();
  return data.available;
}

/**
 * Get user login streak
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Login streak data
 */
export async function getUserLoginStreak(userId) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/streak`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch login streak with status ${response.status}`);
  }

  return response.json();
}

/**
 * Update user login streak
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated login streak data
 */
export async function updateUserLoginStreak(userId) {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/update-login-streak`,
    {
      method: "POST",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to update login streak with status ${response.status}`);
  }

  return response.json();
}
