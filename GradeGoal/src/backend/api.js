const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

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

// Course API functions

export async function createCourse(courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create course with status ${response.status}`
    );
  }
  return response.json();
}

export async function getCoursesByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch courses with status ${response.status}`
    );
  }
  return response.json();
}

export async function getCoursesByUid(email) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch courses with status ${response.status}`
    );
  }
  return response.json();
}

export async function getCourseById(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get course with status ${response.status}`
    );
  }

  return response.json();
}

export async function updateCourse(id, courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update course with status ${response.status}`
    );
  }
  return response.json();
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete course with status ${response.status}`
    );
  }
  return response.ok;
}

export async function archiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to archive course with status ${response.status}`
    );
  }
  return response.json();
}

export async function unarchiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/unarchive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to unarchive course with status ${response.status}`
    );
  }
  return response.json();
}

export async function getActiveCoursesByUid(uid) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/active`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch active courses with status ${response.status}`
    );
  }
  return response.json();
}

export async function getArchivedCoursesByUid(uid) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/archived`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch archived courses with status ${response.status}`
    );
  }
  return response.json();
}

export async function addCategoryToCourse(courseId, categoryData) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to add category with status ${response.status}`
    );
  }

  return response.json();
}

export async function deleteAssessmentCategory(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment-categories/${categoryId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete category with status ${response.status}`
    );
  }

  return response.ok;
}

export async function updateAssessmentCategory(categoryId, categoryData) {
  const response = await fetch(
    `${API_BASE_URL}/api/assessment-categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update category with status ${response.status}`
    );
  }

  return response.json();
}

// Grade API functions

export async function createGrade(gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function getGradesByCategoryId(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/api/grades/category/${categoryId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch grades with status ${response.status}`
    );
  }
  return response.json();
}

export async function getGradesByCourseId(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/grades/course/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch grades with status ${response.status}`
    );
  }
  return response.json();
}

export async function updateGrade(id, gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function deleteGrade(id) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete grade with status ${response.status}`
    );
  }
  return response.ok;
}

// Goal API functions

export async function createGoal(goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create goal with status ${response.status}`
    );
  }
  return response.json();
}

export async function getGoalsByUid(uid) {
  const response = await fetch(
    `${API_BASE_URL}/api/goals/user/${encodeURIComponent(uid)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch goals with status ${response.status}`
    );
  }
  return response.json();
}

export async function updateGoal(id, goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update goal with status ${response.status}`
    );
  }
  return response.json();
}

export async function deleteGoal(id) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete goal with status ${response.status}`
    );
  }
  return response.ok;
}

export async function getAssessmentCategoriesByCourseId(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text ||
        `Failed to fetch assessment categories with status ${response.status}`
    );
  }
  return response.json();
}

export async function createAssessmentCategory(courseId, categoryData) {
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text ||
        `Failed to create assessment category with status ${response.status}`
    );
  }
  return response.json();
}

// Get user profile by email
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

// Update user profile
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
        profilePictureUrl: profileData.profilePictureUrl || null,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }

  return response.json();
}

// Update user password
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

// Academic Goals API functions

export async function createAcademicGoal(goalData) {
  const response = await fetch(`${API_BASE_URL}/api/academic-goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create goal with status ${response.status}`
    );
  }
  return response.json();
}

export async function getAcademicGoalsByUserId(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/academic-goals/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch goals with status ${response.status}`
    );
  }
  return response.json();
}

export async function getAcademicGoalsByCourse(userId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/academic-goals/user/${userId}/course/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch course goals with status ${response.status}`
    );
  }
  return response.json();
}

// Database Calculation API functions

export async function calculateCourseGrade(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/grade`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate course grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function calculateCourseGPA(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/gpa`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate course GPA with status ${response.status}`
    );
  }
  return response.json();
}

export async function calculateCategoryGrade(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/category/${categoryId}/grade`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate category grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function addOrUpdateGradeWithCalculation(gradeData) {
  
  // Validate required fields before sending
  const requiredFields = ['assessmentId', 'pointsEarned', 'pointsPossible', 'percentageScore'];
  const missingFields = requiredFields.filter(field => gradeData[field] === null || gradeData[field] === undefined);
  
  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/grade/add-update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gradeData),
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("API Error Response:", text);
    throw new Error(
      text || `Failed to add/update grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function updateCourseGrades(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/update-grades`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update course grades with status ${response.status}`
    );
  }
  return response.json();
}

export async function calculateGPAFromPercentage(percentage) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/gpa/calculate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ percentage }),
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate GPA with status ${response.status}`
    );
  }
  return response.json();
}

export async function awardPoints(userId, points, activityType) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/award-points`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points, activityType }),
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to award points with status ${response.status}`
    );
  }
  return response.json();
}

export async function checkGoalProgress(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/check-goal-progress`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to check goal progress with status ${response.status}`
    );
  }
  return response.json();
}

export async function checkGradeAlerts(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/check-grade-alerts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to check grade alerts with status ${response.status}`
    );
  }
  return response.json();
}


export async function calculateAndSaveCourseGrade(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/calculate-and-save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate and save course grade with status ${response.status}`
    );
  }
  return response.json();
}

export async function updateCourseHandleMissing(courseId, handleMissing) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/handle-missing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ handleMissing }),
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update handle missing setting with status ${response.status}`
    );
  }
  return response.json();
}

export async function debugCourseCalculations(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/debug`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to debug course calculations with status ${response.status}`
    );
  }
  return response.json();
}

// AI Analysis API functions

/**
 * Save AI analysis to database
 */
export async function saveAIAnalysis(userId, courseId, analysisData, analysisType = 'COURSE_ANALYSIS', aiModel = 'gemini-2.0-flash-exp', confidence = 0.85) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      courseId,
      analysisData: JSON.stringify(analysisData),
      analysisType,
      aiModel,
      confidence
    }),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to save AI analysis with status ${response.status}`
    );
  }
  return response.json();
}

/**
 * Get AI analysis from database
 */
export async function getAIAnalysis(userId, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/course/${courseId}/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get AI analysis with status ${response.status}`
    );
  }
  return response.json();
}

/**
 * Check if AI analysis exists
 */
export async function checkAIAnalysisExists(userId, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/course/${courseId}/user/${userId}/exists`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to check AI analysis existence with status ${response.status}`
    );
  }
  return response.json();
}

/**
 * Save AI assessment prediction
 */
export async function saveAIAssessmentPrediction(userId, courseId, assessmentId, predictedScore, predictedPercentage, predictedGpa, confidenceLevel, recommendedScore, recommendedPercentage, analysisReasoning) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/assessment-prediction/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      courseId,
      assessmentId,
      predictedScore,
      predictedPercentage,
      predictedGpa,
      confidenceLevel,
      recommendedScore,
      recommendedPercentage,
      analysisReasoning
    }),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to save AI assessment prediction with status ${response.status}`
    );
  }
  return response.json();
}

/**
 * Get AI assessment predictions for a course
 */
export async function getAIAssessmentPredictions(userId, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/course/${courseId}/user/${userId}/predictions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get AI assessment predictions with status ${response.status}`
    );
  }
  return response.json();
}

// ========================================
// USER ACTIVITY LOG API FUNCTIONS
// ========================================

/**
 * Save a single activity to the database
 */
export async function logUserActivity(userId, activityType, context, ipAddress = null) {
  const response = await fetch(`${API_BASE_URL}/api/user-activity/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      activityType,
      context,
      ipAddress
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to log activity with status ${response.status}`);
  }
  return response.json();
}

/**
 * Save multiple activities to the database in batch
 */
export async function logUserActivities(activities) {
  const response = await fetch(`${API_BASE_URL}/api/user-activity/log-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activities
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to log activities with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get recent activities for a user
 */
export async function getRecentUserActivities(userId, days = 7) {
  const response = await fetch(
    `${API_BASE_URL}/api/user-activity/user/${userId}/recent?days=${days}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get recent activities with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get activity statistics for a user
 */
export async function getUserActivityStats(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/user-activity/user/${userId}/stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get activity stats with status ${response.status}`);
  }
  return response.json();
}

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
// ACHIEVEMENT API FUNCTIONS
// ========================================

/**
 * Get user's recent achievements (limited to 2 most recent)
 * @param {number} userId - User ID
 */
export async function getRecentAchievements(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/user-progress/${userId}/recent-achievements`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get recent achievements with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Get user progress with rank information
 * @param {number} userId - User ID
 */
export async function getUserProgressWithRank(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/user-progress/${userId}/with-rank`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get user progress with rank with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Check and award achievements for a user
 * @param {number} userId - User ID
 */
export async function checkAchievements(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/check/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to check achievements with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get all achievements for a user (earned)
 * @param {number} userId - User ID
 */
export async function getUserAchievements(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get user achievements with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get all achievements with progress (locked and unlocked)
 * @param {number} userId - User ID
 */
export async function getAllAchievementsWithProgress(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/user/${userId}/all`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get all achievements with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get notifications for a user
 * @param {number} userId - User ID
 */
export async function getNotifications(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get notifications with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get unread notifications for a user
 * @param {number} userId - User ID
 */
export async function getUnreadNotifications(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/unread`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get unread notifications with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get unread notification count
 * @param {number} userId - User ID
 */
export async function getUnreadCount(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/unread-count`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get unread count with status ${response.status}`);
  }
  return response.json();
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 */
export async function markNotificationAsRead(notificationId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to mark notification as read with status ${response.status}`);
  }
  return response.json();
}

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 */
export async function markAllNotificationsAsRead(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/mark-all-read`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to mark all notifications as read with status ${response.status}`);
  }
  return response.json();
}

