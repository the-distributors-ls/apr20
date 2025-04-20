import React, { useState } from "react";
import { motion } from "framer-motion";
import "../../components/UserDashboard/UserDashboard.css";

const UserProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email || "thabo.molefi@example.com",
    phone: userData.phone || "+266 5712 3456",
    address: userData.address || "123 Main Street, Maseru",
    nationalId: userData.nationalId || "LSO-123456789",
    dateOfBirth: userData.dateOfBirth || "1985-05-15",
    employmentStatus: userData.employmentStatus || "Employed",
    monthlyIncome: userData.monthlyIncome || "8500",
    profilePicture: userData.profilePicture || "/api/placeholder/100/100",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would send the updated profile data to your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      // You could add a success message here
    } catch (error) {
      console.error("Error updating profile:", error);
      // You could add error handling here
    }
  };

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture">
            <img src={profileData.profilePicture} alt="Profile" />
          </div>
          <div className="profile-title">
            <h3>{profileData.name}</h3>
            <p>
              Member since {userData.mfiMemberships[0]?.joined || "2022-01-15"}
            </p>
          </div>
          {!isEditing && (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>National ID</label>
                <input
                  type="text"
                  name="nationalId"
                  value={profileData.nationalId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Employment Status</label>
                <select
                  name="employmentStatus"
                  value={profileData.employmentStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income (LSL)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={profileData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-submit">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-info-grid">
              <div className="info-item">
                <div className="info-label">Email</div>
                <div className="info-value">{profileData.email}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Phone</div>
                <div className="info-value">{profileData.phone}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Address</div>
                <div className="info-value">{profileData.address}</div>
              </div>
              <div className="info-item">
                <div className="info-label">National ID</div>
                <div className="info-value">{profileData.nationalId}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Date of Birth</div>
                <div className="info-value">{profileData.dateOfBirth}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Employment</div>
                <div className="info-value">{profileData.employmentStatus}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Monthly Income</div>
                <div className="info-value">
                  LSL {profileData.monthlyIncome}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
