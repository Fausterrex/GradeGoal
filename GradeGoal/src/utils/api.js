
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

