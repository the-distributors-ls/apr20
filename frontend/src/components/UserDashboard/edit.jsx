import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import StatsGrid from "../StatsGrid/StatsGrid";
import LoanTable from "../LoanTable/LoanTable";
import LoanApplicationForm from "../LoanApplicationForm/LoanApplicationForm";
import "./UserDashboard.css";
import apiClient from "../utils/apiClient";
import { isAuthenticated, getCurrentUser } from "../utils/authUtils";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [loanApplications, setLoanApplications] = useState([]);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanError, setLoanError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(6);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [mfis, setMfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinStatus, setJoinStatus] = useState({});
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedMfi, setSelectedMfi] = useState(null);
  const [borrowerData, setBorrowerData] = useState({
    national_id: "",
    full_name: "",
    date_of_birth: "",
    address: "",
    contact_number: "",
    email: "",
    employment_status: "employed",
    monthly_income: "",
  });

  // User data - in a real app, this would come from your API
  const userData = {
    name: "Thabo Molefi",
    mfi: "Lesotho Rural MFI",
    loans: [
      {
        id: "L-7890",
        amount: 5000,
        status: "Active",
        nextPayment: "2024-04-15",
        progress: 65,
      },
      {
        id: "L-7821",
        amount: 3000,
        status: "Completed",
        nextPayment: null,
        progress: 100,
      },
    ],
    mfiMemberships: [
      { name: "Lesotho Rural MFI", joined: "2022-01-15", active: true },
      { name: "Maseru Urban Credit", joined: "2023-06-01", active: false },
    ],
  };

  const interestRates = { 6: 12.5, 12: 14.0, 18: 15.5, 24: 17.0 };

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch loan applications
  useEffect(() => {
    const fetchLoanApplications = async () => {
      if (!isAuthenticated()) return;

      try {
        setLoanLoading(true);
        const data = await apiClient.get("loans/");
        setLoanApplications(data);
      } catch (err) {
        setLoanError(err.message);
        if (err.message === "Session expired. Please log in again.") {
          navigate("/login");
        }
      } finally {
        setLoanLoading(false);
      }
    };

    if (activeTab === "loans") {
      fetchLoanApplications();
    }
  }, [activeTab, statusFilter, navigate]);

  // Fetch MFIs
  useEffect(() => {
    const fetchMfis = async () => {
      if (!isAuthenticated()) return;

      try {
        setLoading(true);
        const data = await apiClient.get("mfi/");
        setMfis(data);
      } catch (err) {
        setError(err.message);
        if (err.message === "Session expired. Please log in again.") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "mfi") {
      fetchMfis();
    }
  }, [activeTab, navigate]);

  const filteredLoans =
    statusFilter === "all"
      ? loanApplications
      : loanApplications.filter((loan) => loan.status === statusFilter);

  const calculateMonthlyPayment = () => {
    const principal = loanAmount;
    const rate = interestRates[selectedTerm] / 100 / 12;
    return (principal * rate) / (1 - Math.pow(1 + rate, -selectedTerm));
  };

  const handleJoinClick = (mfi) => {
    setSelectedMfi(mfi);
    // Try to get the user info from stored data
    const currentUser = getCurrentUser();
    setBorrowerData({
      ...borrowerData,
      full_name: currentUser?.name || userData.name, // Prefer stored user data if available
    });
    setShowJoinForm(true);
  };

  const handleBorrowerInputChange = (e) => {
    const { name, value } = e.target;
    setBorrowerData({
      ...borrowerData,
      [name]: value,
    });
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "joining" }));

      await apiClient.post("borrowers/", {
        ...borrowerData,
        mfi: selectedMfi.id,
      });

      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "success" }));
      setShowJoinForm(false);

      // Update user's MFI memberships
      userData.mfiMemberships.push({
        name: selectedMfi.name,
        joined: new Date().toISOString().split("T")[0],
        active: true,
      });
    } catch (err) {
      setJoinStatus((prev) => ({ ...prev, [selectedMfi.id]: "error" }));
      console.error("Error joining MFI:", err);

      if (err.message === "Session expired. Please log in again.") {
        navigate("/login");
      }
    }
  };

  const renderMfiStatus = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const renderJoinButton = (mfi) => {
    const status = joinStatus[mfi.id];
    const isMember = userData.mfiMemberships.some((m) => m.name === mfi.name);

    if (isMember) {
      return (
        <button className="btn btn-disabled" disabled>
          Already a Member
        </button>
      );
    }

    switch (status) {
      case "joining":
        return (
          <button className="btn btn-secondary" disabled>
            Joining...
          </button>
        );
      case "success":
        return (
          <button className="btn btn-success" disabled>
            Joined Successfully
          </button>
        );
      case "error":
        return (
          <button
            className="btn btn-error"
            onClick={() => handleJoinClick(mfi)}
          >
            Retry Join
          </button>
        );
      default:
        return (
          <button
            className="btn btn-secondary"
            onClick={() => handleJoinClick(mfi)}
          >
            Join MFI
          </button>
        );
    }
  };

  return (
    <div
      className={`dashboard-container ${
        sidebarCollapsed ? "collapsed-sidebar" : ""
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        setActiveTab={setActiveTab}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <main className="dashboard-main">
        <Header
          userData={userData}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Overview Content</h2>
              <StatsGrid
                loans={userData.loans}
                mfiMemberships={userData.mfiMemberships}
              />
            </motion.div>
          )}
          {activeTab === "loans" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="loans-header">
                <h2>My Loan Applications</h2>
                <div className="status-filter">
                  <label>Filter by status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {loanLoading ? (
                <div className="loading-spinner">Loading loans...</div>
              ) : loanError ? (
                <div className="error-message">{loanError}</div>
              ) : (
                <div className="loan-applications-grid">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className={`loan-card status-${loan.status.toLowerCase()}`}
                      >
                        <div className="loan-card-header">
                          <h3>Loan #{loan.id}</h3>
                          <span
                            className={`status-badge ${loan.status.toLowerCase()}`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div className="loan-card-body">
                          <p>
                            <strong>Amount:</strong> {loan.amount}
                          </p>
                          <p>
                            <strong>MFI:</strong> {loan.mfi.name}
                          </p>
                          <p>
                            <strong>Term:</strong> {loan.term_months} months
                          </p>
                          <p>
                            <strong>Applied:</strong>{" "}
                            {new Date(
                              loan.application_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-loans">No loan applications found</div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === "apply" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LoanApplicationForm
                userData={userData}
                loanAmount={loanAmount}
                setLoanAmount={setLoanAmount}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                calculateMonthlyPayment={calculateMonthlyPayment}
                interestRates={interestRates}
              />
            </motion.div>
          )}
          {activeTab === "mfi" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mfi-management">
                <h2>Available Microfinance Institutions</h2>
                {loading ? (
                  <div className="loading-spinner">Loading MFIs...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <>
                    <div className="mfi-grid">
                      {mfis.map((mfi) => (
                        <div key={mfi.id} className="mfi-card">
                          <div className="mfi-card-header">
                            <h3>{mfi.name}</h3>
                            {renderMfiStatus(mfi.is_active)}
                          </div>
                          <div className="mfi-card-body">
                            <div className="mfi-detail">
                              <span className="detail-label">Location:</span>
                              <span>{mfi.location}</span>
                            </div>
                            <div className="mfi-detail">
                              <span className="detail-label">Contact:</span>
                              <a href={`mailto:${mfi.contact_info}`}>
                                {mfi.contact_info}
                              </a>
                            </div>
                          </div>
                          <div className="mfi-card-footer">
                            <button className="btn btn-primary">
                              View Details
                            </button>
                            {renderJoinButton(mfi)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {showJoinForm && selectedMfi && (
                      <div className="join-form-overlay">
                        <div className="join-form-container">
                          <h3>Join {selectedMfi.name}</h3>
                          <p>Please enter your information to join this MFI</p>
                          <form onSubmit={handleJoinSubmit}>
                            <div className="form-group">
                              <label>National ID</label>
                              <input
                                type="text"
                                name="national_id"
                                value={borrowerData.national_id}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                name="full_name"
                                value={borrowerData.full_name}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Date of Birth</label>
                              <input
                                type="date"
                                name="date_of_birth"
                                value={borrowerData.date_of_birth}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Address</label>
                              <input
                                type="text"
                                name="address"
                                value={borrowerData.address}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Contact Number</label>
                              <input
                                type="tel"
                                name="contact_number"
                                value={borrowerData.contact_number}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                name="email"
                                value={borrowerData.email}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Employment Status</label>
                              <select
                                name="employment_status"
                                value={borrowerData.employment_status}
                                onChange={handleBorrowerInputChange}
                                required
                              >
                                <option value="employed">Employed</option>
                                <option value="self_employed">
                                  Self Employed
                                </option>
                                <option value="unemployed">Unemployed</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Monthly Income</label>
                              <input
                                type="number"
                                name="monthly_income"
                                value={borrowerData.monthly_income}
                                onChange={handleBorrowerInputChange}
                                required
                              />
                            </div>
                            <div className="form-actions">
                              <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => setShowJoinForm(false)}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-submit">
                                Submit Application
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
