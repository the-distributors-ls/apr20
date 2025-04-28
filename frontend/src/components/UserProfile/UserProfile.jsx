import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../components/UserDashboard/UserDashboard.css";
import apiClient from "../../utils/apiClient";
import { isAuthenticated } from "../../utils/authUtils";
import "./UserProfile.css";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated()) return;

      try {
        setLoading(true);
        const data = await apiClient.get("users/profile/");
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update profile data
      await apiClient.patch("users/profile/", profileData);
      setIsEditing(false);
      // Optionally: show success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally: show error message
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading profile: {error}</div>;
  }

  if (!profileData) {
    return <div className="error-message">No profile data found</div>;
  }

  // Format data based on user role
  const getProfileDetails = () => {
    if (profileData.role === "BORROWER" && profileData.borrower_profile) {
      const bp = profileData.borrower_profile;
      return {
        name: `${profileData.first_name} ${profileData.last_name}`,
        email: profileData.email,
        phone: bp.phone_number,
        address: bp.address,
        nationalId: bp.national_id,
        dateOfBirth: bp.date_of_birth,
        profilePicture: "/api/placeholder/100/100",
      };
    } else if (profileData.role === "MFI_EMPLOYEE" && profileData.mfi_employee_profile) {
      const emp = profileData.mfi_employee_profile;
      return {
        name: `${profileData.first_name} ${profileData.last_name}`,
        email: profileData.email,
        employeeId: emp.employee_id,
        department: emp.department,
        profilePicture: "/api/placeholder/100/100",
      };
    }
    return {
      name: `${profileData.first_name} ${profileData.last_name}`,
      email: profileData.email,
      profilePicture: "/api/placeholder/100/100",
    };
  };

  const formattedData = getProfileDetails();

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture">
            <img src={formattedData.profilePicture} alt="Profile" />
          </div>
          <div className="profile-title">
            <h3>{formattedData.name}</h3>
            <p>Role: {profileData.role.replace('_', ' ')}</p>
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
            {profileData.role === "BORROWER" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={profileData.borrower_profile?.phone_number || ''}
                      onChange={(e) => {
                        setProfileData({
                          ...profileData,
                          borrower_profile: {
                            ...profileData.borrower_profile,
                            phone_number: e.target.value
                          }
                        });
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>National ID</label>
                    <input
                      type="text"
                      name="national_id"
                      value={profileData.borrower_profile?.national_id || ''}
                      onChange={(e) => {
                        setProfileData({
                          ...profileData,
                          borrower_profile: {
                            ...profileData.borrower_profile,
                            national_id: e.target.value
                          }
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={profileData.borrower_profile?.date_of_birth || ''}
                      onChange={(e) => {
                        setProfileData({
                          ...profileData,
                          borrower_profile: {
                            ...profileData.borrower_profile,
                            date_of_birth: e.target.value
                          }
                        });
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.borrower_profile?.address || ''}
                    onChange={(e) => {
                      setProfileData({
                        ...profileData,
                        borrower_profile: {
                          ...profileData.borrower_profile,
                          address: e.target.value
                        }
                      });
                    }}
                    required
                  />
                </div>
              </>
            )}

            {profileData.role === "MFI_EMPLOYEE" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input
                      type="text"
                      name="employee_id"
                      value={profileData.mfi_employee_profile?.employee_id || ''}
                      onChange={(e) => {
                        setProfileData({
                          ...profileData,
                          mfi_employee_profile: {
                            ...profileData.mfi_employee_profile,
                            employee_id: e.target.value
                          }
                        });
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.mfi_employee_profile?.department || ''}
                    onChange={(e) => {
                      setProfileData({
                        ...profileData,
                        mfi_employee_profile: {
                          ...profileData.mfi_employee_profile,
                          department: e.target.value
                        }
                      });
                    }}
                    required
                  />
                </div>
              </>
            )}

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
                <div className="info-value">{formattedData.email}</div>
              </div>

              {profileData.role === "BORROWER" && (
                <>
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{formattedData.phone}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Address</div>
                    <div className="info-value">{formattedData.address}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">National ID</div>
                    <div className="info-value">{formattedData.nationalId}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Date of Birth</div>
                    <div className="info-value">{formattedData.dateOfBirth}</div>
                  </div>
                </>
              )}

              {profileData.role === "MFI_EMPLOYEE" && (
                <>
                  <div className="info-item">
                    <div className="info-label">Employee ID</div>
                    <div className="info-value">{formattedData.employeeId}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Department</div>
                    <div className="info-value">{formattedData.department}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
