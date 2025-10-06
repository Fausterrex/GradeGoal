// ========================================
// USER MANAGEMENT API
// ========================================
// Centralized API functions for user-related operations
// Handles authentication, profile management, and user data

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

// ========================================
// USER AUTHENTICATION
// ========================================

/**
 * Register a new user
 * @param {Object} userPayload - User registration data
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userPayload) {
  // Handle both new format and legacy format
  let newFormat;

  if (userPayload.firstName && userPayload.lastName) {
    // New format - direct mapping to User entity
    newFormat = {
      email: userPayload.email,
      password: userPayload.password, // Send plain password, service will hash it
      firstName: userPayload.firstName,
      lastName: userPayload.lastName,
    };
  } else {
    // Legacy format - convert displayName to firstName/lastName
    newFormat = {
      email: userPayload.email,
      password: userPayload.password || "default_password",
      firstName: userPayload.displayName
        ? userPayload.displayName.split(" ")[0]
        : "",
      lastName: userPayload.displayName
        ? userPayload.displayName.split(" ").slice(1).join(" ")
        : "",
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
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
 * Login user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
export async function loginUser(email) {
  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/username/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  // First get the user by email to get the user ID
  const user = await getUserProfile(email);

  const response = await fetch(
    `${API_BASE_URL}/api/users/${user.userId}/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
    // First get the user by email to get the user ID
    const user = await getUserProfile(email);
    console.log("User found:", user);
    console.log("Password data:", passwordData);

    const response = await fetch(
      `${API_BASE_URL}/api/users/${user.userId}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}/preferences`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/username/${encodeURIComponent(username)}/available`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/streak`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/update-login-streak`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to update login streak with status ${response.status}`);
  }

  return response.json();
}
