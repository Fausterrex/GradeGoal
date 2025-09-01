
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080');

export async function registerUser(userPayload) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userPayload),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Signup failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function loginUser(uid) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/${encodeURIComponent(uid)}`, {
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

export async function googleSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/google-signin`, {
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
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/facebook-signin`, {
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

export async function getCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}`, {
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
    method: 'POST',
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
    method: 'POST',
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

