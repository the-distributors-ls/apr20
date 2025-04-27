// src/utils/authUtils.js

// Get the authentication token from storage
export const getAuthToken = () => {
  // First check sessionStorage
  let token = sessionStorage.getItem("authToken");

  // If not in sessionStorage, check localStorage
  if (!token) {
    token = localStorage.getItem("authToken");
  }

  return token;
};

// Get the refresh token from storage
export const getRefreshToken = () => {
  // First check sessionStorage
  let token = sessionStorage.getItem("refreshToken");

  // If not in sessionStorage, check localStorage
  if (!token) {
    token = localStorage.getItem("refreshToken");
  }

  return token;
};

// Store authentication data (on login)
export const storeAuthData = (
  accessToken,
  refreshToken,
  user,
  rememberMe = false
) => {
  const storage = rememberMe ? localStorage : sessionStorage;

  if (accessToken) storage.setItem("authToken", accessToken);
  if (refreshToken) storage.setItem("refreshToken", refreshToken);
  if (user) {
    // Store basic user info in storage
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      mfi: user.mfi
    };
    storage.setItem("user", JSON.stringify(userData));
  }
};

// Clear authentication data (on logout)
export const clearAuthData = () => {
  // Clear from both storages to be safe
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

// Get the current user from storage
export const getCurrentUser = () => {
  const userString =
    sessionStorage.getItem("user") || localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};

// Decode JWT token to get user info
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role
    };
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};