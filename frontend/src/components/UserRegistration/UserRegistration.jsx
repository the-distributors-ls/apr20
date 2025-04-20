import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./UserRegistration.css";
import NavBar from "../NavBar/NavBar";

const UserRegistration = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "",
    secret_code: "", // New field for secret code
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.password2) {
      setMessageType("error");
      setMessage("Passwords do not match!");
      return;
    }

    // Validate secret code for MFI employees
    if (formData.role === "MFI_EMPLOYEE" && !formData.secret_code) {
      setMessageType("error");
      setMessage("Secret code is required for MFI employees!");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        ...(formData.role === "MFI_EMPLOYEE" && {
          mfi: formData.secret_code,
        }),
      };

      console.log("Sending registration data:", payload);

      const response = await axios.post(
        "http://localhost:8000/api/users/register/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration response:", response);

      setMessageType("success");
      setMessage("Registration successful!");
      setIsAuthenticated(true);

      // Clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        role: "",
        secret_code: "",
      });

      navigate("/userdashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setMessageType("error");
      setMessage(
        "Registration failed: " +
          (error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="registration-container">
        <motion.div
          className="registration-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="registration-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create Your Account
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

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                />
              </motion.div>
            </div>

            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="BORROWER">Borrower</option>
                  <option value="MFI_EMPLOYEE">MFI Employee</option>
                </select>
              </motion.div>
            </div>

            {/* Conditional rendering of secret code field */}
            {formData.role === "MFI_EMPLOYEE" && (
              <motion.div
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="input-container"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label>Secret Code</label>
                  <input
                    type="password"
                    name="secret_code"
                    value={formData.secret_code}
                    onChange={handleChange}
                    required
                    placeholder="Enter your secret code"
                  />
                </motion.div>
              </motion.div>
            )}

            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email address"
                />
              </motion.div>
            </div>

            <div className="form-group">
              <motion.div
                className="input-container"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
              </motion.div>
            </div>

            <div className="form-row">
              <motion.div
                className="input-container half"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                />
              </motion.div>

              <motion.div
                className="input-container half"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                />
              </motion.div>
            </div>

            <motion.button
              type="submit"
              className="register-button"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {isLoading ? <div className="spinner"></div> : "Create Account"}
            </motion.button>

            <motion.p
              className="login-link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              Already have an account? <a href="/login">Sign in</a>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default UserRegistration;
