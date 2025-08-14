const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080';

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


