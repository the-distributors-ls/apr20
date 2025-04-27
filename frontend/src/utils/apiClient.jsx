// src/utils/apiClient.js
import {
  getAuthToken,
  getRefreshToken,
  storeAuthData,
  clearAuthData,
  decodeToken
} from "./authUtils";

const API_BASE_URL = "http://localhost:8000/api";

// Helper function to handle token refresh
const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    // Store the new access token and decode user info
    const user = decodeToken(data.access);
    storeAuthData(data.access, null, user, false);

    return data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAuthData();
    throw error;
  }
};

// Main API client with automatic token management
const apiClient = {
  request: async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`; // Remove leading slashes

    // Set up headers with authentication token
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Only include credentials for auth endpoints
    const requestOptions = {
      ...options,
      headers,
    };

    // Make the request
    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !url.includes('auth/token')) {
        try {
          // Try to refresh the token
          const newToken = await refreshAuthToken();

          // Retry the request with new token
          headers.Authorization = `Bearer ${newToken}`;

          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`API error: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, clear auth and throw error
          clearAuthData();
          throw new Error("Session expired. Please log in again.");
        }
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.detail || `API error: ${response.status}`,
          data: errorData
        };
      }

      // Return the data
      if (response.status !== 204) {
        // No content
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // Convenience methods
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return apiClient.request(url, { method: "GET" });
  },

  post: (endpoint, data) =>
    apiClient.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiClient.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    apiClient.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint) => apiClient.request(endpoint, { method: "DELETE" }),
};

export default apiClient;