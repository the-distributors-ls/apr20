// src/utils/authUtils.js

// Get the authentication token from storage (localStorage or sessionStorage)
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
  if (user) storage.setItem("user", JSON.stringify(user));
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

// Get the current user
export const getCurrentUser = () => {
  const userString =
    sessionStorage.getItem("user") || localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};
