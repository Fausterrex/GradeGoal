
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080');

export async function registerUserNew(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Signup failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function registerUser(userPayload) {
  // Handle both new format and legacy format
  let newFormat;

  if (userPayload.firstName && userPayload.lastName) {
    // New format - direct mapping to User entity
    newFormat = {
      email: userPayload.email,
      password: userPayload.password, // Send plain password, service will hash it
      firstName: userPayload.firstName,
      lastName: userPayload.lastName
    };
  } else {
    // Legacy format - convert displayName to firstName/lastName
    newFormat = {
      email: userPayload.email,
      password: userPayload.password || "default_password",
      firstName: userPayload.displayName ? userPayload.displayName.split(' ')[0] : '',
      lastName: userPayload.displayName ? userPayload.displayName.split(' ').slice(1).join(' ') : ''
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newFormat),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Signup failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function loginUserNew(loginData) {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Login failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function loginUser(email) {
  const response = await fetch(`${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Login failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function getUserById(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch user with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function getUserByEmail(email) {
  const response = await fetch(`${API_BASE_URL}/api/users/email/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch user with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function updateUserProfile(userId, profileData) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update profile with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function updateUserPassword(userId, passwordData) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update password with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function updateNotificationPreferences(userId, notificationData) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/notifications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update notifications with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function googleSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Google sign-in failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function facebookSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Facebook sign-in failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

// Course API functions

export async function createCourse(courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create course with status ${response.status}`);
  }
  return response.json();
}

export async function getCoursesByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch courses with status ${response.status}`);
  }
  return response.json();
}

export async function getCoursesByUid(email) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch courses with status ${response.status}`);
  }
  return response.json();
}

export async function getCourseById(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to get course with status ${response.status}`);
  }

  return response.json();
}

export async function updateCourse(id, courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update course with status ${response.status}`);
  }
  return response.json();
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete course with status ${response.status}`);
  }
  return response.ok;
}

export async function archiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/archive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to archive course with status ${response.status}`);
  }
  return response.json();
}

export async function unarchiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/unarchive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to unarchive course with status ${response.status}`);
  }
  return response.json();
}

export async function getActiveCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch active courses with status ${response.status}`);
  }
  return response.json();
}

export async function getArchivedCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/archived`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch archived courses with status ${response.status}`);
  }
  return response.json();
}

export async function addCategoryToCourse(courseId, categoryData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to add category with status ${response.status}`);
  }

  return response.json();
}

export async function deleteAssessmentCategory(categoryId) {
  const response = await fetch(`${API_BASE_URL}/api/assessment-categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete category with status ${response.status}`);
  }

  return response.ok;
}

export async function updateAssessmentCategory(categoryId, categoryData) {
  const response = await fetch(`${API_BASE_URL}/api/assessment-categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update category with status ${response.status}`);
  }

  return response.json();
}

// Grade API functions

export async function createGrade(gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create grade with status ${response.status}`);
  }
  return response.json();
}

export async function getGradesByCategoryId(categoryId) {
  const response = await fetch(`${API_BASE_URL}/api/grades/category/${categoryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch grades with status ${response.status}`);
  }
  return response.json();
}

export async function getGradesByCourseId(courseId) {
  const response = await fetch(`${API_BASE_URL}/api/grades/course/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch grades with status ${response.status}`);
  }
  return response.json();
}

export async function updateGrade(id, gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update grade with status ${response.status}`);
  }
  return response.json();
}

export async function deleteGrade(id) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete grade with status ${response.status}`);
  }
  return response.ok;
}

// Goal API functions

export async function createGoal(goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create goal with status ${response.status}`);
  }
  return response.json();
}

export async function getGoalsByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/goals/user/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch goals with status ${response.status}`);
  }
  return response.json();
}

export async function getGoalsByUidAndCourseId(uid, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/goals/user/${encodeURIComponent(uid)}/course/${encodeURIComponent(courseId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch goals with status ${response.status}`);
  }
  return response.json();
}

export async function updateGoal(id, goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update goal with status ${response.status}`);
  }
  return response.json();
}

export async function deleteGoal(id) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete goal with status ${response.status}`);
  }
  return response.ok;
}

// New Schema API Functions

export async function getActiveCoursesByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${userId}/active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch active courses with status ${response.status}`);
  }
  return response.json();
}

export async function getAssessmentCategoriesByCourseId(courseId) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch assessment categories with status ${response.status}`);
  }
  return response.json();
}

export async function createAssessmentCategory(courseId, categoryData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create assessment category with status ${response.status}`);
  }
  return response.json();
}

export async function getAssessmentsByCategoryId(categoryId) {
  const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/assessments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch assessments with status ${response.status}`);
  }
  return response.json();
}

export async function createAssessment(categoryId, assessmentData) {
  const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assessmentData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create assessment with status ${response.status}`);
  }
  return response.json();
}

export async function getGradesByAssessmentId(assessmentId) {
  const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}/grades`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch grades with status ${response.status}`);
  }
  return response.json();
}

export async function createGradeNew(assessmentId, gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create grade with status ${response.status}`);
  }
  return response.json();
}

export async function getAcademicGoalsByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/goals`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch academic goals with status ${response.status}`);
  }
  return response.json();
}

export async function createAcademicGoal(userId, goalData) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create academic goal with status ${response.status}`);
  }
  return response.json();
}

