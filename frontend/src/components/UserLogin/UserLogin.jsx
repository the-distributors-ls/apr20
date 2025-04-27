import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import NavBar from "../NavBar/NavBar";
import {
  storeAuthData,
  clearAuthData,
  isAuthenticated,
} from "../../utils/authUtils";

// OAuth provider icons
import GoogleIcon from "/src/assets/google-icon.svg";
import FacebookIcon from "/src/assets/facebook-icon.svg";
import MicrosoftIcon from "/src/assets/microsoft-icon.svg";

// Base API URL
const API_BASE_URL = "http://localhost:8000/api";

const UserLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/userdashboard");
    }
  }, [navigate]);

  const redirectBasedOnUserRole = (user) => {
    switch (user.role) {
      case "BORROWER":
        navigate("/userdashboard");
        break;
      case "MFI_EMPLOYEE":
        navigate("/dashboard");
        break;
      case "ADMIN":
        navigate("/admin-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing tokens first
      clearAuthData();

      // Get JWT token
      const response = await axios.post(
        `${API_BASE_URL}/auth/token/`,
        formData
      );

      const { access: token, refresh } = response.data;

      // Get user data with the token
      const userResponse = await axios.get(
        `${API_BASE_URL}/users/validate-token/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = userResponse.data.user;

      // Store auth data using our utility function
      storeAuthData(token, refresh, user, rememberMe);

      setMessageType("success");
      setMessage("Login successful! Redirecting...");

      // Redirect based on role
      redirectBasedOnUserRole(user);
    } catch (error) {
      console.error("Login error:", error);
      setMessageType("error");
      setMessage(
        "Login failed: " +
          (error.response?.data?.detail ||
            error.message ||
            "Invalid credentials")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    setIsLoading(true);

    // Define OAuth endpoints
    const oauthEndpoints = {
      google: `${API_BASE_URL}/auth/oauth/google`,
      facebook: `${API_BASE_URL}/auth/oauth/facebook`,
      microsoft: `${API_BASE_URL}/auth/oauth/microsoft`,
    };

    // Open OAuth popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthEndpoints[provider],
      `${provider}Auth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Handle message from popup
    window.addEventListener(
      "message",
      function (event) {
        if (event.origin !== window.location.origin) return;

        if (event.data.token) {
          // Store auth data using our utility function
          storeAuthData(
            event.data.token,
            event.data.refreshToken,
            event.data.user,
            rememberMe
          );

          if (event.data.user) {
            redirectBasedOnUserRole(event.data.user);
          }

          setMessageType("success");
          setMessage(`Successfully logged in with ${provider}!`);
        } else if (event.data.error) {
          setMessageType("error");
          setMessage(`${provider} login failed: ${event.data.error}`);
        }

        setIsLoading(false);
        popup.close();
      },
      false
    );
  };

  return (
    <>
      <NavBar />
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="login-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome Back
          </motion.h2>

          {message && (
            <motion.div
              className={`alert ${messageType}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
          )}

          <div className="oauth-container">
            <motion.button
              className="oauth-button google"
              onClick={() => handleOAuthLogin("google")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              disabled={isLoading}
            >
              <img src={GoogleIcon} alt="Google" />
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              className="oauth-button facebook"
              onClick={() => handleOAuthLogin("facebook")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              disabled={isLoading}
            >
              <img src={FacebookIcon} alt="Facebook" />
              <span>Continue with Facebook</span>
            </motion.button>

            <motion.button
              className="oauth-button microsoft"
              onClick={() => handleOAuthLogin("microsoft")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              disabled={isLoading}
            >
              <img src={MicrosoftIcon} alt="Microsoft" />
              <span>Continue with Microsoft</span>
            </motion.button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label>Username or Email</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username or email"
                />
              </motion.div>
            </div>

            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </motion.div>
            </div>

            <motion.div
              className="form-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </motion.div>

            <motion.button
              type="submit"
              className="login-button"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {isLoading ? <div className="spinner"></div> : "Sign In"}
            </motion.button>

            <motion.p
              className="register-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Don't have an account? <a href="/register">Create Account</a>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default UserLogin;
