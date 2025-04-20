import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import NavBar from "../NavBar/NavBar";

// OAuth provider icons (you'll need to add these to your project)
import GoogleIcon from "/src/assets/google-icon.svg";
import FacebookIcon from "/src/assets/facebook-icon.svg";
import MicrosoftIcon from "/src/assets/microsoft-icon.svg";

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

  // Check for existing token on component mount
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      // Validate token with your backend
      validateToken(token);
    }
  });

  const validateToken = async (token) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/validate-token/",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.valid) {
        navigate("/dashboard"); // Redirect to dashboard if token is valid
      }
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /*const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/authentication/login/",
        formData
      );
      const { token, user } = response.data;

      // Store token based on "Remember me" choice
      if (rememberMe) {
        localStorage.setItem("authToken", token);
      } else {
        sessionStorage.setItem("authToken", token);
      }

      // Store user info
      sessionStorage.setItem("user", JSON.stringify(user));

      setMessageType("success");
      setMessage("Login successful!");

      if (user.is_staff) {
        navigate("/dashboard2");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };*/

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/authentication/login/",
        formData
      );

      // Extract token (access token)
      const token = response.data.access;

      // Store token based on "Remember me" choice
      if (rememberMe) {
        localStorage.setItem("authToken", token);
      } else {
        sessionStorage.setItem("authToken", token);
      }

      setMessageType("success");
      setMessage("Login successful!");

      // After login, make a separate call to fetch user data
      fetchUserData(token);
    } catch (error) {
      setMessageType("error");
      setMessage(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to fetch user data after login
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/authentication/user/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = response.data;
      sessionStorage.setItem("user", JSON.stringify(user));

      // Redirect based on user role
      if (user.role == "MFI") {
        navigate("/dashboard");
      } else {
        navigate("/userdashboard");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Default redirect if user data fetch fails
      navigate("/dashboard");
    }
  };

  const handleOAuthLogin = (provider) => {
    setIsLoading(true);

    // Define OAuth endpoints
    const oauthEndpoints = {
      google: "http://localhost:8000/api/auth/oauth/google",
      facebook: "http://localhost:8000/api/auth/oauth/facebook",
      microsoft: "http://localhost:8000/api/auth/oauth/microsoft",
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
          // Store token
          if (rememberMe) {
            localStorage.setItem("authToken", event.data.token);
          } else {
            sessionStorage.setItem("authToken", event.data.token);
          }

          // Store user info
          sessionStorage.setItem("user", JSON.stringify(event.data.user));

          setMessageType("success");
          setMessage(`Successfully logged in with ${provider}!`);

          // Redirect to dashboard
          setTimeout(() => navigate("/dashboard"), 1000);
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
              <a href="#" className="forgot-password">
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
